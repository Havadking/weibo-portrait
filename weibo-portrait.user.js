// ==UserScript==
// @name         微博竖屏布局
// @namespace    https://github.com/Havadking/weibo-portrait
// @homepageURL  https://github.com/Havadking/weibo-portrait
// @downloadURL  https://raw.githubusercontent.com/Havadking/weibo-portrait/main/weibo-portrait.user.js
// @updateURL    https://raw.githubusercontent.com/Havadking/weibo-portrait/main/weibo-portrait.user.js
// @version      0.2.0
// @description  把微博网页版改成推特式布局：左侧细导航栏、正文铺满、顶栏热搜 Top10 抽屉（快捷键 H）
// @match        https://weibo.com/*
// @match        https://www.weibo.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const RAIL_W = 72;
  // 微博的 class 带构建哈希（如 _side_1ubn9_37），只匹配前缀，并用层级限定范围，避免误伤信息流里的元素
  const LAYOUT = '#app > [class*="_wrap_"] > [class*="_content_"]';
  const TOP = '#app > [class*="_wrap_"] > [class*="_top_"]';
  const SIDE = `${LAYOUT} > [class*="_side_"]`;
  const ITEM = `${SIDE} a > [class*="_main_"]`;

  GM_addStyle(`
    /* ---------- 顶栏：只留首页和消息 ---------- */
    ${TOP} a[title="推荐"], ${TOP} a[title="视频"] { display: none !important; }

    /* ---------- 左侧细导航 ---------- */
    ${SIDE} {
      position: fixed !important; left: 0; top: 60px; bottom: 0;
      width: ${RAIL_W}px !important; margin: 0 !important; z-index: 200;
    }
    ${SIDE} > div { position: static !important; width: 100% !important; height: 100% !important; }
    ${SIDE} > div > div {
      width: 100% !important; height: 100% !important; max-height: none !important;
      border-radius: 0 !important; padding: 8px 0 80px !important;
      overflow-x: hidden !important; overflow-y: auto !important;
    }
    ${SIDE} h2, ${SIDE} h3 { display: none !important; }
    ${SIDE} a { display: block; margin: 2px 6px; }
    ${ITEM} {
      position: relative; flex-direction: column !important; justify-content: center;
      width: auto !important; height: auto !important; padding: 6px 0 !important;
      gap: 2px; border-radius: 10px;
    }
    ${ITEM}:hover { background: rgba(128, 128, 128, .12); }
    ${ITEM} > i {
      margin: 0 !important; width: 32px; height: 32px; border-radius: 50%;
      display: grid !important; place-items: center; font-size: 20px !important;
    }
    ${ITEM} > [class*="_text_"] {
      margin: 0 !important; max-width: 58px; font-size: 11px !important; line-height: 1.3 !important;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    /* 自定义分组：圆点图标换成分组名首字 */
    ${ITEM} > i[data-wpr-ch] { background: rgba(128, 128, 128, .15); }
    ${ITEM} > i[data-wpr-ch]::before {
      content: attr(data-wpr-ch) !important;
      font: 600 14px/1 -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif !important;
    }
    /* 未读数等角标挪到右上角 */
    ${ITEM} > :not(i):not([class*="_text_"]) {
      position: absolute !important; top: 2px; right: 4px; margin: 0 !important; transform: scale(.85);
    }

    /* ---------- 正文铺满，隐藏右侧栏 ---------- */
    ${LAYOUT} {
      max-width: none !important; width: 100% !important; box-sizing: border-box;
      padding: 0 16px 0 ${RAIL_W + 12}px !important;
    }
    ${LAYOUT} > div:not([class*="_side_"]) { flex: 1 1 auto !important; width: auto !important; min-width: 0; }
    ${LAYOUT} main > [class*="_full_"] {
      flex: 1 1 auto !important; width: auto !important; min-width: 0; max-width: 900px; margin: 0 auto;
    }
    ${LAYOUT} main > [class*="_side_"] { display: none !important; }
    /* 视频封面会跟着栏宽放大，限制一下；图片是固定尺寸缩略图，不用管 */
    ${LAYOUT} [class*="_videoBox_"] { max-width: 640px; }

    /* ---------- 顶栏热搜按钮 + 抽屉 ---------- */
    #wpr-hot-tab { cursor: pointer; }
    #wpr-hot-tab.wpr-on svg { color: #ff8200; }
    #wpr-hot {
      position: fixed; right: 0; top: 60px; bottom: 0; z-index: 1000; width: 340px; max-width: 90vw;
      background: var(--wpr-bg, #fff); color: var(--wpr-fg, #333);
      box-shadow: -6px 0 16px rgba(0, 0, 0, .15); transform: translateX(105%); transition: transform .2s;
      display: flex; flex-direction: column; font-size: 14px;
    }
    #wpr-hot.wpr-open { transform: none; }
    #wpr-hot .wpr-hd { display: flex; align-items: center; gap: 8px; padding: 14px 16px 8px; }
    #wpr-hot .wpr-hd b { font-size: 16px; }
    #wpr-hot .wpr-time { margin-left: auto; font-size: 12px; opacity: .55; }
    #wpr-hot .wpr-hd button {
      border: 0; background: none; color: inherit; cursor: pointer; font-size: 16px;
      width: 28px; height: 28px; border-radius: 50%;
    }
    #wpr-hot .wpr-hd button:hover { background: rgba(128, 128, 128, .15); }
    #wpr-hot ol { list-style: none; margin: 0; padding: 0 8px 16px; overflow-y: auto; }
    #wpr-hot li a {
      display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 6px;
      color: inherit; text-decoration: none;
    }
    #wpr-hot li a:hover { background: rgba(128, 128, 128, .12); }
    #wpr-hot .wpr-rk { width: 18px; text-align: center; font-weight: 700; font-style: italic; color: #f6a623; }
    #wpr-hot li:nth-child(-n+3) .wpr-rk { color: #f26d5f; }
    #wpr-hot .wpr-t { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #wpr-hot .wpr-tag { font-size: 11px; color: #fff; border-radius: 3px; padding: 0 3px; line-height: 16px; }
    #wpr-hot .wpr-n { font-size: 12px; opacity: .55; }
    #wpr-hot .wpr-msg { padding: 16px; opacity: .6; text-align: center; }
  `);

  // ---------- 左栏：补 tooltip 和分组首字 ----------
  function decorateRail() {
    for (const a of document.querySelectorAll(`${SIDE} a`)) {
      const text = a.querySelector('[class*="_text_"]');
      if (!text) continue;
      const name = text.textContent.trim();
      if (a.title !== name) a.title = name;
      const dot = a.querySelector('i.woo-font--navDot');
      if (dot && dot.dataset.wprCh !== name[0]) dot.dataset.wprCh = name[0];
    }
  }

  // ---------- 热搜抽屉 ----------
  const TAG_COLORS = { 新: '#ff3852', 热: '#ff9406', 沸: '#f86400', 爆: '#bd0000', 暖: '#ffab5a' };
  const CACHE_MS = 2 * 60 * 1000;
  let fetchedAt = 0;
  let panel, list, timeEl;

  function h(tag, props = {}, ...children) {
    const el = Object.assign(document.createElement(tag), props);
    el.append(...children);
    return el;
  }

  function formatNum(n) {
    return n >= 10000 ? (n / 10000).toFixed(1) + '万' : String(n || '');
  }

  function render(items) {
    list.replaceChildren(...items.map((x, i) => {
      const tag = x.label_name || x.icon_desc || '';
      const q = x.word_scheme || `#${x.word}#`;
      return h('li', {}, h('a', {
        href: `https://s.weibo.com/weibo?q=${encodeURIComponent(q)}`,
        target: '_blank',
        rel: 'noopener',
        title: x.note || x.word,
      },
        h('span', { className: 'wpr-rk' }, String(i + 1)),
        h('span', { className: 'wpr-t' }, x.note || x.word),
        tag ? h('span', { className: 'wpr-tag', style: `background:${x.small_icon_desc_color || TAG_COLORS[tag] || '#ff9406'}` }, tag) : '',
        h('span', { className: 'wpr-n' }, formatNum(x.num)),
      ));
    }));
    const d = new Date(fetchedAt);
    timeEl.textContent = `更新于 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  async function loadHot(force) {
    if (!force && Date.now() - fetchedAt < CACHE_MS) return;
    list.replaceChildren(h('li', { className: 'wpr-msg' }, '加载中…'));
    try {
      const res = await fetch('/ajax/side/hotSearch', { credentials: 'include' });
      const json = await res.json();
      const items = (json.data?.realtime || []).filter(x => !x.is_ad).slice(0, 10);
      if (!items.length) throw new Error('empty');
      fetchedAt = Date.now();
      render(items);
    } catch (e) {
      fetchedAt = 0;
      list.replaceChildren(h('li', { className: 'wpr-msg' }, '加载失败，点 ↻ 重试'));
    }
  }

  function syncTheme() {
    // 跟随微博自己的深色/浅色主题：直接借用面板的背景色和文字色
    const ref = document.querySelector('.woo-panel-main');
    if (!ref) return;
    const cs = getComputedStyle(ref);
    panel.style.setProperty('--wpr-bg', cs.backgroundColor);
    panel.style.setProperty('--wpr-fg', cs.color);
  }

  function toggleHot(open = !panel.classList.contains('wpr-open')) {
    panel.classList.toggle('wpr-open', open);
    document.getElementById('wpr-hot-tab')?.classList.toggle('wpr-on', open);
    if (open) {
      syncTheme();
      loadHot(false);
    }
  }

  const FLAME_SVG = '<path d="M15 4.5c.7 3.3-1 5.6-2.9 7.6C10.3 14 9 15.8 9 18.6 9 22.2 11.7 25 15 25s6-2.8 6-6.4c0-2.3-.9-4.3-2.3-5.9-.2 1.6-1 2.8-2.3 3.5.5-4.6-.8-8.6-1.4-11.7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>';

  // 顶栏的热搜按钮：复制"消息"按钮当模板，样式就和顶栏其他按钮完全一致
  function mountHotTab() {
    if (document.getElementById('wpr-hot-tab')) return;
    const msg = document.querySelector(`${TOP} a[title="消息"]`);
    if (!msg) return;
    const tab = msg.cloneNode(true);
    tab.id = 'wpr-hot-tab';
    tab.title = '微博热搜（快捷键 H）';
    tab.removeAttribute('href');
    tab.querySelectorAll('.woo-tab-active').forEach(el => el.classList.remove('woo-tab-active'));
    tab.querySelectorAll('.woo-badge-main').forEach(el => el.remove());
    const svg = tab.querySelector('svg');
    if (svg) svg.innerHTML = FLAME_SVG;
    tab.classList.toggle('wpr-on', panel.classList.contains('wpr-open'));
    tab.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggleHot(); });
    msg.after(tab);
  }

  function buildHot() {
    const refresh = h('button', { title: '刷新' }, '↻');
    const close = h('button', { title: '关闭（Esc）' }, '✕');
    timeEl = h('span', { className: 'wpr-time' });
    list = h('ol');
    panel = h('aside', { id: 'wpr-hot' },
      h('div', { className: 'wpr-hd' }, h('b', {}, '微博热搜'), timeEl, refresh, close),
      list,
    );
    document.body.append(panel);

    refresh.addEventListener('click', () => loadHot(true));
    close.addEventListener('click', () => toggleHot(false));
    document.addEventListener('click', e => {
      if (panel.classList.contains('wpr-open') && !panel.contains(e.target)) toggleHot(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') return toggleHot(false);
      if (e.key !== 'h' && e.key !== 'H') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      toggleHot();
    });
  }

  function init() {
    buildHot();
    decorateRail();
    mountHotTab();
    // 微博是单页应用，顶栏和左栏是异步渲染的，切页面时也可能重新渲染
    let pending = false;
    new MutationObserver(() => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; decorateRail(); mountHotTab(); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
