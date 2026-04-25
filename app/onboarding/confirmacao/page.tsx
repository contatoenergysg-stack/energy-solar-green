"use client";

import { useRouter } from "next/navigation";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { useOnboarding } from "@/lib/onboarding-store";
import { calculateSavings, formatCurrency, getDiscountPercent } from "@/lib/utils";
import { FormEvent } from "react";
import { Pencil } from "lucide-react";
import { motion } from "framer-motion";
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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    update({ confirmed: true });
    router.push("/onboarding/aceite");
  };

  return (
    <div className="flex flex-col flex-1">
      <OnboardingBar />

      {/* ── Two-column: dark panel | editorial data ── */}
      <div className="flex flex-col lg:flex-row flex-1">

        {/* LEFT — sticky dark economy panel */}
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="lg:sticky lg:top-0 lg:self-start lg:h-screen bg-secondary-900
                     lg:w-[36%] xl:w-[32%] flex flex-col justify-between
                     px-8 py-8 lg:px-10 lg:py-12"
        >
          {/* Mobile: compact horizontal strip */}
          <div className="lg:hidden flex gap-6 items-end">
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-500">
                Desconto
              </p>
              <p className="font-display text-4xl font-bold text-primary tabular-nums leading-none mt-1">
                {(pct * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-500">
                Economia / ano
              </p>
              <p className="font-display text-2xl font-semibold text-tertiary tabular-nums mt-1">
                {formatCurrency(annualSavings)}
              </p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-500">
                Consumo médio
              </p>
              <p className="font-display text-2xl font-semibold text-tertiary tabular-nums mt-1">
                {displayKwh.toLocaleString("pt-BR")} kWh
              </p>
            </div>
          </div>

          {/* Desktop: full vertical layout */}
          <div className="hidden lg:flex flex-col flex-1 justify-between">
            <div>
              <span className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary-600 flex items-center gap-2">
                <span className="w-4 h-px bg-secondary-700" />
                Revisão
              </span>

              <div className="mt-14">
                <p className="font-label text-xs uppercase tracking-wider text-secondary-500">
                  Você economizará
                </p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                  className="font-display font-bold text-primary tabular-nums leading-[0.9] mt-3"
                  style={{ fontSize: "clamp(5rem, 9vw, 7.5rem)" }}
                >
                  {(pct * 100).toFixed(0)}%
                </motion.p>
                <p className="font-label text-xs text-secondary-500 mt-3">
                  de desconto na conta de luz
                </p>
              </div>

              <div className="mt-12 space-y-0">
                <div className="pt-7 border-t border-secondary-800">
                  <p className="font-label text-[10px] uppercase tracking-wider text-secondary-600">
                    Economia anual estimada
                  </p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
                    className="font-display text-[2rem] font-semibold text-tertiary tabular-nums mt-1.5 leading-none"
                  >
                    {formatCurrency(annualSavings)}
                  </motion.p>
                </div>

                <div className="pt-6 mt-6 border-t border-secondary-800">
                  <p className="font-label text-[10px] uppercase tracking-wider text-secondary-600">
                    Consumo médio mensal
                  </p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
                    className="font-display text-[2rem] font-semibold text-tertiary tabular-nums mt-1.5 leading-none"
                  >
                    {displayKwh.toLocaleString("pt-BR")} kWh
                  </motion.p>
                </div>
              </div>
            </div>

            <p className="font-label text-[10px] text-secondary-700 leading-relaxed max-w-[28ch]">
              *Economia calculada com base na média de consumo presente na fatura fornecida.
            </p>
          </div>
        </motion.aside>

        {/* RIGHT — editorial data */}
        <div className="flex-1 bg-tertiary">
          <form
            onSubmit={onSubmit}
            className="px-7 py-10 lg:px-12 lg:py-14 max-w-[620px]"
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="mb-10 lg:mb-12"
            >
              <h1 className="font-display text-[2.25rem] lg:text-5xl font-bold text-secondary-900 leading-[1.05]">
                Confirme<br className="hidden lg:block" /> seus dados
              </h1>
              <p className="mt-3 font-label text-sm text-secondary-500">
                Verifique antes de prosseguir para a assinatura do contrato.
              </p>
            </motion.div>

            {/* DADOS DO IMÓVEL */}
            <EditorialSection
              label="Dados do imóvel"
              onEdit={() => router.push("/onboarding/conta")}
              delay={0.08}
            >
              <div className="grid sm:grid-cols-3 gap-x-6 gap-y-5">
                <EditorialField label="Distribuidora" value={data.distributor ?? "—"} />
                <EditorialField label="Nº instalação" value={data.installationNumber} />
                <EditorialField label="Endereço" value={data.address} span />
              </div>
            </EditorialSection>

            {/* TITULAR */}
            <EditorialSection
              label="Titular da conta"
              onEdit={() => router.push("/onboarding/titular")}
              delay={0.16}
            >
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                <EditorialField label="Nome" value={data.fullName || data.name || "—"} />
                <EditorialField label="Nacionalidade" value={data.nationality} />
                <EditorialField label="CPF" value={data.document} />
                <EditorialField label="RG" value={data.rg} />
                <EditorialField label="Estado civil" value={data.civilStatus || "—"} />
              </div>
            </EditorialSection>

            {/* CONTATO */}
            <EditorialSection
              label="Contato"
              onEdit={() => router.push("/onboarding/contato")}
              delay={0.24}
              last
            >
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                <EditorialField label="Nome" value={data.name || data.fullName || "—"} />
                <EditorialField label="E-mail" value={data.email} />
                <EditorialField label="Celular (WhatsApp)" value={data.phone} />
              </div>
            </EditorialSection>

            <div className="mt-10">
              <OnboardingNav backHref="/onboarding/conta" />
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

function EditorialSection({
  label,
  onEdit,
  children,
  delay = 0,
  last = false,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
  delay?: number;
  last?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className={`py-8 ${!last ? "border-b border-secondary-200" : ""}`}
    >
      <div className="flex items-center justify-between mb-6">
        <p className="font-label text-[11px] uppercase tracking-[0.22em] text-secondary-400">
          {label}
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 font-label text-[11px] text-secondary-400
                     hover:text-secondary-900 transition-colors duration-200 group"
        >
          <Pencil
            size={11}
            className="group-hover:rotate-[-8deg] transition-transform duration-200"
          />
          Editar
        </button>
      </div>
      {children}
    </motion.div>
  );
}

function EditorialField({
  label,
  value,
  span = false,
}: {
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div className={span ? "sm:col-span-2" : undefined}>
      <p className="font-label text-[10px] uppercase tracking-wider text-secondary-400 mb-1">
        {label}
      </p>
      <p className="font-body text-[0.925rem] text-secondary-900 break-words leading-snug">
        {value || "—"}
      </p>
    </div>
  );
}
