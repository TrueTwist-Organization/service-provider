// ══════════════════════════════════════════════
//  ADMIN LOGIC — FixKar + live Chart.js analytics
// ══════════════════════════════════════════════

const DB = {
  pros: () => JSON.parse(localStorage.getItem('fk_pros') || '[]'),
  setPros: v => localStorage.setItem('fk_pros', JSON.stringify(v)),
  reviews: () => JSON.parse(localStorage.getItem('fk_revs') || '{}'),
  setRevs: v => localStorage.setItem('fk_revs', JSON.stringify(v)),
  bookings: () => JSON.parse(localStorage.getItem('fk_bks') || '[]'),
  setBks: v => localStorage.setItem('fk_bks', JSON.stringify(v)),
  visits: () => parseInt(localStorage.getItem('fk_visits') || '0', 10),
  notifs: () => JSON.parse(localStorage.getItem('fk_admin_notifs') || '[]'),
  setNotifs: v => localStorage.setItem('fk_admin_notifs', JSON.stringify(v)),
};

/** @type {Record<string, Chart>} */
const chartRefs = {};
let chartsReady = false;

const CHART_COLORS = {
  amber: '#c18c5d',
  green: '#4a6741',
  blue: '#60a5fa',
  gold: '#f59e0b',
  purple: '#a855f7',
  teal: '#2dd4bf',
  rose: '#fb7185',
};

function adminLogin() {
  const email = (document.getElementById('login-email').value || '').trim();
  const pass = (document.getElementById('login-pass').value || '').trim();
  if (email === 'admin@gmail.com' && pass === 'admin123') {
    sessionStorage.setItem('fk_admin_logged', 'true');
    window.location.href = '/admin/index.html';
  } else {
    toast('Invalid credentials!', 'err');
  }
}

function adminLogout() {
  sessionStorage.removeItem('fk_admin_logged');
  window.location.href = '/admin/login.html';
}

function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  if (!document.getElementById('toasts')) {
    const t = document.createElement('div');
    t.id = 'toasts';
    document.body.appendChild(t);
  }
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; }, 3000);
  setTimeout(() => el.remove(), 3400);
}

function getVisitLog() {
  try {
    return JSON.parse(localStorage.getItem('fk_visit_log') || '[]');
  } catch {
    return [];
  }
}

function getAppointments() {
  try {
    return JSON.parse(localStorage.getItem('fk_appointments') || '[]');
  } catch {
    return [];
  }
}

function bucketLastNDays(timestamps, days) {
  const labels = [];
  const data = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const start = d.getTime();
    const end = start + 86400000;
    labels.push(d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }));
    data.push(timestamps.filter((t) => t >= start && t < end).length);
  }
  return { labels, data };
}

function bucketBookingsByDay(bks, days) {
  const log = bks.map((b) => b.ts || 0).filter(Boolean);
  return bucketLastNDays(log, days);
}

function topCities(pros, limit) {
  const map = {};
  pros.forEach((p) => {
    const c = p.city || 'Unknown';
    map[c] = (map[c] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function buildMetrics() {
  const pros = DB.pros();
  const bks = DB.bookings();
  const appts = getAppointments();
  const visitLog = getVisitLog();
  const totalJobs = pros.reduce((s, p) => s + (p.bookings || 0), 0) + bks.length;
  const verified = pros.filter((p) => p.verified).length;
  const pending = Math.max(0, pros.length - verified);

  const types = ['plumber', 'electrician', 'beautician', 'ac', 'appliances', 'physiotherapist', 'cleaner', 'carpenter', 'painter', 'pest'];
  const typeCounts = {};
  types.forEach(t => {
    typeCounts[t] = pros.filter(p => p.type === t).length;
  });

  const avgR = pros.filter((p) => p.rating).length
    ? (pros.filter((p) => p.rating).reduce((s, p) => s + p.rating, 0) / pros.filter((p) => p.rating).length).toFixed(1)
    : '—';

  return {
    pros, bks, appts, visitLog, totalJobs, verified, pending, typeCounts, avgR,
    visits7: bucketLastNDays(visitLog, 7),
    bookings7: bucketBookingsByDay(bks, 7),
    cities: topCities(pros, 6),
    visitsTotal: Math.max(DB.visits(), visitLog.length),
    apptCount: appts.length
  };
}

function ensureMockData() {
  const pros = DB.pros();
  const types = ['plumber', 'electrician', 'beautician', 'ac', 'appliances', 'physiotherapist', 'cleaner', 'carpenter', 'painter', 'pest'];
  if (pros.length >= 10) return;

  const mockPros = [
    { id: 'm1', name: 'Rajesh Kumar', type: 'plumber', city: 'Surat', area: 'Adajan', fee: 250, rating: 4.8, bookings: 45, services: ['Pipe Repair'], verified: true, exp: 8 },
    { id: 'm2', name: 'Amit Shah', type: 'electrician', city: 'Ahmedabad', area: 'Satellite', fee: 300, rating: 4.9, bookings: 62, services: ['Wiring'], verified: true, exp: 12 },
    { id: 'm3', name: 'Priya Patel', type: 'beautician', city: 'Surat', area: 'Vesu', fee: 500, rating: 4.7, bookings: 28, services: ['Facial'], verified: true, exp: 5 },
    { id: 'm4', name: 'Vikram Singh', type: 'ac', city: 'Vadodara', area: 'Alkapuri', fee: 450, rating: 4.6, bookings: 33, services: ['AC Service'], verified: false, exp: 7 },
    { id: 'm5', name: 'Suresh Raina', type: 'appliances', city: 'Rajkot', area: 'Kalawad Road', fee: 350, rating: 4.5, bookings: 21, services: ['Fridge'], verified: true, exp: 10 },
    { id: 'm6', name: 'Dr. Anjali', type: 'physiotherapist', city: 'Ahmedabad', area: 'Bopal', fee: 800, rating: 5.0, bookings: 15, services: ['Back Pain'], verified: true, exp: 15 },
    { id: 'm7', name: 'Kishan Mevani', type: 'cleaner', city: 'Surat', area: 'Pal', fee: 600, rating: 4.4, bookings: 50, services: ['Deep Cleaning'], verified: false, exp: 4 },
    { id: 'm8', name: 'Manish Panchal', type: 'carpenter', city: 'Bhavnagar', area: 'Waghawadi', fee: 400, rating: 4.7, bookings: 19, services: ['Furniture'], verified: true, exp: 9 },
    { id: 'm9', name: 'Ravi Varma', type: 'painter', city: 'Jamnagar', area: 'Patel Colony', fee: 1000, rating: 4.8, bookings: 12, services: ['Home Paint'], verified: true, exp: 6 },
    { id: 'm10', name: 'Sunil Jani', type: 'pest', city: 'Gandhinagar', area: 'Sector 21', fee: 1200, rating: 4.3, bookings: 8, services: ['Termite'], verified: false, exp: 3 }
  ];
  DB.setPros(mockPros);
}


function switchAdminView(viewId, el) {
  // Update sidebar active state
  document.querySelectorAll('.sb-link').forEach(link => link.classList.remove('active'));
  if (el) el.classList.add('active');

  const titleEl = document.querySelector('.admin-ttl');
  const labels = {
    overview: 'Platform Insights',
    users: 'Client Analytics',
    pros: 'Service Network',
    bookings: 'Live Bookings',
    appointments: 'Activity Log'
  };

  if (titleEl && labels[viewId]) {
    titleEl.textContent = labels[viewId];
    titleEl.classList.remove('active');
    setTimeout(() => titleEl.classList.add('active'), 10);
  }

  // Show / hide the booking section vs pros table
  const bookingSection = document.getElementById('section-bookings');
  const prosSection = document.getElementById('section-pros');
  const prosBody = document.getElementById('admin-tbody');
  const chartsIntro = document.querySelector('.admin-charts-intro');
  const chartsGrid = document.querySelector('.admin-charts-grid');
  const statsRow = document.getElementById('admin-stats-row');

  if (viewId === 'bookings') {
    if (bookingSection) bookingSection.style.display = 'block';
    if (prosSection) prosSection.style.display = 'none';
    if (prosBody) prosBody.style.display = 'none';
    if (chartsIntro) chartsIntro.style.display = 'none';
    if (chartsGrid) chartsGrid.style.display = 'none';
    if (statsRow) statsRow.style.display = 'none';
    renderBookingsSection();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    if (bookingSection) bookingSection.style.display = 'none';
    if (prosSection) prosSection.style.display = '';
    if (prosBody) prosBody.style.display = '';
    if (chartsIntro) chartsIntro.style.display = '';
    if (chartsGrid) chartsGrid.style.display = '';
    if (statsRow) statsRow.style.display = '';

    if (viewId === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewId === 'pros') {
      const table = document.getElementById('section-pros');
      if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (viewId === 'appointments') {
      const feed = document.querySelector('.admin-charts-grid');
      if (feed) feed.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast('Filter by appointments active', 'ok');
    } else if (viewId === 'users') {
      toast('User trends highlighted in chart', 'info');
    }
  }
}

// ══════════════════════════════════════════════
//  BOOKING STATUS HELPER
// ══════════════════════════════════════════════
function getBookingStatus(bk) {
  if (bk.status === 'confirmed') {
    const age = Date.now() - (bk.acceptTs || bk.ts || 0);
    const etaMs = (bk.eta || 20) * 60 * 1000;
    if (age >= etaMs) return 'arrived';
    return 'en_route';
  }
  if (bk.status === 'cancelled') return 'cancelled';
  return 'pending';
}

function acceptBooking(bkId) {
  const bks = DB.bookings();
  const idx = bks.findIndex(b => b.id === bkId);
  if (idx !== -1) {
    bks[idx].status = 'confirmed';
    bks[idx].acceptTs = Date.now();
    DB.setBks(bks);
    toast('Booking accepted by professional!', 'ok');
    renderBookingsSection();
    renderAdmin();
  }
}

// ══════════════════════════════════════════════
//  RENDER BOOKINGS SECTION
// ══════════════════════════════════════════════
function renderBookingsSection() {
  const listEl = document.getElementById('admin-bookings-list');
  const statsEl = document.getElementById('bk-stats-row');
  const pillEl = document.getElementById('bk-count-pill');
  if (!listEl) return;

  const bks = DB.bookings().slice().reverse(); // newest first
  const pros = DB.pros();
  const filter = (document.getElementById('bk-filter-status')?.value) || 'all';

  // ── Compute stats ──
  const total = bks.length;
  const arrived = bks.filter(b => getBookingStatus(b) === 'arrived').length;
  const enRoute = bks.filter(b => getBookingStatus(b) === 'en_route').length;
  const pending = bks.filter(b => getBookingStatus(b) === 'pending').length;

  if (pillEl) pillEl.textContent = `${total} Total Booking${total !== 1 ? 's' : ''}`;

  if (statsEl) {
    statsEl.innerHTML = [
      { label: 'Total Bookings', val: total, color: '#60a5fa', icon: '📋' },
      { label: 'En Route', val: enRoute, color: '#f59e0b', icon: '🛵' },
      { label: 'Arrived', val: arrived, color: '#2dd4bf', icon: '✅' },
      { label: 'Pending', val: pending, color: '#a855f7', icon: '⏳' },
    ].map(s => `
      <div style="background:var(--admin-card); border:1px solid var(--border-subtle); border-radius:18px; padding:22px 24px; display:flex; align-items:center; gap:16px;">
        <div style="font-size:28px;">${s.icon}</div>
        <div>
          <div style="font-family:'Clash Display',sans-serif; font-size:30px; font-weight:700; color:${s.color};">${s.val}</div>
          <div style="font-size:12px; color:var(--ash); margin-top:2px;">${s.label}</div>
        </div>
      </div>
    `).join('');
  }

  // ── Filter ──
  const filtered = filter === 'all' ? bks : bks.filter(b => getBookingStatus(b) === filter);

  if (!filtered.length) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:80px 20px; background:var(--admin-card); border-radius:20px; border:1px solid var(--border-subtle);">
        <div style="font-size:56px; margin-bottom:16px;">📭</div>
        <div style="font-family:'Clash Display',sans-serif; font-size:22px; color:var(--white); margin-bottom:8px;">No bookings yet</div>
        <p style="color:var(--ash); font-size:14px;">When users book services from the client site, all orders will appear here in real-time.</p>
      </div>`;
    return;
  }

  const emojiMap = {
    plumber: '🔧', electrician: '⚡', beautician: '💄', ac: '❄️',
    appliances: '📺', physiotherapist: '🧘', cleaner: '🧹',
    carpenter: '🔨', painter: '🎨', pest: '🐜'
  };

  const statusCfg = {
    arrived: { label: 'Arrived ✅', bg: 'rgba(45,212,191,0.15)', color: '#2dd4bf', border: 'rgba(45,212,191,0.3)' },
    en_route: { label: 'En Route 🛵', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    pending: { label: 'Pending ⏳', bg: 'rgba(168,85,247,0.15)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
    confirmed: { label: 'Confirmed ✅', bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  };

  listEl.innerHTML = filtered.map(bk => {
    const pro = pros.find(p => p.id === bk.pid);
    const status = getBookingStatus(bk);
    const sc = statusCfg[status] || statusCfg.pending;
    const proInit = pro ? pro.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
    const bkDate = bk.ts ? new Date(bk.ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Unknown';
    const ageMin = bk.ts ? Math.floor((Date.now() - bk.ts) / 60000) : 0;
    const etaLeft = Math.max(0, (bk.eta || 20) - ageMin);

    return `
    <div class="admin-booking-card" style="
      display:grid; grid-template-columns:2.2fr 1.8fr 2fr 1.8fr 1.2fr 1.5fr;
      align-items:center; gap:0;
      background:var(--admin-card); border:1px solid var(--border-subtle);
      border-radius:16px; padding:18px 20px;
      transition: border-color .2s, box-shadow .2s;
    " onmouseenter="this.style.borderColor='rgba(193,140,93,0.4)'; this.style.boxShadow='0 8px 30px rgba(0,0,0,0.25)';" onmouseleave="this.style.borderColor='var(--border-subtle)'; this.style.boxShadow='none';">

      <!-- Customer -->
      <div data-label="Customer" style="display:flex; align-items:center; gap:12px; padding-right:12px;">
        <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#a855f7,#6366f1); display:flex; align-items:center; justify-content:center; font-family:'Clash Display',sans-serif; font-size:15px; font-weight:700; color:#fff; flex-shrink:0;">
          ${(bk.nm || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-weight:700; color:var(--white); font-size:14px; margin-bottom:2px;">${bk.nm || '—'}</div>
          <div style="font-size:12px; color:var(--ash);">📞 ${bk.ph || '—'}</div>
          <div style="font-size:10px; color:rgba(255,255,255,0.3); margin-top:2px;">${bkDate}</div>
        </div>
      </div>

      <!-- Service -->
      <div data-label="Service" style="padding-right:12px; border-left:1px solid var(--border-subtle); padding-left:16px;">
        <div style="font-size:13px; font-weight:700; color:var(--white); margin-bottom:4px;">${bk.svc || '—'}</div>
        <div style="font-size:11px; color:var(--ash);">📍 ${bk.dist || '?'} km away</div>
        <div style="font-size:11px; color:var(--ash); margin-top:2px;">🆔 ${bk.id || '—'}</div>
      </div>

      <!-- Professional -->
      <div data-label="Professional" style="padding-right:12px; border-left:1px solid var(--border-subtle); padding-left:16px;">
        ${pro ? `
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:38px; height:38px; border-radius:10px; background:var(--admin-secondary); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:var(--void); flex-shrink:0;">
              ${pro.image ? `<img src="${pro.image}" style="width:100%; height:100%; border-radius:10px; object-fit:cover;">` : proInit}
            </div>
            <div>
              <div style="font-weight:700; font-size:13px; color:var(--white);">${pro.name}</div>
              <div style="font-size:11px; color:var(--ash);">${emojiMap[pro.type] || '🏠'} ${pro.type.charAt(0).toUpperCase() + pro.type.slice(1)}</div>
              <div style="font-size:11px; color:var(--ash);">📞 ${pro.phone || '—'}</div>
            </div>
          </div>
        ` : `<div style="color:var(--ash); font-size:13px;">Professional not found</div>`}
      </div>

      <!-- Address -->
      <div data-label="Address" style="padding-right:12px; border-left:1px solid var(--border-subtle); padding-left:16px;">
        <div style="font-size:12px; color:var(--white); line-height:1.5; word-break:break-word;">${bk.ad || '—'}</div>
      </div>

      <!-- ETA -->
      <div data-label="Timeline" style="border-left:1px solid var(--border-subtle); padding-left:16px;">
        ${status === 'arrived'
        ? `<div style="font-family:'Clash Display',sans-serif; font-size:18px; font-weight:700; color:#2dd4bf;">Arrived!</div>`
        : `<div style="font-family:'Clash Display',sans-serif; font-size:20px; font-weight:700; color:var(--white);">${etaLeft} min</div>`
      }
        <div style="font-size:11px; color:var(--ash); margin-top:2px;">ETA: ${bk.eta || '?'} min total</div>
      </div>

      <!-- Status Badge & Actions -->
      <div data-label="Status" style="border-left:1px solid var(--border-subtle); padding-left:16px; text-align:right;">
        <span style="
          display:inline-block; padding:6px 14px; border-radius:30px;
          font-size:11px; font-weight:700; letter-spacing:.04em;
          background:${sc.bg}; color:${sc.color}; border:1px solid ${sc.border};
        ">${sc.label}</span>
        
        <div style="margin-top:12px;">
          ${status === 'pending' ? `
            <button onclick="acceptBooking('${bk.id}')" style="background:var(--green); color:white; border:none; padding:6px 12px; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer; width:100%;">
              ACCEPT NOW
            </button>
          ` : `
            <div style="font-size:10px; color:rgba(255,255,255,0.3);">Handled by Pro</div>
          `}
        </div>
      </div>

    </div>`;
  }).join('');
}



function initCharts(m) {
  if (typeof Chart === 'undefined') return;

  const commonOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#a9a294',
          font: { family: 'Cabinet Grotesk', size: 10 },
          padding: 15,
          usePointStyle: true
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 45, 0.9)',
        titleFont: { family: 'Clash Display' },
        bodyFont: { family: 'Cabinet Grotesk' },
        padding: 12,
        borderRadius: 12,
        displayColors: true
      }
    },
  };

  const elMix = document.getElementById('chart-pro-mix');
  if (elMix && !chartRefs.proMix) {
    const labels = ['Plumbers', 'Electricians', 'Beauticians', 'AC Repair', 'Appliances', 'Physio', 'Cleaning', 'Carpenter', 'Painter', 'Pest'];
    const data = [
      m.typeCounts.plumber, m.typeCounts.electrician, m.typeCounts.beautician,
      m.typeCounts.ac, m.typeCounts.appliances, m.typeCounts.physiotherapist,
      m.typeCounts.cleaner, m.typeCounts.carpenter, m.typeCounts.painter, m.typeCounts.pest
    ];
    chartRefs.proMix = new Chart(elMix, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            CHART_COLORS.amber, CHART_COLORS.blue, CHART_COLORS.rose,
            CHART_COLORS.teal, CHART_COLORS.purple, CHART_COLORS.gold,
            CHART_COLORS.green, '#f43f5e', '#8b5cf6', '#ec4899'
          ],
          borderWidth: 0,
          hoverOffset: 15
        }],
      },
      options: {
        ...commonOpts,
        cutout: '72%',
        plugins: {
          ...commonOpts.plugins,
          legend: {
            position: 'bottom',
            labels: {
              color: '#a9a294',
              font: { family: 'Cabinet Grotesk', size: 11 },
              padding: 20,
              usePointStyle: true
            },
          }
        }
      },
    });
  }



  const elVis = document.getElementById('chart-visits-line');
  if (elVis && !chartRefs.visitsLine) {
    chartRefs.visitsLine = new Chart(elVis, {
      type: 'line',
      data: {
        labels: m.visits7.labels,
        datasets: [{
          label: 'Visits',
          data: m.visits7.data,
          borderColor: CHART_COLORS.amber,
          backgroundColor: 'rgba(193, 140, 93, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: CHART_COLORS.amber,
        }],
      },
      options: {
        ...commonOpts,
        scales: {
          x: { ticks: { color: '#a9a294', maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.06)' } },
          y: {
            beginAtZero: true,
            ticks: { color: '#a9a294', stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.06)' },
          },
        },
      },
    });
  }

  const elBk = document.getElementById('chart-bookings-bar');
  if (elBk && !chartRefs.bookingsBar) {
    chartRefs.bookingsBar = new Chart(elBk, {
      type: 'bar',
      data: {
        labels: m.bookings7.labels,
        datasets: [{
          label: 'Bookings',
          data: m.bookings7.data,
          backgroundColor: CHART_COLORS.purple,
          borderRadius: 8,
        }],
      },
      options: {
        ...commonOpts,
        scales: {
          x: { ticks: { color: '#a9a294', maxRotation: 45 }, grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { color: '#a9a294', stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.06)' },
          },
        },
      },
    });
  }

  const elCity = document.getElementById('chart-cities-hbar');
  if (elCity && !chartRefs.citiesHbar) {
    const labels = m.cities.length ? m.cities.map((x) => x[0]) : ['—'];
    const data = m.cities.length ? m.cities.map((x) => x[1]) : [0];
    chartRefs.citiesHbar = new Chart(elCity, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Professionals',
          data,
          backgroundColor: [CHART_COLORS.teal, CHART_COLORS.gold, CHART_COLORS.amber, CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.purple],
          borderRadius: 6,
        }],
      },
      options: {
        indexAxis: 'y',
        ...commonOpts,
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: '#a9a294', stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.06)' },
          },
          y: { ticks: { color: '#a9a294' }, grid: { display: false } },
        },
      },
    });
  }

  const elRadar = document.getElementById('chart-activity-radar');
  if (elRadar && !chartRefs.activityRadar) {
    const raw = [m.pros.length, m.bks.length, m.visitsTotal, m.apptCount, m.verified];
    const mx = Math.max(...raw, 1);
    const norm = raw.map((v) => Math.round((v / mx) * 100));
    chartRefs.activityRadar = new Chart(elRadar, {
      type: 'radar',
      data: {
        labels: ['Professionals', 'Bookings', 'Total visits', 'Appt. requests', 'Verified'],
        datasets: [{
          label: 'Relative scale (0–100%)',
          data: norm,
          borderColor: CHART_COLORS.amber,
          backgroundColor: 'rgba(193, 140, 93, 0.25)',
          pointBackgroundColor: CHART_COLORS.amber,
        }],
      },
      options: {
        ...commonOpts,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { color: '#a9a294', backdropColor: 'transparent' },
            grid: { color: 'rgba(255,255,255,0.08)' },
            pointLabels: { color: '#a9a294', font: { size: 10 } },
          },
        },
      },
    });
  }

  chartsReady = true;
}

function updateCharts(m) {
  if (!chartsReady || typeof Chart === 'undefined') return;

  if (chartRefs.proMix) {
    const data = [
      m.typeCounts.plumber, m.typeCounts.electrician, m.typeCounts.beautician,
      m.typeCounts.ac, m.typeCounts.appliances, m.typeCounts.physiotherapist,
      m.typeCounts.cleaner, m.typeCounts.carpenter, m.typeCounts.painter, m.typeCounts.pest
    ];
    chartRefs.proMix.data.datasets[0].data = data;
    chartRefs.proMix.update();
  }

  if (chartRefs.visitsLine) {
    chartRefs.visitsLine.data.labels = m.visits7.labels;
    chartRefs.visitsLine.data.datasets[0].data = m.visits7.data;
    chartRefs.visitsLine.update();
  }
  if (chartRefs.bookingsBar) {
    chartRefs.bookingsBar.data.labels = m.bookings7.labels;
    chartRefs.bookingsBar.data.datasets[0].data = m.bookings7.data;
    chartRefs.bookingsBar.update();
  }
  if (chartRefs.citiesHbar) {
    const labels = m.cities.length ? m.cities.map((x) => x[0]) : ['—'];
    const data = m.cities.length ? m.cities.map((x) => x[1]) : [0];
    chartRefs.citiesHbar.data.labels = labels;
    chartRefs.citiesHbar.data.datasets[0].data = data;
    chartRefs.citiesHbar.update();
  }
  if (chartRefs.activityRadar) {
    const raw = [m.pros.length, m.bks.length, m.visitsTotal, m.apptCount, m.verified];
    const mx = Math.max(...raw, 1);
    chartRefs.activityRadar.data.datasets[0].data = raw.map((v) => Math.round((v / mx) * 100));
    chartRefs.activityRadar.update();
  }
}

function updateActivityFeed(pros) {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;

  const notifs = DB.notifs().slice(0, 8); // Latest 8 notifications

  let html = `
    <div style="padding:10px; border-left:2px solid var(--admin-secondary); background:rgba(255,255,255,0.02); font-size:12px; margin-bottom:8px;">
      <span style="color:var(--ash); display:block; font-size:10px; margin-bottom:4px;">SYSTEM STATUS</span>
      Live synchronization active. Monitoring ${pros.length} providers.
    </div>
  `;

  if (notifs.length === 0) {
    // Fallback to legacy pros display if no real notifications yet
    const latestPros = [...pros].reverse().slice(0, 5);
    latestPros.forEach(p => {
      html += `
        <div style="padding:12px; border-left:2px solid var(--admin-primary); background:rgba(255,255,255,0.02); font-size:12px; margin-bottom:8px; border-radius:4px;">
          <span style="color:var(--admin-primary); display:block; font-size:10px; font-weight:700; margin-bottom:4px;">NEW REGISTRATION</span>
          <strong>${p.name}</strong> joined as ${p.type} in ${p.city}.
          <div style="font-size:10px; color:var(--ash); margin-top:4px;">Status: Auto-Verified</div>
        </div>
      `;
    });
  } else {
    notifs.forEach(n => {
      const isNew = n.unread;
      html += `
        <div style="padding:12px; border-left:2px solid ${isNew ? 'var(--admin-warning)' : 'var(--admin-primary)'}; background:${isNew ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)'}; font-size:12px; margin-bottom:8px; border-radius:4px; position:relative;">
          <span style="color:var(--ash); display:flex; justify-content:space-between; font-size:10px; margin-bottom:4px;">
            <span>${n.time}</span>
            <span style="color:var(--admin-primary); font-weight:700;">${n.type}</span>
          </span>
          <div style="font-weight:600; color:var(--white); margin-bottom:2px;">${n.title}</div>
          <p style="margin:0; color:var(--ash); line-height:1.4;">${n.msg}</p>
          ${isNew ? '<div style="position:absolute; top:8px; right:8px; width:6px; height:6px; background:var(--admin-warning); border-radius:50%;"></div>' : ''}
        </div>
      `;
    });

    // Auto-mark notifications as read after displaying in a live environment
    // In a real app this would be triggered by a "clear" button or hover
    // but for demo we can clear unread status after some time
  }

  feed.innerHTML = html;
}

function ensureMockData() {
  const pros = DB.pros();
  const types = ['plumber', 'electrician', 'beautician', 'ac', 'appliances', 'physiotherapist', 'cleaner', 'carpenter', 'painter', 'pest'];

  // Check if we already have variety
  const existingTypes = new Set(pros.map(p => p.type));
  if (existingTypes.size >= 5) return; // Already have enough data

  const mockPros = [
    { id: 'm1', name: 'Rajesh Kumar', type: 'plumber', city: 'Surat', area: 'Adajan', fee: 250, rating: 4.8, bookings: 45, services: ['Pipe Repair', 'Tap Fitting'], verified: true, exp: 8 },
    { id: 'm2', name: 'Amit Shah', type: 'electrician', city: 'Ahmedabad', area: 'Satellite', fee: 300, rating: 4.9, bookings: 62, services: ['Wiring', 'Inverter'], verified: true, exp: 12 },
    { id: 'm3', name: 'Priya Patel', type: 'beautician', city: 'Surat', area: 'Vesu', fee: 500, rating: 4.7, bookings: 28, services: ['Facial', 'Makeup'], verified: true, exp: 5 },
    { id: 'm4', name: 'Vikram Singh', type: 'ac', city: 'Vadodara', area: 'Alkapuri', fee: 450, rating: 4.6, bookings: 33, services: ['AC Service', 'Gas Charge'], verified: false, exp: 7 },
    { id: 'm5', name: 'Suresh Raina', type: 'appliances', city: 'Rajkot', area: 'Kalawad Road', fee: 350, rating: 4.5, bookings: 21, services: ['Fridge', 'Wash Mach'], verified: true, exp: 10 },
    { id: 'm6', name: 'Dr. Anjali', type: 'physiotherapist', city: 'Ahmedabad', area: 'Bopal', fee: 800, rating: 5.0, bookings: 15, services: ['Back Pain', 'Post-Op'], verified: true, exp: 15 },
    { id: 'm7', name: 'Kishan Mevani', type: 'cleaner', city: 'Surat', area: 'Pal', fee: 600, rating: 4.4, bookings: 50, services: ['Deep Cleaning', 'Sofa Spa'], verified: false, exp: 4 },
    { id: 'm8', name: 'Manish Panchal', type: 'carpenter', city: 'Bhavnagar', area: 'Waghawadi', fee: 400, rating: 4.7, bookings: 19, services: ['Furniture', 'Doors'], verified: true, exp: 9 },
    { id: 'm9', name: 'Ravi Varma', type: 'painter', city: 'Jamnagar', area: 'Patel Colony', fee: 1000, rating: 4.8, bookings: 12, services: ['Home Paint', 'Wall Decor'], verified: true, exp: 6 },
    { id: 'm10', name: 'Sunil Jani', type: 'pest', city: 'Gandhinagar', area: 'Sector 21', fee: 1200, rating: 4.3, bookings: 8, services: ['Termite', 'Cockroach'], verified: false, exp: 3 }
  ];

  DB.setPros([...pros, ...mockPros]);
  toast('Sample professionals added for variety', 'ok');
}

function renderAdmin() {
  const pros = DB.pros();
  if (pros.length < 3) ensureMockData();

  const m = buildMetrics();
  updateActivityFeed(m.pros);

  // If the bookings section is currently visible, refresh it too
  const bkSection = document.getElementById('section-bookings');
  if (bkSection && bkSection.style.display !== 'none') {
    renderBookingsSection();
  }

  const statsRow = document.getElementById('admin-stats-row');
  if (statsRow) {
    statsRow.innerHTML = `
      <div class="admin-stat-card reveal reveal-delay-1" style="background:var(--admin-card); padding:32px; border-radius:24px;">
        <div class="stat-val" style="font-size:42px; color:var(--white);">${m.pros.length}</div>
        <div class="stat-lbl" style="font-size:12px; color:var(--ash); margin-top:4px;">Total Professionals</div>
      </div>
      <div class="admin-stat-card reveal reveal-delay-1" style="background:var(--admin-card); padding:32px; border-radius:24px;">
        <div class="stat-val" style="font-size:42px; color:var(--white);">${m.verified}</div>
        <div class="stat-lbl" style="font-size:12px; color:var(--ash); margin-top:4px;">Verified Pros</div>
      </div>
      <div class="admin-stat-card reveal reveal-delay-2" style="background:var(--admin-card); padding:32px; border-radius:24px;">
        <div class="stat-val" style="font-size:42px; color:var(--white);">${m.visitsTotal}</div>
        <div class="stat-lbl" style="font-size:12px; color:var(--ash); margin-top:4px;">Total Website Visits</div>
      </div>
      <div class="admin-stat-card reveal reveal-delay-2" style="background:var(--admin-card); padding:32px; border-radius:24px;">
        <div class="stat-val" style="font-size:42px; color:var(--white);">${m.totalJobs}</div>
        <div class="stat-lbl" style="font-size:12px; color:var(--ash); margin-top:4px;">Total Jobs Booked</div>
      </div>
      <div class="admin-stat-card reveal reveal-delay-3" style="background:var(--admin-card); padding:32px; border-radius:24px;">
        <div class="stat-val" style="font-size:42px; color:var(--white);">${m.avgR}★</div>
        <div class="stat-lbl" style="font-size:12px; color:var(--ash); margin-top:4px;">Avg Provider Rating</div>
      </div>
      <div class="admin-stat-card reveal reveal-delay-3" style="background:var(--admin-card); padding:32px; border-radius:24px;">
        <div class="stat-val" style="font-size:42px; color:var(--white);">${m.apptCount}</div>
        <div class="stat-lbl" style="font-size:12px; color:var(--ash); margin-top:4px;">Appointment Requests</div>
      </div>
    `;
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }, 100);
  }

  if (!chartsReady) {
    initCharts(m);
  } else {
    updateCharts(m);
  }

  const tb = document.getElementById('admin-tbody');
  if (!tb) return;
  if (!m.pros.length) {
    tb.innerHTML = '<div style="text-align:center;padding:100px;color:var(--ash);font-size:16px;">No professionals yet. Register from the website to see live data.</div>';
    return;
  }

  const emojiMap = {
    plumber: '🔧', electrician: '⚡', beautician: '💄', ac: '❄️',
    appliances: '📺', physiotherapist: '🧘', cleaner: '🧹',
    carpenter: '🔨', painter: '🎨', pest: '🐜'
  };

  tb.innerHTML = m.pros.map((p) => `
    <div class="admin-pro-card" style="display: grid; grid-template-columns: 2fr 1fr 1fr 2fr 0.8fr 0.8fr 0.8fr 1fr 1.2fr; align-items: center;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:40px; height:40px; border-radius:50%; background:var(--admin-card); border:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:center; font-size:18px;">
          ${p.image ? `<img src="${p.image}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : (p.name[0] || '?')}
        </div>
        <div>
          <strong style="color:var(--white); font-size:15px; display:block;">${p.name}</strong>
          <span style="font-size:12px; color:var(--ash)">${p.phone || 'No Phone'}</span>
        </div>
      </div>
      <div>
        <span class="ph-badge badge-${p.type === 'electrician' ? 'elec' : p.type === 'plumber' ? 'plumber' : 'both'}" style="font-size:10px; padding:4px 10px; border-radius:30px; background:rgba(255,255,255,0.05); color:var(--ash);">
          ${emojiMap[p.type] || '🏠'} ${p.type.charAt(0).toUpperCase() + p.type.slice(1)}
        </span>
      </div>
      <div style="font-size:13px;">
        <div style="color:var(--white);">${p.area}</div>
        <div style="font-size:11px; color:var(--ash)">${p.city}</div>
      </div>
      <div style="font-size:12px; color:var(--text-muted); line-height:1.4; padding-right:12px;">
        ${(p.services || []).slice(0, 3).join(', ')}${p.services.length > 3 ? '…' : ''}
      </div>
      <div style="font-weight:600; color:var(--white);">₹${p.fee}</div>
      <div style="color:var(--admin-warning); font-weight:700;">${p.rating ? (String(p.rating) + '★') : '—'}</div>
      <div style="color:var(--text-muted); font-size:13px;">${p.reachedHomeCount || 0}</div>
      <div style="text-align: center;">
        <span class="spill ${p.verified ? 'verified' : 'pending'}">${p.verified ? 'Verified' : 'Pending'}</span>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button class="nav-cta" onclick="toggleVerify('${p.id}')" style="background:rgba(255,255,255,0.05); border:1px solid var(--border-subtle); padding:6px 12px; color:var(--text-secondary); border-radius:12px; font-size:11px;">
          ${p.verified ? 'Unverify' : 'Verify'}
        </button>
        <button class="nav-cta btn-danger" onclick="deletePro('${p.id}')" style="padding:6px 12px; border-radius:12px; font-size:11px;">
          Delete
        </button>
      </div>
    </div>`).join('');
}


function toggleVerify(pid) {
  const pros = DB.pros();
  const idx = pros.findIndex((p) => p.id === pid);
  if (idx === -1) return;
  pros[idx].verified = !pros[idx].verified;
  DB.setPros(pros);
  renderAdmin();
  toast(pros[idx].verified ? 'Verified!' : 'Removed verification');
}

function deletePro(pid) {
  if (!confirm('Delete this professional?')) return;
  DB.setPros(DB.pros().filter((p) => p.id !== pid));
  renderAdmin();
  toast('Deleted', 'err');
}

function clearAllData() {
  if (!confirm('Clear all database data? This cannot be undone.')) return;
  Object.keys(chartRefs).forEach((k) => {
    try {
      chartRefs[k].destroy();
    } catch (e) { /* ignore */ }
    delete chartRefs[k];
  });
  chartsReady = false;
  localStorage.clear();
  renderAdmin();
  toast('Database cleared', 'err');
}

window.addEventListener('DOMContentLoaded', () => {
  renderAdmin();
  setInterval(renderAdmin, 4000);

  // Initialize 3D Tilt for cards
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll(".tilt-3d, .admin-stat-card, .admin-chart-card"), {
      max: 6,
      speed: 1000,
      glare: true,
      "max-glare": 0.2,
      perspective: 1500
    });
  }

  // Cinematic Reveal
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('active'), i * 120);
    });
    toast('Welcome to FixKar Command Center', 'ok');
  }, 400);
});
