# 🔐 AWS Secrets Manager

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!WARNING]
> **Sólo metadatos.** AWS Desktop Studio no llama `GetSecretValue` ni debe mostrar el contenido de secretos.

| Ficha | Alcance |
|---|---|
| Servicio | AWS Secrets Manager |
| Decisión central | almacenamiento y rotación administrada de secretos |
| Control clave | acceso mínimo, KMS, auditoría y redacción |

Servicio para almacenar y rotar secretos como contraseñas/API credentials.

AWS Desktop Studio v0.1 **solo lista metadatos**: nombre, ARN, rotación y fecha. No implementa lectura del valor del secreto para reducir exposición accidental.

Integra aplicaciones mediante IAM roles y recuperación en runtime. Configura rotación cuando sea viable y audita accesos.
