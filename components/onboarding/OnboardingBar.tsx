"use client";

import Image from "next/image";
import Link from "next/link";
import { OnboardingProgress } from "./OnboardingProgress";

export function OnboardingBar() {
  return (
    <div className="flex items-center gap-4 px-6 lg:px-10 py-4 border-b border-secondary-200/50 bg-tertiary">
      <Link href="/" className="shrink-0 btn-press" aria-label="Home">
        <Image
          src="/logos/logo_dark.png"
          alt="Energy Solar Green"
          width={120}
          height={32}
          className="h-7 w-auto"
        />
      </Link>
      <div className="flex-1">
        <OnboardingProgress />
      </div>
      <Link
        href="/"
        className="shrink-0 font-label text-sm text-secondary-500 hover:text-secondary-900 transition-colors"
      >
        Sair
      </Link>
    </div>
  );
}
