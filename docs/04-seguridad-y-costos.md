# Seguridad y costos

## Seguridad mínima

- IAM Identity Center y MFA para acceso humano.
- Roles temporales antes que claves permanentes.
- Menor privilegio.
- No trabajar cotidianamente como root.
- CloudTrail para auditoría.
- KMS para cifrado administrado.
- Secrets Manager/Parameter Store para secretos/configuración.
- Security Groups/NACL según diseño, nunca abrir puertos globalmente por comodidad.
- Backups y pruebas reales de restauración.

## Costos

AWS cobra por combinaciones de tiempo, capacidad, solicitudes, transferencia, almacenamiento y características administradas.

Antes de crear infraestructura:

1. estima precio;
2. crea budget/alerta;
3. define tags de costo;
4. mide utilización;
5. elimina recursos de laboratorio cuando termines.

Servicios que suelen generar sorpresas: NAT Gateway, transferencia de datos, almacenamiento/snapshots olvidados, RDS/EC2 24x7, logs sin retención y clusters administrados.
