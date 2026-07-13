/* ==========================================================================
   DVRCS — SOS Center
   ========================================================================== */

let sosFilters = { search: '', status: '', severity: '' };
const SOS_PILL = { Pending: 'pill-critical', Assigned: 'pill-high', Resolved: 'pill-low' };

function sosMatches(s) {
  const q = sosFilters.search.toLowerCase();
  const matchesSearch = !q || s.location.toLowerCase().includes(q) || s.type.toLowerCase().includes(q);
  const matchesStatus = !sosFilters.status || s.status === sosFilters.status;
  const matchesSev = !sosFilters.severity || s.severity === sosFilters.severity;
  return matchesSearch && matchesStatus && matchesSev;
}

function renderSosHeadStats() {
  const sos = DB.get(DB.keys.sos);
  const pending = sos.filter((s) => s.status === 'Pending').length;
  const assigned = sos.filter((s) => s.status === 'Assigned').length;
  const resolved = sos.filter((s) => s.status === 'Resolved').length;
  document.getElementById('sosHeadStats').innerHTML = `
    <div><div class="n">${sos.length}</div><div class="l">Total Requests</div></div>
    <div><div class="n">${pending}</div><div class="l">Pending</div></div>
    <div><div class="n">${assigned}</div><div class="l">Assigned</div></div>
    <div><div class="n">${resolved}</div><div class="l">Resolved</div></div>`;
}

function sosCardHTML(s) {
  return `
    <div class="card card-hover sos-card sev-${s.severity} reveal" data-id="${s.id}">
      <div class="sos-card__head">
        <div><h3 style="font-size:0.98rem;">${s.location}</h3><span class="mono muted" style="font-size:0.74rem;">${timeAgo(s.timestamp)}</span></div>
        <span class="pill ${SOS_PILL[s.status]}">${s.status}</span>
      </div>
      <div class="sos-card__grid">
        <div><span class="l">Disaster Type</span>${s.type}</div>
        <div><span class="l">Severity</span><span class="pill pill-${s.severity === 'critical' ? 'critical' : s.severity === 'high' ? 'high' : 'medium'}">${s.severity}</span></div>
        <div><span class="l">People Affected</span>${s.people}</div>
        <div><span class="l">Assigned Volunteer</span>${s.volunteer || '—'}</div>
      </div>
      <div class="flex-gap">
        <button class="btn btn-outline btn-sm dispatch-btn" ${s.status !== 'Pending' ? 'disabled' : ''}>Dispatch Volunteer</button>
        <button class="btn btn-primary btn-sm resolve-btn" ${s.status !== 'Assigned' ? 'disabled' : ''}>Mark Resolved</button>
      </div>
    </div>`;
}

function renderSos() {
  const sos = DB.get(DB.keys.sos).sort((a, b) => {
    const order = { Pending: 0, Assigned: 1, Resolved: 2 };
    return order[a.status] - order[b.status] || b.timestamp - a.timestamp;
  });
  const filtered = sos.filter(sosMatches);
  const grid = document.getElementById('sosGrid');
  const empty = document.getElementById('sosEmpty');
  grid.innerHTML = filtered.map(sosCardHTML).join('');
  empty.style.display = filtered.length ? 'none' : 'block';
  requestAnimationFrame(() => grid.querySelectorAll('.reveal').forEach((el) => el.classList.add('in-view')));
  renderSosHeadStats();
}

document.addEventListener('DOMContentLoaded', () => {
  renderSos();
  document.getElementById('sosSearch').addEventListener('input', debounce((e) => { sosFilters.search = e.target.value; renderSos(); }, 200));
  document.getElementById('sosStatusFilter').addEventListener('change', (e) => { sosFilters.status = e.target.value; renderSos(); });
  document.getElementById('sosSevFilter').addEventListener('change', (e) => { sosFilters.severity = e.target.value; renderSos(); });

  document.getElementById('sosGrid').addEventListener('click', (e) => {
    const card = e.target.closest('.sos-card');
    if (!card) return;
    const id = card.dataset.id;
    const sos = DB.get(DB.keys.sos);
    const req = sos.find((s) => s.id === id);
    if (!req) return;

    if (e.target.closest('.dispatch-btn')) {
      const volunteers = DB.get(DB.keys.volunteers);
      const candidate = volunteers.find((v) => v.status === 'Available');
      req.status = 'Assigned';
      req.volunteer = candidate ? candidate.name : 'Reserve Team';
      if (candidate) { candidate.status = 'Assigned'; DB.set(DB.keys.volunteers, volunteers); }
      DB.set(DB.keys.sos, sos);
      toast('Volunteer dispatched', `${req.volunteer} is responding to ${req.location}.`, 'success');
      renderSos(); initOpsStrip();
    }

    if (e.target.closest('.resolve-btn')) {
      req.status = 'Resolved';
      DB.set(DB.keys.sos, sos);
      toast('Request resolved', `SOS at ${req.location} marked as resolved.`, 'success');
      renderSos(); initOpsStrip();
    }
  });
});
