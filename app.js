(() => {
  const D = window.DATA || {};
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => (n == null || isNaN(n) ? '—' : n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(Math.round(n)));
  const fx = (n) => (n == null || isNaN(n) ? '—' : (n >= 100 ? Math.round(n).toLocaleString('en-US') : n.toFixed(1)) + 'x');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const day = (iso) => (iso ? new Date(iso + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '');

  // ---- saved / used state (per browser) ----
  const store = {
    get(k) { try { return new Set(JSON.parse(localStorage.getItem(k) || '[]')); } catch { return new Set(); } },
    set(k, s) { try { localStorage.setItem(k, JSON.stringify([...s])); } catch {} },
  };
  const saved = store.get('vor_saved');
  const used = store.get('vor_used');

  const ALL = (D.posts || []).map((r) => ({
    id: r.url, rank: r.rank, title: r.title || '', creator: r.creator || '', platform: r.platform,
    type: r.post_type || '', size: r.size, metric: r.metric, metricType: r.metric_type || 'views',
    median: r.median, followers: r.followers, x: r.x_median, length_s: r.length_s, posted: r.posted || '',
    topic: r.topic || '', caption: r.caption || '', url: r.url,
  }));
  const byId = new Map(ALL.map((it) => [it.id, it]));
  const maxLog = Math.log10(Math.max(...ALL.map((it) => it.x || 1)));
  const meter = (x) => Math.max(6, Math.min(100, (Math.log10(Math.max(x || 1, 1)) / maxLog) * 100));

  // ---- state ----
  const st = { tab: location.hash.slice(1) || 'tiktok', size: '', topic: '', q: '', sort: 'rank', view: 'cards', hideUsed: false };
  try { const v = localStorage.getItem('vor_view'); if (v) st.view = v; } catch {}

  const HINTS = {
    all: 'Prop firm and trading posts from the last 48 hours that beat their own account’s usual numbers. Ranks are per platform. Tap the caption box to copy it. ★ saves an idea, ✓ marks it as used.',
    tiktok: 'TikTok top 30 from the last 48 hours, scored on views against the account’s median over its latest ~20 videos. Under 50k followers needs 3x+, bigger accounts need 10x+.',
    instagram: 'Instagram is thin this time: only 3 posts from the last 48 hours cleared the bar. Likes on new posts take a few days to settle, and Instagram search rarely surfaces posts this fresh. Scored on likes against the account’s latest 12 posts.',
    saved: 'Everything you starred. Saved in this browser.',
  };

  // ---- filtering ----
  const match = (it) => {
    if (st.size && it.size !== st.size) return false;
    if (st.topic && it.topic !== st.topic) return false;
    if (st.hideUsed && used.has(it.id)) return false;
    if (st.q) {
      const hay = (it.title + ' ' + it.creator + ' ' + it.caption + ' ' + it.topic + ' ' + it.type).toLowerCase();
      return st.q.split(/\s+/).every((w) => hay.includes(w));
    }
    return true;
  };
  const sorter = (a, b) => {
    const k = st.sort;
    if (k === 'rank') return (a.rank ?? 1e9) - (b.rank ?? 1e9) || a.platform.localeCompare(b.platform);
    if (k === 'followers') return (a.followers ?? 1e12) - (b.followers ?? 1e12);
    if (k === 'length_s') return (a.length_s ?? 1e9) - (b.length_s ?? 1e9);
    if (k === 'posted') return b.posted.localeCompare(a.posted) || a.rank - b.rank;
    return (b[k] ?? -1) - (a[k] ?? -1);
  };
  const source = () => {
    if (st.tab === 'tiktok') return ALL.filter((it) => it.platform === 'TikTok');
    if (st.tab === 'instagram') return ALL.filter((it) => it.platform === 'Instagram');
    if (st.tab === 'saved') return [...saved].map((id) => byId.get(id)).filter(Boolean);
    return ALL;
  };

  // ---- renderers ----
  const badges = (it) => {
    const pl = it.platform === 'Instagram' ? '<span class="badge ig">Instagram</span>' : '<span class="badge tt">TikTok</span>';
    const sz = it.size === 'small' ? '<span class="badge ok">Under 50k</span>' : '<span class="badge core">' + (it.platform === 'Instagram' && it.x < 10 ? 'Big account 3x+' : 'Big account') + '</span>';
    return `${pl}${sz}<span class="badge muted">From caption</span>`;
  };
  const card = (it) => {
    const usual = Math.max(1.5, (it.median / it.metric) * 100);
    return `<article class="card ${used.has(it.id) ? 'used' : ''}" data-id="${esc(it.id)}">
      <div class="card-top"><span class="rank">#${it.rank}</span><div class="badges">${badges(it)}</div></div>
      <div><div class="format">${esc(it.title)}</div><div class="creator">${esc(it.creator)} · ${esc(it.type)}${it.length_s ? ' · ' + Math.round(it.length_s) + 's' : ''} · ${day(it.posted)}</div></div>
      <div>
        <div class="xline"><b>${fx(it.x)}</b><span>their usual ${it.metricType}</span></div>
        <div class="meter"><i style="width:${meter(it.x)}%"></i></div>
      </div>
      <div class="stats">
        <div class="stat"><b>${fmt(it.metric)}</b><span>${it.metricType}</span></div>
        <div class="stat"><b>${fmt(it.median)}</b><span>usual post</span></div>
        <div class="stat"><b>${fmt(it.followers)}</b><span>followers</span></div>
      </div>
      ${it.caption ? `<div class="tv" data-copy="${esc(it.caption)}"><span class="lbl">Caption</span><span class="txt">${esc(it.caption)}</span><span class="copy">Copy</span></div>` : ''}
      <div class="more">
        <div class="cmp">
          <div class="cmp-row"><span>This post</span><span class="bar"><i style="width:100%;background:var(--accent)"></i></span><span>${Math.round(it.metric).toLocaleString('en-US')}</span></div>
          <div class="cmp-row"><span>Usual post</span><span class="bar"><i style="width:${usual}%;background:var(--dim)"></i></span><span>${Math.round(it.median).toLocaleString('en-US')}</span></div>
        </div>
        <div class="field"><b>Found through:</b> ${esc(it.topic)} search</div>
        <div class="field"><b>Followers:</b> ${Math.round(it.followers).toLocaleString('en-US')}</div>
      </div>
      <div class="actions">
        <a class="btn primary" href="${esc(it.url)}" target="_blank" rel="noopener">Watch ↗</a>
        <button class="btn" data-act="more">Details</button>
        <span class="spacer"></span>
        <button class="btn icon star ${saved.has(it.id) ? 'on' : ''}" data-act="save" title="${saved.has(it.id) ? 'Saved (click to remove)' : 'Save idea'}">★</button>
        <button class="btn icon usedb ${used.has(it.id) ? 'on' : ''}" data-act="used" title="${used.has(it.id) ? 'Marked as made' : 'Mark as made'}">✓</button>
      </div>
    </article>`;
  };

  const table = (rows) => {
    const cols = [
      { h: '', td: (it) => `<td><button class="btn star ${saved.has(it.id) ? 'on' : ''}" data-act="save" title="Save">★</button></td>` },
      { h: '', td: (it) => `<td><a class="btn" href="${esc(it.url)}" target="_blank" rel="noopener">Watch ↗</a></td>` },
      { h: '#', td: (it) => `<td class="n">${it.rank}</td>` },
      { h: 'Platform', td: (it) => `<td><span class="badge ${it.platform === 'Instagram' ? 'ig' : 'tt'}">${it.platform}</span></td>` },
      { h: 'What it is', td: (it) => `<td class="wide"><b>${esc(it.title)}</b></td>` },
      { h: 'Creator', td: (it) => `<td>${esc(it.creator)}</td>` },
      { h: 'Outlier', td: (it) => `<td class="n">${fx(it.x)}</td>` },
      { h: 'Views / likes', td: (it) => `<td class="n">${fmt(it.metric)}</td>` },
      { h: 'Usual', td: (it) => `<td class="n">${fmt(it.median)}</td>` },
      { h: 'Followers', td: (it) => `<td class="n">${fmt(it.followers)}</td>` },
      { h: 'Posted', td: (it) => `<td class="n">${day(it.posted)}</td>` },
      { h: 'Caption', td: (it) => `<td class="cap"><div class="clip">${esc(it.caption)}</div></td>` },
    ];
    const head = cols.map((c) => `<th>${c.h}</th>`).join('');
    const body = rows.map((it) => `<tr data-id="${esc(it.id)}" class="${used.has(it.id) ? 'usedrow' : ''}">${cols.map((c) => c.td(it)).join('')}</tr>`).join('');
    return `<div class="tbl-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  };

  const topics = (src) => {
    const counts = {};
    src.forEach((it) => (counts[it.topic] = (counts[it.topic] || 0) + 1));
    const list = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    $('#topics').innerHTML = `<button data-topic="" class="chip ${st.topic ? '' : 'on'}">All topics</button>` +
      list.map(([t, c]) => `<button data-topic="${esc(t)}" class="chip ${st.topic === t ? 'on' : ''}">${esc(t)}<span class="n">${c}</span></button>`).join('');
  };

  const render = () => {
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === st.tab));
    document.querySelectorAll('#view-seg button').forEach((b) => b.classList.toggle('on', b.dataset.view === st.view));
    $('#hint').textContent = HINTS[st.tab] || '';
    const src = source();
    if (st.topic && !src.some((it) => it.topic === st.topic)) st.topic = '';
    topics(src);
    const rows = src.filter(match).slice().sort(sorter);
    const main = $('#main');
    $('#empty').hidden = rows.length > 0;
    if (!rows.length) {
      main.innerHTML = '';
      if (st.tab === 'saved' && !saved.size) $('#empty').textContent = 'Nothing saved yet. Tap ★ on any card to keep it here.';
      else $('#empty').textContent = 'Nothing matches. Try clearing the search or filters.';
      return;
    }
    main.innerHTML = st.view === 'list' ? table(rows) : `<div class="grid">${rows.map(card).join('')}</div>`;
  };

  const counts = () => {
    $('#c-all').textContent = ALL.length;
    $('#c-tiktok').textContent = ALL.filter((it) => it.platform === 'TikTok').length;
    $('#c-instagram').textContent = ALL.filter((it) => it.platform === 'Instagram').length;
    $('#c-saved').textContent = saved.size;
  };

  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 1600); };
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); toast('Copied'); }
    catch { const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select(); try { document.execCommand('copy'); toast('Copied'); } catch { toast('Copy was blocked'); } ta.remove(); }
  };

  // ---- events ----
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.tab = b.dataset.tab; history.replaceState(null, '', '#' + st.tab); render(); window.scrollTo({ top: 0 }); });
  $('#size-chips').addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (!b) return; st.size = b.dataset.size; document.querySelectorAll('#size-chips .chip').forEach((c) => c.classList.toggle('on', c === b)); render(); });
  $('#topics').addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (!b) return; st.topic = st.topic === b.dataset.topic ? '' : b.dataset.topic; render(); });
  $('#view-seg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.view = b.dataset.view; try { localStorage.setItem('vor_view', st.view); } catch {} render(); });
  $('#sort').addEventListener('change', (e) => { st.sort = e.target.value; render(); });
  $('#hide-used').addEventListener('change', (e) => { st.hideUsed = e.target.checked; render(); });
  let qt; $('#q').addEventListener('input', (e) => { clearTimeout(qt); qt = setTimeout(() => { st.q = e.target.value.trim().toLowerCase(); render(); }, 120); });
  document.addEventListener('keydown', (e) => { if (e.key === '/' && document.activeElement !== $('#q')) { e.preventDefault(); $('#q').focus(); } if (e.key === 'Escape') { $('#q').value = ''; st.q = ''; render(); } });

  $('#main').addEventListener('click', (e) => {
    const tv = e.target.closest('.tv'); if (tv) { copy(tv.dataset.copy); return; }
    const b = e.target.closest('[data-act]');
    const holder = e.target.closest('[data-id]');
    if (b) {
      const act = b.dataset.act;
      const id = holder && holder.dataset.id;
      if (act === 'more') { holder.classList.toggle('open'); b.textContent = holder.classList.contains('open') ? 'Less' : 'Details'; return; }
      if (act === 'save') { saved.has(id) ? saved.delete(id) : saved.add(id); store.set('vor_saved', saved); toast(saved.has(id) ? 'Saved' : 'Removed'); counts(); render(); return; }
      if (act === 'used') { used.has(id) ? used.delete(id) : used.add(id); store.set('vor_used', used); render(); return; }
      return;
    }
    const tr = e.target.closest('tr[data-id]'); if (tr && !e.target.closest('a')) tr.classList.toggle('exp');
  });

  // ---- boot ----
  const m = D.meta || {};
  const small = ALL.filter((it) => it.size === 'small').length;
  $('#meta-line').textContent = `Updated ${m.updated || ''} · Posts from ${m.window || 'the last 5 days'} · Prop firm and trading niche · ${ALL.length} outliers, ${small} from accounts under 50k`;
  if (!['all', 'tiktok', 'instagram', 'saved'].includes(st.tab)) st.tab = 'tiktok';
  counts();
  render();
})();
