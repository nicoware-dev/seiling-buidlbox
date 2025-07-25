import React, { useState, useEffect } from 'react';

const ClickableImage = ({ src, alt, title = "Click to view full size" }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = () => {
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        closeLightbox();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  return (
    <>
      <div className="architecture-image-container">
        <img
          src={src}
          alt={alt}
          title={title}
          className="architecture-image clickable-image"
          onClick={openLightbox}
          style={{
            cursor: 'pointer',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </div>

      {isLightboxOpen && (
        <div 
          className="lightbox-overlay active"
          onClick={closeLightbox}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close" 
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              ×
            </button>
            <img 
              className="lightbox-image" 
              src={src} 
              alt={alt} 
            />
            <div className="lightbox-caption">{alt}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClickableImage; 