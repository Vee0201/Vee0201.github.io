(function () {
  const TAGS = 'Tags (separate with |)';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Only http(s) URLs from the spreadsheet are ever used in src/href.
  function safeUrl(u) {
    try {
      const x = new URL(String(u || '').trim(), location.href);
      return /^https?:$/.test(x.protocol) ? x.href : '';
    } catch (e) { return ''; }
  }

  function tagList(r) {
    return String(r[TAGS] || '').split('|').map(s => s.trim()).filter(Boolean);
  }

  // ---- Data ----
  // projects: top-level and nested, each { id, rec, parent, children[] }
  async function loadProjects() {
    let data = {};
    try {
      const res = await fetch('data/content.json', { cache: 'no-cache' });
      if (res.ok) data = await res.json();
    } catch (e) {}
    const rows = (data.projects || []).filter(r => r && String(r.Title || '').trim());

    const items = rows.map((rec, i) => ({
      id: /^[A-Za-z0-9-]+$/.test(rec.ID || '') ? rec.ID : 'project-' + (i + 1),
      rec, parent: null, children: []
    }));
    const bySheetId = {};
    items.forEach(p => { bySheetId[p.rec.ID] = p; });
    items.forEach(p => {
      const parent = bySheetId[p.rec.ParentProjectID];
      if (parent && parent !== p) { p.parent = parent; parent.children.push(p); }
    });
    return items;
  }

  // ---- Video / media ----
  function embedUrl(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, '');
      if (host === 'youtu.be') return u.pathname.length > 1 ? 'https://www.youtube.com/embed/' + u.pathname.slice(1) : '';
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (u.pathname === '/watch' && u.searchParams.get('v')) return 'https://www.youtube.com/embed/' + u.searchParams.get('v');
        if (u.pathname.startsWith('/embed/')) return url;
        if (u.pathname.startsWith('/shorts/')) return 'https://www.youtube.com/embed/' + u.pathname.split('/')[2];
      }
      if (host === 'vimeo.com') {
        const id = u.pathname.split('/').filter(Boolean)[0];
        return id ? 'https://player.vimeo.com/video/' + id : '';
      }
      if (host === 'player.vimeo.com') return url;
    } catch (e) {}
    return '';
  }

  function mediaHtml(rec) {
    const urls = [rec.ImageURL1, rec.ImageURL2, rec.ImageURL3].map(safeUrl).filter(Boolean);
    if (!urls.length) return '';
    const items = urls.map((u, i) => {
      const embed = embedUrl(u);
      if (embed) return '<div class="video-frame"><iframe src="' + esc(embed) + '" title="' + esc(rec.Title) + ' video ' + (i + 1) + '" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
      if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u)) return '<video controls preload="metadata" src="' + esc(u) + '"></video>';
      return '<img src="' + esc(u) + '" alt="' + esc(rec.Title) + ' photo ' + (i + 1) + '" loading="lazy" onerror="this.remove()">';
    });
    return '<div class="media">' + items.join('') + '</div>';
  }

  // ---- Rendering ----
  function rowHtml(p, withThumb) {
    const r = p.rec;
    const thumb = withThumb ? safeUrl(r.ImageURL1) : '';
    const isImage = thumb && !embedUrl(thumb) && !/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(thumb);
    const meta = [r.TeamOrg, p.children.length ? p.children.length + ' projects' : ''].filter(Boolean).join(', ');
    const tags = tagList(r).join(', ');
    return '<a class="project-row' + (isImage ? ' has-thumb' : '') + '" href="projects.html#' + esc(p.id) + '">' +
      '<div><h3>' + esc(r.Title) + '</h3>' + (meta ? '<p class="meta">' + esc(meta) + '</p>' : '') + '</div>' +
      '<div>' + (r.OneLineDescription ? '<p>' + esc(r.OneLineDescription) + '</p>' : '') + (tags ? '<p class="tags">' + esc(tags) + '</p>' : '') + '</div>' +
      (isImage ? '<img class="thumb" src="' + esc(thumb) + '" alt="" loading="lazy" onerror="this.closest(\'.project-row\').classList.remove(\'has-thumb\');this.remove()">' : '') +
      '</a>';
  }

  function listHtml(items, withThumb) {
    if (!items.length) return '<p class="empty">No projects to show yet.</p>';
    return '<div class="project-list">' + items.map(p => rowHtml(p, withThumb)).join('') + '</div>';
  }

  function detailHtml(p) {
    const r = p.rec;
    const tags = tagList(r).join(', ');
    const back = p.parent
      ? '<a class="back" href="projects.html#' + esc(p.parent.id) + '">&larr; ' + esc(p.parent.rec.Title) + '</a>'
      : '<a class="back" href="projects.html">&larr; All projects</a>';
    const sections = [
      ['Overview', r.Overview],
      ['Design and implementation', r.DesignImplementation],
      ['Challenges', r.Challenges]
    ].filter(s => String(s[1] || '').trim())
      .map(s => '<section><h2>' + s[0] + '</h2><p>' + esc(s[1]) + '</p></section>').join('');
    const link = safeUrl(r.LinkURL);

    return '<div class="wrap page-top">' + back +
      '<h1 class="page-title" tabindex="-1">' + esc(r.Title) + '</h1>' +
      (r.TeamOrg ? '<p class="meta">' + esc(r.TeamOrg) + '</p>' : '') +
      (r.OneLineDescription ? '<p class="lede">' + esc(r.OneLineDescription) + '</p>' : '') +
      (tags ? '<p class="tags">' + esc(tags) + '</p>' : '') +
      (p.children.length ? '' : mediaHtml(r)) +
      (sections ? '<div class="prose">' + sections + '</div>' : '') +
      (link ? '<p class="prose-link"><a class="text-link" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + esc(r.LinkLabel || 'View project') + '</a></p>' : '') +
      (p.children.length ? '<div class="sub-list">' + listHtml(p.children, true) + '</div>' : '') +
      '</div>';
  }

  // ---- Pages ----
  async function initProjects() {
    const root = document.getElementById('projects-root');
    if (!root) return;
    const items = await loadProjects();
    const byId = {};
    items.forEach(p => { byId[p.id] = p; });

    function route(scroll) {
      let id = '';
      try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
      const p = byId[id];
      if (p) {
        root.innerHTML = detailHtml(p);
        document.title = p.rec.Title + ' | Vidit Shah';
      } else {
        root.innerHTML = '<div class="wrap page-top"><h1 class="page-title" tabindex="-1">Projects</h1>' +
          '<div style="margin-top:2rem">' + listHtml(items.filter(x => !x.parent), true) + '</div></div>';
        document.title = 'Projects | Vidit Shah';
      }
      if (scroll) {
        window.scrollTo(0, 0);
        const h = root.querySelector('h1');
        if (h) h.focus({ preventScroll: true });
      }
    }

    window.addEventListener('hashchange', () => route(true));
    route(false);
  }

  // ---- Contact dialog ----
  function initContact() {
    const dlg = document.getElementById('contact-dialog');
    const open = document.getElementById('contact-open');
    if (!dlg || !open) return;

    open.addEventListener('click', () => {
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');
    });
    dlg.querySelector('.dialog-close').addEventListener('click', () => {
      if (typeof dlg.close === 'function') dlg.close();
      else dlg.removeAttribute('open');
    });
    // Click on the backdrop (the dialog element itself) closes it.
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg && typeof dlg.close === 'function') dlg.close();
    });

    dlg.querySelectorAll('.copy-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const value = btn.getAttribute('data-copy');
        try {
          await navigator.clipboard.writeText(value);
        } catch (err) {
          const ta = document.createElement('textarea');
          ta.value = value;
          ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e2) {}
          ta.remove();
        }
        btn.textContent = 'Copied';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initContact();
    const page = document.body.getAttribute('data-page');
    if (page === 'projects') initProjects();
  });
})();
