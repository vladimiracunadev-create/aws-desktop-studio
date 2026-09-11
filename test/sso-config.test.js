'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSsoConfigCommands } = require('../src/sso-config');

const valid = {
  sessionName:'mi-sso',
  startUrl:'https://example.awsapps.com/start',
  ssoRegion:'us-east-1',
  accountId:'123456789012',
  roleName:'ReadOnlyAccess',
  profileName:'produccion-readonly',
  defaultRegion:'us-east-2'
};

test('construye una configuración SSO completa y acotada', () => {
  const commands = buildSsoConfigCommands(valid);
  assert.equal(commands.length, 8);
  assert.deepEqual(commands[0], ['configure','set','sso_start_url','https://example.awsapps.com/start','--sso-session','mi-sso']);
  assert.deepEqual(commands.at(-1), ['configure','set','output','json','--profile','produccion-readonly']);
});

test('rechaza URL insegura, cuenta inválida y metacaracteres', () => {
  assert.throws(() => buildSsoConfigCommands({ ...valid, startUrl:'http://example.com' }));
  assert.throws(() => buildSsoConfigCommands({ ...valid, accountId:'1234' }));
  assert.throws(() => buildSsoConfigCommands({ ...valid, profileName:'default;whoami' }));
});
