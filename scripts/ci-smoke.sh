#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -d "/opt/homebrew/opt/openjdk/bin" ]; then
  export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
fi

export NEXT_PUBLIC_USE_EMULATORS=true
export NEXT_PUBLIC_FIREBASE_PROJECT_ID=summa-board
export NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=summa-board.firebasestorage.app
export FIREBASE_PROJECT_ID=summa-board
export FIREBASE_STORAGE_BUCKET=summa-board.firebasestorage.app

firebase emulators:exec \
  --project summa-board \
  --only auth,firestore,storage \
  "bash ./scripts/ci-smoke-inner.sh"
