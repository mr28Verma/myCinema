import { useState, useEffect } from "react";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const languages = [
    { name: "Hindi", code: "hi", flag: "🇮🇳" },
    { name: "Punjabi", code: "pa", flag: "🌾" },
    { name: "South", code: "te", flag: "🎬" },
    { name: "English", code: "en", flag: "🌐" },
];

const genres = [
    { name: "All", id: "" },
    { name: "Action", id: "28" },
    { name: "Comedy", id: "35" },
    { name: "Drama", id: "18" },
    { name: "Romance", id: "10749" },
    { name: "Thriller", id: "53" },
];

const formats = ["2D", "3D", "4DX", "IMAX"];

const getRatingColor = (rating: number) => {
    if (rating >= 7.5) return "#22c55e";
    if (rating >= 6) return "#f59e0b";
    return "#ef4444";
};

// TMDB doesn't have a "pa" language code — Punjabi films are tagged
// under "hi" with region IN. We fetch by keyword instead.
const PUNJABI_KEYWORD_ID = 210024; // TMDB keyword id for "punjabi"

export const MovieSection = () => {
    const MOVIE_API = import.meta.env.VITE_MOVIE_API_KEY;

    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLang, setSelectedLang] = useState("hi");
    const [selectedGenre, setSelectedGenre] = useState("");
    const [format, setFormat] = useState("2D");
    const [sortBy] = useState<"popularity" | "rating" | "date">("popularity");

    useEffect(() => {
        setLoading(true);
        setMovies([]);

        const sortMap: Record<string, string> = {
            popularity: "popularity.desc",
            rating: "vote_average.desc",
            date: "release_date.desc",
        };

        const isPunjabi = selectedLang === "pa";

        // Build base params
        const params = new URLSearchParams({
            api_key: MOVIE_API,
            sort_by: sortMap[sortBy],
            // Low threshold so regional films aren't excluded
            "vote_count.gte": isPunjabi ? "5" : "20",
            // Rolling 2-year window so it's always fresh
            "primary_release_date.gte": getDateYearsAgo(2),
            "primary_release_date.lte": getTodayDate(),
        });

        if (!isPunjabi) {
            params.set("with_original_language", selectedLang);
        } else {
            // Punjabi: use hi language + keyword filter
            params.set("with_original_language", "hi");
            params.set("with_keywords", String(PUNJABI_KEYWORD_ID));
        }

        if (selectedGenre) {
            params.set("with_genres", selectedGenre);
        }

        fetch(`https://api.themoviedb.org/3/discover/movie?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                setMovies(data.results || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));

    }, [selectedLang, selectedGenre, sortBy]);

    return (
        
        <>

            <section className="min-h-screen bg-[#0f0f13] text-white px-4 sm:px-8 py-8">

            {/* Filter Bar */}
            <div className="bg-[#1a1a22] border border-white/[0.06] rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center">
                {/* Language Pills */}
                <div className="flex gap-2 flex-wrap">
                    {languages.map((l) => {
                        const active = selectedLang === l.code;
                        return (
                            <button
                                key={l.code}
                                onClick={() => setSelectedLang(l.code)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                    active
                                        ? "bg-[#F84464] text-white shadow-lg shadow-[#F84464]/20"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <span>{l.flag}</span>
                                {l.name}
                            </button>
                        );
                    })}
                </div>

                <div className="w-px h-7 bg-white/10 hidden sm:block" />

                {/* Genre Pills */}
                <div className="flex gap-2 flex-wrap">
                    {genres.map((g) => {
                        const active = selectedGenre === g.id;
                        return (
                            <button
                                key={g.id}
                                onClick={() => setSelectedGenre(g.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                                    active
                                        ? "bg-white/15 text-white border border-white/30"
                                        : "text-gray-500 hover:text-gray-300"
                                }`}
                            >
                                {g.name}
                            </button>
                        );
                    })}
                </div>

                <div className="w-px h-7 bg-white/10 hidden sm:block" />

                {/* Format Switcher */}
                <div className="flex bg-black/30 rounded-lg p-1 border border-white/[0.06]">
                    {formats.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFormat(f)}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-150 ${
                                format === f
                                    ? "bg-[#F84464] text-white shadow shadow-[#F84464]/30"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-white/5 rounded-xl aspect-[2/3]" />
                            <div className="mt-2 h-3 bg-white/5 rounded w-3/4" />
                            <div className="mt-1.5 h-3 bg-white/5 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : movies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-5xl mb-4">🎬</div>
                    <p className="text-gray-400 text-lg font-medium">No movies found</p>
                    <p className="text-gray-600 text-sm mt-1">Try a different language or genre</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {movies.map((m) => {
                        const rating = m.vote_average?.toFixed(1);
                        const year = m.release_date?.slice(0, 4);

                        return (
                            <div key={m.id} className="group cursor-pointer">
                                <div className="relative overflow-hidden rounded-xl bg-white/5 aspect-[2/3]">
                                    {m.poster_path ? (
                                        <img
                                            src={`${TMDB_IMG}${m.poster_path}`}
                                            alt={m.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                            </svg>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="absolute top-2 left-2 bg-[#F84464] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                        {format}
                                    </div>

                                    {rating && (
                                        <div
                                            className="absolute top-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                                            style={{
                                                background: `${getRatingColor(m.vote_average)}22`,
                                                color: getRatingColor(m.vote_average),
                                                border: `1px solid ${getRatingColor(m.vote_average)}44`,
                                            }}
                                        >
                                            ★ {rating}
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <button className="w-full py-2 bg-[#F84464] text-white text-xs font-semibold rounded-lg hover:bg-[#e03358] transition">
                                            Book Tickets
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-2.5 px-0.5">
                                    <h3 className="text-white text-sm font-semibold leading-snug truncate group-hover:text-[#F84464] transition-colors duration-200">
                                        {m.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {year && <span className="text-gray-600 text-xs">{year}</span>}
                                        {m.original_language && (
                                            <span className="text-gray-700 text-xs uppercase font-medium">
                                                · {m.original_language}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
        
        </>
    );
};

// Helpers
function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

function getDateYearsAgo(years: number) {
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    return d.toISOString().split("T")[0];
}