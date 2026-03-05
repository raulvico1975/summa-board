# Rollback Plan (auto) — Summa Social

Generat: 2026-03-05 10:01
Risc: ALT
Backup curt: SKIPPED_NO_BUCKET
SHA prod abans de publicar: 4417574
SHA main a publicar: 8ee53e6

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert 8ee53e6 --no-edit
git push origin main
bash scripts/deploy.sh
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard 4417574
git push origin prod --force-with-lease
```
