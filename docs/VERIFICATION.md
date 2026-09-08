# Evidencia verificable

Este documento separa lo automatizado de lo que requiere un entorno AWS real.

## Gates locales y CI

| Gate | Comando / workflow | Qué prueba |
|---|---|---|
| Estructura | `npm run check` | archivos esenciales y 20 tutoriales presentes |
| Unidad | `npm test` | construcción segura de argumentos, allowlists y fechas UTC |
| Cobertura | `npm run test:coverage` | cobertura nativa de Node sin servicio externo |
| Dependencias | `npm audit --audit-level=high` | vulnerabilidades conocidas del lockfile |
| Plataformas | `ci.yml` | validación en Windows y Ubuntu con Node 22 |
| SAST | `codeql.yml` | análisis JavaScript/TypeScript semanal y por cambios |
| Release | `build-windows.yml` | empaquetado, SBOM, SHA-256 y publicación por tag |
| Landing | `pages.yml` | despliegue reproducible del contenido de `site/` |

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
