# IAM e IAM Identity Center

IAM controla identidades y permisos. STS entrega credenciales temporales. IAM Identity Center facilita acceso humano federado/multi-cuenta.

## Reglas
- Root solo para tareas excepcionales.
- MFA.
- Roles temporales.
- Mínimo privilegio.
- Separar lectura/operación/administración.

## Políticas
Las decisiones combinan identity policies, resource policies, permission boundaries, SCP y otros controles. Un `Deny` explícito tiene prioridad.
