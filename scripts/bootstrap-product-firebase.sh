#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

firebase_cmd=(npx -y firebase-tools@latest)

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Falta la comanda requerida: $command_name" >&2
    exit 1
  fi
}

require_value() {
  local key="$1"
  local value="${!key:-}"
  if [[ -z "$value" ]]; then
    echo "Falta la variable requerida: $key" >&2
    exit 1
  fi
}

json_read() {
  local expression="$1"
  node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(0,'utf8')); const value=(${expression}); if (value === undefined || value === null) process.exit(1); if (typeof value === 'object') { process.stdout.write(JSON.stringify(value)); } else { process.stdout.write(String(value)); }"
}

require_command "node"
require_command "gcloud"

if ! "${firebase_cmd[@]}" login:list >/dev/null 2>&1; then
  echo "Autenticació Firebase requerida. Executa exactament:" >&2
  echo "npx -y firebase-tools@latest login" >&2
  exit 1
fi

PRODUCT_ID="${PRODUCT_ID:-}"
PROJECT_ID="${PROJECT_ID:-}"
DISPLAY_NAME="${DISPLAY_NAME:-}"
BILLING_ACCOUNT_ID="${BILLING_ACCOUNT_ID:-}"
APP_HOSTING_BACKEND_ID="${APP_HOSTING_BACKEND_ID:-$PROJECT_ID}"
PRIMARY_REGION="${PRIMARY_REGION:-europe-west4}"
WEB_APP_DISPLAY_NAME="${WEB_APP_DISPLAY_NAME:-${DISPLAY_NAME} Web}"
CANONICAL_HOST="${CANONICAL_HOST:-}"
DAILY_DOMAIN="${DAILY_DOMAIN:-}"
ENV_OUTPUT_PATH="${ENV_OUTPUT_PATH:-$ROOT_DIR/output/firebase/${PRODUCT_ID:-product}.env.generated}"

require_value "PRODUCT_ID"
require_value "PROJECT_ID"
require_value "DISPLAY_NAME"
require_value "CANONICAL_HOST"

mkdir -p "$(dirname "$ENV_OUTPUT_PATH")"

projects_json="$("${firebase_cmd[@]}" projects:list --json)"
project_exists="$(
  printf '%s' "$projects_json" | node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(0,'utf8')); const projectId=process.argv[1]; process.stdout.write(String(Array.isArray(data.result) && data.result.some((item) => item.projectId === projectId)));" "$PROJECT_ID"
)"

if [[ "$project_exists" != "true" ]]; then
  echo "Creant projecte Firebase $PROJECT_ID..."
  "${firebase_cmd[@]}" projects:create "$PROJECT_ID" -n "$DISPLAY_NAME" >/dev/null
else
  echo "El projecte $PROJECT_ID ja existeix."
fi

if [[ -n "$BILLING_ACCOUNT_ID" ]]; then
  echo "Enllaçant billing account a $PROJECT_ID..."
  gcloud beta billing projects link "$PROJECT_ID" --billing-account "$BILLING_ACCOUNT_ID" >/dev/null
fi

apps_json="$("${firebase_cmd[@]}" apps:list WEB --project "$PROJECT_ID" --json)"
app_id="$(
  printf '%s' "$apps_json" | json_read "(Array.isArray(data.result) ? data.result.find((item) => item.state === 'ACTIVE') : null)?.appId ?? ''" || true
)"

if [[ -z "$app_id" ]]; then
  echo "Creant web app Firebase..."
  create_app_json="$("${firebase_cmd[@]}" --json apps:create WEB "$WEB_APP_DISPLAY_NAME" --project "$PROJECT_ID")"
  app_id="$(
    printf '%s' "$create_app_json" | json_read "data.result?.appId ?? data.appId ?? ''" || true
  )"
fi

if [[ -z "$app_id" ]]; then
  echo "No s'ha pogut resoldre l'appId de la web app." >&2
  exit 1
fi

sdk_config_json="$("${firebase_cmd[@]}" apps:sdkconfig WEB "$app_id" --project "$PROJECT_ID")"

storage_bucket="$(
  printf '%s' "$sdk_config_json" | json_read "data.storageBucket"
)"
api_key="$(
  printf '%s' "$sdk_config_json" | json_read "data.apiKey"
)"
auth_domain="$(
  printf '%s' "$sdk_config_json" | json_read "data.authDomain"
)"
resolved_app_id="$(
  printf '%s' "$sdk_config_json" | json_read "data.appId"
)"

backend_json="$("${firebase_cmd[@]}" apphosting:backends:get "$APP_HOSTING_BACKEND_ID" --project "$PROJECT_ID" --json 2>/dev/null || true)"
backend_name="$(
  printf '%s' "$backend_json" | json_read "data.result?.name ?? ''" || true
)"

if [[ -z "$backend_name" ]]; then
  echo "Creant backend d'App Hosting $APP_HOSTING_BACKEND_ID..."
  "${firebase_cmd[@]}" --non-interactive apphosting:backends:create \
    --project "$PROJECT_ID" \
    --backend "$APP_HOSTING_BACKEND_ID" \
    --app "$app_id" \
    --primary-region "$PRIMARY_REGION" \
    --root-dir / >/dev/null
else
  echo "El backend d'App Hosting $APP_HOSTING_BACKEND_ID ja existeix."
fi

cat > "$ENV_OUTPUT_PATH" <<EOF
# Producte
PRODUCT_ID=$PRODUCT_ID
NEXT_PUBLIC_PRODUCT_ID=$PRODUCT_ID

# Firebase public client
NEXT_PUBLIC_FIREBASE_API_KEY=$api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$storage_bucket
NEXT_PUBLIC_FIREBASE_APP_ID=$resolved_app_id
NEXT_PUBLIC_USE_EMULATORS=false

# Firebase server
FIREBASE_PROJECT_ID=$PROJECT_ID
FIREBASE_STORAGE_BUCKET=$storage_bucket

# Hosting
CANONICAL_HOST=$CANONICAL_HOST
NEXT_PUBLIC_APP_URL=https://$CANONICAL_HOST
APP_HOSTING_BACKEND_ID=$APP_HOSTING_BACKEND_ID
APP_HOSTING_PRIMARY_REGION=$PRIMARY_REGION
FORCE_CANONICAL_REDIRECT=true

# Stripe
STRIPE_SUCCESS_URL=https://$CANONICAL_HOST/dashboard
STRIPE_CANCEL_URL=https://$CANONICAL_HOST/signup
STRIPE_BILLING_RETURN_URL=https://$CANONICAL_HOST/billing

# Daily
DAILY_DOMAIN=$DAILY_DOMAIN
EOF

echo
echo "Bootstrap Firebase complet."
echo "Producte: $PRODUCT_ID"
echo "Projecte: $PROJECT_ID"
echo "Backend App Hosting: $APP_HOSTING_BACKEND_ID"
echo "Fitxer d'entorn generat: $ENV_OUTPUT_PATH"
echo
echo "Passos següents recomanats:"
echo "1. Si encara no ho has fet, activa Blaze al projecte."
echo "2. Defineix secrets i variables d'aplicació a partir del fitxer generat."
echo "3. Connecta el backend d'App Hosting al repo/branca corresponent."
echo "4. Afegeix el domini personalitzat des de Firebase App Hosting; el CLI actual no exposa un comandament directe per a custom domains."
