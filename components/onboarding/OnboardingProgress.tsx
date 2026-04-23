"use client";

import { usePathname } from "next/navigation";
import { ONBOARDING_STEPS } from "@/lib/onboarding-store";

export function OnboardingProgress() {
  const pathname = usePathname();
  const currentIndex = Math.max(
    0,
    ONBOARDING_STEPS.findIndex((s) => pathname?.startsWith(s.path))
  );
  const currentStep = ONBOARDING_STEPS[currentIndex] ?? ONBOARDING_STEPS[0];
  const pct = ((currentIndex + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="flex items-center gap-4">
      <div className="font-label text-xs text-secondary-500 whitespace-nowrap tabular-nums">
        Passo {currentIndex + 1} de {ONBOARDING_STEPS.length}
      </div>
      <div className="flex-1 h-[3px] rounded-full bg-secondary-200 overflow-hidden">
        <div
          className="h-full bg-primary transition-[width] duration-500 [transition-timing-function:var(--ease-out-strong)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="font-label text-xs text-secondary-700 whitespace-nowrap hidden sm:block">
        {currentStep.label}
      </div>
    </div>
  );
}
