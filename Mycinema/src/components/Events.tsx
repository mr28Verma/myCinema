import { useState, useEffect } from "react";
import {
  Calendar, MapPin,
  AlertCircle, SlidersHorizontal,
  Ticket, Clock, ChevronRight,
} from "lucide-react";

const BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

const CATEGORIES = [
  { label: "Comedy Shows", genre: "comedy",   icon: "🎭" },
  { label: "Music Shows",  genre: "music",    icon: "🎵" },
  { label: "Workshops",    genre: "workshop", icon: "🛠️" },
  { label: "Kids",         genre: "family",   icon: "👶" },
  { label: "Performances", genre: "arts",     icon: "🎬" },
];

const SORTS = [
  { label: "Date",      value: "date,asc" },
  { label: "Relevance", value: "relevance,desc" },
  { label: "Name A–Z",  value: "name,asc" },
];

type TmEvent = {
  id: string;
  name: string;
  url: string;
  images: { url: string; ratio: string; width: number }[];
  dates: { start: { localDate: string; localTime?: string } };
  priceRanges?: { min: number; max: number; currency: string }[];
  classifications?: { genre?: { name: string } }[];
  _embedded?: { venues?: { name: string; city?: { name: string } }[] };
};

const getImage = (e: TmEvent) => {
  const imgs = e.images ?? [];
  return (
    imgs.find((i) => i.ratio === "3_2"  && i.width > 400)?.url ??
    imgs.find((i) => i.ratio === "16_9" && i.width > 600)?.url ??
    imgs.find((i) => i.width > 400)?.url ??
    imgs[0]?.url ??
    null
  );
};

const getVenue = (e: TmEvent) => {
  const v = e._embedded?.venues?.[0];
  if (!v) return "";
  return [v.name, v.city?.name].filter(Boolean).join(", ");
};

const getPrice = (e: TmEvent) => {
  const p = e.priceRanges?.[0];
  if (p?.min != null) {
    if (p.max && p.max !== p.min) return `$${Math.round(p.min)}–$${Math.round(p.max)}`;
    return `$${Math.round(p.min)}`;
  }
  return null;
};

const fmtDate = (ds?: string) => {
  if (!ds) return "Date TBA";
  return new Date(ds).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
};

const fmtTime = (ts?: string) => {
  if (!ts) return "";
  const [h, m] = ts.split(":");
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

export const Event = () => {
  const API_KEY = import.meta.env.VITE_EVENT_API_KEY;

  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [events,   setEvents]   = useState<TmEvent[]>([]);
  const [sort,     setSort]     = useState(SORTS[0].value);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(false);
  const [featured, setFeatured] = useState<TmEvent | null>(null);

  useEffect(() => { fetchEvents(activeCategory.genre, sort); }, [activeCategory, sort]);

  const fetchEvents = async (genre: string, sortVal: string) => {
    setLoading(true);
    setError(false);
    setFeatured(null);

    const params = new URLSearchParams({
      apikey: API_KEY,
      classificationName: genre,
      sort: sortVal,
      size: "20",
    });

    try {
      const res  = await fetch(`${BASE_URL}?${params}`);
      const data = await res.json();
      const list: TmEvent[] = data._embedded?.events ?? [];
      setEvents(list);
      if (list.length) setFeatured(list[0]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const featuredImg   = featured ? getImage(featured) : null;
  const featuredDate  = featured ? fmtDate(featured.dates?.start?.localDate) : "";
  const featuredTime  = featured ? fmtTime(featured.dates?.start?.localTime) : "";
  const featuredVenue = featured ? getVenue(featured) : "";
  const featuredPrice = featured ? getPrice(featured) : null;

  return (
    <section className="min-h-screen bg-[#0a0a0f] text-white">

      {/* ── CATEGORY BUTTONS — above everything ─────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-4">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const active = activeCategory.label === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#F84464] text-white shadow-lg shadow-[#F84464]/25"
                    : "bg-[#1a1a22] text-gray-400 border border-white/[0.06] hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FEATURED HERO ────────────────────────────────────── */}
      {!loading && featured && (
        <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden">
          {featuredImg && (
            <img
              src={featuredImg}
              alt={featured.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ filter: "brightness(0.3) saturate(1.2)" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

          <div className="relative h-full max-w-6xl mx-auto px-4 sm:px-8 flex flex-col justify-end pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#F84464] border border-[#F84464]/40 rounded px-2.5 py-1">
                {activeCategory.icon} Featured
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">
                {activeCategory.label}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-3 max-w-xl">
              {featured.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mb-5 text-sm text-gray-400">
              {featuredDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#F84464]" />
                  {featuredDate}{featuredTime ? ` · ${featuredTime}` : ""}
                </span>
              )}
              {featuredVenue && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F84464]" />
                  {featuredVenue}
                </span>
              )}
              {featuredPrice && (
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span className="text-[#22c55e] font-semibold">{featuredPrice}</span>
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#F84464] hover:bg-[#e03358] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#F84464]/30"
              >
                <Ticket className="w-4 h-4" /> Get Tickets
              </a>
              <button
                onClick={() => {
                  const idx = events.indexOf(featured);
                  setFeatured(events[(idx + 1) % events.length]);
                }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-5 py-2.5 rounded-xl border border-white/10 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GRID SECTION ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">

        {/* Sort + count row */}
        {!loading && !error && events.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 text-xs font-medium tracking-wide uppercase">
              {events.length} upcoming events
            </p>
            <div className="flex items-center gap-2 bg-[#1a1a22] border border-white/[0.06] rounded-xl px-3 py-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#1a1a22]">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/5 rounded-2xl aspect-[2/3]" />
                <div className="mt-3 h-3 bg-white/5 rounded-full w-3/4" />
                <div className="mt-2 h-3 bg-white/5 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F84464]/10 border border-[#F84464]/20 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-[#F84464]" />
            </div>
            <div>
              <p className="text-white text-lg font-semibold">Could not load events</p>
              <p className="text-gray-600 text-sm mt-1">Check your API key or network connection</p>
            </div>
            <button
              onClick={() => fetchEvents(activeCategory.genre, sort)}
              className="text-sm text-[#F84464] border border-[#F84464]/30 px-5 py-2 rounded-lg hover:bg-[#F84464]/10 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center gap-3">
            <div className="text-6xl mb-2">🎟️</div>
            <p className="text-white text-lg font-semibold">No events found</p>
            <p className="text-gray-600 text-sm">Try a different category</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {events.map((e) => {
              const img        = getImage(e);
              const date       = fmtDate(e.dates?.start?.localDate);
              const time       = fmtTime(e.dates?.start?.localTime);
              const venue      = getVenue(e);
              const price      = getPrice(e);
              const genre      = e.classifications?.[0]?.genre?.name;
              const isFeatured = featured?.id === e.id;

              return (
                <div
                  key={e.id}
                  className="group cursor-pointer"
                  onClick={() => setFeatured(e)}
                >
                  <div
                    className={`relative overflow-hidden rounded-2xl bg-white/5 aspect-[2/3] transition-all duration-300 ${
                      isFeatured
                        ? "ring-2 ring-[#F84464] ring-offset-2 ring-offset-[#0a0a0f]"
                        : ""
                    }`}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={e.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-700 p-3">
                        <Calendar className="w-10 h-10" />
                        <span className="text-xs text-center leading-snug text-gray-600">{e.name}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* Genre badge */}
                    {genre && genre !== "Undefined" && (
                      <div className="absolute top-2.5 left-2.5 bg-[#F84464] text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-wide uppercase">
                        {genre}
                      </div>
                    )}

                    {isFeatured && (
                      <div className="absolute top-2.5 right-2.5 bg-white/15 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-wide uppercase border border-white/20">
                        Featured
                      </div>
                    )}

                    {/* Bottom overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      {price && (
                        <div className="text-[11px] font-bold text-[#22c55e] mb-1.5">{price}</div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-2.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        {date}{time ? ` · ${time}` : ""}
                      </div>
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(ev) => ev.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#F84464] hover:bg-[#e03358] text-white text-[11px] font-bold rounded-lg transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-300"
                      >
                        <Ticket className="w-3 h-3" /> Get Tickets
                      </a>
                    </div>
                  </div>

                  {/* Info below card */}
                  <div className="mt-2.5 px-0.5">
                    <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 group-hover:text-[#F84464] transition-colors duration-200">
                      {e.name}
                    </h3>
                    {venue && (
                      <div className="flex items-center gap-1 mt-1 text-gray-600 text-xs">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};