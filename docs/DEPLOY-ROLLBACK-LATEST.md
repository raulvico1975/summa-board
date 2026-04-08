# Rollback Plan (auto) — Summa Social

Generat: 2026-04-08 10:56
Risc: BAIX
Backup curt: NO_REQUIRED
SHA prod abans de publicar: cefe4c1f
SHA branca a publicar (main): c4edf21c

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert c4edf21c --no-edit
git push origin main
bash scripts/deploy.sh main
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard cefe4c1f
git push origin prod --force-with-lease
```
