'use strict';

const { app, BrowserWindow, ipcMain, dialog, shell, session } = require('electron');
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { services } = require('./catalog');
const { buildListCommand, buildIdentityCommand, buildEc2Action, assertSafeToken, INVENTORY_SERVICES } = require('./aws-command-builder');
const { buildSsoConfigCommands } = require('./sso-config');
const { buildAwsLoginCommand, buildAssumeRoleConfigCommands, classifyConnection } = require('./aws-auth');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1420,
    height: 900,
    minWidth: 1050,
    minHeight: 700,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function awsExists() {
  const result = spawnSync('aws', ['--version'], { encoding: 'utf8', windowsHide: true, shell: false });
  return result.status === 0;
}

function runAws(args, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const child = spawn('aws', args, {
      windowsHide: true,
      shell: false,
      env: { ...process.env, AWS_PAGER: '', AWS_CLI_AUTO_PROMPT: 'off' }
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('La operación excedió el tiempo máximo configurado.'));
    }, timeoutMs);
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('error', (err) => { clearTimeout(timer); reject(err); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(stderr.trim() || `AWS CLI terminó con código ${code}.`));
      resolve(stdout.trim());
    });
  });
}

function toJson(text) {
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

function hasProfileSetting(profile, key) {
  const args = ['configure', 'get', key];
  if (profile) args.push('--profile', assertSafeToken(profile, 'Perfil'));
  const result = spawnSync('aws', args, { encoding:'utf8', windowsHide:true, shell:false });
  return result.status === 0 && Boolean((result.stdout || '').trim());
}

ipcMain.handle('system:diagnostics', async () => {
  let version = null;
  if (awsExists()) {
    const r = spawnSync('aws', ['--version'], { encoding: 'utf8', windowsHide: true, shell: false });
    version = (r.stdout || r.stderr || '').trim();
  }
  return {
    platform: process.platform,
    release: os.release(),
    awsCliInstalled: Boolean(version),
    awsCliVersion: version
  };
});

ipcMain.handle('aws:listProfiles', async () => {
  if (!awsExists()) throw new Error('AWS CLI v2 no está instalado o no está disponible en PATH.');
  const out = await runAws(['configure', 'list-profiles']);
  return out.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
});

ipcMain.handle('aws:profileRegion', async (_event, { profile }) => {
  const safeProfile = assertSafeToken(profile, 'Perfil');
  const out = await runAws(['configure', 'get', 'region', '--profile', safeProfile]);
  return out.trim();
});

ipcMain.handle('aws:connectionInfo', async (_event, { profile }) => {
  const settings = {
    loginSession:hasProfileSetting(profile, 'login_session'),
    ssoSession:hasProfileSetting(profile, 'sso_session'),
    ssoStartUrl:hasProfileSetting(profile, 'sso_start_url'),
    roleArn:hasProfileSetting(profile, 'role_arn'),
    credentialProcess:hasProfileSetting(profile, 'credential_process')
  };
  return { profile:profile || null, type:classifyConnection(settings) };
});

ipcMain.handle('aws:identity', async (_event, { profile, region }) => {
  const out = await runAws(buildIdentityCommand(profile, region));
  return toJson(out);
});

ipcMain.handle('aws:listResources', async (_event, { service, profile, region }) => {
  const out = await runAws(buildListCommand(service, profile, region), service === 'cost' ? 60000 : 45000);
  return toJson(out);
});

ipcMain.handle('aws:inventory', async (_event, { profile, region }) => {
  const results = await Promise.all(INVENTORY_SERVICES.map(async (service) => {
    try {
      const out = await runAws(buildListCommand(service, profile, region), 60000);
      return { service, ok:true, data:toJson(out) };
    } catch (error) {
      return { service, ok:false, error:error.message };
    }
  }));
  return { generatedAt:new Date().toISOString(), accountRegion:region, results };
});

ipcMain.handle('aws:login', async (_event, payload) => {
  if (!awsExists()) throw new Error('AWS CLI v2 no está instalado o no está disponible en PATH.');
  const out = await runAws(buildAwsLoginCommand(payload), 300000);
  return { ok:true, profile:payload.profile.trim(), message:out || 'AWS Login completado.' };
});

ipcMain.handle('aws:ec2Action', async (_event, { action, instanceId, profile, region, operationalMode }) => {
  if (!operationalMode) throw new Error('Modo operativo desactivado.');
  const confirmation = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    buttons: ['Cancelar', 'Ejecutar en AWS'],
    defaultId: 0,
    cancelId: 0,
    title: 'Cambio de infraestructura real',
    message: `Vas a ejecutar ${action} sobre ${instanceId}.`,
    detail: `Perfil: ${profile} | Región: ${region}. AWS IAM validará finalmente el permiso.`,
    noLink: true
  });
  if (confirmation.response !== 1) return { cancelled: true };
  const out = await runAws(buildEc2Action(action, instanceId, profile, region));
  return toJson(out);
});

ipcMain.handle('aws:ssoLogin', async (_event, { profile }) => {
  const safeProfile = assertSafeToken(profile, 'Perfil');
  const out = await runAws(['sso', 'login', '--profile', safeProfile], 180000);
  return { ok: true, message: out || 'Inicio de sesión SSO completado.' };
});

ipcMain.handle('aws:saveSsoProfile', async (_event, payload) => {
  if (!awsExists()) throw new Error('AWS CLI v2 no está instalado o no está disponible en PATH.');
  const commands = buildSsoConfigCommands(payload);
  for (const args of commands) await runAws(args);
  return { ok:true, profile:payload.profileName.trim() };
});

ipcMain.handle('aws:saveAssumeRoleProfile', async (_event, payload) => {
  if (!awsExists()) throw new Error('AWS CLI v2 no está instalado o no está disponible en PATH.');
  const commands = buildAssumeRoleConfigCommands(payload);
  for (const args of commands) await runAws(args);
  return { ok:true, profile:payload.profileName.trim() };
});

ipcMain.handle('aws:openProfileTerminal', async (_event, { profile, region }) => {
  const safeProfile = assertSafeToken(profile, 'Perfil');
  const safeRegion = region ? assertSafeToken(region, 'Región') : '';
  if (process.platform !== 'win32') throw new Error('El terminal integrado está diseñado para Windows.');
  const cmd = `$env:AWS_PROFILE='${safeProfile}';` + (safeRegion ? `$env:AWS_REGION='${safeRegion}';` : '') + ` Write-Host 'AWS_PROFILE=${safeProfile}'; aws sts get-caller-identity;`;
  spawn('powershell.exe', ['-NoExit', '-NoProfile', '-Command', cmd], { detached: true, windowsHide: false, shell: false });
  return { ok: true };
});

ipcMain.handle('tutorial:get', async (_event, { file }) => {
  if (!/^[a-z0-9-]+\.md$/.test(file)) throw new Error('Tutorial inválido.');
  const base = path.resolve(app.getAppPath(), 'docs', 'tutorials');
  const target = path.resolve(base, file);
  if (!target.startsWith(base + path.sep)) throw new Error('Ruta no permitida.');
  return fs.readFileSync(target, 'utf8');
});

ipcMain.handle('catalog:get', async () => services);

ipcMain.handle('external:open', async (_event, { url }) => {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw new Error('Solo se permiten enlaces HTTPS.');
  await shell.openExternal(parsed.toString());
  return { ok: true };
});

ipcMain.handle('dialog:confirm', async (_event, { title, message }) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    buttons: ['Cancelar', 'Confirmar'],
    defaultId: 0,
    cancelId: 0,
    title,
    message,
    noLink: true
  });
  return result.response === 1;
});
