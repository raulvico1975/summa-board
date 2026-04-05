# Rollback Plan (auto) — Summa Social

Generat: 2026-04-05 20:01
Risc: MITJA
Backup curt: NO_REQUIRED
SHA prod abans de publicar: f823b95d
SHA branca a publicar (main): f388e2a8

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert f388e2a8 --no-edit
git push origin main
bash scripts/deploy.sh main
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard f823b95d
git push origin prod --force-with-lease
```
