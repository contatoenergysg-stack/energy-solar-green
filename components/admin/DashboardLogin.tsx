"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { signInWithMagicLink } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function DashboardLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    // Após o magic link, o callback redireciona para /dashboard,
    // que detecta o e-mail admin e redireciona para /admin
    const result = await signInWithMagicLink(email.trim(), "/dashboard");

    setLoading(false);
    if (!result.ok) {
      const msg = result.error ?? "";
      const translated = msg.toLowerCase().includes("rate limit")
        ? "Muitas tentativas recentes. Aguarde alguns minutos e tente novamente."
        : msg || "Erro ao enviar link. Tente novamente.";
      setError(translated);
      return;
    }
    setSent(true);
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

        {sent ? (
          <div className="text-center">
            <div className="inline-grid place-items-center w-16 h-16 rounded-full bg-primary/20 mb-6">
              <CheckCircle2 size={28} className="text-secondary-900" />
            </div>
            <h1 className="font-display text-display-sm text-secondary-900">
              Verifique seu e-mail
            </h1>
            <p className="mt-4 font-body text-secondary-600 leading-relaxed">
              Enviamos um link de acesso para{" "}
              <strong className="text-secondary-900">{email}</strong>.<br />
              Clique no link para entrar.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="mt-6 font-label text-sm text-secondary-500 underline underline-offset-4 hover:text-secondary-900"
            >
              Usar outro e-mail
            </button>
          </div>
        ) : (
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

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    Enviar link de acesso
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
        )}
      </div>
    </div>
  );
}
