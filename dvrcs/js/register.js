/* ==========================================================================
   DVRCS — Registration Form
   ========================================================================== */

const selections = { medical: '', vehicle: '', disasters: [] };

function initChipGroups() {
  document.querySelectorAll('.chip-group').forEach((group) => {
    const multi = group.id === 'disasterGroup';
    group.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      if (multi) {
        chip.classList.toggle('selected');
        const value = chip.dataset.value;
        const idx = selections.disasters.indexOf(value);
        if (idx > -1) selections.disasters.splice(idx, 1); else selections.disasters.push(value);
      } else {
        group.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
        if (group.id === 'medicalGroup') selections.medical = chip.dataset.value;
        if (group.id === 'vehicleGroup') selections.vehicle = chip.dataset.value;
      }
    });
  });
}

function showError(input, show) {
  input.classList.toggle('invalid', show);
  const err = input.closest('.field')?.querySelector('.field-error');
  if (err) err.classList.toggle('show', show);
}

function validateForm() {
  let valid = true;
  const req = (id) => {
    const el = document.getElementById(id);
    const ok = el.value.trim() !== '';
    showError(el, !ok);
    if (!ok) valid = false;
    return ok;
  };

  req('fullName');
  const age = document.getElementById('age');
  const ageOk = age.value && Number(age.value) >= 18 && Number(age.value) <= 65;
  showError(age, !ageOk); if (!ageOk) valid = false;

  req('gender'); req('bloodGroup');

  const phone = document.getElementById('phone');
  const phoneOk = /^\d{10}$/.test(phone.value.trim());
  showError(phone, !phoneOk); if (!phoneOk) valid = false;

  const email = document.getElementById('email');
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  showError(email, !emailOk); if (!emailOk) valid = false;

  req('state'); req('district'); req('emergencyContact'); req('skills'); req('languages'); req('availability');

  const disasterErr = document.getElementById('disasterError');
  disasterErr.classList.toggle('show', selections.disasters.length === 0);
  if (selections.disasters.length === 0) valid = false;

  const terms = document.getElementById('terms');
  const termsErr = document.getElementById('termsError');
  termsErr.classList.toggle('show', !terms.checked);
  if (!terms.checked) valid = false;

  return valid;
}

function submitRegistration(e) {
  e.preventDefault();
  if (!validateForm()) {
    toast('Incomplete form', 'Please fix the highlighted fields.', 'error');
    document.querySelector('.invalid, .field-error.show')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const volunteer = {
    id: DB.uid(),
    name: document.getElementById('fullName').value.trim(),
    age: Number(document.getElementById('age').value),
    gender: document.getElementById('gender').value,
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    state: document.getElementById('state').value.trim(),
    district: document.getElementById('district').value.trim(),
    blood: document.getElementById('bloodGroup').value,
    skills: document.getElementById('skills').value.trim(),
    medical: selections.medical || 'No',
    languages: document.getElementById('languages').value.trim(),
    vehicle: selections.vehicle || 'No',
    availability: document.getElementById('availability').value,
    prevExperience: document.getElementById('prevExperience').value.trim(),
    preferredDisasters: selections.disasters.join(', '),
    emergencyContact: document.getElementById('emergencyContact').value.trim(),
    zone: '',
    status: 'Available',
    registeredAt: Date.now()
  };

  const volunteers = DB.get(DB.keys.volunteers);
  volunteers.unshift(volunteer);
  DB.set(DB.keys.volunteers, volunteers);

  document.getElementById('formCard').style.display = 'none';
  document.getElementById('successCard').style.display = 'block';
  toast('Registration complete', 'Your volunteer profile is now on the coordination grid.', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  initChipGroups();
  document.getElementById('regForm').addEventListener('submit', submitRegistration);
  document.querySelectorAll('#regForm input, #regForm select').forEach((el) => {
    el.addEventListener('input', () => showError(el, false));
    el.addEventListener('change', () => showError(el, false));
  });
});
