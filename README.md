# Summa Social

**Gestio economica, fiscal i operativa per a entitats del Tercer Sector.**

Summa Social es una aplicacio web multi-organitzacio orientada a entitats petites i mitjanes que necessiten un entorn robust per a moviments bancaris, donants, fiscalitat, justificacio de projectes i suport operatiu.

**Produccio:** [summasocial.app](https://summasocial.app)

## Que resol

- Centralitza la feina economica que moltes entitats reparteixen entre fulls de calcul, carpetes i correus
- Converteix moviments bancaris en una base operativa clara: importable, classificable i reutilitzable
- Gestiona el cicle complet de donacions: cobrament, devolucio, recurrencia, certificat i calcul fiscal
- Aplica IA en punts concrets (lectura de tickets, categoritzacio, preomplert) sense substituir el criteri huma
- Facilita la justificacio economica de projectes i subvencions
- Prepara models fiscals (182, 347), certificats i evidencies documentals

## Moduls principals

- **Tresoreria**: moviments bancaris, multi-compte, importacio, conciliacio
- **Contactes**: donants, proveidors, treballadors — fitxa unica amb historic
- **Donacions**: cobrament, devolucio, recurrencia, fiscalitat, certificats
- **Projectes**: pressupost, despeses, justificacio, exports per financadors
- **Documents**: factures, justificants, lectura automatica, conciliacio
- **Remeses**: quotes, devolucions, SEPA, desglossament d'apunts agrupats
- **Liquidacions**: tickets, quilometratge, reemborsaments
- **Informes**: resums, comparatives, alertes, exports
- **IA**: lectura de tickets/factures, categoritzacio assistida, preomplert
- **Multi-org**: aillament de dades, rols, permisos, invitacions

## Stack

| Capa | Tecnologia |
|------|------------|
| Frontend | Next.js 15 (App Router) + React 18 + TypeScript |
| UI | Tailwind CSS + shadcn/radix |
| Dades | Firestore |
| Auth | Firebase Auth |
| Fitxers | Firebase Storage |
| Hosting | Firebase App Hosting |
| IA | Genkit + Google Gemini, usos puntuals d'OpenAI |
| Exports | XLSX, CSV, jsPDF |
| Serverless | Firebase Functions |

## Execucio local

```bash
npm install
cp .env.local.example .env.local
# Afegir variables Firebase publiques
npm run dev
```

Per defecte arrenca a `http://127.0.0.1:9002`.

Alternatives:
- `npm run dev:turbo` — Turbopack, sense bootstrap blog
- `npm run genkit:dev` — Entorn local de Genkit

## Scripts principals

| Comanda | Que fa |
|---------|--------|
| `npm run dev` | Arrenca el servidor local |
| `npm run build` | Build segur amb neteja de cache |
| `npm run typecheck` | Validacio TypeScript |
| `npm test` | Proves del core |
| `npm run check` | Gate complet: docs + env + types + tests + build |
| `npm run verify:ci` | Guardrails fiscals + coverage + build |

## Workflow de desenvolupament

Basat en worktrees, amb gates forts:

```bash
npm run inicia       # Crea branca codex/* i worktree
# ... implementar dins del worktree ...
npm run acabat       # Valida, commita i puja
npm run integra      # Unica porta d'entrada a main
npm run publica      # Unica porta d'entrada a prod
npm run status       # Font unica d'estat operatiu
```

## Estructura

```
src/
  app/            Rutes Next.js (public + dashboard + api)
  components/     Components UI i de domini
  lib/            Logica de negoci, fiscal, SEPA, blog, suport
  hooks/          Hooks d'organitzacio, permisos, filtres
  i18n/           Locales i traduccions
  services/       Capa fina de serveis client
functions/        Firebase Functions independents
scripts/          QA, deploy, demos, editorial, migracions
docs/             Documentacio d'autoritat, runbooks, contracts
tests/            Proves i checklist manual
```

## Documentacio

Ordre de lectura recomanat:

1. `docs/DEPLOY.md`
2. `docs/GOVERN-DE-CODI-I-DEPLOY.md`
3. `docs/REPO-HIGIENE-I-DIAGNOSTIC.md`
4. `docs/DEV-SOLO-MANUAL.md`
5. `docs/SUMMA-SOCIAL-REFERENCIA-COMPLETA.md`
6. `docs/PATRONS-CODI-OBLIGATORIS.md`

## APIs principals

| Endpoint | Descripcio |
|----------|------------|
| `POST /api/blog/publish` | Publicacio de posts |
| `POST /api/blog/upload-cover` | Upload de portada |
| `POST /api/product-updates/publish` | Novetats de producte |
| `POST /api/support/bot` | Bot intern amb KB |
| `POST /api/ai/categorize-transaction` | Categoritzacio assistida |
| `POST /api/fiscal/model182/generate` | Model 182 |
| `POST /api/fiscal/model347/generate` | Model 347 |
