# Instalación y conexión

## 1. Instala AWS CLI v2

Verifica:

```powershell
aws --version
```

## 2. Elige un modelo de identidad

### A. IAM Identity Center (recomendado para personas/organizaciones)

```powershell
aws configure sso
aws sso login --profile mi-sso
aws sts get-caller-identity --profile mi-sso
```

El login abre el navegador y genera credenciales temporales. La aplicación invoca el mismo mecanismo.

### B. Perfil compartido

```powershell
aws configure --profile laboratorio
```

Evita access keys de larga duración cuando puedas usar SSO/roles.

### C. Roles

Un perfil puede asumir un rol configurado en `~/.aws/config`. AWS CLI resolverá la cadena y la aplicación heredará el resultado.

## 3. Ejecuta AWS Desktop Studio

1. Elige un perfil.
2. Elige región (por defecto la UI propone `sa-east-1`).
3. Pulsa **Validar sesión**.
4. Comprueba Account y ARN.
5. Selecciona un servicio.
6. Consulta recursos.

## 4. Si expira SSO

Pulsa **SSO Login** o ejecuta:

```powershell
aws sso login --profile mi-sso
```

## Errores comunes

- `Unable to locate credentials`: perfil no autenticado/configurado.
- `ExpiredToken`: renueva SSO o credenciales temporales.
- `AccessDenied`: la sesión es válida, pero IAM no permite esa operación.
- `Could not connect to endpoint`: región incorrecta, red/proxy/firewall o servicio no disponible.
