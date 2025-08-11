const gridContainer = document.getElementById('grid');
const refreshButton = document.getElementById('refresh-button');
const statusEl = document.getElementById('status');

const API_URL = '/api/feed';

// Load and display the grid
async function loadGrid() {
  try {
    // Force fresh data on initial load (no caching)
    console.log('[widget] Fetching grid data from', API_URL);
    const res = await fetch(API_URL, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      gridContainer.innerHTML = '<p>No posts found.</p>';
      return;
    }

    gridContainer.innerHTML = ''; // Clear skeletons or old data

    data.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'grid-item';

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title || '';
      img.loading = 'lazy';

      const caption = document.createElement('div');
      caption.className = 'caption';
      caption.textContent = item.title || '';

      card.appendChild(img);
      card.appendChild(caption);
      gridContainer.appendChild(card);
    });

    statusEl.textContent = `Loaded ${data.items.length} post${data.items.length !== 1 ? 's' : ''}`;
  } catch (err) {
    console.error('[widget] Error loading grid:', err);
    gridContainer.innerHTML = '<p class="error">Failed to load posts.</p>';
    statusEl.textContent = 'Error loading posts';
  }
}

// Refresh button fetches fresh data
refreshButton.addEventListener('click', async () => {
  statusEl.textContent = 'Refreshing...';
  gridContainer.innerHTML = '<div class="skeleton-grid"></div>'; // Optional skeleton
  await loadGrid();
});

// Run on page load
document.addEventListener('DOMContentLoaded', loadGrid);

