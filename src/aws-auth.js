'use strict';

const { assertSafeToken } = require('./aws-command-builder');

function assertProfileName(value) {
  return assertSafeToken(value, 'Perfil');
}

function buildAwsLoginCommand({ profile, region }) {
  return [
    'login',
    '--profile', assertProfileName(profile),
    '--region', assertSafeToken(region, 'Región')
  ];
}

function buildAssumeRoleConfigCommands(payload) {
  const profile = assertProfileName(payload.profileName);
  const sourceProfile = assertProfileName(payload.sourceProfile);
  const roleArn = assertSafeToken(payload.roleArn, 'ARN del rol');
  const sessionName = assertSafeToken(payload.sessionName || 'aws-desktop-studio', 'Nombre de sesión');
  const region = assertSafeToken(payload.region, 'Región');
  if (!/^arn:aws(?:-[a-z]+)?:iam::\d{12}:role\/[A-Za-z0-9_+=,.@\/-]+$/.test(roleArn)) {
    throw new Error('El ARN debe identificar un rol IAM válido.');
  }
  if (profile === sourceProfile) throw new Error('El perfil de destino debe ser distinto del perfil de origen.');
  return [
    ['configure', 'set', 'role_arn', roleArn, '--profile', profile],
    ['configure', 'set', 'source_profile', sourceProfile, '--profile', profile],
    ['configure', 'set', 'role_session_name', sessionName, '--profile', profile],
    ['configure', 'set', 'region', region, '--profile', profile],
    ['configure', 'set', 'output', 'json', '--profile', profile]
  ];
}

function classifyConnection(settings = {}) {
  if (settings.loginSession) return 'AWS Login (credenciales de consola)';
  if (settings.ssoSession || settings.ssoStartUrl) return 'IAM Identity Center (SSO)';
  if (settings.roleArn) return 'AssumeRole';
  if (settings.credentialProcess) return 'Proceso externo de credenciales';
  return 'Cadena estándar AWS CLI / entorno';
}

module.exports = { buildAwsLoginCommand, buildAssumeRoleConfigCommands, classifyConnection };
