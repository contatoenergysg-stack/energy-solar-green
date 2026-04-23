"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Mail, Leaf, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { OnboardingBar } from "@/components/onboarding/OnboardingBar";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1">
    <OnboardingBar />
    <div className="mx-auto max-w-xl px-6 py-12 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="bg-tertiary border border-secondary-200 rounded-3xl p-8 lg:p-10 shadow-sm"
      >
        <span className="inline-grid place-items-center w-14 h-14 rounded-full bg-primary mb-6">
          <Mail size={24} className="text-secondary-900" />
        </span>

        <h1 className="font-display text-display-sm text-secondary-900">
          Um último passo antes do contrato
        </h1>

        <p className="mt-4 font-body text-secondary-700 leading-relaxed">
          Ao confirmar, você concorda em receber a{" "}
          <strong className="text-secondary-900">
            fatura da distribuidora e a fatura da ESG no formato digital
          </strong>
          , diretamente no e-mail informado no seu cadastro.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Feature
            icon={<ShieldCheck size={18} />}
            label="Mais segurança e praticidade"
          />
          <Feature
            icon={<Leaf size={18} />}
            label="Menos papel, menos impacto"
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => router.push("/onboarding/termo")}>
            Confirmar
          </Button>
          <Link href="/onboarding/confirmacao">
            <Button size="lg" variant="outline">
              Voltar
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
    </div>
  );
}

function Feature({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-tertiary-soft/70 border border-secondary-200/60">
      <span className="text-secondary-700">{icon}</span>
      <span className="font-label text-sm text-secondary-800 leading-snug">
        {label}
      </span>
    </div>
  );
}
