# AWS Secrets Manager

Servicio para almacenar y rotar secretos como contraseñas/API credentials.

AWS Desktop Studio v0.1 **solo lista metadatos**: nombre, ARN, rotación y fecha. No implementa lectura del valor del secreto para reducir exposición accidental.

Integra aplicaciones mediante IAM roles y recuperación en runtime. Configura rotación cuando sea viable y audita accesos.
