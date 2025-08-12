async function loadGrid() {
  const grid = document.getElementById('grid');
  if (!grid) { console.error('Missing #grid element'); return; }

  grid.innerHTML = '<div style="padding:20px;opacity:.7">Loading posts…</div>';

  const params = new URLSearchParams(window.location.search);
  const status   = params.get('status')   || document.getElementById('statusFilter')?.value || '';
  const platform = params.get('platform') || document.getElementById('platformFilter')?.value || '';

  const apiParams = new URLSearchParams();
  if (status)   apiParams.set('status', status);
  if (platform) apiParams.set('platform', platform);

  const url = `/api/feed${apiParams.toString() ? `?${apiParams.toString()}` : ''}`;
  console.log('[widget] fetching:', url);

  try {
    const res = await fetch(url, { cache: 'no-store' });
    console.log('[widget] /api/feed status:', res.status);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    console.log('[widget] data:', data);

    const items = Array.isArray(data.items) ? data.items : [];
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = '<div style="padding:20px;opacity:.7">No posts found.</div>';
      return;
    }

    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'card';

      if (item.image && typeof item.image === 'string' && item.image.startsWith('http')) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.onerror = () => {
          console.warn('[widget] image failed, using placeholder:', item.image);
          img.remove();
          div.appendChild(makePlaceholder());
        };
        div.appendChild(img);
      } else {
        console.warn('[widget] missing/invalid image for item:', item);
        div.appendChild(makePlaceholder());
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
    console.error('[widget] loadGrid error:', err);
    grid.innerHTML =
      '<div style="padding:20px;color:#b00">Sorry, something went wrong loading posts.</div>';
  }
}

function makePlaceholder() {
  const ph = document.createElement('div');
  ph.textContent = 'No Image';
  ph.style.height = '150px';
  ph.style.display = 'flex';
  ph.style.alignItems = 'center';
  ph.style.justifyContent = 'center';
  ph.style.background = '#eee';
  ph.style.color = '#666';
  ph.style.fontSize = '14px';
  ph.style.borderRadius = '6px';
  return ph;
}

function wireControls() {
  document.getElementById('refresh')?.addEventListener('click', loadGrid);
  document.getElementById('statusFilter')?.addEventListener('change', loadGrid);
  document.getElementById('platformFilter')?.addEventListener('change', loadGrid);
}

wireControls();
loadGrid();
