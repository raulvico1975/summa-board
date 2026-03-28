# Rollback Plan (auto) — Summa Social

Generat: 2026-03-28 08:02
Risc: ALT
Backup curt: NO_REQUIRED
SHA prod abans de publicar: 5c6b6f0b
SHA branca a publicar (main): 0a54278f

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert 0a54278f --no-edit
git push origin main
bash scripts/deploy.sh main
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard 5c6b6f0b
git push origin prod --force-with-lease
```
