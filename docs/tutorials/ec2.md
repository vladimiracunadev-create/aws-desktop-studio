# EC2 — Elastic Compute Cloud

## Qué es
Máquinas virtuales en AWS. Tú eliges AMI, tipo de instancia, red, disco y modelo de acceso.

## Conceptos
- AMI: imagen base.
- Instance type: CPU/RAM/red.
- EBS: discos persistentes.
- Security Group: firewall stateful.
- Key pair/SSM: acceso administrativo.
- Elastic IP: IP pública fija (puede tener costo).
- Auto Scaling: ajuste automático de capacidad.

## En AWS Desktop Studio
1. Selecciona perfil y región.
2. Valida sesión.
3. Selecciona EC2 -> Consultar recursos.
4. Revisa InstanceId, estado, tipo, AZ e IP.
5. Para start/stop/reboot activa **Modo operativo** y confirma.

## Producción
Evita administrar servidores manualmente si puedes automatizar. Prefiere SSM Session Manager frente a exponer SSH/RDP. Aplica patching, backups, métricas, alarmas, IAM Role de instancia y mínimo privilegio.

## Costos
Instancia encendida + EBS + IP/transferencia y otros componentes. Detener una EC2 normalmente detiene cómputo, pero el almacenamiento puede seguir costando.
