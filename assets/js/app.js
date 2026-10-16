// 紫卡词根 — overview grid + full-screen 讲解 stage, in the paper-cut look of the explainer video.
// Data: window.AFFIXES (data/affixes.js, generated from data/affixes.json).
// Cut markup: [x] kept by the prefix, {x} kept by the suffix, (+x) vowel added to the prefix, anything else dropped.
(function () {
  const DATA = window.AFFIXES;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const GREEK = /[Ͱ-Ͽἀ-῿]/;
  const LETTER = ['#c59bff', '#ff6b5b', '#7cc6ff', '#ffd046', '#7ee08a', '#ff9ec7', '#ffffff'];
  const DARK_TEXT = new Set(['#ffffff', '#ffd046', '#7ee08a', '#7cc6ff', '#ff9ec7']);
  const TAPE = ['#fff0b4', '#bfe6ff', '#ffd1e3', '#d7f7c8'];
  const TITLE = ['#ffd046', '#c59bff', '#ffffff', '#ff9ec7', '#7cc6ff'];
  const GROUP = { active: 'active', dedicated: 'dedicated', reserved: 'other', removed: 'other' };

  // ---------------------------------------------------------------- language: 简中 by default, English via ?lang=en (remembered)
  const LANG = (() => {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'zh' || q === 'en') return q;
    try { const s = localStorage.getItem('riven-lang'); if (s === 'zh' || s === 'en') return s; } catch (e) { /* storage blocked */ }
    return 'zh';
  })();
  const EN = LANG === 'en';
  const T = EN ? {
    title: 'Riven Roots', desc: 'Where every Warframe riven prefix and suffix comes from, and why it is that word.',
    start: 'Start', search: 'Search', searchPh: 'Search stats, name parts or source words',
    groupActive: 'In use', groupDedicated: 'Dedicated, not shown', groupOther: 'Reserved & removed',
    empty: 'Nothing found. Try another word.',
    foot: 'DE never explained where these name parts come from. This is a reconstruction; anything stamped UNSURE is only a maybe.',
    stage: 'Slides', menu: 'Contents', prev: 'Previous', next: 'Next', toc: 'Contents',
    hints: '← → page　M contents　Esc overview　F fullscreen　H hide buttons',
    sample: 'Example: Vectis Sati-critaata', langBtn: '中文', langAria: '切换到简体中文',
    added: 'vowel added to the prefix', maybe: 'UNSURE', unknown: 'UNKNOWN', also: 'Or maybe', noSource: 'No source found yet',
    open: ', open its slide', shown: 'Shown in game as', shownSlide: 'In the game config, this stat is named',
    pfx: 'prefix', pfx2: 'also a prefix', sfx: 'suffix',
    line: 'Every <b>prefix</b> and <i>suffix</i> is cut out of a real word', tocIntro: 'Intro: how names are built', source: 'Source',
  } : {
    title: '紫卡词根', desc: 'Warframe 紫卡名字里的每个前缀和后缀，来自哪个词，为什么是这个词。',
    start: '开始讲解', search: '搜索', searchPh: '搜属性、词根或来源词',
    groupActive: '在用的词根', groupDedicated: '有专用词根但名字没用上', groupOther: '预留和已删除的',
    empty: '没有找到，换个关键词试试。',
    foot: 'DE 没有公开过这些词根的来历，这里是考证结果。盖着「存疑」章的只是可能。',
    stage: '讲解', menu: '目录', prev: '上一个', next: '下一个', toc: '目录',
    hints: '← → 翻页　M 目录　Esc 回总览　F 全屏　H 隐藏按钮',
    sample: '例：Vectis Sati-critaata', langBtn: 'EN', langAria: 'Switch to English',
    added: '前缀补上的元音', maybe: '存疑', unknown: '未知', also: '也可能', noSource: '还没找到来源',
    open: '，点开讲解', shown: '游戏配置里借用', shownSlide: '游戏配置里，这个属性的名字借用',
    pfx: '前缀', pfx2: '也是前缀', sfx: '后缀',
    line: '<b>前缀</b>和<i>后缀</i>，都是从一个真实的词里剪下来的', tocIntro: '开场：名字怎么拼', source: '出处',
  };
  const LANG_EN = { 拉丁语: 'Latin', 中世纪拉丁语: 'Medieval Latin', 希腊语: 'Greek', 现代希腊语: 'Modern Greek', 希腊字母: 'Greek letter', 英语: 'English', '英语（mod 名）': 'English (mod name)', 意大利语: 'Italian', 西班牙语: 'Spanish', 法语: 'French', '法语、西班牙语': 'French, Spanish', 德语: 'German', 土耳其语: 'Turkish', 芬兰语: 'Finnish' };
  const name = (e) => (EN ? e.en : e.zh);
  const subName = (e) => (EN ? e.zh : e.en);
  const why = (x) => (EN && x.whyEn) || x.why;
  const label = (l) => (EN && l.labelEn) || l.label;
  function switchLang() {
    const to = EN ? 'zh' : 'en';
    try { localStorage.setItem('riven-lang', to); } catch (e) { /* storage blocked: the URL still carries it */ }
    const u = new URL(location.href); u.searchParams.set('lang', to);
    location.href = u.toString();
  }

  // seeded random: each card keeps the same tilt, colours and torn edge every time
  function rng(seed) { let x = seed >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  function hash(s) { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function torn(seed, amp = 4, steps = 18) {
    const r = rng(seed), pts = [], j = () => (r() * amp).toFixed(1);
    for (let i = 0; i <= steps; i++) pts.push(`${(i / steps) * 100}% ${j()}px`);
    for (let i = 1; i <= steps; i++) pts.push(`calc(100% - ${j()}px) ${(i / steps) * 100}%`);
    for (let i = steps - 1; i >= 0; i--) pts.push(`${(i / steps) * 100}% calc(100% - ${j()}px)`);
    for (let i = steps - 1; i > 0; i--) pts.push(`${j()}px ${(i / steps) * 100}%`);
    return `polygon(${pts.join(',')})`;
  }

  // ---------------------------------------------------------------- pieces
  function chips(word, seed) {
    const r = rng(seed); let last = -1;
    return [...word].map((ch, i) => {
      let k; do { k = Math.floor(r() * LETTER.length); } while (k === last); last = k;
      const bg = LETTER[k], fg = DARK_TEXT.has(bg) ? '#26213d' : '#ffffff';
      return `<span class="lt" style="--bg:${bg};--fg:${fg};--rot:${((r() - 0.5) * 12).toFixed(1)}deg;--dy:${((r() - 0.5) * 4).toFixed(1)}px;--i:${i}">${esc(ch)}</span>`;
    }).join('');
  }
  const prefixHTML = (w) => `<span class="cut-word" aria-label="${esc(w)}">${chips(w, hash(w))}</span>`;
  const suffixHTML = (w) => `<span class="tagword cut-word" style="--rot:${((rng(hash(w + 's'))() - 0.5) * 6).toFixed(1)}deg">${esc(w)}</span>`;

  function ransom(el) {
    const text = el.dataset.ransom, r = rng(hash(text));
    let i = 0;
    const chip = (ch) => {
      const bg = TITLE[i++ % TITLE.length], fg = bg === '#c59bff' ? '#ffffff' : '#26213d';
      return `<span class="ch" aria-hidden="true" style="--bg:${bg};--fg:${fg};--rot:${((r() - 0.5) * 9).toFixed(1)}deg">${esc(ch)}</span>`;
    };
    // English titles: keep each word's chips together so lines break between words
    el.innerHTML = text.includes(' ')
      ? text.split(' ').map((w) => `<span class="rw">${[...w].map(chip).join('')}</span>`).join('')
      : [...text].map(chip).join('');
  }

  function cut(markup) {
    let out = '', added = '';
    const re = /\[([^\]]*)\]|\{([^}]*)\}|\(\+([a-z]+)\)|([^\[\{(]+|\()/g;
    let m;
    while ((m = re.exec(markup))) {
      if (m[1] !== undefined) out += `<span class="kp">${esc(m[1])}</span>`;
      else if (m[2] !== undefined) out += `<span class="ks">${esc(m[2])}</span>`;
      else if (m[3] !== undefined) added += m[3];
      else out += `<span class="x">${esc(m[4])}</span>`;
    }
    if (added) out += `<span class="ka" title="${T.added}">+${esc(added)}</span>`;
    return out;
  }
  const stamp = (r) => (r === '1' || r === 'g' ? `<span class="stamp maybe">${T.maybe}</span>` : r === '0' ? `<span class="stamp unknown">${T.unknown}</span>` : '');
  // button text drops the note in brackets; the full label stays in the tooltip
  const shortLabel = (l) => { const t = label(l).replace(/（[^）]*）/g, ''); return (EN ? t.replace(/ \([^)]*\)$/, '') : t).trim(); };
  const links = (arr) => (arr && arr.length ? `<div class="links">${arr.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener" title="${esc(label(l))}">${esc(shortLabel(l))}</a>`).join('')}</div>` : '');
  // slide-sized source buttons: which site it is, then what it points to
  const SITES = [['wiktionary.org', 'Wiktionary'], ['wiki.warframe.com', 'Warframe Wiki'], ['warframe.com/en/patch-notes', '官方补丁说明', 'Patch notes'], ['wikipedia.org', 'Wikipedia'], ['cambridge.org', 'Cambridge 词典', 'Cambridge'], ['doi.org', '论文', 'Paper'], ['thelatinlibrary.com', '古籍原文', 'Latin text'], ['exhibitions.psu.edu', '博物馆说明', 'Museum'], ['treccani.it', 'Treccani 词典', 'Treccani'], ['perseus.tufts.edu', 'Perseus 词典', 'Perseus'], ['glosbe.com', '反查翻译', 'Reverse lookup'], ['biblehub.com', 'Strong 词典', "Strong's"], ['openbible.com', 'Strong 词典', "Strong's"], ['thevincentian.com', '报纸原文', 'Newspaper'], ['sarsilmaz.com', '枪械说明书', 'Gun manual']];
  const site = (url) => { const s = SITES.find(([d]) => url.includes(d)); return s ? (EN && s[2]) || s[1] : T.source; };
  const slideLinks = (arr) => (arr && arr.length
    ? `<div class="s-links">${arr.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener" title="${esc(label(l))}"><span class="site">${esc(site(l.url))}</span>${esc(shortLabel(l))}</a>`).join('')}</div>`
    : '');
  const orig = (h) => (h.word && GREEK.test(h.word) ? `<span class="orig">${esc(h.word)}</span>` : '');
  const halves = (e) => (e.whole ? [e.prefix] : [e.prefix, e.suffix]);
  // language of the source word, as a small paper label above it (the explanation no longer starts with it)
  const LANG_C = { 拉丁语: '#e6dcff', 中世纪拉丁语: '#e6dcff', 希腊语: '#cfe9ff', 现代希腊语: '#cfe9ff', 希腊字母: '#cfe9ff', 英语: '#ffd6e6', 意大利语: '#d4f5c4', 西班牙语: '#ffe1bd', 法语: '#fff0b4', 德语: '#fff0b4' };
  const langTag = (l) => (l ? `<span class="lang" style="--lc:${LANG_C[l] || LANG_C[Object.keys(LANG_C).find((k) => l.startsWith(k))] || '#ece6da'}">${esc(EN ? LANG_EN[l] || l : l)}</span>` : '');
  const wordHTML = (h) => (h.cut ? cut(h.cut) + orig(h) : esc(h.word));
  // other candidate sources for the same half ("也可能")
  const altsHTML = (h, slide) => (h.alts && h.alts.length
    ? `<div class="alts">${h.alts.map((a) => `<div class="alt"><div class="alt-head"><span class="also">${T.also}</span>${langTag(a.lang)}<span class="word">${wordHTML(a)}</span></div>` +
      `<p class="why">${esc(why(a))}</p>${slide ? slideLinks(a.links) : links(a.links)}</div>`).join('')}</div>`
    : '');

  function sampleHTML() {
    const part = (inner, lab, stat, cls, i) => `<span class="part" style="--i:${i}">${inner}<span class="lab ${cls}">${lab}<b>${stat}</b></span></span>`;
    const stat = (id) => esc(name(DATA.entries.find((e) => e.id === id)));
    return `<span class="weapon">Vectis</span>` +
      part(prefixHTML('Sati'), T.pfx, stat('sati-can'), '', 0) + `<span class="dash">-</span>` +
      part(prefixHTML('crita'), T.pfx2, stat('crita-cron'), '', 1) +
      part(suffixHTML('ata'), T.sfx, stat('visi-ata'), 's', 2);
  }

  // ---------------------------------------------------------------- overview
  function row(h) {
    if (h.rating === '0' && !h.cut) return `<div class="row"><p class="why">${T.noSource}${stamp('0')}</p></div>`;
    return `<div class="row">${langTag(h.lang)}<div class="word">${wordHTML(h)}</div><p class="why">${esc(why(h))}${stamp(h.rating)}</p>${links(h.links)}${altsHTML(h, false)}</div>`;
  }
  function card(e, i) {
    const r = rng(hash(e.id));
    const alts = [e.prefix, e.suffix].flatMap((h) => (h.alts || []).flatMap((a) => [a.word, a.lang, LANG_EN[a.lang], why(a)]));
    const hay = [e.zh, e.en, e.prefix.frag, e.suffix.frag, e.prefix.word, e.suffix.word, e.prefix.lang, e.suffix.lang, LANG_EN[e.prefix.lang], LANG_EN[e.suffix.lang], why(e.prefix), why(e.suffix), ...alts].join(' ').toLowerCase();
    return `<article class="card-wrap" tabindex="0" data-id="${esc(e.id)}" data-hay="${esc(hay)}" aria-label="${esc(name(e) + T.open)}">` +
      `<span class="tape l" style="--tc:${TAPE[i % 4]};--rot:${(-6 - r() * 6).toFixed(1)}deg"></span>` +
      `<span class="tape r" style="--tc:${TAPE[(i + 2) % 4]};--rot:${(5 + r() * 6).toFixed(1)}deg"></span>` +
      `<div class="card" style="--torn:${torn(hash(e.id + 'edge'))}">` +
      `<header><span class="zh">${esc(name(e))}</span><span class="en">${esc(subName(e))}</span></header>` +
      `<div class="frags">${prefixHTML(e.prefix.frag)}${suffixHTML(e.suffix.frag)}</div>` +
      (e.shownAs ? `<div class="shown">${T.shown} <b>${esc(e.shownAs)}</b></div>` : '') +
      `<div class="rows">${halves(e).map(row).join('')}</div></div></article>`;
  }
  function renderOverview() {
    const groups = { active: [], dedicated: [], other: [] };
    DATA.entries.forEach((e) => groups[GROUP[e.status]].push(e));
    for (const [g, list] of Object.entries(groups)) {
      document.querySelector(`[data-group="${g}"] .grid`).innerHTML = list.map(card).join('');
    }
  }
  function filter(q) {
    document.querySelectorAll('.card-wrap').forEach((c) => { c.hidden = !!q && !c.dataset.hay.includes(q); });
    document.querySelectorAll('[data-group]').forEach((s) => { s.hidden = !s.querySelector('.card-wrap:not([hidden])'); });
    $('empty').hidden = !!document.querySelector('.card-wrap:not([hidden])');
  }

  // ---------------------------------------------------------------- 讲解 stage
  const ORDER = ['active', 'dedicated', 'reserved', 'removed'];
  const SLIDES = ['intro', ...ORDER.flatMap((s) => DATA.entries.filter((e) => e.status === s))];
  let cur = -1;

  function slideHTML(e) {
    if (e === 'intro') {
      return `<div class="slide-inner intro"><h1 class="ransom" data-ransom="${T.title}" aria-label="${T.title}"></h1>` +
        `<div class="sample">${sampleHTML()}</div>` +
        `<p class="line">${T.line}</p></div>`;
    }
    const rows = halves(e).map((h, k) => {
      const tornCss = `--torn:${torn(hash(e.id + 'slide' + k), 6, 26)}`;
      if (h.rating === '0' && !h.cut) return `<div class="s-row" style="${tornCss}"><p class="why">${T.noSource}${stamp('0')}</p></div>`;
      return `<div class="s-row${h.alts && h.alts.length ? ' has-alts' : ''}" style="${tornCss}">${langTag(h.lang)}<div class="word">${wordHTML(h)}</div><p class="why">${esc(why(h))}${stamp(h.rating)}</p>${slideLinks(h.links)}${altsHTML(h, true)}</div>`;
    }).join('');
    return `<div class="slide-inner"><div class="s-head"><span class="s-zh">${esc(name(e))}</span><span class="s-en">${esc(subName(e))}</span></div>` +
      `<div class="s-frags">${prefixHTML(e.prefix.frag)}${suffixHTML(e.suffix.frag)}</div>` +
      (e.shownAs ? `<div class="s-shown">${T.shownSlide} <b>${esc(e.shownAs)}</b></div>` : '') +
      `<div class="s-rows">${rows}</div></div>`;
  }

  function show(i) {
    cur = Math.max(0, Math.min(SLIDES.length - 1, i));
    const e = SLIDES[cur], slide = $('slide');
    slide.className = 'slide' + (e === 'intro' ? ' intro' : '');
    slide.innerHTML = slideHTML(e).replace(/^<div class="slide-inner[^"]*">|<\/div>$/g, '');
    slide.querySelectorAll('.ransom').forEach(ransom);
    $('counter').textContent = e === 'intro' ? '' : `${cur} / ${SLIDES.length - 1}`;
    $('prev').disabled = cur === 0;
    $('next').disabled = cur === SLIDES.length - 1;
    history.replaceState(null, '', '#讲解/' + (e === 'intro' ? 'intro' : e.id));
    fit();
  }
  // a slide with many sources may not fit the window: step its type down (dense, denser, then densest) until it does
  function fit() {
    const slide = $('slide');
    if ($('stage').hidden || slide.classList.contains('intro')) return;
    slide.classList.remove('dense', 'denser', 'densest');
    const over = () => Math.max(0, ...[...slide.querySelectorAll('.s-row')].map((r) => r.getBoundingClientRect().bottom)) > innerHeight - 12;
    for (const step of ['dense', 'denser', 'densest']) { if (!over()) break; slide.classList.add(step); }
  }
  addEventListener('resize', fit);
  function openStage(i) {
    $('stage').hidden = false; $('overview').hidden = true;
    document.body.style.overflow = 'hidden';
    show(i);
  }
  function closeStage() {
    const e = SLIDES[cur];
    closeMenu();
    $('stage').hidden = true; $('overview').hidden = false;
    document.body.style.overflow = '';
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    history.replaceState(null, '', location.pathname + location.search);
    if (e && e !== 'intro') {
      const c = document.querySelector(`.card-wrap[data-id="${e.id}"]`);
      if (c) { c.scrollIntoView({ block: 'center' }); c.focus({ preventScroll: true }); }
    }
  }

  // ---------------------------------------------------------------- 目录 (click a stat name to open its slide)
  const TOC_GROUPS = [[T.groupActive, ['active']], [T.groupDedicated, ['dedicated']], [T.groupOther, ['reserved', 'removed']]];
  function tocHTML() {
    const item = (e) => {
      const i = SLIDES.indexOf(e);
      return `<button type="button" class="toc-item" data-slide="${i}">${esc(name(e))}<span class="f">${esc(e.prefix.frag)}<b>·</b><i>${esc(e.suffix.frag)}</i></span></button>`;
    };
    return `<div class="toc-group"><div class="toc-list"><button type="button" class="toc-item" data-slide="0">${T.tocIntro}</button></div></div>` +
      TOC_GROUPS.map(([title, sts]) => `<div class="toc-group"><div class="toc-title">${title}</div><div class="toc-list">` +
        SLIDES.filter((e) => e !== 'intro' && sts.includes(e.status)).map(item).join('') + `</div></div>`).join('');
  }
  function openMenu() {
    $('tocSheet').querySelectorAll('.toc-item').forEach((b) => b.classList.toggle('on', +b.dataset.slide === cur));
    $('tocPanel').hidden = false;
    const on = $('tocSheet').querySelector('.toc-item.on') || $('tocSheet').querySelector('.toc-item');
    on.focus(); on.scrollIntoView({ block: 'nearest' });
  }
  const closeMenu = () => { $('tocPanel').hidden = true; };

  // ---------------------------------------------------------------- wiring
  // page text in the chosen language (index.html holds the 简中 text; data-t* attributes name the key)
  document.documentElement.lang = EN ? 'en' : 'zh-CN';
  document.title = T.title;
  document.querySelector('meta[name="description"]').content = T.desc;
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = T[el.dataset.t]; });
  document.querySelectorAll('[data-t-ph]').forEach((el) => { el.placeholder = T[el.dataset.tPh]; });
  document.querySelectorAll('[data-t-aria]').forEach((el) => el.setAttribute('aria-label', T[el.dataset.tAria]));
  document.querySelectorAll('[data-t-ransom]').forEach((el) => { el.dataset.ransom = T[el.dataset.tRansom]; el.setAttribute('aria-label', T[el.dataset.tRansom]); });
  document.querySelectorAll('.lang-switch').forEach((b) => b.addEventListener('click', switchLang));
  document.querySelectorAll('#overview .ransom, .stage-top .ransom').forEach(ransom);
  document.querySelector('.hero [data-sample]').innerHTML = sampleHTML();
  document.querySelector('.search').style.setProperty('--torn', torn(7, 3, 24));
  document.querySelectorAll('.confetti').forEach((conf, n) => {
    const cr = rng(42 + n);
    conf.innerHTML = Array.from({ length: 24 }, () => `<i style="left:${(cr() * 100).toFixed(1)}%;top:${(cr() * 85).toFixed(1)}%;--c:${LETTER[Math.floor(cr() * 6)]};--s:${(5 + cr() * 8).toFixed(0)}px"></i>`).join('');
  });
  renderOverview();
  $('toc').innerHTML = tocHTML();
  $('toc').style.setProperty('--torn', torn(11, 4, 30));
  $('tocSheet').innerHTML = tocHTML();
  $('tocSheet').style.setProperty('--torn', torn(13, 5, 30));
  $('toc').addEventListener('click', (ev) => { const b = ev.target.closest('.toc-item'); if (b) openStage(+b.dataset.slide); });
  $('tocSheet').addEventListener('click', (ev) => { const b = ev.target.closest('.toc-item'); if (b) { closeMenu(); show(+b.dataset.slide); } });
  $('tocPanel').addEventListener('click', (ev) => { if (ev.target === $('tocPanel')) closeMenu(); });
  $('menuBtn').addEventListener('click', () => ($('tocPanel').hidden ? openMenu() : closeMenu()));

  $('q').addEventListener('input', (ev) => filter(ev.target.value.trim().toLowerCase()));
  $('start').addEventListener('click', () => openStage(0));
  document.querySelector('main').addEventListener('click', (ev) => {
    if (ev.target.closest('a')) return;
    const c = ev.target.closest('.card-wrap');
    if (c) openStage(SLIDES.findIndex((e) => e !== 'intro' && e.id === c.dataset.id));
  });
  document.querySelector('main').addEventListener('keydown', (ev) => {
    const c = ev.target.closest('.card-wrap');
    if (c && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); c.click(); }
  });
  $('prev').addEventListener('click', () => show(cur - 1));
  $('next').addEventListener('click', () => show(cur + 1));
  document.addEventListener('keydown', (ev) => {
    if ($('stage').hidden || ev.target.tagName === 'INPUT') return;
    const k = ev.key;
    if (k === 'm' || k === 'M') { ev.preventDefault(); return $('tocPanel').hidden ? openMenu() : closeMenu(); }
    if (!$('tocPanel').hidden) { if (k === 'Escape') closeMenu(); return; }
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { ev.preventDefault(); show(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { ev.preventDefault(); show(cur - 1); }
    else if (k === 'Home') show(0);
    else if (k === 'End') show(SLIDES.length - 1);
    else if (k === 'Escape' && !document.fullscreenElement) closeStage();
    else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else $('stage').requestFullscreen?.().catch(() => {}); }
    else if (k === 'h' || k === 'H') $('stage').classList.toggle('clean');
  });

  // open a slide straight from the address, e.g. index.html#讲解/acri-tis
  const m = decodeURIComponent(location.hash).match(/^#讲解\/(.+)$/);
  if (m) openStage(m[1] === 'intro' ? 0 : Math.max(0, SLIDES.findIndex((e) => e !== 'intro' && e.id === m[1])));
})();
