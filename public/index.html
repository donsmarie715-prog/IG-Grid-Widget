// /public/script.js  (compat, no optional chaining)

function formatBadge(dateStr){
  if(!dateStr) return '';
  try{
    var d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month:'short', day:'numeric' });
  }catch(e){
    return '';
  }
}

function renderSkeletons(grid) {
  grid.innerHTML = '';
  var count = 9; // 3x3
  for (var i = 0; i < count; i++) {
    var s = document.createElement('div');
    s.className = 'skeleton';
    grid.appendChild(s);
  }
}

function loadGrid(){
  var grid = document.getElementById('grid');
  var refreshBtn = document.getElementById('refresh');

  renderSkeletons(grid);

  try{
    if (refreshBtn) refreshBtn.disabled = true;

    fetch('/api/feed', { cache: 'no-store' })
      .then(function(res){
        if(!res.ok) throw new Error('API ' + res.status);
        return res.json();
      })
      .then(function(data){
        var items = (data && Array.isArray(data.items)) ? data.items : [];
        grid.innerHTML = '';

        if(!items.length){
          grid.insertAdjacentHTML(
            'beforeend',
            '<div style="grid-column:1/-1;padding:12px;color:#666;">No posts found.</div>'
          );
          return;
        }

        items.forEach(function(item, i){
          var card = document.createElement('div');
          card.className = 'card';

          var badgeText = formatBadge(item && item.date);
          if (badgeText){
            var badge = document.createElement('div');
            badge.className = 'badge';
            badge.textContent = badgeText;
            card.appendChild(badge);
          }

          var media = document.createElement('div');
          media.className = 'media';

          var url = item && item.image;
          var isHttp = url && /^https?:\/\//i.test(url);

          if (isHttp){
            var img = document.createElement('img');
            img.alt = (item && item.title) || '';
            img.decoding = 'async';
            img.loading = (i < 6 ? 'eager' : 'lazy');
            if ('fetchPriority' in img) img.fetchPriority = (i < 6 ? 'high' : 'low');
            img.width = 1080;
            img.height = 1080;
            img.src = url;
            img.onerror = function(){
              var ph = document.createElement('div');
              ph.className = 'skeleton';
              media.innerHTML = '';
              media.appendChild(ph);
            };
            media.appendChild(img);
          } else {
            var ph = document.createElement('div');
            ph.className = 'skeleton';
            media.appendChild(ph);
          }

          card.appendChild(media);
          grid.appendChild(card);
        });
      })
      .catch(function(err){
        console.error('[widget] error:', err);
        grid.innerHTML = '';
        grid.insertAdjacentHTML(
          'beforeend',
          '<div style="grid-column:1/-1;padding:12px;color:#b91c1c;">Could not load posts. Check the Console.</div>'
        );
      })
      .finally(function(){
        if (refreshBtn) refreshBtn.disabled = false;
      });

  }catch(err){
    console.error('[widget] error:', err);
    grid.innerHTML = '';
    grid.insertAdjacentHTML(
      'beforeend',
      '<div style="grid-column:1/-1;padding:12px;color:#b91c1c;">Could not load posts. Check the Console.</div>'
    );
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

var refreshEl = document.getElementById('refresh');
if (refreshEl) refreshEl.addEventListener('click', loadGrid);
document.addEventListener('DOMContentLoaded', loadGrid);
