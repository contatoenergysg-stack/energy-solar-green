export function isValidCPF(value: string): boolean {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calc = (slice: number) => {
    let sum = 0;
    for (let i = 0; i < slice; i++) {
      sum += parseInt(cpf[i], 10) * (slice + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === parseInt(cpf[9], 10) && calc(10) === parseInt(cpf[10], 10);
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = value.replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calc = (length: number) => {
    const weights = length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += parseInt(cnpj[i], 10) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calc(12) === parseInt(cnpj[12], 10) && calc(13) === parseInt(cnpj[13], 10);
}

export interface CnpjLookupResult {
  ok: boolean;
  razaoSocial?: string;
  nomeFantasia?: string;
  situacao?: string;
  error?: string;
}

export async function lookupCNPJ(cnpj: string, signal?: AbortSignal): Promise<CnpjLookupResult> {
  const digits = cnpj.replace(/\D/g, "");
  if (!isValidCNPJ(digits)) return { ok: false, error: "CNPJ inválido" };

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, { signal });
    if (!res.ok) {
      if (res.status === 404) return { ok: false, error: "CNPJ não encontrado na Receita Federal" };
      return { ok: false, error: `Erro ${res.status} ao consultar CNPJ` };
    }
    const json = await res.json();
    return {
      ok: true,
      razaoSocial: json.razao_social,
      nomeFantasia: json.nome_fantasia,
      situacao: json.descricao_situacao_cadastral,
    };
  } catch (err) {
    if ((err as Error).name === "AbortError") return { ok: false, error: "abort" };
    return { ok: false, error: "Falha de conexão ao consultar CNPJ" };
  }
}
