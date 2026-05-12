import {
  Play, Clock, Star, Ticket, ChevronRight, ChevronLeft,
  Tv, Film, Zap, Download, MonitorPlay, Radio, CalendarDays
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────
type TMDBMovieTrending = {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
};

type TMDBMovieDetail = {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genres: { id: number; name: string }[];
  runtime: number;
};

type UpcomingMovie = TMDBMovieDetail & { color: string; date: string; genre: string };

const genreMap: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 18: "Drama", 14: "Fantasy", 27: "Horror",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 53: "Thriller",
  10751: "Family", 36: "History", 10752: "War",
};

const SLIDE_DURATION = 5000;
const IMG_BASE = "https://image.tmdb.org/t/p";
const API_BASE = "https://api.themoviedb.org/3";


const ottFeatures = [
  { icon: MonitorPlay, label: "Stream Now", desc: "Watch instantly online", color: "#F84464" },
  { icon: Download, label: "Download", desc: "Watch offline anytime", color: "#00b4d8" },
  { icon: Tv, label: "Live TV", desc: "100+ live channels", color: "#c9a227" },
  { icon: Radio, label: "Web Series", desc: "Exclusive originals", color: "#7209b7" },
];

const resolveGenres = (genre_ids?: number[], genres?: { id: number; name: string }[]) => {
  if (genres?.length) return genres.slice(0, 2).map((g) => g.name).join(" / ");
  if (genre_ids?.length) return genre_ids.slice(0, 2).map((id) => genreMap[id]).filter(Boolean).join(" / ");
  return "—";
};

const fmtRuntime = (mins?: number) =>
  mins && mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : null;

// ─── Component ────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const [heroMovies, setHeroMovies] = useState<TMDBMovieTrending[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<UpcomingMovie[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<"cinema" | "stream">("cinema");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const API_KEY = import.meta.env.VITE_MOVIE_API_KEY;

  useEffect(() => {
    fetch(`${API_BASE}/trending/movie/week?api_key=${API_KEY}`)
      .then((r) => r.json())
      .then((data) => setHeroMovies((data.results ?? []).slice(0, 3)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`)
      .then((r) => r.json())
      .then((data) => {
        const colors = [
          "#F84464",
          "#c9a227",
          "#00b4d8",
          "#22c55e",
          "#7209b7",
        ];

        const formattedMovies = (data.results || []).slice(0, 5).map(
          (movie: any, index: number) => ({
            ...movie,
            color: colors[index % colors.length],
            date: movie.release_date
              ? new Date(movie.release_date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
              : "Coming Soon",
            genre: resolveGenres(movie.genre_ids),
          })
        );

        setUpcomingMovies(formattedMovies);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!heroMovies.length) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroMovies.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timerRef.current!);
  }, [heroMovies]);

  const goTo = (index: number) => {
    if (animating || index === activeIndex) return;
    setAnimating(true);
    clearInterval(timerRef.current!);
    setTimeout(() => { setActiveIndex(index); setAnimating(false); }, 350);
  };
  const goNext = () => goTo((activeIndex + 1) % heroMovies.length);
  const goPrev = () => goTo((activeIndex - 1 + heroMovies.length) % heroMovies.length);

  const movie = heroMovies[activeIndex];
  const heroGenres = movie ? resolveGenres(movie.genre_ids) : "";
  const year = movie?.release_date?.split("-")[0] ?? "";
  const rating = movie?.vote_average?.toFixed(1) ?? "";

  return (
    <div className="bg-[#080808] min-h-screen font-['DM_Sans',sans-serif]">

      {/* ── MODE TOGGLE ─────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-4 md:pt-5 flex items-center gap-1 w-fit">
        {(["cinema", "stream"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 rounded-full text-[12px] md:text-[13px] font-bold transition-all duration-200 ${activeTab === tab
              ? "bg-[#F84464] text-white shadow-[0_4px_20px_rgba(248,68,100,0.35)]"
              : "text-gray-500 hover:text-white"
              }`}
          >
            {tab === "cinema"
              ? <Ticket className="w-3 h-3 md:w-3.5 md:h-3.5" />
              : <Play className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />}
            {tab === "cinema" ? "Book Tickets" : "Stream Online"}
          </button>
        ))}
      </div>

      {/* ── HERO SLIDER ─────────────────────────────────────── */}
      {/* Mobile: shorter height, no poster card, smaller text */}
      <div className="relative w-full h-[420px] sm:h-[500px] md:h-[580px] lg:h-[620px] overflow-hidden mt-3 md:mt-4 select-none">

        {/* Shimmer */}
        {!heroMovies.length && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 via-white/3 to-transparent" />
        )}

        {/* Slides */}
        {heroMovies.map((m, i) => (
          <div
            key={m.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === activeIndex ? 1 : 0, zIndex: i === activeIndex ? 1 : 0 }}
          >
            <img
              src={`${IMG_BASE}/w1280${m.backdrop_path}`}
              alt={m.title}
              className="w-full h-full object-cover object-top"
              style={{ filter: "brightness(0.32) saturate(1.25)" }}
            />
          </div>
        ))}

        {/* Gradients */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/98 via-black/65 to-black/20 md:to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#080808] via-transparent to-transparent pointer-events-none" />

        {/* Prev arrow */}
        <button
          onClick={goPrev}
          className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/60 border border-white/10 text-white hover:bg-[#F84464] hover:border-[#F84464] transition-all backdrop-blur-sm"
        >
          <ChevronLeft size={16} className="md:hidden" />
          <ChevronLeft size={20} className="hidden md:block" />
        </button>

        {/* Next arrow — on mobile stays right-3, on xl clears thumbnails */}
        <button
          onClick={goNext}
          className="absolute right-3 xl:right-[130px] top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/60 border border-white/10 text-white hover:bg-[#F84464] hover:border-[#F84464] transition-all backdrop-blur-sm"
        >
          <ChevronRight size={16} className="md:hidden" />
          <ChevronRight size={20} className="hidden md:block" />
        </button>

        {/* Hero Content */}
        {movie && (
          <div
            className="relative z-20 h-full max-w-[1400px] mx-auto px-4 md:px-12 flex items-end md:items-center pb-10 md:pb-0"
            style={{ opacity: animating ? 0 : 1, transition: "opacity 0.35s ease" }}
          >
            <div className="flex items-center gap-10 lg:gap-12 w-full">

              {/* Text */}
              <div className="flex-1 max-w-full md:max-w-[530px]">

                {/* Badge */}
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <span className="flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.25em] uppercase text-[#F84464] border border-[#F84464]/40 rounded px-2 md:px-2.5 py-1">
                    {activeTab === "cinema"
                      ? <><Film className="w-2.5 h-2.5 md:w-3 md:h-3" /> Now In Cinemas</>
                      : <><Zap className="w-2.5 h-2.5 md:w-3 md:h-3" /> Stream Now</>}
                  </span>
                  <span className="text-[9px] md:text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500">
                    #{activeIndex + 1} Trending
                  </span>
                </div>

                {/* Title */}
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-[3.5rem] font-black tracking-tight text-white leading-[1.05] mb-2 md:mb-4"
                  style={{ textShadow: "0 4px 48px rgba(0,0,0,0.9)" }}
                >
                  {movie.title}
                </h1>

                {/* Overview — hidden on small mobile */}
                <p className="hidden sm:block text-gray-400 text-[12px] md:text-[13.5px] leading-relaxed mb-3 md:mb-4 line-clamp-2">
                  {movie.overview}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4 text-[11px] md:text-[12.5px] text-gray-400">
                  <span className="text-white font-bold">{year}</span>
                  {heroGenres && (
                    <>
                      <span className="text-white/15">•</span>
                      <span className="flex items-center gap-1 md:gap-1.5 text-gray-300">
                        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#F84464]" />
                        {heroGenres.split(" / ")[0]}
                      </span>
                      <span className="hidden sm:inline text-white/15">•</span>
                      <span className="hidden sm:inline">{heroGenres}</span>
                    </>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 md:gap-2.5 mb-4 md:mb-7">
                  <div className="flex items-center gap-1 md:gap-1.5 bg-white/8 border border-white/10 rounded-lg px-2.5 md:px-3 py-1 md:py-1.5">
                    <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-black text-xs md:text-sm">{rating}</span>
                    <span className="text-gray-500 text-[10px] md:text-xs">/10</span>
                  </div>
                  <span className="text-gray-600 text-[10px] md:text-xs">TMDB Rating</span>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {activeTab === "cinema" ? (
                    <>
                      <button
                        onClick={() => navigate("/booking")}
                        className="flex items-center gap-1.5 md:gap-2 bg-[#F84464] hover:bg-[#e03455] text-white font-black text-xs md:text-sm px-4 md:px-7 py-2.5 md:py-3.5 rounded-lg md:rounded-xl transition-all active:scale-95 shadow-[0_8px_32px_rgba(248,68,100,0.4)] group"
                      >
                        <Ticket className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                        Book Tickets
                      </button>
                      <button className="flex items-center gap-1.5 md:gap-2 bg-white/10 hover:bg-white/16 text-white font-semibold text-xs md:text-sm px-4 md:px-6 py-2.5 md:py-3.5 rounded-lg md:rounded-xl border border-white/10 transition-all">
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Trailer
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex items-center gap-1.5 md:gap-2 bg-[#F84464] hover:bg-[#e03455] text-white font-black text-xs md:text-sm px-4 md:px-7 py-2.5 md:py-3.5 rounded-lg md:rounded-xl transition-all active:scale-95 shadow-[0_8px_32px_rgba(248,68,100,0.4)] group">
                        <Play className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
                        Watch Now
                      </button>
                      <button className="flex items-center gap-1.5 md:gap-2 bg-white/10 hover:bg-white/16 text-white font-semibold text-xs md:text-sm px-4 md:px-6 py-2.5 md:py-3.5 rounded-lg md:rounded-xl border border-white/10 transition-all">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Poster — only lg+ */}
              <div className="hidden lg:block shrink-0">
                <div className="w-[160px] xl:w-[185px] rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.9)] hover:border-[#F84464]/50 transition-all duration-300 hover:-translate-y-1">
                  <img src={`${IMG_BASE}/w500${movie.poster_path}`} alt={movie.title} className="w-full block" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide counter */}
        <div className="absolute top-4 right-4 z-30 text-[11px] md:text-xs font-black tracking-widest">
          <span className="text-white/70">{String(activeIndex + 1).padStart(2, "0")}</span>
          <span className="text-white/20"> / </span>
          <span className="text-white/30">{String(heroMovies.length).padStart(2, "0")}</span>
        </div>

        {/* Thumbnail strip — xl only */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-3">
          {heroMovies.map((m, i) => (
            <button
              key={m.id}
              onClick={() => goTo(i)}
              className="relative w-[92px] h-[58px] rounded-lg overflow-hidden transition-all duration-300"
              style={{
                border: `2px solid ${i === activeIndex ? "#F84464" : "rgba(255,255,255,0.1)"}`,
                opacity: i === activeIndex ? 1 : 0.4,
                transform: i === activeIndex ? "scale(1.07)" : "scale(1)",
              }}
            >
              <img src={`${IMG_BASE}/w300${m.backdrop_path}`} alt={m.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/25" />
              <p className="absolute bottom-1 left-1.5 right-1 text-[8.5px] font-black text-white truncate leading-none drop-shadow">
                {m.title}
              </p>
            </button>
          ))}
        </div>

        {/* Dot progress */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {heroMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative overflow-hidden rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 24 : 6,
                height: 6,
                background: i === activeIndex ? "#F84464" : "rgba(255,255,255,0.2)",
              }}
            >
              {i === activeIndex && (
                <span
                  key={`${activeIndex}-prog`}
                  className="absolute inset-0 rounded-full origin-left bg-white/40"
                  style={{ animation: `slideProgress ${SLIDE_DURATION}ms linear` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── OTT FEATURE STRIP ────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 mt-5 md:mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {ottFeatures.map(({ icon: Icon, label, desc, color }) => (
            <div
              key={label}
              className="group flex items-center gap-3 md:gap-4 bg-white/4 hover:bg-white/7 border border-white/8 hover:border-white/14 rounded-xl px-3 md:px-5 py-3 md:py-4 cursor-pointer transition-all duration-200"
            >
              <div
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}20`, border: `1px solid ${color}30` }}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-white font-bold text-[12px] md:text-[13px]">{label}</p>
                <p className="text-gray-600 text-[10px] md:text-[11px] hidden sm:block">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── UPCOMING RELEASES ────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 mt-8 md:mt-12 mb-10 md:mb-14">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h2 className="text-base md:text-xl font-black text-white tracking-tight">Upcoming Releases</h2>
            <p className="text-gray-600 text-[11px] md:text-xs mt-0.5">Reserve your seat before it's full</p>
          </div>
          <button className="flex items-center gap-1 text-[#F84464] text-xs md:text-sm font-bold border border-[#F84464]/30 hover:bg-[#F84464]/10 transition-all px-3 md:px-4 py-1.5 rounded-lg">
            See All <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Skeleton */}
        {!upcomingMovies.length ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white/5 animate-pulse" style={{ aspectRatio: "2/3" }} />
            ))}
          </div>
        ) : (
          /* On mobile: horizontal scroll instead of grid */
          <>
            {/* Mobile: scrollable row */}
            <div className="flex md:hidden gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
              {upcomingMovies.map((film) => {
                const filmGenreLabel = film.genres?.length
                  ? film.genres.slice(0, 1).map((g) => g.name).join("")
                  : film.genre;
                return (
                  <div
                    key={film.id}
                    className="group relative rounded-xl overflow-hidden cursor-pointer shrink-0"
                    style={{ width: 130, aspectRatio: "2/3" }}
                  >
                    <img
                      src={`${IMG_BASE}/w342${film.poster_path}`}
                      alt={film.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ filter: "brightness(0.75)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-2.5">
                      <div className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: film.color }}>
                        <CalendarDays className="w-2.5 h-2.5" />
                        {film.date}
                      </div>
                      <h3 className="text-white font-black text-[11px] leading-tight line-clamp-2">{film.title}</h3>
                      <p className="text-gray-400 text-[10px] mt-0.5">{filmGenreLabel}</p>
                    </div>
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                      style={{ boxShadow: `inset 0 0 0 2px ${film.color}70` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Tablet+: grid */}
            <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 gap-4">
              {upcomingMovies.map((film) => {
                const filmGenreLabel = film.genres?.length
                  ? film.genres.slice(0, 2).map((g) => g.name).join(" / ")
                  : film.genre;
                const runtime = fmtRuntime(film.runtime);
                return (
                  <div
                    key={film.id}
                    className="group relative rounded-xl overflow-hidden cursor-pointer"
                    style={{ aspectRatio: "2/3" }}
                  >
                    <img
                      src={`${IMG_BASE}/w500${film.poster_path}`}
                      alt={film.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: "brightness(0.78)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/96 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: film.color }}>
                        <CalendarDays className="w-3 h-3 shrink-0" />
                        {film.date}
                      </div>
                      <h3 className="text-white font-black text-sm leading-tight line-clamp-2 mb-0.5">{film.title}</h3>
                      <p className="text-gray-400 text-[11px]">{filmGenreLabel}</p>
                      {runtime && (
                        <p className="text-gray-600 text-[10px] mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {runtime}
                        </p>
                      )}
                      <button
                        onClick={() => navigate("/booking")}
                        className="mt-2 text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0"
                        style={{ background: film.color, color: "#fff" }}
                      >
                        {activeTab === "cinema" ? "Book Now" : "Watch Now"}
                      </button>
                    </div>
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                      style={{ boxShadow: `inset 0 0 0 2px ${film.color}70` }}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default HomePage;