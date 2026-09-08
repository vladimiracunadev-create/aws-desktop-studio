# APIs, colas y eventos

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
