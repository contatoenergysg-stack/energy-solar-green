export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          cpf: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          phone?: string | null;
          cpf?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          phone?: string | null;
          cpf?: string | null;
          created_at?: string;
        };
      };

      onboarding_drafts: {
        Row: {
          id: string;
          session_id: string;
          user_id: string | null;
          data: Json;
          current_step: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          data?: Json;
          current_step?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string | null;
          data?: Json;
          current_step?: number;
          updated_at?: string;
        };
      };

      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          distributor: string;
          installation_number: string | null;
          monthly_bill_brl: number | null;
          discount_percent: number | null;
          status: "pending" | "active" | "cancelled" | "suspended";
          starts_at: string | null;
          contract_signed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          distributor: string;
          installation_number?: string | null;
          monthly_bill_brl?: number | null;
          discount_percent?: number | null;
          status?: "pending" | "active" | "cancelled" | "suspended";
          starts_at?: string | null;
          contract_signed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          distributor?: string;
          installation_number?: string | null;
          monthly_bill_brl?: number | null;
          discount_percent?: number | null;
          status?: "pending" | "active" | "cancelled" | "suspended";
          starts_at?: string | null;
          contract_signed_at?: string | null;
          created_at?: string;
        };
      };

      properties: {
        Row: {
          id: string;
          subscription_id: string | null;
          user_id: string;
          address: string | null;
          titular_name: string | null;
          titular_cpf: string | null;
          titular_rg: string | null;
          titular_civil_status: string | null;
          titular_nationality: string | null;
          titular_profession: string | null;
          energy_bill_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id?: string | null;
          user_id: string;
          address?: string | null;
          titular_name?: string | null;
          titular_cpf?: string | null;
          titular_rg?: string | null;
          titular_civil_status?: string | null;
          titular_nationality?: string | null;
          titular_profession?: string | null;
          energy_bill_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string | null;
          user_id?: string;
          address?: string | null;
          titular_name?: string | null;
          titular_cpf?: string | null;
          titular_rg?: string | null;
          titular_civil_status?: string | null;
          titular_nationality?: string | null;
          titular_profession?: string | null;
          energy_bill_path?: string | null;
          created_at?: string;
        };
      };

      invoices: {
        Row: {
          id: string;
          subscription_id: string;
          reference_month: string;
          kwh_consumed: number | null;
          amount_brl: number | null;
          amount_saved_brl: number | null;
          due_date: string | null;
          paid_at: string | null;
          status: "pending" | "paid" | "overdue";
          pdf_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          reference_month: string;
          kwh_consumed?: number | null;
          amount_brl?: number | null;
          amount_saved_brl?: number | null;
          due_date?: string | null;
          paid_at?: string | null;
          status?: "pending" | "paid" | "overdue";
          pdf_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          reference_month?: string;
          kwh_consumed?: number | null;
          amount_brl?: number | null;
          amount_saved_brl?: number | null;
          due_date?: string | null;
          paid_at?: string | null;
          status?: "pending" | "paid" | "overdue";
          pdf_url?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type OnboardingDraft = Database["public"]["Tables"]["onboarding_drafts"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
