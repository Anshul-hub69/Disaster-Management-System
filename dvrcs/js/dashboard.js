/* 
   DVRCS — Volunteer Dashboard */

let volFilters = { search: '', status: '' };
const STATUS_CYCLE = ['Available', 'Assigned', 'On Mission', 'Completed'];
const STATUS_PILL = { Available: 'pill-low', Assigned: 'pill-medium', 'On Mission': 'pill-high', Completed: 'pill-neutral', Inactive: 'pill-neutral' };

function volMatches(v) {
  const q = volFilters.search.toLowerCase();
  const matchesSearch = !q || v.name.toLowerCase().includes(q) || v.skills.toLowerCase().includes(q) || (v.zone || '').toLowerCase().includes(q);
  const matchesStatus = !volFilters.status || v.status === volFilters.status;
  return matchesSearch && matchesStatus;
}

function renderVolHeadStats() {
  const volunteers = DB.get(DB.keys.volunteers);
  const available = volunteers.filter((v) => v.status === 'Available').length;
  const onMission = volunteers.filter((v) => v.status === 'On Mission').length;
  const completed = volunteers.filter((v) => v.status === 'Completed').length;
  document.getElementById('volHeadStats').innerHTML = `
    <div><div class="n">${volunteers.length}</div><div class="l">Total Registered</div></div>
    <div><div class="n">${available}</div><div class="l">Available Now</div></div>
    <div><div class="n">${onMission}</div><div class="l">On Mission</div></div>
    <div><div class="n">${completed}</div><div class="l">Missions Completed</div></div>`;
}

function volCardHTML(v) {
  return `
    <div class="card card-hover vol-card reveal" data-id="${v.id}">
      <div class="vol-card__head">
        <div class="avatar">${initials(v.name)}</div>
        <div><h3 style="font-size:0.98rem;">${v.name}</h3><div class="vol-card__meta">${v.skills}</div></div>
      </div>
      <div class="vol-card__grid">
        <div><span class="l">Zone-</span>${v.zone || '—'}</div>
        <div><span class="l">Availability-</span>${v.availability}</div>
        <div><span class="l">Blood Group-</span>${v.blood}</div>
        <div><span class="l">Status-</span><span class="pill ${STATUS_PILL[v.status]}">${v.status}</span></div>
      </div>
      <div class="vol-card__actions">
        <button class="btn btn-outline btn-sm assign-btn" ${v.status !== 'Available' ? 'disabled' : ''}>Assign</button>
        <button class="btn btn-outline btn-sm status-btn" ${v.status === 'Completed' || v.status === 'Inactive' ? 'disabled' : ''}>Update Status</button>
        <button class="btn btn-outline btn-sm complete-btn" ${v.status !== 'On Mission' ? 'disabled' : ''}>Complete Mission</button>
        <button class="btn btn-ghost btn-sm remove-btn" style="color:var(--danger);">Remove</button>
      </div>
    </div>`;
}

function renderVolunteers() {
  const volunteers = DB.get(DB.keys.volunteers);
  const filtered = volunteers.filter(volMatches);
  const grid = document.getElementById('volGrid');
  const empty = document.getElementById('volEmpty');
  grid.innerHTML = filtered.map(volCardHTML).join('');
  empty.style.display = filtered.length ? 'none' : 'block';
  requestAnimationFrame(() => grid.querySelectorAll('.reveal').forEach((el) => el.classList.add('in-view')));
  renderVolHeadStats();
}

function withVolunteer(id, fn) {
  const volunteers = DB.get(DB.keys.volunteers);
  const v = volunteers.find((x) => x.id === id);
  if (!v) return;
  fn(v, volunteers);
  DB.set(DB.keys.volunteers, volunteers);
  renderVolunteers();
  initOpsStrip();
}

/* Modal Form Validation & Management */
function setupAddVolunteerModal() {
  const modal = document.getElementById('addVolModal');
  const openBtn = document.getElementById('openAddVolBtn');
  const closeBtn = document.getElementById('closeAddVolBtn');
  const cancelBtn = document.getElementById('cancelAddVolBtn');
  const form = document.getElementById('addVolForm');

  if (!modal || !openBtn) return;

  const showModal = (show) => {
    modal.classList.toggle('open', show);
    if (!show) {
      form.reset();
      form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
      form.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
    }
  };

  openBtn.addEventListener('click', () => showModal(true));
  closeBtn.addEventListener('click', () => showModal(false));
  cancelBtn.addEventListener('click', () => showModal(false));
  modal.addEventListener('click', (e) => { if (e.target === modal) showModal(false); });

  const showError = (input, show) => {
    input.classList.toggle('invalid', show);
    const err = input.closest('.field')?.querySelector('.field-error');
    if (err) err.classList.toggle('show', show);
  };

  // Add real-time validation clear handlers
  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', () => showError(el, false));
    el.addEventListener('change', () => showError(el, false));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const req = (id) => {
      const el = form.querySelector(`#${id}`);
      const ok = el.value.trim() !== '';
      showError(el, !ok);
      if (!ok) valid = false;
      return ok;
    };

    req('fullName');
    
    const age = form.querySelector('#age');
    const ageOk = age.value && Number(age.value) >= 18 && Number(age.value) <= 65;
    showError(age, !ageOk); 
    if (!ageOk) valid = false;

    req('gender'); 
    req('bloodGroup');

    const phone = form.querySelector('#phone');
    const phoneOk = /^\d{10}$/.test(phone.value.trim());
    showError(phone, !phoneOk); 
    if (!phoneOk) valid = false;

    const email = form.querySelector('#email');
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    showError(email, !emailOk); 
    if (!emailOk) valid = false;

    req('state'); 
    req('district'); 
    req('skills'); 
    req('availability');

    if (!valid) {
      toast('Validation Error', 'Please correct all highlighted fields.', 'error');
      return;
    }

    // Save Volunteer
    const volunteer = {
      id: DB.uid(),
      name: form.querySelector('#fullName').value.trim(),
      age: Number(form.querySelector('#age').value),
      gender: form.querySelector('#gender').value,
      phone: form.querySelector('#phone').value.trim(),
      email: form.querySelector('#email').value.trim(),
      state: form.querySelector('#state').value.trim(),
      district: form.querySelector('#district').value.trim(),
      blood: form.querySelector('#bloodGroup').value,
      skills: form.querySelector('#skills').value.trim(),
      medical: 'No',
      languages: 'English',
      vehicle: 'No',
      availability: form.querySelector('#availability').value,
      prevExperience: '',
      preferredDisasters: '',
      emergencyContact: '',
      zone: '',
      status: form.querySelector('#status').value,
      registeredAt: Date.now()
    };

    const volunteers = DB.get(DB.keys.volunteers);
    volunteers.unshift(volunteer);
    DB.set(DB.keys.volunteers, volunteers);

    showModal(false);
    toast('Volunteer Added', `${volunteer.name} has been added successfully.`, 'success');
    renderVolunteers();
    initOpsStrip();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderVolunteers();
  setupAddVolunteerModal();

  document.getElementById('volSearch').addEventListener('input', debounce((e) => { volFilters.search = e.target.value; renderVolunteers(); }, 200));
  document.getElementById('statusFilter').addEventListener('change', (e) => { volFilters.status = e.target.value; renderVolunteers(); });

  document.getElementById('volGrid').addEventListener('click', (e) => {
    const card = e.target.closest('.vol-card');
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.closest('.assign-btn')) {
      const zones = DB.get(DB.keys.zones).filter((z) => z.volunteersAssigned < z.volunteersNeeded);
      withVolunteer(id, (v) => {
        const zone = zones[0];
        v.zone = zone ? zone.name : 'Reserve Pool';
        v.status = 'Assigned';
        if (zone) {
          const allZones = DB.get(DB.keys.zones);
          const z = allZones.find((zz) => zz.id === zone.id);
          z.volunteersAssigned += 1;
          z.progress = Math.min(100, Math.round((z.volunteersAssigned / z.volunteersNeeded) * 100));
          DB.set(DB.keys.zones, allZones);
        }
      });
      toast('Volunteer assigned', 'Volunteer has been deployed to a zone.', 'success');
    }

    if (e.target.closest('.status-btn')) {
      withVolunteer(id, (v) => {
        const idx = STATUS_CYCLE.indexOf(v.status);
        v.status = STATUS_CYCLE[Math.min(idx + 1, STATUS_CYCLE.length - 1)];
      });
      toast('Status updated', 'Volunteer status moved to the next stage.', 'success');
    }

    if (e.target.closest('.complete-btn')) {
      withVolunteer(id, (v) => { v.status = 'Completed'; });
      toast('Mission completed', 'Volunteer marked as mission complete.', 'success');
    }

    if (e.target.closest('.remove-btn')) {
      const name = card.querySelector('h3').textContent;
      confirmAction('Remove volunteer?', `${name} will be permanently removed from the registry.`, () => {
        const volunteers = DB.get(DB.keys.volunteers).filter((v) => v.id !== id);
        DB.set(DB.keys.volunteers, volunteers);
        renderVolunteers();
        initOpsStrip();
        toast('Volunteer removed', `${name} has been removed from the registry.`, 'success');
      }, 'Remove');
    }
  });
});
