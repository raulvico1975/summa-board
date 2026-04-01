#!/usr/bin/env bash
set -euo pipefail

KEY=$(osascript -e 'display dialog "Enganxa la RESEND_API_KEY per summareu.app:" default answer "" with title "Summa Reu — Resend API Key" buttons {"Cancel·lar", "Desar"} default button "Desar"' -e 'text returned of result' 2>/dev/null)

if [ -z "$KEY" ]; then
  echo "Cap clau introduïda. Operació cancel·lada."
  exit 1
fi

echo -n "$KEY" | gcloud secrets versions add RESEND_API_KEY --project summa-board --data-file=-
echo "Secret RESEND_API_KEY actualitzat a Secret Manager."

# Update local .env too
if grep -q "^RESEND_API_KEY=" .env 2>/dev/null; then
  sed -i '' "s|^RESEND_API_KEY=.*|RESEND_API_KEY=$KEY|" .env
  echo ".env local actualitzat."
fi

echo "Fet. El proper deploy recollirà la nova clau."
