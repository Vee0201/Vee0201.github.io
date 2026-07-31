document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.nav-tab');
  const cards = document.querySelectorAll('.card');
  const footerLinks = document.querySelectorAll('[data-footer-filter]');

  function applyFilter(filterCategory) {
    tabs.forEach(t => {
      if (t.getAttribute('data-filter') === filterCategory) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      if (filterCategory === 'all' || category === filterCategory) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  // Header Navigation Tab Click
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');
      applyFilter(filter);
    });
  });

  // Footer Navigation Tab Click
  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = link.getAttribute('data-footer-filter');
      applyFilter(filter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Contact Modal
  const contactBtn = document.getElementById('contact-btn');
  const contactModal = document.getElementById('contact-modal');
  const closeBtn = document.querySelector('.close-btn');

  if (contactBtn && contactModal && closeBtn) {
    contactBtn.addEventListener('click', () => {
      contactModal.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
      contactModal.classList.remove('show');
    });

    window.addEventListener('click', (event) => {
      if (event.target === contactModal) {
        contactModal.classList.remove('show');
      }
    });
  }
});
