import { useRef, useState } from 'react';

export default function InstagramCarousel({ videos }) {
  const trackRef = useRef(null);

  function handleCarouselNav(dir) {
    if (trackRef.current) {
      const scrollAmount = 340;
      trackRef.current.scrollBy({ 
        left: dir * scrollAmount, 
        behavior: 'smooth' 
      });
    }
  }

  // Extrair o tipo e o identificador de posts, reels e vídeos do Instagram.
  function getInstagramMedia(url = '') {
    const match = url.match(/\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
    return match ? { type: match[1], id: match[2] } : null;
  }

  // Componente de Card individual
  function InstagramCard({ video }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    const media = getInstagramMedia(video.url);
    
    // Tentativas de URL de thumbnail (em ordem de preferência)
    const thumbnailUrls = [
      video.thumbnail,
      media ? `https://www.instagram.com/${media.type}/${media.id}/media/?size=l` : null,
      media ? `https://www.instagram.com/p/${media.id}/media/?size=l` : null
    ].filter(Boolean);

    const [thumbnailUrl, setThumbnailUrl] = useState(thumbnailUrls[0] || null);

    return (
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="instagram-link-card"
        title={video.title || 'Ver no Instagram'}
      >
        <div className="instagram-card-wrapper">
          {!imageError && thumbnailUrl ? (
            <img 
              src={thumbnailUrl}
              alt={video.title || 'Vídeo do Instagram'}
              className="instagram-card-image"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                const nextUrl = thumbnailUrls[thumbnailUrls.indexOf(thumbnailUrl) + 1];
                if (nextUrl) {
                  setThumbnailUrl(nextUrl);
                  setImageLoaded(false);
                } else {
                  setImageError(true);
                }
              }}
              style={{ 
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
            />
          ) : null}
          
          {!imageLoaded && (
            <div className="instagram-card-placeholder">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="4.4" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" />
              </svg>
              <p>Instagram</p>
            </div>
          )}
          
          <div className="instagram-card-overlay">
            <div className="instagram-play-button">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="instagram-card-title">{video.title || 'Ver vídeo'}</p>
          </div>
        </div>
      </a>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div style={{ padding: '40px', color: 'var(--muted)', textAlign: 'center' }}>
        Nenhum vídeo disponível
      </div>
    );
  }

  return (
    <div className="instagram-carousel-container">
      <button
        className="carousel-arrow prev"
        aria-label="Vídeos anteriores"
        onClick={() => handleCarouselNav(-1)}
        type="button"
      >
        &#10094;
      </button>

      <div className="instagram-carousel" ref={trackRef}>
        {videos.map((video, idx) => (
          <div
            key={video.url || `video-${idx}`}
            className="instagram-item"
          >
            <InstagramCard video={video} />
          </div>
        ))}
      </div>

      <button
        className="carousel-arrow next"
        aria-label="Próximos vídeos"
        onClick={() => handleCarouselNav(1)}
        type="button"
      >
        &#10095;
      </button>
    </div>
  );
}
