# Datos y analítica

## Glue
Catálogo y procesos de integración/ETL.

## Athena
SQL serverless sobre datos, habitualmente en S3. El diseño del formato/particionado afecta costo y rendimiento.

## Redshift
Data warehouse para analítica SQL a escala.

## EMR
Procesamiento big data administrado con ecosistemas como Spark.

Patrón: fuentes -> S3 data lake -> catálogo Glue -> transformación -> Athena/Redshift -> BI.
