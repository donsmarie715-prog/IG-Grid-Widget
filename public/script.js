// /public/script.js

function renderSkeletons(grid) {
  grid.innerHTML = '';
  var count = 6;
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
          grid.insertAdjacentHTML('beforebegin', '<div class="empty">No posts found.</div>');
          return;
        }

        items.forEach(function(item){
          var card = document.createElement('div');
          card.className = 'card';

          var url = item && item.image;
          var ok = url && /^https?:\/\//i.test(url);

          if (ok){
            var img = document.createElement('img');
            img.className = 'media';
            img.src = url;
            img.alt = (item && item.title) || '';
            img.decoding = 'async';
            img.loading = 'lazy';
            img.onerror = function(){
              var ph = document.createElement('div');
              ph.className = 'skeleton';
              card.innerHTML = '';
              card.appendChild(ph);
            };
            card.appendChild(img);
          } else {
            var ph = document.createElement('div');
            ph.className = 'skeleton';
            card.appendChild(ph);
          }

          if (item && item.status){
            var badge = document.createElement('div');
            badge.className = 'badge';
            badge.textContent = item.status;
            card.appendChild(badge);
          }

          grid.appendChild(card);
        });
      })
      .catch(function(err){
        console.error('[widget] error:', err);
        grid.innerHTML = '';
        grid.insertAdjacentHTML('beforebegin', '<div class="error">Could not load posts. Check the console.</div>');
      })
      .finally(function(){
        if (refreshBtn) refreshBtn.disabled = false;
      });

  }catch(err){
    console.error('[widget] error:', err);
    grid.innerHTML = '';
    grid.insertAdjacentHTML('beforebegin', '<div class="error">Could not load posts. Check the console.</div>');
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

var refreshEl = document.getElementById('refresh');
if (refreshEl) refreshEl.addEventListener('click', loadGrid);
document.addEventListener('DOMContentLoaded', loadGrid);
