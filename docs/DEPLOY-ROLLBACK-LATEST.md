# Rollback Plan (auto) — Summa Social

Generat: 2026-03-09 15:44
Risc: MITJA
Backup curt: NO_REQUIRED
SHA prod abans de publicar: 6ef534cb
SHA main a publicar: 50283c25

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert 50283c25 --no-edit
git push origin main
bash scripts/deploy.sh
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard 6ef534cb
git push origin prod --force-with-lease
```
