# Referencias open source y plan de madurez

Fecha de revisión: 2026-09-10.

## Propósito

AWS Desktop Studio es una implementación en desarrollo. Los proyectos siguientes se estudian como referencias de arquitectura y experiencia de usuario; no se presenta compatibilidad total con ellos ni se copia su código. Cada proyecto conserva su propia licencia.

## Qué hacen realmente los productos similares

| Referencia | Patrón de acceso real | Aprendizaje aplicable |
|---|---|---|
| [AWS Toolkit for VS Code](https://github.com/aws/aws-toolkit-vscode) | Selecciona proveedores AWS, valida conexiones y construye clientes SDK. Las versiones recientes incorporan credenciales de consola mediante `aws login`. | Un asistente debe identificar el proveedor, mostrar la identidad efectiva y manejar renovación/cancelación sin confundir consola web con credenciales programáticas. |
| [Leapp](https://github.com/Noovolari/leapp) | Administra estrategias de acceso, genera credenciales temporales, rota sesiones y protege datos locales mediante el vault del sistema. | Separar perfiles persistentes de sesiones temporales, mostrar expiración y soportar múltiples cuentas sin guardar secretos en la interfaz. |
| [Granted](https://github.com/fwdcloudsec/granted) | Descubre y asume roles, usa SSO y `credential_process`, y abre varias cuentas con aislamiento del navegador. | Priorizar roles temporales, cambio explícito de cuenta/rol y procesos externos de credenciales. |
| [Steampipe AWS](https://github.com/turbot/steampipe-plugin-aws) | Consulta recursos mediante perfiles, SSO, roles, regiones y agregadores multi-cuenta. | El inventario debe ser paginado, multi-región, multi-cuenta y transparente frente a errores IAM parciales. |
| [LocalStack Desktop](https://github.com/localstack/localstack-desktop) | Explora servicios AWS simulados en un entorno local. | Mantener LocalStack como modalidad separada: no confundir simulación local con una cuenta AWS real. |

## Conclusión técnica

Ninguna referencia obtiene permisos AWS leyendo arbitrariamente las cookies de una pestaña abierta. Los patrones válidos son proveedores de credenciales, OAuth/OIDC administrado por AWS, IAM Identity Center, perfiles compartidos, `credential_process`, AssumeRole y roles de workload. La consola web puede participar en el inicio de sesión, pero la aplicación necesita credenciales programáticas temporales y debe confirmar la identidad con STS.

Por ello, este repositorio usa AWS CLI como backend inicial. Es una decisión de prototipo que permite comprobar identidad y consultas reales sin implementar almacenamiento de secretos. No significa que el ciclo completo de acceso para todos los usuarios esté resuelto.

## Estado frente a las referencias

| Capacidad | Estado actual | Brecha |
|---|---|---|
| AWS Login | Prototipo funcional mediante AWS CLI | Mejorar manejo de cancelación, expiración, navegador separado y reanudación visual. |
| IAM Identity Center | Configuración y login básicos | Descubrir cuentas/permission sets y renovar sesiones de forma clara. |
| Perfiles compartidos | Detectados por AWS CLI | Mostrar procedencia, expiración y errores sin inspeccionar secretos. |
| AssumeRole | Creación básica de perfiles | Validar cadenas, MFA, external ID y saltos multi-cuenta. |
| Workload/OIDC/process | Delegado a la cadena AWS CLI | Diagnóstico específico por proveedor y pruebas en EC2/ECS/EKS. |
| Inventario | Consultas de lectura para 15 integraciones agregadas y 16 áreas individuales contando Cost Explorer | Añadir paginación, cobertura, etiquetado, regiones dinámicas y agregadores multi-cuenta. |
| Aplicación Windows | Electron, Setup y Portable | Firma de código, actualizaciones, accesibilidad y pruebas visuales instaladas. |
| Localhost | API loopback con controles básicos | Mejorar ciclo de vida, mensajes, recuperación y pruebas end-to-end. |

## Prioridades de mejora

### P0 — acceso comprensible y verificable

- Un asistente único que pregunte la modalidad antes de ejecutar acciones.
- Estado explícito: navegador, credencial temporal, expiración, STS, cuenta, ARN y región.
- Cancelación y reintento sin dejar la interfaz bloqueada.
- Renovación de `aws login` y SSO con mensajes específicos.
- Pruebas end-to-end separadas para root de laboratorio, IAM, federación, SSO, AssumeRole y cadena del entorno.
- Nunca pedir contraseña, MFA, Access Key o Secret Key en el renderer.

### P1 — exploración real y multi-entorno

- Inventario paginado y multi-región.
- Múltiples cuentas y roles con selector inequívoco.
- Regiones habilitadas descubiertas desde AWS, no una lista estática.
- Estado parcial por servicio: autorizado, vacío, no disponible o denegado.
- Resource Explorer, Resource Groups Tagging API y Cost Explorer como fuentes complementarias, documentando sus límites.
- Migrar consultas adecuadas al AWS SDK manteniendo la cadena estándar de proveedores.

### P2 — producto Windows maduro

- Firma Authenticode y reputación de instalador.
- Actualizaciones seguras y rollback.
- Almacenamiento de preferencias no sensibles en vault cuando corresponda.
- Telemetría únicamente opt-in y sin identificadores AWS.
- Accesibilidad, internacionalización y pruebas de interfaz automatizadas.
- Auditoría local de operaciones sin secretos.

## Criterio para considerar resuelto el acceso AWS

Una versión futura podrá declarar acceso resuelto únicamente cuando cada modalidad soportada tenga prueba end-to-end reproducible, renovación y expiración documentadas, identidad STS visible, manejo de cancelación, pruebas negativas y una matriz pública de compatibilidad por sistema operativo. Tener localhost, un ejecutable Windows o un tag publicado no satisface por sí solo este criterio.
