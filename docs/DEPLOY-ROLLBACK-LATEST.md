# Rollback Plan (auto) — Summa Social

Generat: 2026-04-14 15:02
Risc: ALT
Backup curt: NO_REQUIRED
SHA prod abans de publicar: 53b871e2c
SHA branca a publicar (main): f4517ec5c

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert f4517ec5c --no-edit
git push origin main
bash scripts/deploy.sh main
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard 53b871e2c
git push origin prod --force-with-lease
```
