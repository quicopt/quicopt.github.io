document.addEventListener('DOMContentLoaded', function() {
  // Set up navigation link handlers
  const navLinks = document.querySelectorAll('nav a');

  navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      const href = this.getAttribute('href');
      const isHashLink = href && href.startsWith('#');

      if (!isHashLink) {
        // Allow normal navigation for non-hash links (e.g., language switch, external links)
        return;
      }

      event.preventDefault();
      const targetElement = document.querySelector(href);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Language detection and redirect logic (after mobile menu is set up)
  const currentPath = window.location.pathname;
  const isEnglishPage = currentPath === '/' || currentPath.endsWith('/index.html') || currentPath.endsWith('/');
  const isGermanPage = currentPath.endsWith('/de.html');
  
  // Check if this is a manual language switch (user clicked a language link)
  const isManualSwitch = sessionStorage.getItem('quicopt-manual-switch') === 'true';
  if (isManualSwitch) {
    // Clear the flag but DO NOT return; we still need to attach event listeners
    sessionStorage.removeItem('quicopt-manual-switch');
  }
  
  // Automatic language detection: if on English page and browser language is German, redirect
  if (!isManualSwitch && isEnglishPage) {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('de')) {
      // Redirect to German page
      window.location.href = 'de.html';
      return;
    }
  }
  
  // Mark manual language switches to prevent auto-redirect on the next page
  const languageLinks = document.querySelectorAll('.language-link');
  languageLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Mark this as a manual switch to prevent auto-redirect on the next page
      sessionStorage.setItem('quicopt-manual-switch', 'true');
    });
  });

  // Swap benchmark image src on hover to avoid overlay misalignment
  const benchmarkImages = document.querySelectorAll('img.benchmark-swap');
  benchmarkImages.forEach(img => {
    const originalSrc = img.getAttribute('src');
    const hoverSrc = img.getAttribute('data-hover');
    if (!hoverSrc) return;

    img.addEventListener('mouseenter', () => {
      img.setAttribute('src', hoverSrc);
    });
    img.addEventListener('mouseleave', () => {
      img.setAttribute('src', originalSrc);
    });
    // Touch devices: tap toggles between images
    img.addEventListener('touchstart', () => {
      const current = img.getAttribute('src');
      img.setAttribute('src', current === originalSrc ? hoverSrc : originalSrc);
    }, { passive: true });
  });

  // Inline submit for Formspree forms (both languages)
  const contactForms = document.querySelectorAll('#contact form[action^="https://formspree.io/"]');
  contactForms.forEach(form => {
    const statusEl = document.createElement('div');
    statusEl.className = 'form-status';
    form.appendChild(statusEl);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusEl.textContent = '';
      statusEl.classList.remove('success', 'error');

      const isGerman = !!form.closest('html[lang="de"]');
      const formData = new FormData(form);

      // reCAPTCHA v3: execute and attach token
      const siteKey = form.getAttribute('data-recaptcha-sitekey');
      if (!window.grecaptcha || !siteKey) {
        statusEl.textContent = isGerman ? 'reCAPTCHA nicht geladen.' : 'reCAPTCHA not loaded.';
        statusEl.classList.add('error');
        return;
      }
      try {
        await new Promise(resolve => window.grecaptcha.ready(resolve));
        const token = await window.grecaptcha.execute(siteKey, { action: 'submit' });
        formData.set('g-recaptcha-response', token);
      } catch (err) {
        statusEl.textContent = isGerman ? 'Fehler bei reCAPTCHA.' : 'reCAPTCHA error.';
        statusEl.classList.add('error');
        return;
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.reset();
          statusEl.textContent = isGerman ? 'Danke! Ihre Nachricht wurde gesendet.' : 'Thank you! Your message has been sent.';
          statusEl.classList.add('success');
        } else {
          const data = await response.json().catch(() => ({}));
          const msg = (data && data.errors && data.errors[0] && data.errors[0].message) || response.statusText || 'Submission failed.';
          statusEl.textContent = isGerman ? `Fehler: ${msg}` : `Error: ${msg}`;
          statusEl.classList.add('error');
        }
      } catch (err) {
        statusEl.textContent = isGerman ? 'Netzwerkfehler. Bitte später erneut versuchen.' : 'Network error. Please try again later.';
        statusEl.classList.add('error');
      }
    });
  });
});