import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Ticket, TrendingUp } from "lucide-react";

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids: number[];
};

const genreMap: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

const ratingColor = (r: number) => {
  if (r >= 8) return "#22c55e";
  if (r >= 6.5) return "#eab308";
  return "#F84464";
};

const SkeletonCard = ({ width }: { width: number }) => (
  <div
    className="rounded-xl overflow-hidden bg-white/5 border border-white/8 animate-pulse flex-shrink-0"
    style={{ minWidth: width }}
  >
    <div className="w-full aspect-[2/3] bg-white/10" />
    <div className="p-2.5 md:p-3 space-y-2">
      <div className="h-3 md:h-3.5 bg-white/10 rounded w-3/4" />
      <div className="h-2.5 md:h-3 bg-white/8 rounded w-1/2" />
    </div>
  </div>
);

const Movies = () => {
  const [movies,       setMovies]       = useState<Movie[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showLeftBtn,  setShowLeftBtn]  = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);
  const [hoveredId,    setHoveredId]    = useState<number | null>(null);
  const [isMobile,     setIsMobile]     = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Detect mobile to adjust card width
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const API_KEY = import.meta.env.VITE_MOVIE_API_KEY;
    fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => { setMovies(data.results ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftBtn(scrollLeft > 10);
    setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: direction === "left"
        ? scrollLeft - clientWidth * 0.75
        : scrollLeft + clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  // Responsive card width
  const cardWidth = isMobile ? 130 : 200;

  return (
    <section className="bg-[#080808] py-8 md:py-12 font-['DM_Sans',sans-serif]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-5 md:mb-7">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-1 h-5 md:h-6 rounded-full bg-[#F84464]" />
            <div>
              <h2 className="text-base md:text-xl font-black text-white tracking-tight">
                Now In Cinemas
              </h2>
              <p className="text-gray-600 text-[10px] md:text-xs mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#F84464]" />
                Trending this week
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-[#F84464] text-xs md:text-sm font-bold border border-[#F84464]/30 hover:bg-[#F84464]/10 transition-all duration-200 px-3 md:px-4 py-1.5 rounded-lg">
            See All
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Carousel */}
        <div className="relative">

          {/* Left Arrow — hidden on mobile (touch scroll) */}
          {showLeftBtn && (
            <button
              onClick={() => scroll("left")}
              className="hidden sm:flex absolute -left-4 md:-left-5 top-[40%] -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 items-center justify-center rounded-full bg-[#111] text-white border border-white/10 hover:bg-[#F84464] hover:border-[#F84464] transition-all duration-200 shadow-2xl"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Right Arrow — hidden on mobile */}
          {showRightBtn && (
            <button
              onClick={() => scroll("right")}
              className="hidden sm:flex absolute -right-4 md:-right-5 top-[40%] -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 items-center justify-center rounded-full bg-[#111] text-white border border-white/10 hover:bg-[#F84464] hover:border-[#F84464] transition-all duration-200 shadow-2xl"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Scroll Track */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 md:gap-4 overflow-x-auto pb-3 md:pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading
              ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} width={cardWidth} />)
              : movies.map((movie, index) => {
                  const isHovered = hoveredId === movie.id;
                  const genres = movie.genre_ids.slice(0, 2).map((id) => genreMap[id]).filter(Boolean).join(" / ");

                  return (
                    <div
                      key={movie.id}
                      className="snap-start cursor-pointer group flex-shrink-0"
                      style={{ minWidth: cardWidth }}
                      onMouseEnter={() => setHoveredId(movie.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Card */}
                      <div
                        className={`relative rounded-xl overflow-hidden border transition-all duration-300 ${
                          isHovered
                            ? "border-[#F84464]/50 shadow-[0_16px_48px_rgba(248,68,100,0.2)]"
                            : "border-white/8 shadow-lg"
                        }`}
                        style={{
                          transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease",
                        }}
                      >
                        {/* Rank badge */}
                        {index < 3 && (
                          <div className="absolute top-2 left-2 z-20 w-5 h-5 md:w-6 md:h-6 rounded-md bg-[#F84464] flex items-center justify-center text-[9px] md:text-[10px] font-black text-white shadow-lg">
                            {index + 1}
                          </div>
                        )}

                        {/* Poster */}
                        <img
                          src={`https://image.tmdb.org/t/p/${isMobile ? "w342" : "w500"}${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full aspect-[2/3] object-cover"
                          loading="lazy"
                        />

                        {/* Hover overlay — desktop only (touch devices use tap) */}
                        <div className={`absolute inset-0 transition-all duration-300 flex flex-col justify-center items-center p-3 md:p-4 backdrop-blur-sm ${
                          isHovered ? "opacity-100 bg-black/70" : "opacity-0 bg-transparent"
                        }`}>
                          <button className="flex items-center gap-1.5 md:gap-2 bg-[#F84464] text-white text-[10px] md:text-xs font-bold px-3 md:px-4 py-2 md:py-2.5 rounded-xl shadow-lg hover:bg-[#e03455] transition-colors active:scale-95">
                            <Ticket className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            Book Now
                          </button>
                          <div className="mt-2 md:mt-3 text-center">
                            <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">
                              Release
                            </p>
                            <p className="text-white text-[10px] md:text-xs font-semibold">{movie.release_date}</p>
                          </div>
                        </div>

                        {/* Rating bar */}
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-black/80 px-2 md:px-3 py-2 md:py-2.5 flex items-center gap-1.5 md:gap-2 z-10">
                          <Star
                            className="shrink-0"
                            size={isMobile ? 11 : 13}
                            style={{ color: ratingColor(movie.vote_average), fill: ratingColor(movie.vote_average) }}
                          />
                          <span className="font-black text-white text-[11px] md:text-[13px]">
                            {movie.vote_average.toFixed(1)}
                          </span>
                          <span className="text-gray-500 text-[9px] md:text-[10px] font-medium ml-auto">
                            {movie.vote_count >= 1000
                              ? `${(movie.vote_count / 1000).toFixed(1)}K`
                              : movie.vote_count} votes
                          </span>
                        </div>
                      </div>

                      {/* Below card text */}
                      <div className="mt-2 md:mt-3 px-0.5">
                        <h3 className={`font-black text-[11px] md:text-sm leading-tight truncate transition-colors duration-200 ${
                          isHovered ? "text-[#F84464]" : "text-white"
                        }`}>
                          {movie.title}
                        </h3>
                        <p className="text-gray-600 text-[10px] md:text-[11px] mt-0.5 font-medium truncate">
                          {genres || "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
};

export default Movies;