# DynamoDB

Base NoSQL key-value/document administrada, orientada a latencia baja y escalado horizontal.

## Diseño
El modelo empieza por patrones de acceso. Partition key y sort key determinan distribución/consultas.

## Capacidades
On-demand/provisioned, GSIs/LSIs, TTL, Streams, backups/PITR, Global Tables y transacciones.

## Error común
Diseñarla como si fuera una base SQL relacional y depender de scans masivos.
