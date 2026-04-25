"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { sendEmailOtp } from "@/app/actions/onboarding";
import { verifyEmailOtp } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function DashboardLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    const result = await sendEmailOtp(email.trim());

    setLoading(false);
    if (!result.ok) {
      const msg = result.error ?? "";
      setError(
        msg.toLowerCase().includes("rate limit")
          ? "Muitas tentativas recentes. Aguarde alguns minutos e tente novamente."
          : msg || "Erro ao enviar código. Tente novamente."
      );
      return;
    }
    setStep("code");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 6) return;
    setLoading(true);
    setError(null);

    const result = await verifyEmailOtp(email.trim(), code.trim());

    setLoading(false);
    if (!result.ok) {
      setError("Código inválido ou expirado. Tente novamente.");
      return;
    }

    // Redireciona — o /dashboard server component detecta o admin e vai para /admin
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tertiary px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Image
              src="/logos/logo_dark.png"
              alt="Energy Solar Green"
              width={160}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {step === "email" ? (
          <>
            <h1 className="font-display text-display-sm text-secondary-900 text-center mb-2">
              Acesso
            </h1>
            <p className="font-body text-secondary-600 text-center mb-8">
              Entre com seu e-mail para acessar sua conta ESG.
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 font-label text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSendCode} className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
              <Button
                type="submit"
                size="lg"
                disabled={loading || !email.trim()}
                className="w-full"
              >
                {loading ? "Enviando..." : (
                  <>
                    <Mail size={16} />
                    Enviar código de acesso
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-8 text-center font-label text-sm text-secondary-500">
              Ainda não é cliente?{" "}
              <Link
                href="/onboarding/distribuidora"
                className="text-secondary-900 underline underline-offset-4 hover:text-primary-700"
              >
                Cadastre-se agora
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-display-sm text-secondary-900 text-center mb-2">
              Verifique seu e-mail
            </h1>
            <p className="font-body text-secondary-600 text-center mb-8">
              Enviamos um código para{" "}
              <strong className="text-secondary-900">{email}</strong>.
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 font-label text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <Input
                label="Código de verificação"
                placeholder="00000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                required
                inputMode="numeric"
                autoFocus
              />
              <Button
                type="submit"
                size="lg"
                disabled={loading || code.trim().length < 6}
                className="w-full"
              >
                {loading ? "Verificando..." : (
                  <>
                    Entrar
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            <button
              onClick={() => { setStep("email"); setCode(""); setError(null); }}
              className="mt-6 w-full text-center font-label text-sm text-secondary-500 underline underline-offset-4 hover:text-secondary-900"
            >
              Usar outro e-mail
            </button>
          </>
        )}
      </div>
    </div>
  );
}
