/* ==========================================================================
   DVRCS — Disaster Zones
   ========================================================================== */

const ZONE_ICONS = { Flood: 'flood', Cyclone: 'cyclone', Earthquake: 'earthquake', Fire: 'whatshot', Landslide: 'landslide', Heatwave: 'thermostat' };
let zoneFilters = { search: '', type: '', severity: '' };

let mainMap;
let mainMarkers = [];
let miniMaps = [];

function initMainMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  mainMap = L.map('map', {
    center: [21.5, 78.5],
    zoom: 5,
    minZoom: 4,
    maxZoom: 10,
    scrollWheelZoom: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(mainMap);
}

function updateMainMapMarkers(filteredZones) {
  if (!mainMap) return;

  // Clear old markers
  mainMarkers.forEach(m => mainMap.removeLayer(m));
  mainMarkers = [];

  filteredZones.forEach(z => {
    if (!z.lat || !z.lng) return;
    const color = z.severity === 'critical' ? '#C1272D' : z.severity === 'high' ? '#E08A00' : '#2E7D32';
    const marker = L.circleMarker([z.lat, z.lng], {
      radius: 9,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.95
    }).addTo(mainMap);

    marker.bindPopup(`
      <div style="font-family: var(--font-body); padding: 4px; min-width: 140px;">
        <h4 style="margin: 0 0 4px; font-family: var(--font-display); font-size: 0.95rem; font-weight: 600;">${z.name}</h4>
        <div style="font-size: 0.72rem; color: var(--ink-soft); font-family: var(--font-mono); margin-bottom: 6px;">${z.district}</div>
        <div style="font-size: 0.78rem; margin-bottom: 2px;">Type: <strong>${z.type}</strong></div>
        <div style="font-size: 0.78rem; margin-bottom: 2px;">Severity: <strong style="color: ${color}">${z.severity.toUpperCase()}</strong></div>
        <div style="font-size: 0.78rem;">Progress: <strong>${z.progress}%</strong></div>
      </div>
    `);

    // Pan map to card location on card click
    marker.on('click', () => {
      const card = document.querySelector(`.zone-card[data-id="${z.id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('highlight-flash');
        setTimeout(() => card.classList.remove('highlight-flash'), 1500);
      }
    });

    mainMarkers.push(marker);
  });
}

function zoneMatches(z) {
  const q = zoneFilters.search.toLowerCase();
  const matchesSearch = !q || z.name.toLowerCase().includes(q) || z.district.toLowerCase().includes(q);
  const matchesType = !zoneFilters.type || z.type === zoneFilters.type;
  const matchesSeverity = !zoneFilters.severity || z.severity === zoneFilters.severity;
  return matchesSearch && matchesType && matchesSeverity;
}

function renderZoneHeadStats() {
  const zones = DB.get(DB.keys.zones);
  const critical = zones.filter((z) => z.severity === 'critical').length;
  const active = zones.filter((z) => z.status === 'Active').length;
  const totalVol = zones.reduce((sum, z) => sum + z.volunteersAssigned, 0);
  document.getElementById('zoneHeadStats').innerHTML = `
    <div><div class="n">${zones.length}</div><div class="l">Total Zones</div></div>
    <div><div class="n">${critical}</div><div class="l">Critical Severity</div></div>
    <div><div class="n">${active}</div><div class="l">Active Response</div></div>
    <div><div class="n">${totalVol}</div><div class="l">Volunteers Deployed</div></div>`;
}

function zoneCardHTML(z) {
  const pct = Math.round((z.volunteersAssigned / z.volunteersNeeded) * 100);
  const full = z.volunteersAssigned >= z.volunteersNeeded;
  return `
    <div class="card card-hover zone-card reveal" data-id="${z.id}">
      <div class="zone-card__head">
        <div class="zone-card__title">
          <div class="zone-card__icon"><span class="material-symbols-outlined">${ZONE_ICONS[z.type] || 'location_on'}</span></div>
          <div><h3>${z.name}</h3><div class="loc">${z.district}</div></div>
        </div>
        <span class="pill pill-${z.severity === 'critical' ? 'critical' : z.severity === 'high' ? 'high' : 'medium'}">${z.severity}</span>
      </div>
      <div class="zone-map" id="mini-map-${z.id}"></div>
      <div class="zone-stats">
        <div><div class="n">${z.type}</div><div class="l">Type</div></div>
        <div><div class="n">${z.volunteersAssigned}/${z.volunteersNeeded}</div><div class="l">Volunteers</div></div>
        <div><div class="n">${z.status}</div><div class="l">Status</div></div>
      </div>
      <div>
        <div class="flex-between" style="margin-bottom:6px;"><span class="muted" style="font-size:0.78rem;">Response Progress</span><span class="mono" style="font-size:0.78rem;">${z.progress}%</span></div>
        <div class="progress-track"><div class="progress-fill" data-width="${z.progress}"></div></div>
      </div>
      <div class="zone-resources">${z.resources.map((r) => `<span>${r}</span>`).join('')}</div>
      <div class="zone-card__footer">
        <span class="mono muted" style="font-size:0.72rem;">Volunteer match: ${pct}%</span>
        <button class="btn btn-outline btn-sm assign-zone-btn" ${full ? 'disabled' : ''}>${full ? 'Fully Staffed' : 'Assign Volunteer'}</button>
      </div>
    </div>`;
}

function renderZones() {
  const zones = DB.get(DB.keys.zones);
  const filtered = zones.filter(zoneMatches);
  const grid = document.getElementById('zoneGrid');
  const empty = document.getElementById('zoneEmpty');

  // Clean up existing mini-maps to prevent Leaflet memory leaks
  miniMaps.forEach(m => m.remove());
  miniMaps = [];

  grid.innerHTML = filtered.map(zoneCardHTML).join('');
  empty.style.display = filtered.length ? 'none' : 'block';

  requestAnimationFrame(() => {
    grid.querySelectorAll('.progress-fill').forEach((el) => { el.style.width = el.dataset.width + '%'; });
    grid.querySelectorAll('.reveal').forEach((el) => el.classList.add('in-view'));

    // Initialize Leaflet mini-maps inside the cards
    filtered.forEach(z => {
      if (!z.lat || !z.lng) return;
      try {
        const miniMap = L.map(`mini-map-${z.id}`, {
          center: [z.lat, z.lng],
          zoom: 7,
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          touchZoom: false,
          attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(miniMap);

        const color = z.severity === 'critical' ? '#C1272D' : z.severity === 'high' ? '#E08A00' : '#2E7D32';
        L.circleMarker([z.lat, z.lng], {
          radius: 7,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        }).addTo(miniMap);

        miniMaps.push(miniMap);
      } catch (e) {
        console.error("Error creating mini map for " + z.name, e);
      }
    });
  });

  renderZoneHeadStats();
  updateMainMapMarkers(filtered);
}

function assignVolunteerToZone(zoneId) {
  const zones = DB.get(DB.keys.zones);
  const zone = zones.find((z) => z.id === zoneId);
  if (!zone || zone.volunteersAssigned >= zone.volunteersNeeded) return;
  zone.volunteersAssigned += 1;
  zone.progress = Math.min(100, Math.round((zone.volunteersAssigned / zone.volunteersNeeded) * 100));
  if (zone.progress >= 100) zone.status = 'Recovery';
  DB.set(DB.keys.zones, zones);

  const volunteers = DB.get(DB.keys.volunteers);
  const candidate = volunteers.find((v) => v.status === 'Available' && !v.zone);
  if (candidate) {
    candidate.zone = zone.name;
    candidate.status = 'Assigned';
    DB.set(DB.keys.volunteers, volunteers);
  }
  toast('Volunteer assigned', `${candidate ? candidate.name : 'A volunteer'} deployed to ${zone.name}.`, 'success');
  renderZones();
  initOpsStrip();
}

document.addEventListener('DOMContentLoaded', () => {
  initMainMap();
  renderZones();

  document.getElementById('zoneSearch').addEventListener('input', debounce((e) => { zoneFilters.search = e.target.value; renderZones(); }, 200));
  document.getElementById('typeFilter').addEventListener('change', (e) => { zoneFilters.type = e.target.value; renderZones(); });
  document.getElementById('severityFilter').addEventListener('change', (e) => { zoneFilters.severity = e.target.value; renderZones(); });
  
  document.getElementById('zoneGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('.assign-zone-btn');
    if (btn) {
      const card = e.target.closest('.zone-card');
      assignVolunteerToZone(card.dataset.id);
      return;
    }

    // Click on card to pan main map to it
    const card = e.target.closest('.zone-card');
    if (card && mainMap) {
      const id = card.dataset.id;
      const zones = DB.get(DB.keys.zones);
      const zone = zones.find(z => z.id === id);
      if (zone && zone.lat && zone.lng) {
        mainMap.setView([zone.lat, zone.lng], 7, { animate: true, duration: 1 });
      }
    }
  });
});
