import React, { useState, useEffect, useRef } from 'react';

// ── TYPES ──
interface TMDBItem {
  id: number;
  name?: string;
  title?: string;
  first_air_date?: string;
  release_date?: string;
  vote_average?: number;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
}

interface TMDBResponse {
  results: TMDBItem[];
}

// ── CONFIGURATION ──
const TMDB_KEY = import.meta.env.VITE_MOVIE_API_KEY;
const IMG_BASE = 'https://image.tmdb.org/t/p/';

const GENRES = [
  'All', 'Action & Adventure', 'Drama', 'Comedy', 'Crime',
  'Sci-Fi & Fantasy', 'Mystery', 'Animation', 'Documentary', 'Reality'
];

export const StreamPage: React.FC = () => {
  // ── STATE ──
  const [trending, setTrending] = useState<TMDBItem[]>([]);
  const [popular, setPopular] = useState<TMDBItem[]>([]);
  const [topRated, setTopRated] = useState<TMDBItem[]>([]);
  const [airing, setAiring] = useState<TMDBItem[]>([]);
  
  const [heroItems, setHeroItems] = useState<TMDBItem[]>([]);
  const [heroIdx, setHeroIdx] = useState<number>(0);
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── API FETCHING ──
  const fetchTMDB = async (path: string): Promise<TMDBResponse> => {
    const sep = path.includes('?') ? '&' : '?';
    const response = await fetch(`https://api.themoviedb.org/3${path}${sep}api_key=${TMDB_KEY}`);
    if (!response.ok) {
      throw new Error(`TMDB ${response.status}: ${response.statusText}`);
    }
    return response.json();
  };

  useEffect(() => {

    const initData = async () => {
      try {
        const [trendingRes, popularRes, topRatedRes, airingRes] = await Promise.all([
          fetchTMDB('/trending/tv/week'),
          fetchTMDB('/tv/popular'),
          fetchTMDB('/tv/top_rated'),
          fetchTMDB('/tv/on_the_air'),
        ]);

        const trendingList = trendingRes.results || [];
        setTrending(trendingList.slice(0, 15));
        setPopular((popularRes.results || []).slice(0, 15));
        setTopRated((topRatedRes.results || []).slice(0, 10));
        setAiring((airingRes.results || []).slice(0, 15));

        const heroList = trendingList.slice(0, 6);
        setHeroItems(heroList);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(`TMDB Error: ${err.message}`);
        setLoading(false);
      }
    };

    initData();
  }, []);

  // ── HERO CAROUSEL TIMER ──
  const startHeroTimer = () => {
    stopHeroTimer();
    if (heroItems.length === 0) return;
    heroTimerRef.current = setInterval(() => {
  setHeroIdx((prevIdx) => (prevIdx + 1) % heroItems.length);
}, 5000);
  };

  const stopHeroTimer = () => {
    if (heroTimerRef.current) {
      clearInterval(heroTimerRef.current);
    }
  };

  useEffect(() => {
    if (heroItems.length > 0) {
      startHeroTimer();
    }
    return () => stopHeroTimer();
  }, [heroItems]);

  const handleDotClick = (index: number) => {
    setHeroIdx(index);
    startHeroTimer();
  };

  // ── RENDER HELPER VARIABLES ──
  const currentHero = heroItems[heroIdx];
  const heroTitle = currentHero ? (currentHero.name || currentHero.title || '').toUpperCase() : 'LOADING…';
  const heroYear = currentHero ? (currentHero.first_air_date || '').slice(0, 4) : '';
  const heroRating = currentHero && currentHero.vote_average ? currentHero.vote_average.toFixed(1) : null;

  return (
    <div style={styles.body}>
      {/* INLINE CUSTOM STYLES & ANIMATIONS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        .hero-content > * { animation: fadeUp .6s ease both; }
        .hero-content > *:nth-child(1){animation-delay:.1s}
        .hero-content > *:nth-child(2){animation-delay:.2s}
        .hero-content > *:nth-child(3){animation-delay:.3s}
        .hero-content > *:nth-child(4){animation-delay:.4s}
        .hero-content > *:nth-child(5){animation-delay:.5s}

        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes shimmer { 
          0% { background-position: 200% 0; } 
          100% { background-position: -200% 0; } 
        }

        .shimmer-bg {
          background: linear-gradient(90deg, #12121c 25%, #1a1a2e 50%, #12121c 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        
        .scroll-row::-webkit-scrollbar { height: 3px; }
        .scroll-row::-webkit-scrollbar-thumb { background: #1a6dff; border-radius: 2px; }
        
        .card-container:hover .play-btn-overlay { transform: translate(-50%,-50%) scale(1) !important; }
        .card-container:hover { transform: translateY(-6px) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px #1a6dff !important; }
        .wide-card-container:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.6) !important; }
        
        .genre-pill-item:hover { background: #1a6dff !important; border-color: #1a6dff !important; color: #fff !important; }
        .see-all-link:hover { color: #3d87ff !important; }
        .btn-play-action:hover { background: #3d87ff !important; transform: scale(1.03) !important; }
        .btn-list-action:hover { background: rgba(255,255,255,0.14) !important; }
      `}</style>

      {/* ERROR BANNER */}
      {error && (
        <div style={styles.apiError}>
          ⚠️ <strong>API Error:</strong> {error}
        </div>
      )}

      {/* HERO SECTION */}
      <div style={styles.hero}>
        <div style={styles.heroFallback}></div>
        <div style={styles.filmLines}></div>
        <div style={styles.filmLines2}></div>
        {currentHero?.backdrop_path && (
          <img 
            style={styles.heroBackdrop} 
            src={`${IMG_BASE}original${currentHero.backdrop_path}`} 
            alt={heroTitle} 
          />
        )}
        <div style={styles.heroBg}></div>
        
        <div className="hero-content" style={styles.heroContent}>
          <div style={styles.heroBadge}>⚡ NOW STREAMING • TRENDING</div>
          <div style={styles.heroTitle}>{error ? 'API KEY REQUIRED' : heroTitle}</div>
          <div style={styles.heroMeta}>
            {heroRating && (
              <>
                <span style={styles.rating}>★ {heroRating}</span>
                <span style={styles.dot}>•</span>
              </>
            )}
            {heroYear && (
              <>
                <span>{heroYear}</span>
                <span style={styles.dot}>•</span>
              </>
            )}
            <span>TV Show</span>
          </div>
          <p style={styles.heroDesc}>
            {error ? 'Set your TMDB key in the script configuration at the top of the file.' : (currentHero?.overview || 'Fetching latest shows from TMDB…')}
          </p>
          <div style={styles.heroActions}>
            <button className="btn-play-action" style={styles.btnPlay}>
              <svg viewBox="0 0 24 24" style={styles.btnPlaySvg}><path d="M5 3l14 9-14 9V3z"/></svg>Play Now
            </button>
            <button className="btn-list-action" style={styles.btnList}>+ My List</button>
          </div>
        </div>

        <div style={styles.heroDots}>
          {heroItems.map((_, i) => (
            <span
              key={i}
              onClick={() => handleDotClick(i)}
              style={{
                ...styles.heroDot,
                ...(i === heroIdx ? styles.heroDotActive : {})
              }}
            />
          ))}
        </div>
      </div>

      {/* TRENDING ROW */}
      <div style={styles.section}>
        <div style={styles.sectionHead}>
          <div style={styles.sectionTitle}>🔥 Trending <span style={styles.titleBlue}>This Week</span></div>
          <a className="see-all-link" style={styles.seeAll} href="#">See all →</a>
        </div>
        <div className="scroll-row" style={styles.cardsRow}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer-bg" style={styles.skeletonCard} />)
          ) : (
            trending.map((item) => (
              <div key={item.id} className="card-container" style={styles.card}>
                <div style={styles.cardThumb}>
                  {item.poster_path ? (
                    <img src={`${IMG_BASE}w342${item.poster_path}`} alt={item.name || item.title} style={styles.cardImg} loading="lazy" />
                  ) : (
                    <div style={styles.noImg}>🎬</div>
                  )}
                  <div style={styles.cardOverlay}></div>
                  <div className="play-btn-overlay" style={styles.cardPlayBtn}>
                    <svg viewBox="0 0 24 24" style={styles.cardPlayBtnSvg}><path d="M5 3l14 9-14 9V3z"/></svg>
                  </div>
                  {item.vote_average ? <div style={styles.cardRating}>★ {item.vote_average.toFixed(1)}</div> : null}
                </div>
                <div style={styles.cardInfo}>
                  <h4 style={styles.cardInfoH4}>{item.name || item.title || 'Untitled'}</h4>
                  <p style={styles.cardInfoP}>{(item.first_air_date || item.release_date || '').slice(0, 4) ? (item.first_air_date || item.release_date || '').slice(0, 4) + ' · ' : ''}TV</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* POPULAR ROW */}
      <div style={styles.section}>
        <div style={styles.sectionHead}>
          <div style={styles.sectionTitle}>⭐ Popular <span style={styles.titleBlue}>Shows</span></div>
          <a className="see-all-link" style={styles.seeAll} href="#">See all →</a>
        </div>
        <div className="scroll-row" style={styles.cardsRow}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer-bg" style={styles.skeletonCard} />)
          ) : (
            popular.map((item) => (
              <div key={item.id} className="card-container" style={styles.card}>
                <div style={styles.cardThumb}>
                  {item.poster_path ? (
                    <img src={`${IMG_BASE}w342${item.poster_path}`} alt={item.name || item.title} style={styles.cardImg} loading="lazy" />
                  ) : (
                    <div style={styles.noImg}>🎬</div>
                  )}
                  <div style={styles.cardOverlay}></div>
                  <div className="play-btn-overlay" style={styles.cardPlayBtn}>
                    <svg viewBox="0 0 24 24" style={styles.cardPlayBtnSvg}><path d="M5 3l14 9-14 9V3z"/></svg>
                  </div>
                  {item.vote_average ? <div style={styles.cardRating}>★ {item.vote_average.toFixed(1)}</div> : null}
                </div>
                <div style={styles.cardInfo}>
                  <h4 style={styles.cardInfoH4}>{item.name || item.title || 'Untitled'}</h4>
                  <p style={styles.cardInfoP}>{(item.first_air_date || item.release_date || '').slice(0, 4) ? (item.first_air_date || item.release_date || '').slice(0, 4) + ' · ' : ''}TV</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* GENRES FILTER */}
      <div style={styles.genres}>
        {GENRES.map((genre) => (
          <div
            key={genre}
            className="genre-pill-item"
            onClick={() => setActiveGenre(genre)}
            style={{
              ...styles.genrePill,
              ...(activeGenre === genre ? styles.genrePillActive : {})
            }}
          >
            {genre}
          </div>
        ))}
      </div>

      {/* ORIGINALS BANNER */}
      <div style={styles.originalsBanner}>
        <div style={styles.originalsText}>
          <h2 style={styles.originalsTextH2}>my<span style={styles.titleBlue}>Cinema</span> Originals</h2>
          <p style={styles.originalsTextP}>Exclusive stories, untold worlds, and groundbreaking series — only available on myCinema Stream. New originals every month.</p>
        </div>
        <div style={styles.originalsCta}>
          <button className="btn-play-action" style={{ ...styles.btnPlay, padding: '12px 24px', fontSize: '14px' }}>
            <svg viewBox="0 0 24 24" style={{ ...styles.btnPlaySvg, width: '16px', height: '16px' }}><path d="M5 3l14 9-14 9V3z"/></svg>
            Explore Originals
          </button>
          <button className="btn-list-action" style={styles.btnList}>Learn More</button>
        </div>
      </div>

      {/* TOP RATED ROW (WIDE CARDS) */}
      <div style={styles.section}>
        <div style={styles.sectionHead}>
          <div style={styles.sectionTitle}>🏆 Top <span style={styles.titleBlue}>Rated</span></div>
          <a className="see-all-link" style={styles.seeAll} href="#">See all →</a>
        </div>
        <div className="scroll-row" style={styles.wideCardsRow}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer-bg" style={styles.skeletonWide} />)
          ) : (
            topRated.map((item) => (
              <div key={item.id} className="wide-card-container" style={styles.wideCard}>
                <div style={styles.wideCardThumb}>
                  {item.backdrop_path ? (
                    <img src={`${IMG_BASE}w780${item.backdrop_path}`} alt={item.name || item.title} style={styles.cardImg} loading="lazy" />
                  ) : item.poster_path ? (
                    <img src={`${IMG_BASE}w342${item.poster_path}`} alt={item.name || item.title} style={styles.cardImg} loading="lazy" />
                  ) : (
                    <div style={styles.noImg}>📺</div>
                  )}
                  <div style={styles.wideCardOverlay}></div>
                </div>
                <div style={styles.wideCardInfo}>
                  <h4 style={styles.cardInfoH4}>{item.name || item.title || 'Untitled'}</h4>
                  <p style={styles.wideCardInfoP}>
                    {(item.first_air_date || item.release_date || '').slice(0, 4)}
                    {item.vote_average ? ' · ★ ' + item.vote_average.toFixed(1) : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* NOW AIRING ROW */}
      <div style={{ ...styles.section, marginBottom: '48px' }}>
        <div style={styles.sectionHead}>
          <div style={styles.sectionTitle}>📺 Now <span style={styles.titleBlue}>Airing</span></div>
          <a className="see-all-link" style={styles.seeAll} href="#">See all →</a>
        </div>
        <div className="scroll-row" style={styles.cardsRow}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer-bg" style={styles.skeletonCard} />)
          ) : (
            airing.map((item) => (
              <div key={item.id} className="card-container" style={styles.card}>
                <div style={styles.cardThumb}>
                  {item.poster_path ? (
                    <img src={`${IMG_BASE}w342${item.poster_path}`} alt={item.name || item.title} style={styles.cardImg} loading="lazy" />
                  ) : (
                    <div style={styles.noImg}>🎬</div>
                  )}
                  <div style={styles.cardOverlay}></div>
                  <div className="play-btn-overlay" style={styles.cardPlayBtn}>
                    <svg viewBox="0 0 24 24" style={styles.cardPlayBtnSvg}><path d="M5 3l14 9-14 9V3z"/></svg>
                  </div>
                  {item.vote_average ? <div style={styles.cardRating}>★ {item.vote_average.toFixed(1)}</div> : null}
                </div>
                <div style={styles.cardInfo}>
                  <h4 style={styles.cardInfoH4}>{item.name || item.title || 'Untitled'}</h4>
                  <p style={styles.cardInfoP}>{(item.first_air_date || item.release_date || '').slice(0, 4) ? (item.first_air_date || item.release_date || '').slice(0, 4) + ' · ' : ''}TV</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color: '#e8e8f0' }}>
            my<span style={{ color: '#1a6dff' }}>Cinema</span>
          </span>
          <span>© 2025 myCinema. All rights reserved.</span>
        </div>
        <div>
          <a style={styles.footerLink} href="#">Privacy</a>
          <a style={styles.footerLink} href="#">Terms</a>
          <a style={styles.footerLink} href="#">Help</a>
          <a style={styles.footerLink} href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
};

// ── REACT COMPONENT INLINE STYLES ──
const styles: { [key: string]: React.CSSProperties } = {
  body: {
    backgroundColor: '#0a0a0f',
    color: '#e8e8f0',
    fontFamily: "'DM Sans', sans-serif",
    overflowX: 'hidden',
    minHeight: '100vh',
  },
  hero: {
    position: 'relative',
    height: '82vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to right, #0a0a0f 0%, rgba(10,10,15,0.55) 55%, transparent 100%), linear-gradient(to top, #0a0a0f 0%, transparent 40%)',
    zIndex: 1,
  },
  heroBackdrop: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center top',
    filter: 'brightness(0.5) saturate(1.2)',
    zIndex: 0,
  },
  heroFallback: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    background: 'radial-gradient(ellipse at 70% 30%, rgba(26,109,255,0.12) 0%, transparent 60%), linear-gradient(135deg, #0a0a0f 0%, #0f1628 40%, #1a1428 70%, #0a0a0f 100%)',
  },
  filmLines: {
    position: 'absolute',
    right: '80px',
    top: 0,
    bottom: 0,
    width: '4px',
    background: 'repeating-linear-gradient(to bottom, #1a6dff 0px, #1a6dff 20px, transparent 20px, transparent 30px)',
    opacity: 0.15,
    zIndex: 1,
  },
  filmLines2: {
    position: 'absolute',
    right: '95px',
    top: 0,
    bottom: 0,
    width: '2px',
    background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 20px, transparent 20px, transparent 30px)',
    opacity: 0.08,
    zIndex: 1,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    padding: '0 60px 60px',
    maxWidth: '580px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(26,109,255,0.15)',
    border: '1px solid rgba(26,109,255,0.3)',
    borderRadius: '4px',
    padding: '4px 10px',
    fontSize: '11px',
    color: '#3d87ff',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  heroTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '72px',
    lineHeight: 0.92,
    letterSpacing: '2px',
    marginBottom: '18px',
    textShadow: '0 4px 40px rgba(0,0,0,0.8)',
  },
  heroMeta: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '14px',
    fontSize: '13px',
    color: '#7878a0',
    flexWrap: 'wrap',
  },
  rating: {
    color: '#ffd700',
    fontWeight: 600,
  },
  dot: {
    color: '#333',
  },
  heroDesc: {
    fontSize: '14px',
    lineHeight: 1.7,
    color: 'rgba(232,232,240,0.75)',
    marginBottom: '28px',
    maxWidth: '440px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  heroActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  btnPlay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#1a6dff',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '13px 28px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 0 30px rgba(26,109,255,0.4)',
    transition: 'all .25s',
  },
  btnPlaySvg: {
    width: '18px',
    height: '18px',
    fill: '#fff',
  },
  btnList: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.08)',
    color: '#e8e8f0',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '13px 22px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background .2s',
  },
  heroDots: {
    position: 'absolute',
    right: '40px',
    bottom: '60px',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  heroDot: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: '#7878a0',
    display: 'block',
    transition: 'all .3s',
    cursor: 'pointer',
  },
  heroDotActive: {
    height: '24px',
    borderRadius: '2px',
    background: '#1a6dff',
  },
  section: {
    padding: '40px 40px 10px',
  },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '22px',
    letterSpacing: '1px',
  },
  titleBlue: {
    color: '#3d87ff',
  },
  seeAll: {
    color: '#3d87ff',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  cardsRow: {
    display: 'flex',
    gap: '14px',
    overflowX: 'auto',
    paddingBottom: '16px',
    scrollSnapType: 'x mandatory',
  },
  card: {
    flex: '0 0 160px',
    scrollSnapAlign: 'start',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#12121c',
    border: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'transform .25s, box-shadow .25s',
    position: 'relative',
  },
  cardThumb: {
    width: '100%',
    aspectRatio: '2/3',
    position: 'relative',
    overflow: 'hidden',
    background: '#12121c',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  cardOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(10,10,15,0.95) 0%, transparent 55%)',
    zIndex: 1,
  },
  cardPlayBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%) scale(0)',
    zIndex: 2,
    background: 'rgba(26,109,255,0.9)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform .2s',
  },
  cardPlayBtnSvg: {
    width: '16px',
    height: '16px',
    fill: '#fff',
    marginLeft: '2px',
  },
  cardRating: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: 2,
    background: 'rgba(10,10,15,0.8)',
    backdropFilter: 'blur(4px)',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '11px',
    color: '#ffd700',
    fontWeight: 600,
  },
  cardInfo: {
    padding: '10px 12px 12px',
  },
  cardInfoH4: {
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textShadow: 'ellipsis',
  },
  cardInfoP: {
    fontSize: '11px',
    color: '#7878a0',
  },
  wideCardsRow: {
    display: 'flex',
    gap: '14px',
    overflowX: 'auto',
    paddingBottom: '16px',
  },
  wideCard: {
    flex: '0 0 280px',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#12121c',
    border: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'transform .25s, box-shadow .25s',
  },
  wideCardThumb: {
    width: '100%',
    aspectRatio: '16/9',
    position: 'relative',
    overflow: 'hidden',
    background: '#12121c',
  },
  wideCardOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(10,10,15,0.9) 0%, transparent 50%)',
  },
  wideCardInfo: {
    padding: '10px 12px 12px',
  },
  wideCardInfoP: {
    fontSize: '11px',
    color: '#7878a0',
  },
  genres: {
    padding: '8px 40px 32px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  genrePill: {
    background: '#12121c',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '24px',
    padding: '8px 18px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all .2s',
    color: '#7878a0',
  },
  genrePillActive: {
    background: '#1a6dff',
    borderColor: '#1a6dff',
    color: '#fff',
  },
  originalsBanner: {
    margin: '32px 40px',
    background: 'linear-gradient(135deg, #0a1040 0%, #0f2060 50%, #0a1840 100%)',
    border: '1px solid rgba(26,109,255,0.3)',
    borderRadius: '16px',
    padding: '40px 48px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  originalsText: {
    position: 'relative',
    zIndex: 1,
  },
  originalsTextH2: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '38px',
    letterSpacing: '2px',
    marginBottom: '8px',
  },
  originalsTextP: {
    fontSize: '14px',
    color: 'rgba(232,232,240,0.7)',
    maxWidth: '360px',
  },
  originalsCta: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  skeletonCard: {
    flex: '0 0 160px',
    height: '240px',
    borderRadius: '10px',
  },
  skeletonWide: {
    flex: '0 0 280px',
    height: '158px',
    borderRadius: '10px',
  },
  footer: {
    marginTop: '48px',
    padding: '32px 40px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#7878a0',
    fontSize: '12px',
  },
  footerLink: {
    color: '#7878a0',
    textDecoration: 'none',
    marginLeft: '20px',
    transition: 'color 0.2s',
  },
  noImg: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    background: 'linear-gradient(135deg,#0f1628,#1a1040)',
  },
  apiError: {
    background: 'rgba(255,60,60,0.1)',
    border: '1px solid rgba(255,60,60,0.3)',
    borderRadius: '10px',
    padding: '16px 24px',
    margin: '20px 40px',
    fontSize: '14px',
    color: '#ff8080',
  },
};