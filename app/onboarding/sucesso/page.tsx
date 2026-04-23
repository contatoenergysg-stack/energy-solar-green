"use client";

import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { calculateSavings, formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { OnboardingBar } from "@/components/onboarding/OnboardingBar";
import { useEffect } from "react";

export default function Page() {
  const { data, reset } = useOnboarding();
  const savings = calculateSavings(data.monthlyBill);

  // Reset store on unmount? No — keep for dashboard access later.
  useEffect(() => {
    // Placeholder: persist to Supabase when configured.
    // getSupabase()?.from("onboarding_completions").insert({ ... });
  }, []);

  return (
    <div className="flex flex-col flex-1">
    <OnboardingBar />
    <div className="mx-auto max-w-2xl px-6 py-16 lg:py-24 text-center w-full">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="inline-grid place-items-center w-20 h-20 rounded-full bg-primary mb-8"
      >
        <Check size={36} className="text-secondary-900" strokeWidth={2.5} />
      </motion.div>

      <motion.h1
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-display text-display-md text-secondary-900"
      >
        Bem-vindo(a) à ESG!
      </motion.h1>

      <motion.p
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-4 font-body text-lg text-secondary-700 max-w-lg mx-auto leading-relaxed"
      >
        Sua adesão foi registrada com sucesso. Enviamos uma cópia do contrato
        assinado para{" "}
        <strong className="text-secondary-900">{data.email}</strong>.
      </motion.p>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 bg-primary/15 border border-primary/40 rounded-2xl p-6 lg:p-8"
      >
        <p className="font-label text-xs uppercase tracking-wider text-secondary-700">
          Sua economia estimada no primeiro ano
        </p>
        <p className="mt-2 font-display text-4xl lg:text-5xl font-semibold text-secondary-900 tabular-nums">
          {formatCurrency(savings.annual)}
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
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

      <p className="mt-12 font-label text-xs text-secondary-500 max-w-md mx-auto">
        Próximos passos: nossa equipe entrará em contato em até 48 horas úteis
        para confirmar sua adesão junto à distribuidora.
      </p>
    </div>
    </div>
  );
}
