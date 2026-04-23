"use client";

import { useRouter } from "next/navigation";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { useOnboarding } from "@/lib/onboarding-store";
import { calculateSavings, formatCurrency, getDiscountPercent } from "@/lib/utils";
import { FormEvent, useState } from "react";
import { Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { OnboardingBar } from "@/components/onboarding/OnboardingBar";

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [editingBill, setEditingBill] = useState(false);

  const savings = calculateSavings(data.monthlyBill);
  const pct = getDiscountPercent(data.monthlyBill);

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
          Verifique os dados cadastrais e os dados da conta de energia antes
          de prosseguir para assinatura do contrato.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
          {/* Economy card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl bg-primary/90 px-6 py-5 grid sm:grid-cols-3 gap-4"
          >
            <div>
              <p className="font-label text-[11px] uppercase tracking-wider text-secondary-800">
                Você economizará
              </p>
              <p className="font-display text-3xl font-semibold text-secondary-900 mt-1 tabular-nums">
                {(pct * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="font-label text-[11px] uppercase tracking-wider text-secondary-800">
                Economia anual
              </p>
              <p className="font-display text-3xl font-semibold text-secondary-900 mt-1 tabular-nums">
                {formatCurrency(savings.annual)}
              </p>
            </div>
            <div>
              <p className="font-label text-[11px] uppercase tracking-wider text-secondary-800">
                Consumo mensal estimado
              </p>
              <p className="font-display text-3xl font-semibold text-secondary-900 mt-1 tabular-nums">
                {Math.round(data.monthlyBill / 0.77)} kWh
              </p>
            </div>
          </motion.div>
          <p className="font-label text-xs text-secondary-500 px-1">
            * A economia anual é calculada de acordo com a média de consumo de
            energia presente na fatura fornecida.
          </p>

          <InfoCard
            title="Dados do imóvel"
            onEdit={() => router.push("/onboarding/conta")}
          >
            <InfoRow label="Distribuidora" value={data.distributor ?? "—"} />
            <InfoRow label="Nº Instalação" value={data.installationNumber} />
            <InfoRow label="Endereço" value={data.address} />
            <div className="mt-3">
              <p className="font-label text-[11px] uppercase tracking-wider text-secondary-500">
                Valor médio da conta
              </p>
              {editingBill ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={String(data.monthlyBill)}
                    onChange={(e) =>
                      update({ monthlyBill: Number(e.target.value) || 0 })
                    }
                    className="h-10"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingBill(false)}
                    className="font-label text-sm bg-secondary-900 text-tertiary px-4 h-10 rounded-full btn-press"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-display text-xl font-semibold text-secondary-900 tabular-nums">
                    {formatCurrency(data.monthlyBill)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditingBill(true)}
                    className="font-label text-xs underline underline-offset-2 text-secondary-600 hover:text-secondary-900"
                  >
                    editar
                  </button>
                </div>
              )}
            </div>
          </InfoCard>

          <InfoCard
            title="Dados do Titular"
            onEdit={() => router.push("/onboarding/titular")}
          >
            <InfoRow label="Nome" value={data.fullName || data.name || "—"} />
            <InfoRow label="Nacionalidade" value={data.nationality} />
            <InfoRow label="CPF" value={data.document} />
            <InfoRow label="RG" value={data.rg} />
            <InfoRow label="Estado civil" value={data.civilStatus || "—"} />
          </InfoCard>

          <InfoCard
            title="Dados de Contato"
            onEdit={() => router.push("/onboarding/contato")}
          >
            <InfoRow label="Nome" value={data.name || data.fullName || "—"} />
            <InfoRow label="E-mail" value={data.email} />
            <InfoRow label="Celular (WhatsApp)" value={data.phone} />
          </InfoCard>

          <OnboardingNav backHref="/onboarding/conta" />
      </form>
    </div>
    </div>
  );
}

function InfoCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-secondary-200 bg-tertiary p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-secondary-900">
          {title}
        </h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${title}`}
            className="p-2 rounded-full text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 transition-colors"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-label text-[11px] uppercase tracking-wider text-secondary-500">
        {label}
      </p>
      <p className="font-body text-secondary-900 mt-0.5 break-words">
        {value || "—"}
      </p>
    </div>
  );
}
