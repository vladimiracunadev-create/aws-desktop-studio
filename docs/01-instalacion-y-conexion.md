# 🚀 Instalación y conexión

[**← README**](../README.md) · [**🪪 Modelo de identidad**](02-modelo-mental-aws.md) · [**🧰 Troubleshooting**](06-troubleshooting.md) · [**🔒 Seguridad**](../SECURITY.md)

> [!IMPORTANT]
> El correo, contraseña, MFA y factores alternativos se introducen exclusivamente en páginas oficiales de AWS. AWS Desktop Studio sólo recibe el resultado programático administrado por AWS CLI.

```mermaid
flowchart LR
    C["1 · ✅ AWS CLI"] --> P["2 · 🪪 Proveedor"]
    P --> L["3 · 🔐 Login oficial"]
    L --> S["4 · ✅ Validación STS"]
    S --> W["5 · 🖥️ Workspace"]

    style C fill:#1f6feb,color:#fff
    style P fill:#8957e5,color:#fff
    style L fill:#ff9900,color:#111
    style S fill:#2da44e,color:#fff
    style W fill:#21262d,color:#fff
```

## 1. ⚙️ Instala AWS CLI v2

Verifica:

```powershell
aws --version
```

## 2. 🪪 Elige un modelo de identidad

### A. AWS Login (root, usuario IAM o identidad federada)

Ejecuta `aws login --profile aws-login` o pulsa **Entrar con AWS Login**. AWS CLI abre la autenticación oficial y obtiene credenciales temporales. Cuando termina, la aplicación valida automáticamente Account y ARN mediante STS. La aplicación no lee cookies, contraseñas ni MFA.

### B. IAM Identity Center (recomendado para organizaciones)

```powershell
aws configure sso
aws sso login --profile mi-sso
aws sts get-caller-identity --profile mi-sso
```

El login abre el navegador y genera credenciales temporales. La aplicación invoca el mismo mecanismo.

La pantalla inicial también puede crear esta configuración solicitando:

- nombre de la sesión SSO;
- SSO Start URL o Issuer URL;
- región donde reside IAM Identity Center;
- AWS Account ID y rol/permission set;
- nombre del perfil y región predeterminada.

El registration scope se fija en `sso:account:access`. Al guardar se modifica el archivo compartido `~/.aws/config`, después de una confirmación explícita.

### C. Perfil compartido

```powershell
aws configure --profile laboratorio
```

Evita access keys de larga duración cuando puedas usar SSO/roles.

### D. Roles y otras cargas

La pantalla puede crear un perfil AssumeRole indicando perfil de origen, ARN del rol y región. La opción **Cadena automática AWS** omite `--profile`, lo que permite a AWS CLI resolver variables de entorno, `credential_process` y roles de carga EC2/ECS/EKS.

## 3. 🖥️ Ejecuta AWS Desktop Studio

Aplicación Electron:

```powershell
pnpm start
```

Interfaz en navegador local:

```powershell
pnpm run start:web
```

Después abre `http://127.0.0.1:4173`. Este servidor solo acepta conexiones loopback y reutiliza la sesión de AWS CLI del mismo usuario de Windows.

1. En la pantalla inicial, pulsa **Entrar con AWS Login** o elige un perfil/proveedor existente.
2. Para una organización, configura IAM Identity Center o crea un perfil AssumeRole.
3. Elige región (por defecto la UI propone `sa-east-1`).
4. Pulsa **Iniciar sesión SSO** si la sesión expiró.
5. Pulsa **Verificar y entrar**.
6. Comprueba Account y ARN; el explorador solo se habilita después de esta validación.
7. Pulsa **Inventario de la cuenta** para consultar todas las integraciones permitidas o selecciona un servicio concreto.

**Abrir consola AWS** solamente abre la consola oficial. Para conectar esa identidad a la aplicación se debe usar **AWS Login**, que realiza el intercambio oficial mediante AWS CLI; la aplicación local nunca extrae cookies.

AWS Login acepta la identidad que AWS autorice en el navegador —root, IAM o federada— sin duplicar formularios de acceso en la interfaz local. El usuario o email, contraseña, desafío de seguridad y MFA siempre se completan en las páginas oficiales de AWS; la aplicación no solicita ni conserva esos valores.

AWS CLI abre esa autenticación en una ventana oficial separada. La pestaña localhost permanece abierta esperando el resultado. Cambiar de región después de validar la identidad no cierra la sesión: conserva Account y ARN, limpia solamente los resultados regionales y permite consultar nuevamente.

Si el MFA habitual no está disponible, AWS puede mostrar **Trouble signing in?** y factores alternativos que verifican el correo y el teléfono asociados a la cuenta. Este es un mecanismo de recuperación administrado íntegramente por AWS, no por AWS Desktop Studio. Para uso frecuente, registra uno o más dispositivos MFA funcionales en vez de depender diariamente de la recuperación.

El modo localhost permite consultas de identidad y recursos. Las acciones mutables sobre EC2 se mantienen deshabilitadas allí; utiliza Electron para disponer de confirmación nativa antes de cada cambio.

## 4. ✅ Centro de tareas

Después de validar la cuenta, abre **Mis tareas** para registrar pendientes locales, asociarlos a un servicio, asignar prioridad y fecha, y moverlos entre pendiente, en curso y completado. La lista se guarda solamente en el equipo y no se sincroniza con servicios AWS.

## 5. 🔄 Si expira SSO

Pulsa **SSO Login** o ejecuta:

```powershell
aws sso login --profile mi-sso
```

## 🧰 Errores comunes

- `Unable to locate credentials`: perfil no autenticado/configurado.
- `ExpiredToken`: renueva SSO o credenciales temporales.
- `AccessDenied`: la sesión es válida, pero IAM no permite esa operación.
- `Could not connect to endpoint`: región incorrecta, red/proxy/firewall o servicio no disponible.
