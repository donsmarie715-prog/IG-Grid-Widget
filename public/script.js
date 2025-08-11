async function loadGrid() {
  const grid = document.getElementById('grid');
  const refreshBtn = document.getElementById('refresh');

  // show skeletons whenever we (re)load
  grid.innerHTML = `
    <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
    <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
  `;

  try {
    refreshBtn.disabled = true;

    const status = document.getElementById('statusFilter')?.value || '';
    const url = '/api/feed?' + new URLSearchParams({ status }).toString();

    // no-store so “Refresh” really refreshes
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    const items = data.items || [];

    grid.innerHTML = '';

    if (!items.length) {
      grid.insertAdjacentHTML('beforebegin', '<div class="empty">No posts found.</div>');
      return;
    }

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'card';

      const media = document.createElement('div');
      media.className = 'media';

      // only render <img> for real URLs
      if (item.image && /^https?:\/\//i.test(item.image)) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title || '';
        media.appendChild(img);
      }
      div.appendChild(media);

      if (item.status) {
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = item.status;
        div.appendChild(badge);
      }

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = item.title || '';
      div.appendChild(title);

      grid.appendChild(div);
    });
  } catch (err) {
    console.error('[widget] load error:', err);
    grid.innerHTML = '';
    grid.insertAdjacentHTML('beforebegin',
      '<div class="error">Could not load posts. Open the Console for details.</div>');
  } finally {
    document.getElementById('refresh').disabled = false;
  }
}

document.getElementById('refresh').addEventListener('click', loadGrid);
document.getElementById('statusFilter').addEventListener('change', loadGrid);

// initial load
loadGrid();
