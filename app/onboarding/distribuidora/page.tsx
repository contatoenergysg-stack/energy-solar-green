"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import {
  BRAZILIAN_DISTRIBUTORS,
  useOnboarding,
} from "@/lib/onboarding-store";
import Link from "next/link";
import { FormEvent } from "react";

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (data.distributor) router.push("/onboarding/contato");
  };

  return (
    <OnboardingShell
      title="A economia começa agora!"
      description="A ESG é uma escolha limpa, inteligente e econômica para sua casa ou empresa."
      accent="Distribuidora de energia"
    >
      <form onSubmit={onSubmit}>
        <label
          htmlFor="distributor"
          className="font-label text-xs uppercase tracking-wider text-secondary-600"
        >
          Sua distribuidora de energia
        </label>
        <select
          id="distributor"
          required
          value={data.distributor ?? ""}
          onChange={(e) => update({ distributor: e.target.value })}
          className="mt-1.5 h-12 w-full rounded-xl bg-tertiary border border-secondary-200 px-4 font-label text-[0.95rem] text-secondary-900 focus:outline-none focus:border-secondary-700 focus:ring-2 focus:ring-secondary-900/10"
        >
          <option value="" disabled>
            Selecione sua distribuidora
          </option>
          {BRAZILIAN_DISTRIBUTORS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <Link
          href="/entrar"
          className="mt-6 block text-center font-label text-sm text-secondary-700 underline underline-offset-4 hover:text-secondary-900"
        >
          Já iniciei meu cadastro
        </Link>

        <OnboardingNav nextDisabled={!data.distributor} />
      </form>
    </OnboardingShell>
  );
}
