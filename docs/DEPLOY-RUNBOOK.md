# Deploy Runbook — Summa Board

Aquest document explica **com arriba el codi a producció** i què passa en cada fase del pipeline.

L’objectiu és evitar confusions entre:
- CI correcta
- deploy real a producció

---

# 1. Flux normal de desenvolupament

Flux estàndard:

branch → PR → merge a main

Quan entra codi a `main`:

1. GitHub Actions executa la CI
2. La CI actual executa:
   - `lint`
   - `ci:smoke` (emuladors Firebase)

Si aquests passos passen, el repositori queda **en estat desplegable**.

Important:

> La CI **no desplega producció directament**.

---

# 2. CI actual

Workflow:

.github/workflows/ci.yml

Executa:

lint
smoke

El `smoke`:

- arrenca emuladors Firebase
- comprova flux mínim de l’aplicació
- valida que l’entorn és consistent

Aquest test utilitza l’experiment:

firebase experiments:enable webframeworks

per poder emular frameworks web amb Firebase CLI.

---

# 3. Deploy a producció

Producció està servida per:

Firebase App Hosting

El deploy real pot produir-se de dues maneres:

### A) Deploy automàtic (recomanat)

Quan Firebase detecta canvi a `main`.

Firebase construeix i publica automàticament.

### B) Deploy manual d’emergència

Workflow:

Deploy Manual Emergency

Utilitzar només si:

- el deploy automàtic no s’ha executat
- o cal forçar una publicació immediata

Aquest workflow requereix el secret:

FIREBASE_SERVICE_ACCOUNT_SUMMA_BOARD

Sense aquest secret el workflow fallarà.

---

# 4. Secrets necessaris

Secrets del repo:

FIREBASE_SERVICE_ACCOUNT_SUMMA_BOARD

Contingut:

JSON complet d’un **service account de Firebase**.

Aquest secret permet:

- autenticació CI
- deploy manual
- accés Firebase CLI

---

# 5. Verificació després d’un canvi

Després de merge a `main`:

1. comprovar CI

GitHub → Actions → CI

2. comprovar producció

https://summareu.app

3. validar funcionalitat modificada

---

# 6. Símptomes habituals

### CI verda però prod no canvia

Possible causa:

- deploy automàtic Firebase no executat

Solució:

- executar `Deploy Manual Emergency`

---

### Smoke falla amb error webframeworks

Error:

Cannot emulate a web framework

Solució:

firebase experiments:enable webframeworks

Aquest fix ja està aplicat a CI.

---

# 7. Regla operativa

`main` sempre ha de complir:

- CI verda
- codi desplegable
- cap hotfix manual directe a producció
