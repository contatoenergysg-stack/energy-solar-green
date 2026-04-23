import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function DashboardPlaceholder() {
  return (
    <div className="min-h-screen grid place-items-center px-6 bg-tertiary">
      <div className="text-center max-w-md">
        <p className="font-label text-xs uppercase tracking-[0.25em] text-secondary-600 mb-4">
          Em breve
        </p>
        <h1 className="font-display text-display-md text-secondary-900">
          Sua área do cliente está a caminho
        </h1>
        <p className="mt-4 font-body text-secondary-700">
          Aqui você verá sua economia acumulada, histórico de faturas e
          consumo — tudo em um só lugar.
        </p>
        <Link href="/" className="mt-8 inline-block">
          <Button variant="outline">Voltar à home</Button>
        </Link>
      </div>
    </div>
  );
}
