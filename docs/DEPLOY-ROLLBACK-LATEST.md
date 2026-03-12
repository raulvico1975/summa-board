# Rollback Plan (auto) — Summa Social

Generat: 2026-03-12 10:39
Risc: MITJA
Backup curt: NO_REQUIRED
SHA prod abans de publicar: fc8ec35
SHA main a publicar: faae8dc

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert faae8dc --no-edit
git push origin main
bash scripts/deploy.sh
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard fc8ec35
git push origin prod --force-with-lease
```
