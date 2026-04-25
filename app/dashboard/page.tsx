import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLogin } from "@/components/admin/DashboardLogin";
import { signOutToDashboard } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const ADMIN_EMAILS = ["pedrochereghini@gmail.com"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin logado → painel admin
  if (user && ADMIN_EMAILS.includes(user.email ?? "")) {
    redirect("/admin");
  }

  // Cliente logado → placeholder
  if (user) {
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
          <form action={signOutToDashboard} className="mt-4">
            <button
              type="submit"
              className="font-label text-xs text-secondary-400 underline underline-offset-4 hover:text-secondary-600"
            >
              Entrar com outro e-mail
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Não logado → form de login
  return <DashboardLogin />;
}
