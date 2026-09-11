# 🕸️ Amazon VPC

[**← Documentación**](../../README.md#-documentación) · [**🗺️ Servicios**](../aws-service-map.md) · [**🔒 Seguridad**](../../SECURITY.md)

> [!NOTE]
> **Integración de lectura acotada.** La aplicación lista VPC; no crea redes, rutas ni reglas.

| Ficha | Alcance |
|---|---|
| Servicio | Amazon VPC |
| Decisión central | segmentación, enrutamiento y conectividad |
| Control clave | CIDR, rutas, Security Groups, NACL y endpoints privados |

Red lógica aislada para recursos AWS.

## Piezas
CIDR, subredes públicas/privadas, route tables, Internet Gateway, NAT Gateway, NACL, Security Groups, VPC endpoints, peering y Transit Gateway.

## Modelo
Una subred no es pública solo por nombre: necesita una ruta adecuada y el recurso debe tener conectividad correspondiente.

## Seguridad
Segmenta, reduce rutas, usa endpoints privados cuando convenga y evita abrir 0.0.0.0/0 a puertos administrativos.
