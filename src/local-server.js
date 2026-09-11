'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const { services } = require('./catalog');
const { buildListCommand, buildIdentityCommand, assertSafeToken, INVENTORY_SERVICES } = require('./aws-command-builder');
const { buildSsoConfigCommands } = require('./sso-config');
const { buildAwsLoginCommand, buildAssumeRoleConfigCommands, classifyConnection } = require('./aws-auth');

const host = '127.0.0.1';
const port = Number.parseInt(process.env.AWS_STUDIO_PORT || '4173', 10);
const rendererRoot = path.resolve(__dirname, 'renderer');
const csrfToken = crypto.randomBytes(32).toString('hex');
const staticFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/web-api.js', ['web-api.js', 'text/javascript; charset=utf-8']]
]);

function awsExists() {
  const result = spawnSync('aws', ['--version'], { encoding:'utf8', windowsHide:true, shell:false });
  return result.status === 0;
}

function runAws(args, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const child = spawn('aws', args, {
      windowsHide:true,
      shell:false,
      env:{ ...process.env, AWS_PAGER:'', AWS_CLI_AUTO_PROMPT:'off' }
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('La operación excedió el tiempo máximo configurado.'));
    }, timeoutMs);
    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(stderr.trim() || `AWS CLI terminó con código ${code}.`));
      resolve(stdout.trim());
    });
  });
}

function json(response, status, payload) {
  response.writeHead(status, {
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'no-referrer'
  });
  response.end(JSON.stringify(payload));
}

function parseJson(text) {
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { raw:text }; }
}

function hasProfileSetting(profile, key) {
  const args = ['configure', 'get', key];
  if (profile) args.push('--profile', assertSafeToken(profile, 'Perfil'));
  const result = spawnSync('aws', args, { encoding:'utf8', windowsHide:true, shell:false });
  return result.status === 0 && Boolean((result.stdout || '').trim());
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 16384) reject(new Error('Solicitud demasiado grande.'));
    });
    request.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('JSON inválido.')); }
    });
    request.on('error', reject);
  });
}

function isLocalRequest(request) {
  const allowedHosts = new Set([`${host}:${port}`, `localhost:${port}`]);
  const allowedOrigins = new Set([`http://${host}:${port}`, `http://localhost:${port}`]);
  return allowedHosts.has(request.headers.host) && (!request.headers.origin || allowedOrigins.has(request.headers.origin));
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/session') return json(response, 200, { token:csrfToken });
  if (request.method === 'GET' && url.pathname === '/api/diagnostics') {
    const result = spawnSync('aws', ['--version'], { encoding:'utf8', windowsHide:true, shell:false });
    const version = result.status === 0 ? (result.stdout || result.stderr || '').trim() : null;
    return json(response, 200, { platform:process.platform, release:os.release(), awsCliInstalled:Boolean(version), awsCliVersion:version });
  }
  if (request.method === 'GET' && url.pathname === '/api/catalog') return json(response, 200, services);
  if (request.method === 'GET' && url.pathname === '/api/profiles') {
    if (!awsExists()) throw new Error('AWS CLI v2 no está instalado o no está disponible en PATH.');
    const out = await runAws(['configure', 'list-profiles']);
    return json(response, 200, out.split(/\r?\n/).map(value => value.trim()).filter(Boolean));
  }
  if (request.method === 'GET' && url.pathname === '/api/tutorial') {
    const file = url.searchParams.get('file') || '';
    if (!/^[a-z0-9-]+\.md$/.test(file)) throw new Error('Tutorial inválido.');
    const base = path.resolve(__dirname, '..', 'docs', 'tutorials');
    const target = path.resolve(base, file);
    if (!target.startsWith(base + path.sep)) throw new Error('Ruta no permitida.');
    response.writeHead(200, { 'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-store' });
    return response.end(fs.readFileSync(target, 'utf8'));
  }

  if (request.method !== 'POST') return json(response, 404, { error:'Ruta no encontrada.' });
  if (request.headers['content-type'] !== 'application/json') return json(response, 415, { error:'Se requiere application/json.' });
  if (request.headers['x-aws-studio-token'] !== csrfToken) return json(response, 403, { error:'Token local inválido.' });
  const body = await readBody(request);

  if (url.pathname === '/api/profile-region') {
    const profile = assertSafeToken(body.profile, 'Perfil');
    return json(response, 200, { region:(await runAws(['configure','get','region','--profile',profile])).trim() });
  }
  if (url.pathname === '/api/connection-info') {
    const settings = {
      loginSession:hasProfileSetting(body.profile, 'login_session'),
      ssoSession:hasProfileSetting(body.profile, 'sso_session'),
      ssoStartUrl:hasProfileSetting(body.profile, 'sso_start_url'),
      roleArn:hasProfileSetting(body.profile, 'role_arn'),
      credentialProcess:hasProfileSetting(body.profile, 'credential_process')
    };
    return json(response, 200, { profile:body.profile || null, type:classifyConnection(settings) });
  }
  if (url.pathname === '/api/identity') {
    return json(response, 200, parseJson(await runAws(buildIdentityCommand(body.profile, body.region))));
  }
  if (url.pathname === '/api/resources') {
    const timeout = body.service === 'cost' ? 60000 : 45000;
    return json(response, 200, parseJson(await runAws(buildListCommand(body.service, body.profile, body.region), timeout)));
  }
  if (url.pathname === '/api/inventory') {
    const results = await Promise.all(INVENTORY_SERVICES.map(async service => {
      try {
        const out = await runAws(buildListCommand(service, body.profile, body.region), 60000);
        return { service, ok:true, data:parseJson(out) };
      } catch (error) {
        return { service, ok:false, error:error.message };
      }
    }));
    return json(response, 200, { generatedAt:new Date().toISOString(), accountRegion:body.region, results });
  }
  if (url.pathname === '/api/aws-login') {
    if (!awsExists()) throw new Error('AWS CLI v2 no está instalado o no está disponible en PATH.');
    const out = await runAws(buildAwsLoginCommand(body), 300000);
    return json(response, 200, { ok:true, profile:body.profile.trim(), message:out || 'AWS Login completado.' });
  }
  if (url.pathname === '/api/sso-login') {
    const profile = assertSafeToken(body.profile, 'Perfil');
    const out = await runAws(['sso','login','--profile',profile], 180000);
    return json(response, 200, { ok:true, message:out || 'Inicio de sesión SSO completado.' });
  }
  if (url.pathname === '/api/sso-profile') {
    const commands = buildSsoConfigCommands(body);
    for (const args of commands) await runAws(args);
    return json(response, 200, { ok:true, profile:body.profileName.trim() });
  }
  if (url.pathname === '/api/assume-role-profile') {
    const commands = buildAssumeRoleConfigCommands(body);
    for (const args of commands) await runAws(args);
    return json(response, 200, { ok:true, profile:body.profileName.trim() });
  }
  return json(response, 404, { error:'Ruta no encontrada.' });
}

const server = http.createServer(async (request, response) => {
  try {
    if (!isLocalRequest(request)) return json(response, 403, { error:'Solo se aceptan solicitudes del localhost de AWS Desktop Studio.' });
    const url = new URL(request.url, `http://${host}:${port}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(request, response, url);
    const staticEntry = staticFiles.get(url.pathname);
    if (!staticEntry || request.method !== 'GET') return json(response, 404, { error:'Ruta no encontrada.' });
    const [file, contentType] = staticEntry;
    response.writeHead(200, {
      'Content-Type':contentType,
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff',
      'Content-Security-Policy':"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-src 'none'"
    });
    response.end(fs.readFileSync(path.join(rendererRoot, file)));
  } catch (error) {
    json(response, 400, { error:error.message || 'Error local inesperado.' });
  }
});

server.listen(port, host, () => {
  console.log(`AWS Desktop Studio: http://${host}:${port}`);
  console.log('Servidor limitado a loopback. Presiona Ctrl+C para detenerlo.');
});
