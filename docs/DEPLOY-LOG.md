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
