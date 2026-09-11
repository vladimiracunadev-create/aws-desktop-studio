# 📊 Amazon CloudWatch

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Módulo educativo.** La aplicación consulta grupos de logs de forma acotada; no sustituye una estrategia de observabilidad.

| Ficha | Alcance |
|---|---|
| Servicio | Amazon CloudWatch |
| Decisión central | métricas, logs, alarmas y dashboards |
| Control clave | retención, cardinalidad, permisos y costo |

Observabilidad: métricas, logs, dashboards, alarmas y eventos asociados.

## Diseño
Define qué señales indican salud real: latencia, errores, saturación, tráfico y señales de negocio.

## Logs
Configura retención; sin ella los logs pueden crecer indefinidamente. Evita registrar secretos/datos sensibles.

## App
v0.1 lista Log Groups y muestra retención/bytes informados.
