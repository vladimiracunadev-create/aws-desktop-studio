# 🌐 Networking y edge

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Módulo educativo.** Route 53, CloudFront y Global Accelerator no están integrados operacionalmente.

| Ficha | Alcance |
|---|---|
| Servicios | Route 53 · ELB · CloudFront · Global Accelerator |
| Decisión central | resolución, balanceo, caché o aceleración |
| Control clave | TLS, origen, health checks y exposición pública |

## Route 53
DNS, dominios, routing policies y health checks.

## Elastic Load Balancing
ALB/NLB/GWLB según capa/protocolo/caso.

## CloudFront
CDN global; cache, TLS y distribución de contenido/APIs.

## Global Accelerator
Optimización de entrada global a endpoints compatibles.

Diseña DNS, TLS, WAF, origen privado, observabilidad y estrategia de failover de forma conjunta.
