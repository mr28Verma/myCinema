import {
  Search, MapPin, ChevronDown, Ticket, Play,
  LogOut, Settings, Heart, CalendarCheck, X, Menu,
  Film, CalendarRange, Trophy, Zap,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SignInModal from "./SignInModal";

const cinemaNavItems = [
  { label: "Movies", sub: "Now showing", icon: Film, to: "/movies" },
  { label: "Events", sub: "Live & upcoming", icon: CalendarRange, to: "/events" },
  { label: "Plays", sub: "Theatre & drama", icon: Ticket, to: "/" },
  { label: "Sports", sub: "Match tickets", icon: Trophy, to: "/sports" },
  { label: "Activities", sub: "Experiences near you", icon: Zap, to: "/", wide: true },
];

const streamNavItems = [
  { label: "Home", sub: "Your feed", icon: Film, to: "/" },
  { label: "Movies", sub: "Stream now", icon: Film, to: "/movies" },
  { label: "Web Series", sub: "Binge worthy", icon: Play, to: "/" },
  { label: "Originals", sub: "Exclusive content", icon: Zap, to: "/" },
  { label: "Live TV", sub: "Watch live", icon: Trophy, to: "/", wide: true },
];

const cinemaLinks = ["Movies", "Events", "Plays", "Sports", "Activities"];
const streamLinks = ["Home", "Movies", "Web Series", "Originals", "Live TV"];

type AuthUser = { name: string; email: string };

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const getAvatarColor = (name: string) => {
  const colors = [
    ["#4f46e5", "#818cf8"], ["#0891b2", "#67e8f9"], ["#059669", "#6ee7b7"],
    ["#d97706", "#fcd34d"], ["#dc2626", "#fca5a5"], ["#7c3aed", "#c4b5fd"],
    ["#db2777", "#f9a8d4"],
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

const profileMenuItems = [
  { icon: CalendarCheck, label: "My Bookings", to: "/bookings" },
  { icon: Heart, label: "Wishlist", to: "/wishlist" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

const getLinkPath = (item: string) => {
  if (item === "Movies") return "/movies";
  if (item === "Events") return "/events";
  if (item === "Sports") return "/sports";
  return "/";
};

const Navbar = () => {
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mode, setMode] = useState<"cinema" | "stream">("cinema");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedCity = localStorage.getItem("city");
    if (savedCity) setCity(savedCity);
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) setUser(JSON.parse(savedUser));
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleModeToggle = (newMode: "cinema" | "stream") => {
    if (newMode === mode) return;
    setIsChanging(true);
    setTimeout(() => { setMode(newMode); setIsChanging(false); }, 200);
  };

  const getCurrentLocation = () => {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    async ({ coords: { latitude, longitude } }) => {
      try {
        let cityName: string | null = null;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (res.ok) {
            const data = await res.json();
            cityName = data.city || data.locality || data.principalSubdivision || null;
          }
        } catch { /* silently fall through */ }
        if (!cityName) {
          cityName = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
        }

        setCity(cityName);
        localStorage.setItem("city", cityName);
      } catch {
        alert("Unable to fetch location");
      } finally {
        setLoading(false);
      }
    },
    (err) => {
      const messages: Record<number, string> = {
        1: "Location permission denied. Allow access in browser settings.",
        2: "Location unavailable. Try again.",
        3: "Location request timed out.",
      };
      alert(messages[err.code] ?? "Unable to get location");
      setLoading(false);
    },
    { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
  );
};

  const handleSignInSuccess = (loggedInUser: AuthUser) => {
    setUser(loggedInUser);
    localStorage.setItem("authUser", JSON.stringify(loggedInUser));
    setShowModal(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("authUser");
    setUser(null);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  const navLinks = mode === "cinema" ? cinemaLinks : streamLinks;
  const mobileNavItems = mode === "cinema" ? cinemaNavItems : streamNavItems;
  const accentColor = mode === "cinema" ? "#F84464" : "#3b82f6";
  const [avatarBg, avatarText] = user ? getAvatarColor(user.name) : ["#F84464", "#fff"];

  return (
    <>
      <nav className={`w-full sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/95 backdrop-blur-xl shadow-2xl" : "bg-[#050505]"}`}>

        {/* TOP ROW */}
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/[0.06]">

          {/* LOGO */}
          <Link to="/" className="flex items-center shrink-0">
            <span className="text-[20px] md:text-[21px] font-black tracking-tighter text-white">my</span>
            <span
              className="text-[20px] md:text-[21px] font-black tracking-tighter transition-colors duration-500"
              style={{ color: accentColor }}
            >
              Cinema
            </span>
          </Link>

          {/* MODE TOGGLE - Desktop only */}
          <div className="hidden md:flex relative items-center bg-white/5 border border-white/10 rounded-full p-1 ml-8 w-44 h-9">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out shadow-lg shadow-black/40"
              style={{ left: mode === "cinema" ? "4px" : "50%", backgroundColor: accentColor }}
            />
            {(["cinema", "stream"] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleModeToggle(m)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 text-[12px] font-bold transition-colors duration-300 ${mode === m ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                {m === "cinema" ? <Ticket className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* SEARCH BAR - Desktop */}
          <div className={`hidden md:flex items-center gap-3 rounded-xl px-4 py-2.5 flex-1 mx-10 transition-all duration-300 border ${searchFocused ? "bg-white/10 border-white/20" : "bg-white/5 border-white/5"}`}>
            <Search className={`w-4 h-4 transition-colors ${searchFocused ? "text-white" : "text-gray-500"}`} />
            <input
              type="text"
              placeholder={mode === "cinema" ? "Search movies, events, plays..." : "Search shows, movies, originals..."}
              className="bg-transparent outline-none text-white text-sm w-full placeholder:text-gray-600"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">

            {/* City pill — shown on mobile too */}
            {mode === "cinema" && (
              <button
                onClick={getCurrentLocation}
                className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-full px-3 py-1.5"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                <span className="max-w-[70px] truncate">{loading ? "..." : city ?? "City"}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            )}

            {/* Desktop: User or Sign In */}
            {user ? (
              <div className="relative hidden md:block" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 group">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black ring-2 ring-transparent group-hover:ring-white/20 transition-all"
                    style={{ background: avatarBg, color: avatarText }}
                  >
                    {getInitials(user.name)}
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-[#111118] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-4 border-b border-white/5 bg-white/[0.02]">
                      <p className="text-white font-bold text-sm truncate">{user.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      {profileMenuItems.map(({ icon: Icon, label, to }) => (
                        <Link key={label} to={to} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
                          <Icon className="w-4 h-4 group-hover:text-[#F84464]" />
                          <span className="text-sm font-medium">{label}</span>
                        </Link>
                      ))}
                      <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-bold">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="hidden md:block text-white text-[13px] font-black px-6 py-2 rounded-lg transition-transform active:scale-95 shadow-lg"
                style={{ backgroundColor: accentColor }}
              >
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* BOTTOM NAV - Desktop */}
        <div className="hidden md:block bg-[#080808] border-b border-white/[0.04]">
          <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-[44px]">
            <div className={`flex gap-8 transition-all duration-300 ${isChanging ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}>
              {navLinks.map((item) => (
                <Link
                  key={item}
                  to={getLinkPath(item)}
                  className="relative text-[13px] font-semibold text-gray-400 hover:text-white transition-colors py-2 group"
                >
                  {item}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: accentColor }}
                  />
                </Link>
              ))}
            </div>
            <div className={`flex gap-6 items-center text-[11px] font-bold tracking-widest transition-opacity duration-300 ${isChanging ? "opacity-0" : "opacity-100"}`}>
              {mode === "cinema" ? (
                <>
                  <a href="#" className="text-gray-500 hover:text-white transition-colors">OFFERS</a>
                  <a href="#" className="text-gray-500 hover:text-white transition-colors">GIFT CARDS</a>
                </>
              ) : (
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-[10px]">PREMIUM ACCESS</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM SHEET ─────────────────────────────────────── */}

      {/* Backdrop */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0f0f0f] border-t border-white/[0.08] rounded-t-[24px] transition-transform duration-300 ease-out flex flex-col ${mobileMenuOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "88vh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-[3px] bg-white/20 rounded-full" />
        </div>

        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] shrink-0">
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Browse</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 pb-8">

          {/* Mode toggle */}
          <div className="mx-4 mt-4 flex bg-white/[0.04] border border-white/[0.07] rounded-2xl p-1 gap-1">
            {(["cinema", "stream"] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleModeToggle(m)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${mode === m ? "text-white" : "text-gray-500"}`}
                style={mode === m ? { backgroundColor: accentColor } : {}}
              >
                {m === "cinema" ? <Ticket className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Nav card grid */}
          <div className="grid grid-cols-2 gap-2.5 px-4 mt-3">
            {mobileNavItems.map(({ label, sub, icon: Icon, to, wide }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 active:scale-[0.97] transition-transform${wide ? " col-span-2" : ""}`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${accentColor}22` }}
                >
                  <Icon className="w-[18px] h-[18px]" style={{ color: accentColor }} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white leading-tight">{label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Offers / Gift Cards row */}
          <div className="flex gap-2.5 px-4 mt-2.5">
            {mode === "cinema" ? (
              <>
                <a href="#" className="flex-1 text-center text-[11px] font-bold tracking-widest text-gray-500 hover:text-white bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 transition-colors">OFFERS</a>
                <a href="#" className="flex-1 text-center text-[11px] font-bold tracking-widest text-gray-500 hover:text-white bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 transition-colors">GIFT CARDS</a>
              </>
            ) : (
              <div className="flex-1 text-center text-[11px] font-bold text-blue-400 bg-blue-600/10 border border-blue-500/20 rounded-xl py-2.5">✦ PREMIUM ACCESS</div>
            )}
          </div>

          {/* User section */}
          <div className="mx-4 mt-4 pt-4 border-t border-white/[0.06]">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: avatarBg, color: avatarText }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{user.name}</p>
                    <p className="text-gray-500 text-xs truncate">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  {profileMenuItems.map(({ icon: Icon, label, to }) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] rounded-xl py-3 text-gray-400 hover:text-white transition-all active:scale-95"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-semibold">{label.split(" ")[0]}</span>
                    </Link>
                  ))}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 text-sm font-bold active:scale-[0.97] transition-transform"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setShowModal(true); setMobileMenuOpen(false); }}
                className="w-full text-white text-[14px] font-black py-3.5 rounded-2xl active:scale-[0.97] transition-transform shadow-lg"
                style={{ backgroundColor: accentColor }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && <SignInModal onClose={() => setShowModal(false)} onSuccess={handleSignInSuccess} />}
    </>
  );
};

export default Navbar;