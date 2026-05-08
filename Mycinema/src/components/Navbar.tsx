import {
  Search, Menu, MapPin, Bell, ChevronDown, Ticket, Play,
  LogOut, User, Settings, Heart, CalendarCheck, ChevronRight,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SignInModal from "./SignInModal";

const cinemaLinks = ["Movies", "Events", "Plays", "Sports", "Activities"];
const streamLinks = ["Home", "Movies", "Web Series", "Originals", "Live TV"];

type AuthUser = { name: string; email: string };

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const getAvatarColor = (name: string) => {
  const colors = [
    ["#4f46e5", "#818cf8"], // indigo
    ["#0891b2", "#67e8f9"], // cyan
    ["#059669", "#6ee7b7"], // emerald
    ["#d97706", "#fcd34d"], // amber
    ["#dc2626", "#fca5a5"], // red
    ["#7c3aed", "#c4b5fd"], // violet
    ["#db2777", "#f9a8d4"], // pink
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

const profileMenuItems = [
  { icon: CalendarCheck, label: "My Bookings", to: "/bookings" },
  { icon: Heart,         label: "Wishlist",    to: "/wishlist" },
  { icon: Settings,      label: "Settings",    to: "/settings" },
];

const Navbar = () => {
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mode, setMode] = useState<"cinema" | "stream">("cinema");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const mobileSearchRef = useRef<HTMLInputElement>(null);
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
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => mobileSearchRef.current?.focus(), 50);
  }, [searchOpen]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const cityName =
            data.address.city || data.address.town || data.address.village ||
            data.address.state_district || data.address.state || null;
          if (cityName) { setCity(cityName); localStorage.setItem("city", cityName); }
          else alert("Could not detect city");
        } catch { alert("Unable to fetch location"); }
        finally { setLoading(false); }
      },
      () => { alert("Permission denied"); setLoading(false); }
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
  };

  const navLinks = mode === "cinema" ? cinemaLinks : streamLinks;
  const [avatarBg, avatarText] = user ? getAvatarColor(user.name) : ["#F84464", "#fff"];

  return (
    <>
      <nav className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/96 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]" : "bg-[#050505]"
      }`}>
        {/* TOP ROW */}
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/[0.06]">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-0 shrink-0">
            <span className="text-[20px] md:text-[21px] font-black tracking-tighter text-white">my</span>
            <span className="text-[20px] md:text-[21px] font-black tracking-tighter text-[#F84464]">Cinema</span>
          </Link>

          {/* MODE TOGGLE */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/8 rounded-full p-1 ml-5 shrink-0">
            {(["cinema", "stream"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  mode === m ? "bg-[#F84464] text-white shadow-lg" : "text-gray-500 hover:text-white"
                }`}
              >
                {m === "cinema" ? <Ticket className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                {m === "cinema" ? "Cinema" : "Stream"}
              </button>
            ))}
          </div>

          {/* SEARCH BAR */}
          <div className={`hidden md:flex items-center gap-3 rounded-xl px-4 py-2.5 flex-1 mx-8 transition-all duration-300 border ${
            searchFocused
              ? "bg-white/8 border-[#F84464]/40 shadow-[0_0_20px_rgba(248,68,100,0.12)]"
              : "bg-white/5 border-white/8"
          }`}>
            <Search className={`w-4 h-4 shrink-0 transition-colors ${searchFocused ? "text-[#F84464]" : "text-gray-500"}`} />
            <input
              type="text"
              placeholder={mode === "cinema" ? "Search movies, events, plays..." : "Search shows, movies, originals..."}
              className="bg-transparent outline-none text-white text-sm w-full placeholder:text-gray-600"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto shrink-0">

            {/* MOBILE SEARCH */}
            <button className="md:hidden text-gray-400 hover:text-white transition-colors" onClick={() => setSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </button>

            {/* LOCATION */}
            {mode === "cinema" && (
              <button onClick={getCurrentLocation} className="hidden md:flex items-center gap-2 text-[13px] text-gray-400 hover:text-white transition-colors">
                <MapPin className="w-4 h-4 text-[#F84464]" />
                <span>{loading ? "Detecting..." : city ?? "Select City"}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            )}

            {/* BELL */}
            <button className="hidden md:block relative text-gray-500 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F84464]" />
            </button>

            {/* USER PROFILE */}
            {user ? (
              <div className="relative" ref={profileRef}>
                {/* Avatar trigger */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 group"
                >
                  {/* Avatar circle */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ring-2 ring-transparent group-hover:ring-[#F84464]/50 transition-all duration-200"
                    style={{ background: avatarBg, color: avatarText }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] w-[260px] bg-[#111118] border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">

                    {/* Profile header */}
                    <div className="px-4 py-4 flex items-center gap-3 border-b border-white/[0.06]">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                        style={{ background: avatarBg, color: avatarText }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{user.name}</p>
                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      {profileMenuItems.map(({ icon: Icon, label, to }) => (
                        <Link
                          key={label}
                          to={to}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                        >
                          <Icon className="w-4 h-4 shrink-0 group-hover:text-[#F84464] transition-colors" />
                          <span className="text-sm font-medium">{label}</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-white/[0.06] py-1.5">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-semibold">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="hidden md:block bg-[#F84464] hover:bg-[#e03455] text-white text-[13px] font-black px-5 py-2 rounded-lg transition-all active:scale-95 whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            {/* HAMBURGER */}
            <button onClick={() => setDrawerOpen(true)} className="md:hidden text-gray-400 hover:text-white transition-colors p-1">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* BOTTOM NAV */}
        <div className="hidden md:block bg-[#070707] border-b border-white/[0.04]">
          <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between py-2.5">
            <div className="flex gap-7">
              {navLinks.map((item) => (
                <Link
                  key={item}
                  to={item === "Movies" ? "/movies" : "/"}
                  className="relative text-[13px] font-semibold text-gray-400 hover:text-white transition-colors duration-200 group py-0.5"
                >
                  {item}
                  <span className="absolute -bottom-[1px] left-0 w-0 h-[2px] bg-[#F84464] group-hover:w-full transition-all duration-300 rounded-full" />
                </Link>
              ))}
            </div>
            <div className="flex gap-5 items-center text-[11px] font-bold tracking-widest text-gray-500 uppercase">
              {mode === "cinema" ? (
                <>
                  <a href="#" className="hover:text-[#F84464] transition-colors">Offers</a>
                  <span className="text-white/10">|</span>
                  <a href="#" className="hover:text-[#F84464] transition-colors">Gift Cards</a>
                </>
              ) : (
                <>
                  <a href="#" className="hover:text-[#F84464] transition-colors">Subscribe</a>
                  <span className="text-white/10">|</span>
                  <span className="text-[#F84464] border border-[#F84464]/40 rounded px-2 py-0.5 normal-case font-black text-[10px] tracking-wide">Premium</span>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showModal && <SignInModal onClose={() => setShowModal(false)} onSuccess={handleSignInSuccess} />}
    </>
  );
};

export default Navbar;