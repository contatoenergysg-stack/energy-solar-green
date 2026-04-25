"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { useOnboarding } from "@/lib/onboarding-store";
import { useDropzone } from "react-dropzone";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Upload, File as FileIcon, Eye, EyeOff, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { ParsedBill } from "@/lib/parsers/bill";
import { parseBillText } from "@/lib/parsers/bill";
import { extractPdfText } from "@/lib/parsers/extract-pdf-text";

type ParseState = "idle" | "parsing" | "done" | "error";

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdField, setShowPwdField] = useState(false);
  const [parseState, setParseState] = useState<ParseState>("idle");
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedBill | null>(null);
  const fileRef = useRef<File | null>(null);

  // Restaura o estado após voltar da confirmação — o File não persiste,
  // mas os dados já estão no store e não precisam ser re-extraídos.
  useEffect(() => {
    if (data.billFileName && data.avgMonthlyKwh > 0 && parseState === "idle") {
      setParsed({
        avgMonthlyKwh: data.avgMonthlyKwh,
        kwhTariff: data.kwhTariff,
        consumptionHistory: data.consumptionHistory,
        monthlyBill: data.monthlyBill,
        distributor: (data.distributor as ParsedBill["distributor"]) ?? "outros",
        installationNumber: data.installationNumber ?? "",
        address: data.address ?? "",
      });
      setParseState("done");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValid = !!data.billFileName && parseState === "done";
  const isPasswordError = parseState === "error" && (
    parseError?.toLowerCase().includes("password") ||
    parseError?.toLowerCase().includes("encrypted")
  );

  async function parseBill(file: File, password?: string) {
    setParseState("parsing");
    setParseError(null);
    setParsed(null);

    try {
      const text = await extractPdfText(file, password);
      const result = parseBillText(text);

      if (!result) {
        throw new Error("Não foi possível extrair os dados da conta. Verifique se é um PDF de conta de energia.");
      }

      setParsed(result);
      setParseState("done");

      update({
        avgMonthlyKwh: result.avgMonthlyKwh,
        kwhTariff: result.kwhTariff,
        consumptionHistory: result.consumptionHistory,
        monthlyBill: result.monthlyBill,
        ...(result.installationNumber ? { installationNumber: result.installationNumber } : {}),
        ...(result.address ? { address: result.address } : {}),
      });
    } catch (err) {
      setParseError(String(err instanceof Error ? err.message : err));
      setParseState("error");
    }
  }

  const mainDrop = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (files) => {
      const f = files[0];
      if (!f) return;
      fileRef.current = f;
      update({ billFileName: f.name, billFileSize: f.size });
      parseBill(f);
    },
  });

  const complementary = useDropzone({
    maxFiles: 1,
    onDrop: (files) => {
      const f = files[0];
      if (f) update({ complementaryDocName: f.name });
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isValid) router.push("/onboarding/confirmacao");
  };

  function removeBill() {
    fileRef.current = null;
    update({
      billFileName: null,
      billFileSize: null,
      avgMonthlyKwh: 0,
      kwhTariff: 0,
      consumptionHistory: [],
      billPassword: "",
    });
    setParseState("idle");
    setParseError(null);
    setParsed(null);
    setShowPwdField(false);
  }

  function retryWithPassword() {
    if (fileRef.current && data.billPassword) {
      parseBill(fileRef.current, data.billPassword);
    }
  }

  return (
    <OnboardingShell
      title="Adicionar imóvel"
      description="Envie o PDF da sua conta de energia para analisarmos seu perfil de consumo."
      accent="Conta de energia"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Conta de Energia */}
        <div className="rounded-2xl border border-secondary-200 bg-tertiary p-5">
          <p className="font-display text-base font-semibold text-secondary-900">
            Conta de Energia
          </p>
          <p className="font-label text-xs text-secondary-600 mt-1">
            Adicione o PDF da sua conta de luz — extrairemos os dados automaticamente.
          </p>

          {data.billFileName ? (
            <div className="mt-4 space-y-3">
              {/* File row */}
              <div className="flex items-center gap-3 bg-primary/15 rounded-xl p-3">
                <FileIcon size={20} className="text-secondary-900 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-label text-sm text-secondary-900 truncate">
                    {data.billFileName}
                  </p>
                  {data.billFileSize && (
                    <p className="font-label text-xs text-secondary-600">
                      {(data.billFileSize / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>
                {parseState === "parsing" && (
                  <Loader2 size={16} className="animate-spin text-secondary-500 shrink-0" />
                )}
                {parseState === "done" && (
                  <CheckCircle2 size={16} className="text-secondary-700 shrink-0" />
                )}
                {parseState === "error" && (
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                )}
                <button
                  type="button"
                  onClick={removeBill}
                  aria-label="Remover"
                  className="p-1 rounded-full hover:bg-secondary-900/10 shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Parse feedback */}
              {parseState === "parsing" && (
                <p className="font-label text-xs text-secondary-500 flex items-center gap-2 px-1">
                  <Loader2 size={11} className="animate-spin" />
                  Extraindo consumo e tarifa…
                </p>
              )}

              {parseState === "error" && (
                <div className="space-y-2 px-1">
                  <p className="font-label text-xs text-red-600">
                    {isPasswordError
                      ? "Este PDF está protegido por senha."
                      : `${parseError} — verifique se é um PDF de conta de luz e tente novamente.`}
                  </p>
                  {isPasswordError && !showPwdField && (
                    <button
                      type="button"
                      onClick={() => setShowPwdField(true)}
                      className="font-label text-xs text-secondary-700 underline underline-offset-2 hover:text-secondary-900 transition-colors"
                    >
                      Inserir senha do arquivo
                    </button>
                  )}
                </div>
              )}

              {parseState === "done" && parsed && (
                <div className="rounded-xl bg-secondary-900 px-4 py-3 grid grid-cols-3 gap-3">
                  <Stat
                    label="Consumo médio"
                    value={`${parsed.avgMonthlyKwh.toLocaleString("pt-BR")} kWh`}
                  />
                  <Stat
                    label="Tarifa unitária"
                    value={`R$ ${parsed.kwhTariff.toFixed(5)}`}
                  />
                  <Stat
                    label="Distribuidora"
                    value={parsed.distributor.charAt(0).toUpperCase() + parsed.distributor.slice(1)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div
              {...mainDrop.getRootProps()}
              className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                mainDrop.isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-secondary-200 hover:border-secondary-400"
              }`}
            >
              <input {...mainDrop.getInputProps()} />
              <Upload size={24} className="mx-auto text-secondary-600 mb-2" />
              <p className="font-label text-sm text-secondary-700">
                <span className="text-secondary-900 font-medium">Procure o arquivo</span>{" "}
                ou arraste aqui
              </p>
              <p className="font-label text-[11px] text-secondary-400 mt-1">PDF · Light, Enel, Cemig e outras</p>
            </div>
          )}

          {!showPwdField ? (
            <button
              type="button"
              onClick={() => setShowPwdField(true)}
              className="mt-3 font-label text-xs text-secondary-500 underline underline-offset-2 hover:text-secondary-700 transition-colors"
            >
              Arquivo protegido por senha?
            </button>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Senha do arquivo"
                  value={data.billPassword}
                  onChange={(e) => update({ billPassword: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && retryWithPassword()}
                  className="h-11 w-full rounded-xl bg-tertiary border border-secondary-200 px-4 pr-11 font-label text-sm text-secondary-900 focus:outline-none focus:border-secondary-700"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Esconder senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {parseState === "error" && data.billPassword && (
                <button
                  type="button"
                  onClick={retryWithPassword}
                  className="w-full h-10 rounded-xl bg-secondary-900 text-tertiary font-label text-sm font-medium hover:bg-secondary-800 transition-colors flex items-center justify-center gap-2"
                >
                  Processar com essa senha
                </button>
              )}
            </div>
          )}
        </div>

        {/* Documentos Complementares — optional, visually subordinate */}
        <div className="rounded-xl border border-dashed border-secondary-200 px-4 py-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-label text-sm font-medium text-secondary-700">
              Documentos complementares
            </p>
            <span className="font-label text-[10px] uppercase tracking-wider text-secondary-400 bg-secondary-100 px-2 py-0.5 rounded-full">
              Opcional
            </span>
          </div>
          <p className="font-label text-xs text-secondary-400 mb-3">
            Ex.: protocolo de troca de titularidade, procurações, contratos sociais.
          </p>

          {data.complementaryDocName ? (
            <div className="flex items-center gap-3 bg-secondary-100/60 rounded-lg p-2.5">
              <FileIcon size={16} className="text-secondary-600 shrink-0" />
              <span className="font-label text-xs text-secondary-700 truncate flex-1">
                {data.complementaryDocName}
              </span>
              <button
                type="button"
                onClick={() => update({ complementaryDocName: null })}
                aria-label="Remover"
                className="p-1 rounded-full hover:bg-secondary-200"
              >
                <X size={14} className="text-secondary-500" />
              </button>
            </div>
          ) : (
            <div
              {...complementary.getRootProps()}
              className="border border-dashed border-secondary-200 rounded-lg p-3 text-center cursor-pointer hover:border-secondary-400 transition-colors"
            >
              <input {...complementary.getInputProps()} />
              <p className="font-label text-xs text-secondary-500">
                <span className="text-secondary-700">Procure o arquivo</span> ou arraste aqui
              </p>
            </div>
          )}
        </div>

        <OnboardingNav backHref="/onboarding/titular" nextDisabled={!isValid} />
      </form>
    </OnboardingShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-label text-[10px] uppercase tracking-[0.18em] text-tertiary/50 mb-0.5">
        {label}
      </p>
      <p className="font-display text-sm font-semibold text-tertiary tabular-nums">
        {value}
      </p>
    </div>
  );
}
