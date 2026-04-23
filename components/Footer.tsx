"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { gsap, ScrollTrigger, revealFadeUp } from "@/lib/gsap";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18} {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = footerRef.current!;

      revealFadeUp(".footer-cta-heading", { trigger: el, duration: 0.85 });
      revealFadeUp(".footer-cta-sub", { trigger: el, delay: 0.1, duration: 0.7 });
      revealFadeUp(".footer-cta-btn", { trigger: el, delay: 0.2, duration: 0.65 });
      revealFadeUp(".footer-col", {
        trigger: el,
        delay: 0.15,
        stagger: 0.08,
        duration: 0.65,
      });
      revealFadeUp(".footer-bottom", { trigger: el, delay: 0.35, duration: 0.6 });
    }, footerRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <footer ref={footerRef} className="relative bg-secondary-900 text-tertiary pt-24 lg:pt-32 pb-10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 pb-16 border-b border-tertiary/10">
          <div className="lg:col-span-5">
            <h2 className="footer-cta-heading font-display text-display-md text-tertiary max-w-md">
              Pronto para começar a{" "}
              <span className="font-body italic text-primary font-normal">
                economizar?
              </span>
            </h2>
            <p className="footer-cta-sub mt-5 font-body text-tertiary/70 max-w-sm leading-relaxed">
              Em 5 minutos você se associa à ESG e começa a receber o desconto
              na sua próxima fatura.
            </p>
            <Link
              href="/onboarding/distribuidora"
              className="footer-cta-btn mt-8 inline-flex items-center gap-2 font-label text-[0.95rem] bg-primary text-secondary-900 px-7 h-12 rounded-full btn-press hover:bg-primary-500 transition-colors"
            >
              Começar agora →
            </Link>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-6 lg:justify-items-end">
            <FooterCol
              className="footer-col"
              title="Produto"
              links={[
                { href: "#como-funciona", label: "Como funciona" },
                { href: "#calculadora", label: "Calculadora" },
                { href: "#beneficios", label: "Benefícios" },
                { href: "#faq", label: "Perguntas frequentes" },
              ]}
            />
            <FooterCol
              className="footer-col"
              title="Empresa"
              links={[
                { href: "#impacto", label: "Nossas usinas" },
                { href: "/sobre", label: "Sobre a ESG" },
                { href: "/blog", label: "Blog" },
                { href: "/imprensa", label: "Imprensa" },
              ]}
            />
            <FooterCol
              className="footer-col"
              title="Suporte"
              links={[
                { href: "/entrar", label: "Área do cliente" },
                { href: "/ajuda", label: "Central de ajuda" },
                { href: "/contato", label: "Fale conosco" },
                { href: "/termos", label: "Termos & Privacidade" },
              ]}
            />
          </div>
        </div>

        <div className="footer-bottom mt-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Image
              src="/logos/logo_escrito_branca.png"
              alt="Energy Solar Green"
              width={200}
              height={48}
              className="h-10 w-auto"
            />
          </div>

          <div className="flex items-center gap-3">
            <SocialIcon href="https://instagram.com/energysolargreenbr" label="Instagram">
              <InstagramIcon />
            </SocialIcon>
            <SocialIcon href="https://linkedin.com" label="LinkedIn">
              <LinkedinIcon />
            </SocialIcon>
            <SocialIcon href="mailto:contato@energysolargreen.com.br" label="Email">
              <Mail size={18} />
            </SocialIcon>
          </div>
        </div>

        <p className="footer-bottom mt-10 font-label text-xs text-tertiary/50 max-w-3xl leading-relaxed">
          © {new Date().getFullYear()} Energy Solar Green · Associação de Geração
          Compartilhada regulamentada pela Resolução Normativa 1.000/2021 da ANEEL.
          Os descontos variam conforme o valor da fatura e podem ser alterados
          de acordo com regulamentação do setor.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
  className,
}: {
  title: string;
  links: { href: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-label text-xs uppercase tracking-[0.2em] text-tertiary/60 mb-4">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="font-body text-tertiary/85 hover:text-primary transition-colors duration-200"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="w-10 h-10 rounded-full border border-tertiary/20 grid place-items-center text-tertiary/80 hover:text-secondary-900 hover:bg-primary hover:border-primary transition-colors duration-200 btn-press"
    >
      {children}
    </Link>
  );
}
