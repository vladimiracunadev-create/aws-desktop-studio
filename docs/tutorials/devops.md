# ♾️ DevOps y entrega

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Módulo educativo.** AWS Desktop Studio no reemplaza un pipeline de entrega ni despliega a producción.

| Ficha | Alcance |
|---|---|
| Servicios | CodeBuild · CodePipeline · CodeArtifact y herramientas externas |
| Decisión central | entrega repetible con gates y rollback |
| Control clave | provenance, secretos, permisos y separación de ambientes |

AWS ofrece CodeBuild, CodePipeline, CodeArtifact y otros servicios de developer tooling, pero también puedes usar GitHub Actions/GitLab CI/Jenkins.

Pipeline típico:

```text
Git -> lint/test -> build -> security scan -> artifact/image -> deploy staging -> tests -> approval -> deploy prod -> observability
```

Usa OIDC/roles temporales para CI cuando sea posible en vez de secretos AWS estáticos.
