/* ==========================================================================
   DVRCS — Resource Tracking
   ========================================================================== */

let resFilters = { search: '', level: '' };

function resMatches(r) {
  const q = resFilters.search.toLowerCase();
  const matchesSearch = !q || r.name.toLowerCase().includes(q);
  const matchesLevel = !resFilters.level || (resFilters.level === 'critical' ? r.critical : !r.critical);
  return matchesSearch && matchesLevel;
}

function renderResHeadStats() {
  const resources = DB.get(DB.keys.resources);
  const criticalCount = resources.filter((r) => r.critical).length;
  const totalDelivered = resources.reduce((s, r) => s + r.delivered, 0);
  const totalTransit = resources.reduce((s, r) => s + r.transit, 0);
  document.getElementById('resHeadStats').innerHTML = `
    <div><div class="n">${resources.length}</div><div class="l">Categories Tracked</div></div>
    <div><div class="n">${criticalCount}</div><div class="l">Critical Level</div></div>
    <div><div class="n">${totalDelivered.toLocaleString('en-IN')}</div><div class="l">Units Delivered</div></div>
    <div><div class="n">${totalTransit.toLocaleString('en-IN')}</div><div class="l">Units In Transit</div></div>`;
}

function resCardHTML(r) {
  const pct = Math.round((r.delivered / r.requested) * 100);
  return `
    <div class="card card-hover resource-card reveal">
      <div class="resource-card__head">
        <div class="flex" style="gap:12px;align-items:center;">
          <div class="resource-card__icon"><span class="material-symbols-outlined">${r.icon}</span></div>
          <h3 style="font-size:1rem;">${r.name}</h3>
        </div>
        <span class="pill ${r.critical ? 'pill-critical' : 'pill-medium'}">${r.critical ? 'Critical' : 'Stable'}</span>
      </div>
      <div class="resource-metrics">
        <div><div class="n">${r.available.toLocaleString('en-IN')}</div><div class="l">Available</div></div>
        <div><div class="n">${r.transit.toLocaleString('en-IN')}</div><div class="l">In Transit</div></div>
        <div><div class="n">${r.delivered.toLocaleString('en-IN')}</div><div class="l">Delivered</div></div>
      </div>
      <div class="flex-between" style="margin-bottom:6px;"><span class="muted" style="font-size:0.78rem;">Fulfilment vs Requested (${r.requested.toLocaleString('en-IN')})</span><span class="mono" style="font-size:0.78rem;">${pct}%</span></div>
      <div class="progress-track"><div class="progress-fill" data-width="${Math.min(pct, 100)}" style="${r.critical ? 'background:linear-gradient(90deg,#E08A00,#C1272D);' : ''}"></div></div>
    </div>`;
}

function renderResources() {
  const resources = DB.get(DB.keys.resources);
  const filtered = resources.filter(resMatches);
  const grid = document.getElementById('resGrid');
  const empty = document.getElementById('resEmpty');
  grid.innerHTML = filtered.map(resCardHTML).join('');
  empty.style.display = filtered.length ? 'none' : 'block';
  requestAnimationFrame(() => {
    grid.querySelectorAll('.progress-fill').forEach((el) => { el.style.width = el.dataset.width + '%'; });
    grid.querySelectorAll('.reveal').forEach((el) => el.classList.add('in-view'));
  });
  renderResHeadStats();
}

document.addEventListener('DOMContentLoaded', () => {
  renderResources();
  document.getElementById('resSearch').addEventListener('input', debounce((e) => { resFilters.search = e.target.value; renderResources(); }, 200));
  document.getElementById('resFilter').addEventListener('change', (e) => { resFilters.level = e.target.value; renderResources(); });
});
