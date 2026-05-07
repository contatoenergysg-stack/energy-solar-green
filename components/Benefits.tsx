"use client";

import { useEffect, useRef } from "react";
import {
  ShieldCheck,
  Timer,
  Wallet,
  Leaf,
  Ban,
  BadgeCheck,
} from "lucide-react";
import { gsap, ScrollTrigger, revealFadeUp } from "@/lib/gsap";

const BENEFITS = [
  {
    icon: Wallet,
    title: "Desconto garantido",
    desc: "10%, 15% ou 20% OFF — o percentual não muda durante o contrato.",
  },
  {
    icon: Timer,
    title: "Adesão em 5 minutos",
    desc: "100% online. Sem fila, sem burocracia, sem obras na sua casa. Ativação pela distribuidora em 30–60 dias.",
  },
  {
    icon: Ban,
    title: "Sem taxa de adesão",
    desc: "Entrar não custa nada. Você só paga pela energia que consumir — com desconto.",
  },
  {
    icon: ShieldCheck,
    title: "Cancelamento sem multa",
    desc: "Sem fidelidade escondida. Basta avisar com 90 dias de antecedência — tempo necessário para realocar sua cota com a distribuidora.",
  },
  {
    icon: Leaf,
    title: "Energia limpa",
    desc: "100% renovável, gerada em usinas solares próprias no Brasil.",
  },
  {
    icon: BadgeCheck,
    title: "Regulamentado pela ANEEL",
    desc: "Modelo de Geração Compartilhada previsto na REN 1.000/2021.",
  },
];

export function Benefits() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = sectionRef.current!;

      revealFadeUp(".ben-label", { trigger: el, duration: 0.6 });
      revealFadeUp(".ben-heading", { trigger: el, delay: 0.08, duration: 0.85 });
      revealFadeUp(".ben-card", {
        trigger: el,
        delay: 0.2,
        stagger: 0.065,
        duration: 0.65,
        y: 28,
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
      id="beneficios"
      className="relative py-24 lg:py-32 bg-tertiary-soft"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex items-end justify-between gap-8 flex-wrap mb-14">
          <div>
            <p className="ben-label font-label text-xs uppercase tracking-[0.25em] text-secondary-700 mb-4 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-secondary-700" />
              Benefícios
            </p>
            <h2 className="ben-heading font-display text-display-lg text-secondary-900 max-w-2xl">
              Pare de pagar caro{" "}
              <span className="font-body italic text-secondary-700 font-normal">
                pela sua energia.
              </span>
            </h2>
          </div>
          <div className="ben-heading flex items-center gap-2 text-sm font-label bg-primary/20 text-secondary-800 px-4 py-2 rounded-full shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
            Adesão em 5 min &nbsp;·&nbsp; Ativo em 30–60 dias
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="ben-card group bg-tertiary rounded-2xl p-7 border border-secondary-200/60 hover-lift transition-[transform,border-color] duration-300 [transition-timing-function:var(--ease-out-strong)] hover:border-secondary-400/80"
            >
              <span className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-primary/30 text-secondary-900 mb-6 group-hover:bg-primary transition-colors duration-300">
                <b.icon size={22} strokeWidth={2} />
              </span>
              <h3 className="font-display text-xl font-semibold text-secondary-900">
                {b.title}
              </h3>
              <p className="mt-2 font-body text-secondary-700 leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
