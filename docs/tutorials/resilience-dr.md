# 🛟 Resiliencia, backup y DR

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!IMPORTANT]
> **Módulo educativo.** Un backup sólo es evidencia de recuperación después de una restauración probada.

| Ficha | Alcance |
|---|---|
| Servicios | AWS Backup · Elastic Disaster Recovery · capacidades nativas |
| Decisión central | RTO, RPO y estrategia de recuperación |
| Control clave | inmutabilidad, aislamiento y pruebas periódicas |

Disponibilidad no es lo mismo que backup; backup no es lo mismo que disaster recovery.

## Conceptos
RTO: tiempo objetivo de recuperación. RPO: pérdida máxima de datos aceptable.

## Herramientas
Multi-AZ, Auto Scaling, snapshots, AWS Backup, replication y Elastic Disaster Recovery según carga.

Prueba restauraciones. Un backup que nunca se ha restaurado es una suposición, no evidencia de recuperación.
