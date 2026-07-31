document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.nav-tab');
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

  // Contact Modal
  const contactBtn = document.getElementById('contact-btn');
  const contactModal = document.getElementById('contact-modal');
  const closeBtn = document.querySelector('.close-btn');

  if (contactBtn && contactModal && closeBtn) {
    const openModal = () => {
      contactModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      contactModal.classList.remove('show');
      document.body.style.overflow = '';
    };

    contactBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
      if (event.target === contactModal) {
        closeModal();
      }
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && contactModal.classList.contains('show')) {
        closeModal();
      }
    });
  }
});
