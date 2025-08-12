// /public/script.js
function formatBadge(dateStr){
  if(!dateStr) return '';
  try{
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month:'short', day:'numeric' });
  }catch{
    return '';
  }
}

function renderSkeletons(grid) {
  grid.innerHTML = '';
  const count = 9; // quick 3x3 on first paint
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'skeleton';
    grid.appendChild(s);
  }
}

async function loadGrid(){
  const grid = document.getElementById('grid');
  const refreshBtn = document.getElementById('refresh');

  renderSkeletons(grid);

  try{
    refreshBtn.disabled = true;

    const res = await fetch('/api/feed', { cache: 'no-store' });
    if(!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];

    grid.innerHTML = '';

    if(!items.length){
      grid.insertAdjacentHTML(
        'beforeend',
        `<div style="grid-column:1/-1; padding:10px; color:#666">No posts found.</div>`
      );
      return;
    }

    items.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'card';

      const badgeText = formatBadge(item.date);
      if (badgeText){
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = badgeText;
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
        img.width = 1080;   // aspect hint (square)
        img.height = 1080;
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
  }catch(err){
    console.error('[widget] error:', err);
    grid.innerHTML = '';
    grid.insertAdjacentHTML(
      'beforeend',
      `<div style="grid-column:1/-1; padding:10px; color:#b91c1c">Could not load posts. Check the console.</div>`
    );
  }finally{
    refreshBtn.disabled = false;
  }
}

document.getElementById('refresh')?.addEventListener('click', loadGrid);
document.addEventListener('DOMContentLoaded', loadGrid);
