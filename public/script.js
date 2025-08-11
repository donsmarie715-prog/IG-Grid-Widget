// /public/script.js

function renderSkeletons(grid) {
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const s = document.createElement('div');
    s.className = 'skeleton';
    grid.appendChild(s);
  }
}

async function loadGrid() {
  const grid = document.getElementById('grid');
  const refreshBtn = document.getElementById('refresh');

  renderSkeletons(grid);

  try {
    refreshBtn.disabled = true;

    const res = await fetch('/api/feed', { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    grid.innerHTML = '';

    if (!items.length) {
      grid.insertAdjacentHTML('beforeend',
        `<div style="grid-column:1/-1;padding:12px;color:#666">No posts found.</div>`);
      return;
    }

    items.forEach((item, i) => {
      const card  = document.createElement('div');
      card.className = 'card';

      const media = document.createElement('div');
      media.className = 'media';

      if (item.image && /^https?:\/\//i.test(item.image)) {
        const img = document.createElement('img');
        img.alt = item.title || '';
        img.decoding = 'async';
        img.loading = i < 6 ? 'eager' : 'lazy';
        if ('fetchPriority' in img) img.fetchPriority = i < 6 ? 'high' : 'low';
        img.width = 1080; img.height = 1080;
        img.src = item.image;
        img.onerror = () => {
          const ph = document.createElement('div');
          ph.className = 'skeleton';
          media.replaceChildren(ph);
        };
        media.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'skeleton';
        media.appendChild(ph);
      }

      card.appendChild(media);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('[widget] error:', err);
    grid.innerHTML = '';
    grid.insertAdjacentHTML('beforeend',
      `<div style="grid-column:1/-1;padding:12px;color:#b91c1c">Could not load posts. Check Console.</div>`);
  } finally {
    refreshBtn.disabled = false;
  }
}

document.getElementById('refresh')?.addEventListener('click', loadGrid);
document.addEventListener('DOMContentLoaded', loadGrid);
