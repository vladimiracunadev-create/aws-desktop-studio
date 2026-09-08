<div align="center">
  <img src="assets/aws-desktop-studio.svg" width="900" alt="AWS Desktop Studio — AWS local-first para Windows" />

  # AWS Desktop Studio

  **Explora tu cuenta AWS desde Windows con tu sesión local, controles explícitos y aprendizaje integrado.**

  [![CI](https://github.com/vladimiracunadev-create/aws-desktop-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/vladimiracunadev-create/aws-desktop-studio/actions/workflows/ci.yml)
  [![CodeQL](https://github.com/vladimiracunadev-create/aws-desktop-studio/actions/workflows/codeql.yml/badge.svg)](https://github.com/vladimiracunadev-create/aws-desktop-studio/actions/workflows/codeql.yml)
  [![Pages](https://github.com/vladimiracunadev-create/aws-desktop-studio/actions/workflows/pages.yml/badge.svg)](https://vladimiracunadev-create.github.io/aws-desktop-studio/)
  [![License: MIT](https://img.shields.io/badge/license-MIT-22c55e.svg)](LICENSE)
  [![Windows](https://img.shields.io/badge/platform-Windows-38bdf8.svg)](#requisitos)

  [Sitio](https://vladimiracunadev-create.github.io/aws-desktop-studio/) · [Inicio rápido](#inicio-rápido) · [Documentación](#documentación) · [Seguridad](SECURITY.md) · [Roadmap](ROADMAP.md)
</div>

---

> **Estado verificable — v0.1.0 OPERATIVO.** El explorador consulta recursos reales con AWS CLI v2. Las únicas mutaciones implementadas son iniciar, detener y reiniciar instancias EC2 existentes; requieren activar manualmente el modo operativo y confirmar cada acción. El proyecto no crea infraestructura.

## Qué demuestra

AWS Desktop Studio reúne administración, laboratorio y tutorial en una aplicación Electron local-first:

- detecta perfiles de AWS CLI e IAM Identity Center/SSO sin copiar credenciales;
- valida la identidad activa con AWS STS;
- consulta 16 servicios reales y presenta su respuesta de forma legible;
- incorpora 20 tutoriales y un catálogo de 28 servicios/capacidades;
- separa lectura y mutación con controles visibles y confirmación;
- ejecuta AWS CLI con argumentos estructurados, `shell: false`, renderer aislado y permisos del navegador denegados;
- publica instalador NSIS y versión portable mediante un release reproducible con SBOM y SHA-256.

## Inicio rápido

### Requisitos

- Windows 10/11 x64.
- Node.js 22 LTS para desarrollo.
- AWS CLI v2 disponible en `PATH`.
- Un perfil AWS válido; se recomienda IAM Identity Center/SSO.

```powershell
aws configure sso
aws sso login --profile mi-perfil
aws sts get-caller-identity --profile mi-perfil
```

### Ejecutar desde código

```powershell
git clone https://github.com/vladimiracunadev-create/aws-desktop-studio.git
cd aws-desktop-studio
npm ci
npm run verify
npm start
```

La aplicación selecciona `sa-east-1` inicialmente, intenta adoptar la región del perfil elegido y nunca almacena Access Keys ni tokens.

### Construir Windows

```powershell
npm run dist:win
```

El pipeline de release genera dos ejecutables diferenciados —Setup y Portable—, un SBOM CycloneDX y `SHA256SUMS.txt`. Los binarios comunitarios no están firmados con un certificado comercial; Windows puede mostrar una advertencia SmartScreen.

## Cobertura funcional

| Área | Servicios con consulta real | Resultado |
|---|---|---|
| Identidad | STS | cuenta y ARN efectivos |
| Cómputo | EC2 | instancias; start/stop/reboot con doble control |
| Storage | S3 | buckets y fecha de creación |
| Serverless | Lambda | runtime, memoria, timeout y modificación |
| Datos | RDS, DynamoDB | instancias DB y tablas |
| Redes | VPC | CIDR, estado y VPC por defecto |
| Seguridad | IAM, Secrets Manager | roles y metadatos; nunca valores secretos |
| Observabilidad / IaC | CloudWatch Logs, CloudFormation | grupos de logs y stacks |
| Contenedores | ECS, EKS | clusters |
| Integración | API Gateway, SQS, SNS | APIs, colas y topics |
| FinOps | Cost Explorer | costo no amortizado del mes actual |

Bedrock, SageMaker, Redshift, Glue, Athena, Route 53, CloudFront, WAF, Organizations, Backup, CodePipeline y Migration Hub/DMS están documentados como módulos educativos; no se presentan como integraciones operativas.

## Modelo de seguridad

```text
Renderer aislado
  contextIsolation: true · nodeIntegration: false · sandbox: true
        │ API mínima con contextBridge
        ▼
Proceso principal Electron
  navegación/ventanas/permisos bloqueados
        │ spawn("aws", args, { shell: false })
        ▼
AWS CLI v2 ── perfil/SSO local ── IAM y APIs AWS
```

Controles principales:

- lectura por defecto y modo operativo opt-in;
- confirmación nativa inmediatamente antes de cada mutación EC2;
- allowlist de comandos, acciones, protocolos y nombres de tutorial;
- validación estricta de perfil, región e Instance ID;
- `AWS_PAGER` desactivado, timeout por operación y sin shell intermedio;
- CSP restrictiva, permisos web denegados y bloqueo de navegación emergente;
- CI multi-OS, auditoría npm, Dependency Review, CodeQL y Dependabot.

AWS IAM continúa siendo la autoridad final. La aplicación no amplía los permisos del perfil elegido.

## Documentación

| Ruta | Objetivo |
|---|---|
| [Instalación y conexión](docs/01-instalacion-y-conexion.md) | AWS CLI, SSO y perfiles |
| [Modelo mental AWS](docs/02-modelo-mental-aws.md) | cuenta, región, servicio y recurso |
| [Modos de trabajo](docs/03-modos-de-trabajo.md) | lectura, operación y confirmaciones |
| [Seguridad y costos](docs/04-seguridad-y-costos.md) | límites, IAM y FinOps |
| [Laboratorios](docs/05-laboratorios.md) | práctica guiada |
| [Troubleshooting](docs/06-troubleshooting.md) | diagnóstico frecuente |
| [Arquitectura interna](docs/07-arquitectura-interna.md) | procesos, IPC y amenazas |
| [Mapa de servicios](docs/aws-service-map.md) | catálogo completo |
| [Evidencia verificable](docs/VERIFICATION.md) | pruebas y fuentes de verdad |

## Desarrollo y contribución

```powershell
npm ci
npm run check
npm test
npm run test:coverage
npm audit --audit-level=high
```

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir un cambio. Las operaciones mutables nuevas deben incorporar allowlist, validación, confirmación, pruebas y documentación del impacto/costo.

## Alcance honesto

Este repositorio sí contiene una aplicación ejecutable y consultas AWS reales. No contiene un SDK propio, no reemplaza la consola de AWS, no administra credenciales, no aprovisiona infraestructura y no promete cobertura total del catálogo AWS. Las firmas comerciales y distribución en Microsoft Store están fuera del alcance de v0.1.0.

## Licencia y marcas

[MIT](LICENSE). AWS, Amazon Web Services y los nombres de sus servicios son marcas de Amazon.com, Inc. o sus afiliadas. Este proyecto es independiente y no es un producto oficial de AWS.
