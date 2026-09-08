'use strict';

const SAFE_TOKEN = /^[A-Za-z0-9_+=,.@:/-]+$/;

function assertSafeToken(value, name) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized || !SAFE_TOKEN.test(normalized)) {
    throw new Error(`${name} inválido o contiene caracteres no permitidos.`);
  }
  return normalized;
}

function baseArgs(profile, region) {
  const args = [];
  if (profile) args.push('--profile', assertSafeToken(profile, 'Perfil'));
  if (region) args.push('--region', assertSafeToken(region, 'Región'));
  return args;
}

function monthWindow(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

const LIST_COMMANDS = {
  ec2: ['ec2', 'describe-instances'],
  s3: ['s3api', 'list-buckets'],
  lambda: ['lambda', 'list-functions'],
  rds: ['rds', 'describe-db-instances'],
  dynamodb: ['dynamodb', 'list-tables'],
  cloudformation: ['cloudformation', 'describe-stacks'],
  cloudwatch: ['logs', 'describe-log-groups', '--limit', '50'],
  ecs: ['ecs', 'list-clusters'],
  eks: ['eks', 'list-clusters'],
  apigateway: ['apigateway', 'get-rest-apis', '--limit', '50'],
  iam: ['iam', 'list-roles', '--max-items', '50'],
  secrets: ['secretsmanager', 'list-secrets', '--max-results', '50'],
  sqs: ['sqs', 'list-queues'],
  sns: ['sns', 'list-topics'],
  vpc: ['ec2', 'describe-vpcs']
};

function buildListCommand(service, profile, region) {
  if (service === 'cost') {
    const { start, end } = monthWindow();
    return [
      'ce', 'get-cost-and-usage',
      '--time-period', `Start=${start},End=${end}`,
      '--granularity', 'MONTHLY',
      '--metrics', 'UnblendedCost',
      ...baseArgs(profile, 'us-east-1'),
      '--output', 'json'
    ];
  }
  const command = LIST_COMMANDS[service];
  if (!command) throw new Error('Servicio no soportado por el explorador operativo.');
  return [...command, ...baseArgs(profile, region), '--output', 'json'];
}

function buildIdentityCommand(profile, region) {
  return ['sts', 'get-caller-identity', ...baseArgs(profile, region), '--output', 'json'];
}

function buildEc2Action(action, instanceId, profile, region) {
  const allowed = {
    start: 'start-instances',
    stop: 'stop-instances',
    reboot: 'reboot-instances'
  };
  const sub = allowed[action];
  if (!sub) throw new Error('Acción EC2 no permitida.');
  const id = assertSafeToken(instanceId, 'Instance ID');
  if (!/^i-[a-fA-F0-9]+$/.test(id)) throw new Error('Instance ID inválido.');
  return ['ec2', sub, '--instance-ids', id, ...baseArgs(profile, region), '--output', 'json'];
}

module.exports = {
  assertSafeToken,
  baseArgs,
  monthWindow,
  buildListCommand,
  buildIdentityCommand,
  buildEc2Action
};
