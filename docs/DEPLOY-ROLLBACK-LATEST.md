# Rollback Plan (auto) — Summa Social

Generat: 2026-04-20 12:32
Risc: ALT
Backup curt: NO_REQUIRED
SHA prod abans de publicar: 41b63a206
SHA branca a publicar (main): e838aac63

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert e838aac63 --no-edit
git push origin main
bash scripts/deploy.sh main
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard 41b63a206
git push origin prod --force-with-lease
```
