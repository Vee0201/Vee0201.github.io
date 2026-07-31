document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.nav-tab[data-filter]');
  const heroSection = document.getElementById('hero-section');
  const gridSection = document.getElementById('grid-section');
  const cards = document.querySelectorAll('.card');
  const footerLinks = document.querySelectorAll('[data-footer-filter]');
  const actionTargets = document.querySelectorAll('[data-nav-target]');

  function navigateToTab(targetFilter) {
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

    // Toggle view between Hero and Grid
    if (targetFilter === 'home') {
      heroSection.classList.remove('hidden');
      gridSection.classList.add('hidden');
    } else {
      heroSection.classList.add('hidden');
      gridSection.classList.remove('hidden');

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

  // CV tab switching (swap the embedded PDF + download link)
  const cvTabs = document.querySelectorAll('.cv-tab');
  const cvEmbed = document.getElementById('cv-embed');
  const cvDownloadLink = document.getElementById('cv-download-link');

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
      if (cvEmbed) cvEmbed.setAttribute('src', src);
      if (cvDownloadLink) {
        cvDownloadLink.setAttribute('href', src);
        cvDownloadLink.setAttribute('download', name);
      }
    });
  });

  // Last-updated dates, queried live from GitHub's commit history.
  // Falls back to whatever static text is already in the markup if the API call fails or is rate-limited.
  const GITHUB_REPO = 'Vee0201/Vee0201.github.io';

  function formatMonthYear(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  async function latestCommitDate(paths) {
    let latest = null;
    for (const path of paths) {
      try {
        const url = path
          ? `https://api.github.com/repos/${GITHUB_REPO}/commits?path=${encodeURIComponent(path)}&per_page=1`
          : `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=1`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const dateStr = data && data[0] && data[0].commit && data[0].commit.committer && data[0].commit.committer.date;
        if (dateStr) {
          const d = new Date(dateStr);
          if (!latest || d > latest) latest = d;
        }
      } catch (e) {
        // Network/API failure: silently keep whatever we already have.
      }
    }
    return latest;
  }

  (async () => {
    const cvLastUpdatedEl = document.getElementById('cv-last-updated');
    const footerLastUpdatedEl = document.getElementById('footer-last-updated');

    // CV panel: most recent commit touching either CV PDF.
    const cvDate = await latestCommitDate(['Assets/CV-1page.pdf', 'Assets/CV-2page.pdf']);
    if (cvLastUpdatedEl && cvDate) {
      cvLastUpdatedEl.textContent = `Last updated ${formatMonthYear(cvDate)}`;
    }

    // Footer: most recent commit anywhere in the repo (site content or CV pdfs).
    const repoDate = await latestCommitDate(['']);
    if (footerLastUpdatedEl && repoDate) {
      footerLastUpdatedEl.textContent = `Last updated ${formatMonthYear(repoDate)}`;
    }
  })();
});
