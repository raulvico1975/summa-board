# SummaBoard

MVP local-first per coordinar votacions tipus Doodle i generar actes de reunió per entitats socials.

## Stack

- Next.js App Router + TypeScript
- Firebase Auth / Firestore / Storage
- Firebase Emulators
- Cloud Functions v2 (skeleton)
- Gemini API (REAL mode opcional)

## Variables d'entorn

Copia `.env.example` a `.env.local` si cal personalitzar.

Variables importants:

- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=summa-board`
- `FIREBASE_PROJECT_ID=summa-board`
- `GEMINI_API_KEY=` (buit = STUB mode)
- `GEMINI_MODEL=` (opcional override)

## Execució local

1. Bootstrap config Firebase:

```bash
npm run bootstrap:firebase
```

2. Arrencar app + emuladors:

```bash
npm run emu
```

3. Seed de dades demo (en una altra terminal):

```bash
npm run seed
```

4. Smoke test (amb app en marxa):

```bash
npm run test:smoke
```

5. Monitor de login en bucle (opcional):

```bash
npm run monitor:login
```

## Credencials demo seed

- Email: `owner@summa.local`
- Password: `123456`

## Secrets en lloc segur (macOS Keychain)

Guarda secrets fora del repo:

```bash
scripts/secrets-keychain.sh set GEMINI_API_KEY "xxxx"
scripts/secrets-keychain.sh set FIREBASE_CLIENT_EMAIL "service-account@project.iam.gserviceaccount.com"
scripts/secrets-keychain.sh set FIREBASE_PRIVATE_KEY "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
scripts/secrets-keychain.sh set FIREBASE_PRIVATE_KEY_ID "xxxx"
```

Genera `.env.local` des de Keychain:

```bash
scripts/secrets-keychain.sh write-env
```

Consultar un secret:

```bash
scripts/secrets-keychain.sh get GEMINI_API_KEY
```

## Rutes

Públiques:

- `/p/[slug]`
- `/p/[slug]/results`

Owner:

- `/login`
- `/dashboard`
- `/polls/new`
- `/polls/[pollId]`
- `/meetings/[meetingId]`

## Notes MVP

- Les escriptures públiques de vots entren només via `/api/public/vote`.
- El token de votant només es guarda raw a `localStorage`; al servidor només hash.
- Pipeline premium:
  - Sense `GEMINI_API_KEY`: STUB
  - Amb `GEMINI_API_KEY`: intent REAL (Gemini); fallback STUB si falla.
