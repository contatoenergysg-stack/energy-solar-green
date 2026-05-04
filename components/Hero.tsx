"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

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
  const accentRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const els = accentRefs.current.filter(Boolean);
    if (!els.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        els,
        { backgroundPosition: "0% 50%" },
        {
          backgroundPosition: "100% 50%",
          duration: 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.6,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const accentStyle: React.CSSProperties = {
    fontStyle: "italic",
    background: "linear-gradient(90deg, #d9ff00 0%, #4a7000 50%, #d9ff00 100%)",
    backgroundSize: "200% 100%",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
    backgroundPosition: "0% 50%",
    paddingRight: "0.12em",
  };

  return (
    <section className="relative overflow-hidden min-h-[100dvh] flex flex-col justify-center bg-tertiary pt-28 pb-20">
      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
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
                  ref={(el) => { accentRefs.current[0] = el; }}
                  className="font-accent not-italic"
                  style={accentStyle}
                >
                  economia
                </em>{" "}
                faz o mundo girar{" "}
                <em
                  ref={(el) => { accentRefs.current[1] = el; }}
                  className="font-accent not-italic"
                  style={accentStyle}
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

          <div className="w-full lg:w-1/2 flex justify-center lg:block">
            <div className="w-[min(300px,80vw)] lg:w-full">
              <HeroGlobe />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
