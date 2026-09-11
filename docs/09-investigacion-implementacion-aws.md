# Investigación de implementación efectiva de acceso e inventario AWS

## Conclusión ejecutiva

AWS Desktop Studio es una implementación en desarrollo que ya contiene componentes reales —Electron, localhost loopback, llamadas a AWS CLI, validación STS, consultas de lectura, tareas locales y empaquetado Windows—, pero todavía no constituye una solución completa de acceso o administración AWS.

El muro técnico observado no es accidental: una sesión abierta en AWS Management Console y una sesión programática son contextos de seguridad distintos. Una aplicación localhost no debe extraer cookies, contraseñas ni MFA del navegador. Necesita un proveedor oficial que produzca credenciales programáticas temporales, como AWS Login, IAM Identity Center, AssumeRole, web identity, `credential_process`, credenciales de contenedor o el perfil de instancia EC2.[^1]

AWS CLI 2.32.0 introdujo `aws login` para seleccionar una sesión de consola activa o completar una autenticación web y generar credenciales temporales. Es el mecanismo más cercano a vincular una experiencia de consola con herramientas locales, pero sigue siendo un flujo OAuth controlado por AWS: puede abrir otra ventana, requiere administrar expiración y no convierte las cookies del navegador en una API pública para localhost.[^2]

Los binarios y releases de este repositorio deben interpretarse únicamente como entregas de despliegue de una serie 0.x. Un workflow verde prueba construcción, tests unitarios, análisis estático o empaquetado según el workflow; no prueba autenticación real para todas las modalidades, renovación de sesiones, inventario completo ni preparación para producción.

## Alcance y método

La investigación contrasta tres fuentes:

1. Documentación oficial de AWS sobre proveedores de credenciales, IAM, STS, Resource Explorer y seguridad.
2. Repositorios públicos usados como referencias: AWS Toolkit for VS Code, Leapp, Granted, Steampipe AWS y LocalStack Desktop.
3. Fuentes verificables de este repositorio: código, manifests, tests, workflows, tags, releases y `git log`.

Las afirmaciones sobre AWS se apoyan prioritariamente en documentación oficial. Las comparaciones open source describen patrones observables y no implican equivalencia funcional, aval ni reutilización de código.

## 1. Consola web y acceso programático

AWS Management Console autentica una experiencia web. AWS CLI, SDKs y aplicaciones necesitan credenciales capaces de firmar solicitudes AWS Signature Version 4. La existencia de una pestaña autenticada no concede a otra origin —como `http://127.0.0.1:4173`— acceso a sus cookies ni a material de sesión.

Intentar copiar cookies desde localhost sería incorrecto por diseño:

- el aislamiento de origen del navegador impide leer cookies de `signin.aws.amazon.com` o `console.aws.amazon.com`;
- muchas cookies son `HttpOnly`, por lo que ni siquiera JavaScript del mismo sitio puede leerlas;
- OAuth usa parámetros efímeros como `state`, PKCE y `code_challenge`, que no deben reutilizarse ni guardarse;
- contraseña, MFA y recuperación de cuenta pertenecen exclusivamente a AWS;
- automatizar la recuperación de root ampliaría innecesariamente el riesgo.

El puente válido es un proveedor oficial. AWS documenta que `aws login` usa credenciales de consola existentes mediante un flujo de navegador y genera credenciales temporales utilizables por CLI y SDKs.[^2] La configuración incorpora `login_session`; el caché se guarda por defecto en `%USERPROFILE%\.aws\login\cache` en Windows. Las credenciales cortas se renuevan dentro de una sesión de hasta 12 horas y luego exigen autenticación nuevamente.[^3]

### Implicación para este repositorio

El botón de AWS Login puede iniciar el proceso y esperar su resultado, pero no puede garantizar que el navegador abierto comparta cookies con la pestaña integrada. Debe mostrar claramente cuatro estados: esperando navegador, autenticación completada, credencial temporal disponible e identidad STS validada. Cancelar, cerrar la ventana o agotar el tiempo deben devolver la UI a un estado recuperable.

## 2. Matriz de modalidades de acceso

AWS mantiene una cadena de proveedores. Cada SDK o herramienta puede variar en orden y cobertura; cuando encuentra credenciales válidas, deja de buscar. Los proveedores estandarizados intentan renovar credenciales temporales automáticamente cuando lo soportan.[^1]

| Modalidad | Uso adecuado | Ciclo de vida | Riesgo principal | Estado del repositorio |
|---|---|---|---|---|
| AWS Login / credenciales de consola | Desarrollo local con root, IAM o federación cuando AWS CLI 2.32+ esté disponible | Temporal; caché y renovación hasta el límite de sesión | Confundir pestaña web con credencial; navegador separado; expiración | Integración inicial por AWS CLI; faltan E2E, logout, expiración y reanudación |
| IAM Identity Center | Personas en organizaciones y acceso multi-cuenta centralizado | Token SSO + credenciales temporales por permission set | Precedencia de credenciales estáticas, portal/región incorrectos | Configuración y login básicos; falta descubrimiento de cuentas y permission sets |
| Perfil compartido con Access Keys | Compatibilidad heredada y casos sin alternativa temporal | Larga duración hasta rotación o revocación | Exposición local, filtración en logs/repositorio, rotación manual | Se delega a AWS CLI; la UI no debe solicitar ni mostrar claves |
| AssumeRole | Separación de privilegios y acceso entre cuentas | STS temporal; duración y encadenamiento limitados | Trust policy incorrecta, external ID, MFA, role chaining | Perfil básico con `source_profile`; faltan `credential_source`, external ID y MFA |
| Web identity / OIDC | CI, Kubernetes y federación de workloads | Token externo intercambiado por STS | Audiencia/subject demasiado amplios; archivo de token | Delegado a la cadena; sin diagnóstico ni E2E |
| `credential_process` | Brokers externos, IAM Roles Anywhere y herramientas como Granted | Depende del proceso; salida JSON temporal | Ejecuta un programa configurado localmente; riesgo de config manipulada | Detectado como tipo; falta allowlist/advertencia específica |
| ECS/EKS container provider | Workloads en contenedores AWS | Rotación administrada por rol de tarea o Pod Identity | Endpoint o token expuesto al contenedor equivocado | Delegado a AWS CLI; no probado en workloads |
| EC2 IMDS | Aplicaciones en instancias con instance profile | Rotación administrada por EC2 | SSRF, IMDS falso o configuración IMDSv1 | Delegado; falta prueba IMDSv2 y control de metadata |
| LocalStack/custom endpoint | Laboratorio local simulado | Credenciales ficticias o locales | Presentarlo erróneamente como AWS real | Futuro; debe quedar separado visual y técnicamente |

### 2.1 AWS Login

AWS recomienda credenciales de consola para desarrollo local y permite root, IAM o federación.[^4] La versión mínima documentada de AWS CLI es 2.32.0.[^2] Para herramientas que aún no entienden `login_session`, AWS documenta un perfil alternativo basado en `credential_process` y `aws configure export-credentials`.[^2]

Para identidades IAM y roles, el administrador puede necesitar autorizar `SignInLocalDevelopmentAccess`; el usuario root no usa una política IAM para este permiso. La aplicación también debe respetar la precedencia de credenciales: variables de entorno o Access Keys estáticas pueden ocultar una sesión de AWS Login o SSO válida. El modo `--remote` es un fallback cuando el navegador local no puede completar el flujo, y la salida debe contemplar `aws logout --profile` y `aws logout --all` sin borrar manualmente cachés administrados por AWS.[^2]

Requisitos pendientes:

- detectar versión mínima y capacidad antes de mostrar el botón;
- mostrar qué navegador se abrirá y que localhost permanecerá esperando;
- soportar cancelación, timeout, reintento y `aws logout`;
- mostrar expiración estimada y ARN seleccionado;
- probar selección de una sesión ya activa y autenticación desde cero;
- no afirmar que root es la opción recomendada: AWS aconseja reservarlo para tareas que realmente lo requieren.[^5]

### 2.2 IAM Identity Center

IAM Identity Center es la opción habitual para organizaciones. AWS advierte que credenciales estáticas con mayor precedencia pueden impedir que el SDK use la sesión SSO esperada.[^6] La aplicación debe detectar colisiones, identificar el portal y región de SSO, descubrir cuentas/permission sets y presentar la identidad final mediante STS.

La `sso_region` pertenece al directorio de IAM Identity Center y puede ser distinta de la región predeterminada donde se consultan recursos. Mezclarlas en un único selector produce errores difíciles de diagnosticar; la UI y el modelo interno deben conservarlas por separado.

### 2.3 AssumeRole

AssumeRole obtiene credenciales STS temporales desde `source_profile` o `credential_source`. Las opciones relevantes incluyen `duration_seconds`, `external_id`, `mfa_serial` y `role_session_name`; `source_profile` y `credential_source` no se usan simultáneamente.[^7]

El formulario actual cubre únicamente rol, perfil de origen, sesión y región. No debe considerarse soporte completo hasta validar trust policies, MFA, external ID, role chaining y orígenes Environment, EC2 o ECS.

### 2.4 Workloads y procesos externos

El proveedor de procesos ejecuta el comando definido en `credential_process`. AWS exige confiar en ese programa, proteger el archivo config y evitar que secretos se escriban en stderr.[^8] Por tanto, detectar un perfil de proceso no basta: la UI debe advertir qué ejecutable será invocado sin revelar la salida de credenciales.

Para ECS/EKS, AWS recomienda task roles y EKS Pod Identity por aislamiento, mínimo privilegio y auditabilidad.[^9] En EC2, IMDSv2 es el comportamiento seguro esperado y puede deshabilitarse la consulta de metadata en redes no confiables.[^10]

## 3. Seguridad

### 3.1 Principios obligatorios

AWS recomienda federación y credenciales temporales para personas, roles temporales para workloads, MFA, mínimo privilegio y protección especial de root.[^11] Este repositorio debe traducir esas recomendaciones en comportamiento verificable:

- no solicitar correo, contraseña, MFA, Access Key ni Secret Key en el renderer;
- no registrar stdout/stderr que pueda contener material sensible;
- ejecutar AWS CLI sin shell y con argumentos validados;
- mostrar Account y ARN de STS antes de habilitar consultas o mutaciones;
- usar lectura por defecto y confirmación inmediata para cambios;
- separar configuración no secreta de cachés y credenciales administrados por AWS;
- no publicar Account IDs, ARNs privados, URLs OAuth efímeras ni fixtures reales;
- usar perfiles y cuentas sandbox para E2E;
- registrar en CloudTrail las pruebas de operaciones autorizadas.

### 3.2 Root y recuperación MFA

AWS desaconseja Access Keys de root y recomienda usar root solo para tareas que lo exigen. Para acceso programático temporal, AWS señala `aws login` como alternativa a crear claves permanentes de root.[^5]

La verificación por correo y teléfono que aparece bajo Trouble signing in es recuperación de una identidad root protegida por MFA, no un proveedor que esta aplicación deba implementar. AWS recomienda registrar múltiples dispositivos MFA y mantener actualizados correo y teléfono de recuperación.[^12]

### 3.3 Amenazas locales

| Amenaza | Control actual | Mejora necesaria |
|---|---|---|
| Inyección de comandos | `spawn` sin shell, allowlists y validación de tokens | Fuzzing y pruebas de todos los endpoints |
| CSRF/DNS rebinding en localhost | Bind a loopback, validación Host/Origin y token anti-CSRF | Rotación por sesión, SameSite donde aplique y pruebas de navegación maliciosa |
| Exposición de credenciales | Renderer aislado; AWS CLI conserva credenciales | Redacción sistemática de errores y logs; revisión de cachés |
| Perfil equivocado | STS muestra Account/ARN | Selector persistente de cuenta/rol, alias visual y pruebas de cambio |
| Mutación accidental | Modo operativo + diálogo Electron | Plan/vista previa, autorización por acción y auditoría local |
| Dependencia comprometida | lockfile, CodeQL, Dependency Review, SBOM | Firma de artefactos, provenance/attestation y política de actualizaciones |
| Ejecutable Windows no confiable | Hash SHA-256 | Authenticode y canal de actualización verificado |

## 4. Inventario y descubrimiento de recursos

Consultar una lista fija de APIs no equivale a inventariar una cuenta. Cada servicio tiene paginación, regiones, recursos globales, permisos y modelos distintos. Un resultado vacío puede significar realmente vacío, página incompleta, región incorrecta, servicio deshabilitado o AccessDenied.

AWS Resource Explorer requiere índices y vistas. Un índice local cubre una región; un índice aggregator replica información de regiones habilitadas y permite búsquedas cross-region.[^13] Resource Explorer también es eventualmente consistente y puede entregar resultados parciales durante indexación o replicación.[^14] Las capacidades multi-cuenta dependen de la integración con AWS Organizations y configuración adicional.[^15]

La arquitectura futura debe combinar fuentes:

- Resource Explorer para búsqueda e inventario indexado;
- Resource Groups Tagging API para recursos compatibles con tagging;
- APIs nativas por servicio para detalle y recursos no cubiertos;
- Cost Explorer para uso/costo, que no es equivalente a existencia de recursos;
- AWS Config o Cloud Control como complementos opcionales, documentando costos y cobertura.
- AWS Config Aggregator cuando se necesite una vista gobernada multi-cuenta/multi-región de recursos registrados, sin presentarlo como sustituto universal de las APIs nativas.

El inventario debe producir un registro por cuenta, región, servicio, estado, fuente, timestamp y token de paginación. Nunca debe sumar silenciosamente respuestas parciales como si fueran totales.

## 5. Referencias open source

### AWS Toolkit for VS Code

El Toolkit implementa un modelo de conexión/proveedor y un AWS Explorer respaldado por SDKs. Su historial reciente añadió credenciales de consola con `aws login` y correcciones para estados de proveedor obsoletos después de renovar o sobrescribir sesiones.[^16] La lección es que completar el login no basta: los clientes y caches internos deben reconstruirse o refrescarse determinísticamente.

### Leapp

Leapp se presenta como aplicación Electron multi-cuenta que genera credenciales, rota sesiones cortas y guarda datos localmente en el vault del sistema.[^17] Su patrón relevante es un broker de sesiones explícito con ciclo de vida, no una lectura de cookies de consola.

### Granted

Granted simplifica selección y asunción de roles, admite varias cuentas abiertas en navegador y cifra credenciales cacheadas.[^18] Sus perfiles pueden integrarse mediante `credential_process`. La lección es separar identidad base, rol asumido y sesión de navegador.

### Steampipe AWS

El plugin AWS de Steampipe consulta infraestructura mediante perfiles, SSO, roles, cuentas y regiones, y soporta agregadores.[^19] Su valor como referencia está en el modelo de inventario y normalización, no en la interfaz de autenticación.

### LocalStack Desktop

LocalStack Desktop explora servicios simulados localmente.[^20] Debe aparecer como entorno de laboratorio independiente; usar su experiencia visual no permite afirmar conexión a una cuenta AWS real.

### Licencias y límites de reutilización

| Referencia | Licencia observada | Uso permitido en este proyecto |
|---|---|---|
| AWS Toolkit for VS Code | Apache-2.0 | estudiar arquitectura y reutilizar únicamente con atribución y cumplimiento de licencia |
| Leapp | MPL-2.0 | estudiar patrones; revisar obligaciones de archivos modificados antes de copiar código |
| Granted | MIT | estudiar e integrar ideas; conservar avisos si se reutiliza código |
| Steampipe AWS plugin | Apache-2.0; otros componentes de su ecosistema tienen licencias distintas | usar como referencia de inventario; revisar cada repositorio y componente por separado |
| LocalStack Desktop | licencia no asumida por este informe | referencia visual únicamente hasta verificar una licencia aplicable |

Una implementación similar no autoriza copiar su código, marca o interfaz. Antes de reutilizar cualquier fragmento se debe verificar la licencia del commit y del componente exactos.

## 6. Evolución verificada del repositorio

### Historial publicado

| Fecha | Commit/tag | Cambio verificable |
|---|---|---|
| 2026-09-07 | `4d115ee`, `v0.1.0` | Lanzamiento inicial de AWS Desktop Studio |
| 2026-09-07 | `f0a2b35`, `2fe3ec5` | Metadatos y topics del repositorio codificados |
| 2026-09-07 | `70a4e19`, `1f5afe8` | Publicación explícita y selección de artefactos distribuibles |
| 2026-09-07 | PRs `#1`–`#5`, `d4cf7e3` | Actualizaciones de acciones y runtimes de GitHub Actions |
| 2026-09-08 | `v0.1.1` | Release publicado; corrección del proceso de publicación |
| 2026-09-08 | `4256793`, `691b9ac` | Migración a pnpm y actualización de pins de Actions |

Los tags existentes son `v0.1.0` y `v0.1.1`; GitHub muestra un release publicado para `v0.1.1`. Esta cronología se conserva como historia y no se reinterpreta como madurez funcional.

### Cambios Unreleased actuales

- localhost en `127.0.0.1:4173` con API loopback, controles Host/Origin y anti-CSRF;
- pantalla inicial bloqueada hasta validar STS;
- AWS Login, perfiles, SSO, AssumeRole y cadena estándar delegados a AWS CLI;
- detección del tipo de proveedor sin mostrar secretos;
- inventario agregado experimental y consultas individuales;
- mantenimiento de identidad al cambiar región;
- centro de tareas guardado localmente;
- pruebas unitarias de constructores de comandos, SSO, AWS Login, AssumeRole y clasificación;
- documentación de límites, referencias y madurez;
- reclasificación del About, landing y releases como implementación en desarrollo.

Estos cambios no deben publicarse como una nueva solución de acceso hasta que exista una decisión de versión y se cumplan criterios E2E. El changelog Unreleased es la fuente histórica correspondiente.

## 7. Arquitectura objetivo

```text
Interfaz de conexión
  ├─ AWS Login / console credentials
  ├─ IAM Identity Center
  ├─ perfil compartido
  ├─ AssumeRole
  ├─ web identity / OIDC
  ├─ credential_process / Roles Anywhere
  └─ ECS, EKS o EC2 role
              │
              ▼
ResolvedCredentialContext
  provider · account · arn · role · region · expiresAt · refreshState
              │
              ├─ STS identity gate
              ├─ AWS SDK clients / AWS CLI adapter
              ├─ inventory engine with pagination
              └─ audit/redaction boundary
```

La interfaz no debería conocer secretos. Un adaptador por proveedor resuelve la sesión y devuelve solamente metadatos seguros. Las consultas deben consumir un contexto inmutable de cuenta/región para evitar que un cambio visual mezcle resultados de dos contextos.

## 8. Plan de implementación y pruebas

### P0 — identidad y ciclo de sesión

1. Detectar AWS CLI y versión mínima para `aws login`.
2. Modelar estados de conexión y cancelación.
3. Añadir logout, expiración y renovación.
4. Descubrir SSO accounts/roles y validar AssumeRole avanzado.
5. Crear fixtures sintéticos y harness E2E con cuentas sandbox.
6. Matriz Windows: Electron, localhost, navegador predeterminado y navegador integrado.
7. Probar AWS Login desde cero, reutilización de sesión, `--remote`, cancelación, expiración y ambos modos de logout.
8. Probar SSO con región de directorio distinta a la región de recursos, colisión con credenciales estáticas y descubrimiento multi-cuenta.
9. Probar AssumeRole con MFA, external ID, límite de role chaining y fuentes Environment/EC2/ECS.

### P1 — inventario confiable

1. Descubrir regiones habilitadas.
2. Implementar paginación y límites por servicio.
3. Integrar Resource Explorer sin activarlo automáticamente ni crear roles sin consentimiento.
4. Añadir agregación multi-cuenta/multi-región.
5. Diferenciar vacío, parcial, denegado, no soportado y error.
6. Añadir caching con cuenta/región/fuente/TTL visibles.

### P2 — distribución y seguridad operativa

1. Authenticode y provenance verificable.
2. Instalación/actualización/rollback probados.
3. Redacción estructurada de logs.
4. Accesibilidad y pruebas visuales.
5. Políticas de operación y audit trail local sin secretos.

## 9. Criterios de aceptación

Una modalidad puede marcarse soportada solo si:

- tiene un entorno sandbox reproducible;
- completa login, STS, consulta y renovación;
- maneja cancelación, expiración, red, AccessDenied y región inválida;
- nunca expone secretos al renderer, logs, fixtures o CI;
- documenta versiones mínimas y navegadores/sistemas probados;
- presenta Account, ARN, rol, región y expiración antes de operar;
- tiene pruebas negativas y evidencia revisable.

La evidencia E2E mínima debe registrar, sin secretos: versión de AWS CLI, sistema operativo, proveedor seleccionado, cuenta sandbox anonimizada, región, transición de estados, resultado de STS, operación de lectura paginada, renovación/logout y resultado esperado de los casos negativos.

## 10. Skill de investigación reutilizable

El repositorio incluye [`cloud-implementation-research-audit`](../skills/cloud-implementation-research-audit/SKILL.md), una skill general y no acoplada a AWS Desktop Studio. Puede aplicarse a repositorios AWS, Azure, Google Cloud u otros proveedores para contrastar afirmaciones del producto con código, documentación oficial vigente, seguridad, licencias, releases y pruebas E2E. La copia versionada permite auditar su evolución; puede instalarse en el catálogo personal de Codex para reutilizarla desde otros proyectos.

Una release puede marcarse candidata a producción solo si, además, el instalador está firmado, las actualizaciones son verificables, existe rollback, se publican limitaciones y la matriz de acceso soportada está verde en E2E. Hasta entonces, las versiones deben describirse como despliegues de una implementación en desarrollo.

## Fuentes

[^1]: AWS. [AWS SDKs and Tools standardized credential providers](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html).
[^2]: AWS CLI. [Login for AWS local development using console credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sign-in.html).
[^3]: AWS SDKs and Tools. [Login credentials provider](https://docs.aws.amazon.com/sdkref/latest/guide/feature-login-credentials.html).
[^4]: AWS SDKs and Tools. [Using console credentials to authenticate AWS SDKs and tools](https://docs.aws.amazon.com/sdkref/latest/guide/access-login.html).
[^5]: AWS IAM. [Root user best practices for your AWS account](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html).
[^6]: AWS SDKs and Tools. [Using IAM Identity Center to authenticate AWS SDKs and tools](https://docs.aws.amazon.com/sdkref/latest/guide/access-sso.html).
[^7]: AWS SDKs and Tools. [Assume role credential provider](https://docs.aws.amazon.com/sdkref/latest/guide/feature-assume-role-credentials.html).
[^8]: AWS SDKs and Tools. [Process credential provider](https://docs.aws.amazon.com/sdkref/latest/guide/feature-process-credentials.html).
[^9]: AWS SDKs and Tools. [Container credential provider](https://docs.aws.amazon.com/sdkref/latest/guide/feature-container-credentials.html).
[^10]: AWS SDKs and Tools. [IMDS credential provider](https://docs.aws.amazon.com/sdkref/latest/guide/feature-imds-credentials.html).
[^11]: AWS IAM. [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).
[^12]: AWS IAM. [Recover an MFA protected identity in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa_lost-or-broken.html).
[^13]: AWS Resource Explorer. [Index API](https://docs.aws.amazon.com/resource-explorer/latest/apireference/API_Index.html).
[^14]: AWS Resource Explorer. [Using Resource Explorer to search for resources](https://docs.aws.amazon.com/resource-explorer/latest/userguide/using-search.html).
[^15]: AWS Resource Explorer. [What is AWS Resource Explorer?](https://docs.aws.amazon.com/resource-explorer/latest/userguide/welcome.html).
[^16]: AWS. [AWS Toolkit for Visual Studio Code](https://github.com/aws/aws-toolkit-vscode) y [changelog](https://github.com/aws/aws-toolkit-vscode/blob/master/packages/toolkit/CHANGELOG.md).
[^17]: Noovolari. [Leapp](https://github.com/Noovolari/leapp).
[^18]: Common Fate. [Granted](https://github.com/fwdcloudsec/granted).
[^19]: Turbot. [AWS plugin for Steampipe](https://github.com/turbot/steampipe-plugin-aws).
[^20]: LocalStack. [LocalStack Desktop](https://github.com/localstack/localstack-desktop).
