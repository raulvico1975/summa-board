# Multi-producte: Sumarreu + Actium

## Model recomanat

- Un únic repo i un únic motor funcional.
- Dos productes lògics: `summareu` i `actium`.
- Dos projectes Firebase separats.
- Dos backends d'App Hosting separats.
- Dos dominis separats.
- Stripe i Daily separats per producte sempre que vulguem marca i operativa independents.

## Per què així

- Evitem duplicar codi, bugs i fixes.
- Conservem Sumarreu com a eina percebuda com a pròpia per entitats.
- Actium pot créixer amb marca, copy, billing i domini independents.
- Les funcionalitats es poden activar per producte des de la capa `productConfig`.

## Inputs que faltaran per crear Actium del tot

- `PROJECT_ID` final de Firebase.
- `DISPLAY_NAME` del projecte.
- `CANONICAL_HOST` del domini.
- `BILLING_ACCOUNT_ID` de Google Cloud per activar Blaze/App Hosting.
- `DAILY_DOMAIN` per a la sala de reunions.
- Secrets de Stripe, Daily, Gemini i Telegram si els volem operatius des del primer dia.

## Bootstrap tècnic

Exemple:

```bash
PRODUCT_ID=actium \
PROJECT_ID=actium-prod \
DISPLAY_NAME=Actium \
CANONICAL_HOST=actiumapp.com \
APP_HOSTING_BACKEND_ID=actium \
PRIMARY_REGION=europe-west4 \
DAILY_DOMAIN=actium \
bash scripts/bootstrap-product-firebase.sh
```

Aquest script:

- crea el projecte Firebase si no existeix;
- crea la web app Firebase si no existeix;
- crea el backend d'App Hosting si no existeix;
- descarrega la configuració SDK;
- genera un fitxer `.env` base a `output/firebase/<product>.env.generated`.

## Domini i DNS

Quan tinguem el domini:

- jo et diré exactament quin backend/domini hem d'associar;
- Firebase App Hosting ens donarà els registres DNS a configurar;
- si em passes el proveïdor o accés tècnic, ho configurarem allà;
- si no, et podré donar els valors exactes per copiar.

Nota important:

- en el CLI actual sí que podem crear projectes, apps i backends;
- el pas de custom domain d'App Hosting continua sent, en la pràctica, més còmode des del panell de Firebase.

## Fitxers clau

- Configuració de producte: `src/lib/product/config.ts`
- Branding i adaptació de copy: `src/lib/product/branding.ts`
- Landing específica per producte: `src/lib/product/home.ts`
- Bootstrap d'infra: `scripts/bootstrap-product-firebase.sh`

## Estratègia de rollout

1. Mantenir `summareu` en producció sense canviar-li el motor.
2. Crear `actium` com a projecte separat.
3. Connectar el mateix repo a un backend nou d'App Hosting per Actium.
4. Desplegar amb `PRODUCT_ID=actium`.
5. Activar o amagar funcionalitats per producte segons convingui.
