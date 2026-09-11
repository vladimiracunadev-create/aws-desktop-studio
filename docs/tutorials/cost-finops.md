# 💰 Costos y FinOps

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!IMPORTANT]
> **Módulo educativo.** Cost Explorer puede mostrar costo; no sustituye budgets, alertas ni una revisión financiera autorizada.

| Ficha | Alcance |
|---|---|
| Herramientas | Cost Explorer · Budgets · CUR · tags |
| Decisión central | visibilidad, asignación y optimización |
| Control clave | alertas, ownership y teardown |

## Herramientas
Cost Explorer, AWS Budgets, Cost and Usage Report, tagging y herramientas de rightsizing/optimización.

AWS Desktop Studio v0.1 consulta `UnblendedCost` del mes actual como señal rápida; no reemplaza facturación oficial ni análisis completo.

## Disciplina
- tags obligatorios;
- budgets antes del laboratorio;
- shutdown/teardown;
- revisar transferencia y NAT;
- retención de logs;
- snapshots/volúmenes huérfanos;
- Savings Plans/Reserved Instances solo cuando la demanda lo justifica.
