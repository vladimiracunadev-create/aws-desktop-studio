# Evidencia verificable

Este documento separa lo automatizado de lo que requiere un entorno AWS real.

Pasar estos gates demuestra integridad del código, pruebas unitarias y capacidad de empaquetado. No demuestra que el producto esté terminado ni que todas las modalidades de acceso AWS funcionen. Los workflows públicos no reciben credenciales de cuentas reales y, por diseño, no prueban root, IAM, federación, SSO, AssumeRole o workloads de extremo a extremo.

## Gates locales y CI

| Gate | Comando / workflow | Qué prueba |
|---|---|---|
| Estructura | `pnpm run check` | archivos esenciales y 20 tutoriales presentes |
| Unidad | `pnpm test` | construcción segura de argumentos, allowlists y fechas UTC |
| Cobertura | `pnpm run test:coverage` | cobertura nativa de Node sin servicio externo |
| Dependencias | `pnpm audit --audit-level=high` | vulnerabilidades conocidas del lockfile |
| Plataformas | `ci.yml` | validación en Windows y Ubuntu con Node 22 |
| SAST | `codeql.yml` | análisis JavaScript/TypeScript semanal y por cambios |
| Release | `build-windows.yml` | empaquetado, SBOM, SHA-256 y publicación por tag |
| Landing | `pages.yml` | despliegue reproducible del contenido de `site/` |

Un workflow verde de release significa que Setup, Portable, SBOM y hashes pudieron generarse. No es una certificación de autenticación AWS ni de preparación para producción.

## Prueba manual con AWS

Usa una cuenta sandbox y un rol de mínimo privilegio.

1. Ejecuta `aws sts get-caller-identity --profile <perfil>`.
2. Inicia la aplicación y valida que cuenta y ARN coincidan.
3. Consulta un servicio con recursos y otro sin recursos.
4. Confirma que modo operativo esté apagado al iniciar.
5. En una EC2 de laboratorio, comprueba que Cancelar no produzca cambios.
6. Solo si está autorizado, activa modo operativo y valida una acción reversible.
7. Revisa CloudTrail para asociar el evento con la identidad esperada.

Nunca uses credenciales, ARN o IDs reales como fixtures ni evidencia pública.
