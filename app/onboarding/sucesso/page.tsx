"use client";

import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { calculateSavings, formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OnboardingBar } from "@/components/onboarding/OnboardingBar";
import { useEffect } from "react";

export default function Page() {
  const { data, reset } = useOnboarding();
  const savings = calculateSavings(data.monthlyBill);

  useEffect(() => {
    // Placeholder: persist to Supabase when configured.
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <OnboardingBar />
      <div className="mx-auto max-w-2xl px-6 py-14 lg:py-20 w-full">

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-label uppercase tracking-[0.22em] text-secondary-500 mb-4">
            <span className="w-6 h-px bg-primary" />
            Contrato assinado
          </span>

          <h1 className="font-display text-display-md text-secondary-900 leading-tight max-w-lg">
            Bem-vindo(a) à ESG.
          </h1>

          <p className="mt-4 font-body text-secondary-600 leading-relaxed max-w-md">
            Sua adesão foi registrada. Enviamos uma cópia do contrato assinado para{" "}
            <strong className="text-secondary-900 font-medium">{data.email}</strong>.
          </p>
        </motion.div>

        {/* Savings — dark card, typography-led */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="mt-10 bg-secondary-900 rounded-2xl px-7 py-6"
        >
          <p className="font-label text-[11px] uppercase tracking-wider text-secondary-400">
            Economia estimada no 1º ano
          </p>
          <p className="mt-1.5 font-display text-5xl lg:text-6xl font-semibold text-primary tabular-nums">
            {formatCurrency(savings.annual)}
          </p>
          <p className="mt-2 font-label text-xs text-secondary-500">
            Baseado na sua média de consumo. Valores sujeitos à tarifa vigente.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link href="/dashboard">
            <Button size="lg">
              Ir para minha área
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="ghost" onClick={() => reset()}>
              Voltar ao início
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-10 font-label text-xs text-secondary-400 max-w-sm"
        >
          Nossa equipe entrará em contato em até 48 horas úteis para confirmar sua adesão junto à distribuidora.
        </motion.p>
      </div>
    </div>
  );
}
