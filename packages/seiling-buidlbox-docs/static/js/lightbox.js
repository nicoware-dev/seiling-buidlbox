/**
 * Image Lightbox Functionality
 * Handles full-screen image popups for documentation images
 */

function initializeLightbox() {
  // Create lightbox overlay element
  const lightboxOverlay = document.createElement('div');
  lightboxOverlay.className = 'lightbox-overlay';
  lightboxOverlay.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Close lightbox">×</button>
      <img class="lightbox-image" src="" alt="" />
      <div class="lightbox-caption"></div>
    </div>
  `;
  document.body.appendChild(lightboxOverlay);

  const lightboxContent = lightboxOverlay.querySelector('.lightbox-content');
  const lightboxImage = lightboxOverlay.querySelector('.lightbox-image');
  const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');
  const lightboxCaption = lightboxOverlay.querySelector('.lightbox-caption');

  // Function to open lightbox
  function openLightbox(imageSrc, imageAlt) {
    lightboxImage.src = imageSrc;
    lightboxImage.alt = imageAlt;
    lightboxCaption.textContent = imageAlt;
    lightboxOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  // Function to close lightbox
  function closeLightbox() {
    lightboxOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    // Clear image src after animation completes
    setTimeout(() => {
      if (!lightboxOverlay.classList.contains('active')) {
        lightboxImage.src = '';
      }
    }, 300);
  }

  // Add click listeners to all clickable images
  function addClickListeners() {
    const clickableImages = document.querySelectorAll('.clickable-image');
    clickableImages.forEach(img => {
      // Remove existing listeners to prevent duplicates
      img.removeEventListener('click', handleImageClick);
      img.addEventListener('click', handleImageClick);
    });
  }

  function handleImageClick(e) {
    e.preventDefault();
    const img = e.target;
    openLightbox(img.src, img.alt);
  }

  // Close lightbox when clicking close button
  lightboxClose.addEventListener('click', closeLightbox);

  // Close lightbox when clicking overlay (but not the image)
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
      closeLightbox();
    }
  });

  // Close lightbox with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Initialize click listeners
  addClickListeners();

  // Re-initialize when content changes (for SPA navigation)
  const observer = new MutationObserver(() => {
    addClickListeners();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Return cleanup function
  return () => {
    observer.disconnect();
    lightboxOverlay.remove();
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLightbox);
} else {
  initializeLightbox();
}

// Re-initialize on page navigation (for Docusaurus SPA)
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('load', initializeLightbox);
} 