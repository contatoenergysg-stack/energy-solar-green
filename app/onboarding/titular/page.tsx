"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { Input } from "@/components/ui/Input";
import { useOnboarding, CivilStatus } from "@/lib/onboarding-store";
import { FormEvent } from "react";

const CIVIL_OPTIONS: { value: CivilStatus; label: string }[] = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "uniao-estavel", label: "União estável" },
];

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const formatRg = (raw: string): string => {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`;
  };

  const isValid =
    (data.fullName || data.name).trim().length >= 2 &&
    data.nationality.trim().length > 0 &&
    data.rg.trim().length >= 4 &&
    data.civilStatus !== "";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isValid) router.push("/onboarding/conta");
  };

  return (
    <OnboardingShell
      title="Dados do titular da conta"
      description="Preencha os dados do titular registrado na distribuidora de energia."
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
            label="Nome do titular"
            placeholder="Nome conforme registrado na distribuidora"
            value={data.fullName || data.name}
            onChange={(e) => update({ fullName: e.target.value })}
            required
          />
          <p className="mt-1.5 font-label text-[11px] text-secondary-500">
            Nome registrado na distribuidora — pode ser diferente do contato.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="nationality"
            className="font-label text-xs uppercase tracking-wider text-secondary-600"
          >
            Nacionalidade
          </label>
          <select
            id="nationality"
            value={data.nationality}
            onChange={(e) => update({ nationality: e.target.value })}
            className="h-12 rounded-xl bg-tertiary border border-secondary-200 px-4 font-label text-[0.95rem] text-secondary-900 focus:outline-none focus:border-secondary-700 focus:ring-2 focus:ring-secondary-900/10"
          >
            <option value="Brasileiro(a)">Brasileiro(a)</option>
            <option value="Estrangeiro(a)">Estrangeiro(a)</option>
          </select>
        </div>

        <Input
          label="RG"
          placeholder="00.000.000-0"
          value={data.rg}
          onChange={(e) => update({ rg: formatRg(e.target.value) })}
          required
          inputMode="numeric"
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="civil"
            className="font-label text-xs uppercase tracking-wider text-secondary-600"
          >
            Estado civil
          </label>
          <select
            id="civil"
            value={data.civilStatus}
            onChange={(e) => update({ civilStatus: e.target.value as CivilStatus })}
            required
            className="h-12 rounded-xl bg-tertiary border border-secondary-200 px-4 font-label text-[0.95rem] text-secondary-900 focus:outline-none focus:border-secondary-700 focus:ring-2 focus:ring-secondary-900/10"
          >
            <option value="" disabled>
              Selecione
            </option>
            {CIVIL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Profissão (opcional)"
          placeholder="Sua profissão"
          value={data.profession}
          onChange={(e) => update({ profession: e.target.value })}
        />

        <OnboardingNav backHref="/onboarding/documento" nextDisabled={!isValid} />
      </form>
    </OnboardingShell>
  );
}
