async function loadGrid() {
  const gridEl = document.getElementById('grid');

  // pick active platform button ('' = any)
  const activeBtn = document.querySelector('.platform-btn.active');
  const platform = activeBtn ? activeBtn.dataset.platform || '' : '';

  // status from dropdown
  const status = document.getElementById('statusFilter')?.value || '';

  const url = '/api/feed?' + new URLSearchParams({ status, platform });

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    const items = data.items || [];

    gridEl.innerHTML = '';

    if (!items.length) {
      gridEl.insertAdjacentHTML('beforeend',
        '<div class="empty">No posts match the current filters.</div>');
      return;
    }

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'card';

      if (item.image && /^https?:\/\//i.test(item.image)) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title || '';
        div.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'skeleton';
        div.appendChild(ph);
      }

      if (item.status) {
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = item.status;
        div.appendChild(badge);
      }

      gridEl.appendChild(div);
    });
  } catch (err) {
    console.error('[widget] fetch error:', err);
    gridEl.innerHTML = '<div class="error">Could not load posts (check Console).</div>';
  }
}

/* -------- interactions -------- */
document.getElementById('refreshBtn')?.addEventListener('click', loadGrid);
document.getElementById('statusFilter')?.addEventListener('change', loadGrid);

// segmented platform buttons
document.querySelectorAll('.platform-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadGrid();
  });
});

// initial load
loadGrid();
