"use client";

import { useRouter } from "next/navigation";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { useOnboarding } from "@/lib/onboarding-store";
import { calculateSavings, formatCurrency, getDiscountPercent } from "@/lib/utils";
import { FormEvent } from "react";
import { Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingBar } from "@/components/onboarding/OnboardingBar";

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
      <div className="mx-auto max-w-[960px] px-5 sm:px-8 py-10 lg:py-12 w-full">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-label uppercase tracking-[0.22em] text-secondary-500 mb-3">
            <span className="w-3 h-px bg-secondary-400" />
            Revisão
          </span>
          <h1 className="font-display text-display-md text-secondary-900">
            Confirme seus dados
          </h1>
          <p className="mt-3 font-body text-secondary-600 max-w-xl">
            Verifique os dados antes de prosseguir para assinatura do contrato.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {/* Economy strip — minimal, not a full green card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl border border-secondary-200 bg-secondary-900 px-6 py-5 grid sm:grid-cols-3 gap-4"
          >
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-400">
                Você economizará
              </p>
              <p className="font-display text-3xl font-semibold text-primary mt-1 tabular-nums">
                {(pct * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-400">
                Economia anual estimada
              </p>
              <p className="font-display text-3xl font-semibold text-tertiary mt-1 tabular-nums">
                {formatCurrency(annualSavings)}
              </p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-400">
                Consumo médio mensal
              </p>
              <p className="font-display text-3xl font-semibold text-tertiary mt-1 tabular-nums">
                {displayKwh.toLocaleString("pt-BR")} kWh
              </p>
            </div>
          </motion.div>
          <p className="font-label text-[11px] text-secondary-400 px-1 pb-3">
            *A economia anual é calculada de acordo com a média de consumo de energia presente na fatura fornecida.
          </p>

          {/* Primary card — imóvel (most important, larger) */}
          <div className="rounded-2xl border border-secondary-200 bg-tertiary px-6 py-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-secondary-900">
                Dados do imóvel
              </h3>
              <button
                type="button"
                onClick={() => router.push("/onboarding/conta")}
                aria-label="Editar dados do imóvel"
                className="p-2 rounded-full text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 transition-colors"
              >
                <Pencil size={15} />
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-x-6 gap-y-4">
              <InfoRow label="Distribuidora" value={data.distributor ?? "—"} />
              <InfoRow label="Nº Instalação" value={data.installationNumber} />
              <InfoRow label="Endereço" value={data.address} />
            </div>
          </div>

          {/* Secondary cards — titular + contato side by side on desktop */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-secondary-200 bg-tertiary px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-semibold text-secondary-900">
                  Titular da conta
                </h3>
                <button
                  type="button"
                  onClick={() => router.push("/onboarding/titular")}
                  aria-label="Editar titular"
                  className="p-1.5 rounded-full text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 transition-colors"
                >
                  <Pencil size={14} />
                </button>
              </div>
              <div className="space-y-3">
                <InfoRow label="Nome" value={data.fullName || data.name || "—"} />
                <InfoRow label="Nacionalidade" value={data.nationality} />
                <InfoRow label="CPF" value={data.document} />
                <InfoRow label="RG" value={data.rg} />
                <InfoRow label="Estado civil" value={data.civilStatus || "—"} />
              </div>
            </div>

            <div className="rounded-2xl border border-secondary-200 bg-tertiary px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-semibold text-secondary-900">
                  Contato
                </h3>
                <button
                  type="button"
                  onClick={() => router.push("/onboarding/contato")}
                  aria-label="Editar contato"
                  className="p-1.5 rounded-full text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 transition-colors"
                >
                  <Pencil size={14} />
                </button>
              </div>
              <div className="space-y-3">
                <InfoRow label="Nome" value={data.name || data.fullName || "—"} />
                <InfoRow label="E-mail" value={data.email} />
                <InfoRow label="Celular (WhatsApp)" value={data.phone} />
              </div>
            </div>
          </div>

          <OnboardingNav backHref="/onboarding/conta" />
        </form>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-label text-[10px] uppercase tracking-wider text-secondary-500">
        {label}
      </p>
      <p className="font-body text-sm text-secondary-900 mt-0.5 break-words">
        {value || "—"}
      </p>
    </div>
  );
}
