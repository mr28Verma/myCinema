declare const google: any;
import {
  ChevronRight, ChevronLeft, Star, MapPin, Zap,
  CreditCard, Wallet, Building2, Loader2, AlertCircle,
  RefreshCw, Clock, Shield, Search,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

type Theater = {
  id: string;
  name: string;
  dist: string;
  vicinity: string;
  rating: number;
  tags: string[];
  shows: string[];
  open: boolean | null;
};

// ─── Constants ──────────────────────────────────────────────────
const SEAT_ZONES = [
  { label: "Executive", price: 300, rows: ["A"], cols: 21 },
  { label: "Royal", price: 180, rows: ["B", "C", "D", "E", "F", "G", "H", "I", "J"], cols: 17, aisle: [4, 13], premRows: ["C", "D"] },
  { label: "Marvel", price: 150, rows: ["K", "L"], cols: 17, aisle: [4, 13] },
  { label: "Classic", price: 120, rows: ["M"], cols: 17, aisle: [4, 13] },
];

const PRESET_TAKEN = new Set([
  "A5", "A6", "A15", "A16", "A17", "B8", "B9", "C12", "D5", "D6",
  "E7", "E8", "F10", "G3", "H14", "I6", "J9", "K7", "L8", "M5",
]);

const CONVENIENCE_FEE = 30;
const MAX_SEATS = 8;
const R = "#f43f5e";

const TAG_COLORS = [
  { text: "#f59e0b", border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.08)" },
  { text: "#22d3ee", border: "rgba(34,211,238,0.3)", bg: "rgba(34,211,238,0.08)" },
  { text: "#a78bfa", border: "rgba(167,139,250,0.3)", bg: "rgba(167,139,250,0.08)" },
  { text: "#34d399", border: "rgba(52,211,153,0.3)", bg: "rgba(52,211,153,0.08)" },
];

// ─── Helpers ────────────────────────────────────────────────────
function randCode() { return "CINX-" + Math.random().toString(36).substring(2, 6).toUpperCase(); }

function seatPrice(key) {
  const r = key[0];
  if (r === "A") return 300;
  if (["C", "D"].includes(r)) return 180;
  if (["K", "L"].includes(r)) return 150;
  if (r === "M") return 120;
  return 180;
}

function distLabel(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function genShowtimes(id) {
  const base = ["10:30 AM", "1:00 PM", "4:15 PM", "7:30 PM", "10:45 PM"];
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const offset = hash % 3;
  return base.slice(offset, offset + 3).concat(base.slice(0, offset));
}

function genTags(idx) {
  return [["IMAX", "Dolby", "4DX"], ["4K", "Recliner", "F&B"], ["3D", "LUXE", "Atmos"], ["2D", "3D", "Budget"]][idx % 4];
}

// ─── Google Places fetch ────────────────────────────────────────
async function fetchNearbyTheaters(lat, lng): Promise<Theater[]> {
  return new Promise((resolve, reject) => {
    const map = new google.maps.Map(document.createElement("div"));
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
      { location: { lat, lng }, radius: 100000, type: "movie_theater" },
      (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
          reject(new Error(status));
          return;
        }
        const theaters = results.slice(0, 6).map((place, idx) => {
          const distM = place.geometry?.location
            ? Math.round(Math.sqrt(
              Math.pow((place.geometry.location.lat() - lat) * 111000, 2) +
              Math.pow((place.geometry.location.lng() - lng) * 111000 * Math.cos((lat * Math.PI) / 180), 2)
            ))
            : 0;
          return {
            id: place.place_id,
            name: place.name,
            dist: distLabel(distM),
            vicinity: place.vicinity || "",
            rating: place.rating ?? 0,
            tags: genTags(idx),
            shows: genShowtimes(place.place_id),
            open: place.opening_hours?.open_now ?? null,
          };
        });
        resolve(theaters);
      }
    );
  });
}

// ─── Shared input style ─────────────────────────────────────────
const inputBase = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  color: "#fff",
  fontSize: 13,
  outline: "none",
  transition: "border-color .2s, background .2s",
};

// ─── StepBar ────────────────────────────────────────────────────
function StepBar({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0d0d0d" }}>
      {["Theater", "Seats", "Pay"].map((label, i) => {
        const n = i + 1, active = step === n, done = step > n;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 900, flexShrink: 0,
                border: active ? "none" : done ? "none" : "1.5px solid rgba(255,255,255,0.18)",
                background: active ? R : done ? "#fff" : "transparent",
                color: active ? "#fff" : done ? "#000" : "rgba(255,255,255,0.18)",
                boxShadow: active ? `0 0 16px ${R}88` : "none",
              }}>
                {done ? "✓" : n}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: active ? R : done ? "#fff" : "rgba(255,255,255,0.2)" }}>
                {label}
              </span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: done ? "rgba(244,63,94,0.35)" : "rgba(255,255,255,0.06)", margin: "0 14px" }} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── MovieHeader ────────────────────────────────────────────────
function MovieHeader({ movie }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 28px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#111"
      }}
    >

      {/* Movie Poster */}
      <div
        style={{
          width: 52,
          height: 72,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
          background: "#222"
        }}
      >
        <img
          src={`https://image.tmdb.org/t/p/w500${movie?.poster_path}`}
          alt={movie?.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      </div>

      {/* Movie Details */}
      <div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 5
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: R,
              border: `1px solid ${R}44`,
              background: `${R}14`,
              borderRadius: 5,
              padding: "2px 7px"
            }}
          >
            Now Showing
          </span>

          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 5,
              padding: "2px 7px"
            }}
          >
            UA
          </span>
        </div>

        {/* Movie Title */}
        <div
          style={{
            fontSize: 17,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.2
          }}
        >
          {movie?.title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 5
          }}
        >

          {/* Runtime */}
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.38)",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <Clock style={{ width: 11, height: 11 }} />
            2h 14m
          </span>

          {/* Genre */}
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.38)"
            }}
          >
            Action · Sci-Fi
          </span>

          {/* Rating */}
          <span
            style={{
              fontSize: 11,
              color: R,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 3
            }}
          >
            <Star style={{ width: 11, height: 11, fill: R }} />
            {movie?.vote_average?.toFixed(1)}
          </span>

        </div>
      </div>
    </div>
  );
}

// ─── TheaterScreen (with Google Places) ─────────────────────────
function TheaterScreen({ selId, selShow, onPickTheater, onPickShow, onNext, onTheatersLoaded }) {
  const [query, setQuery] = useState("");
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locLabel, setLocLabel] = useState("Ludhiana, Punjab");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let lat = 30.7333, lng = 76.7794; // Chandigarh default
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocLabel(`${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`);
      } catch { }
      const data = await fetchNearbyTheaters(lat, lng);
      setTheaters(data);
      onTheatersLoaded(data);
    } catch (e) {
      setError(e.message || "Failed to load theaters");
    } finally {
      setLoading(false);
    }
  }, [onTheatersLoaded]);

  useEffect(() => { load(); }, [load]);

  const filtered = theaters.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.vicinity.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 130px" }}>

        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Search style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "rgba(255,255,255,0.22)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search theaters near you…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ ...inputBase, padding: "12px 14px 12px 40px" }}
            onFocus={e => { e.target.style.borderColor = "rgba(244,63,94,0.45)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
          />
        </div>

        {/* Location + refresh */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: R, boxShadow: `0 0 8px ${R}cc` }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
              Near {locLabel}
            </span>
          </div>
          {!loading && (
            <button
              onClick={load}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", padding: 4 }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} />
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 12 }}>
            <Loader2 style={{ width: 32, height: 32, color: R, animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Finding theaters near you…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 16, textAlign: "center" }}>
            <AlertCircle style={{ width: 40, height: 40, color: R }} />
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Could not load theaters</p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 6 }}>{error}</p>
              <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 11 }}>
                Make sure your <span style={{ color: R, fontFamily: "monospace" }}>VITE_GOOGLE_API_KEY</span> is set and has Places API enabled.
              </p>
            </div>
            <button
              onClick={load}
              style={{ display: "flex", alignItems: "center", gap: 8, background: R, color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} /> Retry
            </button>
          </div>
        )}

        {/* Theater cards */}
        {!loading && !error && filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13, paddingTop: 60 }}>No theaters found nearby.</p>
        )}

        {!loading && !error && filtered.map((t, idx) => {
          const tc = TAG_COLORS[idx % TAG_COLORS.length];
          const sel = selId === t.id;
          return (
            <div
              key={t.id}
              onClick={() => onPickTheater(t.id)}
              style={{
                border: sel ? `1px solid ${R}88` : "1px solid rgba(255,255,255,0.07)",
                background: sel ? `${R}08` : "rgba(255,255,255,0.02)",
                borderRadius: 16, padding: 18, marginBottom: 12, cursor: "pointer",
                boxShadow: sel ? `0 0 32px ${R}12` : "none", transition: "all .2s",
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin style={{ width: 10, height: 10, flexShrink: 0 }} />{t.dist} · {t.vicinity}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                  {t.rating > 0 && (
                    <span style={{ fontSize: 11, color: R, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                      <Star style={{ width: 11, height: 11, fill: R }} />{t.rating}
                    </span>
                  )}
                  {t.open !== null && (
                    <span style={{
                      fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
                      padding: "3px 9px", borderRadius: 20,
                      color: t.open ? "#34d399" : "#f87171",
                      background: t.open ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                      border: t.open ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(248,113,113,0.25)",
                    }}>
                      {t.open ? "Open" : "Closed"}
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {t.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 20, color: tc.text, border: `1px solid ${tc.border}`, background: tc.bg }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Showtimes */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {t.shows.map((show, si) => {
                  const isSel = selId === t.id && selShow === show;
                  return (
                    <button
                      key={show}
                      onClick={e => { e.stopPropagation(); onPickShow(t.id, show); }}
                      style={{
                        fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 10,
                        border: isSel ? "none" : si < 2 ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.08)",
                        background: isSel ? R : si < 2 ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.04)",
                        color: isSel ? "#fff" : si < 2 ? "#f59e0b" : "rgba(255,255,255,0.55)",
                        boxShadow: isSel ? `0 4px 16px ${R}55` : "none",
                        cursor: "pointer", transition: "all .15s",
                      }}
                    >
                      {show}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(8,8,8,0.97)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "14px 28px", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selId
              ? theaters.find(t => t.id === selId)?.name
              : <span style={{ color: "rgba(255,255,255,0.2)" }}>No theater selected</span>}
          </div>
          <div style={{ fontSize: 11, marginTop: 3, color: selShow ? R : "rgba(255,255,255,0.2)" }}>
            {selShow ? `${selShow} · Today` : "Pick a showtime above"}
          </div>
        </div>
        <button
          onClick={onNext}
          disabled={!selId || !selShow}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: (!selId || !selShow) ? "rgba(244,63,94,0.25)" : R,
            color: "#fff", border: "none", borderRadius: 12,
            padding: "12px 22px", fontSize: 13, fontWeight: 900,
            cursor: (!selId || !selShow) ? "not-allowed" : "pointer",
            flexShrink: 0, boxShadow: (!selId || !selShow) ? "none" : `0 6px 24px ${R}55`,
            transition: "all .2s",
          }}
        >
          Select Seats <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
}

// ─── SeatScreen ─────────────────────────────────────────────────
function SeatScreen({ selSeats, onToggle, onBack, onNext }) {
  const total = selSeats.reduce((s, k) => s + seatPrice(k), 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 120px" }}>

        {/* Screen glow */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 220, height: 3, margin: "0 auto 5px", borderRadius: 2, background: `linear-gradient(90deg,transparent,${R}88,transparent)`, filter: "blur(2px)" }} />
          <div style={{ width: 220, height: 1, margin: "0 auto 6px", background: `linear-gradient(90deg,transparent,${R}33,transparent)` }} />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase" }}>All eyes this way · Screen</span>
        </div>

        {SEAT_ZONES.map(zone => (
          <div key={zone.label} style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1, maxWidth: 60, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.22)", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
                {zone.label} — ₹{zone.price}
              </span>
              <div style={{ flex: 1, maxWidth: 60, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>
            {zone.rows.map(row => (
              <div key={row} style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 4, justifyContent: "center" }}>
                <span style={{ width: 14, fontSize: 9, color: "rgba(255,255,255,0.18)", textAlign: "center", fontWeight: 700, flexShrink: 0 }}>{row}</span>
                {Array.from({ length: zone.cols }, (_, i) => {
                  const col = i + 1;
                  const showAisle = zone.aisle && (col === zone.aisle[0] + 1 || col === zone.aisle[1] + 1);
                  const key = `${row}${col}`;
                  const taken = PRESET_TAKEN.has(key);
                  const selected = selSeats.includes(key);
                  const prem = zone.premRows?.includes(row) ?? false;
                  return (
                    <div key={col} style={{ display: "flex", alignItems: "center" }}>
                      {showAisle && <div style={{ width: 12, flexShrink: 0 }} />}
                      <button
                        disabled={taken}
                        onClick={() => onToggle(key)}
                        title={key}
                        style={{
                          width: 20, height: 18,
                          borderRadius: "3px 3px 2px 2px",
                          border: "none", flexShrink: 0,
                          cursor: taken ? "not-allowed" : "pointer",
                          transform: selected ? "scale(1.12)" : "scale(1)",
                          background: taken ? "rgba(255,255,255,0.03)"
                            : selected ? (prem ? "#f59e0b" : R)
                              : prem ? "rgba(245,158,11,0.07)" : "rgba(255,255,255,0.06)",
                          outline: taken ? "1px solid rgba(255,255,255,0.05)"
                            : selected ? (prem ? "1px solid #f59e0b" : `1px solid ${R}`)
                              : prem ? "1px solid rgba(245,158,11,0.22)" : "1px solid rgba(255,255,255,0.09)",
                          boxShadow: selected ? (prem ? "0 2px 8px rgba(245,158,11,0.5)" : `0 2px 8px ${R}55`) : "none",
                          transition: "all .12s",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}

        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            { label: "Available", bg: "rgba(255,255,255,0.06)", outline: "1px solid rgba(255,255,255,0.1)" },
            { label: "Selected", bg: R, outline: "none" },
            { label: "Taken", bg: "rgba(255,255,255,0.03)", outline: "1px solid rgba(255,255,255,0.05)" },
            { label: "Premium", bg: "rgba(245,158,11,0.07)", outline: "1px solid rgba(245,158,11,0.22)" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
              <div style={{ width: 16, height: 13, borderRadius: "3px 3px 2px 2px", background: l.bg, outline: l.outline }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(8,8,8,0.97)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "14px 28px", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: R }}>₹{total || "—"}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>
            {selSeats.length ? `${selSeats.length} seat${selSeats.length > 1 ? "s" : ""} · ${selSeats.join(", ")}` : "No seats selected"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "11px 14px", cursor: "pointer", display: "flex", alignItems: "center", color: "rgba(255,255,255,0.55)" }}>
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
          <button
            onClick={onNext}
            disabled={selSeats.length === 0}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: selSeats.length === 0 ? "rgba(244,63,94,0.25)" : R,
              color: "#fff", border: "none", borderRadius: 12,
              padding: "11px 22px", fontSize: 13, fontWeight: 900,
              cursor: selSeats.length === 0 ? "not-allowed" : "pointer",
              boxShadow: selSeats.length === 0 ? "none" : `0 6px 24px ${R}55`,
            }}
          >
            Pay <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PayScreen ──────────────────────────────────────────────────
function PayScreen({ theater, show, selSeats, onBack, onConfirm }) {
  const [payMethod, setPayMethod] = useState("card");
  const total = selSeats.reduce((s, k) => s + seatPrice(k), 0);
  const grand = total + CONVENIENCE_FEE;
  const pms = [
    { key: "card", icon: CreditCard, label: "Card" },
    { key: "upi", icon: Zap, label: "UPI" },
    { key: "wallet", icon: Wallet, label: "Wallet" },
    { key: "net", icon: Building2, label: "Net Banking" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 140px" }}>

        {/* Summary */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 10 }}>Booking Summary</div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { l: "Theater", v: theater?.name },
              { l: "Show", v: `${show} · Today` },
              { l: "Seats", v: selSeats.join(", ") },
              { l: "Subtotal", v: `₹${total} + ₹${CONVENIENCE_FEE} fee` },
            ].map(r => (
              <div key={r.l}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>{r.l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{r.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment method tabs */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 10 }}>Payment Method</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
            {pms.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setPayMethod(key)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                  padding: "14px 0", borderRadius: 12,
                  border: payMethod === key ? `1px solid ${R}55` : "1px solid rgba(255,255,255,0.07)",
                  background: payMethod === key ? `${R}0a` : "rgba(255,255,255,0.02)",
                  color: payMethod === key ? R : "rgba(255,255,255,0.3)",
                  fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all .2s",
                }}
              >
                <Icon style={{ width: 15, height: 15 }} />{label}
              </button>
            ))}
          </div>

          {payMethod === "card" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Name on Card", placeholder: "Ravi Kumar", full: true, type: "text" },
                { label: "Card Number", placeholder: "•••• •••• •••• ••••", full: true, type: "text" },
                { label: "Expiry", placeholder: "MM / YY", full: false, type: "text" },
                { label: "CVV", placeholder: "•••", full: false, type: "password" },
              ].map(f => (
                <div key={f.label} style={f.full ? { gridColumn: "1/-1" } : {}}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 900, marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    style={{ ...inputBase, padding: "12px 14px" }}
                    onFocus={e => { e.target.style.borderColor = "rgba(244,63,94,0.45)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                  />
                </div>
              ))}
            </div>
          )}
          {payMethod !== "card" && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20, textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 13 }}>
                You'll be redirected to complete payment via {pms.find(p => p.key === payMethod)?.label}.
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(8,8,8,0.97)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "14px 28px", backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>Total incl. convenience fee</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: R }}>₹{grand}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 700 }}>
            <ChevronLeft style={{ width: 16, height: 16 }} />Back
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: R, color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontSize: 13, fontWeight: 900, cursor: "pointer", boxShadow: `0 6px 24px ${R}55` }}
          >
            <Shield style={{ width: 15, height: 15 }} /> Pay ₹{grand} Securely
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ConfirmScreen ───────────────────────────────────────────────
function ConfirmScreen({ theater, show, selSeats, code, onReset }) {
  const total = selSeats.reduce((s, k) => s + seatPrice(k), 0) + CONVENIENCE_FEE;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "40px 28px", textAlign: "center" }}>
      <div style={{ position: "relative", marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${R}18`, border: `2px solid ${R}55`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${R}33` }}>
          <svg viewBox="0 0 24 24" style={{ width: 34, height: 34, color: R }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9a3 3 0 010-6h20a3 3 0 010 6" /><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6" /><path d="M9 3v18M15 3v18" />
          </svg>
        </div>
        <div style={{ position: "absolute", top: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 900 }}>✓</div>
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 8, letterSpacing: "-0.02em" }}>Booking Confirmed!</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)", marginBottom: 28 }}>Your e-tickets have been sent to your email.</p>
      <div style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, marginBottom: 6 }}>Booking Code</div>
        <div style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 900, letterSpacing: "0.22em", color: R }}>{code}</div>
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.9 }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{theater?.name}</div>
        <div>{show} · Today</div>
        <div>Seats: <span style={{ color: "rgba(255,255,255,0.6)" }}>{selSeats.join(", ")}</span></div>
        <div style={{ color: R, fontWeight: 800, fontSize: 15, marginTop: 8 }}>Total Paid: ₹{total}</div>
      </div>
      <button
        onClick={onReset}
        style={{ marginTop: 32, width: "100%", background: R, color: "#fff", border: "none", borderRadius: 14, padding: "16px 0", fontSize: 14, fontWeight: 900, cursor: "pointer", boxShadow: `0 8px 32px ${R}55` }}
      >
        Book Another Show
      </button>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────
export default function BookingPage() {
  const location = useLocation();

  const movie = location.state?.movie;
  const [step, setStep] = useState(1);
  const [theaterId, setTheaterId] = useState(null);
  const [selShow, setSelShow] = useState(null);
  const [selSeats, setSelSeats] = useState([]);
  const [bookingCode, setBookingCode] = useState("");
  const [theaters, setTheaters] = useState([]);   // lifted from TheaterScreen

  const theater = theaters.find(t => t.id === theaterId);

  const toggleSeat = useCallback((key) => {
    setSelSeats(prev => {
      if (prev.includes(key)) return prev.filter(s => s !== key);
      if (prev.length >= MAX_SEATS) return prev;
      return [...prev, key];
    });
  }, []);

  const confirm = useCallback(() => { setBookingCode(randCode()); setStep(4); }, []);

  const reset = useCallback(() => {
    setStep(1); setTheaterId(null); setSelShow(null); setSelSeats([]); setBookingCode("");
  }, []);

  return (
    <div style={{ background: "#080808", minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 50% at 85% 0%,rgba(244,63,94,0.05) 0%,transparent 70%)" }} />

      {step !== 4 && <StepBar step={step} />}
      <MovieHeader movie={movie} />

      <div style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative", minHeight: 0 }}>
        {step === 1 && (
          <TheaterScreen
            selId={theaterId}
            selShow={selShow}
            onPickTheater={setTheaterId}
            onPickShow={(id, show) => { setTheaterId(id); setSelShow(show); }}
            onNext={() => setStep(2)}
            onTheatersLoaded={setTheaters}
          />
        )}
        {step === 2 && (
          <SeatScreen
            selSeats={selSeats}
            onToggle={toggleSeat}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && theater && selShow && (
          <PayScreen
            theater={theater}
            show={selShow}
            selSeats={selSeats}
            onBack={() => setStep(2)}
            onConfirm={confirm}
          />
        )}
        {step === 4 && theater && selShow && (
          <ConfirmScreen
            theater={theater}
            show={selShow}
            selSeats={selSeats}
            code={bookingCode}
            onReset={reset}
          />
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        button:active { transform: scale(0.97) !important; }
        input::placeholder { color: rgba(255,255,255,0.18) !important; }
      `}</style>
    </div>
  );
}