// Lead form submission handler
const leadForm = document.getElementById('leadForm');
const formMessage = document.getElementById('formMessage');

if (leadForm) {
  leadForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Simulate sending data and show success/fail feedback
    formMessage.textContent = '';
    formMessage.className = 'form-message';

    // Simple validation (already using 'required', just simulate)
    const name = leadForm.name.value.trim();
    const email = leadForm.email.value.trim();
    if (!name || !email) {
      formMessage.textContent = 'Please provide your name and email.';
      formMessage.classList.add('error');
      return;
    }

    formMessage.textContent = 'Thank you! We have received your request.';
    formMessage.classList.add('success');
    leadForm.reset();
  });
}

// Smooth scrolling for nav links
const navLinks = document.querySelectorAll('nav a[href^="#"]');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      window.scrollTo({
        top: targetEl.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  });
});
