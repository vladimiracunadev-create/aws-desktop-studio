# 🏗️ AWS CloudFormation

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Módulo educativo.** El producto documenta IaC, pero no aprovisiona stacks automáticamente.

| Ficha | Alcance |
|---|---|
| Servicio | AWS CloudFormation |
| Decisión central | infraestructura declarativa y reproducible |
| Control clave | change sets, rollback y mínimo privilegio |

Infrastructure as Code nativa. Un template declara recursos; un stack representa una instancia desplegada.

## Ventajas
Repetibilidad, revisión por Git, rollback y detección de cambios.

## Conceptos
Template, parameters, outputs, resources, mappings, conditions, stack sets y change sets.

## Regla
Para producción, evita que la consola manual sea la fuente de verdad cuando el recurso ya está gestionado como IaC.
