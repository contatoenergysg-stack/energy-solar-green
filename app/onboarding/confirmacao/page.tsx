"use client";

import { useRouter } from "next/navigation";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { useOnboarding } from "@/lib/onboarding-store";
import { calculateSavings, formatCurrency, getDiscountPercent } from "@/lib/utils";
import { FormEvent, useEffect } from "react";
import { Pencil } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { OnboardingBar } from "@/components/onboarding/OnboardingBar";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const savings = calculateSavings(data.monthlyBill);
  const pct = getDiscountPercent(data.monthlyBill);

  const hasRealKwh = data.avgMonthlyKwh > 0 && data.kwhTariff > 0;
  const displayKwh = hasRealKwh ? data.avgMonthlyKwh : Math.round(data.monthlyBill / 0.77);
  const annualSavings = hasRealKwh
    ? Math.round(data.avgMonthlyKwh * data.kwhTariff * pct * 12)
    : savings.annual;

  // Count-up: motion values spring from 0 → real value
  const mvPct = useMotionValue(0);
  const mvAnnual = useMotionValue(0);
  const mvKwh = useMotionValue(0);
  const springPct = useSpring(mvPct, { stiffness: 55, damping: 16 });
  const springAnnual = useSpring(mvAnnual, { stiffness: 55, damping: 16 });
  const springKwh = useSpring(mvKwh, { stiffness: 55, damping: 16 });
  const fmtPct = useTransform(springPct, (v) => `${Math.round(v)}%`);
  const fmtAnnual = useTransform(springAnnual, (v) => formatCurrency(v));
  const fmtKwh = useTransform(springKwh, (v) => `${Math.round(v).toLocaleString("pt-BR")} kWh`);

  useEffect(() => {
    const t1 = setTimeout(() => mvPct.set(pct * 100), 220);
    const t2 = setTimeout(() => mvAnnual.set(annualSavings), 320);
    const t3 = setTimeout(() => mvKwh.set(displayKwh), 420);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [mvPct, mvAnnual, mvKwh, pct, annualSavings, displayKwh]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    update({ confirmed: true });
    router.push("/onboarding/aceite");
  };

  return (
    <div className="flex flex-col flex-1">
      <OnboardingBar />
      <div className="mx-auto max-w-[960px] px-5 sm:px-8 py-10 lg:py-12 w-full">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-label uppercase tracking-[0.22em] text-primary mb-3">
            <span className="w-3 h-px bg-primary" />
            Revisão
          </span>
          <h1 className="font-display text-display-md text-secondary-900">
            Confirme seus dados
          </h1>
          <p className="mt-3 font-body text-secondary-600 max-w-xl">
            Verifique os dados antes de prosseguir para assinatura do contrato.
          </p>
        </motion.div>

        <form onSubmit={onSubmit} className="space-y-3">

          {/* Economy strip — shimmer + count-up */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.06 }}
            className="relative rounded-2xl overflow-hidden border border-secondary-800 bg-secondary-900 px-6 py-5 grid sm:grid-cols-3 gap-4"
          >
            {/* one-shot shimmer sweep */}
            <motion.div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              initial={{ x: "-100%" }}
              animate={{ x: "220%" }}
              transition={{ duration: 0.85, ease: EASE, delay: 0.5 }}
              style={{
                background:
                  "linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.07) 50%, transparent 75%)",
              }}
            />

            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-primary/60">
                Você economizará
              </p>
              <motion.p className="font-display text-3xl font-semibold text-primary mt-1 tabular-nums">
                {fmtPct}
              </motion.p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-400">
                Economia anual estimada
              </p>
              <motion.p className="font-display text-3xl font-semibold text-tertiary mt-1 tabular-nums">
                {fmtAnnual}
              </motion.p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-400">
                Consumo médio mensal
              </p>
              <motion.p className="font-display text-3xl font-semibold text-tertiary mt-1 tabular-nums">
                {fmtKwh}
              </motion.p>
            </div>
          </motion.div>

          <p className="font-label text-[11px] text-secondary-400 px-1 pb-3">
            *A economia anual é calculada de acordo com a média de consumo de energia presente na fatura fornecida.
          </p>

          {/* Imóvel card */}
          <ReviewCard delay={0.14} primary>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-secondary-900 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
                Dados do imóvel
              </h3>
              <WigglePencil
                size={15}
                onClick={() => router.push("/onboarding/conta")}
                label="Editar dados do imóvel"
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-x-6 gap-y-4">
              <InfoRow label="Distribuidora" value={data.distributor ?? "—"} delay={0.20} />
              <InfoRow label="Nº Instalação" value={data.installationNumber} delay={0.24} />
              <InfoRow label="Endereço" value={data.address} delay={0.28} />
            </div>
          </ReviewCard>

          {/* Titular + Contato side by side */}
          <div className="grid sm:grid-cols-2 gap-3">
            <ReviewCard delay={0.22}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-semibold text-secondary-900 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
                  Titular da conta
                </h3>
                <WigglePencil
                  size={14}
                  onClick={() => router.push("/onboarding/titular")}
                  label="Editar titular"
                />
              </div>
              <div className="space-y-3">
                <InfoRow label="Nome" value={data.fullName || data.name || "—"} delay={0.28} />
                <InfoRow label={data.documentType === "cnpj" ? "CNPJ" : "CPF"} value={data.document} delay={0.34} />
                <InfoRow label="RG" value={data.rg} delay={0.37} />
              </div>
            </ReviewCard>

            <ReviewCard delay={0.28}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-semibold text-secondary-900 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
                  Contato
                </h3>
                <WigglePencil
                  size={14}
                  onClick={() => router.push("/onboarding/contato")}
                  label="Editar contato"
                />
              </div>
              <div className="space-y-3">
                <InfoRow label="Nome" value={data.name || data.fullName || "—"} delay={0.34} />
                <InfoRow label="E-mail" value={data.email} delay={0.37} />
                <InfoRow label="Celular (WhatsApp)" value={data.phone} delay={0.40} />
              </div>
            </ReviewCard>
          </div>

          <OnboardingNav backHref="/onboarding/conta" />
        </form>
      </div>
    </div>
  );
}

function ReviewCard({
  children,
  delay = 0,
  primary = false,
}: {
  children: React.ReactNode;
  delay?: number;
  primary?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className={`rounded-2xl border bg-tertiary px-5 py-5 sm:px-6 sm:py-6 ${
        primary ? "border-primary/30" : "border-secondary-200"
      }`}
    >
      {children}
    </motion.div>
  );
}

function WigglePencil({
  size,
  onClick,
  label,
}: {
  size: number;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="p-2 rounded-full text-secondary-400 hover:bg-primary/15 hover:text-secondary-900 transition-colors"
      whileHover={{
        rotate: [-4, 4, -4, 2, 0],
        transition: { duration: 0.4, ease: "easeInOut" },
      }}
    >
      <Pencil size={size} />
    </motion.button>
  );
}

function InfoRow({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <p className="font-label text-[10px] uppercase tracking-wider text-secondary-500">
        {label}
      </p>
      <p className="font-body text-sm text-secondary-900 mt-0.5 break-words">
        {value || "—"}
      </p>
    </motion.div>
  );
}
