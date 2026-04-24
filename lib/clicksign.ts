const BASE = "https://sandbox.clicksign.com";

function endpoint(path: string) {
  return `${BASE}/api/v1${path}?access_token=${process.env.CLICKSIGN_API_KEY}`;
}

async function cs<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(endpoint(path), {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickSign ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────

export interface CSDocument {
  key: string;
  status: "running" | "closed" | "canceled" | "expired";
  [k: string]: unknown;
}

export interface CSSigner {
  key: string;
  [k: string]: unknown;
}

export interface CSList {
  request_signature_key: string;
  url: string;
  [k: string]: unknown;
}

// ── API calls ──────────────────────────────────────────────

export async function createDocumentFromTemplate(
  templateKey: string,
  path: string,
  data: Record<string, string>
): Promise<CSDocument> {
  const body = { document: { path, template: { data } } };
  const json = await cs<{ document: CSDocument }>(
    `/templates/${templateKey}/documents`,
    { method: "POST", body: JSON.stringify(body) }
  );
  return json.document;
}

export async function createSigner(params: {
  name: string;
  email: string;
  phone_number: string;
}): Promise<CSSigner> {
  const body = {
    signer: {
      name: params.name,
      email: params.email,
      phone_number: params.phone_number,
      auths: ["email"],
      delivery: "email",
    },
  };
  const json = await cs<{ signer: CSSigner }>("/signers", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return json.signer;
}

export async function addSignerToDocument(
  documentKey: string,
  signerKey: string
): Promise<CSList> {
  const body = {
    list: {
      document_key: documentKey,
      signer_key: signerKey,
      sign_as: "sign",
      refusable: false,
    },
  };
  const json = await cs<{ list: CSList }>("/lists", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return json.list;
}

export async function getDocumentStatus(
  documentKey: string
): Promise<CSDocument> {
  const json = await cs<{ document: CSDocument }>(`/documents/${documentKey}`);
  return json.document;
}

export function widgetUrl(list: CSList): string {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const base = list.url ?? `${BASE}/sign/${list.request_signature_key}`;
  return `${base}?embedded=true&origin=${origin}`;
}
