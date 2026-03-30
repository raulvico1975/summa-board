#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

PROJECT_ID="${FIREBASE_PROJECT_ID:-summa-board}"
PRODUCT_ID="${PRODUCT_ID:-}"
RUNTIME_SERVICE="${RUNTIME_SERVICE:-summa-board}"
RUNTIME_REGION="${RUNTIME_REGION:-europe-west4}"
PRODUCTION_BASE_URL="${PRODUCTION_BASE_URL:-https://summareu.app}"

ENV_FILE=".env"
ENV_BACKUP=""
ORIGINAL_ENV_EXISTS=0
PRODUCTION_ENV_FILE=".env.production.local"
PRODUCTION_ENV_BACKUP=""
ORIGINAL_PRODUCTION_ENV_EXISTS=0

if [[ -f "$ENV_FILE" ]]; then
  ENV_BACKUP="$(mktemp)"
  cp "$ENV_FILE" "$ENV_BACKUP"
  ORIGINAL_ENV_EXISTS=1
fi

if [[ -f "$PRODUCTION_ENV_FILE" ]]; then
  PRODUCTION_ENV_BACKUP="$(mktemp)"
  cp "$PRODUCTION_ENV_FILE" "$PRODUCTION_ENV_BACKUP"
  ORIGINAL_PRODUCTION_ENV_EXISTS=1
fi

cleanup() {
  if [[ -n "$ENV_BACKUP" && -f "$ENV_BACKUP" ]]; then
    cp "$ENV_BACKUP" "$ENV_FILE"
    rm -f "$ENV_BACKUP"
    ENV_BACKUP=""
  elif [[ "$ORIGINAL_ENV_EXISTS" -eq 0 ]]; then
    rm -f "$ENV_FILE"
  fi

  if [[ -n "$PRODUCTION_ENV_BACKUP" && -f "$PRODUCTION_ENV_BACKUP" ]]; then
    cp "$PRODUCTION_ENV_BACKUP" "$PRODUCTION_ENV_FILE"
    rm -f "$PRODUCTION_ENV_BACKUP"
    PRODUCTION_ENV_BACKUP=""
  elif [[ "$ORIGINAL_PRODUCTION_ENV_EXISTS" -eq 0 ]]; then
    rm -f "$PRODUCTION_ENV_FILE"
  fi
}

trap cleanup EXIT

ENV_SOURCES=()
if [[ -n "$ENV_BACKUP" && -f "$ENV_BACKUP" ]]; then
  ENV_SOURCES+=("$ENV_BACKUP")
fi
if [[ -f ".env.local" ]]; then
  ENV_SOURCES+=(".env.local")
fi
if [[ -f ".env.example" ]]; then
  ENV_SOURCES+=(".env.example")
fi

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Falta la comanda requerida: $command_name" >&2
    exit 1
  fi
}

host_from_url() {
  local value="$1"
  value="${value#http://}"
  value="${value#https://}"
  value="${value%%/*}"
  printf '%s' "$value"
}

lookup_in_sources() {
  local key="$1"
  local file

  for file in "${ENV_SOURCES[@]}"; do
    [[ -f "$file" ]] || continue
    local line
    line="$(grep -m1 "^${key}=" "$file" || true)"
    if [[ -n "$line" ]]; then
      printf '%s' "${line#*=}"
      return 0
    fi
  done

  return 1
}

resolve_value() {
  local key="$1"
  local default_value="${2:-}"

  if [[ -n "${!key:-}" ]]; then
    printf '%s' "${!key}"
    return 0
  fi

  if lookup_in_sources "$key" >/dev/null 2>&1; then
    lookup_in_sources "$key"
    return 0
  fi

  if [[ -n "$default_value" ]]; then
    printf '%s' "$default_value"
    return 0
  fi

  return 1
}

require_value() {
  local key="$1"
  local value

  if ! value="$(resolve_value "$key")"; then
    echo "Falta el valor requerit: $key" >&2
    exit 1
  fi

  printf '%s' "$value"
}

write_sanitized_env() {
  local public_project_id force_canonical_redirect daily_domain public_daily_domain
  local product_id public_product_id canonical_host public_app_url

  public_project_id="$(resolve_value "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "$PROJECT_ID")"
  force_canonical_redirect="$(resolve_value "FORCE_CANONICAL_REDIRECT" "true")"
  daily_domain="$(resolve_value "NEXT_PUBLIC_DAILY_DOMAIN" "$(resolve_value "DAILY_DOMAIN" "")")"
  public_daily_domain="${daily_domain}"
  product_id="$(resolve_value "PRODUCT_ID" "${PRODUCT_ID:-summareu}")"
  public_product_id="$(resolve_value "NEXT_PUBLIC_PRODUCT_ID" "$product_id")"
  public_app_url="$(resolve_value "NEXT_PUBLIC_APP_URL" "$PRODUCTION_BASE_URL")"
  canonical_host="$(resolve_value "CANONICAL_HOST" "$(host_from_url "$public_app_url")")"

  printf 'NEXT_PUBLIC_FIREBASE_PROJECT_ID=%s\nFORCE_CANONICAL_REDIRECT=%s\nNEXT_PUBLIC_DAILY_DOMAIN=%s\nPRODUCT_ID=%s\nNEXT_PUBLIC_PRODUCT_ID=%s\nCANONICAL_HOST=%s\nNEXT_PUBLIC_APP_URL=%s\n' \
    "$public_project_id" \
    "$force_canonical_redirect" \
    "$public_daily_domain" \
    "$product_id" \
    "$public_product_id" \
    "$canonical_host" \
    "$public_app_url" > "$ENV_FILE"

  cp "$ENV_FILE" "$PRODUCTION_ENV_FILE"
}

SECRET_BINDINGS=()
RUNTIME_SERVICE_ACCOUNT=""
SECRET_ENV_NAMES=()

ensure_secret_binding() {
  local secret_name="$1"
  local is_required="$2"
  local value=""

  if value="$(resolve_value "$secret_name" 2>/dev/null)"; then
    :
  else
    value=""
  fi

  if gcloud secrets describe "$secret_name" --project "$PROJECT_ID" >/dev/null 2>&1; then
    :
  elif [[ -n "$value" ]]; then
    gcloud secrets create "$secret_name" --replication-policy=automatic --project "$PROJECT_ID" >/dev/null
  elif [[ "$is_required" == "required" ]]; then
    echo "Falta el secret requerit: $secret_name" >&2
    exit 1
  else
    return 0
  fi

  if [[ -n "$value" ]]; then
    printf '%s' "$value" | gcloud secrets versions add "$secret_name" --project "$PROJECT_ID" --data-file=- >/dev/null
  fi

  gcloud secrets add-iam-policy-binding "$secret_name" \
    --project "$PROJECT_ID" \
    --member="serviceAccount:${RUNTIME_SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" >/dev/null

  SECRET_BINDINGS+=("${secret_name}=${secret_name}:latest")
  SECRET_ENV_NAMES+=("${secret_name}")
}

configure_runtime() {
  local daily_domain stripe_price_id telegram_chat_id public_project_id force_canonical_redirect public_daily_domain
  local product_id public_product_id canonical_host public_app_url
  local env_bindings

  RUNTIME_SERVICE_ACCOUNT="$(
    gcloud run services describe "$RUNTIME_SERVICE" \
      --region "$RUNTIME_REGION" \
      --project "$PROJECT_ID" \
      --format='value(spec.template.spec.serviceAccountName)'
  )"

  if [[ -z "$RUNTIME_SERVICE_ACCOUNT" ]]; then
    echo "No s'ha pogut resoldre el service account de $RUNTIME_SERVICE" >&2
    exit 1
  fi

  daily_domain="$(require_value "DAILY_DOMAIN")"
  public_daily_domain="$(resolve_value "NEXT_PUBLIC_DAILY_DOMAIN" "$daily_domain")"
  stripe_price_id="$(require_value "STRIPE_PRICE_ID")"
  telegram_chat_id="$(require_value "TELEGRAM_CHAT_ID")"
  public_project_id="$(resolve_value "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "$PROJECT_ID")"
  force_canonical_redirect="$(resolve_value "FORCE_CANONICAL_REDIRECT" "true")"
  product_id="$(resolve_value "PRODUCT_ID" "${PRODUCT_ID:-summareu}")"
  public_product_id="$(resolve_value "NEXT_PUBLIC_PRODUCT_ID" "$product_id")"
  public_app_url="$(resolve_value "NEXT_PUBLIC_APP_URL" "$PRODUCTION_BASE_URL")"
  canonical_host="$(resolve_value "CANONICAL_HOST" "$(host_from_url "$public_app_url")")"

  env_bindings=(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID=${public_project_id}"
    "FORCE_CANONICAL_REDIRECT=${force_canonical_redirect}"
    "NEXT_PUBLIC_DAILY_DOMAIN=${public_daily_domain}"
    "DAILY_DOMAIN=${daily_domain}"
    "STRIPE_PRICE_ID=${stripe_price_id}"
    "TELEGRAM_CHAT_ID=${telegram_chat_id}"
    "PRODUCT_ID=${product_id}"
    "NEXT_PUBLIC_PRODUCT_ID=${public_product_id}"
    "CANONICAL_HOST=${canonical_host}"
    "NEXT_PUBLIC_APP_URL=${public_app_url}"
  )

  SECRET_BINDINGS=()
  ensure_secret_binding "DAILY_API_KEY" "required"
  ensure_secret_binding "STRIPE_SECRET_KEY" "required"
  ensure_secret_binding "STRIPE_WEBHOOK_SECRET" "required"
  ensure_secret_binding "DAILY_WEBHOOK_BEARER_TOKEN" "required"
  ensure_secret_binding "TELEGRAM_BOT_TOKEN" "required"
  ensure_secret_binding "GEMINI_API_KEY" "optional"

  if [[ "${#SECRET_ENV_NAMES[@]}" -gt 0 ]]; then
    gcloud run services update "$RUNTIME_SERVICE" \
      --region "$RUNTIME_REGION" \
      --project "$PROJECT_ID" \
      --remove-env-vars="$(IFS=,; echo "${SECRET_ENV_NAMES[*]}")" >/dev/null || true
  fi

  gcloud run services update "$RUNTIME_SERVICE" \
    --region "$RUNTIME_REGION" \
    --project "$PROJECT_ID" \
    --update-env-vars="$(IFS=,; echo "${env_bindings[*]}")" \
    --update-secrets="$(IFS=,; echo "${SECRET_BINDINGS[*]}")" >/dev/null
}

verify_runtime() {
  local latest_revision env_names route status

  latest_revision="$(
    gcloud run services describe "$RUNTIME_SERVICE" \
      --region "$RUNTIME_REGION" \
      --project "$PROJECT_ID" \
      --format='value(status.latestReadyRevisionName)'
  )"
  env_names="$(
    gcloud run services describe "$RUNTIME_SERVICE" \
      --region "$RUNTIME_REGION" \
      --project "$PROJECT_ID" \
      --format='value(spec.template.spec.containers[0].env[].name)'
  )"

  if [[ -z "$latest_revision" ]]; then
    echo "El runtime no té cap revisió llesta després del deploy." >&2
    exit 1
  fi

  local required_name
  for required_name in \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    FORCE_CANONICAL_REDIRECT \
    NEXT_PUBLIC_DAILY_DOMAIN \
    PRODUCT_ID \
    NEXT_PUBLIC_PRODUCT_ID \
    CANONICAL_HOST \
    NEXT_PUBLIC_APP_URL \
    DAILY_DOMAIN \
    STRIPE_PRICE_ID \
    TELEGRAM_CHAT_ID \
    DAILY_API_KEY \
    STRIPE_SECRET_KEY \
    STRIPE_WEBHOOK_SECRET \
    DAILY_WEBHOOK_BEARER_TOKEN \
    TELEGRAM_BOT_TOKEN; do
    if ! grep -Eq "(^|;)${required_name}(;|$)" <<<"$env_names"; then
      echo "Falta al runtime la variable/secret requerit: $required_name" >&2
      exit 1
    fi
  done

  for route in "/" "/login" "/verify-email"; do
    status="$(curl -s -o /dev/null -w '%{http_code}' -L "${PRODUCTION_BASE_URL}${route}")"
    if [[ "$status" != "200" ]]; then
      echo "La ruta pública ${route} no ha respost 200 (status=${status})" >&2
      exit 1
    fi
  done

  echo "Deploy segur complet."
  echo "Projecte: ${PROJECT_ID}"
  echo "Runtime: ${RUNTIME_SERVICE} (${RUNTIME_REGION})"
  echo "Revisió llesta: ${latest_revision}"
}

main() {
  require_command "gcloud"
  require_command "curl"
  require_command "node"

  write_sanitized_env
  npx -y firebase-tools@latest deploy --project "$PROJECT_ID" --only hosting --non-interactive
  cleanup
  trap cleanup EXIT
  configure_runtime
  verify_runtime
}

main "$@"
