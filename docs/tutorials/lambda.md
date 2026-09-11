# ⚡ AWS Lambda

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Módulo educativo.** La aplicación lista funciones; no invoca ni despliega código Lambda.

| Ficha | Alcance |
|---|---|
| Servicio | AWS Lambda |
| Decisión central | ejecución por eventos sin servidor persistente |
| Control clave | timeout, concurrencia, reintentos e IAM |

Cómputo serverless basado en funciones. AWS administra servidores y escala invocaciones.

## Se paga principalmente por
Invocaciones y duración/recursos, más servicios asociados.

## Conceptos
Runtime, handler, memory, timeout, concurrency, layers, environment variables, IAM execution role, event source y dead-letter/destinations.

## Buen uso
APIs, workers de colas, procesamiento de eventos/archivos, automatización.

## Evita
Funciones gigantes, secretos en variables sin protección, dependencias no reproducibles y ausencia de observabilidad.
