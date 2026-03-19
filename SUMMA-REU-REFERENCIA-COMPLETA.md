# SUMMA REU - REFERENCIA COMPLETA

> Auditada contra el codi del workspace el **19 de març de 2026** (`Europe/Madrid`).
> Aquest document descriu només comportaments, rutes, models i integracions verificats al repositori `summa-board`.

## 1) Abast verificat

- Aplicació principal amb **Next.js App Router** (`app/`) i lògica de domini a `src/`.
- Persistència amb **Firebase Auth**, **Firestore** i **Firebase Storage**.
- Integracions reals al codi amb **Daily**, **Gemini**, **Stripe** i **Telegram**.
- `functions/src/index.ts` està buit de manera intencional; la lògica funcional principal no viu a Cloud Functions pròpies.

## 2) Superfície de producte implementada

### 2.1 Rutes públiques

- `/`
- `/login`
- `/signup`
- `/p/[slug]`
- `/p/[slug]/results`

### 2.2 Rutes owner

- `/billing`
- `/dashboard`
- `/polls/new`
- `/polls/[pollId]`
- `/owner/meetings/[meetingId]`
- `/meetings/[meetingId]` redirigeix cap a `/owner/meetings/[meetingId]`

### 2.3 Capacitats visibles verificades

- Home pública amb CTA cap a `login` i `signup`.
- Signup autoservei amb creació d’usuari Firebase, creació d’org i obertura de sessió owner.
- Login owner amb formulari HTML contra `POST /api/auth/password-login`.
- Pantalla `/billing` per activar subscripció amb Stripe Checkout.
- Dashboard owner amb votacions actives i reunions passades.
- Creació de votacions amb franges candidates.
- Votació pública sense compte.
- Resultats públics i vista owner de la votació.
- Tancament de votació amb creació de reunió.
- Pantalla owner de reunió amb control de gravació, transcripció, acta, exportacions i esborrat.
- Edició de l’acta en Markdown i export `.md`.
- Export `.ics` de reunió per owner autenticat.
- Monitorització d’errors client i server amb notificació a Telegram.

## 3) Rutes API verificades

### 3.1 Auth

- `POST /api/auth/entity-signup`
- `POST /api/auth/password-login`
- `POST /api/auth/session-login`
- `POST /api/auth/session-logout`

### 3.2 Billing

- `POST /api/billing/create-checkout-session`

### 3.3 Owner

- `POST /api/owner/polls/create`
- `POST /api/owner/close-poll`
- `POST /api/owner/meetings/create`
- `POST /api/owner/meetings/start-recording`
- `POST /api/owner/meetings/stop-recording`
- `POST /api/owner/meetings/delete`
- `POST /api/owner/recordings/register`
- `POST /api/owner/process-recording`
- `POST /api/owner/minutes/update`
- `GET /api/owner/minutes/export`

### 3.4 Públic

- `POST /api/public/vote`
- `GET /api/public/ics`
- `POST /api/public/error-report`

### 3.5 Webhooks

- `POST /api/webhooks/daily/recording-complete`
- `GET /api/webhooks/stripe`
- `POST /api/webhooks/stripe`

### 3.6 Contracte d’accés

- Les mutacions fan comprovació `same-origin`.
- Les rutes owner requereixen sessió owner.
- Les rutes owner que modifiquen negoci requereixen subscripció activa; si no, retornen `402` amb `subscription_required`.
- `GET /api/public/ics` està sota el namespace `public`, però el codi exigeix sessió owner i ownership de la reunió.

## 4) Model funcional verificat

### 4.1 Entitats principals

- `orgs/{orgId}`
- `stripe_events/{eventId}`
- `polls/{pollId}`
- `polls/{pollId}/options/{optionId}`
- `polls/{pollId}/voters/{voterId}`
- `polls/{pollId}/votes/{voterId}`
- `meetings/{meetingId}`
- `meetings/{meetingId}/recordings/{recordingId}`
- `meetings/{meetingId}/transcripts/{transcriptId}`
- `meetings/{meetingId}/minutes/{minutesId}`
- `meeting_ingest_jobs/{jobId}`
- `_rate_limits/{hash}`

### 4.2 Camps rellevants

- `orgs`: `name`, `ownerUid`, `createdAt`, `subscriptionStatus`, `stripeCustomerId`, `stripeSubscriptionId`, `plan`, `recordingLimitMinutes`
- `stripe_events`: `eventId`, `type`, `created`, `orgId`, `subscriptionId`, `receivedAt`, `raw`
- `polls`: `orgId`, `title`, `description`, `timezone`, `slug`, `status`, `winningOptionId`, `createdAt`, `closedAt`, `closeError`
- `meetings`: `orgId`, `title`, `description`, `createdAt`, `createdBy`, `pollId`, `scheduledAt`, `meetingUrl`, `dailyRoomName`, `dailyRoomUrl`, `provisioningStatus`, `provisioningError`, `provisioningAttemptedAt`, `provisioningReadyAt`, `recordingStatus`, `recordingUrl`, `transcript`, `minutesDraft`, `lastWebhookAt`
- `recordings`: `storagePath`, `rawText`, `mimeType`, `originalName`, `status`, `error`, `createdAt`
- `transcripts`: `recordingId`, `status`, `text`, `storagePathTxt`, `createdAt`
- `minutes`: `recordingId`, `status`, `minutesMarkdown`, `minutesJson`, `createdAt`
- `meeting_ingest_jobs`: `meetingId`, `orgId`, `recordingId`, `source`, `status`, `recordingUrl`, `error`, `createdAt`, `updatedAt`

### 4.3 Estats verificats al codi

- `PollStatus`: `open | closing | closed | close_failed`
- `MeetingProvisioningStatus`: `provisioning | usable | provisioning_failed`
- `MeetingRecordingStatus`: `none | recording | stopping | processing | ready | error`
- `RecordingStatus`: `uploaded | processing | done | error`
- `TranscriptStatus`: `pending | processing | done | error`
- `MinutesTaskStatus`: `todo | doing | done`
- `MeetingIngestJobStatus`: `queued | processing | completed | error`

### 4.4 Invariants observables

- L’`orgId` canònic d’una org nova coincideix amb `ownerUid`, però el codi conserva compatibilitat amb orgs legacy cercant també per `ownerUid`.
- Una reunió només es considera usable si `provisioningStatus === "usable"` i `meetingUrl` existeix.
- El vot públic persisteix `tokenHash`; el token raw es retorna al client.
- `meeting_ingest_jobs` usa idempotència per `meetingId + recordingId`.

## 5) Seguretat, sessió i routing

### 5.1 Sessió owner

- La cookie de sessió és `__session`.
- `requireOwnerPage()` redirigeix a `/login` si no hi ha owner.
- `requireOwnerPage()` redirigeix a `/billing` si la subscripció no és `active`.
- `POST /api/auth/session-logout` revoca refresh tokens i esborra la cookie.

### 5.2 Regles Firestore i Storage

- Firestore restringeix accés per ownership d’org, poll i meeting.
- Storage només permet llegir i escriure sota `meetings/{meetingId}/recordings/**` a l’owner de la reunió.
- Tots dos rulesets tenen una regla final `deny all`.

### 5.3 Rate limit verificat

- Signup: `10` intents per `10` minuts per IP.
- Vot públic: `40` intents per `10` minuts per `poll + IP`.
- Error report client: `12` intents per `10` minuts per IP.
- L’emmagatzematge principal és Firestore (`_rate_limits`) amb fallback a memòria si la transacció falla.

### 5.4 Locale i host

- En producció, el middleware redirigeix cap a rutes amb prefix `/ca/...` o `/es/...`.
- En local, les rutes es mantenen sense prefix i el locale viatja per `header` i cookie.
- El middleware pot redirigir del host Firebase cap a `summareu.app`.
- Hi ha control de “no fallback” per evitar castellà incomplet en determinades rutes.

### 5.5 Headers de seguretat

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `Strict-Transport-Security`
- `skipTrailingSlashRedirect: true`

## 6) Fluxos verificats

### 6.1 Signup i accés

1. La persona usuària entra a `/signup`.
2. `EntitySignupForm` crida `POST /api/auth/entity-signup`.
3. El backend crea usuari Firebase Auth i l’org a Firestore.
4. El client fa `signInWithEmailAndPassword`.
5. El client intercanvia `idToken` per cookie server amb `POST /api/auth/session-login`.
6. La UI redirigeix a `/dashboard`.

### 6.2 Billing

1. Una org sense subscripció activa és redirigida a `/billing`.
2. `POST /api/billing/create-checkout-session` crea client Stripe si falta.
3. El backend crea una checkout session de subscripció.
4. L’org passa a `subscriptionStatus = "pending"`.
5. El webhook Stripe actualitza l’org a `active`, `past_due` o `canceled` segons l’event rebut.
6. Els events es registren a `stripe_events`.

### 6.3 Votació

1. L’owner crea una votació a `/polls/new`.
2. El formulari envia `title`, `description`, `timezone` i fins a `20` `optionsIso`.
3. El backend crea `polls/{pollId}` i la subcol·lecció `options`.
4. Els participants voten a `/p/{slug}` via `POST /api/public/vote`.
5. El backend genera o reutilitza `voterToken`, en calcula `tokenHash` i desa votant + vot.
6. La vista owner a `/polls/[pollId]` mostra resultats, estat i enllaços públics.

### 6.4 Tancament de votació i creació de reunió

1. `POST /api/owner/close-poll` valida ownership i subscripció.
2. Una transacció posa la votació a `closing`, valida l’opció guanyadora i crea o reutilitza el document `meetings/{meetingId}`.
3. El document de reunió es crea abans d’intentar provisionar Daily.
4. `createMeetingWithDaily()` intenta crear la room i actualitza `meetingUrl`, `dailyRoomName`, `dailyRoomUrl` i `provisioningStatus`.
5. Si la provision és correcta, la votació passa a `closed`.
6. Si la provision falla, la votació passa a `close_failed` i desa `closeError`.

### 6.5 Reunió owner

- `/owner/meetings/[meetingId]` només mostra reunions de l’org activa i només si la reunió és usable.
- La UI obre la reunió amb `window.open(meetingUrl, "_blank", "noopener,noreferrer")`.
- La pantalla mostra estat de gravació, transcripció, acta, errors de processament i botó d’eliminació.
- `MeetingLiveRefresh` refresca la pàgina cada `5` segons quan `recordingStatus === "processing"`.

### 6.6 Gravació amb Daily i ingestió per webhook

1. `POST /api/owner/meetings/start-recording` exigeix reunió usable i estat `none`, `ready` o `error`.
2. En iniciar gravació, el backend neteja `transcript` i `minutesDraft` i posa `recordingStatus = "recording"`.
3. `POST /api/owner/meetings/stop-recording` exigeix estat `recording`.
4. Si Daily atura correctament la gravació, el backend posa `recordingStatus = "processing"`.
5. `POST /api/webhooks/daily/recording-complete` accepta només events de gravació completada.
6. El webhook resol la reunió a partir de la `meetingUrl`, desa `recordingUrl`, posa `recordingStatus = "processing"` i crea `meeting_ingest_jobs/{jobId}` de manera idempotent.
7. El job es reclama, es processa i després passa a `completed` o `error`.

### 6.7 Processament de `meeting_ingest_job`

- El flux viu a `src/lib/jobs/processMeetingIngestJob.ts`.
- Si `MEETING_INGEST_MOCK_MODE=true`, genera transcript i acta de prova.
- Si no hi ha `GEMINI_API_KEY`, el job falla.
- Si la descàrrega falla o la gravació supera `7 MB` inline, el job falla.
- En mode real, el backend descarrega el fitxer, en fa transcripció amb Gemini i genera l’acta.
- En completar, desa `transcripts/{recordingId}`, `minutes/{recordingId}` i actualitza `meeting.transcript`, `meeting.minutesDraft` i `meeting.recordingStatus = "ready"`.
- En error, el webhook posa `meeting.recordingStatus = "error"` i actualitza el job amb l’error.

### 6.8 Camí manual de gravació

- Existeix backend per registrar una gravació manual amb `POST /api/owner/recordings/register`.
- Existeix backend per processar-la amb `POST /api/owner/process-recording`.
- `processRecordingTask()` pot treballar des de `rawText` o des d’un fitxer a Storage.
- Aquest camí pot acabar en mode `stub` o `real`.
- El component reutilitzable `src/components/meetings/recording-uploader.tsx` existeix al codi, però no hi ha cap ruta actual que el munti.

### 6.9 Exportacions i esborrat

- `GET /api/owner/minutes/export?meetingId=...` exporta el Markdown de l’acta.
- `GET /api/public/ics?meetingId=...` construeix un `.ics` per a la reunió de l’owner autenticat.
- `POST /api/owner/meetings/delete` pot eliminar reunió, votació o totes dues.
- Si hi ha acta generada, el backend exigeix `confirmDeleteGeneratedMinutes`.
- L’eliminació esborra subcol·leccions de la reunió, `meeting_ingest_jobs` i el prefix `meetings/{meetingId}/` a Storage.

## 7) Observabilitat

- `instrumentation.ts` registra gestors per `unhandledRejection` i `uncaughtException`.
- `ErrorMonitor` envia errors client a `POST /api/public/error-report`.
- Els errors inesperats d’API, server i client es poden reenviar a Telegram.
- La deduplicació de Telegram és temporal i basada en procés.

## 8) Estructura del codi

- `app/`: pàgines i API routes.
- `src/components/`: components de UI i formularis.
- `src/lib/db/`: tipus i repositori Firestore.
- `src/lib/meetings/`: control Daily i processament de reunions.
- `src/lib/gemini/`: client i selecció de model.
- `src/lib/billing/`: integració Stripe.
- `src/lib/monitoring/`: reporting i Telegram.
- `src/i18n/`: routing, diccionaris i cobertura.
- `scripts/`: bootstrap, smoke, seed i utilitats operatives.
- `functions/`: codebase separada sense lògica funcional pròpia activa.

## 9) Scripts i workflows verificats

### 9.1 `package.json`

- `dev`
- `dev:preview`
- `build`
- `start`
- `lint`
- `i18n:check-es`
- `ci:smoke`
- `emu`
- `seed`
- `test:smoke`
- `test:permissions`
- `test:telegram`
- `monitor:login`
- `bootstrap:firebase`
- `test:close-poll`

### 9.2 GitHub Actions

- `CI`: `lint` i `ci:smoke`
- `Deploy Manual Emergency`: `lint`, `ci:smoke` i `firebase deploy --only hosting`
- `Prod Mirror Sync`: sincronització cap a branca mirror

## 10) Decisions tècniques observables

- El backend funcional principal viu dins Next API routes.
- Firestore és la font principal de veritat per orgs, votacions, reunions i jobs d’ingestió.
- Els vots públics no escriuen directament a Firestore des del client.
- La sessió owner es resol al servidor a partir de `__session`.
- La reunió no té capa pròpia de videoconferència; la implementació actual depèn de Daily.
- Hi ha dos camins de processament de gravació al codi:
  - webhook Daily + `meeting_ingest_job`
  - registre manual + `processRecordingTask`

## 11) Principi de manteniment

Si hi ha conflicte entre aquest document i el codi, preval el codi i aquest document s’ha de tornar a auditar.
