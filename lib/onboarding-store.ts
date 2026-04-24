"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CivilStatus =
  | "solteiro"
  | "casado"
  | "divorciado"
  | "viuvo"
  | "uniao-estavel";

export interface OnboardingData {
  // Step 1
  distributor: string | null;
  // Step 2
  name: string;
  email: string;
  phone: string;
  termsAccepted: boolean;
  // Step 3
  otpVerified: boolean;
  // Step 4
  documentType: "cpf" | "cnpj";
  document: string;
  // Step 5
  fullName: string;
  nationality: string;
  rg: string;
  civilStatus: CivilStatus | "";
  profession: string;
  // Step 6
  billFileName: string | null;
  billFileSize: number | null;
  billPassword: string;
  complementaryDocName: string | null;
  // Extracted from bill PDF
  avgMonthlyKwh: number;
  kwhTariff: number;
  consumptionHistory: { month: string; kwh: number; days: number }[];
  // Computed from billing
  monthlyBill: number;
  // Step 7+
  installationNumber: string;
  address: string;
  confirmed: boolean;
  // Step 9
  signed: boolean;
}

export const INITIAL_DATA: OnboardingData = {
  distributor: null,
  name: "",
  email: "",
  phone: "",
  termsAccepted: false,
  otpVerified: false,
  documentType: "cpf",
  document: "",
  fullName: "",
  nationality: "Brasileiro(a)",
  rg: "",
  civilStatus: "",
  profession: "",
  billFileName: null,
  billFileSize: null,
  billPassword: "",
  complementaryDocName: null,
  avgMonthlyKwh: 0,
  kwhTariff: 0,
  consumptionHistory: [],
  monthlyBill: 850,
  installationNumber: "",
  address: "",
  confirmed: false,
  signed: false,
};

export const ONBOARDING_STEPS = [
  { id: 1, path: "/onboarding/distribuidora", label: "Distribuidora" },
  { id: 2, path: "/onboarding/contato", label: "Contato" },
  { id: 3, path: "/onboarding/verificacao", label: "Verificação" },
  { id: 4, path: "/onboarding/documento", label: "Documento" },
  { id: 5, path: "/onboarding/titular", label: "Titular" },
  { id: 6, path: "/onboarding/conta", label: "Conta de luz" },
  { id: 7, path: "/onboarding/confirmacao", label: "Confirmação" },
  { id: 8, path: "/onboarding/aceite", label: "Aceite" },
  { id: 9, path: "/onboarding/termo", label: "Contrato" },
] as const;

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: INITIAL_DATA,
      update: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
      setStep: (step) => set({ currentStep: step }),
      reset: () => set({ currentStep: 1, data: INITIAL_DATA }),
    }),
    {
      name: "esg-onboarding",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const BRAZILIAN_DISTRIBUTORS = [
  "Light",
  "Enel Rio",
  "Enel SP",
  "Enel Ceará",
  "Cemig",
  "Copel",
  "CPFL Paulista",
  "Elektro",
  "EDP São Paulo",
  "EDP Espírito Santo",
  "Energisa MT",
  "Energisa MS",
  "Neoenergia Coelba",
  "Neoenergia Pernambuco",
  "Equatorial Pará",
  "Equatorial Maranhão",
  "Equatorial Piauí",
  "Equatorial Goiás",
] as const;
