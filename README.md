# Summa Reu

MVP local-first per coordinar votacions tipus Doodle i generar actes de reunió per entitats socials.

## Estat de producció

- Onboarding públic amb Stripe operatiu a `summareu.app`
- Blocker de build antiga resolt al commit `151c9473` (`fix(billing): restore public checkout routes`)
- Flux de reunions Daily estabilitzat amb:
  - `043f33ca` (`meetings: return unified meeting creation shape`)
  - `5ee58d95` (`meetings: remove firestore composite index dependency in getMeetingById`)
  - `56af8ae9` (`meetings(recording): improve recording observability`)
  - `76516339` (`meeting(owner): afegeix esborrat de reunions`)
- Validació real confirmada amb:
  - org `FnNsMxFscHfOyt2oxhTPi3uUQD22`
  - `subscriptionStatus = active`
  - `stripeSubscriptionId = sub_1T8hIy1w5oTdm9u8IBZeBPjW`
  - `stripe_events/evt_1T8hJ81w5oTdm9u8pvhPgF6r`
  - `type = checkout.session.completed`

## Stack

- Next.js App Router + TypeScript
- Firebase Auth / Firestore / Storage
- Firebase Emulators
- Cloud Functions v2 (skeleton)
- Gemini API (REAL mode opcional)

## Variables d'entorn

Copia `.env.example` a `.env.local` si cal personalitzar.

Variables importants:

- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=summa-board`
- `FIREBASE_PROJECT_ID=summa-board`
- `GEMINI_API_KEY=` (buit = STUB mode)
- `GEMINI_MODEL=` (opcional override)
- `TELEGRAM_BOT_TOKEN=` (obligatori per alertes)
- `TELEGRAM_CHAT_ID=68198321`
- `FORCE_CANONICAL_REDIRECT=true` (posa `false` només si necessites desactivar redirecció canònica temporalment)
- `STRIPE_SECRET_KEY=`
- `STRIPE_WEBHOOK_SECRET=`
- `STRIPE_PRICE_ID=`
- `STRIPE_SUCCESS_URL=https://summareu.app/dashboard`
- `STRIPE_CANCEL_URL=https://summareu.app/signup`
- `STRIPE_BILLING_RETURN_URL=https://summareu.app/billing`
- `DAILY_WEBHOOK_BEARER_TOKEN=` (recomanat en producció)

## Execució local

1. Bootstrap config Firebase:

```bash
npm run bootstrap:firebase
```

2. Arrencar app + emuladors:

```bash
npm run emu
```

3. Seed de dades demo (en una altra terminal):

```bash
npm run seed
```

4. Smoke test (amb app en marxa):

```bash
npm run test:smoke
```

5. Monitor de login en bucle (opcional):

```bash
npm run monitor:login
```

## CI/CD (professional)

El repo inclou dos workflows de GitHub Actions:

- `CI` (`.github/workflows/ci.yml`): `lint` + `smoke` amb emuladors (obligatori per PR i per `main`).
- `Deploy Manual Emergency` (`.github/workflows/deploy.yml`): torna a executar `lint` + `smoke`, desplega amb `.env` sanejat i reaplica el runtime segur de producció només quan es llança manualment.

El deploy automàtic de producció es fa des de Firebase App Hosting (backend connectat al repositori GitHub) quan entra codi a `main`.

### Secrets necessaris a GitHub

- `FIREBASE_SERVICE_ACCOUNT_SUMMA_BOARD`: JSON complet del service account amb permisos de deploy al projecte `summa-board`.
- `DAILY_DOMAIN`
- `STRIPE_PRICE_ID`
- `TELEGRAM_CHAT_ID`
- `DAILY_API_KEY`
- `GEMINI_API_KEY` (opcional si vols mode REAL)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `DAILY_WEBHOOK_BEARER_TOKEN`
- `TELEGRAM_BOT_TOKEN`

### Mirror automàtic de prod (segur i separat)

S'ha afegit el workflow `.github/workflows/prod-mirror-sync.yml` per mantenir un mirror unidireccional:

- Origen: repo de prod (només lectura).
- Destí: aquest repo, per defecte a la branca `mirror/prod`.
- Freqüència: cada hora + execució manual (`workflow_dispatch`).

Configuració necessària:

1. Secrets del repo mirror:
   - `PROD_SOURCE_REPO_SSH`: URL SSH del repo de prod (`git@github.com:org/repo-prod.git`).
   - `PROD_SOURCE_READONLY_SSH_KEY`: clau privada SSH del bot amb accés **read-only** al repo de prod.
   - `PROD_MIRROR_PUSH_TOKEN`: PAT o token d'app per fer push al repo mirror amb permís de contingut i `workflow` (necessari si el mirror actualitza `.github/workflows/*`).
   - `MIRROR_TELEGRAM_BOT_TOKEN` (opcional): token del bot de Telegram per alertes de mirror.
   - `MIRROR_TELEGRAM_CHAT_ID` (opcional): chat on enviar alertes de mirror.
2. Variables opcionals del repo mirror:
   - `PROD_SOURCE_BRANCH` (default: `main`).
   - `PROD_MIRROR_TARGET_BRANCH` (default: `mirror/prod`).
   - `MIRROR_NOTIFY_SUCCESS` (default: buit/false): si és `true`, envia avís d'OK en execució manual.

Mesures de seguretat aplicades:

- No s'utilitza cap credencial de prod.
- El bot només llegeix prod; no hi ha cap push cap a prod.
- El script bloqueja fer mirror a `main` si no s'activa explícitament `ALLOW_TARGET_MAIN=true`.
- Es valida `known_hosts` via `ssh-keyscan` i `StrictHostKeyChecking=yes`.
- Es bloqueja la sincronització si origen i destí són el mateix repo.
- Les alertes Telegram del mirror van amb secrets dedicats `MIRROR_*` (aïllament respecte monitorització de producció).

Setup assistit amb GitHub CLI (opcional):

```bash
export PROD_SOURCE_REPO_SSH="git@github.com:org/repo-prod.git"
export PROD_SOURCE_READONLY_SSH_KEY="$(cat ~/.ssh/summa_mirror_prod_ro)"
export PROD_MIRROR_PUSH_TOKEN="ghp_xxx_o_token_d_app_amb_workflow_write"
export PROD_SOURCE_BRANCH="main"
export PROD_MIRROR_TARGET_BRANCH="mirror/prod"
export MIRROR_NOTIFY_SUCCESS="false"
# opcionals per Telegram
export MIRROR_TELEGRAM_BOT_TOKEN="..."
export MIRROR_TELEGRAM_CHAT_ID="..."

./scripts/setup-mirror-github-secrets.sh
```

### Política recomanada de branca

Configura `main` a GitHub amb:

1. PR obligatori (sense pushes directes).
2. Required checks: `CI / lint` i `CI / smoke`.
3. Environment `production` amb aprovació manual (required reviewers) per al workflow d'emergència.

## Deploy manual (només emergència)

La configuració usa framework backend per Next.js (regió `europe-west1`).

```bash
npm run deploy:prod:safe
```

Aquest deploy segur:

- crea un `.env` temporal mínim perquè el backend de frameworks no pugi secrets locals com a variables planes;
- fa el deploy de Hosting/App Hosting;
- restaura l'entorn local original;
- reaplica variables i secrets obligatoris al servei `ssrsummaboard`;
- valida que el runtime i les rutes públiques crítiques responguin correctament.

## Credencials demo seed

- Email: `owner@summa.local`
- Password: `123456`

## Secrets en lloc segur (macOS Keychain)

Guarda secrets fora del repo:

```bash
scripts/secrets-keychain.sh set GEMINI_API_KEY "xxxx"
scripts/secrets-keychain.sh set TELEGRAM_BOT_TOKEN "xxxx"
scripts/secrets-keychain.sh set TELEGRAM_CHAT_ID "68198321"
scripts/secrets-keychain.sh set FIREBASE_CLIENT_EMAIL "service-account@project.iam.gserviceaccount.com"
scripts/secrets-keychain.sh set FIREBASE_PRIVATE_KEY "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
scripts/secrets-keychain.sh set FIREBASE_PRIVATE_KEY_ID "xxxx"
```

Genera `.env.local` des de Keychain:

```bash
scripts/secrets-keychain.sh write-env
```

Consultar un secret:

```bash
scripts/secrets-keychain.sh get GEMINI_API_KEY
```

## Rutes

Públiques:

- `/p/[slug]`
- `/p/[slug]/results`

Owner:

- `/login`
- `/forgot-password`
- `/verify-email`
- `/signup`
- `/billing`
- `/dashboard`
- `/privacy`
- `/terms`
- `/polls/new`
- `/polls/[pollId]`
- `/owner/meetings/[meetingId]`
- `/meetings/[meetingId]` (redirect localitzat cap a owner)

## Meeting creation flow

- The meeting is always created.
- Daily room creation is attempted after persistence.
- Meeting detail supports start/stop recording, ingest polling, minutes export and deletion with cascade cleanup.
- API always returns:

```ts
{
  meetingId,
  meetingUrl,
  dailyRoomUrl,
  dailyRoomName,
}
```

## Notes MVP

- Les escriptures públiques de vots entren només via `/api/public/vote`.
- El token de votant només es guarda raw a `localStorage`; al servidor només hash.
- Les votacions admeten un màxim de 20 franges.
- Pipeline premium:
  - Sense `GEMINI_API_KEY`: STUB
  - Amb `GEMINI_API_KEY`: intent REAL (Gemini); fallback STUB si falla.
- El processament de gravacions es posa en cua (response `202`) i la pantalla de reunió s'actualitza automàticament.
- Monitorització d'errors:
  - `instrumentation.ts` captura errors de servidor no controlats.
  - `/api/public/error-report` rep errors de navegador.
  - Les alertes s'envien a Telegram amb missatge humà que comença per `Summa-Board`.

## Proves de producció recomanades

1. Validar permisos Firebase (client públic sense escriptura):

```bash
npm run test:permissions
```

2. Validar canal Telegram:

```bash
npm run test:telegram
```

## Checklist postobertura

- Revisar noves `orgs/*` creades a Firestore
- Revisar `subscriptionStatus` de les noves entitats
- Revisar `stripe_events` i confirmar `checkout.session.completed`
- Revisar si apareixen `pending` anòmals o sessions Stripe `open/unpaid`
- Revisar errors SSR i webhook a logs/alertes Telegram
