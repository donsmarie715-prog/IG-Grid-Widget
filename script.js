async function loadGrid(cacheBust = false) {
  const grid = document.getElementById('grid');
  const msg  = document.getElementById('msg');
  msg.style.display = 'none';
  grid.innerHTML = '<div class="spinner"></div>';

  // read current filters
  const status   = document.getElementById('statusFilter')?.value || '';
  const activeBtn = document.querySelector('.platform .btn.active');
  const platform = activeBtn ? (activeBtn.dataset.platform || '') : '';

  // build URL
  const params = new URLSearchParams({ status, platform });
  if (cacheBust) params.set('_ts', Date.now()); // defeat any CDN cache
  const url = `/api/feed?${params.toString()}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    const items = (data && data.items) ? data.items : [];

    if (!items.length) {
      grid.innerHTML = '';
      msg.textContent = 'No posts match your filters yet.';
      msg.style.display = 'block';
      return;
    }

    // render cards
    grid.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'card';

      const imgOk = item.image && String(item.image).startsWith('http');
      if (imgOk) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title || 'Post';
        div.appendChild(img);
      } else {
        div.innerHTML = '<div class="empty">No image</div>';
      }

      if (item.status) {
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = item.status;
        div.appendChild(badge);
      }

      grid.appendChild(div);
    });

  } catch (err) {
    console.error('Fetch error', err);
    grid.innerHTML = '';
    msg.textContent = 'Could not load data. Open the console or visit /api/feed to check the error.';
    msg.style.display = 'block';
  }
}

// platform buttons
document.querySelectorAll('.platform .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.platform .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadGrid();
  });
});

// dropdown & refresh
document.getElementById('statusFilter')?.addEventListener('change', () => loadGrid());
document.getElementById('refresh')?.addEventListener('click', () => loadGrid(true));

// first paint
loadGrid();
