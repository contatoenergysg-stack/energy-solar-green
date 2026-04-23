import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro — ESG",
  description: "Comece a economizar na sua conta de luz em minutos.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col min-h-0">{children}</main>
    </div>
  );
}
