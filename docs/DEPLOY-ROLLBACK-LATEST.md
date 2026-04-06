# Rollback Plan (auto) — Summa Social

Generat: 2026-04-06 14:38
Risc: MITJA
Backup curt: NO_REQUIRED
SHA prod abans de publicar: 5e66289e
SHA branca a publicar (prod): 8566c6e1

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout prod
git revert 8566c6e1 --no-edit
git push origin prod
bash scripts/deploy.sh prod
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard 5e66289e
git push origin prod --force-with-lease
```
