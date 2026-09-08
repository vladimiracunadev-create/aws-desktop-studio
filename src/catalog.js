'use strict';

const services = [
  { key: 'ec2', name: 'EC2', category: 'Cómputo', operational: true, tutorial: 'ec2.md', summary: 'Máquinas virtuales escalables. Lista instancias y permite iniciar, detener o reiniciar con modo operativo.' },
  { key: 's3', name: 'Amazon S3', category: 'Almacenamiento', operational: true, tutorial: 's3.md', summary: 'Almacenamiento de objetos, buckets, versionado, cifrado, lifecycle y políticas.' },
  { key: 'lambda', name: 'AWS Lambda', category: 'Serverless', operational: true, tutorial: 'lambda.md', summary: 'Ejecución de funciones sin administrar servidores.' },
  { key: 'rds', name: 'Amazon RDS', category: 'Bases de datos', operational: true, tutorial: 'rds.md', summary: 'Bases de datos relacionales administradas.' },
  { key: 'dynamodb', name: 'DynamoDB', category: 'Bases de datos', operational: true, tutorial: 'dynamodb.md', summary: 'Base NoSQL key-value/document de baja latencia.' },
  { key: 'vpc', name: 'Amazon VPC', category: 'Redes', operational: true, tutorial: 'vpc.md', summary: 'Redes privadas virtuales, subredes, rutas, gateways y seguridad de red.' },
  { key: 'iam', name: 'IAM', category: 'Seguridad', operational: true, tutorial: 'iam.md', summary: 'Identidades, roles, políticas y principio de mínimo privilegio.' },
  { key: 'secrets', name: 'Secrets Manager', category: 'Seguridad', operational: true, tutorial: 'secrets-manager.md', summary: 'Gestión y rotación de secretos. La app solo lista metadatos; no revela valores.' },
  { key: 'cloudwatch', name: 'CloudWatch', category: 'Observabilidad', operational: true, tutorial: 'cloudwatch.md', summary: 'Métricas, logs, alarmas y observabilidad.' },
  { key: 'cloudformation', name: 'CloudFormation', category: 'IaC', operational: true, tutorial: 'cloudformation.md', summary: 'Infraestructura como código nativa de AWS.' },
  { key: 'ecs', name: 'Amazon ECS', category: 'Contenedores', operational: true, tutorial: 'containers.md', summary: 'Orquestación de contenedores administrada por AWS.' },
  { key: 'eks', name: 'Amazon EKS', category: 'Contenedores', operational: true, tutorial: 'containers.md', summary: 'Kubernetes administrado.' },
  { key: 'apigateway', name: 'API Gateway', category: 'Integración', operational: true, tutorial: 'api-integration.md', summary: 'Publicación y control de APIs REST/HTTP/WebSocket.' },
  { key: 'sqs', name: 'Amazon SQS', category: 'Integración', operational: true, tutorial: 'api-integration.md', summary: 'Colas administradas para desacoplar sistemas.' },
  { key: 'sns', name: 'Amazon SNS', category: 'Integración', operational: true, tutorial: 'api-integration.md', summary: 'Mensajería pub/sub y notificaciones.' },
  { key: 'cost', name: 'Cost Explorer', category: 'FinOps', operational: true, tutorial: 'cost-finops.md', summary: 'Vista resumida del costo no amortizado del mes actual.' },
  { key: 'bedrock', name: 'Amazon Bedrock', category: 'IA/ML', operational: false, tutorial: 'ai-ml.md', summary: 'Modelos fundacionales, agentes, knowledge bases y guardrails.' },
  { key: 'sagemaker', name: 'Amazon SageMaker', category: 'IA/ML', operational: false, tutorial: 'ai-ml.md', summary: 'Construcción, entrenamiento y despliegue de ML.' },
  { key: 'redshift', name: 'Amazon Redshift', category: 'Datos', operational: false, tutorial: 'data-analytics.md', summary: 'Data warehouse administrado.' },
  { key: 'glue', name: 'AWS Glue', category: 'Datos', operational: false, tutorial: 'data-analytics.md', summary: 'Catálogo, integración y ETL/ELT.' },
  { key: 'athena', name: 'Amazon Athena', category: 'Datos', operational: false, tutorial: 'data-analytics.md', summary: 'SQL serverless sobre datos en S3.' },
  { key: 'route53', name: 'Route 53', category: 'Redes', operational: false, tutorial: 'networking-edge.md', summary: 'DNS, dominios y health checks.' },
  { key: 'cloudfront', name: 'CloudFront', category: 'Redes', operational: false, tutorial: 'networking-edge.md', summary: 'CDN y entrega global de contenido.' },
  { key: 'waf', name: 'AWS WAF', category: 'Seguridad', operational: false, tutorial: 'security-governance.md', summary: 'Filtrado y protección de aplicaciones web.' },
  { key: 'organizations', name: 'AWS Organizations', category: 'Gobierno', operational: false, tutorial: 'security-governance.md', summary: 'Gobierno multi-cuenta y políticas SCP.' },
  { key: 'backup', name: 'AWS Backup', category: 'Resiliencia', operational: false, tutorial: 'resilience-dr.md', summary: 'Políticas y bóvedas centralizadas de backup.' },
  { key: 'codepipeline', name: 'CodePipeline', category: 'DevTools', operational: false, tutorial: 'devops.md', summary: 'Orquestación CI/CD.' },
  { key: 'migration', name: 'Migration Hub / DMS', category: 'Migración', operational: false, tutorial: 'hybrid-migration.md', summary: 'Migración de cargas y bases de datos hacia AWS.' }
];

module.exports = { services };
