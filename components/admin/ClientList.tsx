"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Zap, User, MapPin, FileText, Phone, Mail, Calendar, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export type AdminClient = {
  id: string;
  distributor: string;
  installation_number: string | null;
  monthly_bill_brl: number;
  discount_percent: number;
  status: string;
  contract_signed_at: string | null;
  address: string | null;
  titular_name: string | null;
  titular_cpf: string | null;
  titular_rg: string | null;
  titular_civil_status: string | null;
  titular_nationality: string | null;
  titular_profession: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
};

const EASE = [0.16, 1, 0.3, 1] as const;

function statusLabel(s: string) {
  if (s === "active") return { label: "Ativo", color: "bg-primary text-secondary-900" };
  if (s === "cancelled") return { label: "Cancelado", color: "bg-red-100 text-red-700" };
  return { label: "Pendente", color: "bg-secondary-100 text-secondary-600" };
}

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function annualSavings(monthly: number, pct: number) {
  return Math.round(monthly * pct * 12);
}

export function ClientList({ clients }: { clients: AdminClient[] }) {
  const [selected, setSelected] = useState<AdminClient | null>(null);

  const totalClients = clients.length;
  const totalEconomy = clients.reduce(
    (acc, c) => acc + annualSavings(c.monthly_bill_brl, c.discount_percent),
    0
  );

  return (
    <div className="min-h-screen bg-tertiary">
      {/* Header */}
      <header className="bg-secondary-900 px-6 lg:px-10 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="font-display text-primary text-xl font-bold tracking-tight">ESG</span>
          <span className="font-label text-[11px] uppercase tracking-widest text-secondary-600 mt-0.5">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="font-label text-[10px] uppercase tracking-wider text-secondary-500">
              Assinantes
            </p>
            <p className="font-display text-lg font-semibold text-tertiary tabular-nums">
              {totalClients}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="font-label text-[10px] uppercase tracking-wider text-secondary-500">
              Economia total / ano
            </p>
            <p className="font-display text-lg font-semibold text-primary tabular-nums">
              {formatCurrency(totalEconomy)}
            </p>
          </div>
        </div>
      </header>

      {/* List */}
      <main className="max-w-[800px] mx-auto px-5 sm:px-8 py-8">
        {clients.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-secondary-300 mb-2">Nenhum assinante ainda</p>
            <p className="font-label text-sm text-secondary-400">
              Os clientes que assinarem o termo aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {clients.map((client, i) => {
              const badge = statusLabel(client.status);
              const yearly = annualSavings(client.monthly_bill_brl, client.discount_percent);
              return (
                <motion.button
                  key={client.id}
                  onClick={() => setSelected(client)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: i * 0.04 }}
                  className="w-full text-left bg-white/70 hover:bg-white border border-secondary-200
                             rounded-2xl px-5 py-4 sm:px-6 sm:py-5 transition-colors duration-150
                             flex items-center gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-label text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="font-label text-[11px] text-secondary-400 ml-auto">
                        {fmt(client.contract_signed_at)}
                      </span>
                    </div>
                    {/* Name */}
                    <p className="font-display text-base font-semibold text-secondary-900 truncate">
                      {client.titular_name || client.name || "—"}
                    </p>
                    {/* Contact */}
                    <p className="font-label text-xs text-secondary-500 mt-0.5 truncate">
                      {client.email ?? "—"}
                      {client.phone ? ` · ${client.phone}` : ""}
                    </p>
                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                      <span className="font-label text-[11px] text-secondary-600">
                        {client.distributor.charAt(0).toUpperCase() + client.distributor.slice(1)}
                      </span>
                      <span className="w-px h-3 bg-secondary-200" aria-hidden />
                      <span className="font-label text-[11px] text-secondary-600 tabular-nums">
                        {formatCurrency(client.monthly_bill_brl)}/mês
                      </span>
                      <span className="w-px h-3 bg-secondary-200" aria-hidden />
                      <span className="font-label text-[11px] text-primary font-medium tabular-nums">
                        {(client.discount_percent * 100).toFixed(0)}% desc · economia {formatCurrency(yearly)}/ano
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-secondary-300 shrink-0 group-hover:text-secondary-600 group-hover:translate-x-0.5 transition-all duration-150"
                  />
                </motion.button>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <ClientDrawer client={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ClientDrawer({ client, onClose }: { client: AdminClient; onClose: () => void }) {
  const yearly = annualSavings(client.monthly_bill_brl, client.discount_percent);
  const badge = statusLabel(client.status);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-secondary-900/40 z-20 backdrop-blur-[2px]"
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: EASE }}
        className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-tertiary z-30
                   overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Drawer header */}
        <div className="sticky top-0 bg-tertiary border-b border-secondary-100 px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <span className={`font-label text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-2 ${badge.color}`}>
              {badge.label}
            </span>
            <h2 className="font-display text-xl font-bold text-secondary-900 leading-tight truncate">
              {client.titular_name || client.name || "—"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-full hover:bg-secondary-100 text-secondary-500 hover:text-secondary-900 transition-colors shrink-0 mt-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8 flex-1">

          {/* Assinatura — summary at top */}
          <div className="rounded-2xl bg-secondary-900 px-5 py-4 grid grid-cols-3 gap-4">
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-500 mb-1">
                Desconto
              </p>
              <p className="font-display text-2xl font-bold text-primary tabular-nums">
                {(client.discount_percent * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-500 mb-1">
                Conta mensal
              </p>
              <p className="font-display text-lg font-semibold text-tertiary tabular-nums">
                {formatCurrency(client.monthly_bill_brl)}
              </p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-wider text-secondary-500 mb-1">
                Economia / ano
              </p>
              <p className="font-display text-lg font-semibold text-tertiary tabular-nums">
                {formatCurrency(yearly)}
              </p>
            </div>
          </div>

          {/* Contato */}
          <Section icon={<User size={14} />} title="Contato">
            <Field label="Nome de contato" value={client.name} />
            <Field label="E-mail" value={client.email} />
            <Field label="Telefone" value={client.phone} />
          </Section>

          {/* Documento / Titular */}
          <Section icon={<FileText size={14} />} title="Titular da conta">
            <Field label="Nome completo" value={client.titular_name} />
            <Field label="CPF" value={client.titular_cpf} />
            <Field label="RG" value={client.titular_rg} />
            <Field label="Nacionalidade" value={client.titular_nationality} />
            <Field label="Estado civil" value={client.titular_civil_status} />
            <Field label="Profissão" value={client.titular_profession} />
          </Section>

          {/* Imóvel */}
          <Section icon={<MapPin size={14} />} title="Imóvel">
            <Field label="Distribuidora" value={client.distributor.charAt(0).toUpperCase() + client.distributor.slice(1)} />
            <Field label="Nº instalação" value={client.installation_number} />
            <Field label="Endereço" value={client.address} />
          </Section>

          {/* Assinatura */}
          <Section icon={<Calendar size={14} />} title="Assinatura">
            <Field label="Status" value={badge.label} />
            <Field label="Data de assinatura" value={fmt(client.contract_signed_at)} />
            <Field label="ID da assinatura" value={client.id} mono />
          </Section>

        </div>
      </motion.aside>
    </>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-secondary-400">{icon}</span>
        <p className="font-label text-[11px] uppercase tracking-[0.2em] text-secondary-400">
          {title}
        </p>
      </div>
      <div className="space-y-3 pl-1">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-secondary-100 last:border-0">
      <p className="font-label text-xs text-secondary-400 shrink-0">{label}</p>
      <p className={`text-right break-all ${mono ? "font-mono text-[11px] text-secondary-500" : "font-body text-sm text-secondary-900"}`}>
        {value || "—"}
      </p>
    </div>
  );
}
