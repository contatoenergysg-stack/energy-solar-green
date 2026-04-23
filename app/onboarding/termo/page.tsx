"use client";

import { useRouter } from "next/navigation";
import { OnboardingNav } from "@/components/onboarding/OnboardingNav";
import { OnboardingBar } from "@/components/onboarding/OnboardingBar";
import { useOnboarding } from "@/lib/onboarding-store";
import { formatCurrency } from "@/lib/utils";
import { submitOnboarding } from "@/app/actions/onboarding";
import { FormEvent, useRef, useState, useEffect } from "react";
import { FileSignature, Check } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [reachedBottom, setReachedBottom] = useState(false);
  const [signature, setSignature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
        setReachedBottom(true);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const canSign =
    reachedBottom && signature.trim().toLowerCase() === (data.fullName || data.name).trim().toLowerCase() && signature.trim().length > 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSign) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      update({ signed: true });
      const result = await submitOnboarding(data);

      if (!result.ok) {
        setSubmitError(result.error || "Erro ao salvar dados");
        setIsSubmitting(false);
        return;
      }

      router.push("/onboarding/sucesso");
    } catch (err) {
      setSubmitError("Erro ao processar assinatura");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
    <OnboardingBar />
    <div className="mx-auto max-w-[1000px] px-5 sm:px-8 py-10 lg:py-12 w-full">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-label uppercase tracking-[0.22em] text-secondary-500 mb-3">
          <span className="w-3 h-px bg-secondary-400" />
          Assinatura
        </span>
        <h1 className="font-display text-display-md text-secondary-900">
          Termo de adesão
        </h1>
        <p className="mt-3 font-body text-secondary-600 max-w-xl">
          Leia o termo de adesão com atenção, faça a leitura até o final e
          assine digitando seu nome completo para começar a economizar.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div
            ref={scrollRef}
            className="bg-tertiary border border-secondary-200 rounded-2xl p-6 lg:p-8 max-h-[60vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-secondary-200 mb-6">
              <span className="font-display text-xl font-semibold text-secondary-900">
                ESG
              </span>
              <span className="font-label text-xs text-secondary-500">
                0/1 Assinaturas
              </span>
            </div>
            <h2 className="font-display text-lg font-semibold text-secondary-900 mb-4">
              Termo de adesão ao consórcio de geração compartilhada
            </h2>
            <Section title="Qualificação da unidade consumidora">
              <DL label="Titular" value={data.fullName || data.name} />
              <DL label="CPF" value={data.document} />
              <DL label="Nacionalidade" value={data.nationality} />
              <DL label="Estado civil" value={data.civilStatus || "—"} />
              <DL label="Endereço" value={data.address} />
              <DL label="E-mail" value={data.email} />
              <DL label="Celular" value={data.phone} />
            </Section>
            <Section title="Participação no consórcio">
              <DL label="Unidade consumidora" value={data.installationNumber} />
              <DL label="Distribuidora" value={data.distributor ?? "—"} />
              <DL
                label="Valor estimado da fatura atual"
                value={formatCurrency(data.monthlyBill)}
              />
              <DL
                label="Tipo de contribuição"
                value="Créditos compensados + tarifa compensada"
              />
              <DL label="Vencimento dos créditos" value="30 dias após recebimento" />
              <DL label="Forma de pagamento" value="Boleto ou Pix, mensal" />
            </Section>
            <Section title="Condições gerais">
              <p className="font-body text-sm text-secondary-700 leading-relaxed">
                O TITULAR declara ter lido e compreendido integralmente as
                cláusulas deste termo, ciente de que a adesão ao consórcio de
                geração compartilhada se dará mediante compensação de energia
                nos termos da Resolução Normativa nº 1.000/2021 da ANEEL.
                A contratação não gera vínculo de fidelidade, podendo ser
                cancelada a qualquer momento mediante aviso prévio de 30 dias
                por qualquer das partes, sem cobrança de multa.
              </p>
              <p className="font-body text-sm text-secondary-700 leading-relaxed mt-3">
                Os créditos serão aplicados diretamente na fatura da
                distribuidora, com exceção de rateios e encargos previstos em
                regulamentação. O TITULAR autoriza a ESG a intermediar o
                processo junto à distribuidora, incluindo procurações e
                cadastros técnicos necessários.
              </p>
              <p className="font-body text-sm text-secondary-700 leading-relaxed mt-3">
                Este contrato tem validade a partir da data de assinatura
                digital e vigência indeterminada. Foro da comarca do
                consumidor.
              </p>
            </Section>
            {!reachedBottom && (
              <p className="mt-6 font-label text-xs text-secondary-500 text-center">
                ↓ Role até o final para liberar a assinatura
              </p>
            )}
            {reachedBottom && (
              <p className="mt-6 font-label text-xs text-primary-700 text-center flex items-center justify-center gap-2">
                <Check size={14} />
                Leitura completa. Você já pode assinar.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-4 bg-tertiary-soft/60 border border-secondary-200 rounded-2xl p-6">
            {submitError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 font-label text-sm text-red-700">
                {submitError}
              </div>
            )}
            <div className="flex items-center gap-2 mb-4">
              <FileSignature size={20} className="text-secondary-700" />
              <span className="font-display font-semibold text-secondary-900">
                Assinatura digital
              </span>
            </div>
            <p className="font-body text-sm text-secondary-700 mb-4">
              Digite seu nome completo exatamente como informado no cadastro:
            </p>
            <p className="font-label text-[11px] uppercase tracking-wider text-secondary-500 mb-1">
              Nome esperado
            </p>
            <p className="font-display text-base font-semibold text-secondary-900 mb-4">
              {data.fullName || data.name || "—"}
            </p>
            <input
              type="text"
              placeholder="Assine aqui"
              disabled={!reachedBottom}
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="h-12 w-full rounded-xl bg-tertiary border border-secondary-200 px-4 font-body italic text-secondary-900 focus:outline-none focus:border-secondary-700 focus:ring-2 focus:ring-secondary-900/10 disabled:bg-secondary-100/40 disabled:cursor-not-allowed"
            />
            <OnboardingNav
              backHref="/onboarding/aceite"
              nextLabel={isSubmitting ? "Processando..." : "Assinar e finalizar"}
              nextDisabled={!canSign || isSubmitting}
            />
          </div>
        </div>
      </form>
    </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-secondary-700 mb-3 pb-2 border-b border-secondary-100">
        {title}
      </h3>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">{children}</div>
    </section>
  );
}

function DL({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-label text-[10px] uppercase tracking-wider text-secondary-500">
        {label}
      </p>
      <p className="font-body text-sm text-secondary-900 break-words">
        {value || "—"}
      </p>
    </div>
  );
}
