"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { Input } from "@/components/ui/Input";
import { useOnboarding } from "@/lib/onboarding-store";
import { FormEvent, useEffect, useState } from "react";
import { Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { isValidCPF, isValidCNPJ, lookupCNPJ } from "@/lib/validators/document";

type LookupState =
  | { phase: "idle" }
  | { phase: "checking" }
  | { phase: "ok"; razaoSocial?: string; situacao?: string }
  | { phase: "invalid"; message: string }
  | { phase: "error"; message: string };

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [lookup, setLookup] = useState<LookupState>({ phase: "idle" });

  const digits = data.document.replace(/\D/g, "");
  const isCpf = data.documentType === "cpf";
  const lengthOk = isCpf ? digits.length === 11 : digits.length === 14;
  const algorithmValid = isCpf ? isValidCPF(digits) : isValidCNPJ(digits);

  const isValid = isCpf
    ? algorithmValid
    : algorithmValid && lookup.phase === "ok";

  const formatDoc = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, isCpf ? 11 : 14);
    if (isCpf) {
      return d
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return d
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  // CPF: validar localmente. CNPJ: validar localmente + consultar BrasilAPI.
  useEffect(() => {
    if (!lengthOk) {
      setLookup({ phase: "idle" });
      return;
    }
    if (!algorithmValid) {
      setLookup({
        phase: "invalid",
        message: isCpf
          ? "CPF inválido. Verifique os dígitos."
          : "CNPJ inválido. Verifique os dígitos.",
      });
      return;
    }
    if (isCpf) {
      setLookup({ phase: "ok" });
      return;
    }

    const ctrl = new AbortController();
    setLookup({ phase: "checking" });
    lookupCNPJ(digits, ctrl.signal).then((result) => {
      if (ctrl.signal.aborted) return;
      if (result.ok) {
        setLookup({
          phase: "ok",
          razaoSocial: result.razaoSocial,
          situacao: result.situacao,
        });
        if (result.razaoSocial && !data.fullName) {
          update({ fullName: result.razaoSocial });
        }
      } else if (result.error === "abort") {
        // ignore
      } else {
        setLookup({
          phase: "error",
          message: result.error ?? "Não foi possível confirmar o CNPJ.",
        });
      }
    });
    return () => ctrl.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, isCpf, lengthOk, algorithmValid]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isValid) router.push("/onboarding/titular");
  };

  return (
    <OnboardingShell
      title="Documento de identificação"
      description="Informe o CPF ou CNPJ do titular da conta de luz."
      accent="Identificação"
    >
      <form onSubmit={onSubmit}>
        <div className="flex gap-2 mb-6">
          {(["cpf", "cnpj"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                update({ documentType: t, document: "" });
                setLookup({ phase: "idle" });
              }}
              className={`flex-1 h-11 rounded-full font-label text-sm btn-press transition-colors ${
                data.documentType === t
                  ? "bg-secondary-900 text-tertiary"
                  : "bg-tertiary border border-secondary-200 text-secondary-700 hover:border-secondary-400"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <Input
          label={isCpf ? "CPF" : "CNPJ"}
          placeholder={isCpf ? "000.000.000-00" : "00.000.000/0000-00"}
          value={data.document}
          onChange={(e) => update({ document: formatDoc(e.target.value) })}
          required
          inputMode="numeric"
        />

        <div className="mt-3 min-h-[1.5rem]">
          {lookup.phase === "checking" && (
            <p className="font-label text-xs text-secondary-500 flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              Consultando CNPJ na Receita Federal…
            </p>
          )}
          {lookup.phase === "ok" && (
            <p className="font-label text-xs text-secondary-700 flex items-center gap-2">
              <CheckCircle2 size={12} className="text-primary" />
              {lookup.razaoSocial ? `${lookup.razaoSocial}` : "Documento válido"}
              {lookup.situacao && lookup.situacao !== "Ativa" && (
                <span className="text-secondary-500"> · {lookup.situacao}</span>
              )}
            </p>
          )}
          {lookup.phase === "invalid" && (
            <p className="font-label text-xs text-red-600 flex items-center gap-2">
              <AlertCircle size={12} />
              {lookup.message}
            </p>
          )}
          {lookup.phase === "error" && (
            <p className="font-label text-xs text-red-600 flex items-center gap-2">
              <AlertCircle size={12} />
              {lookup.message}
            </p>
          )}
        </div>

        <p className="mt-4 font-label text-sm text-secondary-600 flex items-center gap-2">
          <Info size={14} />
          Dados do titular da conta
        </p>

        <OnboardingNav backHref="/onboarding/verificacao" nextDisabled={!isValid} />
      </form>
    </OnboardingShell>
  );
}
