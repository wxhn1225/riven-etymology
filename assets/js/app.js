// Renders data/affixes.json as one card per stat.
// Cut markup: [x] kept by the prefix, {x} kept by the suffix, (+x) added vowel, anything else dropped.
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const GREEK = /[Ͱ-Ͽἀ-῿]/;

  function cut(markup) {
    let out = '', added = '';
    const re = /\[([^\]]*)\]|\{([^}]*)\}|\(\+([a-z]+)\)|([^\[\{(]+|\()/g;
    let m;
    while ((m = re.exec(markup))) {
      if (m[1] !== undefined) out += '<span class="kp">' + esc(m[1]) + '</span>';
      else if (m[2] !== undefined) out += '<span class="ks">' + esc(m[2]) + '</span>';
      else if (m[3] !== undefined) added += m[3];
      else out += '<span class="x">' + esc(m[4]) + '</span>';
    }
    // the added vowel is shown after the word, not inside it, so the source word stays readable
    if (added) out += '<span class="ka" title="前缀补上的元音">+' + esc(added) + '</span>';
    return out;
  }

  const shortLabel = (label) => label.replace(/（[^）]*）/g, '').trim();
  const links = (arr) => (arr && arr.length
    ? '<div class="links">' + arr.map((l) => '<a href="' + esc(l.url) + '" target="_blank" rel="noopener" title="' + esc(l.label) + '">' + esc(shortLabel(l.label)) + '</a>').join('') + '</div>'
    : '');
  const badge = (r) => (r === '1' || r === 'g' ? '<span class="badge maybe">存疑</span>' : r === '0' ? '<span class="badge unknown">未知</span>' : '');

  function row(tag, cls, h) {
    if (h.rating === '0' && !h.cut) {
      return '<div class="row"><span class="tag ' + cls + '">' + tag + '</span><div class="src"><div class="word"><span class="x">—</span></div><div class="meta">' + badge('0') + '</div></div></div>';
    }
    const orig = h.word && GREEK.test(h.word) ? '<span class="orig">' + esc(h.word) + '</span>' : '';
    return '<div class="row"><span class="tag ' + cls + '">' + tag + '</span><div class="src">' +
      '<div class="word">' + cut(h.cut) + orig + '</div>' +
      '<div class="meta">' + (h.lang ? '<span class="lang">' + esc(h.lang) + '</span>' : '') +
      '<span class="gloss">' + esc(h.gloss) + '</span>' + badge(h.rating) + '</div>' +
      links(h.links) + '</div></div>';
  }

  function card(e) {
    const rows = e.whole ? row('整', 'w', e.prefix) : row('前', 'p', e.prefix) + row('后', 's', e.suffix);
    const game = e.game ? '<div class="game"><span><b>游戏里</b>' + esc(e.game.text) + '</span>' + links(e.game.links) + '</div>' : '';
    const hay = [e.zh, e.en, e.prefix.frag, e.suffix.frag, e.prefix.word, e.suffix.word, e.prefix.gloss, e.suffix.gloss].join(' ').toLowerCase();
    return '<article class="card" id="' + esc(e.id) + '" data-hay="' + esc(hay) + '">' +
      '<header><span class="zh">' + esc(e.zh) + '</span><span class="en">' + esc(e.en) + '</span></header>' +
      '<div class="frags"><span class="p">' + esc(e.prefix.frag) + '</span><span class="dot">·</span><span class="s">' + esc(e.suffix.frag) + '</span></div>' +
      '<div class="rows">' + rows + '</div>' + game + '</article>';
  }

  function render(data) {
    const active = data.entries.filter((e) => e.active);
    const unused = data.entries.filter((e) => !e.active);
    $('active').innerHTML = active.map(card).join('');
    $('unused').innerHTML = unused.map(card).join('');
    count();
    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) el.scrollIntoView({ block: 'center' });
    }
  }

  function count() {
    for (const id of ['active', 'unused']) {
      const shown = $(id).querySelectorAll('.card:not([hidden])').length;
      $('n-' + id).textContent = shown;
      $(id).closest('section').hidden = shown === 0;
    }
    $('empty').hidden = !!document.querySelector('.card:not([hidden])');
  }

  $('q').addEventListener('input', (ev) => {
    const q = ev.target.value.trim().toLowerCase();
    document.querySelectorAll('.card').forEach((c) => { c.hidden = !!q && !c.dataset.hay.includes(q); });
    count();
  });

  fetch('data/affixes.json')
    .then((r) => r.json())
    .then(render)
    .catch(() => { $('empty').hidden = false; $('empty').textContent = '数据没有加载出来，请刷新页面。'; });
})();
