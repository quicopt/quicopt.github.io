document.addEventListener('DOMContentLoaded', function() {
  // Set up mobile menu functionality first
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const navLinks = document.querySelectorAll('nav a');
  const navMenu = document.querySelector('.nav-links');

  // Toggle mobile menu
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', function() {
      mobileMenuButton.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking a link
  const closeMenu = () => {
    if (mobileMenuButton) {
      mobileMenuButton.classList.remove('active');
    }
    if (navMenu) {
      navMenu.classList.remove('active');
    }
  };

  // Set up navigation link handlers
  navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      const href = this.getAttribute('href');
      const isHashLink = href && href.startsWith('#');

      if (!isHashLink) {
        // Allow normal navigation for non-hash links (e.g., language switch, external links)
        closeMenu();
        return;
      }

      event.preventDefault();
      const targetElement = document.querySelector(href);
      if (targetElement) {
        closeMenu();
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
  const isManualSwitch = sessionStorage.getItem('quicopt-manual-switch');
  if (isManualSwitch) {
    sessionStorage.removeItem('quicopt-manual-switch');
    return; // Don't auto-redirect after manual switch
  }
  
  // Automatic language detection: if on English page and browser language is German, redirect
  if (isEnglishPage) {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('de')) {
      // Redirect to German page
      window.location.href = 'de.html';
      return;
    }
  }
  
  // Mark manual language switches to prevent auto-redirect on the next page
  const languageLinks = document.querySelectorAll('a[href="de.html"], a[href="index.html"]');
  languageLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Mark this as a manual switch to prevent auto-redirect on the next page
      sessionStorage.setItem('quicopt-manual-switch', 'true');
    });
  });
});