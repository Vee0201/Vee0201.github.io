document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.nav-tab[data-filter]');
  const heroSection = document.getElementById('hero-section');
  const gridSection = document.getElementById('grid-section');
  const projectsSection = document.getElementById('projects-section');
  const experienceSection = document.getElementById('experience-section');
  const researchIntro = document.getElementById('research-intro');
  const detailView = document.getElementById('detail-view');
  const footerLinks = document.querySelectorAll('[data-footer-filter]');
  const actionTargets = document.querySelectorAll('[data-nav-target]');

  let currentFilter = 'home';

  function navigateToTab(targetFilter) {
    currentFilter = targetFilter;

    // Active state update
    tabs.forEach(tab => {
      if (tab.getAttribute('data-filter') === targetFilter) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    // Leaving the detail view whenever a nav tab is used
    if (detailView) detailView.classList.add('hidden');

    // Toggle between Hero, Grid, Projects, and Experience ribbon views
    if (targetFilter === 'home') {
      heroSection.classList.remove('hidden');
      gridSection.classList.add('hidden');
      if (projectsSection) projectsSection.classList.add('hidden');
      if (experienceSection) experienceSection.classList.add('hidden');
      if (researchIntro) researchIntro.classList.add('hidden');
    } else if (targetFilter === 'experience') {
      heroSection.classList.add('hidden');
      gridSection.classList.add('hidden');
      if (projectsSection) projectsSection.classList.add('hidden');
      if (experienceSection) experienceSection.classList.remove('hidden');
      if (researchIntro) researchIntro.classList.add('hidden');
    } else if (targetFilter === 'projects') {
      heroSection.classList.add('hidden');
      gridSection.classList.add('hidden');
      if (projectsSection) projectsSection.classList.remove('hidden');
      if (experienceSection) experienceSection.classList.add('hidden');
      if (researchIntro) researchIntro.classList.add('hidden');
    } else {
      heroSection.classList.add('hidden');
      gridSection.classList.remove('hidden');
      if (projectsSection) projectsSection.classList.add('hidden');
      if (experienceSection) experienceSection.classList.add('hidden');

      // Research summary panel only shows on the Research tab
      if (researchIntro) {
        researchIntro.classList.toggle('hidden', targetFilter !== 'research');
      }

      // Filter cards (live query — includes cards injected after page load,
      // e.g. Research cards rendered from the spreadsheet)
      document.querySelectorAll('.card').forEach(card => {
        const category = card.getAttribute('data-category');
        if (category === targetFilter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    }
  }

  // Navbar clicks
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');
      navigateToTab(filter);
    });
  });

  // Action button clicks (e.g. "View research ->")
  actionTargets.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-nav-target');
      navigateToTab(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Footer navigation link clicks
  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = link.getAttribute('data-footer-filter');
      navigateToTab(filter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Detail View: clicking a research/project card swaps the current page
  // content for a full detail view. Research, Projects, and Side Projects
  // are rendered dynamically from the spreadsheet (see the sheet-data
  // section below), so instead of static <template> elements, each
  // rendered card's detail HTML is kept in `detailStore` keyed by a
  // generated id, and clicks are handled via delegation since the cards
  // don't exist yet at page-load time.
  const detailViewContent = document.getElementById('detail-view-content');
  const detailBackBtn = document.getElementById('detail-back-btn');
  const detailStore = {};

  function openDetailView(id) {
    const entry = detailStore[id];
    if (!entry || !detailViewContent || !detailView) return;

    heroSection.classList.add('hidden');
    gridSection.classList.add('hidden');
    if (projectsSection) projectsSection.classList.add('hidden');
    if (experienceSection) experienceSection.classList.add('hidden');
    if (researchIntro) researchIntro.classList.add('hidden');

    detailViewContent.innerHTML = entry.html;
    detailView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (detailBackBtn) detailBackBtn.focus();
  }

  function closeDetailView() {
    navigateToTab(currentFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card-clickable[data-detail-id]');
    if (card) openDetailView(card.getAttribute('data-detail-id'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest && e.target.closest('.card-clickable[data-detail-id]');
    if (card) {
      e.preventDefault();
      openDetailView(card.getAttribute('data-detail-id'));
    }
  });

  if (detailBackBtn) detailBackBtn.addEventListener('click', closeDetailView);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailView && !detailView.classList.contains('hidden')) {
      closeDetailView();
    }
  });

  // Generic modal setup: pass trigger button(s), the modal element, and its close button
  function setupModal(triggers, modal) {
    if (!modal) return;
    const closeBtn = modal.querySelector('.close-btn');
    if (!closeBtn) return;

    const openModal = () => {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    };

    triggers.forEach(trigger => {
      if (trigger) trigger.addEventListener('click', openModal);
    });
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
      }
    });
  }

  // Contact Modal — opened from either the header tab or the hero's
  // "Get In Touch" button (formerly a plain mailto link).
  setupModal(
    [document.getElementById('contact-btn'), document.getElementById('hero-contact-btn')],
    document.getElementById('contact-modal')
  );

  // CV Modal (opened from the nav tab or the hero "Download CV" button)
  setupModal(
    [document.getElementById('cv-btn'), document.getElementById('hero-cv-btn')],
    document.getElementById('cv-modal')
  );

  // CV tab switching (swap the embedded PDF, download link, flavor text, and last-updated date)
  const cvTabs = document.querySelectorAll('.cv-tab');
  const cvEmbed = document.getElementById('cv-embed');
  const cvDownloadLink = document.getElementById('cv-download-link');
  const cvFlavorEl = document.getElementById('cv-flavor');
  const cvLastUpdatedEl = document.getElementById('cv-last-updated');

  // Populated once the GitHub API calls below resolve; keyed by PDF path.
  const cvDates = {};

  function renderCvLastUpdated(src) {
    if (!cvLastUpdatedEl) return;
    const d = cvDates[src];
    if (d) {
      cvLastUpdatedEl.textContent = `• Last updated ${formatMonthYear(d)}`;
    }
  }

  cvTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      cvTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const src = tab.getAttribute('data-cv-src');
      const name = tab.getAttribute('data-cv-name');
      const flavor = tab.getAttribute('data-cv-flavor');

      if (cvEmbed) cvEmbed.setAttribute('src', src);
      if (cvDownloadLink) {
        cvDownloadLink.setAttribute('href', src);
        cvDownloadLink.setAttribute('download', name);
      }
      if (cvFlavorEl && flavor) cvFlavorEl.textContent = flavor;
      renderCvLastUpdated(src);
    });
  });

  // Last-updated dates, queried live from GitHub's commit history.
  // Falls back to whatever static text is already in the markup if the API call fails or is rate-limited.
  const GITHUB_REPO = 'Vee0201/Vee0201.github.io';

  function formatMonthYear(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  async function latestCommitDate(path) {
    try {
      const url = path
        ? `https://api.github.com/repos/${GITHUB_REPO}/commits?path=${encodeURIComponent(path)}&per_page=1`
        : `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const dateStr = data && data[0] && data[0].commit && data[0].commit.committer && data[0].commit.committer.date;
      return dateStr ? new Date(dateStr) : null;
    } catch (e) {
      // Network/API failure: caller keeps whatever fallback text is already showing.
      return null;
    }
  }

  // Dark mode toggle. Preference is remembered via localStorage so it
  // persists across visits; falls back to light mode if nothing is stored.
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const THEME_KEY = 'theme-preference';

  function applyTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', String(isDark));
  }

  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') applyTheme(true);
  } catch (e) {
    // localStorage unavailable (e.g. privacy mode) — default stays light.
  }
  document.documentElement.classList.remove('dark-mode-pending');

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark-mode');
      applyTheme(isDark);
      try {
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
      } catch (e) {
        // Ignore storage failures; toggle still works for the current session.
      }
    });
  }

  // ===== Spreadsheet-driven content (Research, Projects, Coursework/Skills) =====
  // Data lives in a Google Sheet, one tab per section. Each tab is read via
  // Google's CSV export endpoint, parsed, and rendered into the matching
  // container. Experience/Leadership/Teaching stay hardcoded in the HTML —
  // they're one-off layouts, not repeating list content.
  const SHEET_ID = '18qeKeF1IQj3G9GKwxpjSoNg5a9C0PNUNtdYIhEOycC8';

  function sheetCsvUrl(sheetName, bust) {
    const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    // Only bust caching when explicitly asked to (manual refresh button) —
    // normal page loads should be allowed to hit browser/CDN cache so
    // repeat visits aren't paying for a full network round-trip every time.
    return bust ? `${base}&_ts=${Date.now()}` : base;
  }

  // Minimal RFC4180 CSV parser — handles quoted fields containing commas,
  // newlines, and escaped ("") quotes, which Google's CSV export produces
  // for any multi-line or comma-containing cell.
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else { inQuotes = false; }
        } else {
          field += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field); field = '';
      } else if (ch === '\r') {
        // ignore; \n (below) ends the row
      } else if (ch === '\n') {
        row.push(field); field = '';
        rows.push(row); row = [];
      } else {
        field += ch;
      }
    }
    if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
    return rows;
  }

  function csvToObjects(text) {
    const rows = parseCSV(text.trim());
    if (rows.length === 0) return [];
    const headers = rows[0].map(h => h.trim());
    return rows.slice(1)
      .filter(r => r.some(cell => (cell || '').trim() !== ''))
      .map(r => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = (r[i] || '').trim(); });
        return obj;
      });
  }

  async function fetchSheet(sheetName, bust) {
    try {
      const res = await fetch(sheetCsvUrl(sheetName, bust));
      if (!res.ok) return [];
      return csvToObjects(await res.text());
    } catch (e) {
      // Network failure, sheet not published, tab renamed, etc. — render
      // functions below treat an empty array as "nothing yet" rather than
      // throwing, so the rest of the site still works.
      return [];
    }
  }

  // localStorage cache so returning visitors see content instantly (zero
  // network wait) instead of a "Loading…" flash on every single visit.
  // Page load renders from cache immediately, then quietly re-fetches in
  // the background and updates if anything changed (stale-while-revalidate).
  const SHEET_CACHE_PREFIX = 'sheet-cache:';

  function getCachedSheet(sheetName) {
    try {
      const raw = localStorage.getItem(SHEET_CACHE_PREFIX + sheetName);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCachedSheet(sheetName, records) {
    try {
      localStorage.setItem(SHEET_CACHE_PREFIX + sheetName, JSON.stringify(records));
    } catch (e) {
      // Storage unavailable/full — cache is a nice-to-have, not required.
    }
  }

  // Renders instantly from cache (if any), then fetches fresh data.
  // bust=true forces a network round-trip (used by the manual refresh
  // button) and always overwrites the cache with the new result. On a
  // normal page load (bust=false), a failed/empty fetch doesn't blank out
  // whatever cached content is already showing.
  function loadSection(sheetName, renderFn, bust) {
    if (!bust) {
      const cached = getCachedSheet(sheetName);
      if (cached) renderFn(cached);
    }
    return fetchSheet(sheetName, bust).then(records => {
      const hadCache = !!getCachedSheet(sheetName);
      if (records.length || bust || !hadCache) {
        renderFn(records);
        setCachedSheet(sheetName, records);
      }
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function splitPipe(str) {
    return (str || '').split('|').map(s => s.trim()).filter(Boolean);
  }

  function buildTagsHtml(tagsStr) {
    return splitPipe(tagsStr).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join('');
  }

  function buildGalleryHtml(urls) {
    return urls.filter(Boolean)
      .map((u, i) => `<img src="${escapeHtml(u)}" alt="Gallery image ${i + 1}">`)
      .join('');
  }

  function buildLinkSectionHtml(linkUrl, linkLabel) {
    if (!linkUrl) return '';
    return `<div class="detail-section"><h3>Links</h3><p><a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkLabel || 'View')}</a></p></div>`;
  }

  function renderResearchFocus(records) {
    const textEl = document.getElementById('research-focus-text');
    const tagsEl = document.getElementById('research-focus-tags');
    if (!records.length) {
      if (textEl) textEl.textContent = 'Add a row to the ResearchFocus sheet to populate this.';
      return;
    }
    const r = records[0];
    if (textEl) textEl.textContent = r['SummaryText'] || '';
    if (tagsEl) tagsEl.innerHTML = buildTagsHtml(r['Tags (separate with |)']);
  }

  function renderResearchCards(records) {
    const container = document.getElementById('research-cards-container');
    if (!container) return;
    if (!records.length) {
      container.innerHTML = '<p class="data-loading-note">No research entries yet — add a row to the Research sheet.</p>';
      return;
    }
    container.innerHTML = records.map((r, i) => {
      const id = `research-${i}`;
      const tagsHtml = buildTagsHtml(r['Tags (separate with |)']);
      const imageUrl = r['ImageURL1'] || '';
      detailStore[id] = {
        html: `
          <span class="detail-eyebrow">${escapeHtml(r['LabOrg'])}</span>
          <h2 class="detail-title">${escapeHtml(r['Title'])}</h2>
          <div class="detail-gallery">${buildGalleryHtml([r['ImageURL1'], r['ImageURL2'], r['ImageURL3']])}</div>
          <div class="tags detail-tags">${tagsHtml}</div>
          <div class="detail-section"><h3>Overview</h3><p>${escapeHtml(r['Overview'])}</p></div>
          <div class="detail-section"><h3>Methodology</h3><p>${escapeHtml(r['Methodology'])}</p></div>
          <div class="detail-section"><h3>Results &amp; Outcomes</h3><p>${escapeHtml(r['ResultsOutcomes'])}</p></div>
          ${buildLinkSectionHtml(r['LinkURL'], r['LinkLabel'])}
        `
      };
      return `
        <article class="card card-clickable" data-category="research" data-detail-id="${id}" tabindex="0" role="button" aria-haspopup="dialog">
          <div class="card-media">
            ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(r['Title'])}">` : ''}
          </div>
          <div class="card-body">
            <span class="sub-header">${escapeHtml(r['LabOrg'])}</span>
            <h2 class="card-title">${escapeHtml(r['Title'])}</h2>
            <p class="card-description">${escapeHtml(r['OneLineDescription'])}</p>
            <div class="tags">${tagsHtml}</div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderProjectCards(records) {
    const container = document.getElementById('projects-cards-container');
    if (!container) return;
    if (!records.length) {
      container.innerHTML = '<p class="data-loading-note">No projects yet — add a row to the Projects sheet.</p>';
      return;
    }
    container.innerHTML = records.map((r, i) => {
      const id = `project-${i}`;
      const tagsHtml = buildTagsHtml(r['Tags (separate with |)']);
      detailStore[id] = {
        html: `
          <span class="detail-eyebrow">${escapeHtml(r['TeamOrg'])}</span>
          <h2 class="detail-title">${escapeHtml(r['Title'])}</h2>
          <div class="detail-gallery">${buildGalleryHtml([r['ImageURL1'], r['ImageURL2']])}</div>
          <div class="tags detail-tags">${tagsHtml}</div>
          <div class="detail-section"><h3>Overview</h3><p>${escapeHtml(r['Overview'])}</p></div>
          <div class="detail-section"><h3>Design &amp; Implementation</h3><p>${escapeHtml(r['DesignImplementation'])}</p></div>
          <div class="detail-section"><h3>Challenges</h3><p>${escapeHtml(r['Challenges'])}</p></div>
          ${buildLinkSectionHtml(r['LinkURL'], r['LinkLabel'])}
        `
      };
      return `
        <article class="card card-clickable" data-detail-id="${id}" tabindex="0" role="button" aria-haspopup="dialog">
          <div class="card-media text-banner">
            <span class="banner-text">${escapeHtml(r['BannerLabel'] || 'PROJECT')}</span>
          </div>
          <div class="card-body">
            <span class="sub-header">${escapeHtml(r['TeamOrg'])}</span>
            <h2 class="card-title">${escapeHtml(r['Title'])}</h2>
            <p class="card-description">${escapeHtml(r['OneLineDescription'])}</p>
            <div class="tags">${tagsHtml}</div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderSideProjectCards(records) {
    const container = document.getElementById('side-projects-cards-container');
    if (!container) return;
    if (!records.length) {
      container.innerHTML = '<p class="data-loading-note">No side projects yet — add a row to the SideProjects sheet.</p>';
      return;
    }
    container.innerHTML = records.map((r, i) => {
      const id = `side-project-${i}`;
      const tagsHtml = buildTagsHtml(r['Tags (separate with |)']);
      detailStore[id] = {
        html: `
          <span class="detail-eyebrow">${escapeHtml(r['SoloOrWeekendLabel'])}</span>
          <h2 class="detail-title">${escapeHtml(r['Title'])}</h2>
          <div class="detail-gallery">${buildGalleryHtml([r['ImageURL1'], r['ImageURL2']])}</div>
          <div class="tags detail-tags">${tagsHtml}</div>
          <div class="detail-section"><h3>What it is</h3><p>${escapeHtml(r['WhatItIs'])}</p></div>
          <div class="detail-section"><h3>What I learned</h3><p>${escapeHtml(r['WhatILearned'])}</p></div>
          ${buildLinkSectionHtml(r['LinkURL'], r['LinkLabel'])}
        `
      };
      return `
        <article class="card card-clickable" data-detail-id="${id}" tabindex="0" role="button" aria-haspopup="dialog">
          <div class="card-media text-banner">
            <span class="banner-text">${escapeHtml(r['BannerLabel'] || 'TANGENT')}</span>
          </div>
          <div class="card-body">
            <span class="sub-header">${escapeHtml(r['SoloOrWeekendLabel'])}</span>
            <h2 class="card-title">${escapeHtml(r['Title'])}</h2>
            <p class="card-description">${escapeHtml(r['OneLineDescription'])}</p>
            <div class="tags">${tagsHtml}</div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Coursework/Skills sheets have verbose headers (e.g. "Group (Core /
  // Advanced-Graduate / Math & Stats)"), so rather than matching that exact
  // string, this reads by column position: first column = group, second =
  // item name. Robust to the exact header wording.
  function renderGroupedList(containerId, records, groupOrder) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!records.length) {
      container.innerHTML = '<p class="data-loading-note">No entries yet.</p>';
      return;
    }
    const groups = {};
    groupOrder.forEach(g => { groups[g] = []; });
    records.forEach(r => {
      const vals = Object.values(r);
      const groupRaw = (vals[0] || '').trim();
      const name = (vals[1] || '').trim();
      if (!name) return;
      const matched = groupOrder.find(g => g.toLowerCase() === groupRaw.toLowerCase());
      groups[matched || groupOrder[0]].push(name);
    });
    const html = groupOrder
      .filter(g => groups[g].length)
      .map(g => `
        <div class="coursework-group">
          <span class="ribbon-list-label">${escapeHtml(g)}</span>
          <ul class="coursework-list">
            ${groups[g].map(name => `<li>${escapeHtml(name)}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    container.innerHTML = html || '<p class="data-loading-note">No entries yet.</p>';
  }

  // Fetches and renders all spreadsheet-driven sections. Reusable — called
  // once on page load (bust=false, cache-first), and again whenever the
  // person clicks the refresh button (bust=true, forces fresh data).
  function loadAllSheetData(bust) {
    return Promise.all([
      loadSection('Research', renderResearchCards, bust),
      loadSection('ResearchFocus', renderResearchFocus, bust),
      loadSection('Projects', renderProjectCards, bust),
      loadSection('SideProjects', renderSideProjectCards, bust),
      loadSection('Coursework', records =>
        renderGroupedList('coursework-groups-container', records, ['Core', 'Advanced-Graduate', 'Math & Stats']), bust),
      loadSection('Skills', records =>
        renderGroupedList('skills-groups-container', records, ['Software & Tools', 'Programming Languages', 'Lab & Hardware']), bust),
    ]);
  }

  // Reconciles card visibility after (re)rendering — catches cards
  // injected while a different tab was active, without interrupting an
  // already-open detail view.
  function reconcileVisibilityAfterDataLoad() {
    if (!detailView || detailView.classList.contains('hidden')) {
      navigateToTab(currentFilter);
    }
  }

  // Manual "refresh content" button — re-fetches the spreadsheet on
  // demand rather than requiring a full page reload.
  const refreshBtn = document.getElementById('refresh-content-btn');
  const refreshStatus = document.getElementById('refresh-status');
  let refreshStatusTimer = null;

  function showRefreshStatus(text) {
    if (!refreshStatus) return;
    clearTimeout(refreshStatusTimer);
    refreshStatus.textContent = text;
    refreshStatus.classList.add('show');
    refreshStatusTimer = setTimeout(() => refreshStatus.classList.remove('show'), 2500);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      if (refreshBtn.classList.contains('is-refreshing')) return;
      refreshBtn.classList.add('is-refreshing');
      showRefreshStatus('Refreshing…');
      try {
        await loadAllSheetData(true);
        reconcileVisibilityAfterDataLoad();
        showRefreshStatus('Updated');
      } catch (e) {
        showRefreshStatus('Refresh failed — try again');
      } finally {
        refreshBtn.classList.remove('is-refreshing');
      }
    });
  }

  // Back to Top — appears once the person has scrolled past the header,
  // scrolls smoothly back up when clicked.
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('show', window.scrollY > 400);
    });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  (async () => {
    const footerLastUpdatedEl = document.getElementById('footer-last-updated');

    // CV panel: one date per PDF, fetched independently so the text can switch with the active tab.
    const cvPaths = ['assets/CV-1page.pdf', 'assets/CV-2page.pdf'];
    const cvDatesPromise = Promise.all(cvPaths.map(p => latestCommitDate(p)));

    // Spreadsheet-driven sections — fetched in parallel with everything else.
    const sheetPromise = loadAllSheetData(false);

    const results = await cvDatesPromise;
    cvPaths.forEach((p, i) => { if (results[i]) cvDates[p] = results[i]; });

    const activeTab = document.querySelector('.cv-tab.active');
    if (activeTab) renderCvLastUpdated(activeTab.getAttribute('data-cv-src'));

    // Footer: most recent commit anywhere in the repo (site content or CV pdfs).
    const repoDate = await latestCommitDate('');
    if (footerLastUpdatedEl && repoDate) {
      footerLastUpdatedEl.textContent = `Last updated ${formatMonthYear(repoDate)}`;
    }

    // Wait for all sheet-driven sections to finish rendering, then
    // re-apply the current tab's visibility rules — this catches Research
    // cards that were injected after the page's initial tab/card
    // filtering already ran (e.g. person is already on the Research tab
    // while the fetch is still in flight).
    await sheetPromise;
    reconcileVisibilityAfterDataLoad();
  })();
});
