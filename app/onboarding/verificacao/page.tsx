"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { useOnboarding } from "@/lib/onboarding-store";
import { sendEmailOtp, verifyEmailOtp } from "@/app/actions/onboarding";
import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isValid = code.replace(/\D/g, "").length === 8;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    const result = await verifyEmailOtp(data.email, code.replace(/\D/g, ""));

    if (!result.ok) {
      setError("Código inválido ou expirado. Verifique e tente novamente.");
      setLoading(false);
      return;
    }

    update({ otpVerified: true });
    router.push("/onboarding/documento");
  };

  const resend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setCode("");
    try {
      const result = await sendEmailOtp(data.email);
      if (!result.ok) {
        setError(result.error || "Erro ao enviar código. Tente novamente em alguns minutos.");
        return;
      }
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((t) => {
          if (t <= 1) { clearInterval(timer); return 0; }
          return t - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Erro ao enviar. Verifique sua conexão e tente novamente.");
    }
  };

  return (
    <OnboardingShell
      title={"Verifique seu\ne-mail"}
      description="Insira o código que enviamos para confirmar seu endereço e criar sua conta."
      accent="Verificação"
    >
      <form onSubmit={onSubmit} className="space-y-5">

        {/* Email indicator */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-secondary-50 border border-secondary-100">
          <Mail size={14} className="text-secondary-400 shrink-0" />
          <span className="font-label text-sm text-secondary-700 truncate">
            {data.email || "seu@email.com"}
          </span>
        </div>

        {/* OTP input */}
        <div>
          <label className="font-label text-xs uppercase tracking-wider text-secondary-600 mb-1.5 block">
            Código de verificação
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="00000000"
            value={code}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
              setCode(digits);
              if (error) setError(null);
            }}
            autoFocus
            autoComplete="one-time-code"
            className="w-full h-14 rounded-xl bg-tertiary border border-secondary-200 px-5 font-display text-2xl tracking-[0.35em] text-secondary-900 placeholder:text-secondary-300 placeholder:tracking-[0.35em] focus:outline-none focus:border-secondary-700 focus:ring-2 focus:ring-secondary-900/10 text-center"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 font-label text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="font-label text-sm text-secondary-500 text-center">
          Não recebeu?{" "}
          {resendCooldown > 0 ? (
            <span className="tabular-nums text-secondary-400">
              Reenviar em {resendCooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={resend}
              className="text-secondary-900 underline underline-offset-2 hover:text-primary-700"
            >
              reenviar código
            </button>
          )}
        </p>

        <OnboardingNav
          backHref="/onboarding/contato"
          nextDisabled={!isValid || loading}
          nextLabel={loading ? "Verificando..." : "Continuar"}
        />
      </form>
    </OnboardingShell>
  );
}
