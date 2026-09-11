# 🗄️ Amazon RDS / Aurora

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Módulo educativo.** La aplicación lista instancias; no se conecta a motores ni consulta datos.

| Ficha | Alcance |
|---|---|
| Servicios | Amazon RDS · Aurora |
| Decisión central | motor, disponibilidad, capacidad y operación administrada |
| Control clave | red privada, cifrado, backups y restauración probada |

Bases SQL administradas. AWS automatiza parte de backups, patching y disponibilidad según configuración.

## Motores
MySQL, PostgreSQL, MariaDB, Oracle, SQL Server y Aurora según servicio/región.

## Conceptos
DB instance/class, storage, subnet group, security group, parameter group, backup window, Multi-AZ, read replicas y snapshots.

## Producción
No expongas la base públicamente sin razón. Usa subredes privadas, cifrado, backup/PITR, monitoreo y secretos gestionados.
