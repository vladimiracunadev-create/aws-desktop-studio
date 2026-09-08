# Publicación

Los releases se construyen exclusivamente desde un tag `v*` mediante `.github/workflows/build-windows.yml`.

## Checklist

1. Verificar árbol limpio, versión y changelog.
2. Ejecutar `pnpm install --frozen-lockfile`, `pnpm run verify` y `pnpm audit --audit-level=high`.
3. Construir localmente con `pnpm run dist:win` cuando se requiera smoke test visual.
4. Crear y subir el tag anotado `vX.Y.Z`.
5. Confirmar que GitHub Actions publique Setup, Portable, SBOM CycloneDX y `SHA256SUMS.txt`.
6. Descargar los artefactos, verificar SHA-256 y ejecutar un smoke test en Windows.

## Integridad

```powershell
Get-FileHash .\AWS-Desktop-Studio-Portable-0.1.1-x64.exe -Algorithm SHA256
```

El hash debe coincidir con `SHA256SUMS.txt`. Los binarios de v0.1.1 no incluyen firma comercial; esta limitación debe mantenerse visible en el release.
