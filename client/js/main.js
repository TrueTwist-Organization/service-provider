// ══════════════════════════════════════════════
//  CITY → AREAS DATA (real Gujarat localities)
// ══════════════════════════════════════════════
const CITY_AREAS = {
  Surat: ['Adajan', 'Athwa', 'Katargam', 'Varachha', 'Sagrampura', 'Udhna', 'Rander', 'Pal', 'Piplod', 'Vesu', 'Dumas', 'Althan', 'Bhestan', 'Limbayat', 'Bamroli', 'Pandesara', 'Sachin', 'Dindoli', 'Amroli', 'Citylight', 'Magdalla', 'Ghod Dod Road', 'Ring Road', 'Nanpura'],
  Ahmedabad: ['Satellite', 'Navrangpura', 'Maninagar', 'Bopal', 'Vastrapur', 'Gota', 'Chandkheda', 'Naranpura', 'Paldi', 'Vejalpur', 'Thaltej', 'Prahlad Nagar', 'SG Highway', 'Gurukul', 'Ellisbridge', 'Bapunagar', 'Vastral', 'Odhav', 'Nikol', 'Naroda', 'Isanpur', 'Lambha', 'Ranip', 'Shahibaug', 'Memnagar', 'Sola', 'Science City', 'Ghatlodiya', 'South Bopal'],
  Vadodara: ['Alkapuri', 'Fatehgunj', 'Karelibaug', 'Manjalpur', 'Akota', 'Vadsar', 'Gotri', 'Sayajigunj', 'Makarpura', 'Waghodia Road', 'Gorwa', 'Pratap Nagar', 'Chhani', 'Nizampura', 'Subhanpura', 'Atladara', 'Harni', 'Tandalja', 'Sama', 'Sursagar'],
  Rajkot: ['Kalawad Road', 'Gondal Road', 'Bhaktinagar', 'Raiya Road', '150 Feet Ring Road', 'University Road', 'Kotecha Chowk', 'Mavdi', 'Aajidam', 'Raiyadhar', 'Karanpara', 'Punjabi Para', 'Kanak Road', 'Dhebar Road', 'Doctor House'],
  Bhavnagar: ['Ghogha Circle', 'Waghawadi Road', 'Kaliyabid', 'Rupani Circle', 'Crescent Circle', 'Station Road', 'Madhavnagar', 'Kumbharwada', 'Atabhai Chowk', 'Sardar Nagar'],
  Jamnagar: ['Bedi Gate', 'Digvijay Plot', 'Ranjitsagar Road', 'Raiya Chowk', 'Indira Nagar', 'Patel Colony', 'Saru Section', 'GEB Circle', 'Pradhyuman Road', 'Hari Nagar'],
  Gandhinagar: ['Sector 1', 'Sector 5', 'Sector 7', 'Sector 11', 'Sector 16', 'Sector 21', 'Sector 25', 'Sector 28', 'Kudasan', 'Raysan', 'Infocity', 'Vavol'],
  Anand: ['Vallabh Vidyanagar', 'Karamsad', 'Borsad Road', 'Station Road', 'Market Yard', 'Amul Dairy Road', 'Vidyanagar Road', 'Dharmaj Road'],
  Navsari: ['Sayaji Road', 'Lunsikui', 'Abdasa Road', 'Falia', 'Vijalpore', 'Gandevi Road', 'Station Road', 'Sarbhon'],
  Bharuch: ['Zadeshwar', 'Station Road', 'Kasak', 'Haraniya', 'Ankleshwar Road', 'Rajpipla Road', 'Old Town', 'Bharuch GIDC'],
};

// ══════════════════════════════════════════════
//  LOCAL DB (localStorage)
// ══════════════════════════════════════════════
const DB = {
  pros: () => JSON.parse(localStorage.getItem('fk_pros') || '[]'),
  setPros: v => localStorage.setItem('fk_pros', JSON.stringify(v)),
  reviews: () => JSON.parse(localStorage.getItem('fk_revs') || '{}'),
  setRevs: v => localStorage.setItem('fk_revs', JSON.stringify(v)),
  bookings: () => JSON.parse(localStorage.getItem('fk_bks') || '[]'),
  setBks: v => localStorage.setItem('fk_bks', JSON.stringify(v)),
  visits: () => parseInt(localStorage.getItem('fk_visits') || '0'),
  setVisits: v => localStorage.setItem('fk_visits', v),
};

// Increment visit counter on load + append timestamp for admin charts (real data)
function logVisitTimestamp() {
  const log = JSON.parse(localStorage.getItem('fk_visit_log') || '[]');
  log.push(Date.now());
  if (log.length > 4000) log.splice(0, log.length - 4000);
  localStorage.setItem('fk_visit_log', JSON.stringify(log));
}
DB.setVisits(DB.visits() + 1);
logVisitTimestamp();

// ══════════════════════════════════════════════
//  MOBILE NAVIGATION
// ══════════════════════════════════════════════
function toggleMobileNav() {
  const navCenter = document.getElementById('nav-center');
  const overlay = document.querySelector('.mobile-nav-overlay');
  if (navCenter && overlay) {
    navCenter.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = navCenter.classList.contains('active') ? 'hidden' : '';
  }
}

// ══════════════════════════════════════════════
//  API KEYS
// ══════════════════════════════════════════════
const LOC_API_KEY = '06e18e5d3d4e4eb489cfe1b9b86d85d6'; // Final API Key for Geocoding & Autocomplete
const APIFY_TOKEN = 'apify_api_' + 'pAZDc4awlDh6t0Vn6edzNGa4SuXz4p2Jfyo8';

/**
 * Logs data to Apify Dataset for persistent tracking
 */
async function logToApify(data) {
  try {
    // We use a public Dataset or create one for "fixkar-bookings"
    // Using the 'users/me' endpoint to verify token as requested by user
    const verify = await fetch(`https://api.apify.com/v2/users/me?token=${APIFY_TOKEN}`);
    if (!verify.ok) throw new Error('Invalid Apify Token');

    // Push to a default dataset
    await fetch(`https://api.apify.com/v2/datasets/default/items?token=${APIFY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        source: 'FixKar Web Client'
      })
    });
    console.log('Apify Log Success:', data.event);
  } catch (err) {
    console.error('Apify Integration Error:', err);
  }
}


// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let searchType = 'plumber';
let regType = 'plumber';
let currentResults = [];
let chipActive = 'all';
let capturedImage = null; // Store base64 image data

// ══════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════
function goPage(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.getElementById(p + '-page').classList.add('active');
  document.body.classList.toggle('register-no-anim', p === 'register');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  if (document.getElementById('tab-' + p)) document.getElementById('tab-' + p).classList.add('active');
  // Always reset scroll lock from mobile nav
  document.body.style.overflow = '';
  const navCenter = document.getElementById('nav-center');
  const overlay = document.querySelector('.mobile-nav-overlay');
  if (navCenter) navCenter.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  window.scrollTo(0, 0);
  if (p === 'admin') renderAdmin();
}

function scrollHow() {
  goPage('home');
  setTimeout(() => document.getElementById('how-section').scrollIntoView({ behavior: 'smooth' }), 100);
}

// Check URL for hidden pages
(function checkURL() {
  const q = location.search;
  if (q.includes('admin')) { goPage('admin'); return; }
  if (q.includes('register')) { goPage('register'); return; }
})();

window.addEventListener('DOMContentLoaded', () => {
  // Handle URL parameters for filtering
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  if (typeParam) {
    if (typeParam === 'plumber' || typeParam === 'electrician' || typeParam === 'both') {
      setType(typeParam);
    }
  } else {
    doSearch();
  }

  if (window.location.hash === '#how-section') {
    setTimeout(scrollHow, 500);
  }
});

// ══════════════════════════════════════════════
//  TOASTS
// ══════════════════════════════════════════════
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.style.opacity = '0', 3000);
  setTimeout(() => el.remove(), 3400);
}

// ══════════════════════════════════════════════
//  TYPE TOGGLE
// ══════════════════════════════════════════════
function setType(t) {
  searchType = t;
  document.querySelectorAll('.tt-card').forEach(b => b.classList.remove('sel'));
  const map = {
    plumber: 'tt-plumber',
    electrician: 'tt-elec',
    beautician: 'tt-beautician',
    ac: 'tt-ac',
    appliances: 'tt-appliances',
    physiotherapist: 'tt-physio',
    cleaner: 'tt-cleaner',
    carpenter: 'tt-carpenter',
    painter: 'tt-painter',
    pest: 'tt-pest',
    both: 'tt-both'
  };
  if (document.getElementById(map[t])) document.getElementById(map[t]).classList.add('sel');

  // Update service strip chips based on category
  updateServiceStrip(t);

  // Sync the category dropdown if it exists
  const catNew = document.getElementById('sw-cat-new');
  if (catNew) catNew.value = t;

  // Trigger search
  doSearch();
}

function setRegType(t) {
  regType = t;
  // Hide all service grids
  ['plumber', 'elec', 'beautician', 'physiotherapist', 'cleaner', 'ac', 'appliances', 'carpenter', 'painter', 'pest'].forEach(type => {
    const el = document.getElementById('svcs-' + type);
    if (el) el.style.display = 'none';
  });

  // Show selected grid
  const selectedEl = document.getElementById('svcs-' + t) || document.getElementById('svcs-' + (t === 'electrician' ? 'elec' : t));
  if (selectedEl) selectedEl.style.display = 'block';

  // Toggle button active state
  document.querySelectorAll('.reg-type-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById('btn-reg-' + t);
  if (btn) btn.classList.add('active');
}

function updateServiceStrip(type) {
  const strip = document.getElementById('service-strip');
  if (!strip) return;

  const services = {
    plumber: [
      { id: 'Pipe Repair', label: '🔧 Pipe Repair' },
      { id: 'Tap Fitting', label: '🚿 Tap Fitting' },
      { id: 'Drain Cleaning', label: '🌀 Drain Cleaning' },
      { id: 'Geyser', label: '🔥 Geyser' },
      { id: 'Water Tank', label: '💧 Water Tank' }
    ],
    electrician: [
      { id: 'Wiring', label: '⚡ Wiring' },
      { id: 'Fan / Light', label: '💡 Fan / Light' },
      { id: 'Switchboard', label: '🔌 Switchboard' },
      { id: 'Inverter', label: '🔋 Inverter' },
      { id: 'Short Circuit Fix', label: '⚠️ Short Circuit' }
    ],
    beautician: [
      { id: 'Facial', label: '💄 Facial' },
      { id: 'Hair Styling', label: '✂️ Hair Styling' },
      { id: 'Makeup', label: '👰 Makeup' },
      { id: 'Waxing', label: '✨ Waxing' },
      { id: 'Mani-Pedi', label: '💅 Mani-Pedi' }
    ],
    physiotherapist: [
      { id: 'Back Pain', label: '🧘 Back Pain' },
      { id: 'Sports Injury', label: '🏃 Sports' },
      { id: 'Post-Op', label: '🏥 Post-Op' },
      { id: 'Elderly', label: '👴 Elderly' },
      { id: 'Stroke', label: '🫀 Stroke Rehab' }
    ],
    cleaner: [
      { id: 'Deep Cleaning', label: '🧹 Deep Cleaning' },
      { id: 'Bathroom', label: '🧼 Bathroom' },
      { id: 'Kitchen', label: '🍳 Kitchen' },
      { id: 'Sofa Spa', label: '🛋️ Sofa Spa' },
      { id: 'Dusting', label: '✨ Dusting' }
    ],
    ac: [
      { id: 'AC Service', label: '❄️ AC Service' },
      { id: 'AC Repair', label: '🛠️ AC Repair' },
      { id: 'Gas Charge', label: '💨 Gas Charge' }
    ],
    appliances: [
      { id: 'Wash Mach', label: '🧺 Wash Mach' },
      { id: 'Fridge', label: '🍦 Fridge' },
      { id: 'Microwave', label: '🍕 Microwave' }
    ],
    carpenter: [
      { id: 'Furniture', label: '🔨 Furniture' },
      { id: 'Doors', label: '🚪 Doors' },
      { id: 'Kitchen', label: '🍳 Kitchen' }
    ],
    painter: [
      { id: 'Home Paint', label: '🎨 Home Paint' },
      { id: 'Wall Decor', label: '✨ Wall Decor' },
      { id: 'Waterproof', label: '💧 Waterproof' }
    ],
    pest: [
      { id: 'General', label: '🐜 General' },
      { id: 'Termite', label: '🪵 Termite' },
      { id: 'Cockroach', label: '🪳 Cockroach' }
    ],
    both: []
  };

  let html = `<span class="service-chip active" onclick="chipFilter(this,'all')">All Services</span>`;

  const categoriesToShow = type === 'both' ? ['plumber', 'electrician', 'beautician', 'ac', 'appliances', 'physiotherapist', 'cleaner', 'carpenter', 'painter', 'pest'] : [type];

  categoriesToShow.forEach(cat => {
    if (services[cat]) {
      services[cat].forEach(svc => {
        html += `<span class="service-chip ${cat === 'electrician' ? 'elec' : cat}" onclick="chipFilter(this,'${svc.id}')">${svc.label}</span>`;
      });
    }
  });

  strip.innerHTML = html;
}

// ── IMAGE HELPERS ──
function previewFile(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      capturedImage = e.target.result;
      document.getElementById('reg-photo-preview').innerHTML = `<img src="${capturedImage}" style="width:100%; height:100%; object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
  }
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.style.width = '100%';
    video.style.borderRadius = '20px';

    const preview = document.getElementById('reg-photo-preview');
    preview.innerHTML = '';
    preview.style.borderRadius = '20px';
    preview.appendChild(video);

    const captureBtn = document.createElement('button');
    captureBtn.textContent = '📸 Click Photo';
    captureBtn.className = 'submit-btn';
    captureBtn.style.marginTop = '10px';
    captureBtn.onclick = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      capturedImage = canvas.toDataURL('image/jpeg');

      preview.innerHTML = `<img src="${capturedImage}" style="width:100%; height:100%; object-fit:cover;">`;
      preview.style.borderRadius = '50%';

      stream.getTracks().forEach(track => track.stop());
      captureBtn.remove();
    };
    preview.parentNode.appendChild(captureBtn);
  } catch (err) {
    toast('Camera access denied or not available', 'err');
  }
}

function openReg(t) {
  setRegType(t);
  goPage('register');
  const eb = document.getElementById('reg-eyebrow');
  const labels = {
    plumber: '🔧 PLUMBER REGISTRATION',
    electrician: '⚡ ELECTRICIAN REGISTRATION',
    beautician: '💄 BEAUTICIAN REGISTRATION',
    physiotherapist: '🧘 PHYSIOTHERAPIST REGISTRATION',
    cleaner: '🧹 CLEANER REGISTRATION',
    ac: '❄️ AC REPAIR REGISTRATION',
    appliances: '📺 APPLIANCE REGISTRATION',
    carpenter: '🔨 CARPENTER REGISTRATION',
    painter: '🎨 PAINTER REGISTRATION',
    pest: '🐜 PEST CONTROL REGISTRATION'
  };
  if (eb) {
    eb.innerHTML = labels[t] || 'REGISTRATION';
    eb.style.color = 'var(--amber)';
    eb.style.borderColor = 'var(--amber-glow)';
    eb.style.background = 'rgba(193, 140, 93, 0.05)';
  }
}

function initRegisterButton() {
  const registerBtn = document.getElementById('register-profile-btn');
  if (!registerBtn) return;

  // Remove inline handler dependency and force a single JS listener
  registerBtn.onclick = null;
  registerBtn.addEventListener('click', registerPro);
}

// ══════════════════════════════════════════════
//  SMART LOCATION ENGINE (Pincode & City Sync)
// ══════════════════════════════════════════════
let smartLocTimer;

async function handleSmartPinInput(val, context = 'search') {
  const cityId = context === 'search' ? 'sw-city-new' : 'r-city';
  const areaId = context === 'search' ? 'sw-area-new' : 'r-area';

  if (val.length === 6 && /^\d{6}$/.test(val)) {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        const p = data[0].PostOffice[0];
        document.getElementById(cityId).value = p.District;
        document.getElementById(areaId).value = p.Name;

        // Final sync for search context
        if (context === 'search') {
          document.getElementById('sw-city').value = p.District;
          document.getElementById('sw-area').value = p.Name;
          document.getElementById('sw-pin').value = val;
        }
        toast(`Found: ${p.Name}, ${p.District}`, 'ok');
      }
    } catch (err) { console.error('Pin API Error:', err); }
  }
}

function handleSmartLocInput(val, context = 'search') {
  clearTimeout(smartLocTimer);
  const dropdownId = context === 'search' ? 'city-dropdown' : 'reg-city-dropdown';
  const dropdown = document.getElementById(dropdownId);

  if (!val || val.length < 3) {
    dropdown.classList.remove('active');
    return;
  }
  smartLocTimer = setTimeout(async () => {
    try {
      const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(val)}&apiKey=${LOC_API_KEY}&filter=countrycode:in`);
      const data = await res.json();
      renderSmartDropdown(data.features || [], context);
    } catch (e) { console.error(e); }
  }, 400);
}

function renderSmartDropdown(features, context) {
  const dropdownId = context === 'search' ? 'city-dropdown' : 'reg-city-dropdown';
  const dropdown = document.getElementById(dropdownId);

  if (!features.length) {
    dropdown.innerHTML = '<div class="loc-item" style="cursor:default;color:var(--ash);">No results</div>';
    dropdown.classList.add('active');
    return;
  }
  dropdown.innerHTML = features.map((f, i) => {
    const p = f.properties;
    return `
      <div class="loc-item" onclick="selectSmartLoc(${i}, '${context}')">
        <div class="loc-item-ic">📍</div>
        <div class="loc-item-text">
          <div class="loc-item-title">${p.city || p.name || p.suburb || 'Location'}</div>
          <div class="loc-item-sub">${p.formatted}</div>
        </div>
      </div>
    `;
  }).join('');
  window.lastSmartFeatures = features;
  dropdown.classList.add('active');
}

function selectSmartLoc(idx, context) {
  const p = window.lastSmartFeatures[idx].properties;
  const city = p.city || p.county || '';
  const area = p.suburb || p.village || p.name || '';
  const pin = p.postcode || '';

  const cityId = context === 'search' ? 'sw-city-new' : 'r-city';
  const areaId = context === 'search' ? 'sw-area-new' : 'r-area';
  const pinId = context === 'search' ? 'sw-pin-new' : 'r-pin';

  document.getElementById(cityId).value = city;
  document.getElementById(areaId).value = area;
  document.getElementById(pinId).value = pin;

  // Sync legacy if search
  if (context === 'search') {
    document.getElementById('sw-city').value = city;
    document.getElementById('sw-area').value = area;
    document.getElementById('sw-pin').value = pin;
    document.getElementById('city-dropdown').classList.remove('active');
  } else {
    document.getElementById('reg-city-dropdown').classList.remove('active');
  }

  toast('Location details auto-filled', 'ok');
}

// Close dropdown on click outside
document.addEventListener('click', e => {
  if (!e.target.closest('.fg')) {
    document.getElementById('city-dropdown')?.classList.remove('active');
  }
});

function populateAreas(city, targetId) {
  const sel = document.getElementById(targetId);
  if (!sel) return;
  sel.innerHTML = '<option value="">— Select area —</option>';
  if (!city || !CITY_AREAS[city]) return;
  CITY_AREAS[city].forEach(a => {
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    sel.appendChild(opt);
  });
}

function onCityChange() {
  const city = document.getElementById('sw-city').value;
  populateAreas(city, 'sw-area');
}

window.onCityChangeNew = function () {
  const city = document.getElementById('sw-city-new').value;
  populateAreas(city, 'sw-area-new');
};

function doSearchNew() {
  const city = document.getElementById('sw-city-new').value;
  const area = document.getElementById('sw-area-new').value;
  const pin = document.getElementById('sw-pin-new').value.trim();

  // Sync to legacy hidden fields for doSearch to operate
  document.getElementById('sw-city').value = city;
  document.getElementById('sw-area').value = area;
  document.getElementById('sw-pin').value = pin;

  doSearch();
}

function onRegCityChange() {
  const city = document.getElementById('r-city').value;
  populateAreas(city, 'r-area');
}

// ══════════════════════════════════════════════
//  GPS LOCATION
// ══════════════════════════════════════════════
function getGPS() {
  if (!navigator.geolocation) { toast('GPS not supported in your browser', 'err'); return; }
  toast('Detecting your location…');
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      // Reverse geocode using Nominatim (free, no API key)
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`)
        .then(r => r.json())
        .then(data => {
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.county || '';
          const area = addr.suburb || addr.neighbourhood || addr.village || addr.quarter || '';
          const pin = addr.postcode || '';

          // Try to match city
          const matchCity = Object.keys(CITY_AREAS).find(c => city.toLowerCase().includes(c.toLowerCase()));
          const finalCity = matchCity || city;
          const finalArea = area || '';

          document.getElementById('sw-city').value = finalCity;
          document.getElementById('sw-area').value = finalArea;

          // Sync to new UI fields if present
          if (document.getElementById('sw-city-new')) {
            document.getElementById('sw-city-new').value = finalCity;
            window.onCityChangeNew();
            document.getElementById('sw-area-new').value = finalArea;
          }
          if (pin && document.getElementById('sw-pin-new')) {
            document.getElementById('sw-pin-new').value = pin.replace(' ', '');
          }

          if (pin) {
            document.getElementById('sw-pin').value = pin.replace(' ', '');
            document.getElementById('sw-loc-input').value = (finalArea || finalCity) + ` (${pin})`;
          } else {
            document.getElementById('sw-loc-input').value = (finalArea || finalCity);
          }
          toast('Location detected: ' + (area || city || 'your area'), 'ok');
          // Trigger search automatically after detection
          doSearch();
        })
        .catch(() => {
          toast('Could not fetch area name. Please select manually.', 'err');
        });
    },
    () => toast('Permission denied. Please allow location access.', 'err'),
    { timeout: 8000 }
  );
}

// ══════════════════════════════════════════════
//  SEARCH
// ══════════════════════════════════════════════
function doSearch() {
  const city = document.getElementById('sw-city').value;
  const area = document.getElementById('sw-area').value;
  const pin = document.getElementById('sw-pin').value.trim();

  const pros = DB.pros();
  let results = pros.filter(p => {
    // ONLY enforce the profession type (Plumber vs Electrician).
    // Do NOT hide any profile based on location.
    if (searchType !== 'both' && p.type !== searchType) return false;
    return true;
  });

  // Smart Ranking: Push exact matches to the top, but keep everyone else visible below
  results.sort((a, b) => {
    const getScore = (p) => {
      let score = 0;
      if (pin && p.pin === pin) score += 100; // Pincode is huge
      if (city && p.city === city) {
        score += 10; // Same city
        if (area && p.area.toLowerCase().includes(area.toLowerCase())) {
          score += 20; // Same city AND area
        }
      }
      return score;
    };
    return getScore(b) - getScore(a);
  });

  currentResults = results;

  let locLabel = 'All Areas (Sorted by closest match)';
  if (area && city) locLabel = `${area} & nearby, ${city} + All Others`;
  else if (city) locLabel = `${city} + All Others`;
  else if (pin) locLabel = `Pincode ${pin} + All Others`;

  if (results.length === 0) {
    locLabel = 'No professional found for this category.';
  }

  renderResults(results, city, locLabel);
}

function renderResults(results, city, locLabel) {
  const rs = document.getElementById('results-section');
  const ew = document.getElementById('empty-wrap');
  chipActive = 'all';
  document.querySelectorAll('.service-chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.service-chip').classList.add('active');

  if (!results.length) {
    rs.style.display = 'none';
    ew.style.display = 'block';
    ew.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  rs.style.display = 'block';
  ew.style.display = 'none';
  document.getElementById('res-count').textContent = results.length;
  document.getElementById('res-loc').textContent = locLabel ? `in ${locLabel}` : '';
  renderGrid(results);
  rs.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderGrid(list) {
  const grid = document.getElementById('pro-grid');
  grid.innerHTML = list.map(p => proCardHTML(p)).join('');
}

function proCardHTML(p) {
  const init = p.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const typeLabels = {
    plumber: '🔧 Plumber',
    electrician: '⚡ Electrician',
    beautician: '💄 Beautician',
    physiotherapist: '🧘 Physio',
    cleaner: '🧹 Cleaner',
    ac: '❄️ AC Repair',
    appliances: '📺 Appliances',
    carpenter: '🔨 Carpenter',
    painter: '🎨 Painter',
    pest: '🐜 Pest Control'
  };
  const typeLabel = typeLabels[p.type] || 'Professional';
  const typeClass = p.type === 'electrician' ? 'elec' : p.type;

  const revs = (DB.reviews()[p.id] || []);
  const rating = revs.length ? (revs.reduce((s, r) => s + r.stars, 0) / revs.length).toFixed(1) : (p.rating || '—');
  const stars = rating !== '—' ? '★'.repeat(Math.floor(+rating)) : '';
  const tags = (p.services || []).slice(0, 4).map(s =>
    `<span class="svc-tag svc-tag-${typeClass === 'elec' ? 'e' : typeClass === 'plumber' ? 'p' : typeClass}">${s}</span>`
  ).join('') + (p.services.length > 4 ? `<span class="svc-tag svc-tag-${typeClass === 'elec' ? 'e' : typeClass === 'plumber' ? 'p' : typeClass}">+${p.services.length - 4}</span>` : '');

  const avatarContent = p.image
    ? `<img src="${p.image}" style="width:100%; height:100%; object-fit:cover;">`
    : init;

  return `
  <div class="pro-card ${typeClass}" id="card-${p.id}">
    <div class="card-top">
      <span class="card-type-badge ${typeClass === 'elec' ? 'badge-elec' : typeClass === 'plumber' ? 'badge-plumber' : 'badge-' + typeClass}">${typeLabel}</span>
      ${p.verified ? '<span class="badge-verified">✓ Verified</span>' : ''}
      <div class="card-avatar-row">
        <div class="card-avatar ${typeClass === 'elec' ? 'av-elec' : typeClass === 'plumber' ? 'av-plumber' : 'av-' + typeClass}">${avatarContent}</div>
        <div>
          <div class="card-pname">${p.name}</div>
          <div class="card-shop">${p.shop}</div>
          <div class="card-exp">${p.exp}+ yrs experience</div>
        </div>
      </div>
      <div class="card-loc">📍 ${p.area}, ${p.city} · ${p.pin}</div>
    </div>
    <div class="card-body">
      <div class="svc-tags">${tags}</div>
      <div class="card-metrics">
        <div class="metric-item">
          <div class="metric-val">${rating}</div>
          <div class="metric-lab">Rating</div>
        </div>
        <div class="metric-item">
          <div class="metric-val">${revs.length || p.reviews || 0}</div>
          <div class="metric-lab">Reviews</div>
        </div>
        <div class="metric-item">
          <div class="metric-val">${p.bookings || 0}</div>
          <div class="metric-lab">Jobs</div>
        </div>
        <div class="metric-item" style="border-left: 1px solid var(--border-light); padding-left: 12px;">
          <div class="metric-val" id="reach-count-${p.id}">${p.reachedHomeCount || 0}</div>
          <div class="metric-lab">Reached</div>
        </div>
      </div>

      <div class="card-fee">
        <span>Visit fee: <span class="card-fee-val">₹${p.fee}</span>${p.hourly ? ` · ₹${p.hourly}/hr` : ''}</span>
        <span><span class="avail-dot"></span><span class="card-avail">Available</span></span>
      </div>
      <div class="card-stars">${stars}<span style="font-size:12px;color:var(--ash);margin-left:4px">(${revs.length || p.reviews || 0})</span></div>
      <div class="card-btns">
        <button class="cbtn cbtn-ghost" onclick="openProfile('${p.id}')">View Profile</button>
        <button class="cbtn cbtn-solid-${p.type}" onclick="openBooking('${p.id}')">Book Now</button>
      </div>
    </div>
  </div>`;
}

// ── SORT & FILTER ──
function sortProfs(el, by) {
  document.querySelectorAll('.sort-chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  let list = [...currentResults];
  if (chipActive !== 'all') list = list.filter(p => p.services.some(s => s.toLowerCase().includes(chipActive.toLowerCase())));
  if (by === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (by === 'fee') list.sort((a, b) => (a.fee || 0) - (b.fee || 0));
  else if (by === 'exp') list.sort((a, b) => (b.exp || 0) - (a.exp || 0));
  else list.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
  renderGrid(list);
}

function chipFilter(el, svc) {
  document.querySelectorAll('.service-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  chipActive = svc;
  let list = currentResults;
  if (svc !== 'all') list = list.filter(p => p.services.some(s => s.toLowerCase().includes(svc.toLowerCase())));
  renderGrid(list);
}

// ══════════════════════════════════════════════
//  PROFILE MODAL
// ══════════════════════════════════════════════
function openProfile(pid) {
  const p = DB.pros().find(x => x.id === pid);
  if (!p) return;
  const revs = DB.reviews()[pid] || [];
  const isElec = p.type === 'electrician';
  const avgRating = revs.length ? (revs.reduce((s, r) => s + r.stars, 0) / revs.length).toFixed(1) : (p.rating || '0');
  const typeClass = p.type === 'electrician' ? 'elec' : p.type;
  const init = p.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarContent = p.image
    ? `<img src="${p.image}" style="width:100%; height:100%; object-fit:cover;">`
    : init;

  const revsHTML = revs.length ? revs.map(r => `
    <div class="rev-card">
      <div class="rev-top">
        <span class="rev-name">${r.name}</span>
        <span class="rev-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
      </div>
      <div class="rev-text">${r.text}</div>
      <div class="rev-date">${r.date}</div>
    </div>`).join('') : '<p style="color:var(--ash);font-size:14px">No reviews yet. Book and be the first!</p>';

  document.getElementById('profile-modal').innerHTML = `
    <div class="modal-hdr">
      <div>
        <div class="modal-ttl">${p.name}</div>
        <div class="modal-sub">${p.shop} · ${isElec ? 'Electrician' : 'Plumber'}</div>
      </div>
      <button class="modal-x" onclick="closeOverlay('profile-overlay')">✕</button>
    </div>
    <div class="profile-hero-sec">
      <div class="ph-top">
        <div class="ph-avatar ${typeClass === 'elec' ? 'av-elec' : typeClass === 'plumber' ? 'av-plumber' : 'av-' + typeClass}">${avatarContent}</div>
        <div>
          <div class="ph-name">${p.name}</div>
          <div class="ph-shop">${p.shop}</div>
          <div class="ph-badges">
            <span class="ph-badge ${typeClass === 'elec' ? 'badge-elec' : typeClass === 'plumber' ? 'badge-plumber' : 'badge-' + typeClass}">${isElec ? '⚡ Electrician' : p.type.charAt(0).toUpperCase() + p.type.slice(1)}</span>
            ${p.verified ? '<span class="ph-badge spill verified">✓ Verified</span>' : ''}
            <span class="ph-badge" style="background:rgba(224,124,36,.15);color:var(--amber)">${p.exp}+ years exp</span>
          </div>
        </div>
      </div>
      <div class="ph-stats">
        <div class="ph-stat"><div class="ph-stat-val">${avgRating}★</div><div class="ph-stat-lab">Rating</div></div>
        <div class="ph-stat"><div class="ph-stat-val">${revs.length || p.reviews || 0}</div><div class="ph-stat-lab">Reviews</div></div>
        <div class="ph-stat"><div class="ph-stat-val">${p.bookings || 0}</div><div class="ph-stat-lab">Jobs done</div></div>
        <div class="ph-stat"><div class="ph-stat-val">₹${p.fee}</div><div class="ph-stat-lab">Visit fee</div></div>
      </div>
    </div>
    <div class="profile-sec">
      <div class="ps-h">Contact & Location</div>
      <div class="info-item"><div class="info-ic">📞</div><div><div class="info-lbl">Mobile</div><div class="info-v">${p.phone}</div></div></div>
      ${p.whatsapp ? `<div class="info-item"><div class="info-ic">💬</div><div><div class="info-lbl">WhatsApp</div><div class="info-v">${p.whatsapp}</div></div></div>` : ''}
      <div class="info-item"><div class="info-ic">🏪</div><div><div class="info-lbl">Shop Address</div><div class="info-v">${p.addr}</div></div></div>
      <div class="info-item"><div class="info-ic">📍</div><div><div class="info-lbl">Area & City</div><div class="info-v">${p.area}, ${p.city} — ${p.pin}</div></div></div>
      ${p.email ? `<div class="info-item"><div class="info-ic">✉️</div><div><div class="info-lbl">Email</div><div class="info-v">${p.email}</div></div></div>` : ''}
    </div>
    <div class="profile-sec">
      <div class="ps-h">Services Offered</div>
      <div class="svc-tags">${(p.services || []).map(s => `<span class="svc-tag ${typeClass === 'elec' ? 'svc-tag-e' : typeClass === 'plumber' ? 'svc-tag-p' : 'svc-tag-' + typeClass}">${s}</span>`).join('')}</div>
      ${p.hourly ? `<p style="margin-top:12px;font-size:14px;color:var(--ash)">Hourly rate: <strong style="color:var(--charcoal)">₹${p.hourly}/hr</strong></p>` : ''}
    </div>
    ${p.about ? `<div class="profile-sec"><div class="ps-h">About</div><p style="font-size:14px;color:var(--ash);line-height:1.7">${p.about}</p></div>` : ''}
    <div class="profile-sec">
      <div class="ps-h">Customer Reviews (${revs.length})</div>
      ${revsHTML}
      <div style="margin-top:20px;padding-top:18px;border-top:1px solid var(--border-light)">
        <div class="ps-h" style="margin-bottom:12px">Leave a Review</div>
        <div class="form-g col1" style="gap:12px">
          <div class="fg"><label class="fl">Your Name</label><input type="text" class="fi" id="rn-${pid}" placeholder="Your name"/></div>
          <div class="fg">
            <label class="fl">Rating</label>
            <div class="star-inp" id="si-${pid}" data-v="0">
              ${[1, 2, 3, 4, 5].map(n => `<button class="si" onclick="setStar('${pid}',${n})">★</button>`).join('')}
            </div>
          </div>
          <div class="fg"><label class="fl">Review</label><textarea class="fi" id="rt-${pid}" placeholder="How was the experience?" rows="2"></textarea></div>
          <button class="submit-btn" style="font-size:14px;padding:11px" onclick="submitRev('${pid}')">Submit Review</button>
        </div>
      </div>
    </div>
    <div style="padding:16px 32px 28px">
      <button class="submit-btn" onclick="closeOverlay('profile-overlay');openBooking('${pid}')">Book ${p.name} →</button>
    </div>
  `;
  document.getElementById('profile-overlay').classList.add('open');
}

function setStar(pid, val) {
  const si = document.getElementById('si-' + pid);
  si.dataset.v = val;
  si.querySelectorAll('.si').forEach((b, i) => b.classList.toggle('lit', i < val));
}

function submitRev(pid) {
  const name = document.getElementById('rn-' + pid).value.trim();
  const text = document.getElementById('rt-' + pid).value.trim();
  const stars = +document.getElementById('si-' + pid).dataset.v;
  if (!name || !text || !stars) { toast('Please fill all review fields', 'err'); return; }

  const revs = DB.reviews();
  if (!revs[pid]) revs[pid] = [];
  revs[pid].unshift({ name, stars, text, date: 'Just now' });
  DB.setRevs(revs);

  const pros = DB.pros();
  const idx = pros.findIndex(p => p.id === pid);
  if (idx !== -1) {
    const all = revs[pid];
    pros[idx].rating = +(all.reduce((s, r) => s + r.stars, 0) / all.length).toFixed(1);
    pros[idx].reviews = all.length;
    DB.setPros(pros);
  }
  toast('Review submitted! Thank you.', 'ok');
  closeOverlay('profile-overlay');
  setTimeout(() => openProfile(pid), 300);
}

// ══════════════════════════════════════════════
//  BOOKING MODAL
// ══════════════════════════════════════════════
function openBooking(pid) {
  const p = DB.pros().find(x => x.id === pid);
  if (!p) return;
  const isElec = p.type === 'electrician';

  document.getElementById('booking-modal').innerHTML = `
    <div class="modal-hdr">
      <div>
        <div class="modal-ttl">Book ${isElec ? 'Electrician' : 'Plumber'}</div>
        <div class="modal-sub">${p.name} · ${p.shop}</div>
      </div>
      <button class="modal-x" onclick="closeOverlay('booking-overlay')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-g">
        <div class="fg full">
          <label class="fl">Service Required *</label>
          <select class="fs" id="bk-svc">
            <option value="">Select service…</option>
            ${(p.services || []).map(s => `<option>${s}</option>`).join('')}
          </select>
        </div>
        <div class="fg"><label class="fl">Your Name *</label><input type="text" class="fi" id="bk-n" placeholder="Full name"/></div>
        <div class="fg"><label class="fl">Mobile *</label><input type="tel" class="fi" id="bk-p" placeholder="9876543210" maxlength="10"/></div>
        <div class="fg full"><label class="fl">Your Address *</label><textarea class="fi" id="bk-a" placeholder="Flat/house no., building, street…" rows="2"></textarea></div>
        <div class="fg"><label class="fl">Preferred Date</label><input type="text" class="fi" id="bk-d" placeholder="Today / dd-mm-yyyy"/></div>
        <div class="fg"><label class="fl">Preferred Time</label><input type="text" class="fi" id="bk-t" placeholder="10 AM – 12 PM"/></div>
        <div class="fg full">
          <div style="background:var(--linen);border-radius:var(--r-sm);padding:14px;font-size:13px;color:var(--ash)">
            Visit fee <strong style="color:var(--charcoal)">₹${p.fee}</strong> collected after inspection.
            ${p.hourly ? ` Work rate: <strong style="color:var(--charcoal)">₹${p.hourly}/hr</strong>` : ''}<br>
            <span style="font-size:12px">No cancellation charges if cancelled 30 min before.</span>
          </div>
        </div>
      </div>
      <button class="submit-btn" style="background:var(--${p.type === 'electrician' ? 'electric' : 'amber'});margin-top:12px" onclick="confirmBooking('${pid}')">Confirm Booking →</button>
    </div>
  `;
  document.getElementById('booking-overlay').classList.add('open');
}

function confirmBooking(pid) {
  const svc = document.getElementById('bk-svc').value;
  const nm = document.getElementById('bk-n').value.trim();
  const ph = document.getElementById('bk-p').value.trim();
  const ad = document.getElementById('bk-a').value.trim();
  if (!svc || !nm || !ph || !ad) { toast('Please fill all required fields', 'err'); return; }

  const p = DB.pros().find(x => x.id === pid);
  const eta = Math.floor(Math.random() * 20) + 8; // 8–28 min
  const dist = (Math.random() * 2.5 + 0.3).toFixed(1);

  const bk = { id: 'bk' + Date.now(), pid, svc, nm, ph, ad, eta, dist, ts: Date.now() };
  const bks = DB.bookings(); bks.push(bk); DB.setBks(bks);

  // LOG TO APIFY: Initial Booking
  logToApify({
    event: 'SERVICE_BOOKED',
    professionalId: pid,
    professionalName: p.name,
    customerName: nm,
    service: svc,
    customerAddress: ad,
    distance: dist
  });

  toast(`Booking confirmed! ${p.name} is on the way`, 'ok');
  showTracking(p, bk);
}


function showTracking(p, bk) {
  const isElec = p.type === 'electrician';
  const emoji = isElec ? '⚡' : '🔧';
  const color = isElec ? 'var(--electric)' : 'var(--amber)';

  // Random worker start position
  let wx = Math.random() * 25 + 5, wy = Math.random() * 30 + 55;
  const tx = 62, ty = 32;
  let progress = 3, step = 0;
  const totalSteps = 50;

  document.getElementById('booking-modal').innerHTML = `
    <div class="modal-hdr">
      <div>
        <div class="modal-ttl">${isElec ? '⚡' : '🔧'} Professional En Route!</div>
        <div class="modal-sub">${p.name} · ${bk.svc}</div>
      </div>
      <button class="modal-x" onclick="closeOverlay('booking-overlay')">✕</button>
    </div>
    <div class="modal-body" style="padding-top:20px">

      <!-- STATUS STEPS -->
      <div class="bk-steps">
        <div class="bk-step"><div class="bk-dot done">✓</div><span class="bk-step-lbl">Booked</span></div>
        <div class="bk-step"><div class="bk-dot done">✓</div><span class="bk-step-lbl">Confirmed</span></div>
        <div class="bk-step"><div class="bk-dot cur" id="sdot-enroute">🛵</div><span class="bk-step-lbl">En Route</span></div>
        <div class="bk-step"><div class="bk-dot" id="sdot-arrived">🏠</div><span class="bk-step-lbl">Arrived</span></div>
      </div>

      <!-- ETA BOX -->
      <div class="eta-box">
        <div class="eta-icon">${isElec ? '⚡' : '🛵'}</div>
        <div>
          <div class="eta-time" id="eta-val">${bk.eta} min</div>
          <div class="eta-lbl">${p.name} is heading to you</div>
          <div class="eta-sub">${bk.dist} km away · ${p.area}, ${p.city}</div>
        </div>
      </div>

      <!-- MAP -->
      <div class="map-box">
        <div class="map-bg"></div>
        <div class="map-road h" style="top:38%"></div>
        <div class="map-road h" style="top:62%"></div>
        <div class="map-road v" style="left:32%"></div>
        <div class="map-road v" style="left:68%"></div>
        <div class="map-dest" id="map-dest" style="left:${tx}%;top:${ty}%">📍</div>
        <div class="map-worker" id="map-worker" style="left:${wx}%;top:${wy}%">${isElec ? '⚡' : '🛵'}</div>
        <div class="map-overlay">
          <span style="font-size:13px">📍 Your location</span>
          <span class="map-overlay-green" id="map-eta-lbl">ETA: ${bk.eta} min</span>
        </div>
      </div>

      <!-- PROGRESS -->
      <div class="prog-wrap">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ash);margin-bottom:6px">
          <span>${p.name}'s location</span>
          <span id="prog-pct">0%</span>
        </div>
        <div class="prog-track"><div class="prog-bar" id="prog-bar" style="width:3%"></div></div>
      </div>

      <!-- PROFESSIONAL INFO -->
      <div style="background:var(--linen);border-radius:var(--r-sm);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:4px">
        <div>
          <div style="font-weight:700;font-size:14px">${p.name} ${emoji}</div>
          <div style="font-size:13px;color:var(--ash)">${bk.svc} · ₹${p.fee} visit</div>
          <div style="font-size:12px;color:var(--ash);margin-top:2px">${p.phone}</div>
        </div>
        <a href="tel:${p.phone}" style="background:var(--teal);color:white;padding:10px 18px;border-radius:var(--r-sm);font-size:13px;font-weight:700;text-decoration:none;white-space:nowrap">📞 Call</a>
      </div>
      <div id="arrival-msg" style="font-size:13px;color:var(--ash);text-align:center;margin-top:10px;min-height:20px">${p.name} accepted your booking and is on the way</div>
    </div>
  `;

  // Animate worker
  const interval = setInterval(() => {
    step++;
    const frac = step / totalSteps;
    wx = (5 + Math.random() * 25) + (tx - 15) * frac;
    wy = (55 + Math.random() * 30) + (ty - 70) * frac;
    progress = Math.min(3 + frac * 94, 97);
    const remMin = Math.max(1, Math.round(bk.eta * (1 - frac)));

    const wEl = document.getElementById('map-worker');
    const pb = document.getElementById('prog-bar');
    const et = document.getElementById('eta-val');
    const ml = document.getElementById('map-eta-lbl');
    const pp = document.getElementById('prog-pct');
    const am = document.getElementById('arrival-msg');

    if (wEl) { wEl.style.left = wx + '%'; wEl.style.top = wy + '%'; }
    if (pb) pb.style.width = progress + '%';
    if (et) et.textContent = remMin + ' min';
    if (ml) ml.textContent = 'ETA: ' + remMin + ' min';
    if (pp) pp.textContent = Math.round(progress) + '%';

    if (frac > .75 && am) am.textContent = p.name + ' is almost at your location!';

    if (step >= totalSteps) {
      clearInterval(interval);
      if (pb) pb.style.width = '100%';
      if (et) { et.textContent = 'Arrived!'; et.style.color = 'var(--teal)'; }
      if (ml) ml.textContent = 'Arrived';
      if (pp) pp.textContent = '100%';
      if (am) { am.textContent = '✅ ' + p.name + ' has arrived at your location!'; am.style.color = 'var(--teal)'; am.style.fontWeight = '700'; }
      if (wEl) { wEl.style.left = tx + '%'; wEl.style.top = (ty + 8) + '%'; }

      const d1 = document.getElementById('sdot-enroute');
      const d2 = document.getElementById('sdot-arrived');
      if (d1) { d1.classList.remove('cur'); d1.classList.add('done'); d1.textContent = '✓'; }
      if (d2) { d2.classList.add('done'); d2.textContent = '✓'; }

      // Update "Reached Home" count for Service Man
      const pros = DB.pros();
      const idx = pros.findIndex(pp => pp.id === p.id);
      if (idx !== -1) {
        pros[idx].reachedHomeCount = (pros[idx].reachedHomeCount || 0) + 1;
        DB.setPros(pros);
        // Sync to UI if visible
        const reachEl = document.getElementById(`reach-count-${p.id}`);
        if (reachEl) reachEl.textContent = pros[idx].reachedHomeCount;
      }

      // LOG TO APIFY: Arrival
      logToApify({
        event: 'SERVICE_MAN_ARRIVED',
        professionalId: p.id,
        bookingId: bk.id,
        totalReaches: pros[idx]?.reachedHomeCount
      });

      toast(p.name + ' has arrived!', 'ok');
    }
  }, 700);
}


// ══════════════════════════════════════════════
//  REGISTRATION
// ══════════════════════════════════════════════
function registerPro(e) {
  // 1. Identify Button & State
  const btn = e?.currentTarget || e?.target?.closest?.('button') || document.getElementById('register-profile-btn');
  const originalText = btn ? btn.innerHTML : 'Register My Profile on FixKar →';

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner"></span> Registering...';
    }

    // 2. Data Gathering
    const get = id => document.getElementById(id)?.value?.trim();
    const type = regType || 'plumber';

    const fields = {
      name: { val: get('r-name'), label: 'Full Name' },
      phone: { val: get('r-phone'), label: 'Mobile Number' },
      shop: { val: get('r-shop'), label: 'Shop Name' },
      city: { val: get('r-city'), label: 'City' },
      area: { val: get('r-area'), label: 'Area' },
      pincode: { val: get('r-pin'), label: 'Pincode' },
      fee: { val: get('r-fee'), label: 'Inspection Fee' },
      exp: { val: get('r-exp'), label: 'Experience' }
    };

    // 3. Robust Validation
    let firstError = null;
    for (const [key, field] of Object.entries(fields)) {
      const el = document.getElementById('r-' + (key === 'pincode' ? 'pin' : key));
      if (!field.val) {
        if (el) el.style.borderColor = 'var(--red)';
        if (!firstError) firstError = field;
      } else {
        if (el) el.style.borderColor = '';
      }
    }

    if (firstError) {
      toast(`Please enter ${firstError.label}`, 'err');
      if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
      return;
    }

    // Phone validation
    if (!/^\d{10}$/.test(fields.phone.val)) {
      toast('Please enter a valid 10-digit mobile number', 'err');
      document.getElementById('r-phone')?.focus();
      if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
      return;
    }

    // Services selection check
    const svcId = (type === 'electrician' ? 'elec' : type);
    const svcSelector = `#svcs-${svcId} input:checked`;
    const services = Array.from(document.querySelectorAll(svcSelector)).map(c => c.value);

    if (services.length === 0) {
      toast('Please select at least one service offered', 'err');
      document.getElementById('svcs-' + svcId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
      return;
    }

    // 4. Duplicate Check
    const pros = DB.pros();
    if (pros.find(p => p.phone === fields.phone.val)) {
      toast('This mobile number is already registered!', 'err');
      if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
      return;
    }

    // 5. Success Creation
    const newPro = {
      id: 'pro' + Date.now(),
      type: type,
      name: fields.name.val,
      phone: fields.phone.val,
      email: get('r-email') || '',
      whatsapp: get('r-wa') || '',
      shop: fields.shop.val,
      addr: get('r-addr') || '',
      city: fields.city.val,
      area: fields.area.val,
      pin: fields.pincode.val,
      exp: parseInt(fields.exp.val) || 0,
      fee: parseInt(fields.fee.val) || 0,
      hourly: parseInt(get('r-hourly')) || 0,
      about: get('r-about') || '',
      services,
      image: capturedImage,
      rating: 0, 
      reviews: 0, 
      bookings: 0, 
      verified: false,
      reachedHomeCount: 0,
      joined: new Date().toLocaleDateString('en-IN'),
    };

    pros.push(newPro);
    DB.setPros(pros);
    updateHeroStats();

    // 6. LOG TO APIFY
    logToApify({
      event: 'PROFESSIONAL_REGISTERED',
      name: newPro.name,
      type: newPro.type,
      city: newPro.city
    });

    // 7. Success Sequence
    // Reset Form
    const clearIds = ['r-name', 'r-phone', 'r-email', 'r-wa', 'r-shop', 'r-addr', 'r-pin', 'r-fee', 'r-about', 'r-city', 'r-area', 'r-exp', 'r-hourly'];
    clearIds.forEach(id => {
      const el = document.getElementById(id); 
      if (el) { el.value = ''; el.style.borderColor = ''; }
    });
    document.querySelectorAll('.cbx-grid input').forEach(c => c.checked = false);
    document.getElementById('reg-photo-preview').innerHTML = '👤';
    capturedImage = null;

    // Show Popup and Redirect to Home
    setTimeout(() => {
      alert("Registration successfully created");
      goPage('home');
      if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
    }, 500);

  } catch (err) {
    console.error('Registration Error:', err);
    toast('Registration failed. Please try again.', 'err');
    if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
  }
}

// ══════════════════════════════════════════════
//  ADMIN
// ══════════════════════════════════════════════
function renderAdmin() {
  const pros = DB.pros();
  const bks = DB.bookings();
  const totalJobs = pros.reduce((s, p) => s + (p.bookings || 0), 0) + bks.length;
  const verified = pros.filter(p => p.verified).length;
  const avgR = pros.filter(p => p.rating).length ?
    (pros.filter(p => p.rating).reduce((s, p) => s + p.rating, 0) / pros.filter(p => p.rating).length).toFixed(1) : '—';

  document.getElementById('admin-stats-row').innerHTML = `
    <div class="astat"><div class="astat-v">${pros.length}</div><div class="astat-l">Total Professionals</div></div>
    <div class="astat"><div class="astat-v">${verified}</div><div class="astat-l">Verified</div></div>
    <div class="astat"><div class="astat-v">${totalJobs}</div><div class="astat-l">Total Jobs</div></div>
    <div class="astat"><div class="astat-v">${avgR}★</div><div class="astat-l">Avg Rating</div></div>
  `;

  const tb = document.getElementById('admin-tbody');
  if (!pros.length) {
    tb.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--ash)">No professionals yet. Click "Load Sample Data".</td></tr>';
    return;
  }
  tb.innerHTML = pros.map(p => `
    <tr>
      <td><strong>${p.name}</strong><br><span style="font-size:12px;color:var(--ash)">${p.phone}</span></td>
      <td><span class="ph-badge ${p.type === 'electrician' ? 'badge-elec' : 'badge-plumber'}" style="font-size:11px">${p.type === 'electrician' ? '⚡ Elec' : '🔧 Plumb'}</span></td>
      <td>${p.area}<br><span style="font-size:12px;color:var(--ash)">${p.city} · ${p.pin}</span></td>
      <td style="font-size:12px;max-width:160px">${(p.services || []).slice(0, 3).join(', ')}${p.services.length > 3 ? '…' : ''}</td>
      <td>₹${p.fee}</td>
      <td>${p.rating ? p.rating + '★' : '—'}</td>
      <td><span class="spill ${p.verified ? 'verified' : 'pending'}">${p.verified ? 'Verified' : 'Pending'}</span></td>
      <td>
        <button class="tbl-btn" onclick="toggleVerify('${p.id}')">${p.verified ? 'Unverify' : 'Verify'}</button>
        <button class="tbl-btn" style="margin-left:4px;color:var(--red);border-color:var(--red)" onclick="deletePro('${p.id}')">Delete</button>
      </td>
    </tr>`).join('');
}

function toggleVerify(pid) {
  const pros = DB.pros();
  const idx = pros.findIndex(p => p.id === pid);
  if (idx === -1) return;
  pros[idx].verified = !pros[idx].verified;
  DB.setPros(pros);
  renderAdmin();
  toast(pros[idx].verified ? 'Verified!' : 'Removed verification');
}

function deletePro(pid) {
  if (!confirm('Delete this professional?')) return;
  DB.setPros(DB.pros().filter(p => p.id !== pid));
  renderAdmin();
  toast('Deleted', 'err');
}

// ══════════════════════════════════════════════
//  SAMPLE DATA
// ══════════════════════════════════════════════
function seedSampleData() {
  const sample = [
    { id: 's1', type: 'plumber', name: 'Ramesh Kumar Patel', phone: '9876501234', email: 'ramesh@email.com', whatsapp: '9876501234', shop: 'Kumar Plumbing Works', addr: 'Shop 12, Near Katargam Bus Stand', city: 'Surat', area: 'Katargam', pin: '395004', exp: 8, fee: 150, hourly: 300, about: '8+ years in residential plumbing. Expert in leakage detection and pipe replacement. Available for emergencies 24/7.', services: ['Pipe Repair', 'Tap Fitting', 'Leakage Fix', 'Drain Cleaning'], rating: 4.7, reviews: 23, bookings: 156, verified: true },
    { id: 's2', type: 'plumber', name: 'Suresh Bhai Patel', phone: '9823456789', email: 'suresh@email.com', shop: 'Patel Pipe & Sanitation', addr: 'Opp. Sagrampura Police Station, Sagrampura', city: 'Surat', area: 'Sagrampura', pin: '395002', exp: 12, fee: 200, hourly: 350, about: 'Specialized in geyser installation and bathroom renovation. Certified service center for Racold and AO Smith.', services: ['Geyser Service', 'Bathroom Fitting', 'Water Tank', 'Bore Well'], rating: 4.9, reviews: 41, bookings: 289, verified: true },
    { id: 's3', type: 'electrician', name: 'Dinesh Mehta', phone: '9988776600', email: 'dinesh@email.com', shop: 'Mehta Electrical Services', addr: 'Adajan Patiya, Near D-Mart', city: 'Surat', area: 'Adajan', pin: '395009', exp: 10, fee: 180, hourly: 320, about: 'Licensed electrician with expertise in home wiring, MCB panels, and inverter installation. ISI certified.', services: ['Wiring', 'Fan / Light Fitting', 'Switchboard', 'Inverter / UPS', 'MCB / DB Panel'], rating: 4.8, reviews: 38, bookings: 201, verified: true },
    { id: 's4', type: 'electrician', name: 'Vijay Singh Rathod', phone: '9012345678', shop: 'Rathod Electricals', addr: 'Near Swaminarayan Temple, Varachha', city: 'Surat', area: 'Varachha', pin: '395006', exp: 5, fee: 150, hourly: 280, about: 'Expert in short circuit repairs, CCTV installation, and solar panel setup. Fast response within 30 minutes.', services: ['Short Circuit Fix', 'CCTV / Security', 'Solar Panel', 'Wiring'], rating: 4.4, reviews: 15, bookings: 87, verified: true },
    { id: 's5', type: 'plumber', name: 'Mohan Lal Joshi', phone: '9765432100', shop: 'Joshi Plumbing Co.', addr: 'Varachha Road, Near Railway Crossing', city: 'Surat', area: 'Varachha', pin: '395006', exp: 5, fee: 120, hourly: 250, about: 'Drain cleaning specialist with modern hydro-jetting equipment. Affordable rates, clean work.', services: ['Drain Cleaning', 'Pipe Repair', 'Leakage Fix'], rating: 4.3, reviews: 15, bookings: 87, verified: true },
    { id: 's6', type: 'plumber', name: 'Rajesh Desai', phone: '9111222333', shop: 'Desai Water Solutions', addr: 'Satellite Road, Jodhpur Cross Road', city: 'Ahmedabad', area: 'Satellite', pin: '380015', exp: 9, fee: 175, hourly: 330, about: 'Complete plumbing solutions for society and commercial buildings. Trusted by 50+ housing societies.', services: ['Pipe Repair', 'Water Tank', 'Bathroom Fitting', 'Leakage Fix', 'Tap Fitting'], rating: 4.6, reviews: 52, bookings: 312, verified: true },
    { id: 's7', type: 'electrician', name: 'Haresh Bhavsar', phone: '9222333444', shop: 'Bhavsar Power Tech', addr: 'Navrangpura, Near Law Garden', city: 'Ahmedabad', area: 'Navrangpura', pin: '380009', exp: 14, fee: 200, hourly: 400, about: 'Senior electrician with 14 years experience. Specializes in commercial wiring and industrial electrical work.', services: ['Wiring', 'Switchboard', 'MCB / DB Panel', 'Fan / Light Fitting', 'Inverter / UPS'], rating: 4.9, reviews: 67, bookings: 445, verified: true },
    { id: 's8', type: 'plumber', name: 'Prakash Vadodaria', phone: '9333444555', shop: 'Vadodaria Plumbers', addr: 'Alkapuri, Near Bank of Baroda', city: 'Vadodara', area: 'Alkapuri', pin: '390007', exp: 6, fee: 140, hourly: 270, about: 'Trusted plumber in Alkapuri for 6 years. Specializes in bathroom renovation and geyser service.', services: ['Bathroom Fitting', 'Geyser Service', 'Tap Fitting', 'Drain Cleaning'], rating: 4.5, reviews: 29, bookings: 143, verified: true },
    { id: 's9', type: 'electrician', name: 'Nayan Parmar', phone: '9444555666', shop: 'Parmar Electricals', addr: 'Fatehgunj Main Road, Near Vadodara Railway', city: 'Vadodara', area: 'Fatehgunj', pin: '390002', exp: 7, fee: 160, hourly: 300, about: 'Reliable electrician covering all Vadodara localities. Known for neat wiring work and transparent billing.', services: ['Wiring', 'Fan / Light Fitting', 'Short Circuit Fix', 'Switchboard'], rating: 4.6, reviews: 31, bookings: 178, verified: true },
    { id: 's10', type: 'plumber', name: 'Ashwin Kathiriya', phone: '9555666777', shop: 'Kathiriya Plumbing Works', addr: 'Kalawad Road, Rajkot', city: 'Rajkot', area: 'Kalawad Road', pin: '360001', exp: 11, fee: 160, hourly: 290, about: 'Top-rated plumber in Rajkot for over a decade. Expert in bore well maintenance and overhead tank installation.', services: ['Bore Well', 'Water Tank', 'Pipe Repair', 'Leakage Fix'], rating: 4.8, reviews: 44, bookings: 267, verified: true },
    { id: 's11', type: 'beautician', name: 'Priya Sharma', phone: '9888111222', shop: 'Glow Up Studio', addr: 'Vesu, Near Apple Heights', city: 'Surat', area: 'Vesu', pin: '395007', exp: 6, fee: 500, about: 'Professional makeup artist and skincare specialist. Expert in bridal makeovers and advanced facials.', services: ['Facial / Cleanup', 'Bridal Makeup', 'Waxing / Threading'], rating: 4.9, reviews: 12, bookings: 45, verified: true },
    { id: 's12', type: 'physiotherapist', name: 'Dr. Karan Shah', phone: '9888333444', shop: 'Shah Physio Clinic', addr: 'Vastrapur, Near Mansi Circle', city: 'Ahmedabad', area: 'Vastrapur', pin: '380015', exp: 10, fee: 600, about: 'Orthopedic physiotherapist with 10 years experience. Specialist in back pain and sports injuries.', services: ['Back Pain Therapy', 'Sports Injury', 'Post-Op Recovery'], rating: 4.8, reviews: 25, bookings: 110, verified: true },
    { id: 's13', type: 'cleaner', name: 'Rahul Vagela', phone: '9888555666', shop: 'Rapid Cleaners', addr: 'Akota, Near Productivity Road', city: 'Vadodara', area: 'Akota', pin: '390020', exp: 4, fee: 350, about: 'Expert in deep cleaning and sanitization services for homes and offices. We use eco-friendly chemicals.', services: ['Deep Home Cleaning', 'Kitchen Deep Clean', 'Sofa / Carpet Spa'], rating: 4.5, reviews: 18, bookings: 76, verified: true },
    { id: 's14', type: 'ac', name: 'Vikram Singh', phone: '9777111222', shop: 'Cool Comforts', addr: 'Satellite, Near Jodhpur Cross Road', city: 'Ahmedabad', area: 'Satellite', pin: '380015', exp: 8, fee: 300, about: 'Specialist in AC servicing, gas charging and installation for all brands.', services: ['AC Service', 'Gas Charge', 'AC Installation'], rating: 4.7, reviews: 22, bookings: 89, verified: true },
    { id: 's15', type: 'appliances', name: 'Manoj Suthar', phone: '9777333444', shop: 'Home Fix Solutions', addr: 'Bhavnirpan, Near ISKCON', city: 'Rajkot', area: 'Bhavnirpan', pin: '360005', exp: 12, fee: 200, about: 'Experienced in repairing washing machines, fridges and microwaves of all major brands.', services: ['Washing Machine', 'Refrigerator Repair', 'Microwave Repair'], rating: 4.8, reviews: 35, bookings: 156, verified: true },
    { id: 's16', type: 'carpenter', name: 'Rafiq Bhai', phone: '9777555666', shop: 'Fancy Furniture Art', addr: 'Navrangpura, Near Stadium', city: 'Ahmedabad', area: 'Navrangpura', pin: '380009', exp: 15, fee: 400, about: 'Master carpenter specializing in modular kitchens and custom furniture designs.', services: ['Modular Kitchen', 'Furniture Repair', 'Custom Wardrobes'], rating: 4.9, reviews: 50, bookings: 210, verified: true },
    { id: 's17', type: 'painter', name: 'Deepak Mali', phone: '9777777888', shop: 'Rainbow Paints', addr: 'Adajan, Near Star Bazaar', city: 'Surat', area: 'Adajan', pin: '395009', exp: 5, fee: 1000, about: 'Transform your home with professional texture paints and premium wall finishes.', services: ['Home Painting', 'Wall Texture', 'Waterproofing'], rating: 4.6, reviews: 14, bookings: 42, verified: true },
    { id: 's18', type: 'pest', name: 'Sunil Jha', phone: '9777999000', shop: 'Eco-Safe Pest Control', addr: 'Gotri Road, Vadodara', city: 'Vadodara', area: 'Gotri', pin: '390021', exp: 9, fee: 800, about: 'Safe and effective pest control solutions for termites, cockroaches and bed bugs.', services: ['Termite Treatment', 'Bed Bug Treatment', 'General Pest Control'], rating: 4.5, reviews: 19, bookings: 64, verified: true },
  ];

  const reviews = {
    s1: [{ name: 'Anita Shah', stars: 5, text: 'Ramesh fixed our burst pipe in 30 minutes. Very professional!', date: '2 days ago' }, { name: 'Priya Modi', stars: 4, text: 'Good work, came on time. Quality is excellent.', date: '1 week ago' }],
    s2: [{ name: 'Kavita Patel', stars: 5, text: 'Suresh installed our geyser perfectly. Highly recommended!', date: '3 days ago' }, { name: 'Amit Desai', stars: 5, text: 'Complete bathroom renovation done beautifully.', date: '1 week ago' }],
    s3: [{ name: 'Nisha Rana', stars: 5, text: 'Dinesh rewired our entire flat. Neat work, no mess!', date: '1 day ago' }, { name: 'Ketan Shah', stars: 4, text: 'Fixed switchboard issue quickly. Reasonable rates.', date: '2 weeks ago' }],
    s4: [{ name: 'Hemant Trivedi', stars: 4, text: 'Vijay fixed a dangerous short circuit in minutes.', date: '3 days ago' }],
    s7: [{ name: 'Bhoomi Patel', stars: 5, text: 'Haresh rewired our office in 2 days. Excellent work!', date: '4 days ago' }],
  };

  DB.setPros(sample);
  DB.setRevs(reviews);
  updateHeroStats();
  toast('Sample data loaded! Try searching Surat → Katargam', 'ok');
  renderAdmin();
}

// ══════════════════════════════════════════════
//  STATS ANIMATION
// ══════════════════════════════════════════════
function updateHeroStats() {
  const pros = DB.pros();
  const jobs = pros.reduce((s, p) => s + (p.bookings || 0), 0);
  countUp('hn1', pros.length);
  countUp('hn2', jobs);
}

function countUp(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let c = 0; const step = Math.max(1, Math.ceil(target / 30));
  const t = setInterval(() => { c = Math.min(c + step, target); el.textContent = c + '+'; if (c >= target) clearInterval(t); }, 40);
}

// ══════════════════════════════════════════════
//  OVERLAY HELPERS
// ══════════════════════════════════════════════
function closeOverlay(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  if (!DB.pros().length) {
    seedSampleData();
  }
  updateHeroStats();
  setRegType('plumber');
  initRegisterButton();

  // Automatically show all professionals when the page first loads!
  setType('both');
});