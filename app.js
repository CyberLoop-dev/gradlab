(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const st = { type: 'linear', angle: 135, stops: [{ c: '#4cc9f0', p: 0 }, { c: '#4361ee', p: 100 }] };
  const PRESETS = [
    ['Ocean', 135, [['#4cc9f0', 0], ['#4361ee', 100]]],
    ['Sunset', 160, [['#ff9a44', 0], ['#fc6076', 100]]],
    ['Aurora', 120, [['#00c9a7', 0], ['#845ec2', 100]]],
    ['Peach', 90, [['#ffecd2', 0], ['#fcb69f', 100]]],
    ['Night', 200, [['#0f2027', 0], ['#203a43', 50], ['#2c5364', 100]]],
    ['Candy', 45, [['#ff6bcb', 0], ['#ffd166', 100]]]
  ];

  function gradient() {
    const s = st.stops.slice().sort((a, b) => a.p - b.p).map((x) => x.c + ' ' + x.p + '%').join(', ');
    if (st.type === 'linear') return 'linear-gradient(' + st.angle + 'deg, ' + s + ')';
    if (st.type === 'radial') return 'radial-gradient(circle at center, ' + s + ')';
    return 'conic-gradient(from ' + st.angle + 'deg at 50% 50%, ' + s + ')';
  }
  function paint() {
    const g = gradient();
    $('#preview').style.background = g;
    $('#css').textContent = 'background: ' + g + ';';
    $('#angle-wrap').hidden = st.type === 'radial';
    $('#angle-out').textContent = st.angle + 'deg';
    document.querySelectorAll('#types button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.t === st.type)));
    $('#add').disabled = st.stops.length >= 6;
  }
  function stops() {
    const box = $('#stops'); box.textContent = '';
    st.stops.forEach((s, i) => {
      const row = document.createElement('div'); row.className = 'stop';
      const c = document.createElement('input'); c.type = 'color'; c.value = s.c; c.setAttribute('aria-label', 'Color ' + (i + 1));
      const r = document.createElement('input'); r.type = 'range'; r.min = 0; r.max = 100; r.value = s.p; r.setAttribute('aria-label', 'Position ' + (i + 1));
      const o = document.createElement('output'); o.textContent = s.p + '%';
      const x = document.createElement('button'); x.type = 'button'; x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Remove stop ' + (i + 1)); x.disabled = st.stops.length <= 2;
      c.addEventListener('input', () => { s.c = c.value; paint(); });
      r.addEventListener('input', () => { s.p = +r.value; o.textContent = s.p + '%'; paint(); });
      x.addEventListener('click', () => { st.stops.splice(i, 1); stops(); paint(); });
      row.append(c, r, o, x); box.appendChild(row);
    });
  }
  const toast = (t) => { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.id); toast.id = setTimeout(() => el.classList.remove('show'), 1600); };
  const rnd = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');

  document.querySelectorAll('#types button').forEach((b) => b.addEventListener('click', () => { st.type = b.dataset.t; paint(); }));
  $('#angle').addEventListener('input', (e) => { st.angle = +e.target.value; paint(); });
  $('#add').addEventListener('click', () => { st.stops.push({ c: rnd(), p: 50 }); stops(); paint(); });
  $('#random').addEventListener('click', () => {
    const n = 2 + Math.floor(Math.random() * 3);
    st.stops = Array.from({ length: n }, (_, i) => ({ c: rnd(), p: Math.round((i / (n - 1)) * 100) }));
    st.angle = Math.floor(Math.random() * 360); $('#angle').value = st.angle; stops(); paint();
  });
  $('#copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#css').textContent); toast('CSS copied'); } catch { toast('Select the code and press Ctrl+C'); }
  });
  PRESETS.forEach(([name, angle, list]) => {
    const b = document.createElement('button'); b.type = 'button'; b.title = name; b.setAttribute('aria-label', 'Preset ' + name);
    b.style.background = 'linear-gradient(135deg, ' + list.map(([c, p]) => c + ' ' + p + '%').join(', ') + ')';
    b.addEventListener('click', () => { st.angle = angle; st.stops = list.map(([c, p]) => ({ c, p })); $('#angle').value = angle; stops(); paint(); });
    $('#presets').appendChild(b);
  });

  const root = document.documentElement;
  try { root.dataset.theme = localStorage.getItem('gradlab-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'); } catch { root.dataset.theme = 'dark'; }
  $('#theme').addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('gradlab-theme', root.dataset.theme); } catch { /* ignore */ } });
  stops(); paint();
})();
