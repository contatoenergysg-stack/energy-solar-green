"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Leaf } from "lucide-react";
import Link from "next/link";
import { OnboardingBar } from "@/components/onboarding/OnboardingBar";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1">
      <OnboardingBar />
      <div className="mx-auto max-w-xl px-6 py-12 lg:py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-label uppercase tracking-[0.22em] text-secondary-500 mb-4">
            <span className="w-3 h-px bg-primary" />
            Aceite digital
          </span>

          <h1 className="font-display text-display-sm text-secondary-900 leading-tight">
            Um último passo antes do contrato
          </h1>

          <p className="mt-5 font-body text-secondary-700 leading-relaxed">
            Ao confirmar, você concorda em receber a{" "}
            <strong className="text-secondary-900 font-medium">
              fatura da distribuidora e a fatura da ESG no formato digital
            </strong>
            , diretamente no e-mail informado no seu cadastro.
          </p>

          <div className="mt-8 space-y-3">
            <FeatureRow icon={<ShieldCheck size={16} />} label="Mais segurança e praticidade no gerenciamento das suas faturas" />
            <FeatureRow icon={<Leaf size={16} />} label="Menos papel, menos impacto ambiental" />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => router.push("/onboarding/termo")}>
              Confirmar e assinar contrato
            </Button>
            <Link href="/onboarding/confirmacao">
              <Button size="lg" variant="outline">
                Voltar
              </Button>
            </Link>
          </div>

          <p className="mt-6 font-label text-[11px] text-secondary-400">
            Você poderá alterar a preferência de recebimento a qualquer momento pelo seu painel.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-secondary-500">{icon}</span>
      <span className="font-body text-sm text-secondary-700 leading-snug">{label}</span>
    </div>
  );
}
