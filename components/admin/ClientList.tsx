"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Search, X } from "lucide-react";
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

// ── palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:           "oklch(0.11 0.018 130)",
  surface:      "oklch(0.155 0.022 130)",
  elevated:     "oklch(0.195 0.026 130)",
  border:       "oklch(0.22 0.028 130)",
  borderSubtle: "oklch(0.17 0.022 130)",
  text:         "oklch(0.88 0.014 120)",
  textSec:      "oklch(0.58 0.04 130)",
  textMuted:    "oklch(0.36 0.03 130)",
  primary:      "var(--color-primary)",
} as const;

// ── helpers ───────────────────────────────────────────────────────────────────
function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function annualSavings(monthly: number, pct: number) {
  return Math.round(monthly * pct * 12);
}

function isNew(date: string | null) {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000;
}

function statusConfig(s: string) {
  if (s === "active")    return { label: "Ativo",      dot: "oklch(0.72 0.19 145)", badge: "oklch(0.72 0.19 145 / 0.14)" };
  if (s === "cancelled") return { label: "Cancelado",  dot: "oklch(0.65 0.22 22)",  badge: "oklch(0.65 0.22 22 / 0.14)"  };
  return                        { label: "Pendente",   dot: "oklch(0.82 0.18 80)",  badge: "oklch(0.82 0.18 80 / 0.14)"  };
}

// ── types ─────────────────────────────────────────────────────────────────────
type FilterKey = "all" | "new" | "active" | "pending";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",     label: "Todos"     },
  { key: "new",     label: "Novos"     },
  { key: "active",  label: "Ativos"    },
  { key: "pending", label: "Pendentes" },
];

// ── main component ────────────────────────────────────────────────────────────
export function ClientList({ clients }: { clients: AdminClient[] }) {
  const [selected, setSelected] = useState<AdminClient | null>(clients[0] ?? null);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients
      .filter((c) => {
        if (q) {
          const nameOk  = (c.titular_name ?? c.name ?? "").toLowerCase().includes(q);
          const emailOk = (c.email ?? "").toLowerCase().includes(q);
          if (!nameOk && !emailOk) return false;
        }
        if (filter === "new")     return isNew(c.contract_signed_at);
        if (filter === "active")  return c.status === "active";
        if (filter === "pending") return c.status === "pending";
        return true;
      })
      .sort((a, b) => {
        const ta = a.contract_signed_at ? new Date(a.contract_signed_at).getTime() : 0;
        const tb = b.contract_signed_at ? new Date(b.contract_signed_at).getTime() : 0;
        return tb - ta;
      });
  }, [clients, search, filter]);

  const totalEconomy = useMemo(
    () => clients.reduce((acc, c) => acc + annualSavings(c.monthly_bill_brl, c.discount_percent), 0),
    [clients],
  );

  return (
    <div
      className="flex h-screen overflow-hidden select-none"
      style={{ background: C.bg, color: C.text }}
    >
      {/* ── sidebar ── */}
      <aside
        className="w-[300px] xl:w-[340px] flex-none flex flex-col overflow-hidden"
        style={{ borderRight: `1px solid ${C.border}` }}
      >
        {/* brand */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          <span className="font-display text-sm font-bold tracking-tight" style={{ color: C.primary }}>
            ESG
          </span>
          <span className="font-label text-[10px] uppercase tracking-[0.22em]" style={{ color: C.textMuted }}>
            Painel Admin
          </span>
        </div>

        {/* search */}
        <div className="px-4 pt-4 pb-3">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.textMuted }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome ou e-mail..."
              className="w-full pl-8 pr-7 py-2 font-label text-[12px] rounded-md outline-none placeholder:opacity-40 transition-colors"
              style={{ background: C.elevated, border: `1px solid ${C.border}`, color: C.text }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X size={11} style={{ color: C.textMuted }} />
              </button>
            )}
          </div>
        </div>

        {/* filters */}
        <div className="px-4 pb-3 flex gap-1.5" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="font-label text-[11px] px-2.5 py-1 rounded transition-colors"
                style={
                  active
                    ? { background: C.primary, color: "oklch(0.18 0.06 130)", fontWeight: 600 }
                    : { background: C.elevated, color: C.textSec }
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-label text-sm" style={{ color: C.textMuted }}>Nenhum resultado</p>
            </div>
          ) : (
            filtered.map((client) => {
              const novel      = isNew(client.contract_signed_at);
              const st         = statusConfig(client.status);
              const isSelected = selected?.id === client.id;

              return (
                <button
                  key={client.id}
                  onClick={() => setSelected(client)}
                  className="w-full text-left relative transition-colors duration-100"
                  style={{
                    background:   isSelected ? C.surface : "transparent",
                    borderBottom: `1px solid ${C.borderSubtle}`,
                  }}
                >
                  {/* selection indicator — positional div, not border-left */}
                  {isSelected && (
                    <motion.div
                      layoutId="row-indicator"
                      className="absolute left-0 top-0 bottom-0"
                      style={{ width: 2, background: C.primary }}
                      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                    />
                  )}

                  <div className="px-5 py-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-none"
                        style={{ background: st.dot }}
                      />
                      <span className="font-label text-[12px] font-medium flex-1 truncate" style={{ color: C.text }}>
                        {client.titular_name || client.name || "—"}
                      </span>
                      {novel && (
                        <span
                          className="font-label text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-semibold flex-none"
                          style={{ background: "oklch(0.905 0.215 118 / 0.15)", color: C.primary }}
                        >
                          Novo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-label text-[10px] capitalize" style={{ color: C.textSec }}>
                        {client.distributor}
                      </span>
                      <span style={{ color: C.textMuted }}>·</span>
                      <span className="font-label text-[10px] tabular-nums" style={{ color: C.textSec }}>
                        {formatCurrency(client.monthly_bill_brl)}/mês
                      </span>
                      <span className="font-label text-[10px] ml-auto" style={{ color: C.textMuted }}>
                        {fmt(client.contract_signed_at)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* stats footer */}
        <div className="px-5 py-3.5 flex items-center gap-6" style={{ borderTop: `1px solid ${C.border}` }}>
          <div>
            <p className="font-label text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.textMuted }}>
              Assinantes
            </p>
            <p className="font-label text-sm font-semibold tabular-nums" style={{ color: C.text }}>
              {clients.length}
            </p>
          </div>
          <div>
            <p className="font-label text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.textMuted }}>
              Economia total / ano
            </p>
            <p className="font-label text-sm font-semibold tabular-nums" style={{ color: C.primary }}>
              {formatCurrency(totalEconomy)}
            </p>
          </div>
        </div>
      </aside>

      {/* ── detail panel ── */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            >
              <ClientDetail client={selected} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center"
            >
              <p className="font-label text-sm" style={{ color: C.textMuted }}>
                Selecione um cliente na lista
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ── detail panel ──────────────────────────────────────────────────────────────
function ClientDetail({ client }: { client: AdminClient }) {
  const [copied, setCopied] = useState<string | null>(null);
  const yearly = annualSavings(client.monthly_bill_brl, client.discount_percent);
  const st     = statusConfig(client.status);
  const novel  = isNew(client.contract_signed_at);

  const copy = useCallback((key: string, value: string | null | undefined) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1400);
    });
  }, []);

  return (
    <div className="max-w-[660px] mx-auto px-10 py-9">

      {/* header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <span
            className="font-label text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ background: st.badge, color: st.dot }}
          >
            {st.label}
          </span>
          {novel && (
            <span
              className="font-label text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold"
              style={{ background: "oklch(0.905 0.215 118 / 0.13)", color: C.primary }}
            >
              Novo assinante
            </span>
          )}
          <span className="font-label text-[11px] ml-auto" style={{ color: C.textMuted }}>
            {fmt(client.contract_signed_at)}
          </span>
        </div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight leading-tight" style={{ color: C.text }}>
          {client.titular_name || client.name || "—"}
        </h1>
      </div>

      {/* summary strip — 3 cols separated by gap (not cards-inside-cards) */}
      <div
        className="grid grid-cols-3 gap-px mb-9 rounded-lg overflow-hidden"
        style={{ background: C.border }}
      >
        {[
          { label: "Conta mensal",   value: formatCurrency(client.monthly_bill_brl),          accent: false },
          { label: "Desconto",       value: `${(client.discount_percent * 100).toFixed(0)}%`,  accent: true  },
          { label: "Economia / ano", value: formatCurrency(yearly),                            accent: false },
        ].map((item) => (
          <div key={item.label} className="px-5 py-4" style={{ background: C.surface }}>
            <p className="font-label text-[10px] uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>
              {item.label}
            </p>
            <p
              className="font-display text-[22px] font-semibold tabular-nums leading-none"
              style={{ color: item.accent ? C.primary : C.text }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* sections */}
      <div className="space-y-7">

        <Section title="Contato">
          <Field k="name"   label="Nome de contato" value={client.name}  copied={copied} onCopy={copy} />
          <Field k="email"  label="E-mail"           value={client.email} copied={copied} onCopy={copy} />
          <Field k="phone"  label="Telefone"          value={client.phone} copied={copied} onCopy={copy} />
        </Section>

        <Section title="Titular da conta">
          <Field k="tname"  label="Nome completo"  value={client.titular_name}         copied={copied} onCopy={copy} />
          <Field k="cpf"    label="CPF"             value={client.titular_cpf}          copied={copied} onCopy={copy} mono />
          <Field k="rg"     label="RG"              value={client.titular_rg}           copied={copied} onCopy={copy} mono />
          <Field k="nat"    label="Nacionalidade"   value={client.titular_nationality}  copied={copied} onCopy={copy} />
          <Field k="civil"  label="Estado civil"    value={client.titular_civil_status} copied={copied} onCopy={copy} />
          <Field k="prof"   label="Profissão"        value={client.titular_profession}  copied={copied} onCopy={copy} />
        </Section>

        <Section title="Imóvel">
          <Field k="dist"   label="Distribuidora"  value={client.distributor}         copied={copied} onCopy={copy} capitalize />
          <Field k="inst"   label="Nº instalação"  value={client.installation_number} copied={copied} onCopy={copy} mono />
          <Field k="addr"   label="Endereço"        value={client.address}             copied={copied} onCopy={copy} />
        </Section>

        <Section title="Assinatura">
          <Field k="status" label="Status"          value={st.label}     copied={copied} onCopy={copy} />
          <Field k="date"   label="Data assinatura" value={fmt(client.contract_signed_at)} copied={copied} onCopy={copy} />
          <Field k="id"     label="ID"              value={client.id}    copied={copied} onCopy={copy} mono />
        </Section>

      </div>
    </div>
  );
}

// ── section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-label text-[10px] uppercase tracking-[0.2em] mb-2.5" style={{ color: C.textMuted }}>
        {title}
      </p>
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
        {children}
      </div>
    </div>
  );
}

// ── copyable field ─────────────────────────────────────────────────────────────
function Field({
  k,
  label,
  value,
  copied,
  onCopy,
  mono       = false,
  capitalize = false,
}: {
  k:          string;
  label:      string;
  value:      string | null | undefined;
  copied:     string | null;
  onCopy:     (key: string, value: string | null | undefined) => void;
  mono?:      boolean;
  capitalize?: boolean;
}) {
  const isCopied  = copied === k;
  const hasValue  = !!value;
  const displayed = capitalize && value
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : value;

  return (
    <div
      className="group flex items-center gap-4 px-4 py-2.5 transition-colors duration-100"
      style={{
        background:   isCopied ? "oklch(0.905 0.215 118 / 0.07)" : undefined,
        borderBottom: `1px solid ${C.borderSubtle}`,
        cursor:       hasValue ? "pointer" : "default",
      }}
      onClick={() => onCopy(k, displayed ?? value)}
    >
      <span className="font-label text-[11px] w-32 shrink-0" style={{ color: C.textMuted }}>
        {label}
      </span>
      <span
        className={`flex-1 font-label text-[12px] break-all ${mono ? "font-mono" : ""}`}
        style={{ color: hasValue ? C.text : C.textMuted }}
      >
        {displayed || "—"}
      </span>
      {hasValue && (
        <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
          {isCopied
            ? <Check size={12} style={{ color: C.primary }} />
            : <Copy  size={12} style={{ color: C.textMuted }} />
          }
        </span>
      )}
    </div>
  );
}
