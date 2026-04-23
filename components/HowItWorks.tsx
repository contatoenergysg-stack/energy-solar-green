"use client";

import { useEffect, useRef } from "react";
import { FileText, Zap, Sun, PiggyBank } from "lucide-react";
import { gsap, ScrollTrigger, revealFadeUp } from "@/lib/gsap";

const STEPS = [
  {
    n: "01",
    icon: FileText,
    title: "Você se associa",
    desc: "Em 5 minutos, conosco online. Enviamos seus dados para sua distribuidora.",
  },
  {
    n: "02",
    icon: Sun,
    title: "Geramos energia",
    desc: "Nossas usinas solares produzem energia limpa e injetam na rede.",
  },
  {
    n: "03",
    icon: Zap,
    title: "Créditos aparecem",
    desc: "Os créditos de energia aparecem direto na fatura da sua distribuidora.",
  },
  {
    n: "04",
    icon: PiggyBank,
    title: "Você economiza",
    desc: "Paga a distribuidora pelo valor reduzido e a ESG pelo valor com desconto.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = sectionRef.current!;

      revealFadeUp(".hw-label", { trigger: el, duration: 0.6 });
      revealFadeUp(".hw-heading", { trigger: el, delay: 0.08, duration: 0.8 });
      revealFadeUp(".hw-sub", { trigger: el, delay: 0.18, duration: 0.7 });
      revealFadeUp(".hw-card", {
        trigger: el,
        delay: 0.22,
        stagger: 0.075,
        duration: 0.7,
        y: 32,
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
      id="como-funciona"
      className="relative py-24 lg:py-32 bg-tertiary"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex items-end justify-between gap-8 flex-wrap mb-14 lg:mb-20">
          <div>
            <p className="hw-label font-label text-xs uppercase tracking-[0.25em] text-secondary-700 mb-4 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-secondary-700" />
              Como funciona
            </p>
            <h2 className="hw-heading font-display text-display-lg text-secondary-900 max-w-2xl">
              Você continua na mesma distribuidora.{" "}
              <span className="font-body italic text-secondary-700 font-normal">
                Só que economizando.
              </span>
            </h2>
          </div>
          <p className="hw-sub font-body text-secondary-700 max-w-md">
            Nada muda no seu dia a dia. A mesma energia, o mesmo medidor, a mesma
            distribuidora — com uma fatura menor.
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute top-8 left-0 right-0 h-px bg-secondary-200 hidden lg:block"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="hw-card relative bg-tertiary-soft/60 rounded-2xl p-6 lg:p-8 hover-lift transition-transform duration-300 [transition-timing-function:var(--ease-out-strong)]"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-display text-4xl text-secondary-300 tabular-nums">
                    {s.n}
                  </span>
                  <span className="w-11 h-11 rounded-full bg-primary grid place-items-center text-secondary-900">
                    <s.icon size={20} strokeWidth={2} />
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-secondary-900 mb-2">
                  {s.title}
                </h3>
                <p className="font-body text-[0.95rem] text-secondary-700 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
