# Brief per Codex: bot Telegram del mirror

Objectiu: connectar alertes del workflow `Prod Mirror Sync` a Telegram de forma aïllada i segura.

## Context tècnic

- Workflow: `.github/workflows/prod-mirror-sync.yml`
- Secrets de mirror ja previstos:
  - `PROD_SOURCE_REPO_SSH`
  - `PROD_SOURCE_READONLY_SSH_KEY`
- Secrets Telegram previstos:
  - `MIRROR_TELEGRAM_BOT_TOKEN`
  - `MIRROR_TELEGRAM_CHAT_ID`
- Variable opcional:
  - `MIRROR_NOTIFY_SUCCESS` (`true` per avisar també en execució manual correcta)

## Prompt per passar a Codex

```text
Necessito que m'ajudis a configurar el bot de Telegram per al mirror automàtic del repo.

Objectiu:
- Rebre alerta a Telegram quan falli el workflow "Prod Mirror Sync".
- Opcionalment rebre alerta en èxit només en execucions manuals.
- No reutilitzar credencials de producció.

Fes exactament això:
1) Dona'm passos mínims de BotFather per crear un bot nou "summa-mirror".
2) Dona'm la comanda exacta per obtenir el chat_id (amb getUpdates) després d'enviar un missatge al bot.
3) Dona'm comandes `gh` per guardar secrets al repo mirror:
   - MIRROR_TELEGRAM_BOT_TOKEN
   - MIRROR_TELEGRAM_CHAT_ID
4) Dona'm comanda `gh` per definir variable:
   - MIRROR_NOTIFY_SUCCESS=true (si vull notificació d'èxit manual)
5) Dona'm check final curt per validar que el workflow envia Telegram:
   - Run manual de "Prod Mirror Sync"
   - Confirmar missatge de Telegram
6) Si cal, usa el script existent `./scripts/setup-mirror-github-secrets.sh` per carregar secrets/variables.

Condicions:
- No toquis codi del workflow (ja està preparat).
- No afegeixis dependències.
- Prioritza seguretat i aïllament de prod.
```

## Comandes de referència (manual)

```bash
# Guardar secrets al repo mirror (executar al directori del repo mirror)
gh secret set MIRROR_TELEGRAM_BOT_TOKEN --body "<BOT_TOKEN>"
gh secret set MIRROR_TELEGRAM_CHAT_ID --body "<CHAT_ID>"

# Variable opcional per avisar en èxit manual
gh variable set MIRROR_NOTIFY_SUCCESS --body "true"
```

```bash
# Obtenir updates i extreure chat_id
curl -s "https://api.telegram.org/bot<BOT_TOKEN>/getUpdates"
```
