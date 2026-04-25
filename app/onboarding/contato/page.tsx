"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { Input } from "@/components/ui/Input";
import { useOnboarding } from "@/lib/onboarding-store";
import { sendEmailOtp } from "@/app/actions/onboarding";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    data.name.trim().length >= 2 &&
    /^\S+@\S+\.\S+$/.test(data.email) &&
    data.phone.replace(/\D/g, "").length >= 10 &&
    data.termsAccepted;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    const result = await sendEmailOtp(data.email);

    if (!result.ok) {
      setError(result.error ?? "Erro ao enviar código. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/onboarding/verificacao");
  };

  return (
    <OnboardingShell
      title="Dados de contato"
      description="Preencha seus dados para criar sua conta na ESG."
      accent="Criação de conta"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Input
            label="Nome para contato"
            placeholder="Nome"
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
            required
            autoComplete="name"
          />
          <p className="mt-1.5 font-label text-[11px] text-secondary-500">
            Dados usados para contato sobre sua assinatura.
          </p>
        </div>
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          required
          autoComplete="email"
        />
        <Input
          label="Celular (WhatsApp)"
          placeholder="(11) 99999-0000"
          value={data.phone}
          onChange={(e) => update({ phone: formatPhone(e.target.value) })}
          required
          autoComplete="tel"
          inputMode="tel"
        />

        <label className="flex items-start gap-3 mt-2">
          <input
            type="checkbox"
            checked={data.termsAccepted}
            onChange={(e) => update({ termsAccepted: e.target.checked })}
            className="mt-1 w-4 h-4 accent-[var(--color-primary)]"
          />
          <span className="font-label text-sm text-secondary-700 leading-snug">
            Li e aceito os{" "}
            <Link
              href="/termos"
              className="underline underline-offset-2 text-secondary-900 hover:text-primary-700"
            >
              termos de uso e política de privacidade
            </Link>
          </span>
        </label>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 font-label text-sm text-red-700">
            {error}
          </div>
        )}

        <OnboardingNav
          backHref="/onboarding/distribuidora"
          nextDisabled={!isValid || loading}
          nextLabel={loading ? "Enviando código..." : "Continuar"}
        />
      </form>
    </OnboardingShell>
  );
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
