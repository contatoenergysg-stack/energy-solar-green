"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { Input } from "@/components/ui/Input";
import { useOnboarding } from "@/lib/onboarding-store";
import { FormEvent } from "react";
import { Info } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const digits = data.document.replace(/\D/g, "");
  const isCpf = data.documentType === "cpf";
  const isValid = isCpf ? digits.length === 11 : digits.length === 14;

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
              onClick={() => update({ documentType: t, document: "" })}
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

        <p className="mt-4 font-label text-sm text-secondary-600 flex items-center gap-2">
          <Info size={14} />
          Dados do titular da conta
        </p>

        <OnboardingNav backHref="/onboarding/verificacao" nextDisabled={!isValid} />
      </form>
    </OnboardingShell>
  );
}
