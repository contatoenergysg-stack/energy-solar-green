# Energy Solar Green (ESG)

Site institucional + onboarding de adesão à geração compartilhada.

## Stack

- **Next.js 15** (App Router, Turbopack, TypeScript)
- **Tailwind CSS v4** com design tokens em OKLCH
- **GSAP** (hero timeline) + **Framer Motion** (microinterações)
- **Zustand** com persist (state do onboarding)
- **Supabase** (client placeholder, plug-and-play para a futura área do cliente)
- **react-hook-form + zod** disponíveis
- **react-dropzone** (upload da conta de luz)

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # produção
```

## Design system

- **Fontes**: Lexend (display), Noto Serif (body), Public Sans (labels)
- **Cores**: primary `#BDF23D` · secondary `#26340E` · tertiary `#F9FFF1` · neutral `#121909`
- **Identidade**: editorial / refined minimal, acento verde lima em uso raro (60-30-10)

## Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Landing (hero, calculadora, impacto, benefícios, FAQ) |
| `/onboarding/distribuidora` → `/onboarding/termo` | Fluxo de 9 passos |
| `/onboarding/sucesso` | Conclusão |
| `/dashboard` | Placeholder para área do cliente |

## Calculadora de economia

| Conta mensal | Desconto |
| --- | --- |
| ≤ R$ 800 | 10% |
| R$ 800 – R$ 1.500 | 15% |
| > R$ 1.500 | 20% |

Lógica em [`lib/utils.ts`](lib/utils.ts) (`calculateSavings`, `getDiscountPercent`).

## Onboarding

O state do onboarding é persistido em `localStorage` via Zustand (`lib/onboarding-store.ts`). Para ligar ao Supabase, configure as envs e use `getSupabase()`.

Schema sugerido comentado em `lib/supabase.ts`: `users`, `subscriptions`, `invoices`, `properties`, `onboarding_drafts`.
