# 📈 Datos y analítica

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Módulo educativo.** Estos servicios están documentados como arquitectura, no integrados operacionalmente.

| Ficha | Alcance |
|---|---|
| Servicios | Glue · Athena · Redshift · EMR |
| Decisión central | catálogo, consulta serverless, warehouse o procesamiento distribuido |
| Control clave | clasificación, partición, cifrado y costo por escaneo |

## Glue
Catálogo y procesos de integración/ETL.

## Athena
SQL serverless sobre datos, habitualmente en S3. El diseño del formato/particionado afecta costo y rendimiento.

## Redshift
Data warehouse para analítica SQL a escala.

## EMR
Procesamiento big data administrado con ecosistemas como Spark.

Patrón: fuentes -> S3 data lake -> catálogo Glue -> transformación -> Athena/Redshift -> BI.
