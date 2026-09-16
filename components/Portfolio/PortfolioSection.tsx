import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Lock } from 'lucide-react';
import type { Portfolio, Project, MediaItem } from '../../portfolioTypes';
import { useLanguage } from '../../LanguageContext';

export const PortfolioSection: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio>({ projects: [] });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxMedia, setLightboxMedia] = useState<MediaItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio/get');
      const data = await response.json();
      setPortfolio(data);
      if (data.projects.length > 0) {
        setSelectedProjectId(data.projects[0].id);
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = portfolio.projects.find(p => p.id === selectedProjectId);

  const scrollProjects = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 200;
    const newScrollLeft = scrollContainerRef.current.scrollLeft + 
      (direction === 'left' ? -scrollAmount : scrollAmount);
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <section style={styles.section}>
        <div style={styles.loading}>{t('portfolio_loading')}</div>
      </section>
    );
  }

  return (
    <>
      <section style={styles.section} id="portfolio">
        <div style={styles.container}>
          <div style={styles.header}>
            <h2 style={styles.sectionTitle}>{t('portfolio_title')}</h2>
            <a 
              href="/admin" 
              style={styles.adminBtn}
              title="Admin Login"
            >
              <Lock size={16} />
              <span>Admin</span>
            </a>
          </div>

          {portfolio.projects.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyTitle}>{t('portfolio_empty_title')}</p>
              <p style={styles.emptyText}>
                {t('portfolio_empty_text')}
              </p>
              <a href="/admin" style={styles.emptyButton}>
                <Lock size={18} />
                <span>{t('portfolio_empty_btn')}</span>
              </a>
            </div>
          ) : (
            <>
          
          {/* Project Tabs */}
          <div style={styles.tabsWrapper}>
            <button 
              onClick={() => scrollProjects('left')} 
              style={styles.scrollBtn}
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div style={styles.tabsContainer} ref={scrollContainerRef}>
              {portfolio.projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  style={{
                    ...styles.tab,
                    ...(selectedProjectId === project.id ? styles.tabActive : {}),
                  }}
                >
                  <span style={styles.tabTitle}>{project.title}</span>
                  {project.subtitle && (
                    <span style={styles.tabSubtitle}>{project.subtitle}</span>
                  )}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => scrollProjects('right')} 
              style={styles.scrollBtn}
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Media Grid */}
          {selectedProject && portfolio.projects.length > 0 && (
            <div style={styles.mediaGrid}>
              {selectedProject.media.length === 0 ? (
                <p style={styles.emptyText}>{t('portfolio_no_media')}</p>
              ) : (
                selectedProject.media.map((media, index) => (
                  <div
                    key={index}
                    style={styles.mediaItem}
                    onClick={() => setLightboxMedia(media)}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={media.caption || ''}
                        style={styles.mediaImage}
                        loading="lazy"
                      />
                    ) : (
                      <div style={styles.videoWrapper}>
                        <video
                          src={media.url}
                          style={styles.mediaImage}
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                        <div style={styles.playIcon}>▶</div>
                      </div>
                    )}
                    {media.caption && (
                      <div style={styles.mediaCaption}>{media.caption}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxMedia && (
        <div style={styles.lightbox} onClick={() => setLightboxMedia(null)}>
          <button 
            style={styles.closeBtn} 
            onClick={() => setLightboxMedia(null)}
            aria-label="Close"
          >
            <X size={32} />
          </button>
          <div style={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {lightboxMedia.type === 'image' ? (
              <img
                src={lightboxMedia.url}
                alt={lightboxMedia.caption || ''}
                style={styles.lightboxMedia}
              />
            ) : (
              <video
                src={lightboxMedia.url}
                style={styles.lightboxMedia}
                controls
                autoPlay
              />
            )}
            {lightboxMedia.caption && (
              <p style={styles.lightboxCaption}>{lightboxMedia.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  section: {
    padding: '80px 20px',
    background: '#F2F0EB',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
    marginBottom: '60px',
  },
  sectionTitle: {
    fontSize: '48px',
    fontWeight: '700',
    textAlign: 'center' as const,
    letterSpacing: '2px',
    margin: 0,
    color: '#6B5D4F',
  },
  adminBtn: {
    position: 'absolute' as const,
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'rgba(139, 115, 85, 0.1)',
    color: '#8B7355',
    border: '1px solid rgba(139, 115, 85, 0.3)',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '80px 20px',
    background: '#E8DCC8',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(107, 93, 79, 0.15)',
    border: '2px solid #D4C5B0',
  },
  emptyTitle: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#6B5D4F',
    marginBottom: '16px',
  },
  emptyText: {
    fontSize: '18px',
    color: '#8B7355',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    background: '#C9A959',
    color: 'white',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(201, 169, 89, 0.3)',
  },
  tabsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '50px',
    position: 'relative' as const,
  },
  scrollBtn: {
    padding: '12px',
    background: '#E8DCC8',
    border: '1px solid #D4C5B0',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    color: '#8B7355',
  },
  tabsContainer: {
    display: 'flex',
    gap: '15px',
    overflowX: 'auto' as const,
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
    flex: 1,
    padding: '10px 0',
  },
  tab: {
    padding: '16px 32px',
    background: '#E8DCC8',
    border: '2px solid #D4C5B0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    minWidth: 'fit-content',
    color: '#6B5D4F',
  },
  tabActive: {
    background: '#C9A959',
    borderColor: '#C9A959',
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(201, 169, 89, 0.4)',
  },
  tabTitle: {
    fontSize: '16px',
    fontWeight: '600',
  },
  tabSubtitle: {
    fontSize: '12px',
    opacity: 0.8,
  },
  mediaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px',
  },
  mediaItem: {
    position: 'relative' as const,
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: '#E8DCC8',
    boxShadow: '0 4px 12px rgba(107, 93, 79, 0.15)',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  mediaImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover' as const,
    display: 'block',
  },
  videoWrapper: {
    position: 'relative' as const,
  },
  playIcon: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '48px',
    color: 'white',
    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
    pointerEvents: 'none' as const,
  },
  mediaCaption: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#6B5D4F',
    background: '#E8DCC8',
  },
  emptyText: {
    textAlign: 'center' as const,
    color: '#999',
    fontSize: '16px',
    padding: '40px',
    gridColumn: '1 / -1',
  },
  loading: {
    textAlign: 'center' as const,
    fontSize: '18px',
    color: '#666',
    padding: '60px 20px',
  },
  lightbox: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  closeBtn: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s',
  },
  lightboxContent: {
    maxWidth: '90%',
    maxHeight: '90%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
  },
  lightboxMedia: {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain' as const,
    borderRadius: '8px',
  },
  lightboxCaption: {
    color: 'white',
    fontSize: '16px',
    textAlign: 'center' as const,
  },
};
