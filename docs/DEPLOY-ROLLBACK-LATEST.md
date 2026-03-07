# Rollback Plan (auto) — Summa Social

Generat: 2026-03-07 18:13
Risc: ALT
Backup curt: SKIPPED_NO_BUCKET
SHA prod abans de publicar: b35bdab
SHA main a publicar: e0f5ac9

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert e0f5ac9 --no-edit
git push origin main
bash scripts/deploy.sh
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard b35bdab
git push origin prod --force-with-lease
```
