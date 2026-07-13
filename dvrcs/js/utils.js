/* ==========================================================================
   DVRCS — Shared Utilities
   Storage layer, seed data, toast/modal system, chrome (nav/footer) behaviour
   ========================================================================== */

const DB = {
  keys: { volunteers: 'dvrcs_volunteers', zones: 'dvrcs_zones', resources: 'dvrcs_resources', sos: 'dvrcs_sos', seeded: 'dvrcs_seeded_v4' },
  get(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
};

/* ---------- Seed data (first run only) ---------- */
function seedDatabase() {
  if (localStorage.getItem(DB.keys.seeded)) return;

  const zones = [
    { id: DB.uid(), name: 'Kaziranga Belt', district: 'Golaghat, Assam', type: 'Flood', severity: 'critical', status: 'Active', volunteersNeeded: 40, volunteersAssigned: 27, progress: 62, resources: ['Boats', 'Food Kits', 'Medical Kits'], lat: 26.5775, lng: 93.1711, pin: { x: 62, y: 38 } },
    { id: DB.uid(), name: 'Puri Coastal Strip', district: 'Puri, Odisha', type: 'Cyclone', severity: 'critical', status: 'Active', volunteersNeeded: 55, volunteersAssigned: 31, progress: 45, resources: ['Tents', 'Ambulances', 'Water'], lat: 19.8134, lng: 85.8312, pin: { x: 30, y: 70 } },
    { id: DB.uid(), name: 'Bhuj Fault Line', district: 'Kutch, Gujarat', type: 'Earthquake', severity: 'high', status: 'Assessment', volunteersNeeded: 30, volunteersAssigned: 12, progress: 22, resources: ['Rescue Equipment', 'Medical Kits'], lat: 23.2420, lng: 69.6669, pin: { x: 18, y: 30 } },
    { id: DB.uid(), name: 'Bandipur Range', district: 'Chamarajanagar, Karnataka', type: 'Fire', severity: 'high', status: 'Active', volunteersNeeded: 25, volunteersAssigned: 19, progress: 70, resources: ['Water', 'Rescue Equipment'], lat: 11.6667, lng: 76.6264, pin: { x: 45, y: 78 } },
    { id: DB.uid(), name: 'Munnar Slopes', district: 'Idukki, Kerala', type: 'Landslide', severity: 'medium', status: 'Recovery', volunteersNeeded: 18, volunteersAssigned: 16, progress: 85, resources: ['Blankets', 'Food Kits'], lat: 10.0889, lng: 77.0595, pin: { x: 40, y: 88 } },
    { id: DB.uid(), name: 'Vidarbha Plains', district: 'Nagpur, Maharashtra', type: 'Heatwave', severity: 'medium', status: 'Monitoring', volunteersNeeded: 15, volunteersAssigned: 9, progress: 38, resources: ['Water', 'Medicines'], lat: 21.1458, lng: 79.0882, pin: { x: 55, y: 60 } }
  ];

  const resources = [
    { id: DB.uid(), name: 'Food Kits', icon: 'lunch_dining', available: 1240, requested: 900, delivered: 640, transit: 180, critical: false },
    { id: DB.uid(), name: 'Drinking Water', icon: 'water_drop', available: 3600, requested: 2800, delivered: 2100, transit: 400, critical: false },
    { id: DB.uid(), name: 'Medical Kits', icon: 'medical_services', available: 210, requested: 340, delivered: 150, transit: 60, critical: true },
    { id: DB.uid(), name: 'Blankets', icon: 'blanket', available: 980, requested: 700, delivered: 520, transit: 90, critical: false },
    { id: DB.uid(), name: 'Tents', icon: 'cabin', available: 145, requested: 260, delivered: 90, transit: 40, critical: true },
    { id: DB.uid(), name: 'Rescue Boats', icon: 'sailing', available: 22, requested: 35, delivered: 14, transit: 6, critical: true },
    { id: DB.uid(), name: 'Ambulances', icon: 'ambulance', available: 18, requested: 20, delivered: 12, transit: 3, critical: false },
    { id: DB.uid(), name: 'Medicines', icon: 'pill', available: 5400, requested: 4200, delivered: 3100, transit: 700, critical: false },
    { id: DB.uid(), name: 'Rescue Equipment', icon: 'construction', available: 88, requested: 120, delivered: 52, transit: 20, critical: false }
  ];

  const volunteers = [
    { id: DB.uid(), name: 'Ananya Sharma', age: 27, gender: 'Female', phone: '9876500001', email: 'ananya.s@example.in', state: 'Assam', district: 'Golaghat', blood: 'O+', skills: 'Medical Aid, First Aid', medical: 'Yes', languages: 'Assamese, Hindi, English', vehicle: 'Yes', availability: 'Full-time', zone: 'Kaziranga Belt', status: 'On Mission', registeredAt: Date.now() - 86400000 * 5 },
    { id: DB.uid(), name: 'Rohan Verma', age: 31, gender: 'Male', phone: '9876500002', email: 'rohan.v@example.in', state: 'Odisha', district: 'Puri', blood: 'B+', skills: 'Swimming, Boat Handling', medical: 'No', languages: 'Odia, Hindi', vehicle: 'Yes', availability: 'Full-time', zone: 'Puri Coastal Strip', status: 'Assigned', registeredAt: Date.now() - 86400000 * 3 },
    { id: DB.uid(), name: 'Farah Khan', age: 24, gender: 'Female', phone: '9876500003', email: 'farah.k@example.in', state: 'Gujarat', district: 'Kutch', blood: 'A+', skills: 'Search & Rescue', medical: 'Yes', languages: 'Gujarati, Hindi, English', vehicle: 'No', availability: 'Weekends', zone: 'Bhuj Fault Line', status: 'Available', registeredAt: Date.now() - 86400000 * 8 },
    { id: DB.uid(), name: 'Karthik Iyer', age: 35, gender: 'Male', phone: '9876500004', email: 'karthik.i@example.in', state: 'Karnataka', district: 'Chamarajanagar', blood: 'AB+', skills: 'Firefighting, Logistics', medical: 'No', languages: 'Kannada, English', vehicle: 'Yes', availability: 'Full-time', zone: 'Bandipur Range', status: 'On Mission', registeredAt: Date.now() - 86400000 * 12 },
    { id: DB.uid(), name: 'Meera Nair', age: 29, gender: 'Female', phone: '9876500005', email: 'meera.n@example.in', state: 'Kerala', district: 'Idukki', blood: 'O-', skills: 'Counselling, Medical Aid', medical: 'Yes', languages: 'Malayalam, English', vehicle: 'No', availability: 'On-call', zone: 'Munnar Slopes', status: 'Completed', registeredAt: Date.now() - 86400000 * 20 },
    { id: DB.uid(), name: 'Devansh Patil', age: 22, gender: 'Male', phone: '9876500006', email: 'devansh.p@example.in', state: 'Maharashtra', district: 'Nagpur', blood: 'B-', skills: 'Logistics, Driving', medical: 'No', languages: 'Marathi, Hindi', vehicle: 'Yes', availability: 'Weekends', zone: '', status: 'Available', registeredAt: Date.now() - 86400000 * 1 },
    { id: DB.uid(), name: 'Simran Kaur', age: 33, gender: 'Female', phone: '9876500007', email: 'simran.k@example.in', state: 'Punjab', district: 'Amritsar', blood: 'A-', skills: 'Medical Aid, Cooking', medical: 'Yes', languages: 'Punjabi, Hindi, English', vehicle: 'No', availability: 'Full-time', zone: '', status: 'Available', registeredAt: Date.now() - 86400000 * 2 },
    { id: DB.uid(), name: 'Aditya Rao', age: 40, gender: 'Male', phone: '9876500008', email: 'aditya.r@example.in', state: 'Telangana', district: 'Hyderabad', blood: 'O+', skills: 'Engineering, Structural Assessment', medical: 'No', languages: 'Telugu, English', vehicle: 'Yes', availability: 'On-call', zone: '', status: 'Inactive', registeredAt: Date.now() - 86400000 * 40 }
  ];

  const sos = [
    { id: DB.uid(), location: 'Kaliabor Village, Golaghat', type: 'Flood', severity: 'critical', people: 42, volunteer: 'Ananya Sharma', status: 'Assigned', timestamp: Date.now() - 3600000 * 2 },
    { id: DB.uid(), location: 'Konark Road, Puri', type: 'Cyclone', severity: 'critical', people: 18, volunteer: '', status: 'Pending', timestamp: Date.now() - 3600000 * 1 },
    { id: DB.uid(), location: 'Bhuj Old Town', type: 'Earthquake', severity: 'high', people: 7, volunteer: 'Farah Khan', status: 'Assigned', timestamp: Date.now() - 3600000 * 6 },
    { id: DB.uid(), location: 'Bandipur Fringe Settlement', type: 'Fire', severity: 'high', people: 5, volunteer: 'Karthik Iyer', status: 'Resolved', timestamp: Date.now() - 3600000 * 20 },
    { id: DB.uid(), location: 'Munnar Tea Estate Colony', type: 'Landslide', severity: 'medium', people: 11, volunteer: 'Meera Nair', status: 'Resolved', timestamp: Date.now() - 3600000 * 30 },
    { id: DB.uid(), location: 'Nagpur Outer Ward 4', type: 'Heatwave', severity: 'medium', people: 3, volunteer: '', status: 'Pending', timestamp: Date.now() - 3600000 * 4 }
  ];

  DB.set(DB.keys.zones, zones);
  DB.set(DB.keys.resources, resources);
  DB.set(DB.keys.volunteers, volunteers);
  DB.set(DB.keys.sos, sos);
  localStorage.setItem(DB.keys.seeded, '1');
}

/* ---------- Toast ---------- */
function toast(title, message, type = 'success') {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<div class="toast-icon">${type === 'success' ? '✓' : '!'}</div><div><strong>${title}</strong>${message}</div>`;
  stack.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; el.style.transition = '0.3s ease'; setTimeout(() => el.remove(), 300); }, 3600);
}

/* ---------- Confirm modal ---------- */
function confirmAction(title, message, onConfirm, confirmLabel = 'Confirm') {
  let overlay = document.getElementById('confirmModal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirmModal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="modal"><h3 id="cmTitle"></h3><p id="cmMsg"></p>
      <div class="modal-actions"><button class="btn btn-ghost" id="cmCancel">Cancel</button><button class="btn btn-danger" id="cmOk"></button></div></div>`;
    document.body.appendChild(overlay);
  }
  overlay.querySelector('#cmTitle').textContent = title;
  overlay.querySelector('#cmMsg').textContent = message;
  const okBtn = overlay.querySelector('#cmOk');
  okBtn.textContent = confirmLabel;
  overlay.classList.add('open');
  const cancel = overlay.querySelector('#cmCancel');
  const close = () => overlay.classList.remove('open');
  const okHandler = () => { onConfirm(); close(); okBtn.removeEventListener('click', okHandler); };
  okBtn.addEventListener('click', okHandler);
  cancel.onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
}

/* ---------- Chrome behaviour: navbar, mobile drawer, back-to-top, loading, reveal ---------- */
function initChrome() {
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
    const btt = document.querySelector('.back-to-top');
    if (btt) btt.classList.toggle('show', window.scrollY > 480);
  }, { passive: true });

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.addEventListener('click', (e) => { if (e.target.tagName === 'A') links.classList.remove('open'); });
  }

  const btt = document.querySelector('.back-to-top');
  if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const loader = document.querySelector('.loading-screen');
  if (loader) window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 350));

  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); io.unobserve(entry.target); } });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  }
}

/* ---------- Animated counters ---------- */
function animateCounter(el, target, duration = 1400) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target, Number(entry.target.dataset.counter));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => io.observe(el));
}

/* ---------- Debounce ---------- */
function debounce(fn, delay = 250) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

/* ---------- Live ops strip (shared signature element) ---------- */
function initOpsStrip() {
  const track = document.getElementById('opsStrip');
  if (!track) return;
  const zones = DB.get(DB.keys.zones);
  const sos = DB.get(DB.keys.sos);
  const volunteers = DB.get(DB.keys.volunteers);
  const active = zones.filter((z) => z.status === 'Active').length;
  const pendingSos = sos.filter((s) => s.status === 'Pending').length;
  const onMission = volunteers.filter((v) => v.status === 'On Mission').length;
  const items = [
    `<span class="ops-strip__dot live"></span>${active} ZONES ACTIVE`,
    `${pendingSos} SOS REQUESTS PENDING`,
    `${onMission} VOLUNTEERS ON MISSION`,
    `NATIONAL HELPLINE — 1078`,
    `LAST SYNC ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST`
  ];
  const html = items.map((i) => `<span class="ops-strip__item">${i}</span>`).join('');
  track.innerHTML = html + html; // duplicated for seamless marquee loop
}

document.addEventListener('DOMContentLoaded', () => {
  seedDatabase();
  initChrome();
  initCounters();
  initOpsStrip();
});
