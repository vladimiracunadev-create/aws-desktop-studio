# 🪪 IAM e IAM Identity Center

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!IMPORTANT]
> **Identidad primero.** La aplicación delega autenticación a AWS y nunca debe solicitar contraseña, MFA ni claves permanentes.

| Ficha | Alcance |
|---|---|
| Servicios | IAM · IAM Identity Center · STS |
| Decisión central | identidad humana, rol temporal o workload |
| Control clave | mínimo privilegio, MFA, expiración y auditoría |

IAM controla identidades y permisos. STS entrega credenciales temporales. IAM Identity Center facilita acceso humano federado/multi-cuenta.

## Reglas
- Root solo para tareas excepcionales.
- MFA.
- Roles temporales.
- Mínimo privilegio.
- Separar lectura/operación/administración.

## Políticas
Las decisiones combinan identity policies, resource policies, permission boundaries, SCP y otros controles. Un `Deny` explícito tiene prioridad.
