'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildAwsLoginCommand, buildAssumeRoleConfigCommands, classifyConnection } = require('../src/aws-auth');

test('construye aws login oficial sin usar shell', () => {
  assert.deepEqual(buildAwsLoginCommand({ profile:'console-local', region:'us-east-2' }), [
    'login', '--profile', 'console-local', '--region', 'us-east-2'
  ]);
});

test('rechaza metacaracteres en aws login', () => {
  assert.throws(() => buildAwsLoginCommand({ profile:'default;whoami', region:'us-east-2' }));
});

test('construye un perfil AssumeRole completo', () => {
  const commands = buildAssumeRoleConfigCommands({
    profileName:'produccion-readonly',
    sourceProfile:'console-local',
    roleArn:'arn:aws:iam::123456789012:role/ReadOnlyAccess',
    sessionName:'desktop-studio',
    region:'us-east-2'
  });
  assert.equal(commands.length, 5);
  assert.deepEqual(commands[0], ['configure','set','role_arn','arn:aws:iam::123456789012:role/ReadOnlyAccess','--profile','produccion-readonly']);
});

test('AssumeRole rechaza ARN inválido y perfil recursivo', () => {
  const base = { profileName:'destino', sourceProfile:'origen', roleArn:'arn:aws:iam::123456789012:role/ReadOnly', region:'us-east-2' };
  assert.throws(() => buildAssumeRoleConfigCommands({ ...base, roleArn:'arn:aws:s3:::bucket' }));
  assert.throws(() => buildAssumeRoleConfigCommands({ ...base, sourceProfile:'destino' }));
});

test('clasifica proveedores sin exponer secretos', () => {
  assert.equal(classifyConnection({ loginSession:true }), 'AWS Login (credenciales de consola)');
  assert.equal(classifyConnection({ ssoSession:true }), 'IAM Identity Center (SSO)');
  assert.equal(classifyConnection({ roleArn:true }), 'AssumeRole');
  assert.equal(classifyConnection({ credentialProcess:true }), 'Proceso externo de credenciales');
  assert.equal(classifyConnection({}), 'Cadena estándar AWS CLI / entorno');
});
