# Seguridad

## Versiones con soporte

| Versión | Soporte |
|---|---|
| 0.1.x | Sí |
| < 0.1 | No |

## Principios

- No guardar `aws_access_key_id`, `aws_secret_access_key` ni tokens SSO en el repositorio.
- Preferir AWS Login, IAM Identity Center (SSO), roles temporales y MFA; evitar operar diariamente como root.
- Modo lectura por defecto.
- Operaciones mutables con confirmación explícita.
- Los comandos AWS se ejecutan con `spawn(..., shell:false)` y argumentos validados.
- El renderer usa sandbox y aislamiento de contexto; navegación, ventanas emergentes y permisos web están denegados.
- Secrets Manager muestra metadatos, no `GetSecretValue`.
- Nunca subir `~/.aws/credentials`, `~/.aws/config` con datos privados ni `.env` con secretos.

## Modelo de amenaza resumido

1. Inyección de comandos: mitigada evitando shell y validando tokens.
2. Exposición de credenciales: la aplicación delega resolución a AWS CLI.
3. Privilegios excesivos: usar roles de mínimo privilegio y perfiles separados.
4. Cambios accidentales: lectura por defecto y confirmación del usuario.
5. Costos inesperados: revisar Cost Explorer y presupuestos antes de iniciar recursos existentes.
6. Cadena de suministro: lockfile, auditoría pnpm, Dependency Review, CodeQL, SBOM y hashes por release.
7. Modo localhost: escucha exclusiva en `127.0.0.1`, validación de `Host`/`Origin`, token anti-CSRF, cuerpos limitados y mutaciones AWS deshabilitadas.
8. Frontera de autenticación: AWS Login y SSO delegan contraseña, desafíos y MFA a páginas oficiales. AWS CLI administra sus cachés temporales; la app solo solicita nombres de perfiles y configuración no secreta.
9. Escritura de configuración: crear perfiles SSO o AssumeRole modifica `~/.aws/config` únicamente después de una confirmación explícita; ningún endpoint acepta Access Keys.

## Reportar una vulnerabilidad

Usa **Security → Report a vulnerability** en GitHub cuando esté disponible. Si necesitas contactar al mantenedor por otro canal, utiliza la información privada de su perfil y evita adjuntar secretos.

Incluye versión, impacto, pasos mínimos de reproducción y mitigación sugerida. No publiques credenciales, Account IDs, ARN privados ni respuestas AWS sensibles en issues públicos.
