"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  backHref?: string | null;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext?: () => void;
  nextType?: "submit" | "button";
}

export function OnboardingNav({
  backHref,
  nextLabel = "Continuar",
  nextDisabled = false,
  onNext,
  nextType = "submit",
}: Props) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {backHref ? (
        <Link href={backHref}>
          <Button type="button" variant="outline" size="md">
            Voltar
          </Button>
        </Link>
      ) : (
        <span />
      )}
      <Button
        type={nextType}
        onClick={onNext}
        disabled={nextDisabled}
        size="md"
      >
        {nextLabel}
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}
