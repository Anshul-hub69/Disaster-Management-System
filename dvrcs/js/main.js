/* ==========================================================================
   DVRCS — Home Page
   ========================================================================== */

const ANNOUNCEMENTS = [
  { date: '13 JUL', title: 'Cyclone alert upgraded for Puri coastal belt', body: 'IMD escalated the Puri Coastal Strip to critical severity; volunteer dispatch prioritised for the next 24 hours.' },
  { date: '12 JUL', title: '18 new volunteers onboarded in Karnataka', body: 'Fresh registrations from Chamarajanagar district cleared verification and are ready for zone assignment.' },
  { date: '11 JUL', title: 'Resource shipment reached Bhuj relief camp', body: '340 medical kits and 120 tents delivered to the Kutch earthquake response zone.' },
  { date: '10 JUL', title: 'Munnar landslide zone moved to recovery phase', body: 'Rescue operations concluded; response has transitioned to rehabilitation and resource wind-down.' },
  { date: '09 JUL', title: 'Sprint PI-2 planning completed', body: 'Zone Assignment increment locked in with the Operations Squad; execution begins this week.' }
];

function renderAnnouncements() {
  const list = document.getElementById('announceList');
  if (!list) return;
  list.innerHTML = ANNOUNCEMENTS.map((a) => `
    <div class="announce-item">
      <div class="announce-date">${a.date}</div>
      <div class="announce-body"><h4>${a.title}</h4><p>${a.body}</p></div>
    </div>`).join('');
}

document.addEventListener('DOMContentLoaded', renderAnnouncements);
