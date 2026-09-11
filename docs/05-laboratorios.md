# 🧪 Laboratorios sugeridos

[**← README**](../README.md) · [**🗺️ Mapa de servicios**](aws-service-map.md) · [**📚 Tutoriales**](../README.md#-documentación)

> [!IMPORTANT]
> Ejecuta los laboratorios en una cuenta sandbox, con presupuesto y teardown. No uses root salvo una tarea que AWS reserve expresamente a esa identidad.

```mermaid
flowchart LR
    L0["0 · 🪪 Identidad"] --> L1["1–2 · 🪣 S3 + EC2"]
    L1 --> L2["3–4 · ⚡ Eventos"]
    L2 --> L3["5–6 · 🏗️ IaC + contenedores"]
    L3 --> L4["7–8 · 📊 Observabilidad + seguridad"]
    L4 --> L5["9 · 💰 FinOps + teardown"]

    style L0 fill:#8957e5,color:#fff
    style L1 fill:#1f6feb,color:#fff
    style L2 fill:#ff9900,color:#111
    style L3 fill:#21262d,color:#fff
    style L4 fill:#cf222e,color:#fff
    style L5 fill:#2da44e,color:#fff
```

## Lab 0 — Identidad
Objetivo: configurar SSO, validar STS, distinguir cuenta/rol/región.

## Lab 1 — S3
Crear bucket desde consola/CLI, subir archivo, habilitar versionado y lifecycle; eliminar al terminar.

## Lab 2 — EC2
Crear una instancia pequeña dentro de una VPC de laboratorio, usar Security Group mínimo, observar estado desde AWS Desktop Studio y detenerla.

## Lab 3 — Serverless
API Gateway -> Lambda -> DynamoDB con logs CloudWatch.

## Lab 4 — Asíncrono
API -> SQS -> Lambda worker. Provocar retry y dead-letter queue.

## Lab 5 — IaC
Recrear Lab 3 usando CloudFormation o CDK. Destruir stack y comprobar limpieza.

## Lab 6 — Contenedores
Publicar imagen en ECR y ejecutar en ECS/Fargate.

## Lab 7 — Observabilidad
Dashboard CloudWatch, alarmas, logs con retención y CloudTrail.

## Lab 8 — Seguridad
Role de lectura, role operativo y demostración de `AccessDenied` bajo mínimo privilegio.

## Lab 9 — FinOps
Etiquetar recursos, revisar costo, definir budget y teardown checklist.
