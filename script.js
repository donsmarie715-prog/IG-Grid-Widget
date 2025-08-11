// Helper: tiny sleep for nice spinner feel
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function loadGrid() {
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const refreshBtn = document.getElementById('refreshBtn');

  // read UI filters
  const status = document.getElementById('statusFilter').value || '';
  const activeIcon = document.querySelector('.icon-btn.active');
  const platform = activeIcon ? (activeIcon.dataset.platform || '') : '';

  // start refresh animation (just visual)
  refreshBtn.classList.add('spinning');

  // build URL to your API route
  const url = new URL('/api/feed', window.location.origin);
  if (status)   url.searchParams.set('status', status);
  if (platform) url.searchParams.set('platform', platform);

  // fetch data
  let data;
  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    data = await res.json();
  } catch (e) {
    console.error('Feed error', e);
    data = { items: [] };
  }

  // small delay so the refresh spin is visible
  await wait(150);

  refreshBtn.classList.remove('spinning');

  // render
  grid.innerHTML = '';
  const items = Array.isArray(data.items) ? data.items : [];

  if (!items.length) {
    empty.style.display = 'block';
    return;
  } else {
    empty.style.display = 'none';
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    // image
    if (item.image && typeof item.image === 'string' && item.image.startsWith('http')) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title || '';
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.onerror = () => {
        // fallback if URL expired
        card.innerHTML = `<div class="placeholder">No image</div>`;
      };
      card.appendChild(img);
    } else {
      card.innerHTML = `<div class="placeholder">No image</div>`;
    }

    // status badge
    if (item.status) {
      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = item.status;
      card.appendChild(badge);
    }

    grid.appendChild(card);
  });
}

// wire up controls
function setupControls() {
  // platform icons
  const bar = document.getElementById('platformBar');
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.icon-btn');
    if (!btn) return;
    bar.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadGrid();
  });

  // status dropdown
  document.getElementById('statusFilter').addEventListener('change', loadGrid);

  // refresh button
  document.getElementById('refreshBtn').addEventListener('click', loadGrid);
}

// init
setupControls();
loadGrid();
