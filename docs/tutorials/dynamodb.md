# ⚡ DynamoDB

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Módulo educativo.** La aplicación lista tablas; no inspecciona ni modifica sus datos.

| Ficha | Alcance |
|---|---|
| Servicio | Amazon DynamoDB |
| Decisión central | modelar por patrones de acceso |
| Control clave | claves, índices, capacidad y hot partitions |

Base NoSQL key-value/document administrada, orientada a latencia baja y escalado horizontal.

## Diseño
El modelo empieza por patrones de acceso. Partition key y sort key determinan distribución/consultas.

## Capacidades
On-demand/provisioned, GSIs/LSIs, TTL, Streams, backups/PITR, Global Tables y transacciones.

## Error común
Diseñarla como si fuera una base SQL relacional y depender de scans masivos.
