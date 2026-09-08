# Contenedores — ECR, ECS/Fargate y EKS

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
