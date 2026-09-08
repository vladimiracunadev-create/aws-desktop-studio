# Estado verificable — v0.1.0

Última verificación local: 2026-09-07.

| Superficie | Estado | Evidencia |
|---|---|---|
| Aplicación Electron | Operativa | `npm start`; procesos main/preload/renderer implementados |
| Consultas AWS | 16 integraciones | allowlist en `src/aws-command-builder.js` + Cost Explorer |
| Mutaciones | 3 acciones EC2 | start/stop/reboot; modo opt-in + diálogo nativo |
| Catálogo educativo | 28 entradas | `src/catalog.js` |
| Tutoriales | 20 archivos | `docs/tutorials/*.md`; verificado por `npm run check` |
| Pruebas | 8 casos | `node --test test/*.test.js` |
| Automatización | 4 workflows | CI, CodeQL, Pages y build/release Windows |
| Dependencias | Reproducibles | `package-lock.json` + `npm ci` |
| Publicación | Preparada | landing, About, SBOM, checksums y assets de release |

## Límites declarados

- No crea, elimina ni modifica infraestructura salvo el estado de EC2 existente.
- Los 12 módulos educativos no realizan consultas reales en v0.1.0.
- La prueba end-to-end contra AWS requiere una cuenta/perfil aportado por quien ejecuta la app y no corre en CI.
- Los ejecutables comunitarios no tienen firma comercial en v0.1.0.
