document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.nav-tab[data-filter]');
  const heroSection = document.getElementById('hero-section');
  const gridSection = document.getElementById('grid-section');
  const projectsSection = document.getElementById('projects-section');
  const experienceSection = document.getElementById('experience-section');
  const researchIntro = document.getElementById('research-intro');
  const detailView = document.getElementById('detail-view');
  const cards = document.querySelectorAll('.card');
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

      // Filter cards
      cards.forEach(card => {
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
  // content for a full detail view, populated from that card's matching
  // <template data-detail="...">. A Back button restores the tab the
  // person was on before opening it.
  const detailViewContent = document.getElementById('detail-view-content');
  const detailBackBtn = document.getElementById('detail-back-btn');
  const detailCards = document.querySelectorAll('.card-clickable[data-detail]');

  function openDetailView(templateId) {
    const template = document.getElementById(templateId);
    if (!template || !detailViewContent || !detailView) return;

    // Hide whichever main view is currently showing
    heroSection.classList.add('hidden');
    gridSection.classList.add('hidden');
    if (projectsSection) projectsSection.classList.add('hidden');
    if (experienceSection) experienceSection.classList.add('hidden');
    if (researchIntro) researchIntro.classList.add('hidden');

    detailViewContent.innerHTML = '';
    detailViewContent.appendChild(template.content.cloneNode(true));
    detailView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (detailBackBtn) detailBackBtn.focus();
  }

  function closeDetailView() {
    navigateToTab(currentFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  detailCards.forEach(card => {
    const templateId = card.getAttribute('data-detail');
    card.addEventListener('click', () => openDetailView(templateId));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetailView(templateId);
      }
    });
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

  // Contact Modal
  setupModal(
    [document.getElementById('contact-btn')],
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

  (async () => {
    const footerLastUpdatedEl = document.getElementById('footer-last-updated');

    // CV panel: one date per PDF, fetched independently so the text can switch with the active tab.
    const cvPaths = ['Assets/CV-1page.pdf', 'Assets/CV-2page.pdf'];
    const results = await Promise.all(cvPaths.map(p => latestCommitDate(p)));
    cvPaths.forEach((p, i) => { if (results[i]) cvDates[p] = results[i]; });

    const activeTab = document.querySelector('.cv-tab.active');
    if (activeTab) renderCvLastUpdated(activeTab.getAttribute('data-cv-src'));

    // Footer: most recent commit anywhere in the repo (site content or CV pdfs).
    const repoDate = await latestCommitDate('');
    if (footerLastUpdatedEl && repoDate) {
      footerLastUpdatedEl.textContent = `Last updated ${formatMonthYear(repoDate)}`;
    }
  })();
});
