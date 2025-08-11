// Read initial filters from URL
let selectedPlatform = new URLSearchParams(window.location.search).get('platform') || '';
let selectedStatus   = new URLSearchParams(window.location.search).get('status')   || '';

const statusEl = document.getElementById('statusFilter');
if (statusEl) statusEl.value = selectedStatus;

// Activate the right platform button on load
document.querySelectorAll('.filter').forEach(btn => {
  if ((btn.dataset.platform || '') === selectedPlatform) btn.classList.add('active');
});

// Clicking a platform icon
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPlatform = btn.dataset.platform || '';
    syncUrl();
    loadGrid(true); // bust cache
  });
});

// Status dropdown
if (statusEl) {
  statusEl.addEventListener('change', () => {
    selectedStatus = statusEl.value || '';
    syncUrl();
    loadGrid(true);
  });
}

// Refresh
const refreshBtn = document.getElementById('refresh');
if (refreshBtn) refreshBtn.addEventListener('click', () => loadGrid(true));

// Keep the URL in sync so embeds can use ?status=Approved&platform=Instagram
function syncUrl() {
  const p = new URLSearchParams();
  if (selectedStatus)   p.set('status', selectedStatus);
  if (selectedPlatform) p.set('platform', selectedPlatform);
  history.replaceState(null, '', `${location.pathname}${p.toString() ? `?${p}` : ''}`);
}

async function loadGrid(bust = false) {
  const p = new URLSearchParams();
  if (selectedStatus)   p.set('status', selectedStatus);
  if (selectedPlatform) p.set('platform', selectedPlatform);
  if (bust)             p.set('t', Date.now()); // cache-buster

  const res  = await fetch(`/api/feed?${p.toString()}`);
  const data = await res.json();
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  (data.items || []).forEach(item => {
    const div = document.createElement('div');
    div.className = 'card';

    if (item.image && item.image.startsWith('http')) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title || '';
      div.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.textContent = 'No Image';
      Object.assign(ph.style, {
        height: '150px', display:'grid', placeItems:'center',
        background:'#eee', borderRadius:'10px'
      });
      div.appendChild(ph);
    }

    if (item.status) {
      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = item.status;
      div.appendChild(badge);
    }

    grid.appendChild(div);
  });
}

loadGrid(); // initial load
