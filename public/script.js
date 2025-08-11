// /public/script.js
async function loadGrid() {
  const grid = document.getElementById('grid');
  const refreshBtn = document.getElementById('refresh');

  // show skeletons on (re)load
  grid.innerHTML = `
    <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
    <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
  `;

  try {
    refreshBtn.disabled = true;

    // no-store → proper Refresh behavior
    const res = await fetch('/api/feed', { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    const items = data.items || [];

    grid.innerHTML = '';

    if (!items.length) {
      grid.insertAdjacentHTML('beforebegin', '<div class="empty">No posts found.</div>');
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';

      if (item.image && /^https?:\/\//i.test(item.image)) {
        const img = document.createElement('img');
        img.className = 'media';
        img.src = item.image;
        img.alt = item.title || '';
        card.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'skeleton';
        card.appendChild(ph);
      }

      if (item.status) {
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = item.status;
        card.appendChild(badge);
      }

      grid.appendChild(card);
    });
  } catch (err) {
    console.error('[widget] error:', err);
    grid.innerHTML = '';
    grid.insertAdjacentHTML('beforebegin', '<div class="error">Could not load posts. Check the console.</div>');
  } finally {
    refreshBtn.disabled = false;
  }
}

document.getElementById('refresh').addEventListener('click', loadGrid);
loadGrid();
