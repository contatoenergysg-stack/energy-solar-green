"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { gsap, ScrollTrigger, revealFadeUp } from "@/lib/gsap";

const FAQS = [
  {
    q: "Preciso instalar painéis solares em casa?",
    a: "Não. A energia é gerada em nossas usinas solares e injetada na rede elétrica. Os créditos aparecem direto na sua fatura.",
  },
  {
    q: "Como funciona o desconto?",
    a: "Você continua recebendo a fatura da sua distribuidora, mas com os créditos da ESG aplicados. O desconto varia entre 10% e 20%, dependendo do valor da sua conta.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. O contrato é sem fidelidade. Basta solicitar o cancelamento e a gente cuida de tudo com a distribuidora.",
  },
  {
    q: "Quanto tempo demora para começar a economizar?",
    a: "Após a adesão, o processo com a distribuidora leva entre 30 e 60 dias. A partir daí, você vê o desconto na sua fatura.",
  },
  {
    q: "Isso é legal? É regulamentado?",
    a: "Sim. A Geração Compartilhada está prevista na Resolução Normativa 1.000/2021 da ANEEL. É um modelo 100% regulamentado.",
  },
  {
    q: "Meu CNPJ pode aderir também?",
    a: "Pode. Atendemos pessoas físicas e jurídicas, incluindo comércios, escritórios e pequenas indústrias.",
  },
  {
    q: "Se eu me mudar, perco o benefício?",
    a: "Desde que a nova unidade esteja na mesma área de concessão da distribuidora, você continua com o benefício. Basta nos avisar.",
  },
  {
    q: "Preciso pagar alguma taxa para começar?",
    a: "Não existe taxa de adesão. Você só paga a sua conta de energia normalmente, com o desconto aplicado.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = sectionRef.current!;

      revealFadeUp(".faq-label", { trigger: el, duration: 0.6 });
      revealFadeUp(".faq-heading", { trigger: el, delay: 0.08, duration: 0.85 });
      revealFadeUp(".faq-item", {
        trigger: el,
        delay: 0.2,
        stagger: 0.045,
        duration: 0.6,
        y: 20,
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} id="faq" className="relative py-24 lg:py-32 bg-tertiary">
      <div className="mx-auto max-w-[900px] px-6 lg:px-10">
        <p className="faq-label font-label text-xs uppercase tracking-[0.25em] text-secondary-700 mb-4 flex items-center gap-3">
          <span className="inline-block w-8 h-px bg-secondary-700" />
          Perguntas frequentes
        </p>
        <h2 className="faq-heading font-display text-display-lg text-secondary-900 mb-12 lg:mb-16">
          Tudo o que você quis{" "}
          <span className="font-body italic text-secondary-700 font-normal">
            perguntar.
          </span>
        </h2>

        <div className="divide-y divide-secondary-200">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="faq-item">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-start justify-between gap-6 py-6 text-left btn-press group"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-lg lg:text-xl font-medium text-secondary-900 pt-0.5">
                    {f.q}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 w-9 h-9 rounded-full border border-secondary-300 grid place-items-center text-secondary-700 transition-transform duration-300 [transition-timing-function:var(--ease-out-strong)] group-hover:border-secondary-700"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    <Plus size={18} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <p className="font-body text-secondary-700 text-lg leading-relaxed pb-6 pr-16 max-w-[65ch]">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
