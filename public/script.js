/* ---------- tiny helpers ---------- */

function formatBadge(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) {
    return '';
  }
}

function renderSkeletons(grid, count) {
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'skeleton';
    grid.appendChild(s);
  }
}

/* ---------- main loader ---------- */

async function loadGrid() {
  const grid = document.getElementById('grid');
  const refreshBtn = document.getElementById('refresh');

  // show a quick 3x3 skeleton wall
  renderSkeletons(grid, 9);

  try {
    if (refreshBtn) refreshBtn.disabled = true;

    // no-store so the “Refresh” button really pulls fresh URLs
    const res = await fetch('/api/feed', { cache: 'no-store' });
    if (!res.ok) throw new Error('API ' + res.status);

    const data = await res.json();
    const items = Array.isArray(data && data.items) ? data.items : [];

    grid.innerHTML = '';

    if (!items.length) {
      grid.insertAdjacentHTML(
        'beforeend',
        '<div style="grid-column:1/-1;padding:12px;color:#666">No posts found.</div>'
      );
      return;
    }

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'card';

      // date badge (top-left)
      const badgeText = formatBadge(item.date);
      if (badgeText) {
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = badgeText;
        card.appendChild(badge);
      }

      // media
      const media = document.createElement('div');
      media.className = 'media';

      if (item.image && /^https?:\/\//i.test(item.image)) {
        const img = document.createElement('img');
        img.alt = item.title || '';
        img.decoding = 'async';
        img.loading = idx < 6 ? 'eager' : 'lazy';
        if ('fetchPriority' in img) img.fetchPriority = idx < 6 ? 'high' : 'low';

        // aspect hint so layout never jumps
        img.width = 1080;
        img.height = 1080;

        img.src = item.image;
        img.onerror = function () {
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
    console.error('[widget] load error:', err);
    grid.innerHTML = '';
    grid.insertAdjacentHTML(
      'beforeend',
      '<div style="grid-column:1/-1;padding:12px;color:#b91c1c">Could not load posts. Check the console.</div>'
    );
  } finally {
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

/* wire up */
document.getElementById('refresh')?.addEventListener('click', loadGrid);
document.addEventListener('DOMContentLoaded', loadGrid);
