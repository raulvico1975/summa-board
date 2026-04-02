# Rollback Plan (auto) — Summa Social

Generat: 2026-04-02 21:39
Risc: MITJA
Backup curt: NO_REQUIRED
SHA prod abans de publicar: afd84102
SHA branca a publicar (main): a4793b1d

## Si cal marxa enrere rapida

Opcio recomanada (preserva historial):
```bash
git checkout main
git revert a4793b1d --no-edit
git push origin main
bash scripts/deploy.sh main
```

Emergencia critica (nomes si la produccio cau i no hi ha alternativa):
```bash
git checkout prod
git reset --hard afd84102
git push origin prod --force-with-lease
```
