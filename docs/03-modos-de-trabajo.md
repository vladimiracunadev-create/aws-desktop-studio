# Modalidades de trabajo con AWS

## Consola web
Buena para descubrimiento y tareas puntuales. Riesgo: cambios manuales difíciles de reproducir.

## AWS CLI
Automatizable y auditable. AWS Desktop Studio usa CLI como backend inicial para aprovechar tu sesión local y cubrir muchos servicios sin almacenar secretos.

## SDK
Ideal cuando una aplicación necesita llamar AWS programáticamente. El roadmap considera migrar determinadas operaciones críticas a SDK nativo.

## Infrastructure as Code
CloudFormation/CDK/Terraform permiten describir infraestructura repetible. Recomendado para producción.

## Serverless
Lambda, API Gateway, EventBridge, SQS/SNS, DynamoDB. Reduce administración de servidores, pero exige entender límites, observabilidad y costos por uso.

## Contenedores
ECS/Fargate simplifica AWS-native; EKS entrega Kubernetes con mayor complejidad y portabilidad.

## Máquinas virtuales
EC2 entrega máximo control del sistema operativo. Implica parches, hardening, capacidad, backup y monitoreo.

## Híbrido
VPN, Direct Connect, Storage Gateway, Outposts y servicios de migración conectan on-premise con AWS.

## Multi-account
Organizations/Control Tower ayudan a separar producción, desarrollo, seguridad y facturación.

## IA/ML
Bedrock apunta a IA generativa administrada y SageMaker a workflows completos de ML.
