# Rollback Plan (auto) — Summa Social

Generat: 2026-03-05 12:11
Risc: ALT
Backup curt: SKIPPED_NO_BUCKET
SHA prod abans de publicar: 0bf1394
SHA main a publicar: 601b350

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert 601b350 --no-edit
git push origin main
bash scripts/deploy.sh
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard 0bf1394
git push origin prod --force-with-lease
```
