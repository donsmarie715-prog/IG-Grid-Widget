// --- Tiny helpers -----------------------------------------------------------
const $  = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => [...el.querySelectorAll(q)];

const fmtDate = (iso) => {
  if (!iso) return '';
  // support "2025-08-11" or ISO
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const m = d.toLocaleString(undefined, { month:'short' });
  const day = d.toLocaleString(undefined, { day:'2-digit' });
  return `${m} ${day}`;
};

const setURLParam = (key, val) => {
  const u = new URL(window.location);
  if (!val) u.searchParams.delete(key);
  else u.searchParams.set(key, val);
  history.replaceState(null, '', u);
};

const getParam = (k) => new URLSearchParams(location.search).get(k) || '';

// --- UI elements ------------------------------------------------------------
const grid          = $('#grid');
const statusSel     = $('#statusFilter');
const platformGroup = $('#platformGroup');
const refreshBtn    = $('#refreshBtn');

// Restore UI from URL params (so shareable)
(() => {
  const p = getParam('platform');
  if (p) {
    const btn = $(`.platform-btn[data-platform="${CSS.escape(p)}"]`, platformGroup);
    if (btn) {
      $$('.platform-btn', platformGroup).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  }
  const s = getParam('status');
  if (s) statusSel.value = s;
})();

// --- Fetch + render ---------------------------------------------------------
async function loadGrid({ bustCache = false } = {}) {
  // skeletons while loading
  grid.innerHTML = '';
  for (let i=0;i<6;i++) grid.insertAdjacentHTML('beforeend','<div class="skeleton"></div>');

  // read filters (URL first, then active)
  const status   = statusSel.value || '';
  const platform = $('.platform-btn.active', platformGroup)?.dataset.platform || '';

  setURLParam('status', status);
  setURLParam('platform', platform);

  const qs = new URLSearchParams({ status, platform });
  const url = `/api/feed?${qs.toString()}`;

  try {
    const res = await fetch(url, { cache: bustCache ? 'no-store' : 'default' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = data.items || [];

    grid.innerHTML = '';

    if (!items.length) {
      grid.insertAdjacentHTML('beforebegin', `<div class="empty">No posts match your filters.</div>`);
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';

      if (item.image && /^https?:\/\//i.test(item.image)) {
        const img = new Image();
        img.src = item.image;
        img.alt = item.title || '';
        card.appendChild(img);
      } else {
        const sk = document.createElement('div');
        sk.className = 'skeleton';
        card.appendChild(sk);
      }

      // date badge (top-left)
      const d = fmtDate(item.date);
      if (d) {
        const badge = document.createElement('div');
        badge.className = 'date';
        badge.textContent = d;
        card.appendChild(badge);
      }

      // status pill (bottom-left)
      if (item.status) {
        const pill = document.createElement('div');
        pill.className = 'pill';
        pill.textContent = item.status;
        card.appendChild(pill);
      }

      // Optional title under image (toggle if you like)
      if (item.title) {
        const t = document.createElement('div');
        t.className = 'title';
        t.textContent = item.title;
        card.appendChild(t);
      }

      grid.appendChild(card);
    });

  } catch (err) {
    console.error('[widget] fetch error:', err);
    grid.innerHTML = '';
    grid.insertAdjacentHTML('beforebegin', `<div class="error">Could not load posts. Open the console for details.</div>`);
  }
}

// --- Events -----------------------------------------------------------------
$$('.platform-btn', platformGroup).forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.platform-btn', platformGroup).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadGrid();
  });
});

statusSel.addEventListener('change', () => loadGrid());

refreshBtn.addEventListener('click', () => loadGrid({ bustCache:true }));

// Initial load
loadGrid();
