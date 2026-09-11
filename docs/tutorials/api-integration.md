# 🔌 APIs, colas y eventos

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Módulo educativo.** La documentación de un servicio no implica que AWS Desktop Studio lo opere.

| Ficha | Alcance |
|---|---|
| Servicios | API Gateway · SQS · SNS · EventBridge · Step Functions |
| Decisión central | síncrono, cola, pub/sub, evento u orquestación |
| Control clave | idempotencia, reintentos, DLQ y trazabilidad |

## API Gateway
Front door administrado para APIs REST/HTTP/WebSocket.

## SQS
Cola. Productor y consumidor quedan desacoplados. Diseña idempotencia, retries, visibility timeout y DLQ.

## SNS
Pub/sub a múltiples suscriptores.

## EventBridge
Bus de eventos para integración basada en eventos y reglas.

## Step Functions
Orquestación explícita de workflows.

Patrón robusto: API -> validación -> cola/evento -> worker -> persistencia, con observabilidad y DLQ.
