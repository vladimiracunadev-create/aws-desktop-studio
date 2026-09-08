# Changelog

## 0.1.1 - 2026-09-07

- Desactiva la publicación implícita de electron-builder; el workflow dedicado publica los artefactos de forma explícita.

## 0.1.0 - 2026-09-07

- Aplicación Electron para Windows.
- Detección de perfiles AWS CLI.
- Compatibilidad con sesiones IAM Identity Center mediante `aws sso login`.
- Validación de identidad por STS.
- Exploración real de 16 áreas AWS.
- Acciones EC2 controladas: start/stop/reboot.
- Modo lectura por defecto.
- Tutoriales integrados y mapa de modalidades AWS.
- Ocho pruebas deterministas y 100 % de cobertura del constructor de comandos.
- Electron 44.2.0 y auditoría npm sin vulnerabilidades conocidas al publicar.
- GitHub Actions con pins SHA para CI multi-OS, CodeQL, build/release Windows y Pages.
- Instalador y portable diferenciados, SBOM CycloneDX y checksums SHA-256.
- Landing responsive, identidad visual, About y documentación de evidencia.
