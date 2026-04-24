"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { ArrowUpRight } from "lucide-react";

const HeroGlobe = dynamic(() => import("./HeroGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square max-w-[600px] mx-auto flex items-center justify-center">
      <div className="w-[min(480px,90vw)] h-[min(480px,90vw)] rounded-full bg-secondary-200/40 animate-pulse" />
    </div>
  ),
});

const EASE = [0.16, 1, 0.3, 1] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

const headlineSize = "clamp(2.5rem, 5vw, 4.75rem)";

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[100dvh] flex flex-col justify-center bg-tertiary pt-28 pb-20">
      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
          {/* LEFT — copy & CTAs */}
          <div className="w-full lg:w-1/2">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex flex-col"
            >
              <motion.h1
                variants={fadeUp}
                className="font-display font-bold text-secondary-900 leading-[1.02]"
                style={{ fontSize: headlineSize, letterSpacing: "-0.035em" }}
              >
                Sua{" "}
                <em
                  className="font-accent not-italic text-[#d9ff00]"
                  style={{ fontStyle: "italic" }}
                >
                  economia
                </em>{" "}
                faz o mundo girar{" "}
                <em
                  className="font-accent not-italic text-[#d9ff00]"
                  style={{ fontStyle: "italic" }}
                >
                  melhor
                </em>
                .
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="font-body font-normal text-secondary-500 mt-6 leading-[1.55] max-w-[42ch]"
                style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)" }}
              >
                Toda a economia da energia solar, com a facilidade de uma
                assinatura.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link href="/onboarding/distribuidora">
                  <Button size="lg">
                    Começar agora
                    <ArrowUpRight size={18} />
                  </Button>
                </Link>
                <Link href="#calculadora">
                  <Button size="lg" variant="outline">
                    Saiba mais
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT — 3D globe */}
          <div className="w-full lg:w-1/2">
            <HeroGlobe />
          </div>
        </div>

      </div>
    </section>
  );
}
