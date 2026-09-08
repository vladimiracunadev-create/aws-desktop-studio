# DevOps y entrega

AWS ofrece CodeBuild, CodePipeline, CodeArtifact y otros servicios de developer tooling, pero también puedes usar GitHub Actions/GitLab CI/Jenkins.

Pipeline típico:

```text
Git -> lint/test -> build -> security scan -> artifact/image -> deploy staging -> tests -> approval -> deploy prod -> observability
```

Usa OIDC/roles temporales para CI cuando sea posible en vez de secretos AWS estáticos.
