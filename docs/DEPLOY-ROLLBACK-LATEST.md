# Rollback Plan (auto) — Summa Social

Generat: 2026-04-16 15:03
Risc: ALT
Backup curt: SKIPPED_NO_BUCKET
SHA prod abans de publicar: 8d55085c8
SHA branca a publicar (main): 11d7591f6

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert 11d7591f6 --no-edit
git push origin main
bash scripts/deploy.sh main
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard 8d55085c8
git push origin prod --force-with-lease
```
