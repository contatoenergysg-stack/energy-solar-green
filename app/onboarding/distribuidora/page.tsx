"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { useOnboarding } from "@/lib/onboarding-store";
import { FormEvent } from "react";
import { Check, Construction } from "lucide-react";

interface DistOption {
  name: string;
  available: boolean;
}

const DISTRIBUTORS: DistOption[] = [
  { name: "Light", available: true },
  { name: "Enel Rio", available: false },
  { name: "Enel SP", available: false },
];

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
      description="Atualmente atendemos apenas a região da Light. Novas distribuidoras serão adicionadas em breve."
      accent="Distribuidora de energia"
    >
      <form onSubmit={onSubmit}>
        <div
          role="listbox"
          aria-label="Distribuidora de energia"
          className="rounded-xl border border-secondary-200 divide-y divide-secondary-100 overflow-hidden"
        >
          {DISTRIBUTORS.map((d) => {
            const selected = data.distributor === d.name;

            if (!d.available) {
              return (
                <div
                  key={d.name}
                  role="option"
                  aria-selected={false}
                  aria-disabled={true}
                  className="w-full flex items-center justify-between px-4 py-3 bg-secondary-50 cursor-not-allowed"
                >
                  <span className="font-label text-sm text-secondary-400">
                    {d.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider text-secondary-500 bg-secondary-200/60 px-2.5 py-1 rounded-full">
                    <Construction size={11} className="shrink-0" />
                    Em construção
                  </span>
                </div>
              );
            }

            return (
              <button
                key={d.name}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => update({ distributor: d.name })}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors btn-press ${
                  selected
                    ? "bg-secondary-900 text-tertiary"
                    : "bg-tertiary text-secondary-800 hover:bg-secondary-100"
                }`}
              >
                <span className="font-label text-sm">{d.name}</span>
                {selected && <Check size={15} className="shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>

        <OnboardingNav nextDisabled={!data.distributor} />
      </form>
    </OnboardingShell>
  );
}
