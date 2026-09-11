'use strict';

const $ = (id) => document.getElementById(id);
const state = { catalog: [], selected: null, raw: {}, operationalMode: false, identity: null, tasks: [], taskFilter: 'all' };
const regions = ['us-east-1','us-east-2','us-west-1','us-west-2','sa-east-1','ca-central-1','eu-west-1','eu-west-2','eu-central-1','ap-southeast-1','ap-southeast-2','ap-northeast-1'];
const TASKS_KEY = 'aws-desktop-studio.tasks.v1';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function setNotice(message, error = false) {
  $('notice').textContent = message;
  $('notice').style.borderLeftColor = error ? '#ef4444' : '#38bdf8';
}

function selectedProfile() { return $('profile').value; }
function selectedRegion() { return $('region').value; }

function setConnectionStage(stage) {
  const order = ['browser','credentials','sts'];
  const current = order.indexOf(stage);
  for (const [index, name] of order.entries()) {
    const element = $({ browser:'stepBrowser', credentials:'stepCredentials', sts:'stepSts' }[name]);
    element.classList.toggle('done', stage === 'connected' || (current >= 0 && index < current));
    element.classList.toggle('active', name === stage);
  }
}

async function inspectSelectedConnection() {
  try {
    const info = await window.awsStudio.connectionInfo({ profile:selectedProfile() });
    $('providerType').textContent = `Proveedor detectado: ${info.type}`;
  } catch (error) {
    $('providerType').textContent = `Proveedor no identificado: ${error.message}`;
  }
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    state.tasks = Array.isArray(saved) ? saved.filter(task => task && typeof task.title === 'string') : [];
  } catch {
    state.tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(state.tasks));
}

function taskStatusLabel(status) {
  return ({ pending:'Pendiente', in_progress:'En curso', done:'Completada' })[status] || 'Pendiente';
}

function renderTasks() {
  const visible = state.tasks.filter(task => state.taskFilter === 'all' || task.status === state.taskFilter);
  $('taskCount').textContent = String(state.tasks.filter(task => task.status !== 'done').length);
  $('taskList').innerHTML = '';
  if (!visible.length) {
    $('taskList').innerHTML = '<div class="empty-state">No hay tareas en esta vista.</div>';
    return;
  }
  for (const task of visible) {
    const row = document.createElement('div');
    row.className = `task-item ${task.status === 'done' ? 'done' : ''}`;
    const priority = task.priority === 'high' ? 'Alta' : task.priority === 'low' ? 'Baja' : 'Normal';
    row.innerHTML = `<div><strong class="task-name">${escapeHtml(task.title)}</strong><span class="task-meta ${task.priority === 'high' ? 'priority-high' : ''}">${escapeHtml(task.service || 'General')} · Prioridad ${priority}${task.due ? ` · ${escapeHtml(task.due)}` : ''}</span></div>`;
    const status = document.createElement('select');
    for (const value of ['pending','in_progress','done']) {
      const option = document.createElement('option');
      option.value = value; option.textContent = taskStatusLabel(value); option.selected = task.status === value;
      status.appendChild(option);
    }
    status.setAttribute('aria-label', `Estado de ${task.title}`);
    status.addEventListener('change', () => {
      task.status = status.value; saveTasks(); renderTasks();
    });
    const remove = document.createElement('button');
    remove.className = 'task-delete'; remove.textContent = 'Eliminar';
    remove.addEventListener('click', () => {
      state.tasks = state.tasks.filter(item => item.id !== task.id); saveTasks(); renderTasks();
    });
    row.append(status, remove);
    $('taskList').appendChild(row);
  }
}

function lockWorkspace(message = 'Selecciona un perfil y vuelve a validar la identidad.') {
  state.identity = null;
  document.body.classList.remove('is-connected');
  $('appWorkspace').classList.add('app-locked');
  $('identityBadge').textContent = 'Sin validar';
  $('loadInventory').disabled = true;
  setConnectionStage('idle');
  setNotice(message);
}

function unlockWorkspace(identity) {
  state.identity = identity;
  document.body.classList.add('is-connected');
  $('appWorkspace').classList.remove('app-locked');
  $('identityBadge').textContent = identity.Account ? `Cuenta ${identity.Account}` : 'Sesión válida';
  $('accountSummary').textContent = identity.Account ? `Cuenta ${identity.Account} · ${selectedRegion()}` : `Cuenta validada · ${selectedRegion()}`;
  $('loadInventory').disabled = false;
  setConnectionStage('connected');
  if (identity.Account) {
    $('ssoAccountId').value ||= identity.Account;
  }
}

async function refreshProfiles() {
  try {
    const current = $('profile').value;
    const profiles = await window.awsStudio.listProfiles();
    $('profile').innerHTML = '<option value="">Cadena automática AWS (entorno / workload role)</option>';
    for (const p of profiles) {
      const opt = document.createElement('option'); opt.value = p; opt.textContent = p; $('profile').appendChild(opt);
    }
    if (profiles.includes(current)) $('profile').value = current;
    if (!profiles.length) setNotice('No se encontraron perfiles. Configura AWS CLI o IAM Identity Center.', true);
    else {
      setNotice(`Perfiles detectados: ${profiles.join(', ')}. Selecciona uno y valida la sesión.`);
      await syncProfileRegion();
      await inspectSelectedConnection();
    }
  } catch (e) { setNotice(e.message, true); }
}

async function syncProfileRegion() {
  const profile = selectedProfile();
  if (!profile) return;
  try {
    const region = await window.awsStudio.profileRegion({ profile });
    if (!region) return;
    let opt = Array.from($('region').options).find(o => o.value === region);
    if (!opt) { opt = document.createElement('option'); opt.value = region; opt.textContent = region; $('region').appendChild(opt); }
    $('region').value = region;
  } catch {
    // Un perfil puede no tener región configurada; la región elegida en UI sigue siendo válida.
  }
}

function renderCatalog(filter = '') {
  $('services').innerHTML = '';
  const q = filter.trim().toLowerCase();
  for (const s of state.catalog.filter(x => !q || `${x.name} ${x.category} ${x.summary}`.toLowerCase().includes(q))) {
    const el = document.createElement('div');
    el.className = 'service' + (state.selected?.key === s.key ? ' active' : '');
    el.innerHTML = `<strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(s.category)} · ${s.operational ? 'consulta real' : 'tutorial'}</small>`;
    el.addEventListener('click', () => selectService(s));
    $('services').appendChild(el);
  }
}

function selectService(s) {
  state.selected = s;
  $('category').textContent = s.category;
  $('serviceName').textContent = s.name;
  $('serviceSummary').textContent = s.summary;
  $('loadResources').disabled = !s.operational;
  $('loadTutorial').disabled = false;
  if ($('taskService')) $('taskService').value = s.key;
  $('resourcesPanel').innerHTML = `<p>Servicio seleccionado: <strong>${escapeHtml(s.name)}</strong>. ${s.operational ? 'Pulsa “Consultar recursos” para leer tu cuenta real.' : 'Este módulo es educativo en la versión 0.1; consulta el tutorial para arquitectura y uso.'}</p>`;
  renderCatalog($('search').value);
}

function flattenResources(service, raw) {
  switch (service) {
    case 'ec2': return (raw.Reservations || []).flatMap(r => r.Instances || []).map(i => ({
      title: i.InstanceId,
      fields: { Estado: i.State?.Name, Tipo: i.InstanceType, AZ: i.Placement?.AvailabilityZone, IP: i.PrivateIpAddress || '-', Nombre: (i.Tags || []).find(t => t.Key === 'Name')?.Value || '-' },
      instanceId: i.InstanceId
    }));
    case 's3': return (raw.Buckets || []).map(b => ({ title:b.Name, fields:{ Creado:b.CreationDate } }));
    case 'lambda': return (raw.Functions || []).map(f => ({ title:f.FunctionName, fields:{ Runtime:f.Runtime, Memoria:`${f.MemorySize} MB`, Timeout:`${f.Timeout}s`, Modificado:f.LastModified } }));
    case 'rds': return (raw.DBInstances || []).map(d => ({ title:d.DBInstanceIdentifier, fields:{ Motor:d.Engine, Estado:d.DBInstanceStatus, Clase:d.DBInstanceClass, Endpoint:d.Endpoint?.Address || '-' } }));
    case 'dynamodb': return (raw.TableNames || []).map(n => ({ title:n, fields:{ Tipo:'Tabla DynamoDB' } }));
    case 'cloudformation': return (raw.Stacks || []).map(s => ({ title:s.StackName, fields:{ Estado:s.StackStatus, Creado:s.CreationTime, Actualizado:s.LastUpdatedTime || '-' } }));
    case 'cloudwatch': return (raw.logGroups || []).map(g => ({ title:g.logGroupName, fields:{ Bytes:g.storedBytes, Retención:g.retentionInDays ? `${g.retentionInDays} días` : 'sin expiración' } }));
    case 'ecs': return (raw.clusterArns || []).map(a => ({ title:a.split('/').pop(), fields:{ ARN:a } }));
    case 'eks': return (raw.clusters || []).map(n => ({ title:n, fields:{ Tipo:'Cluster EKS' } }));
    case 'apigateway': return (raw.items || []).map(a => ({ title:a.name || a.id, fields:{ ID:a.id, Creado:a.createdDate, Descripción:a.description || '-' } }));
    case 'iam': return (raw.Roles || []).map(r => ({ title:r.RoleName, fields:{ ARN:r.Arn, Creado:r.CreateDate, Path:r.Path } }));
    case 'secrets': return (raw.SecretList || []).map(s => ({ title:s.Name, fields:{ ARN:s.ARN, Rotación:s.RotationEnabled ? 'sí':'no', Modificado:s.LastChangedDate || '-' } }));
    case 'sqs': return (raw.QueueUrls || []).map(u => ({ title:u.split('/').pop(), fields:{ URL:u } }));
    case 'sns': return (raw.Topics || []).map(t => ({ title:t.TopicArn.split(':').pop(), fields:{ ARN:t.TopicArn } }));
    case 'vpc': return (raw.Vpcs || []).map(v => ({ title:v.VpcId, fields:{ CIDR:v.CidrBlock, Estado:v.State, Default:v.IsDefault ? 'sí':'no' } }));
    case 'cost': {
      const total = raw.ResultsByTime?.[0]?.Total?.UnblendedCost;
      return total ? [{ title:'Costo mes actual', fields:{ Monto:`${total.Amount} ${total.Unit}`, Periodo:`${raw.ResultsByTime[0].TimePeriod.Start} → ${raw.ResultsByTime[0].TimePeriod.End}` } }] : [];
    }
    default: return [];
  }
}

function renderResources(items) {
  if (!items.length) { $('resourcesPanel').innerHTML = '<p>No se encontraron recursos o la respuesta no contiene elementos visibles.</p>'; return; }
  const grid = document.createElement('div'); grid.className = 'resource-grid';
  for (const item of items) {
    const card = document.createElement('div'); card.className = 'resource';
    const fields = Object.entries(item.fields || {}).map(([k,v]) => `<div class="kv"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</div>`).join('');
    card.innerHTML = `<h3>${escapeHtml(item.title)}</h3>${fields}`;
    if (item.instanceId) {
      const actions = document.createElement('div'); actions.className = 'resource-actions';
      for (const [action,label] of [['start','Iniciar'],['stop','Detener'],['reboot','Reiniciar']]) {
        const btn = document.createElement('button'); btn.textContent = label; btn.className = 'dangerish';
        btn.addEventListener('click', () => ec2Action(action, item.instanceId)); actions.appendChild(btn);
      }
      card.appendChild(actions);
    }
    grid.appendChild(card);
  }
  $('resourcesPanel').innerHTML = ''; $('resourcesPanel').appendChild(grid);
}

function renderInventory(inventory) {
  const grid = document.createElement('div');
  grid.className = 'inventory-summary';
  for (const result of inventory.results || []) {
    const service = state.catalog.find(item => item.key === result.service);
    const card = document.createElement('div');
    card.className = `inventory-card ${result.ok ? '' : 'denied'}`;
    if (result.ok) {
      const count = flattenResources(result.service, result.data).length;
      card.innerHTML = `<strong>${escapeHtml(service?.name || result.service)}</strong><span class="inventory-count">${count}</span><small> recursos visibles</small>`;
    } else {
      card.innerHTML = `<strong>${escapeHtml(service?.name || result.service)}</strong><span class="inventory-count">Sin acceso</span><small> IAM no autorizó la consulta o el servicio no está disponible.</small>`;
      card.title = result.error || '';
    }
    grid.appendChild(card);
  }
  $('resourcesPanel').innerHTML = '';
  $('resourcesPanel').appendChild(grid);
}

async function loadInventory() {
  if (!state.identity) return;
  try {
    setNotice(`Consultando inventario real en ${selectedRegion()}… Algunas políticas IAM pueden limitar los resultados.`);
    const inventory = await window.awsStudio.inventory({ profile:selectedProfile(), region:selectedRegion() });
    state.raw = inventory;
    $('rawText').textContent = JSON.stringify(inventory, null, 2);
    renderInventory(inventory);
    showTab('resources');
    const ok = inventory.results.filter(result => result.ok).length;
    setNotice(`Inventario completado: ${ok}/${inventory.results.length} servicios consultados con autorización.`);
  } catch (e) { setNotice(e.message, true); }
}

async function connectWithAwsLogin() {
  try {
    const profile = $('awsLoginProfile').value.trim();
    if (!profile) throw new Error('Indica un nombre de perfil para AWS Login.');
    setConnectionStage('browser');
    setNotice('AWS abrirá su ventana oficial: correo, contraseña y MFA se completan allí. Si necesitas recuperación, usa únicamente las alternativas que AWS muestre.');
    await window.awsStudio.awsLogin({ profile, region:selectedRegion() });
    setConnectionStage('credentials');
    await refreshProfiles();
    if (!Array.from($('profile').options).some(option => option.value === profile)) {
      const option = document.createElement('option');
      option.value = profile;
      option.textContent = profile;
      $('profile').appendChild(option);
    }
    $('profile').value = profile;
    await syncProfileRegion();
    await inspectSelectedConnection();
    setConnectionStage('sts');
    setNotice('AWS Login completado. Validando identidad real con STS…');
    const identity = await window.awsStudio.identity({ profile, region:selectedRegion() });
    unlockWorkspace(identity);
    setNotice(`Conectado a AWS real. ARN: ${identity.Arn || 'N/D'}`);
  } catch (e) { lockWorkspace('AWS Login no se completó.'); setNotice(e.message, true); }
}

async function loadResources() {
  if (!state.selected?.operational) return;
  setNotice(`Consultando ${state.selected.name} con el perfil ${selectedProfile()}…`);
  try {
    const raw = await window.awsStudio.listResources({ service:state.selected.key, profile:selectedProfile(), region:selectedRegion() });
    state.raw = raw; $('rawText').textContent = JSON.stringify(raw, null, 2);
    renderResources(flattenResources(state.selected.key, raw));
    showTab('resources'); setNotice('Consulta completada. Esta operación fue de lectura.');
  } catch (e) { setNotice(e.message, true); }
}

async function ec2Action(action, instanceId) {
  if (!$('operationalMode').checked) { setNotice('Activa el modo operativo antes de ejecutar una acción EC2.', true); return; }
  try {
    const raw = await window.awsStudio.ec2Action({ action, instanceId, profile:selectedProfile(), region:selectedRegion(), operationalMode:true });
    if (raw?.cancelled) { setNotice('Operación cancelada. No se realizaron cambios.'); return; }
    $('rawText').textContent = JSON.stringify(raw,null,2); setNotice(`Acción ${action} solicitada para ${instanceId}.`); await loadResources();
  } catch(e){ setNotice(e.message,true); }
}

async function loadTutorial() {
  if (!state.selected) return;
  try { $('tutorialText').textContent = await window.awsStudio.getTutorial({ file:state.selected.tutorial }); showTab('tutorial'); }
  catch(e){ setNotice(e.message,true); }
}

function showTab(name) {
  for (const p of ['resources','tasks','tutorial','raw']) $(p+'Panel').classList.toggle('hidden', p !== name);
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
}

async function init() {
  for (const r of regions) { const o=document.createElement('option'); o.value=r; o.textContent=r; if(r==='sa-east-1')o.selected=true; $('region').appendChild(o); }
  state.catalog = await window.awsStudio.getCatalog(); renderCatalog();
  $('taskService').innerHTML = '<option value="general">General</option>';
  for (const service of state.catalog) {
    const option = document.createElement('option'); option.value = service.key; option.textContent = service.name; $('taskService').appendChild(option);
  }
  loadTasks(); renderTasks();
  const d = await window.awsStudio.diagnostics(); $('cliBadge').textContent = d.awsCliInstalled ? d.awsCliVersion : 'AWS CLI no detectado';
  if (!d.awsCliInstalled) setNotice('Instala AWS CLI v2 y configura un perfil/SSO para usar el modo operativo.', true);
  else await refreshProfiles();
}

$('refreshProfiles').addEventListener('click', refreshProfiles);
$('profile').addEventListener('change', async () => { if (state.identity) lockWorkspace('El perfil cambió. Verifica nuevamente la identidad.'); await syncProfileRegion(); await inspectSelectedConnection(); });
$('region').addEventListener('change', () => {
  if (!state.identity) return;
  state.raw = {};
  $('rawText').textContent = '{}';
  $('accountSummary').textContent = `Cuenta ${state.identity.Account || 'validada'} · ${selectedRegion()}`;
  $('resourcesPanel').innerHTML = `<p>Región cambiada a <strong>${escapeHtml(selectedRegion())}</strong>. La identidad sigue conectada; vuelve a consultar el inventario o el servicio seleccionado.</p>`;
  setNotice(`Región activa: ${selectedRegion()}. La sesión AWS continúa validada.`);
});
$('search').addEventListener('input', e => renderCatalog(e.target.value));
$('loadResources').addEventListener('click', loadResources);
$('loadInventory').addEventListener('click', loadInventory);
$('awsLogin').addEventListener('click', connectWithAwsLogin);
$('loadTutorial').addEventListener('click', loadTutorial);
$('operationalMode').addEventListener('change', e => { state.operationalMode=e.target.checked; setNotice(e.target.checked ? 'Modo operativo ACTIVO: confirma cuidadosamente cualquier cambio.' : 'Modo lectura activo.'); });
$('validateIdentity').addEventListener('click', async () => { try { setConnectionStage('sts'); setNotice('Verificando identidad con AWS STS…'); const id=await window.awsStudio.identity({profile:selectedProfile(),region:selectedRegion()}); unlockWorkspace(id); setNotice(`Sesión válida. ARN: ${id.Arn || 'N/D'}`); } catch(e){ lockWorkspace(); $('identityBadge').textContent='Sesión inválida'; setNotice(e.message,true); } });
$('ssoLogin').addEventListener('click', async () => { try { setNotice('Abriendo autenticación AWS IAM Identity Center en el navegador…'); await window.awsStudio.ssoLogin({profile:selectedProfile()}); setNotice('SSO login completado. Valida la sesión.'); } catch(e){ setNotice(e.message,true); } });
$('openConsole').addEventListener('click', async () => { try { const region=selectedRegion(); await window.awsStudio.openExternal({url:`https://${region}.console.aws.amazon.com/console/home?region=${encodeURIComponent(region)}#`}); } catch(e){ setNotice(e.message,true); } });
$('ssoProfileForm').addEventListener('submit', async event => {
  event.preventDefault();
  const payload = {
    sessionName:$('ssoSessionName').value,
    startUrl:$('ssoStartUrl').value,
    ssoRegion:$('ssoRegion').value,
    accountId:$('ssoAccountId').value,
    roleName:$('ssoRoleName').value,
    profileName:$('ssoProfileName').value,
    defaultRegion:$('ssoDefaultRegion').value
  };
  try {
    const accepted = await window.awsStudio.confirm({ title:'Guardar perfil AWS SSO', message:`Se actualizará ~/.aws/config para crear el perfil “${payload.profileName.trim()}”.` });
    if (!accepted) return;
    setNotice('Guardando la configuración SSO…');
    const result = await window.awsStudio.saveSsoProfile(payload);
    await refreshProfiles();
    $('profile').value = result.profile;
    await syncProfileRegion();
    setNotice(`Perfil ${result.profile} guardado. Ahora inicia sesión SSO.`);
  } catch(e) { setNotice(e.message, true); }
});
$('assumeRoleForm').addEventListener('submit', async event => {
  event.preventDefault();
  const payload = {
    profileName:$('roleProfileName').value,
    sourceProfile:$('roleSourceProfile').value,
    roleArn:$('roleArn').value,
    sessionName:$('roleSessionName').value,
    region:selectedRegion()
  };
  try {
    const accepted = await window.awsStudio.confirm({ title:'Guardar perfil AssumeRole', message:`Se actualizará ~/.aws/config para crear el perfil “${payload.profileName.trim()}”.` });
    if (!accepted) return;
    const result = await window.awsStudio.saveAssumeRoleProfile(payload);
    await refreshProfiles();
    $('profile').value = result.profile;
    await syncProfileRegion();
    setNotice(`Perfil ${result.profile} creado. Verifica la identidad para confirmar el rol efectivo.`);
  } catch (e) { setNotice(e.message, true); }
});
$('changeConnection').addEventListener('click', () => lockWorkspace());
$('terminal').addEventListener('click', async () => { try { await window.awsStudio.openProfileTerminal({profile:selectedProfile(),region:selectedRegion()}); } catch(e){ setNotice(e.message,true); } });
$('taskForm').addEventListener('submit', event => {
  event.preventDefault();
  const title = $('taskTitle').value.trim();
  if (!title) return;
  const serviceKey = $('taskService').value;
  const service = state.catalog.find(item => item.key === serviceKey);
  state.tasks.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), title, service: service?.name || 'General', priority:$('taskPriority').value, due:$('taskDue').value, status:'pending', createdAt:new Date().toISOString() });
  saveTasks(); renderTasks(); $('taskTitle').value = ''; showTab('tasks');
});
document.querySelectorAll('.task-filter').forEach(button => button.addEventListener('click', () => {
  state.taskFilter = button.dataset.taskFilter;
  document.querySelectorAll('.task-filter').forEach(item => item.classList.toggle('active', item === button));
  renderTasks();
}));
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));

init().catch(e => setNotice(e.message,true));
