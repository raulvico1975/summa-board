# Rollback Plan (auto) — Summa Social

Generat: 2026-09-08 16:20
Risc: MITJA
Backup curt: NO_REQUIRED
SHA prod abans de publicar: d314fbe45
SHA branca a publicar (main): 1b233db07

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert 1b233db07 --no-edit
git push origin main
bash scripts/deploy.sh main
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard d314fbe45
git push origin prod --force-with-lease
```
