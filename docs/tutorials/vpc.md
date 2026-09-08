# Amazon VPC

Red lógica aislada para recursos AWS.

## Piezas
CIDR, subredes públicas/privadas, route tables, Internet Gateway, NAT Gateway, NACL, Security Groups, VPC endpoints, peering y Transit Gateway.

## Modelo
Una subred no es pública solo por nombre: necesita una ruta adecuada y el recurso debe tener conectividad correspondiente.

## Seguridad
Segmenta, reduce rutas, usa endpoints privados cuando convenga y evita abrir 0.0.0.0/0 a puertos administrativos.
