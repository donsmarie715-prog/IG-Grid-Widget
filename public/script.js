function formatBadge(dateStr){
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

async function loadGrid(){
  const grid = document.getElementById('grid');
  const refreshBtn = document.getElementById('refresh');

  // skeletons
  grid.innerHTML = new Array(9).fill('<div class="skeleton"></div>').join('');

  try{
    refreshBtn.disabled = true;

    const res = await fetch('/api/feed', { cache: 'no-store' });
    if(!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];

    grid.innerHTML = '';

    if(!items.length){
      grid.innerHTML = '<div style="padding:10px;color:#666">No posts found.</div>';
      return;
    }

    items.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'card';

      const label = formatBadge(item.date);
      if (label) {
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = label;
        card.appendChild(badge);
      }

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
        img.onerror = () => { media.innerHTML = '<div class="skeleton"></div>'; };
        media.appendChild(img);
      } else {
        media.innerHTML = '<div class="skeleton"></div>';
      }

      card.appendChild(media);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('[widget] error:', err);
    grid.innerHTML = '<div style="padding:10px;color:#b91c1c">Could not load posts. Check the Console.</div>';
  } finally {
    refreshBtn.disabled = false;
  }
}

document.getElementById('refresh')?.addEventListener('click', loadGrid);
document.addEventListener('DOMContentLoaded', loadGrid);
