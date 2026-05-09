"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { Input } from "@/components/ui/Input";
import { useOnboarding } from "@/lib/onboarding-store";
import { FormEvent } from "react";

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const isCnpj = data.documentType === "cnpj";

  const formatRg = (raw: string): string => {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`;
  };

  const isValid =
    data.fullName.trim().length >= 2 &&
    (isCnpj || data.rg.trim().length >= 4);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isValid) router.push("/onboarding/conta");
  };

  return (
    <OnboardingShell
      title={isCnpj ? "Dados da empresa titular" : "Dados do titular da conta"}
      description={
        isCnpj
          ? "Confirme os dados da empresa registrada na distribuidora de energia."
          : "Preencha os dados do titular registrado na distribuidora de energia."
      }
      accent="Identificação"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="h-14 rounded-xl bg-secondary-100/40 border border-secondary-200/60 px-4 flex flex-col justify-center">
          <span className="font-label text-[11px] uppercase tracking-wider text-secondary-500">
            {data.documentType.toUpperCase()}
          </span>
          <span className="font-label text-sm text-secondary-900 tabular-nums">
            {data.document || "—"}
          </span>
        </div>

        <div>
          <Input
            label={isCnpj ? "Razão social" : "Nome do titular"}
            placeholder={
              isCnpj
                ? "Razão social conforme Receita Federal"
                : "Nome conforme registrado na distribuidora"
            }
            value={data.fullName}
            onChange={(e) => update({ fullName: e.target.value })}
            required
          />
          <p className="mt-1.5 font-label text-[11px] text-secondary-500">
            {isCnpj
              ? "Razão social registrada na distribuidora — pode ser diferente do contato."
              : "Nome registrado na distribuidora — pode ser diferente do contato."}
          </p>
        </div>

        {!isCnpj && (
          <Input
            label="RG"
            placeholder="00.000.000-0"
            value={data.rg}
            onChange={(e) => update({ rg: formatRg(e.target.value) })}
            required
            inputMode="numeric"
          />
        )}

        <OnboardingNav backHref="/onboarding/documento" nextDisabled={!isValid} />
      </form>
    </OnboardingShell>
  );
}
