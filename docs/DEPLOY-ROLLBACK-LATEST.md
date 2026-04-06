# Rollback Plan (auto) — Summa Social

Generat: 2026-04-06 13:22
Risc: ALT
Backup curt: NO_REQUIRED
SHA prod abans de publicar: f29073da
SHA branca a publicar (codex/expenses-ui-prod-clean): d014675b

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout codex/expenses-ui-prod-clean
git revert d014675b --no-edit
git push origin codex/expenses-ui-prod-clean
bash scripts/deploy.sh codex/expenses-ui-prod-clean
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard f29073da
git push origin prod --force-with-lease
```
