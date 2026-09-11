'use strict';

if (!window.awsStudio) {
  let tokenPromise;

  async function getToken() {
    tokenPromise ||= fetch('/api/session', { cache:'no-store' })
      .then(response => response.json())
      .then(result => result.token);
    return tokenPromise;
  }

  async function get(path) {
    const response = await fetch(path, { cache:'no-store' });
    const text = await response.text();
    if (!response.ok) {
      let message = text;
      try { message = JSON.parse(text).error; } catch {}
      throw new Error(message || `Error HTTP ${response.status}`);
    }
    return response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : text;
  }

  async function post(path, payload) {
    const response = await fetch(path, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'X-AWS-Studio-Token':await getToken() },
      body:JSON.stringify(payload || {})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Error HTTP ${response.status}`);
    return result;
  }

  window.awsStudio = Object.freeze({
    diagnostics:() => get('/api/diagnostics'),
    listProfiles:() => get('/api/profiles'),
    profileRegion:async payload => (await post('/api/profile-region', payload)).region,
    connectionInfo:payload => post('/api/connection-info', payload),
    identity:payload => post('/api/identity', payload),
    listResources:payload => post('/api/resources', payload),
    inventory:payload => post('/api/inventory', payload),
    awsLogin:payload => post('/api/aws-login', payload),
    ec2Action:async () => { throw new Error('Las acciones EC2 mutables requieren la aplicación Electron y su confirmación nativa.'); },
    ssoLogin:payload => post('/api/sso-login', payload),
    saveSsoProfile:payload => post('/api/sso-profile', payload),
    saveAssumeRoleProfile:payload => post('/api/assume-role-profile', payload),
    openProfileTerminal:async () => { throw new Error('Esta opción está disponible en la aplicación Electron.'); },
    getTutorial:payload => get(`/api/tutorial?file=${encodeURIComponent(payload.file)}`),
    getCatalog:() => get('/api/catalog'),
    openExternal:async ({ url }) => { window.open(url, '_blank', 'noopener,noreferrer'); return { ok:true }; },
    confirm:async ({ message }) => window.confirm(message)
  });
}
