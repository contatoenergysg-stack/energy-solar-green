"use client";

import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { useOnboarding } from "@/lib/onboarding-store";
import { useDropzone } from "react-dropzone";
import { FormEvent, useState } from "react";
import { Upload, File as FileIcon, Eye, EyeOff, X } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [showPwd, setShowPwd] = useState(false);

  const isValid = !!data.billFileName;

  const mainDrop = useDropzone({
    accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
    onDrop: (files) => {
      const f = files[0];
      if (f) update({ billFileName: f.name, billFileSize: f.size });
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
    if (isValid) {
      // Simulate extracting the monthly bill from the upload
      const simulated = data.monthlyBill || 850;
      update({
        monthlyBill: simulated,
        installationNumber: data.installationNumber || "2.137.992.059-42",
        address: data.address || "Av. Mons. Felix 196, Irajá, Rio de Janeiro/RJ",
      });
      router.push("/onboarding/confirmacao");
    }
  };

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
            Adicione um arquivo em PDF ou imagem (PNG ou JPG)
          </p>

          {data.billFileName ? (
            <div className="mt-4 flex items-center gap-3 bg-primary/15 rounded-xl p-3">
              <FileIcon size={20} className="text-secondary-900" />
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
              <button
                type="button"
                onClick={() =>
                  update({ billFileName: null, billFileSize: null })
                }
                aria-label="Remover"
                className="p-1 rounded-full hover:bg-secondary-900/10"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              {...mainDrop.getRootProps()}
              className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                mainDrop.isDragActive
                  ? "border-primary-700 bg-primary/10"
                  : "border-secondary-200 hover:border-secondary-400"
              }`}
            >
              <input {...mainDrop.getInputProps()} />
              <Upload size={24} className="mx-auto text-secondary-600 mb-2" />
              <p className="font-label text-sm text-secondary-700">
                <span className="text-secondary-900 font-medium">
                  Procure o arquivo
                </span>{" "}
                ou arraste aqui
              </p>
            </div>
          )}

          <div className="mt-4 relative">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Senha do arquivo (opcional)"
              value={data.billPassword}
              onChange={(e) => update({ billPassword: e.target.value })}
              className="h-12 w-full rounded-xl bg-tertiary border border-secondary-200 px-4 pr-11 font-label text-sm text-secondary-900 focus:outline-none focus:border-secondary-700"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Esconder senha" : "Mostrar senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-600"
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Documentos Complementares */}
        <div className="rounded-2xl border border-secondary-200 bg-tertiary p-5">
          <p className="font-display text-base font-semibold text-secondary-900">
            Documentos complementares
          </p>
          <p className="font-label text-xs text-secondary-600 mt-1">
            Ex.: protocolo de troca de titularidade, procurações, contratos sociais.
          </p>

          {data.complementaryDocName ? (
            <div className="mt-4 flex items-center gap-3 bg-primary/15 rounded-xl p-3">
              <FileIcon size={20} className="text-secondary-900" />
              <span className="font-label text-sm text-secondary-900 truncate flex-1">
                {data.complementaryDocName}
              </span>
              <button
                type="button"
                onClick={() => update({ complementaryDocName: null })}
                aria-label="Remover"
                className="p-1 rounded-full hover:bg-secondary-900/10"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              {...complementary.getRootProps()}
              className="mt-4 border-2 border-dashed border-secondary-200 rounded-xl p-4 text-center cursor-pointer hover:border-secondary-400 transition-colors"
            >
              <input {...complementary.getInputProps()} />
              <p className="font-label text-sm text-secondary-700">
                <span className="text-secondary-900 font-medium">
                  Procure o arquivo
                </span>{" "}
                ou arraste aqui
              </p>
            </div>
          )}
        </div>

        <OnboardingNav backHref="/onboarding/titular" nextDisabled={!isValid} />
      </form>
    </OnboardingShell>
  );
}
