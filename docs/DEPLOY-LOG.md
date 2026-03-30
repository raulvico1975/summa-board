### Idle session logout

Sessio tancada automaticament despres de 30 min d'inactivitat.

Comportament:
- Avis als 25 minuts
- Modal amb opcio "Continuar sessio"
- Logout real via POST /api/auth/session-logout
- Sessio persistent si hi ha activitat
- No logout en tancar pestanya o navegador

2026-03-11
UX meeting control panel redesign merged to main.
Clarifies recording requires active participants in Daily.
No backend changes.

2026-03-14
Manual production deploy restored and validated for summa-board.
Service account used: github-deploy-manual@summa-board.iam.gserviceaccount.com
Secret updated: FIREBASE_SERVICE_ACCOUNT_SUMMA_BOARD
Roles assigned:
- roles/firebase.admin
- roles/cloudfunctions.admin
- roles/cloudbuild.builds.editor
- roles/iam.serviceAccountUser
- roles/serviceusage.serviceUsageConsumer
Project APIs enabled during restore:
- cloudbuild.googleapis.com
- cloudfunctions.googleapis.com
- artifactregistry.googleapis.com
- runtimeconfig.googleapis.com
- cloudbilling.googleapis.com
GitHub Actions runs:
- 23085424735 failed: Cloud Build API not enabled
- 23085475301 failed: missing serviceusage.services.use on runtimeconfig/artifactregistry
- 23085522567 failed: Cloud Billing API disabled
- 23085620119 succeeded: Deploy Manual Emergency on main
Validation:
- SSR function active: ssrsummaboard (europe-west1), updated 2026-03-14T10:00:20Z
- summareu.app responds 307 -> /ca and 200 on /ca after deploy
- hosted backend responds at https://summa-board--summa-board.europe-west4.hosted.app

2026-03-17
PR #7 merged to main.
Commit: 85d85eb7e9b194e0108df6cca867fe7277fbce0d
Manual validation completed on merged main flow:
- recording -> stopping -> processing -> ready
- no regressions detected
Pending only:
- controlled production deploy

2026-03-17
PR #9 merged to main.
Deployed SHA: 755b5b52da892f8462e393c9f5ab5879217a2c3a
Phase 1 contract validated in production on the real success path:
- close-poll created a usable meeting
- meetingUrl was present
- meeting URL host was summareu.daily.co
- owner UI showed "Entrar a la reunió"
Operational issue discovered and resolved:
- production runtime was missing DAILY_API_KEY and DAILY_DOMAIN
- runtime error category was CONFIG_MISSING
- configuration applied directly to runtime service ssrsummaboard
Current status:
- phase 1 functionally validated and closed
- pending only: consolidate Daily config in the stable App Hosting configuration layer so future rollouts do not lose it

2026-03-26
Public release hardening deployed to production.
Application changes included:
- forgot-password flow for entity owners
- billing self-service entry to Stripe portal
- privacy and terms pages linked from the public shell
- CI extended with build + repository tests + emulator smoke
- smoke seed aligned with the close-poll contract
Production deploy:
- `firebase deploy --project summa-board --only hosting --non-interactive`
- site `summareu.app` validated with `307 -> /ca` and `200` on public routes
- public checks passed for `/forgot-password` and `/privacy`
Runtime service:
- Cloud Run service `ssrsummaboard` updated after deploy
- latest ready revision: `ssrsummaboard-00069-7cn`
- restored runtime env: `DAILY_DOMAIN`, `STRIPE_PRICE_ID`, `TELEGRAM_CHAT_ID`
- restored runtime secrets: `DAILY_API_KEY`, `DAILY_WEBHOOK_BEARER_TOKEN`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TELEGRAM_BOT_TOKEN`
Operational note:
- manual local deploy must not push secret-bearing `.env` values as plain env vars into the frameworks backend; use a sanitized deploy env and keep production secrets bound at runtime

2026-03-26
Controlled opening hardening deployed to production.
Application changes included:
- owner signup no longer opens an authenticated session immediately
- owner accounts now require email verification before login/session activation
- new public route `/verify-email` to resend verification emails
- owner login now applies server-side rate limiting
- Daily webhook auth now fails closed in production when the bearer token is missing
- emulator smoke updated so newly created demo owners are marked as verified before session creation
Validation:
- `npm run lint`
- `npm run test:repo`
- `npm run ci:smoke`
- `npm run build`
- public routes validated on `summareu.app`: `/login`, `/verify-email`
Runtime service:
- latest ready revision: `ssrsummaboard-00074-fzt`
- runtime env/secrets restored after deploy: `DAILY_DOMAIN`, `STRIPE_PRICE_ID`, `TELEGRAM_CHAT_ID`, `DAILY_API_KEY`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DAILY_WEBHOOK_BEARER_TOKEN`, `TELEGRAM_BOT_TOKEN`

2026-03-26
Near-general-opening operational hardening completed.
Operational changes included:
- new script `scripts/deploy-production-safe.sh`
- production deploy now runs with sanitized `.env`
- runtime env/secrets for `ssrsummaboard` are reapplied automatically after deploy
- production deploy verifies required runtime keys and public routes `/`, `/login`, `/verify-email`
- GitHub emergency deploy workflow updated to use the safe deploy command and explicit runtime secrets
- Keychain helper extended with the production keys required for safe deploys
Validation:
- `bash -n scripts/deploy-production-safe.sh`
- `npm run test:repo`
- `npm run build`
- `npm run deploy:prod:safe`
Runtime service:
- latest ready revision: `ssrsummaboard-00076-cz2`

2026-03-26
Controlled-to-near-general opening package deployed to production.
Application changes included:
- durable meeting ingest queue semantics with lease, retry metadata and owner-triggered recovery
- new owner operations center at `/ops` with queue drain and per-job retry actions
- owner mutation rate limits extended to poll, billing and recording operations
- manual recording guardrails for oversized files and oversized raw text
- signup now records owner contact data plus privacy/terms acceptance
- public home, privacy and terms surfaces expanded for clearer commercial/legal positioning
- meeting UI now reminds owners to inform participants before recording
Validation:
- `npm run lint`
- `npm run i18n:check-es`
- `npm run test:repo`
- `npm run ci:smoke`
- `npm run build`
- `npm run deploy:prod:safe`
- public routes validated on `summareu.app`: `/`, `/privacy`, `/terms`, `/verify-email`
Runtime service:
- latest ready revision: `ssrsummaboard-00078-tjt`

2026-03-27
UX hardening for the real convocation flow deployed to production.
Application changes included:
- the owner flow now talks about "convocar reunió / convocar reunión" instead of exposing the first step only as a poll
- the new meeting setup page explains the full sequence from proposing dates to closing the convocation
- closed poll management now surfaces the final convocation materials once a meeting exists
- owner meeting pages now expose the meeting link, a copyable invitation message and the ICS download in a dedicated final convocation block
- regression coverage added for the convocation UX surfaces
Validation:
- `npm run i18n:check-es`
- `npm run test:repo`
- `npm run build`
- `npm run lint`
- `npm run ci:smoke`
- `npm run deploy:prod:safe`
- public routes validated on `summareu.app`: `/`, `/privacy`, `/terms`, `/verify-email`
Runtime service:
- latest ready revision: `ssrsummaboard-00080-tlr`

2026-03-27
Contextual in-product help deployed to production.
Application changes included:
- new global contextual help entry point available from every screen through a persistent help button
- route-aware help articles for the main entity-owner flow: access, signup, billing, dashboard, convocation, poll management, meeting execution and operations
- public help coverage for participant voting and public results pages
- help content focused on "what you are seeing", "what to do now" and "what happens next" so the product is more autonomous without human support
Validation:
- `npm run lint`
- `npm run test:repo`
- `npm run build`
- `npm run ci:smoke`
- visual browser check on local `/ca/login` with the help panel open
- public routes validated on `summareu.app`: `/`, `/login`, `/signup`
- public HTML check on `summareu.app/login` confirmed `Obrir ajuda contextual`
Runtime service:
- latest ready revision: `ssrsummaboard-00082-69x`

2026-03-27
Professionalized email verification flow deployed to production.
Application changes included:
- new server-side Firebase Auth REST helper for password sign-in and verification-email dispatch, with emulator support
- new `/api/auth/request-email-verification` route with same-origin checks, rate limits and owner-account validation
- signup now requests the first verification email through the controlled backend flow instead of relying on a client-side technical login
- manual verification resend now uses the same backend route instead of temporary client auth state
- login now shows a positive post-verification message when the verification handler returns to `?verified=1`
Validation:
- `npm run lint`
- `npm run test:repo`
- `npm run build`
- `npm run ci:smoke`
- `npm run deploy:prod:safe`
- public routes validated on `summareu.app`: `/login`, `/verify-email`
- public HTML check on `summareu.app/login?verified=1` confirmed `Correu verificat. Ja pots entrar a l'entitat.`
Runtime service:
- latest ready revision: `ssrsummaboard-00084-4kb`

2026-03-27
Login verification UX hardening deployed to production.
Application changes included:
- unverified owner login now retries the verification email automatically on the server using the same valid credentials that were just submitted
- login now shows a prominent verification banner with the attempted email and a clear path to the verification screen instead of failing silently
- login preserves the attempted email so the user does not have to type it again
- `/verify-email` now explains that the automatic resend already happens from the login attempt and prefills the email for the manual fallback
- shared continue-url helper extracted for verification mail flows
Validation:
- `npm run lint`
- `npm run test:repo`
- `npm run build`
- `npm run ci:smoke`
- `npm run deploy:prod:safe`
- public HTML check on `summareu.app/login?error=verify_email&resent=1&email=prova%40summa.app` confirmed `Cal verificar el correu abans d'entrar` and `Hem reenviat automàticament un correu de verificació a prova@summa.app`
- public HTML check on `summareu.app/verify-email?email=prova%40summa.app` confirmed the explanatory copy and the prefilled email field
Runtime service:
- latest ready revision: `ssrsummaboard-00086-p56`
