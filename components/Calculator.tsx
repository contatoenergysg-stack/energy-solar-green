"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { calculateSavings, formatCurrency } from "@/lib/utils";

const MIN = 100;
const MAX = 5000;

export function Calculator() {
  const [bill, setBill] = useState<number>(850);

  const savings = useMemo(() => calculateSavings(bill), [bill]);
  const sliderPct = `${((bill - MIN) / (MAX - MIN)) * 100}%`;

  /* Contadores animados */
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

          {/* Coluna esquerda — heading */}
          <div className="lg:col-span-5">
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
          </div>

          {/* Coluna direita — card interativo */}
          <div className="lg:col-span-7">
            <div className="bg-tertiary text-secondary-900 rounded-3xl p-6 lg:p-10 border border-primary-700/20 shadow-2xl shadow-black/20">

              {/* Slider */}
              <label
                htmlFor="bill-range"
                className="font-label text-xs uppercase tracking-wider text-secondary-600 flex items-center justify-between"
              >
                <span>Sua conta de luz hoje</span>
                <span className="font-display text-2xl lg:text-3xl font-semibold text-secondary-900 normal-case tracking-normal tabular-nums">
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
                aria-label="Valor da sua conta de luz"
              />

              <div className="mt-2 flex justify-between font-label text-[11px] text-secondary-500">
                <span>R$ 100</span>
                <span>R$ 2.500</span>
                <span>R$ 5.000</span>
              </div>

              {/* Resultado — mensal em destaque, anual ao lado */}
              <div className="mt-8 pt-8 border-t border-secondary-200 flex items-start gap-6 lg:gap-10">

                {/* Principal — mensal */}
                <div className="flex-1 min-w-0">
                  <p className="font-label text-xs uppercase tracking-wider text-secondary-500">
                    Economia mensal
                  </p>
                  <motion.span className="mt-1.5 block font-display font-semibold leading-none tracking-tight text-secondary-900 tabular-nums"
                    style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
                  >
                    {formattedMonthly}
                  </motion.span>
                  <p className="mt-2 font-body italic text-secondary-500 text-sm leading-snug">
                    por ficar com a ESG
                  </p>
                </div>

                {/* Divisor vertical */}
                <div className="w-px self-stretch bg-secondary-200 shrink-0" aria-hidden />

                {/* Secundário — anual */}
                <div className="shrink-0 min-w-[120px]">
                  <p className="font-label text-xs uppercase tracking-wider text-secondary-500">
                    Economia anual
                  </p>
                  <motion.span className="mt-1.5 block font-display text-2xl font-semibold leading-none tracking-tight text-secondary-700 tabular-nums">
                    {formattedAnnual}
                  </motion.span>
                  <p className="mt-2 font-label text-xs text-secondary-400">
                    estimativa para 12 meses
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
