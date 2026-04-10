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
  if (email === 'riddhi@gmail.com' && pass === 'Riddhi123') {
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
    appointments: 'Activity Log'
  };

  if (titleEl && labels[viewId]) {
    titleEl.textContent = labels[viewId];
    // Re-trigger reveal
    titleEl.classList.remove('active');
    setTimeout(() => titleEl.classList.add('active'), 10);
  }

  // Logic to show/hide specific sections or scroll to them
  if (viewId === 'overview') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (viewId === 'pros') {
    const table = document.querySelector('.table-labels');
    if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (viewId === 'appointments') {
    const feed = document.querySelector('.admin-charts-grid');
    if (feed) feed.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast('Filter by appointments active', 'ok');
  } else if (viewId === 'users') {
    toast('User trends highlighted in chart', 'info');
  }
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

  // Sort pros by ID (assuming ID is timestamp or similar) or just take last 5
  const latestPros = [...pros].reverse().slice(0, 5);
  let html = `
    <div style="padding:10px; border-left:2px solid var(--admin-secondary); background:rgba(255,255,255,0.02); font-size:12px;">
      <span style="color:var(--ash); display:block; font-size:10px; margin-bottom:4px;">SYSTEM</span>
      Dashboard localized and charts updated.
    </div>
  `;

  latestPros.forEach(p => {
    html += `
      <div style="padding:10px; border-left:2px solid var(--admin-primary); background:rgba(255,255,255,0.02); font-size:12px;">
        <span style="color:var(--ash); display:block; font-size:10px; margin-bottom:4px;">NEW REGISTRATION</span>
        <strong>${p.name}</strong> joined as ${p.type} in ${p.city}.
      </div>
    `;
  });

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
          <span style="font-size:12px; color:var(--ash)">${p.phone}</span>
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
