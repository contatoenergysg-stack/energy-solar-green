import { createClient as createAdminClient } from "@supabase/supabase-js";
import { ClientList, type AdminClient } from "@/components/admin/ClientList";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Subscriptions com properties aninhadas
  const { data: subs, error } = await admin
    .from("subscriptions")
    .select("*, properties(*)")
    .not("contract_signed_at", "is", null)
    .order("contract_signed_at", { ascending: false });

  if (error) {
    console.error("[admin] subscriptions:", error.message);
  }

  // Buscar e-mails dos usuários autenticados
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const userMap = new Map(
    (authData?.users ?? []).map((u) => [u.id, { email: u.email ?? null }])
  );

  // Buscar profiles (nome de contato + telefone)
  const userIds = (subs ?? [])
    .filter((s) => s.user_id)
    .map((s) => s.user_id as string);

  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("id, name, phone").in("id", userIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Montar lista de clientes
  const clients: AdminClient[] = (subs ?? []).map((sub) => {
    const property = Array.isArray(sub.properties)
      ? sub.properties[0]
      : sub.properties;
    const authUser = sub.user_id ? userMap.get(sub.user_id) : null;
    const profile = sub.user_id ? profileMap.get(sub.user_id) : null;

    return {
      id: sub.id,
      distributor: sub.distributor ?? "",
      installation_number: sub.installation_number ?? null,
      monthly_bill_brl: sub.monthly_bill_brl ?? 0,
      discount_percent: sub.discount_percent ?? 0,
      status: sub.status ?? "pending",
      contract_signed_at: sub.contract_signed_at ?? null,
      address: property?.address ?? null,
      titular_name: property?.titular_name ?? null,
      titular_cpf: property?.titular_cpf ?? null,
      titular_rg: property?.titular_rg ?? null,
      titular_civil_status: property?.titular_civil_status ?? null,
      titular_nationality: property?.titular_nationality ?? null,
      titular_profession: property?.titular_profession ?? null,
      email: authUser?.email ?? null,
      phone: profile?.phone ?? null,
      name: profile?.name ?? property?.titular_name ?? null,
    };
  });

  return <ClientList clients={clients} />;
}
