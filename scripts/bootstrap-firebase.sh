#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v firebase >/dev/null 2>&1; then
  echo "firebase-tools no està instal·lat."
  echo "Instal·la'l amb: npm i -g firebase-tools"
  exit 1
fi

if ! firebase login:list >/dev/null 2>&1; then
  echo "Autenticació Firebase requerida. Executa exactament:"
  echo "firebase login"
  echo "firebase use --add <projectId>"
  exit 1
fi

cat > firebase.json <<'JSON'
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log"
      ]
    }
  ],
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8085
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "singleProjectMode": true
  }
}
JSON

cat > .firebaserc <<'JSON'
{
  "projects": {
    "default": "summa-board"
  }
}
JSON

cat > firestore.indexes.json <<'JSON'
{
  "indexes": [],
  "fieldOverrides": []
}
JSON

cat > firestore.rules <<'RULES'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isOrgOwner(orgId) {
      return signedIn() &&
        get(/databases/$(database)/documents/orgs/$(orgId)).data.ownerUid == request.auth.uid;
    }

    function isPollOwner(pollId) {
      return signedIn() &&
        isOrgOwner(get(/databases/$(database)/documents/polls/$(pollId)).data.orgId);
    }

    function isMeetingOwner(meetingId) {
      return signedIn() &&
        isOrgOwner(get(/databases/$(database)/documents/meetings/$(meetingId)).data.orgId);
    }

    match /orgs/{orgId} {
      allow read: if signedIn() && resource.data.ownerUid == request.auth.uid;
      allow create: if signedIn() && request.resource.data.ownerUid == request.auth.uid;
      allow update, delete: if signedIn() && resource.data.ownerUid == request.auth.uid;
    }

    match /polls/{pollId} {
      allow read: if signedIn() && isOrgOwner(resource.data.orgId);
      allow create: if signedIn() && isOrgOwner(request.resource.data.orgId);
      allow update, delete: if signedIn() && isOrgOwner(resource.data.orgId);

      match /options/{optionId} {
        allow read, write: if isPollOwner(pollId);
      }

      match /voters/{voterId} {
        allow read, write: if isPollOwner(pollId);
      }

      match /votes/{voterId} {
        allow read, write: if isPollOwner(pollId);
      }
    }

    match /meetings/{meetingId} {
      allow read, write: if isMeetingOwner(meetingId);

      match /recordings/{recordingId} {
        allow read, write: if isMeetingOwner(meetingId);
      }

      match /transcripts/{transcriptId} {
        allow read, write: if isMeetingOwner(meetingId);
      }

      match /minutes/{minutesId} {
        allow read, write: if isMeetingOwner(meetingId);
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
RULES

cat > storage.rules <<'RULES'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isMeetingOwner(meetingId) {
      return request.auth != null &&
        firestore.get(/databases/(default)/documents/orgs/$(firestore.get(/databases/(default)/documents/meetings/$(meetingId)).data.orgId)).data.ownerUid == request.auth.uid;
    }

    match /meetings/{meetingId}/recordings/{allPaths=**} {
      allow read, write: if isMeetingOwner(meetingId);
    }

    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
RULES

echo "Configuració Firebase preparada a $ROOT_DIR"
