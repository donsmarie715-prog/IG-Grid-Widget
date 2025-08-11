document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const statusFilter = document.getElementById('statusFilter');
  const refreshBtn = document.getElementById('refreshBtn');
  const platformBar = document.getElementById('platformBar');

  // Load grid items from API
  async function loadGrid() {
    grid.innerHTML = ''; // clear existing

    // Show skeleton loaders
    for (let i = 0; i < 6; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton';
      grid.appendChild(skeleton);
    }

    try {
      // Only filter by status (no platform filtering)
      const statusEl = document.querySelector('#statusFilter');
      const status   = statusEl ? statusEl.value : '';
      const url = '/api/feed?' + new URLSearchParams({ status }).toString();

      const res = await fetch(url);
      const data = await res.json();

      grid.innerHTML = ''; // clear skeletons

      if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
          const card = document.createElement('div');
          card.className = 'card';

          if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.title || '';
            card.appendChild(img);
          } else {
            const noImg = document.createElement('div');
            noImg.className = 'no-image';
            noImg.textContent = 'No image';
            card.appendChild(noImg);
          }

          grid.appendChild(card);
        });
      } else {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'No posts found.';
        grid.appendChild(emptyMsg);
      }
    } catch (err) {
      console.error(err);
      grid.innerHTML = '<p class="error">Failed to load posts.</p>';
    }
  }

  // Handle status filter change
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      loadGrid();
    });
  }

  // Handle platform icon clicks (purely decorative now)
  if (platformBar) {
    platformBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.platform-btn');
      if (!btn) return;
      document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadGrid(); // reload grid without filtering
    });
  }

  // Handle refresh button click
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadGrid();
    });
  }

  // Initial load
  loadGrid();
});
