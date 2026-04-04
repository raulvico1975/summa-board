# Rollback Plan (auto) — Summa Social

Generat: 2026-04-04 19:17
Risc: MITJA
Backup curt: NO_REQUIRED
SHA prod abans de publicar: a7eff0d4
SHA branca a publicar (main): 8e2b016a

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert 8e2b016a --no-edit
git push origin main
bash scripts/deploy.sh main
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard a7eff0d4
git push origin prod --force-with-lease
```
