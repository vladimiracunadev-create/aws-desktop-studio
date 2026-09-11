# 📦 Contenedores — ECR, ECS/Fargate y EKS

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Módulo educativo.** El explorador consulta clusters de forma acotada; no despliega ni administra cargas.

| Ficha | Alcance |
|---|---|
| Servicios | ECR · ECS · Fargate · EKS |
| Decisión central | orquestación AWS-native frente a Kubernetes |
| Control clave | roles de workload, imágenes, red y capacidad |

## ECR
Registro de imágenes OCI/Docker.

## ECS
Orquestador AWS-native. Task Definition define contenedores; Service mantiene cantidad deseada; Cluster agrupa capacidad lógica.

## Fargate
Ejecuta tasks/pods sin administrar nodos EC2 subyacentes.

## EKS
Kubernetes administrado. Útil cuando necesitas ecosistema/API Kubernetes, pero con mayor complejidad operacional.

## Elección
ECS/Fargate suele ser más simple si no necesitas Kubernetes. EKS aporta estandarización Kubernetes a costo de más componentes y conocimiento.
