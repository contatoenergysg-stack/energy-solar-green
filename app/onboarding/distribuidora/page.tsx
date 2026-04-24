"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { BRAZILIAN_DISTRIBUTORS, useOnboarding } from "@/lib/onboarding-store";
import Link from "next/link";
import { FormEvent } from "react";
import { Check } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (data.distributor) router.push("/onboarding/contato");
  };

  return (
    <OnboardingShell
      title="Qual é sua distribuidora?"
      description="Selecione a empresa responsável pelo fornecimento de energia elétrica no seu imóvel."
      accent="Distribuidora de energia"
    >
      <form onSubmit={onSubmit}>
        <div
          role="listbox"
          aria-label="Distribuidora de energia"
          className="overflow-y-auto rounded-xl border border-secondary-200 divide-y divide-secondary-100"
          style={{ maxHeight: "288px" }}
        >
          {BRAZILIAN_DISTRIBUTORS.map((d) => {
            const selected = data.distributor === d;
            return (
              <button
                key={d}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => update({ distributor: d })}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors btn-press ${
                  selected
                    ? "bg-secondary-900 text-tertiary"
                    : "bg-tertiary text-secondary-800 hover:bg-secondary-100"
                }`}
              >
                <span className="font-label text-sm">{d}</span>
                {selected && <Check size={15} className="shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>

        <Link
          href="/entrar"
          className="mt-5 block text-center font-label text-sm text-secondary-500 underline underline-offset-4 hover:text-secondary-900"
        >
          Já iniciei meu cadastro
        </Link>

        <OnboardingNav nextDisabled={!data.distributor} />
      </form>
    </OnboardingShell>
  );
}
