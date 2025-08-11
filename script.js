/* global window, document, fetch */
(function () {
  function qs(sel)  { return document.querySelector(sel); }
  function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

  async function loadGrid() {
    const grid = qs('#grid');
    if (!grid) return;

    // Show skeletons while (re)loading
    grid.innerHTML =
      '<div class="skeleton"></div>'.repeat(6);

    try {
      // Read filters safely
      const statusEl   = qs('#statusFilter');
      const activePlat = qs('.platform-btn.active');
      const status     = statusEl ? statusEl.value : '';
      const platform   = activePlat ? (activePlat.dataset.platform || '') : '';

      const url = '/api/feed?' + new URLSearchParams({ status, platform }).toString();

      // Don’t cache the JSON – signed S3 URLs expire
      const res  = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('API ' + res.status);
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];

      grid.innerHTML = '';

      if (!items.length) {
        grid.insertAdjacentHTML('beforebegin', '<div class="empty">No posts found for these filters.</div>');
        return;
      }

      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';

        // Only create <img> if the URL looks real
        if (item.image && /^https?:\/\//i.test(item.image)) {
          const img = document.createElement('img');
          img.src = item.image;
          img.alt = item.title || '';
          // if an image fails, show a neutral placeholder
          img.onerror = () => { div.innerHTML = '<div class="skeleton"></div>'; };
          div.appendChild(img);
        } else {
          div.innerHTML = '<div class="skeleton"></div>';
        }

        if (item.status) {
          const badge = document.createElement('div');
          badge.className = 'badge';
          badge.textContent = item.status;
          div.appendChild(badge);
        }

        if (item.title) {
          const t = document.createElement('div');
          t.className = 'title';
          t.textContent = item.title;
          div.appendChild(t);
        }

        grid.appendChild(div);
      });
    } catch (err) {
      console.error('[widget] load error:', err);
      grid.innerHTML = '';
      grid.insertAdjacentHTML('beforebegin',
        '<div class="error">Could not load posts. Open the browser Console → look for errors from <code>/api/feed</code>.</div>');
    }
  }

  // Platform buttons
  function wireUI() {
    const bar = qs('#platformBar');
    if (bar) {
      bar.addEventListener('click', (e) => {
        const btn = e.target.closest('.platform-btn');
        if (!btn) return;
        qsa('.platform-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadGrid();
      });
    }
    const statusEl = qs('#statusFilter');
    if (statusEl) statusEl.addEventListener('change', loadGrid);

    const refreshEl = qs('#refreshBtn');
    if (refreshEl) refreshEl.addEventListener('click', loadGrid);
  }

  // Make sure DOM exists first
  window.addEventListener('DOMContentLoaded', () => {
    wireUI();
    loadGrid();
  });
})();
