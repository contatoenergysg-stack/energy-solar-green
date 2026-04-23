"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Button } from "./ui/Button";
import { calculateSavings, formatCurrency, getDiscountPercent } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function Calculator() {
  const [bill, setBill] = useState<number>(850);

  const savings = useMemo(() => calculateSavings(bill), [bill]);
  const pct = getDiscountPercent(bill);

  /* Animated counter for annual savings */
  const mv = useMotionValue(savings.annual);
  const smoothed = useSpring(mv, { stiffness: 120, damping: 22 });
  const formatted = useTransform(smoothed, (v) => formatCurrency(v));

  useEffect(() => {
    mv.set(savings.annual);
  }, [savings.annual, mv]);

  return (
    <section
      id="calculadora"
      className="relative py-24 lg:py-32 bg-secondary-900 text-tertiary overflow-hidden"
    >
      {/* background ornament */}
      <div
        aria-hidden
        className="absolute top-1/2 -right-40 w-[560px] h-[560px] rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
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
              em um ano?
            </h2>
            <p className="mt-6 font-body text-lg text-tertiary/80 max-w-md leading-relaxed">
              Informe o valor médio da sua conta de luz. Calculamos sua
              economia anual em tempo real.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-tertiary text-secondary-900 rounded-3xl p-6 lg:p-10 border border-primary-700/20 shadow-2xl shadow-black/20">
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
                min={100}
                max={5000}
                step={25}
                value={bill}
                onChange={(e) => setBill(Number(e.target.value))}
                className="mt-4 w-full accent-[var(--color-primary)]"
                style={{ accentColor: "var(--color-primary)" }}
                aria-valuemin={100}
                aria-valuemax={5000}
                aria-valuenow={bill}
              />

              <div className="mt-2 flex justify-between font-label text-[11px] text-secondary-500">
                <span>R$ 100</span>
                <span>R$ 2.500</span>
                <span>R$ 5.000</span>
              </div>

              {/* Quick chips */}
              <div className="mt-6 flex flex-wrap gap-2">
                {[400, 800, 1200, 1800, 3000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBill(v)}
                    className={`font-label text-sm px-4 py-2 rounded-full border btn-press transition-colors duration-200 ${
                      bill === v
                        ? "bg-secondary-900 text-tertiary border-secondary-900"
                        : "bg-tertiary text-secondary-700 border-secondary-200 hover:border-secondary-400"
                    }`}
                  >
                    {formatCurrency(v)}
                  </button>
                ))}
              </div>

              {/* Result */}
              <div className="mt-8 pt-8 border-t border-secondary-200">
                <p className="font-label text-xs uppercase tracking-wider text-secondary-600">
                  Você economiza por ano
                </p>
                <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                  <motion.span className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-none tracking-tight text-secondary-900 tabular-nums">
                    {formatted}
                  </motion.span>
                  <span className="font-body italic text-secondary-600 text-lg">
                    por ficar com a ESG
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/onboarding/distribuidora">
                    <Button size="lg">
                      Quero economizar {(pct * 100).toFixed(0)}%
                      <ArrowUpRight size={18} />
                    </Button>
                  </Link>
                  <Link href="#como-funciona">
                    <Button size="lg" variant="ghost">
                      Como isso funciona?
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
