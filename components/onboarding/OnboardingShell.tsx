"use client";

import { motion } from "framer-motion";
import { Leaf, Zap, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { OnboardingProgress } from "./OnboardingProgress";

const TRUST_SIGNALS = [
  { icon: <Zap size={13} />, text: "15–20% de desconto na conta de luz" },
  { icon: <Leaf size={13} />, text: "Zero instalação — 100% digital" },
  { icon: <ShieldCheck size={13} />, text: "Dados protegidos • LGPD compliant" },
];

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  accent?: string;
}

export function OnboardingShell({ title, description, children, accent }: Props) {
  return (
    <div className="flex flex-1 min-h-screen">

      {/* ── LEFT DARK PANEL ── */}
      <div className="hidden lg:flex w-[360px] xl:w-[420px] shrink-0 flex-col relative overflow-hidden bg-secondary-900">

        {/* animated mesh blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 onboarding-mesh" />
        {/* dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,oklch(1_0_0/0.055)_1px,transparent_1px)] [background-size:22px_22px]"
        />

        {/* Logo — top of left panel */}
        <div className="relative z-10 p-8 xl:p-10">
          <Link href="/" aria-label="Home" className="inline-block btn-press">
            <Image
              src="/logos/logo_branca.png"
              alt="Energy Solar Green"
              width={44}
              height={44}
              className="w-10 h-10 xl:w-11 xl:h-11"
            />
          </Link>
        </div>

        {/* Copy — grows to fill middle */}
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 flex-1 flex flex-col justify-center px-8 xl:px-10 pb-8"
        >
          {accent && (
            <span className="inline-flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.25em] text-primary mb-5">
              <span className="w-5 h-px bg-primary/70" />
              {accent}
            </span>
          )}
          <h2
            className="font-display text-tertiary leading-[1.06] tracking-tight whitespace-pre-line"
            style={{ fontSize: "clamp(1.75rem, 2.4vw, 2.5rem)" }}
          >
            {title}
          </h2>
          {description && (
            <p
              className="mt-4 font-body text-tertiary/55 leading-relaxed max-w-[28ch]"
              style={{ fontSize: "clamp(0.875rem, 1vw, 0.95rem)" }}
            >
              {description}
            </p>
          )}

          {/* decorative orb */}
          <div
            aria-hidden
            className="mt-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
          />
        </motion.div>

        {/* Trust signals — pinned bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 px-8 xl:px-10 py-7 border-t border-white/[0.06]"
        >
          <ul className="space-y-3.5">
            {TRUST_SIGNALS.map((t, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 grid place-items-center text-primary">
                  {t.icon}
                </span>
                <span className="font-label text-[11px] text-tertiary/55 leading-snug">
                  {t.text}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── RIGHT CREAM PANEL ── */}
      <div className="flex-1 flex flex-col bg-tertiary min-h-0">

        {/* Top bar — progress + sair */}
        <div className="flex items-center gap-4 px-6 lg:px-10 py-4 border-b border-secondary-200/50">
          {/* mobile: show logo here */}
          <Link href="/" className="lg:hidden shrink-0 btn-press" aria-label="Home">
            <Image
              src="/logos/logo_dark.png"
              alt="Energy Solar Green"
              width={120}
              height={32}
              className="h-7 w-auto"
            />
          </Link>
          <div className="flex-1">
            <OnboardingProgress />
          </div>
          <Link
            href="/"
            className="shrink-0 font-label text-sm text-secondary-500 hover:text-secondary-900 transition-colors"
          >
            Sair
          </Link>
        </div>

        {/* Form area — centered */}
        <div className="flex-1 relative flex items-start lg:items-center justify-center px-5 sm:px-8 py-8 lg:py-10 overflow-y-auto">

          {/* ESG asterisk watermark — bottom right */}
          <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 opacity-[0.045]">
            <Image
              src="/logos/logo_preto.png"
              alt=""
              width={260}
              height={260}
              className="w-44 xl:w-56 h-auto"
            />
          </div>

          <div className="relative z-10 w-full max-w-[440px]">

            {/* Mobile: title above card */}
            <div className="lg:hidden mb-7">
              {accent && (
                <span className="inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-[0.25em] text-secondary-500 mb-3">
                  <span className="w-4 h-px bg-secondary-400" />
                  {accent}
                </span>
              )}
              <h1 className="font-display text-2xl sm:text-3xl text-secondary-900 leading-tight">
                {title}
              </h1>
              {description && (
                <p className="mt-3 font-body text-secondary-600 leading-relaxed text-sm">
                  {description}
                </p>
              )}
            </div>

            <motion.div
              key={`card-${title}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1], delay: 0.06 }}
              className="bg-white border border-secondary-200 rounded-2xl p-6 sm:p-8 shadow-[0_4px_28px_oklch(0.15_0.05_130/0.07),0_1px_4px_oklch(0.15_0.05_130/0.04)]"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
