'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  baseArgs,
  buildIdentityCommand,
  buildListCommand,
  buildEc2Action,
  assertSafeToken,
  monthWindow
} = require('../src/aws-command-builder');

test('identity usa perfil y región sin shell', () => {
  assert.deepEqual(buildIdentityCommand('default','sa-east-1'), ['sts','get-caller-identity','--profile','default','--region','sa-east-1','--output','json']);
});

test('rechaza perfiles con metacaracteres', () => {
  assert.throws(() => assertSafeToken('default; rm -rf', 'Perfil'));
  assert.throws(() => assertSafeToken('', 'Perfil'));
  assert.throws(() => assertSafeToken(null, 'Perfil'));
  assert.equal(assertSafeToken(' Dev_Profile-1 ', 'Perfil'), 'Dev_Profile-1');
});

test('construye listado S3', () => {
  assert.deepEqual(buildListCommand('s3','lab','us-east-1'), ['s3api','list-buckets','--profile','lab','--region','us-east-1','--output','json']);
});

test('EC2 solo admite instance ids', () => {
  assert.throws(() => buildEc2Action('stop','server-prod','default','sa-east-1'));
  assert.equal(buildEc2Action('stop','i-0abc123','default','sa-east-1')[1], 'stop-instances');
  assert.throws(() => buildEc2Action('terminate','i-0abc123','default','sa-east-1'));
});

test('omite perfil y región cuando no se entregan', () => {
  assert.deepEqual(baseArgs('', ''), []);
});

test('calcula ventana mensual UTC con fin exclusivo', () => {
  assert.deepEqual(monthWindow(new Date('2026-09-07T23:30:00-03:00')), {
    start: '2026-09-01',
    end: '2026-09-09'
  });
});

test('Cost Explorer fuerza us-east-1 y salida JSON', () => {
  const args = buildListCommand('cost', 'finops', 'sa-east-1');
  assert.deepEqual(args.slice(0, 2), ['ce', 'get-cost-and-usage']);
  assert.deepEqual(args.slice(-6), ['--profile', 'finops', '--region', 'us-east-1', '--output', 'json']);
});

test('rechaza servicios y acciones no soportados', () => {
  assert.throws(() => buildListCommand('unknown', 'default', 'us-east-1'));
  assert.throws(() => buildEc2Action('delete', 'i-0abc123', 'default', 'us-east-1'));
});
