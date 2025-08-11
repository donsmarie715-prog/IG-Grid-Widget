// ------------------------------
// Instagram Grid Widget script
// ------------------------------

async function loadGrid() {
  const grid = document.getElementById('grid');
  if (!grid) {
    console.error('Missing #grid element in the page.');
    return;
  }

  // Show a loading message each time we (re)load
  grid.innerHTML = '<div style="padding:20px;opacity:.7">Loading posts…</div>';

  // Read filters from query-string or (optionally) inputs on the page
  const params = new URLSearchParams(window.location.search);
  const status =
    params.get('status') || document.getElementById('statusFilter')?.value || '';
  const platform =
    params.get('platform') || document.getElementById('platformFilter')?.value || '';

  // Build API URL with only the filters that are set
  const apiParams = new URLSearchParams();
  if (status) apiParams.set('status', status);
  if (platform) apiParams.set('platform', platform);

  const url = `/api/feed${apiParams.toString() ? `?${apiParams.toString()}` : ''}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();

    const items = Array.isArray(data.items) ? data.items : [];
    grid.innerHTML = ''; // clear loading text

    if (items.length === 0) {
      grid.innerHTML = '<div style="padding:20px;opacity:.7">No posts found.</div>';
      return;
    }

    items.forEach((item) => {
      // Card wrapper
      const div = document.createElement('div');
      div.className = 'card';

      // Image (or placeholder if none/invalid)
      if (item.image && typeof item.image === 'string' && item.image.startsWith('http')) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title || '';
        img.loading = 'lazy';
        img.decoding = 'async';

        // If the image fails to load, show a fallback
        img.onerror = () => {
          img.remove();
          div.appendChild(makePlaceholder());
        };

        div.appendChild(img);
      } else {
        div.appendChild(makePlaceholder());
      }

      // Optional: title / caption block (uncomment if you want text under the image)
      // const meta = document.createElement('div');
      // meta.className = 'meta';
      // meta.textContent = item.title || '';
      // div.appendChild(meta);

      // Status badge, if present (e.g., "To Start", "Approved")
      if (item.status) {
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = item.status;
        div.appendChild(badge);
      }

      grid.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML =
      '<div style="padding:20px;color:#b00">Sorry, something went wrong loading posts.</div>';
  }
}

// Helper for “No Image” placeholder box
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

// Optional controls: wire up refresh and filter inputs if they exist
function wireControls() {
  const refreshBtn = document.getElementById('refresh');
  if (refreshBtn) refreshBtn.addEventListener('click', loadGrid);

  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) statusFilter.addEventListener('change', loadGrid);

  const platformFilter = document.getElementById('platformFilter');
  if (platformFilter) platformFilter.addEventListener('change', loadGrid);
}

// Kick things off
wireControls();
loadGrid();
