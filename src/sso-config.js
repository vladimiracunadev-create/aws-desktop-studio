'use strict';

function requiredToken(value, label, pattern, max = 128) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized || normalized.length > max || !pattern.test(normalized)) throw new Error(`${label} inválido.`);
  return normalized;
}

function httpsUrl(value) {
  let parsed;
  try { parsed = new URL(String(value || '').trim()); }
  catch { throw new Error('SSO Start URL inválida.'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('SSO Start URL debe usar HTTPS y no incluir credenciales.');
  return parsed.toString().replace(/\/$/, '');
}

function buildSsoConfigCommands(input) {
  const sessionName = requiredToken(input.sessionName, 'Nombre de sesión SSO', /^[A-Za-z0-9_+=,.@-]+$/, 64);
  const profileName = requiredToken(input.profileName, 'Nombre de perfil', /^[A-Za-z0-9_+=,.@-]+$/, 64);
  const ssoRegion = requiredToken(input.ssoRegion, 'Región SSO', /^[a-z]{2}(?:-gov)?-[a-z]+-\d$/, 32);
  const defaultRegion = requiredToken(input.defaultRegion, 'Región predeterminada', /^[a-z]{2}(?:-gov)?-[a-z]+-\d$/, 32);
  const accountId = requiredToken(input.accountId, 'AWS Account ID', /^\d{12}$/, 12);
  const roleName = requiredToken(input.roleName, 'Nombre de rol', /^[A-Za-z0-9_+=,.@-]+$/, 64);
  const startUrl = httpsUrl(input.startUrl);
  const scope = 'sso:account:access';
  return [
    ['configure','set','sso_start_url',startUrl,'--sso-session',sessionName],
    ['configure','set','sso_region',ssoRegion,'--sso-session',sessionName],
    ['configure','set','sso_registration_scopes',scope,'--sso-session',sessionName],
    ['configure','set','sso_session',sessionName,'--profile',profileName],
    ['configure','set','sso_account_id',accountId,'--profile',profileName],
    ['configure','set','sso_role_name',roleName,'--profile',profileName],
    ['configure','set','region',defaultRegion,'--profile',profileName],
    ['configure','set','output','json','--profile',profileName]
  ];
}

module.exports = { buildSsoConfigCommands };

