# 🕒 Changelog

[**← README**](README.md) · [**📊 Estado actual**](PROJECT_STATUS.md) · [**📦 Publicación**](RELEASE.md)

> [!IMPORTANT]
> Este archivo conserva historia. Las cifras y afirmaciones bajo versiones publicadas no se reescriben para representar el estado actual.

## 🚧 Unreleased

- Renueva los 44 documentos Markdown con un sistema visual coherente: navegación, iconos semánticos, tablas, callouts, fichas educativas y diagramas Mermaid verificables.
- Reclasifica públicamente el repositorio como implementación en desarrollo y aclara que los releases 0.x representan despliegues iniciales, no una solución terminada de acceso AWS.
- Añade un análisis de AWS Toolkit, Leapp, Granted, Steampipe y LocalStack como referencias, con brechas, prioridades y criterios de madurez.
- Incorpora una investigación extensa y citada sobre proveedores AWS, seguridad, inventario, evolución del repositorio y criterios de aceptación end-to-end.
- Añade la skill general `cloud-implementation-research-audit`, reutilizable en repositorios de distintos proveedores cloud.
- Añade advertencias equivalentes al README, estado, roadmap, landing, About y futuras notas de release Windows.
- Migra instalación, scripts, CI, documentación y lockfile a pnpm 11.19.0.
- Añade una pantalla inicial de conexión que bloquea el explorador hasta validar la identidad con STS.
- Permite configurar un perfil SSO nuevo y abrir la consola AWS de la región elegida desde la aplicación.
- Incorpora un centro de tareas local con servicio, prioridad, fecha y estado.
- Corrige el diagnóstico de plataforma importando el módulo `os` requerido.
- Añade `pnpm run start:web` para ejecutar la interfaz en `127.0.0.1:4173` y consultar la sesión AWS local mediante una API loopback protegida.
- Amplía el onboarding con todos los campos no secretos de IAM Identity Center y luego unifica root, IAM y federación en una sola acción AWS Login.
- Convierte el acceso de consola en una conexión programática real mediante el proveedor oficial `aws login`, seguida de validación STS.
- Añade perfiles AssumeRole, cadena estándar de credenciales para workloads e inventario agregado con visibilidad de denegaciones IAM.
- Ordena las modalidades de acceso con credenciales de consola como prioridad, detecta el tipo de proveedor y muestra el progreso navegador → credencial temporal → STS.
- Conserva la identidad validada al cambiar de región y aclara que AWS Login abre una ventana oficial separada mientras localhost continúa esperando.

## 📦 0.1.1 — 2026-09-07

- Desactiva la publicación implícita de electron-builder; el workflow dedicado publica los artefactos de forma explícita.

## 📦 0.1.0 — 2026-09-07

- Aplicación Electron para Windows.
- Detección de perfiles AWS CLI.
- Compatibilidad con sesiones IAM Identity Center mediante `aws sso login`.
- Validación de identidad por STS.
- Exploración real de 16 áreas AWS.
- Acciones EC2 controladas: start/stop/reboot.
- Modo lectura por defecto.
- Tutoriales integrados y mapa de modalidades AWS.
- Ocho pruebas deterministas y 100 % de cobertura del constructor de comandos.
- Electron 44.2.0 y auditoría de dependencias sin vulnerabilidades conocidas al publicar.
- GitHub Actions con pins SHA para CI multi-OS, CodeQL, build/release Windows y Pages.
- Instalador y portable diferenciados, SBOM CycloneDX y checksums SHA-256.
- Landing responsive, identidad visual, About y documentación de evidencia.
