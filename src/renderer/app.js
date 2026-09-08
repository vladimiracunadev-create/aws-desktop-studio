'use strict';

const $ = (id) => document.getElementById(id);
const state = { catalog: [], selected: null, raw: {}, operationalMode: false };
const regions = ['us-east-1','us-east-2','us-west-1','us-west-2','sa-east-1','ca-central-1','eu-west-1','eu-west-2','eu-central-1','ap-southeast-1','ap-southeast-2','ap-northeast-1'];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function setNotice(message, error = false) {
  $('notice').textContent = message;
  $('notice').style.borderLeftColor = error ? '#ef4444' : '#38bdf8';
}

function selectedProfile() { return $('profile').value; }
function selectedRegion() { return $('region').value; }

async function refreshProfiles() {
  try {
    const current = $('profile').value;
    const profiles = await window.awsStudio.listProfiles();
    $('profile').innerHTML = '';
    for (const p of profiles) {
      const opt = document.createElement('option'); opt.value = p; opt.textContent = p; $('profile').appendChild(opt);
    }
    if (current && profiles.includes(current)) $('profile').value = current;
    if (!profiles.length) setNotice('No se encontraron perfiles. Configura AWS CLI o IAM Identity Center.', true);
    else {
      setNotice(`Perfiles detectados: ${profiles.join(', ')}. Selecciona uno y valida la sesión.`);
      await syncProfileRegion();
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
  for (const p of ['resources','tutorial','raw']) $(p+'Panel').classList.toggle('hidden', p !== name);
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
}

async function init() {
  for (const r of regions) { const o=document.createElement('option'); o.value=r; o.textContent=r; if(r==='sa-east-1')o.selected=true; $('region').appendChild(o); }
  state.catalog = await window.awsStudio.getCatalog(); renderCatalog();
  const d = await window.awsStudio.diagnostics(); $('cliBadge').textContent = d.awsCliInstalled ? d.awsCliVersion : 'AWS CLI no detectado';
  if (!d.awsCliInstalled) setNotice('Instala AWS CLI v2 y configura un perfil/SSO para usar el modo operativo.', true);
  else await refreshProfiles();
}

$('refreshProfiles').addEventListener('click', refreshProfiles);
$('profile').addEventListener('change', syncProfileRegion);
$('search').addEventListener('input', e => renderCatalog(e.target.value));
$('loadResources').addEventListener('click', loadResources);
$('loadTutorial').addEventListener('click', loadTutorial);
$('operationalMode').addEventListener('change', e => { state.operationalMode=e.target.checked; setNotice(e.target.checked ? 'Modo operativo ACTIVO: confirma cuidadosamente cualquier cambio.' : 'Modo lectura activo.'); });
$('validateIdentity').addEventListener('click', async () => { try { const id=await window.awsStudio.identity({profile:selectedProfile(),region:selectedRegion()}); $('identityBadge').textContent = id.Account ? `Cuenta ${id.Account}` : 'Sesión válida'; setNotice(`Sesión válida. ARN: ${id.Arn || 'N/D'}`); } catch(e){ $('identityBadge').textContent='Sesión inválida'; setNotice(e.message,true); } });
$('ssoLogin').addEventListener('click', async () => { try { setNotice('Abriendo autenticación AWS IAM Identity Center en el navegador…'); await window.awsStudio.ssoLogin({profile:selectedProfile()}); setNotice('SSO login completado. Valida la sesión.'); } catch(e){ setNotice(e.message,true); } });
$('terminal').addEventListener('click', async () => { try { await window.awsStudio.openProfileTerminal({profile:selectedProfile(),region:selectedRegion()}); } catch(e){ setNotice(e.message,true); } });
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));

init().catch(e => setNotice(e.message,true));
