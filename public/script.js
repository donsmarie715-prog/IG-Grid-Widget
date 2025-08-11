async function loadGrid() {
  const grid = document.getElementById('grid');
  const refreshBtn = document.getElementById('refresh');

  // show skeletons while loading / reloading
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton';
    grid.appendChild(sk);
  }

  try {
    refreshBtn.disabled = true;

    // (optional) If you ever add ?status=Published support via UI:
    // const status = new URLSearchParams(location.search).get('status') || '';
    // const url = '/api/feed?' + new URLSearchParams({ status }).toString();
    const url = '/api/feed'; // simplest: no status filter

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const items = data.items || [];

    grid.innerHTML = '';

    if (!items.length) {
      grid.insertAdjacentHTML(
        'beforebegin',
        '<div class="empty">No posts found.</div>'
      );
      return;
    }

    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'card';

      // date badge (Scheduled Date or fallback Post Date)
      let badge = '';
      if (item.date) {
        const dt = new Date(item.date);
        const label = dt.toLocaleString('en-US', { month: 'short', day: 'numeric' }); // e.g., "Jun 23"
        badge = `<div class="badge">${label}</div>`;
      }

      // image
      const media = (item.image && /^https?:\/\//i.test(item.image))
        ? `<div class="media"><img src="${item.image}" alt="${item.title || ''}" loading="lazy"></div>`
        : `<div class="skeleton"></div>`;

      div.innerHTML = `${badge}${media}`;
      grid.appendChild(div);
    });
  } catch (err) {
    console.error('[grid] error:', err);
    grid.innerHTML = '';
    grid.insertAdjacentHTML(
      'beforebegin',
      '<div class="error">Could not load posts. Open the Console for details.</div>'
    );
  } finally {
    refreshBtn.disabled = false;
  }
}

document.getElementById('refresh').addEventListener('click', () => {
  loadGrid();
});

// initial load
loadGrid();
