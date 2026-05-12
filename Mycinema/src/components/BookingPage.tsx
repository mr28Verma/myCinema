import {
  ChevronRight, ChevronLeft, Star, MapPin, Zap,
  CreditCard, Wallet, Building2, Loader2, AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
declare const google: any;

// ─── Types ─────────────────────────────────────────────────────
type SeatZone = {
  label: string;
  price: number;
  rows: string[];
  cols: number;
  aisle?: [number, number];
  premRows?: string[];
};

type Step = 1 | 2 | 3 | 4;

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

// ─── Constants ─────────────────────────────────────────────────
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
console.log(GOOGLE_API_KEY);

// Showtimes generated per theater (deterministic from id hash)
function genShowtimes(id: string): string[] {
  const base = ["10:30 AM", "1:00 PM", "4:15 PM", "7:30 PM", "10:45 PM"];
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const offset = hash % 3;
  return base.slice(offset, offset + 3).concat(base.slice(0, offset));
}

function genTags(idx: number): string[] {
  const options = [
    ["IMAX", "Dolby", "4DX"],
    ["4K", "Recliner", "F&B"],
    ["3D", "LUXE", "Atmos"],
    ["2D", "3D", "Budget"],
  ];
  return options[idx % options.length];
}

const SEAT_ZONES: SeatZone[] = [
  { label: "₹300 Executive", price: 300, rows: ["A"],                                 cols: 21 },
  { label: "₹180 Royal",     price: 180, rows: ["B","C","D","E","F","G","H","I","J"],  cols: 17, aisle: [4, 13], premRows: ["C","D"] },
  { label: "₹150 Marvel",    price: 150, rows: ["K","L"],                              cols: 17, aisle: [4, 13] },
  { label: "₹120 Classic",   price: 120, rows: ["M"],                                 cols: 17, aisle: [4, 13] },
];

const PRESET_TAKEN = new Set([
  "A5","A6","A15","A16","A17",
  "B8","B9","C12","D5","D6",
  "E7","E8","F10","G3","H14","I6","J9",
  "K7","L8","M5",
]);

const CONVENIENCE_FEE = 30;
const MAX_SEATS = 8;

// ─── Helpers ───────────────────────────────────────────────────
function randCode() {
  return "CINX-" + Math.random().toString(36).substring(2, 6).toUpperCase();
}

function seatPrice(key: string): number {
  const row = key[0];
  if (row === "A")               return 300;
  if (["C","D"].includes(row))   return 180;
  if (["K","L"].includes(row))   return 150;
  if (row === "M")               return 120;
  return 180;
}

function distLabel(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// ─── Google Places fetch ───────────────────────────────────────
async function fetchNearbyTheaters(
  lat: number,
  lng: number
): Promise<Theater[]> {
  return new Promise((resolve, reject) => {
    const map = new google.maps.Map(document.createElement("div"));

    const service = new google.maps.places.PlacesService(map);

    service.nearbySearch(
      {
        location: { lat, lng },
        radius: 5000,
        type: "movie_theater",
      },
      (results, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !results
        ) {
          reject(status);
          return;
        }

        const theaters = results.slice(0, 6).map((place: any, idx: number) => {
          const distM = place.geometry?.location
            ? Math.round(
                Math.sqrt(
                  Math.pow(
                    (place.geometry.location.lat() - lat) * 111000,
                    2
                  ) +
                    Math.pow(
                      (place.geometry.location.lng() - lng) *
                        111000 *
                        Math.cos((lat * Math.PI) / 180),
                      2
                    )
                )
              )
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
// ─── Tag styles ────────────────────────────────────────────────
const TAG_STYLES = [
  "text-[#c9a227] border border-[rgba(201,162,39,0.3)] bg-[rgba(201,162,39,0.08)]",
  "text-[#00b4d8] border border-[rgba(0,180,216,0.3)]  bg-[rgba(0,180,216,0.08)]",
  "text-gray-400  border border-white/10                bg-white/5",
  "text-[#a78bfa] border border-[rgba(167,139,250,0.3)] bg-[rgba(167,139,250,0.08)]",
];

// ─── Step Bar ──────────────────────────────────────────────────
const StepBar = ({ step }: { step: Step }) => {
  const labels = ["Theater", "Seats", "Pay"] as const;
  return (
    <div className="flex items-center px-5 py-3 bg-[#111] border-b border-white/8">
      {labels.map((label, i) => {
        const num = (i + 1) as Step;
        const isActive = step === num;
        const isDone   = step > num;
        return (
          <div key={label} className="flex items-center gap-1 flex-1 last:flex-none">
            <div className={`flex items-center gap-2 text-[11px] font-bold tracking-[.1em] uppercase px-2 py-1.5 rounded-lg transition-all ${isActive ? "text-[#F84464]" : isDone ? "text-white" : "text-gray-600"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-[1.5px] flex-shrink-0 transition-all ${isActive ? "bg-[#F84464] border-[#F84464] text-white" : isDone ? "bg-white border-white text-black" : "border-gray-600"}`}>
                {isDone ? "✓" : num}
              </div>
              <span className="hidden sm:block">{label}</span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-white/8 mx-1" />}
          </div>
        );
      })}
    </div>
  );
};

// ─── Movie Header ──────────────────────────────────────────────
const MovieHeader = () => (
  <div className="flex items-center gap-4 px-5 py-3 bg-[#181818] border-b border-white/8">
    <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-[#1a0a12] to-[#3a1020] flex items-center justify-center text-xl flex-shrink-0">
      🎬
    </div>
    <div>
      <h2 className="text-[17px] font-black text-white">Now Showing</h2>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] font-black tracking-[.08em] uppercase text-[#F84464] border border-[rgba(248,68,100,.3)] bg-[rgba(248,68,100,.1)] rounded px-2 py-0.5">2h 14m</span>
        <span className="text-[11px] text-gray-500">UA • Action / Sci-Fi</span>
        <span className="text-[11px] text-[#F84464] flex items-center gap-0.5"><Star className="w-3 h-3 fill-[#F84464]" />8.2</span>
      </div>
    </div>
  </div>
);

// ─── Theater Screen ────────────────────────────────────────────
const TheaterScreen = ({
  selTheaterId, selShow,
  onPickTheater, onPickShow, onNext,
}: {
  selTheaterId: string | null;
  selShow: string | null;
  onPickTheater: (id: string) => void;
  onPickShow: (id: string, show: string) => void;
  onNext: () => void;
}) => {
  const [query,     setQuery]     = useState("");
  const [theaters,  setTheaters]  = useState<Theater[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [locLabel,  setLocLabel]  = useState("New Delhi");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let lat = 28.6139, lng = 77.2090;
      // Try geolocation
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        setLocLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } catch {
        // fallback to Delhi coords
      }
      const data = await fetchNearbyTheaters(lat, lng);
      setTheaters(data);
    } catch (e: any) {
      setError(e.message || "Failed to load theaters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const list = theaters.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.vicinity.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 pb-0">
        <input
          type="text"
          placeholder="🔍  Search theaters near you…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-[#181818] border border-white/8 text-white rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[rgba(248,68,100,.5)] mb-4 transition-colors"
        />

        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black tracking-[.18em] uppercase text-gray-600 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Near {locLabel}
          </p>
          {!loading && (
            <button onClick={load} className="text-gray-600 hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#F84464] animate-spin" />
            <p className="text-[13px] text-gray-500">Finding theaters near you…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-[#F84464]" />
            <div>
              <p className="text-white font-bold text-[14px]">Could not load theaters</p>
              <p className="text-gray-500 text-[12px] mt-1">{error}</p>
              <p className="text-gray-600 text-[11px] mt-2">Make sure your API key is set in the code.</p>
            </div>
            <button
              onClick={load}
              className="flex items-center gap-2 bg-[#F84464] text-white font-bold text-[13px] px-4 py-2 rounded-xl"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Theater list */}
        {!loading && !error && (
          <div className="flex flex-col gap-3 pb-28">
            {list.length === 0 && (
              <p className="text-center text-gray-600 text-[13px] py-10">No theaters found nearby.</p>
            )}
            {list.map((t, idx) => (
              <div
                key={t.id}
                onClick={() => onPickTheater(t.id)}
                className={`bg-[#111] border rounded-xl p-4 cursor-pointer transition-all ${selTheaterId === t.id ? "border-[#F84464] bg-[rgba(248,68,100,.05)]" : "border-white/8 hover:border-[rgba(248,68,100,.35)] hover:bg-[#151515]"}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-white leading-tight">{t.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{t.dist} · {t.vicinity}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                    {t.rating > 0 && (
                      <span className="text-[11px] text-[#F84464] flex items-center gap-0.5 font-bold">
                        <Star className="w-3 h-3 fill-[#F84464]" />{t.rating}
                      </span>
                    )}
                    {t.open !== null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.open ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                        {t.open ? "Open" : "Closed"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {t.tags.map((tag, ti) => (
                    <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded ${TAG_STYLES[idx % TAG_STYLES.length]}`}>{tag}</span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {t.shows.map((show, si) => {
                    const isSel = selTheaterId === t.id && selShow === show;
                    const isEarly = si < 2;
                    return (
                      <button
                        key={show}
                        onClick={e => { e.stopPropagation(); onPickShow(t.id, show); }}
                        className={`text-[12px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          isSel
                            ? isEarly
                              ? "bg-[#c9a227] border-[#c9a227] text-black"
                              : "bg-[#F84464] border-[#F84464] text-white shadow-[0_4px_16px_rgba(248,68,100,.3)]"
                            : isEarly
                              ? "border-[rgba(201,162,39,.4)] text-[#c9a227] bg-transparent hover:bg-[rgba(201,162,39,.15)]"
                              : "border-white/10 text-gray-300 bg-[#181818] hover:border-[#F84464] hover:text-[#F84464]"
                        }`}
                      >
                        {show}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/8 px-5 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-white truncate">
            {selTheaterId
              ? theaters.find(t => t.id === selTheaterId)?.name
              : <span className="text-gray-600">No theater selected</span>}
          </p>
          <p className={`text-[11px] mt-0.5 ${selShow ? "text-[#F84464]" : "text-gray-600"}`}>
            {selShow ? `${selShow} · Today` : "Pick a showtime"}
          </p>
        </div>
        <button
          onClick={onNext}
          disabled={!selTheaterId || !selShow}
          className="flex items-center gap-1.5 bg-[#F84464] hover:bg-[#e03455] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-[13px] px-5 py-2.5 rounded-xl transition-all shadow-[0_6px_24px_rgba(248,68,100,.35)] active:scale-95 flex-shrink-0"
        >
          Select Seats <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Seat Screen ───────────────────────────────────────────────
const SeatScreen = ({
  selSeats, onToggle, onBack, onNext,
}: {
  selSeats: string[];
  onToggle: (key: string) => void;
  onBack: () => void;
  onNext: () => void;
}) => {
  const total = selSeats.reduce((s, k) => s + seatPrice(k), 0);

  return (
    <div className="flex flex-col">
      <div className="overflow-y-auto p-5 pb-44">
        <div className="text-center mb-6">
          <div className="w-48 h-1.5 mx-auto rounded-b bg-gradient-to-r from-transparent via-[rgba(248,68,100,.6)] to-transparent mb-1.5" />
          <p className="text-[10px] text-gray-600 tracking-[.15em] uppercase">All eyes this way · Screen</p>
        </div>

        {SEAT_ZONES.map(zone => (
          <div key={zone.label} className="mb-6">
            <div className="flex items-center gap-2 justify-center mb-3">
              <div className="flex-1 max-w-[60px] h-px bg-white/8" />
              <p className="text-[10px] text-gray-500 tracking-[.15em] uppercase">{zone.label}</p>
              <div className="flex-1 max-w-[60px] h-px bg-white/8" />
            </div>
            {zone.rows.map(row => (
              <div key={row} className="flex items-center gap-1 mb-1.5 justify-center">
                <span className="w-4 text-[10px] text-gray-600 text-center font-bold flex-shrink-0">{row}</span>
                {Array.from({ length: zone.cols }, (_, i) => {
                  const col = i + 1;
                  const showAisle = zone.aisle && (col === zone.aisle[0] + 1 || col === zone.aisle[1] + 1);
                  const key = `${row}${col}`;
                  const taken = PRESET_TAKEN.has(key);
                  const selected = selSeats.includes(key);
                  const prem = zone.premRows?.includes(row) ?? false;
                  return (
                    <div key={col} className="flex items-center">
                      {showAisle && <div className="w-4 flex-shrink-0" />}
                      <button
                        disabled={taken}
                        onClick={() => onToggle(key)}
                        title={key}
                        className={`w-[22px] h-[20px] rounded-t-[4px] rounded-b-[2px] border text-[8px] font-bold transition-all flex-shrink-0 ${
                          taken
                            ? "bg-white/4 border-white/6 text-[#2a2a2a] cursor-not-allowed"
                            : selected
                              ? prem
                                ? "bg-[#c9a227] border-[#c9a227] text-black shadow-[0_2px_8px_rgba(201,162,39,.5)] scale-110"
                                : "bg-[#F84464] border-[#F84464] text-white shadow-[0_2px_8px_rgba(248,68,100,.5)] scale-110"
                              : prem
                                ? "bg-[rgba(201,162,39,.08)] border-[rgba(201,162,39,.3)] text-[rgba(201,162,39,.4)] hover:bg-[rgba(201,162,39,.25)] hover:border-[#c9a227] hover:text-[#c9a227] hover:scale-110"
                                : "bg-white/6 border-white/15 text-gray-600 hover:bg-[rgba(248,68,100,.2)] hover:border-[#F84464] hover:text-[#F84464] hover:scale-110"
                        }`}
                      >
                        {col}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}

        <div className="flex flex-wrap gap-4 justify-center mt-2">
          {[
            { label: "Available", cls: "bg-white/6 border border-white/15" },
            { label: "Selected",  cls: "bg-[#F84464]" },
            { label: "Taken",     cls: "bg-white/4 border border-white/6" },
            { label: "Premium",   cls: "bg-[rgba(201,162,39,.08)] border border-[rgba(201,162,39,.3)]" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <div className={`w-3.5 h-3 rounded-[3px_3px_1px_1px] ${l.cls}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/8 px-5 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[20px] font-black text-[#F84464]">₹{total}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {selSeats.length ? `${selSeats.length} seat${selSeats.length > 1 ? "s" : ""}: ${selSeats.join(", ")}` : "No seats selected"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="bg-white/8 hover:bg-white/12 text-gray-300 border border-white/10 font-bold text-[13px] px-4 py-2.5 rounded-xl transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNext}
            disabled={selSeats.length === 0}
            className="flex items-center gap-1.5 bg-[#F84464] hover:bg-[#e03455] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-[13px] px-5 py-2.5 rounded-xl transition-all shadow-[0_6px_24px_rgba(248,68,100,.35)] active:scale-95"
          >
            Pay <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Pay Screen ────────────────────────────────────────────────
const PayScreen = ({
  theater, show, selSeats, onBack, onConfirm,
}: {
  theater: Theater;
  show: string;
  selSeats: string[];
  onBack: () => void;
  onConfirm: () => void;
}) => {
  const [payMethod, setPayMethod] = useState<"card" | "upi" | "wallet" | "net">("card");
  const total = selSeats.reduce((s, k) => s + seatPrice(k), 0);
  const grand = total + CONVENIENCE_FEE;

  const payMethods = [
    { key: "card" as const,   icon: CreditCard, label: "Card" },
    { key: "upi" as const,    icon: Zap,        label: "UPI" },
    { key: "wallet" as const, icon: Wallet,      label: "Wallet" },
    { key: "net" as const,    icon: Building2,   label: "Net Banking" },
  ];

  return (
    <div className="flex flex-col">
      <div className="overflow-y-auto p-5 pb-44">
        <p className="text-[10px] font-black tracking-[.18em] uppercase text-gray-600 mb-3">Booking Summary</p>
        <div className="bg-[#111] border border-white/8 rounded-xl p-4 mb-5 grid grid-cols-2 gap-3">
          {[
            { l: "Theater", v: theater.name },
            { l: "Show",    v: `${show} · Today` },
            { l: "Seats",   v: selSeats.join(", ") },
            { l: "Subtotal",v: `₹${total} + ₹${CONVENIENCE_FEE} fee` },
          ].map(row => (
            <div key={row.l}>
              <p className="text-[10px] text-gray-600 uppercase tracking-[.1em] mb-0.5">{row.l}</p>
              <p className="text-[13px] font-bold text-white">{row.v}</p>
            </div>
          ))}
        </div>

        <p className="text-[10px] font-black tracking-[.18em] uppercase text-gray-600 mb-3">Payment Method</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {payMethods.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setPayMethod(key)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[11px] font-bold transition-all ${payMethod === key ? "border-[#F84464] text-[#F84464] bg-[rgba(248,68,100,.07)]" : "border-white/8 text-gray-500 bg-[#111] hover:border-white/20 hover:text-white"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {payMethod === "card" && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Name on Card", placeholder: "Ravi Kumar",          full: true,  type: "text" },
              { label: "Card Number",  placeholder: "•••• •••• •••• ••••", full: true,  type: "text" },
              { label: "Expiry",       placeholder: "MM / YY",             full: false, type: "text" },
              { label: "CVV",          placeholder: "•••",                 full: false, type: "password" },
            ].map(f => (
              <div key={f.label} className={f.full ? "col-span-2" : ""}>
                <label className="block text-[10px] text-gray-600 uppercase tracking-[.08em] font-bold mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  className="w-full bg-[#181818] border border-white/8 text-white rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-[rgba(248,68,100,.5)] transition-colors"
                />
              </div>
            ))}
          </div>
        )}
        {payMethod !== "card" && (
          <div className="bg-[#111] border border-white/8 rounded-xl p-5 text-center">
            <p className="text-gray-500 text-[13px]">You'll be redirected to complete payment via {payMethods.find(p => p.key === payMethod)?.label}.</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/8 px-5 py-3">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[12px] text-gray-500">Total (incl. convenience fee)</span>
          <span className="text-[20px] font-black text-[#F84464]">₹{grand}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="bg-white/8 hover:bg-white/12 text-gray-300 border border-white/10 font-bold text-[13px] px-4 py-2.5 rounded-xl transition-all flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />Back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 bg-[#F84464] hover:bg-[#e03455] text-white font-black text-[13px] py-2.5 rounded-xl transition-all shadow-[0_6px_24px_rgba(248,68,100,.35)] active:scale-95"
          >
            🔒 Pay ₹{grand}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Confirm Screen ────────────────────────────────────────────
const ConfirmScreen = ({
  theater, show, selSeats, code, onReset,
}: {
  theater: Theater;
  show: string;
  selSeats: string[];
  code: string;
  onReset: () => void;
}) => {
  const total = selSeats.reduce((s, k) => s + seatPrice(k), 0) + CONVENIENCE_FEE;
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
      <div className="w-16 h-16 rounded-full bg-[rgba(248,68,100,.15)] border-2 border-[#F84464] flex items-center justify-center text-3xl mb-4">
        🎟️
      </div>
      <h2 className="text-[22px] font-black text-white mb-2">Booking Confirmed!</h2>
      <p className="text-[13px] text-gray-500 mb-5">Your tickets have been sent to your email.</p>
      <div className="w-full bg-[#111] border border-dashed border-white/15 rounded-xl py-4 px-6 mb-5">
        <p className="font-mono text-[22px] font-black tracking-[.2em] text-[#F84464]">{code}</p>
      </div>
      <div className="text-[13px] text-gray-500 leading-loose">
        <p className="text-white font-bold">{theater.name}</p>
        <p>{show} · Today</p>
        <p>Seats: {selSeats.join(", ")}</p>
        <p className="text-[#F84464] font-bold mt-2">Total Paid: ₹{total}</p>
      </div>
      <button
        onClick={onReset}
        className="mt-8 w-full bg-[#F84464] hover:bg-[#e03455] text-white font-black text-[14px] py-3.5 rounded-xl transition-all shadow-[0_6px_24px_rgba(248,68,100,.35)] active:scale-95"
      >
        Book Another Show
      </button>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────
export default function BookingPage() {
  const [step,        setStep]        = useState<Step>(1);
  const [theaterId,   setTheaterId]   = useState<string | null>(null);
  const [theaters,    setTheaters]    = useState<Theater[]>([]);
  const [selShow,     setSelShow]     = useState<string | null>(null);
  const [selSeats,    setSelSeats]    = useState<string[]>([]);
  const [bookingCode, setBookingCode] = useState("");

  const theater = theaters.find(t => t.id === theaterId) ?? null;

  const pickTheater = useCallback((id: string) => {
    setTheaterId(id);
    setSelShow(null);
  }, []);

  const pickShow = useCallback((id: string, show: string) => {
    setTheaterId(id);
    setSelShow(show);
  }, []);

  const toggleSeat = useCallback((key: string) => {
    setSelSeats(prev => {
      if (prev.includes(key)) return prev.filter(s => s !== key);
      if (prev.length >= MAX_SEATS) return prev;
      return [...prev, key];
    });
  }, []);

  const confirm = useCallback(() => {
    setBookingCode(randCode());
    setStep(4);
  }, []);

  const reset = useCallback(() => {
    setStep(1);
    setTheaterId(null);
    setSelShow(null);
    setSelSeats([]);
    setBookingCode("");
  }, []);

  // TheaterScreen manages its own fetch but we need to lift theaters up
  // so PayScreen/ConfirmScreen can access the selected theater object.
  // We pass a setter down.
  const [liftedTheaters, setLiftedTheaters] = useState<Theater[]>([]);

  return (
    <div className="bg-[#080808] min-h-screen font-['DM_Sans',sans-serif] text-white max-w-[700px] mx-auto relative">
      {step !== 4 && <StepBar step={step} />}
      <MovieHeader />

      {step === 1 && (
        <TheaterScreenWithLift
          selTheaterId={theaterId}
          selShow={selShow}
          onPickTheater={pickTheater}
          onPickShow={pickShow}
          onNext={() => setStep(2)}
          onTheatersLoaded={setLiftedTheaters}
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

      {step === 3 && (() => {
        const t = liftedTheaters.find(x => x.id === theaterId);
        return t && selShow ? (
          <PayScreen
            theater={t}
            show={selShow}
            selSeats={selSeats}
            onBack={() => setStep(2)}
            onConfirm={confirm}
          />
        ) : null;
      })()}

      {step === 4 && (() => {
        const t = liftedTheaters.find(x => x.id === theaterId);
        return t && selShow ? (
          <ConfirmScreen
            theater={t}
            show={selShow}
            selSeats={selSeats}
            code={bookingCode}
            onReset={reset}
          />
        ) : null;
      })()}
    </div>
  );
}

// Wrapper to lift theater data up
function TheaterScreenWithLift({
  selTheaterId, selShow,
  onPickTheater, onPickShow, onNext, onTheatersLoaded,
}: {
  selTheaterId: string | null;
  selShow: string | null;
  onPickTheater: (id: string) => void;
  onPickShow: (id: string, show: string) => void;
  onNext: () => void;
  onTheatersLoaded: (t: Theater[]) => void;
}) {
  const [query,     setQuery]     = useState("");
  const [theaters,  setTheaters]  = useState<Theater[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [locLabel,  setLocLabel]  = useState("New Delhi");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let lat = 28.6139, lng = 77.2090;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        setLocLabel(`${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`);
      } catch {}
      const data = await fetchNearbyTheaters(lat, lng);
      setTheaters(data);
      onTheatersLoaded(data);
    } catch (e: any) {
      setError(e.message || "Failed to load theaters");
    } finally {
      setLoading(false);
    }
  }, [onTheatersLoaded]);

  useEffect(() => { load(); }, [load]);

  const list = theaters.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.vicinity.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 pb-0">
        <input
          type="text"
          placeholder="🔍  Search theaters near you…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-[#181818] border border-white/8 text-white rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[rgba(248,68,100,.5)] mb-4 transition-colors"
        />

        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black tracking-[.18em] uppercase text-gray-600 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Near {locLabel}
          </p>
          {!loading && (
            <button onClick={load} className="text-gray-600 hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#F84464] animate-spin" />
            <p className="text-[13px] text-gray-500">Finding theaters near you…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-[#F84464]" />
            <div>
              <p className="text-white font-bold text-[14px]">Could not load theaters</p>
              <p className="text-gray-500 text-[12px] mt-1">{error}</p>
              <p className="text-gray-600 text-[11px] mt-2">Replace <code className="text-[#F84464]">API_KEY</code> in the source with your Google Places API key.</p>
            </div>
            <button onClick={load} className="flex items-center gap-2 bg-[#F84464] text-white font-bold text-[13px] px-4 py-2 rounded-xl">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-3 pb-28">
            {list.length === 0 && (
              <p className="text-center text-gray-600 text-[13px] py-10">No theaters found nearby.</p>
            )}
            {list.map((t, idx) => (
              <div
                key={t.id}
                onClick={() => onPickTheater(t.id)}
                className={`bg-[#111] border rounded-xl p-4 cursor-pointer transition-all ${selTheaterId === t.id ? "border-[#F84464] bg-[rgba(248,68,100,.05)]" : "border-white/8 hover:border-[rgba(248,68,100,.35)] hover:bg-[#151515]"}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-white leading-tight">{t.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{t.dist} · {t.vicinity}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                    {t.rating > 0 && (
                      <span className="text-[11px] text-[#F84464] flex items-center gap-0.5 font-bold">
                        <Star className="w-3 h-3 fill-[#F84464]" />{t.rating}
                      </span>
                    )}
                    {t.open !== null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.open ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                        {t.open ? "Open" : "Closed"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {t.tags.map(tag => (
                    <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded ${TAG_STYLES[idx % TAG_STYLES.length]}`}>{tag}</span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {t.shows.map((show, si) => {
                    const isSel = selTheaterId === t.id && selShow === show;
                    const isEarly = si < 2;
                    return (
                      <button
                        key={show}
                        onClick={e => { e.stopPropagation(); onPickShow(t.id, show); }}
                        className={`text-[12px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          isSel
                            ? isEarly ? "bg-[#c9a227] border-[#c9a227] text-black" : "bg-[#F84464] border-[#F84464] text-white shadow-[0_4px_16px_rgba(248,68,100,.3)]"
                            : isEarly ? "border-[rgba(201,162,39,.4)] text-[#c9a227] bg-transparent hover:bg-[rgba(201,162,39,.15)]"
                                      : "border-white/10 text-gray-300 bg-[#181818] hover:border-[#F84464] hover:text-[#F84464]"
                        }`}
                      >
                        {show}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/8 px-5 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-white truncate">
            {selTheaterId
              ? theaters.find(t => t.id === selTheaterId)?.name ?? ""
              : <span className="text-gray-600">No theater selected</span>}
          </p>
          <p className={`text-[11px] mt-0.5 ${selShow ? "text-[#F84464]" : "text-gray-600"}`}>
            {selShow ? `${selShow} · Today` : "Pick a showtime"}
          </p>
        </div>
        <button
          onClick={onNext}
          disabled={!selTheaterId || !selShow}
          className="flex items-center gap-1.5 bg-[#F84464] hover:bg-[#e03455] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-[13px] px-5 py-2.5 rounded-xl transition-all shadow-[0_6px_24px_rgba(248,68,100,.35)] active:scale-95 flex-shrink-0"
        >
          Select Seats <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}