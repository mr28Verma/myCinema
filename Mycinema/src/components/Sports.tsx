import { useEffect, useState } from "react";
import { MapPin, Clock3, Trophy, Ticket, RefreshCw, Wifi, WifiOff, ChevronRight, Zap } from "lucide-react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Team = {
  name: string;
  short: string;
  score?: string;
};

type Match = {
  name: string;
  status: string;
  venue: string;
  date: string;
  score1?: string;
  score2?: string;
  teams: Team[];
};

/* ─────────────────────────────────────────────
   TEAM CONFIG
───────────────────────────────────────────── */
const TEAM_CONFIG: Record<string, { color: string; accent: string; bg: string }> = {
  MI:   { color: "#004BA0", accent: "#0070F3", bg: "rgba(0,75,160,0.12)" },
  CSK:  { color: "#F9CD05", accent: "#FFE066", bg: "rgba(249,205,5,0.10)" },
  RCB:  { color: "#EC1C24", accent: "#FF4D54", bg: "rgba(236,28,36,0.12)" },
  KKR:  { color: "#6A3D9A", accent: "#9B59D4", bg: "rgba(106,61,154,0.12)" },
  DC:   { color: "#0078BC", accent: "#29A8EF", bg: "rgba(0,120,188,0.12)" },
  PBKS: { color: "#D71920", accent: "#FF4D54", bg: "rgba(215,25,32,0.12)" },
  RR:   { color: "#254AA5", accent: "#5B7FFF", bg: "rgba(37,74,165,0.12)" },
  SRH:  { color: "#F26522", accent: "#FF8C42", bg: "rgba(242,101,34,0.12)" },
  GT:   { color: "#1C9C98", accent: "#27D4CF", bg: "rgba(28,156,152,0.12)" },
  LSG:  { color: "#A72056", accent: "#E83E8C", bg: "rgba(167,32,86,0.12)" },
};

function getTeamCfg(short = "") {
  const key = Object.keys(TEAM_CONFIG).find((k) =>
    short.toUpperCase().includes(k)
  );
  return key ? TEAM_CONFIG[key] : { color: "#F84464", accent: "#FF6B85", bg: "rgba(248,68,100,0.10)" };
}

/* ─────────────────────────────────────────────
   STATUS HELPER
───────────────────────────────────────────── */
function getStatusMeta(status = "") {
  const s = status.toLowerCase();
  if (s.includes("won") || s.includes("result") || s.includes("tied"))
    return { label: "Result", cls: "completed" };
  if (
    s.includes("toss") || s.includes("inning") || s.includes("batting") ||
    s.includes("over") || s.includes("live") || s.includes("bowling")
  )
    return { label: "Live", cls: "live" };
  return { label: "Upcoming", cls: "upcoming" };
}


/* ─────────────────────────────────────────────
   TEAM AVATAR
───────────────────────────────────────────── */
const TeamAvatar = ({ team }: { team: Team }) => {
  const cfg = getTeamCfg(team.short);
  return (
    <div className="team-avatar-wrap">
      <div
        className="team-avatar"
        style={{
          background: cfg.bg,
          border: `1.5px solid ${cfg.color}60`,
          boxShadow: `0 0 20px ${cfg.color}25`,
        }}
      >
        <span style={{ color: cfg.accent }}>{(team.short || team.name || "??").substring(0, 3).toUpperCase()}</span>
      </div>
      <p className="team-short">{team.short || team.name}</p>
      {team.score && <p className="team-score">{team.score}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────────
   MATCH CARD
───────────────────────────────────────────── */
const MatchCard = ({ match, index }: { match: Match; index: number }) => {
  const { label, cls } = getStatusMeta(match.status);
  const t1 = match.teams?.[0] || { name: "TBD", short: "TBD" };
  const t2 = match.teams?.[1] || { name: "TBD", short: "TBD" };

  // Inject scores from top-level into teams if present
  if (match.score1) t1.score = match.score1;
  if (match.score2) t2.score = match.score2;

  const dateStr = match.date
    ? new Date(match.date).toLocaleString("en-IN", {
        weekday: "short", day: "numeric", month: "short",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  return (
    <div className="match-card" style={{ animationDelay: `${index * 80}ms` }}>
      {/* Card header strip */}
      <div className="card-header">
        <div className="card-header-left">
          <span className={`status-pill status-${cls}`}>
            {cls === "live" && <span className="live-dot" />}
            {label}
          </span>
          <span className="series-label">IPL 2026</span>
        </div>
        <Zap size={14} className="card-zap" />
      </div>

      {/* Teams */}
      <div className="teams-section">
        <TeamAvatar team={t1} />
        <div className="vs-block">
          <span className="vs-text">VS</span>
          {cls === "live" && <span className="live-pulse-ring" />}
        </div>
        <TeamAvatar team={t2} />
      </div>

      {/* Match info */}
      <div className="card-body">
        <p className="match-name">{match.name}</p>
        <p className={`match-status-text status-text-${cls}`}>{match.status}</p>

        <div className="meta-rows">
          {match.venue && (
            <div className="meta-row">
              <MapPin size={12} className="meta-icon" />
              <span>{match.venue}</span>
            </div>
          )}
          {dateStr && (
            <div className="meta-row">
              <Clock3 size={12} className="meta-icon" />
              <span>{dateStr}</span>
            </div>
          )}
          <div className="meta-row">
            <Trophy size={12} className="meta-icon" />
            <span>Indian Premier League</span>
          </div>
        </div>

        <div className="card-actions">
          <button className="btn-view">
            View Match <ChevronRight size={14} />
          </button>
          <a
            href="https://in.bookmyshow.com/explore/sports"
            target="_blank"
            rel="noreferrer"
            className="btn-tickets"
          >
            <Ticket size={13} />
            Tickets
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STANDINGS STRIP (static, decorative)
───────────────────────────────────────────── */
const standingsTeams = ["MI", "CSK", "RCB", "KKR", "DC", "SRH", "RR", "GT", "PBKS", "LSG"];

const StandingsPill = ({ short, rank }: { short: string; rank: number }) => {
  const cfg = getTeamCfg(short);
  return (
    <div className="standings-pill" style={{ borderColor: `${cfg.color}40` }}>
      <span className="standings-rank" style={{ color: cfg.accent }}>#{rank}</span>
      <span className="standings-short">{short}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export const Sports = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchIPLMatches();
      setMatches(data);
      setLastUpdated(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sports-root {
          min-height: 100vh;
          background: #060608;
          color: #e8e8e8;
          font-family: 'DM Sans', sans-serif;
          padding: 2rem 1.5rem 4rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── TICKER ── */
        .ticker-wrap {
          overflow: hidden;
          border-bottom: 1px solid #ffffff0d;
          margin-bottom: 2.5rem;
          padding-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .ticker-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #F84464;
          text-transform: uppercase;
          white-space: nowrap;
          padding: 3px 10px;
          border: 1px solid #F8446440;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .ticker-scroll {
          display: flex;
          gap: 2rem;
          animation: ticker 25s linear infinite;
          white-space: nowrap;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-item {
          font-size: 12px;
          color: #666;
          letter-spacing: 0.04em;
        }
        .ticker-item span { color: #aaa; }

        /* ── HERO ── */
        .hero {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid #ffffff0d;
          background: #0c0c0e;
          padding: 3rem 2.5rem;
          margin-bottom: 1.5rem;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 80% 50%, #F8446415 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 10% 80%, #0070F315 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, #ffffff04 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff04 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .hero-inner { position: relative; z-index: 1; }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1.25rem;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #F84464;
        }
        .live-dot {
          width: 7px; height: 7px;
          background: #F84464;
          border-radius: 50%;
          animation: blink 1.2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.5rem, 9vw, 7rem);
          letter-spacing: 0.03em;
          line-height: 1;
          color: #fff;
        }
        .hero-title .accent { color: #F84464; }
        .hero-title .sub {
          display: block;
          font-size: clamp(1.4rem, 3.5vw, 2.8rem);
          color: #ffffff30;
          letter-spacing: 0.15em;
        }
        .hero-desc {
          margin-top: 1.25rem;
          font-size: 15px;
          color: #666;
          max-width: 480px;
          line-height: 1.7;
        }
        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 2rem;
        }
        .btn-hero-primary {
          background: #F84464;
          color: #fff;
          border: none;
          padding: 14px 28px;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.02em;
          box-shadow: 0 8px 32px #F8446435;
          transition: all 0.2s;
        }
        .btn-hero-primary:hover {
          background: #ff5b78;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px #F8446450;
        }
        .btn-hero-secondary {
          background: transparent;
          color: #aaa;
          border: 1px solid #ffffff15;
          padding: 14px 28px;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-hero-secondary:hover {
          border-color: #F8446440;
          color: #F84464;
          background: #F8446408;
        }
        /* Stats strip inside hero */
        .hero-stats {
          display: flex;
          gap: 2rem;
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid #ffffff08;
        }
        .hero-stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          color: #fff;
          letter-spacing: 0.04em;
        }
        .hero-stat-label {
          font-size: 11px;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 2px;
        }

        /* ── STANDINGS STRIP ── */
        .standings-strip {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }
        .standings-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid;
          background: #0c0c0e;
          font-size: 12px;
          cursor: default;
          transition: background 0.15s;
        }
        .standings-pill:hover { background: #141416; }
        .standings-rank { font-weight: 700; font-size: 11px; }
        .standings-short { color: #777; font-weight: 500; }

        /* ── SECTION HEADER ── */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .section-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          letter-spacing: 0.05em;
          color: #fff;
        }
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #555;
          background: transparent;
          border: 1px solid #ffffff0d;
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .refresh-btn:hover { color: #F84464; border-color: #F8446440; }
        .refresh-btn .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .last-updated { font-size: 11px; color: #333; }

        /* ── GRID ── */
        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        /* ── MATCH CARD ── */
        .match-card {
          background: #0c0c0e;
          border: 1px solid #ffffff0d;
          border-radius: 20px;
          overflow: hidden;
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .match-card:hover {
          transform: translateY(-4px);
          border-color: #F8446430;
          box-shadow: 0 16px 48px #F8446415;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px 10px;
          border-bottom: 1px solid #ffffff07;
        }
        .card-header-left { display: flex; align-items: center; gap: 10px; }
        .series-label { font-size: 11px; color: #333; letter-spacing: 0.06em; }
        .card-zap { color: #F84464; opacity: 0.5; }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .status-live    { background: #F8446418; color: #F84464; border: 1px solid #F8446435; }
        .status-completed { background: #63992218; color: #7CB52A; border: 1px solid #63992235; }
        .status-upcoming  { background: #378ADD18; color: #378ADD; border: 1px solid #378ADD35; }

        /* Teams */
        .teams-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem 1rem;
          gap: 8px;
        }
        .team-avatar-wrap {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          flex: 1;
        }
        .team-avatar {
          width: 56px; height: 56px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px;
          letter-spacing: 0.04em;
          transition: transform 0.2s;
        }
        .match-card:hover .team-avatar { transform: scale(1.05); }
        .team-short {
          font-size: 13px;
          font-weight: 600;
          color: #ccc;
          text-align: center;
        }
        .team-score {
          font-size: 11px;
          color: #555;
          text-align: center;
          font-weight: 500;
        }

        .vs-block {
          display: flex; flex-direction: column; align-items: center;
          position: relative;
        }
        .vs-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.3rem;
          color: #2a2a2e;
          letter-spacing: 0.1em;
        }
        .live-pulse-ring {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 1px solid #F8446430;
          animation: pulse-ring 1.5s ease-out infinite;
        }
        @keyframes pulse-ring {
          0% { transform: translate(-50%,-50%) scale(0.6); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1.6); opacity: 0; }
        }

        /* Card body */
        .card-body { padding: 0 1.25rem 1.25rem; }
        .match-name {
          font-size: 13px;
          font-weight: 500;
          color: #888;
          margin-bottom: 5px;
          line-height: 1.4;
        }
        .match-status-text {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        .status-text-live      { color: #F84464; }
        .status-text-completed { color: #7CB52A; }
        .status-text-upcoming  { color: #378ADD; }

        .meta-rows { display: flex; flex-direction: column; gap: 6px; margin-bottom: 1.25rem; }
        .meta-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #444;
        }
        .meta-icon { color: #F84464; opacity: 0.7; flex-shrink: 0; }

        .card-actions { display: flex; gap: 8px; }
        .btn-view {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 4px;
          background: #F84464;
          color: #fff;
          border: none;
          padding: 11px 16px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px #F8446425;
        }
        .btn-view:hover {
          background: #ff5b78;
          box-shadow: 0 6px 28px #F8446445;
        }
        .btn-tickets {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 11px 16px;
          border-radius: 12px;
          border: 1px solid #F8446430;
          color: #F84464;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-tickets:hover {
          background: #F8446410;
          border-color: #F84464;
        }

        /* ── LOADING ── */
        .loading-wrap {
          display: flex; flex-direction: column; align-items: center;
          padding: 5rem 2rem;
          gap: 1.5rem;
        }
        .loader-ring {
          width: 48px; height: 48px;
          border: 2px solid #1a1a1e;
          border-top-color: #F84464;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        .loading-text { font-size: 14px; color: #444; }

        /* ── ERROR ── */
        .error-wrap {
          display: flex; flex-direction: column; align-items: center;
          padding: 4rem 2rem;
          gap: 1rem;
          border: 1px dashed #ffffff0d;
          border-radius: 16px;
        }
        .error-icon { color: #F84464; opacity: 0.5; }
        .error-title { font-size: 16px; font-weight: 600; color: #888; }
        .error-sub { font-size: 13px; color: #444; }
        .btn-retry {
          margin-top: 0.5rem;
          display: flex; align-items: center; gap: 8px;
          background: transparent;
          color: #F84464;
          border: 1px solid #F8446440;
          padding: 10px 22px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-retry:hover { background: #F8446412; }

        /* ── FOOTER ── */
        .footer {
          margin-top: 4rem;
          padding-top: 1.5rem;
          border-top: 1px solid #ffffff06;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .footer-brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.25rem;
          letter-spacing: 0.08em;
          color: #222;
        }
        .footer-brand span { color: #F84464; }
        .footer-note { font-size: 11px; color: #2a2a2e; }
        .connection-status {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #333;
        }
      `}</style>

      <div className="sports-root">

        {/* ── TICKER ── */}
        <div className="ticker-wrap">
          <span className="ticker-label">⚡ Live</span>
          <div className="ticker-scroll">
            {[
              "MI vs CSK • 7:30 PM IST",
              "RCB vs KKR • Tomorrow 3:30 PM",
              "DC vs SRH • Results Tonight",
              "RR vs PBKS • Saturday 7:30 PM",
              "GT vs LSG • Sunday 3:30 PM",
              "MI vs CSK • 7:30 PM IST",
              "RCB vs KKR • Tomorrow 3:30 PM",
              "DC vs SRH • Results Tonight",
              "RR vs PBKS • Saturday 7:30 PM",
              "GT vs LSG • Sunday 3:30 PM",
            ].map((t, i) => (
              <span key={i} className="ticker-item">
                <span>{t}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-grid-lines" />
          <div className="hero-inner">
            <div className="hero-eyebrow">
              <span className="live-dot" />
              Season 19 · Now Live
            </div>
            <h1 className="hero-title">
              TATA IPL
              <span className="accent"> 2026</span>
              <span className="sub">Indian Premier League</span>
            </h1>
            <p className="hero-desc">
              Real-time scores, match schedules, venue info, and ticket booking
              for every IPL 2026 clash — powered by live AI search.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary">Explore Matches</button>
              <button className="btn-hero-secondary">IPL Points Table</button>
            </div>
            <div className="hero-stats">
              {[
                { num: "74", label: "Matches" },
                { num: "10", label: "Teams" },
                { num: "13", label: "Venues" },
                { num: "₹2CR+", label: "Prize Pool" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="hero-stat-num">{s.num}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STANDINGS STRIP ── */}
        <div className="standings-strip">
          {standingsTeams.map((t, i) => (
            <StandingsPill key={t} short={t} rank={i + 1} />
          ))}
        </div>

        {/* ── SECTION HEADER ── */}
        <div className="section-header">
          <div className="section-title-row">
            <span className="live-dot" style={{ width: 10, height: 10 }} />
            <h2 className="section-title">Live &amp; Upcoming</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <button
              className="refresh-btn"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw size={12} className={loading ? "spinning" : ""} />
              {loading ? "Fetching…" : "Refresh"}
            </button>
            {lastUpdated && (
              <span className="last-updated">
                Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="loading-wrap">
            <div className="loader-ring" />
            <p className="loading-text">Fetching live IPL match data…</p>
          </div>
        ) : error ? (
          <div className="error-wrap">
            <WifiOff size={32} className="error-icon" />
            <p className="error-title">Couldn't load match data</p>
            <p className="error-sub">Check your connection or try again.</p>
            <button className="btn-retry" onClick={load}>
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : matches.length === 0 ? (
          <div className="error-wrap">
            <Trophy size={32} className="error-icon" />
            <p className="error-title">No matches found</p>
            <p className="error-sub">No IPL matches are scheduled right now.</p>
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map((match, i) => (
              <MatchCard key={i} match={match} index={i} />
            ))}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="footer">
          <div className="footer-brand">
            TATA IPL <span>2026</span>
          </div>
          <div className="connection-status">
            <Wifi size={12} />
            AI-powered live data
          </div>
          <p className="footer-note">
            Data sourced via Anthropic web search · Not affiliated with BCCI
          </p>
        </div>

      </div>
    </>
  );
};