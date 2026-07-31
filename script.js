document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.nav-tab[data-filter]');
  const heroSection = document.getElementById('hero-section');
  const gridSection = document.getElementById('grid-section');
  const cards = document.querySelectorAll('.card');
  const footerLinks = document.querySelectorAll('[data-footer-filter]');
  const actionTargets = document.querySelectorAll('[data-nav-target]');

  function navigateToTab(targetFilter) {
    tabs.forEach(tab => {
      const isActive = tab.getAttribute('data-filter') === targetFilter;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (targetFilter === 'home') {
      heroSection.classList.remove('hidden');
      gridSection.classList.add('hidden');
    } else {
      heroSection.classList.add('hidden');
      gridSection.classList.remove('hidden');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        card.classList.toggle('hidden', category !== targetFilter);
      });
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navigateToTab(tab.getAttribute('data-filter'));
    });
  });

  actionTargets.forEach(btn => {
    btn.addEventListener('click', () => {
      navigateToTab(btn.getAttribute('data-nav-target'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToTab(link.getAttribute('data-footer-filter'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

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

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(modal => {
        modal.classList.remove('show');
      });
      document.body.style.overflow = '';
    }
  });

  setupModal([document.getElementById('contact-btn')], document.getElementById('contact-modal'));
  setupModal([document.getElementById('cv-btn'), document.getElementById('hero-cv-btn')], document.getElementById('cv-modal'));

  const cvTabs = document.querySelectorAll('.cv-tab');
  const cvEmbed = document.getElementById('cv-embed');
  const cvDownloadLink = document.getElementById('cv-download-link');
  const cvFlavorEl = document.getElementById('cv-flavor');
  const cvLastUpdatedEl = document.getElementById('cv-last-updated');

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
      const dateStr = data?.[0]?.commit?.committer?.date;
      return dateStr ? new Date(dateStr) : null;
    } catch (e) {
      return null;
    }
  }

  (async () => {
    const footerLastUpdatedEl = document.getElementById('footer-last-updated');

    const cvPaths = ['Assets/CV-1page.pdf', 'Assets/CV-2page.pdf'];
    const results = await Promise.all(cvPaths.map(p => latestCommitDate(p)));
    cvPaths.forEach((p, i) => { if (results[i]) cvDates[p] = results[i]; });

    const activeTab = document.querySelector('.cv-tab.active');
    if (activeTab) renderCvLastUpdated(activeTab.getAttribute('data-cv-src'));

    const repoDate = await latestCommitDate('');
    if (footerLastUpdatedEl && repoDate) {
      footerLastUpdatedEl.textContent = `Last updated ${formatMonthYear(repoDate)}`;
    }
  })();
});
