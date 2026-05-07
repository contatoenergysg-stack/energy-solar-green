"use client";

import { useRouter } from "next/navigation";
import { OnboardingBar } from "@/components/onboarding/OnboardingBar";
import { useOnboarding } from "@/lib/onboarding-store";
import { submitOnboarding } from "@/app/actions/onboarding";
import { getDiscountPercent, formatCurrency, calculateSavings } from "@/lib/utils";
import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, AlertCircle, CheckCircle2, ShieldCheck, FileCheck, Scale, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Phase = "creating" | "briefing" | "signing" | "signed" | "error";

interface ZSSession {
  documentKey: string;
  signerKey: string;
  widgetUrl: string;
  externalId: string;
}

function friendlyError(raw: string, postSign = false): string {
  const r = raw.toLowerCase();
  if (r.includes("autenticad") || r.includes("não autenticado") || r.includes("unauthorized") || r.includes("401") || r.includes("403"))
    return postSign
      ? "Sua sessão expirou, mas seu contrato já está assinado. Entre em contato para confirmarmos seu cadastro."
      : "Sessão expirada. Recarregue a página e tente novamente.";
  if (r.includes("network") || r.includes("fetch") || r.includes("failed to fetch"))
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  if (r.includes("timeout"))
    return "O servidor demorou para responder. Tente novamente.";
  if (r.includes("409") || r.includes("duplicate"))
    return postSign ? "Cadastro já registrado. Entre em contato se precisar de ajuda." : "Contrato já gerado. Recarregue a página.";
  if (r.includes("assinatura") || r.includes("criar assinatura"))
    return "Erro ao salvar sua assinatura. Tente novamente — seu progresso foi preservado.";
  return postSign
    ? "Não conseguimos salvar seu cadastro. Seu contrato está assinado — tente novamente ou entre em contato."
    : "Não conseguimos preparar seu contrato. Tente novamente ou entre em contato com o suporte.";
}

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [phase, setPhase] = useState<Phase>("creating");
  const [session, setSession] = useState<ZSSession | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [showSignedLoader, setShowSignedLoader] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [submitFailed, setSubmitFailed] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stuckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const pct = getDiscountPercent(data.monthlyBill);
  const savings = calculateSavings(data.monthlyBill);

  // ── 1. Create document (re-runs on retry) ──────────────────
  useEffect(() => {
    let cancelled = false;
    setIsStuck(false);
    setSubmitFailed(false);
    stuckTimerRef.current = setTimeout(() => setIsStuck(true), 15000);

    async function create() {
      try {
        const res = await fetch("/api/zapsign/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error ?? "Erro desconhecido");
        if (cancelled) return;
        clearTimeout(stuckTimerRef.current!);
        setIsStuck(false);
        setSession(json as ZSSession);
        setPhase("briefing");
      } catch (err) {
        if (!cancelled) {
          clearTimeout(stuckTimerRef.current!);
          setErrorMsg(friendlyError(String(err instanceof Error ? err.message : err)));
          setPhase("error");
        }
      }
    }

    create();
    return () => {
      cancelled = true;
      clearTimeout(stuckTimerRef.current!);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  function handleRetry() {
    if (submitFailed) {
      // Contract already signed — only retry the Supabase submission
      setSubmitFailed(false);
      setErrorMsg(null);
      setShowSignedLoader(false);
      setPhase("signed");
      handleSigned();
      return;
    }
    // Error before signing — restart from scratch
    setPhase("creating");
    setErrorMsg(null);
    setSession(null);
    setIsStuck(false);
    setRetryCount((c) => c + 1);
  }

  // ── 2. Listen for postMessage from ClickSign iframe ─────────
  useEffect(() => {
    if (phase !== "signing" || !session) return;

    function onMessage(e: MessageEvent) {
      // ZapSign envia eventos como strings: 'zs-doc-loaded', 'zs-doc-signed'
      if (typeof e.data !== "string") return;
      if (e.data === "zs-doc-signed") {
        handleSigned();
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session]);

  // ── 3. Poll document status as fallback ─────────────────────
  useEffect(() => {
    if (phase !== "signing" || !session) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/zapsign/status/${session.documentKey}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (json.status === "signed") handleSigned();
      } catch {
        // ignore transient errors
      }
    }, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session]);

  // ── 4. Delay the processing loader in signed phase ──────────
  useEffect(() => {
    if (phase !== "signed") { setShowSignedLoader(false); return; }
    const t = setTimeout(() => setShowSignedLoader(true), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // ── 5. Handle signed ────────────────────────────────────────
  const handleSigned = useCallback(async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPhase("signed");
    update({ signed: true });

    const result = await submitOnboarding(data, {
      zapsignDocToken: session?.documentKey,
      zapsignExternalId: session?.externalId,
    });
    if (result.ok) {
      router.push("/onboarding/sucesso");
    } else {
      setSubmitFailed(true);
      setErrorMsg(friendlyError(result.error ?? "", true));
      setPhase("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-tertiary">
      <OnboardingBar />

      <AnimatePresence mode="wait">

        {/* ── Creating ──────────────────────────────────────── */}
        {phase === "creating" && (
          <motion.div
            key="creating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 items-center justify-center px-6 py-20"
          >
            <div className="flex flex-col items-center gap-6 text-center max-w-xs">
              {!isStuck && (
                <Loader2 size={28} className="animate-spin text-secondary-400" />
              )}
              <div>
                {isStuck ? (
                  <>
                    <p className="font-display text-xl font-semibold text-secondary-900 mb-2">
                      Demorando mais que o esperado…
                    </p>
                    <p className="font-body text-secondary-500 text-sm leading-relaxed">
                      Nosso servidor está ocupado. Aguarde mais alguns instantes ou tente novamente.
                    </p>
                    <div className="mt-6 flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="font-label text-sm bg-secondary-900 text-tertiary px-6 h-10 rounded-full btn-press hover:bg-secondary-700 transition-colors"
                      >
                        Tentar novamente
                      </button>
                      <a
                        href="https://wa.me/5511999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-label text-xs text-secondary-500 hover:text-secondary-900 transition-colors underline underline-offset-2"
                      >
                        Falar com suporte via WhatsApp
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-display text-xl font-semibold text-secondary-900 mb-2">
                      Preparando seu contrato
                    </p>
                    <p className="font-body text-secondary-500 text-sm leading-relaxed">
                      Preenchendo o termo com seus dados cadastrais.
                      <br />Isso leva alguns segundos.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Briefing ──────────────────────────────────────── */}
        {phase === "briefing" && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-1 items-center justify-center px-6 py-16"
          >
            <div className="max-w-md w-full">
              <span className="inline-flex items-center gap-2 text-[11px] font-label uppercase tracking-[0.22em] text-secondary-500 mb-4">
                <span className="w-4 h-px bg-secondary-400" />
                Pronto para assinar
              </span>
              <h2 className="font-display text-2xl font-bold text-secondary-900 mb-2">
                O que vai acontecer agora
              </h2>
              <p className="font-body text-secondary-500 text-sm leading-relaxed mb-8">
                Seu contrato foi gerado com os dados do cadastro. Antes de assinar, veja o que esperar:
              </p>

              <ol className="space-y-4 mb-10">
                {[
                  "Role o documento e leia o contrato completo",
                  'Clique em "Assinar" e confirme com CPF ou código SMS',
                  "Você receberá uma cópia assinada no e-mail cadastrado",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-secondary-100 flex items-center justify-center font-display text-sm font-semibold text-secondary-900">
                      {i + 1}
                    </span>
                    <span className="font-body text-secondary-700 text-sm leading-snug pt-1">{text}</span>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <button
                  type="button"
                  onClick={() => setPhase("signing")}
                  className="font-label text-sm bg-secondary-900 text-tertiary px-7 h-11 rounded-full btn-press hover:bg-secondary-700 transition-colors"
                >
                  Entendido — quero assinar
                </button>
                <Link
                  href="/onboarding/confirmacao"
                  className="font-label text-sm text-secondary-500 hover:text-secondary-900 transition-colors underline underline-offset-2 sm:h-11 sm:flex sm:items-center"
                >
                  Voltar e revisar dados
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Signing — ClickSign iframe ─────────────────────── */}
        {phase === "signing" && session && (
          <motion.div
            key="signing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col flex-1 pb-14"
          >
            {/* Page header */}
            <div className="mx-auto max-w-[1100px] px-5 sm:px-8 pt-8 pb-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div>
                  <span className="inline-flex items-center gap-2 text-[11px] font-label uppercase tracking-[0.22em] text-secondary-500 mb-3">
                    <span className="w-4 h-px bg-secondary-400" />
                    Assinatura
                  </span>
                  <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold text-secondary-900 leading-[1.05] tracking-tight">
                    Termo de adesão
                  </h1>

                  {/* Mobile-only discount strip */}
                  <p className="sm:hidden mt-2 font-label text-sm text-secondary-600">
                    <span className="font-bold text-secondary-900">
                      {(pct * 100).toFixed(0)}% de desconto
                    </span>
                    {" · "}{formatCurrency(savings.annual)}/ano de economia
                  </p>

                  <p className="mt-3 font-body text-secondary-500 text-sm leading-relaxed max-w-[46ch]">
                    Leia com atenção e assine ao final. Seu documento já está
                    preenchido com os dados informados no cadastro.
                  </p>
                </div>

                {/* Summary pill — desktop */}
                <div className="shrink-0 hidden sm:flex flex-col gap-0 bg-secondary-900 text-tertiary rounded-2xl px-6 py-4 min-w-[190px]">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary/50 mb-1">
                    Seu desconto
                  </p>
                  <p className="font-display text-3xl font-bold text-primary tabular-nums leading-none">
                    {(pct * 100).toFixed(0)}%
                  </p>
                  <p className="font-body text-[11px] text-tertiary/60 mt-1.5">
                    {formatCurrency(savings.annual)}/ano de economia
                  </p>
                </div>
              </div>
            </div>

            {/* Trust bar */}
            <div className="w-full bg-secondary-900 py-3 px-5 sm:px-8">
              <div className="mx-auto max-w-[1100px] flex flex-wrap items-center gap-x-6 gap-y-2">
                <TrustItem icon={FileCheck} label="Preenchido com seus dados" />
                <span className="hidden sm:block w-px h-3 bg-tertiary/20" />
                <TrustItem icon={ShieldCheck} label="Canal seguro ZapSign" />
                <span className="hidden sm:block w-px h-3 bg-tertiary/20" />
                <TrustItem icon={Scale} label="Validade jurídica ICP-Brasil" />
              </div>
            </div>

            {/* ClickSign iframe */}
            <div className="flex-1 w-full" style={{ minHeight: "72vh" }}>
              <iframe
                ref={iframeRef}
                src={session.widgetUrl}
                title="Assinatura do Termo de Adesão — ESG"
                className="w-full h-full"
                style={{ minHeight: "72vh", border: "none", display: "block" }}
                allow="camera"
              />
            </div>
          </motion.div>
        )}

        {/* ── Signed (transitioning) ────────────────────────── */}
        {phase === "signed" && (
          <motion.div
            key="signed"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-1 items-center justify-center px-6 py-20"
          >
            <div className="flex flex-col items-center gap-5 text-center max-w-xs">
              <CheckCircle2 size={40} className="text-primary" strokeWidth={1.5} />
              <div>
                <p className="font-display text-xl font-bold text-secondary-900 mb-2">
                  Assinatura registrada!
                </p>
                <p className="font-body text-secondary-500 text-sm leading-relaxed">
                  Finalizando sua adesão à ESG…
                </p>
              </div>
              {showSignedLoader && (
                <Loader2 size={16} className="animate-spin text-secondary-400 mt-1" />
              )}
            </div>
          </motion.div>
        )}

        {/* ── Error ─────────────────────────────────────────── */}
        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 items-center justify-center px-6 py-20"
          >
            <div className="flex flex-col items-center gap-5 text-center max-w-sm">
              <AlertCircle size={32} className="text-secondary-900" />
              <div>
                <p className="font-display text-xl font-bold text-secondary-900 mb-2">
                  Algo deu errado
                </p>
                <p className="font-body text-secondary-500 text-sm leading-relaxed max-w-[36ch] mx-auto">
                  {errorMsg ?? "Não conseguimos preparar seu contrato. Tente novamente ou entre em contato com o suporte."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="font-label text-sm bg-secondary-900 text-tertiary px-7 h-11 rounded-full btn-press hover:bg-secondary-700 transition-colors"
                >
                  Tentar novamente
                </button>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-label text-sm text-secondary-500 hover:text-secondary-900 transition-colors underline underline-offset-2"
                >
                  Falar com suporte
                </a>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Sticky escape hatch — visible during signing only ─ */}
      <AnimatePresence>
        {phase === "signing" && (
          <motion.div
            key="escape"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-tertiary border-t border-secondary-200 px-5 py-3"
          >
            <div className="mx-auto max-w-[1100px] flex items-center justify-between gap-4">
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-label text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                <MessageCircle size={14} className="shrink-0" />
                Precisa de ajuda?
              </a>
              <Link
                href="/onboarding/confirmacao"
                className="font-label text-sm text-secondary-400 hover:text-secondary-700 transition-colors underline underline-offset-2"
              >
                Voltar e revisar dados
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrustItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={13} className="text-primary shrink-0" strokeWidth={2} />
      <span className="font-label text-[11px] text-tertiary/70 uppercase tracking-[0.15em]">{label}</span>
    </div>
  );
}
