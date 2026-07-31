document.addEventListener('DOMContentLoaded', () => {
  // Tab Filtering Logic
  const tabs = document.querySelectorAll('.nav-tab');
  const cards = document.querySelectorAll('.card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Contact Modal Interactivity
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
