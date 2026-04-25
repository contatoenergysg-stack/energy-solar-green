"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { calculateSavings, formatCurrency } from "@/lib/utils";

const MIN = 100;
const MAX = 5000;
const EASE = [0.16, 1, 0.3, 1] as const;

export function Calculator() {
  const [bill, setBill] = useState<number>(850);

  const savings = useMemo(() => calculateSavings(bill), [bill]);
  const sliderPct = `${((bill - MIN) / (MAX - MIN)) * 100}%`;
  const lowSavings = savings.monthly < 30;

  const mvMonthly = useMotionValue(savings.monthly);
  const mvAnnual = useMotionValue(savings.annual);
  const smoothedMonthly = useSpring(mvMonthly, { stiffness: 120, damping: 22 });
  const smoothedAnnual = useSpring(mvAnnual, { stiffness: 120, damping: 22 });
  const formattedMonthly = useTransform(smoothedMonthly, (v) => formatCurrency(v));
  const formattedAnnual = useTransform(smoothedAnnual, (v) => formatCurrency(v));

  useEffect(() => {
    mvMonthly.set(savings.monthly);
    mvAnnual.set(savings.annual);
  }, [savings.monthly, savings.annual, mvMonthly, mvAnnual]);

  return (
    <section
      id="calculadora"
      className="relative py-24 lg:py-32 bg-secondary-900 text-tertiary overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute top-1/2 -right-40 w-[560px] h-[560px] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 60%)" }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* Coluna esquerda */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="font-label text-xs uppercase tracking-[0.25em] text-primary mb-4 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary" />
              Calculadora
            </p>
            <h2
              className="font-display leading-[1.0]"
              style={{ fontSize: "clamp(2rem, 3.5vw, 4rem)" }}
            >
              Quanto você pode
              <br />
              <span className="font-body italic text-primary font-normal">
                economizar
              </span>
              <br />
              por mês?
            </h2>
            <p className="mt-6 font-body text-lg text-tertiary/80 max-w-md leading-relaxed">
              Informe o valor médio da sua conta de luz e veja sua economia mensal e anual em tempo real.
            </p>
          </motion.div>

          {/* Coluna direita — card */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, ease: EASE, delay: 0.1 }}
          >
            <div className="bg-tertiary text-secondary-900 rounded-3xl p-6 lg:p-10 border border-primary-700/20 shadow-2xl shadow-black/20">

              {/* Slider */}
              <label
                htmlFor="bill-range"
                className="font-label text-xs uppercase tracking-wider text-secondary-600 flex items-center justify-between"
              >
                <span>Sua conta de luz hoje</span>
                {/* typeset: font-bold + tracking-tight para o número de input */}
                <span className="font-display text-2xl lg:text-3xl font-bold text-secondary-900 normal-case tracking-tight tabular-nums">
                  {formatCurrency(bill)}
                </span>
              </label>

              <input
                id="bill-range"
                type="range"
                min={MIN}
                max={MAX}
                step={25}
                value={bill}
                onChange={(e) => setBill(Number(e.target.value))}
                className="mt-5 w-full range-slider"
                style={{ "--slider-pct": sliderPct } as React.CSSProperties}
                aria-valuemin={MIN}
                aria-valuemax={MAX}
                aria-valuenow={bill}
              />

              <div className="mt-2 flex justify-between font-label text-[11px] text-secondary-400">
                <span>R$ 100</span>
                <span>R$ 5.000</span>
              </div>

              {/* Resultado */}
              <div className="mt-8 pt-8 border-t border-secondary-200 flex items-start gap-6 lg:gap-10">

                {/* Principal — mensal */}
                <motion.div
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: EASE, delay: 0.25 }}
                >
                  {/* colorize: dot verde lima antes do label principal */}
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary-500 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden />
                    Economia mensal
                  </p>
                  {/* typeset: font-bold (de semibold) para número principal */}
                  <motion.span
                    layout
                    className="mt-2 block font-display font-bold leading-none tracking-tight text-secondary-900 tabular-nums"
                    style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
                  >
                    {formattedMonthly}
                  </motion.span>

                  {lowSavings ? (
                    <p className="mt-2 font-label text-[11px] text-secondary-400 italic">
                      Confira se esse é o seu valor médio mensal
                    </p>
                  ) : (
                    /* typeset: label compacto em vez de body italic (não quebra linha) */
                    <p className="mt-2 font-label text-[11px] text-secondary-500">
                      com energia solar por assinatura
                    </p>
                  )}
                </motion.div>

                {/* colorize: divisor em primary/25 + animate: scaleY da entrada */}
                <motion.div
                  className="w-px self-stretch bg-primary/25 shrink-0"
                  aria-hidden
                  initial={{ scaleY: 0, originY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.38 }}
                  style={{ transformOrigin: "top" }}
                />

                {/* Secundário — anual */}
                <motion.div
                  className="shrink-0 w-[30%] max-w-[160px] min-w-[100px]"
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: EASE, delay: 0.3 }}
                >
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary-400">
                    Economia anual
                  </p>
                  <motion.span
                    layout
                    className="mt-2 block font-display text-2xl font-semibold leading-none tracking-tight text-secondary-700 tabular-nums"
                  >
                    {formattedAnnual}
                  </motion.span>
                  {/* typeset: text-[11px] para legibilidade mínima */}
                  <p className="mt-2 font-label text-[11px] text-secondary-400">
                    estimativa para 12 meses
                  </p>
                </motion.div>

              </div>

              {/* colorize + animate: link em verde com arrow slide no hover */}
              <div className="mt-6 pt-5 border-t border-secondary-100">
                <Link
                  href="#como-funciona"
                  className="group font-label text-sm text-primary hover:text-primary-600 transition-colors duration-200 inline-flex items-center gap-1.5"
                >
                  Ver como funciona
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
