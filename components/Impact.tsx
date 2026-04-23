"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, revealFadeUp } from "@/lib/gsap";

const STATS = [
  { value: "+12 mil", label: "toneladas de CO₂ evitadas" },
  { value: "+3.400", label: "clientes ativos no Brasil" },
  { value: "14", label: "usinas solares em operação" },
  { value: "R$ 8,2M", label: "economizados pelos nossos associados" },
];

export function Impact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = sectionRef.current!;

      revealFadeUp(".impact-label", { trigger: el, duration: 0.6 });
      revealFadeUp(".impact-heading", { trigger: el, delay: 0.08, duration: 0.85 });
      revealFadeUp(".impact-para", { trigger: el, delay: 0.2, duration: 0.75 });
      revealFadeUp(".impact-billboard", { trigger: el, delay: 0.1, duration: 0.8, y: 36 });
      revealFadeUp(".impact-stat", {
        trigger: ".impact-billboard",
        delay: 0.25,
        stagger: 0.08,
        duration: 0.65,
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="impacto"
      className="relative py-24 lg:py-32 bg-tertiary"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-16">
          <div className="lg:col-span-5">
            <p className="impact-label font-label text-xs uppercase tracking-[0.25em] text-secondary-700 mb-4 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-secondary-700" />
              Impacto
            </p>
            <h2 className="impact-heading font-display text-display-lg text-secondary-900">
              Cada fatura{" "}
              <span className="font-body italic text-secondary-700 font-normal">
                reduz carbono
              </span>{" "}
              na atmosfera.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="impact-para font-body text-lg text-secondary-700 leading-relaxed max-w-2xl">
              A transição energética começa na sua fatura.
            </p>
          </div>
        </div>

        {/* Visual billboard */}
        <div className="impact-billboard relative rounded-[2rem] overflow-hidden bg-secondary-900 text-tertiary">
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at 80% 20%, var(--color-primary) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, var(--color-secondary-500) 0%, transparent 50%)",
            }}
          />
          <div className="relative p-10 lg:p-16">
            <div className="max-w-xl">
              <p className="font-label text-xs uppercase tracking-[0.25em] text-primary mb-4">
                energia compartilhada
              </p>
              <h3 className="font-display text-display-md leading-tight">
                Uma usina solar gera para dezenas de famílias ao mesmo tempo.
              </h3>
              <p className="mt-6 font-body text-lg text-tertiary/80 max-w-md">
                Você recebe os créditos proporcionais à sua cota, e a rede
                entrega essa energia para sua casa ou empresa.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 pt-10 border-t border-tertiary/15">
              {STATS.map((s) => (
                <div key={s.label} className="impact-stat">
                  <div className="font-display text-3xl lg:text-5xl font-semibold leading-none tabular-nums">
                    {s.value}
                  </div>
                  <div className="mt-3 font-body text-sm lg:text-base text-tertiary/70 leading-snug">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
