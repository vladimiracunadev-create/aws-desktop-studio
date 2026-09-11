# 🔄 Híbrido y migración

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Módulo educativo.** No configura conectividad, replicación ni migraciones reales.

| Ficha | Alcance |
|---|---|
| Servicios | VPN · Direct Connect · DMS · DataSync · Migration Hub |
| Decisión central | conectar, replicar, migrar o modernizar |
| Control clave | dependencia, ventana de corte, cifrado y rollback |

## Conectividad
Site-to-Site VPN y Direct Connect conectan redes; Transit Gateway ayuda a topologías complejas.

## Datos
DataSync mueve archivos/objetos; DMS ayuda a migrar/replicar bases compatibles.

## Cargas
Migration Hub y servicios asociados ayudan a descubrir/seguir migraciones; Elastic Disaster Recovery cubre escenarios de replicación/DR.

Toda migración necesita inventario, dependencias, seguridad, pruebas, plan de cutover y rollback.
