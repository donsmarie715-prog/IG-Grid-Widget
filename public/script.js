// public/script.js

async function loadGrid() {
  const grid = document.getElementById('grid');
  const refreshBtn = document.getElementById('refresh');

  // show a quick skeleton grid on every load
  renderSkeletons(grid);

  try {
    refreshBtn.disabled = true;

    // If you later add a status dropdown with id="statusFilter", we read it safely.
    const status = document.getElementById('statusFilter')?.value || '';
    const url = '/api/feed?' + new URLSearchParams({ status }).toString();

    // no-store so Refresh really re-requests images/urls
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];

    grid.innerHTML = '';

    if (!items.length) {
      grid.insertAdjacentHTML(
        'beforeend',
        `<div style="grid-column: 1 / -1; padding:16px; color:#666;">No posts yet.</div>`
      );
      return;
    }

    // Build cards
    items.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'card';

      const media = document.createElement('div');
      media.className = 'media';

      // Only render <img> if it looks like a real URL
      if (item.image && /^https?:\/\//i.test(item.image)) {
        const img = createSmartImage(item.image, item.title || '', i < 6);
        media.appendChild(img);
      } else {
        // fallback (keeps the square)
        const ph = document.createElement('div');
        ph.className = 'skeleton';
        media.appendChild(ph);
      }

      card.appendChild(media);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('[widget] load error:', err);
    grid.innerHTML = '';
    grid.insertAdjacentHTML(
      'beforeend',
      `<div style="grid-column: 1 / -1; padding:16px; color:#c00;">Could not load posts. Check Console for details.</div>`
    );
  } finally {
    refreshBtn.disabled = false;
  }
}

/* ---------- helpers ---------- */

// quick placeholders sized like the final cards (square)
function renderSkeletons(grid) {
  grid.innerHTML = '';
  const count = Math.min(12, Math.max(6, Math.ceil(grid.clientWidth / 120) * 3));
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'skeleton';
    grid.appendChild(s);
  }
}

// create an img optimized for a square grid
function createSmartImage(src, alt, eager = false) {
  const img = document.createElement('img');
  img.alt = alt || '';
  img.decoding = 'async';
  img.loading = eager ? 'eager' : 'lazy';
  if ('fetchPriority' in img) img.fetchPriority = eager ? 'high' : 'low';

  // Let the browser size it perfectly for our square grid
  // If your image host supports transforms, you could add a width param here.
  img.src = src;

  // Prevent layout shift: give the browser a square aspect hint
  // (width/height don't change the final layout because the container is square)
  img.width = 1080;
  img.height = 1080;

  // Fallback handler
  img.onerror = () => {
    img.replaceWith(Object.assign(document.createElement('div'), { className: 'skeleton' }));
  };

  return img;
}

// wire up refresh + first load
document.getElementById('refresh')?.addEventListener('click', () => loadGrid());
document.addEventListener('DOMContentLoaded', loadGrid);
