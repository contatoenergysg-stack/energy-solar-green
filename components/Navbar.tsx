"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#calculadora", label: "Calculadora" },
  { href: "#impacto", label: "Impacto" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-[background-color,backdrop-filter,border-color,padding] duration-300",
        "[transition-timing-function:var(--ease-out-strong)]",
        scrolled
          ? "bg-tertiary/85 backdrop-blur-md border-b border-secondary-200/60 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 btn-press"
          aria-label="Energy Solar Green - página inicial"
        >
          <Image
            src="/logos/logo_dark.png"
            alt="Energy Solar Green"
            width={180}
            height={40}
            priority
            className="h-10 lg:h-12 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "font-label text-[0.875rem] text-secondary-700 px-3 py-2 rounded-full",
                "hover:text-secondary-900 hover:bg-secondary-900/5",
                "transition-colors duration-200"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/entrar"
            className="hidden md:inline-flex font-label text-sm text-secondary-700 hover:text-secondary-900 px-3 py-2 transition-colors"
          >
            Entrar
          </Link>
          <Link href="/onboarding/distribuidora">
            <Button size="md" className="shadow-sm">
              Começar
              <span aria-hidden className="-mr-1 translate-y-[-1px]">→</span>
            </Button>
          </Link>
          <button
            type="button"
            className="lg:hidden p-2 rounded-full hover:bg-secondary-900/5 btn-press"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height,opacity] duration-300",
          "[transition-timing-function:var(--ease-out-strong)]",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="px-6 py-4 flex flex-col gap-1 border-t border-secondary-200/60 bg-tertiary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="font-label text-[0.95rem] text-secondary-700 px-3 py-3 rounded-xl hover:bg-secondary-900/5"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/entrar"
            onClick={() => setMobileOpen(false)}
            className="font-label text-[0.95rem] text-secondary-700 px-3 py-3 rounded-xl hover:bg-secondary-900/5"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
