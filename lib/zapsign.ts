const HOSTS = {
  sandbox: "https://sandbox.api.zapsign.com.br",
  production: "https://api.zapsign.com.br",
} as const;

function host(): string {
  const env = (process.env.ZAPSIGN_ENV ?? "sandbox") as keyof typeof HOSTS;
  return HOSTS[env] ?? HOSTS.sandbox;
}

function token(): string {
  const t = process.env.ZAPSIGN_API_TOKEN;
  if (!t) throw new Error("ZAPSIGN_API_TOKEN ausente");
  return t;
}

export interface ZapSignTemplateVar {
  de: string;
  para: string;
}

export interface CreateDocFromTemplateInput {
  template_id: string;
  signer_name: string;
  signer_email: string;
  signer_phone?: string; // dígitos apenas, sem '+', ex: '5521999998888'
  data: ZapSignTemplateVar[];
  external_id?: string;
  redirect_url?: string;
  lang?: "pt-br" | "en" | "es";
}

export interface ZapSignSigner {
  token: string;
  sign_url: string;
  status?: string;
  [k: string]: unknown;
}

export interface ZapSignDocument {
  token: string;
  status?: string;
  signers?: ZapSignSigner[];
  [k: string]: unknown;
}

export async function createDocFromTemplate(
  input: CreateDocFromTemplateInput
): Promise<ZapSignDocument> {
  const url = `${host()}/api/v1/models/create-doc/`;

  const body = {
    template_id: input.template_id,
    signer_name: input.signer_name,
    signer_email: input.signer_email,
    ...(input.signer_phone
      ? {
          send_automatic_whatsapp: false,
          signer_phone_country: "55",
          signer_phone_number: input.signer_phone,
        }
      : {}),
    data: input.data,
    external_id: input.external_id,
    lang: input.lang ?? "pt-br",
    ...(input.redirect_url ? { redirect_link: input.redirect_url } : {}),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    const message = (json as { message?: string }).message ?? `HTTP ${res.status}`;
    throw new Error(`[ZapSign] ${message}`);
  }
  return json as ZapSignDocument;
}

export async function getDocument(docToken: string): Promise<ZapSignDocument> {
  const res = await fetch(`${host()}/api/v1/docs/${docToken}/`, {
    headers: { Authorization: `Bearer ${token()}` },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) {
    const message = (json as { message?: string }).message ?? `HTTP ${res.status}`;
    throw new Error(`[ZapSign] ${message}`);
  }
  return json as ZapSignDocument;
}

// Widget URL — específica para embed em iframe.
// Não use o `sign_url` retornado pela API: ele bloqueia iframe via X-Frame-Options.
export function widgetUrl(signerToken: string): string {
  return `https://app.zapsign.com.br/verificar/${signerToken}`;
}
