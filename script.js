async function loadGrid() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status') || document.getElementById('statusFilter').value || '';
  const platform = params.get('platform') || document.getElementById('platformFilter').value || '';

  const url = `/api/feed?${new URLSearchParams({ status, platform })}`;
  const res = await fetch(url);
  const data = await res.json();
  const items = data.items || [];

  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card';

    const img = document.createElement('img');
    img.src = item.image || '';
    img.alt = item.title;
    div.appendChild(img);

    if (item.status) {
      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = item.status;
      div.appendChild(badge);
    }

    grid.appendChild(div);
  });
}

document.getElementById('refresh').addEventListener('click', loadGrid);
document.getElementById('statusFilter').addEventListener('change', loadGrid);
document.getElementById('platformFilter').addEventListener('change', loadGrid);
loadGrid();
