# Arquitectura interna

## Frontera de confianza

El renderer no tiene acceso directo a Node.js ni al filesystem. Solo consume un conjunto pequeño de funciones expuestas por `preload.js`.

```text
Renderer (no Node)
   |
   | IPC allowlist
   v
Preload/contextBridge
   |
   v
Main process
   |
   +-- validación de entradas
   +-- confirmaciones
   +-- spawn sin shell
   v
AWS CLI v2
```

## Por qué AWS CLI como backend v0.1

- Reutiliza perfiles, SSO y roles existentes.
- No obliga a implementar almacenamiento de credenciales.
- Permite prototipar soporte multi-servicio rápidamente.
- El mismo comando puede reproducirse manualmente para diagnóstico.

## Futuro SDK

Operaciones complejas pueden migrarse a AWS SDK para obtener tipado, paginación y experiencia más rica. La identidad seguirá delegada a proveedores estándares de AWS.

## Controles

- Content Security Policy.
- `contextIsolation: true`.
- `nodeIntegration: false`.
- `sandbox: true`.
- permisos web denegados.
- navegación y ventanas emergentes bloqueadas.
- `shell:false`.
- validación de perfil/región/IDs.
- lectura por defecto.
- diálogo nativo antes de cambios EC2.
