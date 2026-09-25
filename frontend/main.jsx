import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity as IconActivity,
  ArrowRight as IconArrowRight,
  ArrowUp as IconArrowUp,
  ArrowUpLeft as IconArrowUpLeft,
  ArrowUpRight as IconArrowUpRight,
  Award as IconAward,
  Bell as IconBell,
  BookOpen as IconBookOpen,
  Brain as IconBrain,
  BriefcaseBusiness as IconBriefcaseBusiness,
  CalendarCheck as IconCalendarCheck,
  CalendarDays as IconCalendarDays,
  ChartColumnIncreasing as IconChartColumnIncreasing,
  ChartNoAxesCombined as IconChartNoAxesCombined,
  Check as IconCheck,
  ChevronsUpDown as IconChevronsUpDown,
  CircleCheck as IconCircleCheck,
  Clock3 as IconClock3,
  Code2 as IconCode2,
  Compass as IconCompass,
  Crosshair as IconCrosshair,
  Database as IconDatabase,
  Download as IconDownload,
  Flag as IconFlag,
  Flame as IconFlame,
  Focus as IconFocus,
  Footprints as IconFootprints,
  History as IconHistory,
  Info as IconInfo,
  Languages as IconLanguages,
  Layers as IconLayers,
  LayoutDashboard as IconLayoutDashboard,
  LockKeyhole as IconLockKeyhole,
  Menu as IconMenu,
  MessagesSquare as IconMessagesSquare,
  Mountain as IconMountain,
  MoveUpRight as IconMoveUpRight,
  Palette as IconPalette,
  PanelsTopLeft as IconPanelsTopLeft,
  Pencil as IconPencil,
  Piano as IconPiano,
  Plus as IconPlus,
  Search as IconSearch,
  Settings as IconSettings,
  Settings2 as IconSettings2,
  ShieldCheck as IconShieldCheck,
  SlidersHorizontal as IconSlidersHorizontal,
  Sparkles as IconSparkles,
  Sprout as IconSprout,
  Sun as IconSun,
  Target as IconTarget,
  Trash2 as IconTrash2,
  TrendingUp as IconTrendingUp,
  Wallet as IconWallet,
  WandSparkles as IconWandSparkles,
  Zap as IconZap,
} from "lucide-react";
const Icons = {
  Activity: IconActivity,
  ArrowRight: IconArrowRight,
  ArrowUp: IconArrowUp,
  ArrowUpLeft: IconArrowUpLeft,
  ArrowUpRight: IconArrowUpRight,
  Award: IconAward,
  Bell: IconBell,
  BookOpen: IconBookOpen,
  Brain: IconBrain,
  BriefcaseBusiness: IconBriefcaseBusiness,
  CalendarCheck: IconCalendarCheck,
  CalendarDays: IconCalendarDays,
  ChartColumnIncreasing: IconChartColumnIncreasing,
  ChartNoAxesCombined: IconChartNoAxesCombined,
  Check: IconCheck,
  ChevronsUpDown: IconChevronsUpDown,
  CircleCheck: IconCircleCheck,
  Clock3: IconClock3,
  Code2: IconCode2,
  Compass: IconCompass,
  Crosshair: IconCrosshair,
  Database: IconDatabase,
  Download: IconDownload,
  Flag: IconFlag,
  Flame: IconFlame,
  Focus: IconFocus,
  Footprints: IconFootprints,
  History: IconHistory,
  Info: IconInfo,
  Languages: IconLanguages,
  Layers: IconLayers,
  LayoutDashboard: IconLayoutDashboard,
  LockKeyhole: IconLockKeyhole,
  Menu: IconMenu,
  MessagesSquare: IconMessagesSquare,
  Mountain: IconMountain,
  MoveUpRight: IconMoveUpRight,
  Palette: IconPalette,
  PanelsTopLeft: IconPanelsTopLeft,
  Pencil: IconPencil,
  Piano: IconPiano,
  Plus: IconPlus,
  Search: IconSearch,
  Settings: IconSettings,
  Settings2: IconSettings2,
  ShieldCheck: IconShieldCheck,
  SlidersHorizontal: IconSlidersHorizontal,
  Sparkles: IconSparkles,
  Sprout: IconSprout,
  Sun: IconSun,
  Target: IconTarget,
  Trash2: IconTrash2,
  TrendingUp: IconTrendingUp,
  Wallet: IconWallet,
  WandSparkles: IconWandSparkles,
  Zap: IconZap,
};
import "./styles.css";
const I = ({ name, size = 20, ...props }) => {
  const C = Icons[name] || Icons.Sparkles;
  return <C size={size} strokeWidth={1.7} {...props} />;
};
const day = () => new Date().toISOString().slice(0, 10);
const fmt = (n) => Number(n || 0).toLocaleString("en-US");
const dateLabel = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const nav = [
  ["Dashboard", "LayoutDashboard"],
  ["Quests", "CircleCheck"],
  ["Skills", "Layers"],
  ["Stats", "ChartNoAxesCombined"],
  ["Goals", "Flag"],
  ["Analytics", "ChartColumnIncreasing"],
  ["Timeline", "History"],
  ["Achievements", "Award"],
];
const api = async (path, method = "GET", body) => {
  const r = await fetch(`/api${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await r.json();
  if (!r.ok)
    throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
};
function Bar({ percent, color, className = "" }) {
  return (
    <div className={`progress-track ${className}`}>
      <span
        style={{
          width: `${Math.min(100, Math.max(0, percent || 0))}%`,
          background: color,
        }}
      />
    </div>
  );
}
function Button({ children, icon, variant = "", className = "", ...props }) {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {icon && <I name={icon} size={16} />}
      <span>{children}</span>
    </button>
  );
}
function SectionTitle({ title, subtitle, action, onClick }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && (
        <button className="text-link" onClick={onClick}>
          {action}
          <I name="ArrowUpRight" size={15} />
        </button>
      )}
    </div>
  );
}
function Empty({
  icon = "Sprout",
  title = "Your next chapter starts here",
  text = "Add something you want to work on.",
  action,
  onClick,
}) {
  return (
    <div className="empty">
      <I name={icon} size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <Button icon="Plus" onClick={onClick}>
          {action}
        </Button>
      )}
    </div>
  );
}
function App() {
  const [data, setData] = useState(null),
    [page, setPage] = useState(
      decodeURIComponent(location.hash.slice(1)) || "Dashboard",
    ),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(null),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false),
    [error, setError] = useState("");
  const timer = useRef();
  useEffect(() => {
    document.documentElement.classList.toggle(
      "reduce-motion",
      !!data?.profile.preferences.reducedMotion,
    );
  }, [data?.profile.preferences.reducedMotion]);
  const notify = (message, rewards) => {
    setToast({ message, rewards });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 5500);
  };
  useEffect(() => {
    api("/state")
      .then(setData)
      .catch((e) => setError(e.message));
    const listener = () =>
      setPage(decodeURIComponent(location.hash.slice(1)) || "Dashboard");
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  const go = (p) => {
    setPage(p);
    location.hash = p;
    setMobile(false);
    window.scrollTo(0, 0);
  };
  async function mutate(path, method = "POST", body, message) {
    if (busy) return;
    setBusy(true);
    try {
      const r = await api(path, method, body);
      setData(r.state || r);
      if (message) notify(message, r.rewards);
      return r;
    } catch (e) {
      notify(e.message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  const complete = (id) =>
    mutate(
      `/quests/${id}/complete`,
      "POST",
      {},
      "A little progress. A better you.",
    );
  if (!data)
    return (
      <div className="loading">
        <div className="brand-symbol">
          <I name="Mountain" size={30} />
        </div>
        <h2>
          ASCEND<span>®</span>
        </h2>
        <p>{error || "Making room for your next chapter…"}</p>
        {error && <Button onClick={() => location.reload()}>Try again</Button>}
      </div>
    );
  const p = data.profile,
    todayQuests = data.quests.filter(
      (q) => q.due_date === day() && q.type === "Daily",
    ),
    done = todayQuests.filter((q) => q.completed_at).length;
  const props = { data, go, setModal, mutate, complete, busy, notify };
  const allPages = [
    ...nav.map((n) => n[0]),
    "AI Assistant",
    "Profile",
    "Settings",
  ];
  return (
    <div className="app-shell">
      {mobile && (
        <div className="sidebar-scrim" onClick={() => setMobile(false)} />
      )}
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <a className="brand" href="#Dashboard" onClick={() => go("Dashboard")}>
          <span className="brand-symbol">
            <I name="Mountain" size={23} />
          </span>
          ascend<span className="brand-dot">®</span>
        </a>
        <div className="workspace-label">PERSONAL WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.map(([name, icon]) => (
            <button
              key={name}
              aria-label={name}
              className={`nav-item ${page === name ? "active" : ""}`}
              onClick={() => go(name)}
            >
              <I name={icon} size={18} />
              <span>{name}</span>
              {name === "Quests" && (
                <span className="nav-count">
                  {data.quests.filter((q) => !q.completed_at).length}
                </span>
              )}
              {name === "Dashboard" && page === name && (
                <span className="active-dot" />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <button
          className={`nav-item ai-nav ${page === "AI Assistant" ? "active" : ""}`}
          onClick={() => go("AI Assistant")}
        >
          <I name="Sparkles" size={18} />
          <span>AI Assistant</span>
          <span className="new-badge">NEW</span>
        </button>
        <div className="sidebar-bottom">
          <div className="sidebar-level">
            <div>
              <span className="tiny-label">YOUR EVOLUTION</span>
              <I name="TrendingUp" size={16} />
            </div>
            <div className="level-label">
              Level {p.level}
              <span>Keep becoming.</span>
            </div>
            <Bar percent={p.percent} />
            <small>
              {fmt(p.xp)} <span>/ {fmt(p.needed)} XP</span>
            </small>
          </div>
          <button
            className={`nav-item ${page === "Settings" ? "active" : ""}`}
            onClick={() => go("Settings")}
          >
            <I name="Settings2" size={18} />
            <span>Settings</span>
          </button>
          <button className="profile-button" onClick={() => go("Profile")}>
            <div className="avatar">
              {p.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <strong>{p.name}</strong>
              <span>
                {data.account
                  ? "Personal account"
                  : p.onboarded
                    ? "Local workspace"
                    : "Demo workspace"}
              </span>
            </div>
            <I name="ChevronsUpDown" size={15} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <I name="Menu" />
            </button>
            <I name="PanelsTopLeft" size={17} />
            <span>Workspace</span>
            <span className="slash">/</span>
            <strong>{allPages.includes(page) ? page : "Dashboard"}</strong>
          </div>
          <div className="topbar-right">
            {!data.account && (
              <button
                className="header-signin"
                onClick={() => setModal({ type: "auth" })}
              >
                Sign in <I name="ArrowRight" size={13} />
              </button>
            )}
            <span className="system-status">
              <span />
              System online
            </span>
            <div className="topbar-divider" />
            <button
              className="icon-button"
              title="Activity timeline"
              aria-label="View recent activity"
              onClick={() => go("Timeline")}
            >
              <I name="Bell" size={18} />
              <i />
            </button>
            <button
              className="avatar small"
              onClick={() => go("Profile")}
              aria-label="Open profile"
            >
              {p.name[0]}
            </button>
          </div>
        </header>
        <main key={page}>
          {page === "Dashboard" ? (
            <Dashboard {...props} todayQuests={todayQuests} done={done} />
          ) : page === "Quests" ? (
            <Quests {...props} />
          ) : page === "Skills" || page === "Stats" ? (
            <Entities {...props} kind={page} />
          ) : page === "Goals" ? (
            <Goals {...props} />
          ) : page === "Analytics" ? (
            <Analytics {...props} />
          ) : page === "Timeline" ? (
            <Timeline {...props} />
          ) : page === "Achievements" ? (
            <Achievements {...props} />
          ) : page === "AI Assistant" ? (
            <Chat {...props} />
          ) : page === "Profile" ? (
            <Profile {...props} />
          ) : page === "Settings" ? (
            <Settings {...props} />
          ) : (
            <Dashboard {...props} todayQuests={todayQuests} done={done} />
          )}
          <footer>
            <span>
              <span className="footer-mark">↗</span> Small steps. Real growth.
            </span>
            <span>Made for the person you’re becoming.</span>
          </footer>
        </main>
      </div>
      {modal && (
        <ModalHost modal={modal} close={() => setModal(null)} {...props} />
      )}
      {toast && (
        <div
          className={`toast ${toast.rewards ? "reward-toast" : ""}`}
          role="status"
        >
          <span className="toast-icon">
            <I name={toast.rewards ? "Check" : "Info"} size={20} />
          </span>
          <div>
            <strong>{toast.message}</strong>
            {toast.rewards && (
              <div className="reward-list">
                {toast.rewards.map((r, i) => (
                  <span key={i}>
                    {r.name} <b>+{r.xp} XP</b>
                    {r.levelUp && <em>Level {r.level} ↗</em>}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            className="icon-button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            <I name="X" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">
          {eyebrow || "YOUR PERSONAL GROWTH SYSTEM"}
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
function Dashboard({
  data,
  go,
  setModal,
  mutate,
  complete,
  busy,
  todayQuests,
  done,
}) {
  const { profile: p, daily, streak } = data;
  const td = daily.find((d) => d.date === day()) || { minutes: 0, xp: 0 };
  const [recHidden, setRecHidden] = useState(false);
  return (
    <>
      <div className="dashboard-date">
        <span>
          <I name="CalendarDays" size={14} />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        {!p.onboarded && (
          <button onClick={() => setModal({ type: "onboarding" })}>
            Demo workspace{" "}
            <span>
              Make it yours <I name="ArrowRight" size={12} />
            </span>
          </button>
        )}
      </div>
      <PageHeading
        title={
          <>
            Keep becoming, {p.name.split(" ")[0]}
            <span className="heading-dot">.</span>
          </>
        }
        description="Every small action is a step toward who you want to be."
        action={
          <Button
            icon="Plus"
            variant="primary"
            onClick={() => setModal({ type: "log" })}
          >
            Log progress
          </Button>
        }
      />
      <div className="overview-grid">
        <section className="panel level-card">
          <div className="level-card-content">
            <div className="tiny-label">
              <span className="live-dot" /> YOUR OVERALL LEVEL
            </div>
            <div className="big-level">
              {p.level}
              <span>Always a work in progress.</span>
            </div>
            <div className="xp-line">
              <strong>
                {fmt(p.xp)} <span>/ {fmt(p.needed)} XP</span>
              </strong>
              <span>
                {p.needed - p.xp} XP to level {p.level + 1}
              </span>
            </div>
            <Bar percent={p.percent} />
            <div className="level-foot">
              <I name="TrendingUp" size={13} />
              <span>
                +{fmt(daily.slice(-7).reduce((a, d) => a + d.xp, 0))} XP this
                week
              </span>
              <span className="muted">Your effort is adding up.</span>
            </div>
          </div>
          <div className="orbital" aria-hidden="true">
            <div className="orbit o1" />
            <div className="orbit o2" />
            <div className="orbit o3" />
            <div className="orbital-core">
              <I name="MoveUpRight" size={44} strokeWidth={1} />
            </div>
            <span className="orbit-point p1" />
            <span className="orbit-point p2" />
            <span className="orbit-point p3" />
          </div>
        </section>
        <section className="panel metric-card">
          <div className="metric-top">
            <span className="metric-icon orange">
              <I name="Flame" size={18} />
            </span>
            <span className="tiny-label">CONSISTENCY</span>
            <I name="Info" size={13} />
          </div>
          <div className="metric-value">
            {streak}
            <span>day streak</span>
          </div>
          <p>You’re building something good.</p>
          <div className="streak-days">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setUTCDate(d.getUTCDate() - 6 + i);
              const date = d.toISOString().slice(0, 10);
              const active = daily.some((x) => x.date === date);
              return (
                <div key={i}>
                  <span className={active ? "checked" : ""}>
                    {active ? (
                      <I name="Check" size={12} />
                    ) : (
                      <span className="day-dot" />
                    )}
                  </span>
                  <small>
                    {d.toLocaleDateString("en-US", { weekday: "narrow" })}
                  </small>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel metric-card today-card">
          <div className="metric-top">
            <span className="metric-icon lavender">
              <I name="ChartNoAxesCombined" size={18} />
            </span>
            <span className="tiny-label">TODAY’S PROGRESS</span>
          </div>
          <div className="metric-value">
            {done}
            <span>/ {todayQuests.length} quests</span>
            <div
              className="mini-ring"
              style={{
                "--value": `${todayQuests.length ? (done / todayQuests.length) * 100 : 0}%`,
              }}
            >
              <I name="Check" size={17} />
            </div>
          </div>
          <p>A little closer than yesterday.</p>
          <div className="today-bottom">
            <span>
              <I name="Zap" size={14} />
              <b>{td.xp}</b> XP earned
            </span>
            <span>
              <I name="Clock3" size={14} />
              <b>{td.minutes}</b> min
            </span>
          </div>
        </section>
      </div>
      <div className="dashboard-columns">
        <div className="dashboard-primary">
          <section className="panel quest-panel">
            <SectionTitle
              title="Today’s quests"
              subtitle="Give your day a little direction."
              action="View all"
              onClick={() => go("Quests")}
            />
            <div className="quest-tabs">
              <span className="selected">
                Today <b>{todayQuests.length}</b>
              </span>
              <button onClick={() => go("Quests")}>Upcoming</button>
              <span className="quest-summary">
                {done} of {todayQuests.length} completed
              </span>
            </div>
            {todayQuests.length ? (
              todayQuests.map((q) => (
                <QuestRow
                  key={q.id}
                  q={q}
                  data={data}
                  complete={complete}
                  busy={busy}
                />
              ))
            ) : (
              <Empty
                title="A fresh start"
                text="Choose one small thing to move forward."
                action="Add a quest"
                onClick={() =>
                  setModal({ type: "quest", quest: { type: "Daily" } })
                }
              />
            )}
            <button
              className="add-quest-inline"
              onClick={() =>
                setModal({ type: "quest", quest: { type: "Daily" } })
              }
            >
              <I name="Plus" size={16} />
              Add a new quest<span>Make it meaningful.</span>
            </button>
          </section>
          <section className="panel stats-panel">
            <SectionTitle
              title="A more balanced you"
              subtitle="Your life is more than a single skill."
              action="All stats"
              onClick={() => go("Stats")}
            />
            <div className="stats-mini-grid">
              {data.stats.slice(0, 6).map((s) => (
                <button
                  className="stat-mini"
                  key={s.id}
                  onClick={() =>
                    setModal({ type: "entityDetail", kind: "Stats", entity: s })
                  }
                >
                  <div className="stat-mini-head">
                    <I name={s.icon} size={17} style={{ color: s.color }} />
                    <span>{s.name}</span>
                    <small>Lv. {s.level}</small>
                  </div>
                  <Bar percent={s.percent} color={s.color} />
                </button>
              ))}
            </div>
          </section>
          <section className="panel activity-panel">
            <SectionTitle
              title="Your week in motion"
              subtitle="Progress isn’t always linear. Showing up matters."
              action="Analytics"
              onClick={() => go("Analytics")}
            />
            <ActivityChart daily={daily} />
          </section>
        </div>
        <div className="dashboard-secondary">
          <section className="panel recommendation">
            <div className="recommendation-top">
              <span className="ai-symbol">
                <I name="Sparkles" size={18} />
              </span>
              <span>YOUR PERSONAL CO-PILOT</span>
              <span className="live-dot" />
            </div>
            <h2>
              A small nudge.
              <br />A meaningful step.
            </h2>
            {!recHidden && data.recommendation ? (
              <>
                <p>{data.recommendation.description}</p>
                <div className="suggested-quest">
                  <span className="eyebrow">SUGGESTED FOR YOU</span>
                  <h3>{data.recommendation.quest.title}</h3>
                  <div>
                    <span>
                      <I name="Clock3" size={13} />
                      {data.recommendation.quest.minutes} min
                    </span>
                    <span className="xp-reward">
                      +{data.recommendation.quest.xp} XP
                    </span>
                  </div>
                </div>
                <div className="rec-actions">
                  <Button
                    icon="Plus"
                    onClick={async () => {
                      const r = await mutate(
                        "/recommendations/accept",
                        "POST",
                        data.recommendation,
                        "Added to your quests",
                      );
                      if (r) setRecHidden(true);
                    }}
                    disabled={busy}
                  >
                    Accept quest
                  </Button>
                  <button
                    className="icon-button"
                    aria-label="Modify recommendation"
                    onClick={() =>
                      setModal({
                        type: "quest",
                        quest: data.recommendation.quest,
                      })
                    }
                  >
                    <I name="SlidersHorizontal" size={16} />
                  </button>
                  <button
                    className="text-muted"
                    onClick={async () => {
                      const r = await mutate(
                        "/recommendations/skip",
                        "POST",
                        data.recommendation,
                      );
                      if (r) setRecHidden(true);
                    }}
                  >
                    Skip
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  You set the pace. Ask your assistant to help choose your next
                  step.
                </p>
                <Button icon="ArrowUpRight" onClick={() => go("AI Assistant")}>
                  Open assistant
                </Button>
              </>
            )}
            <div className="ai-disclaimer">
              <I name="Sparkles" size={11} />{" "}
              {data.aiMode === "local"
                ? "Personalized local guidance"
                : "AI connected"}{" "}
              · You’re always in control
            </div>
          </section>
          <section className="panel skills-panel">
            <SectionTitle
              title="Skills in the making"
              action="View all"
              onClick={() => go("Skills")}
            />
            {data.skills.slice(0, 3).map((s) => (
              <button
                key={s.id}
                className="skill-mini"
                onClick={() =>
                  setModal({ type: "entityDetail", kind: "Skills", entity: s })
                }
              >
                <span
                  className="skill-icon"
                  style={{ color: s.color, background: `${s.color}12` }}
                >
                  <I name={s.icon} size={19} />
                </span>
                <span className="skill-mini-body">
                  <span>
                    <strong>{s.name}</strong>
                    <small>Lv. {s.level}</small>
                  </span>
                  <Bar percent={s.percent} color={s.color} />
                </span>
                <span className="skill-percent">{s.percent}%</span>
              </button>
            ))}
          </section>
          <section className="panel next-goal">
            <SectionTitle
              title="The bigger picture"
              action="Goals"
              onClick={() => go("Goals")}
            />
            {data.goals.slice(0, 1).map((g) => {
              const completed = g.milestones.filter((m) => m.completed).length;
              return (
                <div key={g.id}>
                  <span className="goal-category">
                    <I name="Flag" size={13} />
                    {g.category}
                  </span>
                  <h3>{g.title}</h3>
                  <Bar
                    percent={
                      (completed / Math.max(1, g.milestones.length)) * 100
                    }
                  />
                  <div className="goal-meta">
                    <span>
                      {completed} of {g.milestones.length} milestones
                    </span>
                    <strong>
                      {Math.round(
                        (completed / Math.max(1, g.milestones.length)) * 100,
                      )}
                      %
                    </strong>
                  </div>
                </div>
              );
            })}
            {!data.goals.length && (
              <button
                className="text-link"
                onClick={() => setModal({ type: "goal" })}
              >
                Set your first goal
                <I name="Plus" size={14} />
              </button>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
function QuestRow({ q, data, complete, busy, manage = false, setModal }) {
  const sk = data.skills.find((s) => s.id === q.skill_id);
  return (
    <div className={`quest-row ${q.completed_at ? "completed" : ""}`}>
      <button
        className="quest-check"
        disabled={busy || !!q.completed_at}
        aria-label={`Complete ${q.title}`}
        onClick={() => complete(q.id)}
      >
        {q.completed_at && <I name="Check" size={13} />}
      </button>
      <div className="quest-info">
        <h3>{q.title}</h3>
        <div className="quest-meta">
          {sk && (
            <span className="skill-tag" style={{ color: sk.color }}>
              <I name={sk.icon} size={11} />
              {sk.name}
            </span>
          )}
          <span>
            <I name="Clock3" size={11} />
            {q.minutes} min
          </span>
          <span className="difficulty">
            <i className={q.difficulty.toLowerCase()} />
            {q.difficulty}
          </span>
          {manage && <span>{dateLabel(q.due_date)}</span>}
        </div>
      </div>
      <span className="xp-reward">
        {q.completed_at ? (
          <I name="Check" size={12} />
        ) : (
          <I name="Zap" size={12} />
        )}
        +{q.xp} XP
      </span>
      {manage && !q.completed_at && (
        <button
          className="icon-button delete-quest"
          aria-label={`Delete ${q.title}`}
          onClick={() =>
            setModal({
              type: "delete",
              path: `/quests/${q.id}`,
              title: q.title,
            })
          }
        >
          <I name="Trash2" size={15} />
        </button>
      )}
    </div>
  );
}
function ActivityChart({ daily, days = 7 }) {
  const points = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - days + 1 + i);
    const key = d.toISOString().slice(0, 10);
    return {
      ...(daily.find((x) => x.date === key) || { xp: 0, minutes: 0 }),
      date: key,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });
  const max = Math.max(100, ...points.map((p) => p.xp));
  return (
    <div className="activity-chart">
      <div className="chart-y">
        <span>{Math.ceil(max / 50) * 50}</span>
        <span>{Math.round(max / 2)}</span>
        <span>0 XP</span>
      </div>
      <div className="chart-bars">
        {points.map((p, i) => (
          <div
            className={`chart-column ${i === points.length - 1 ? "current" : ""}`}
            key={p.date}
          >
            <div className="chart-bar-area">
              <div
                className="chart-bar"
                style={{ height: `${(p.xp / max) * 88}%` }}
                tabIndex={0}
                aria-label={`${p.date}: ${p.xp} XP`}
              >
                <span className="chart-tooltip">
                  {dateLabel(p.date)} · {p.xp} XP
                </span>
              </div>
            </div>
            <span>
              {days > 10 ? (i % 4 === 0 ? dateLabel(p.date) : "") : p.label}
              {i === points.length - 1 && days === 7 && <i />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Quests(props) {
  const { data, setModal } = props;
  const [filter, setFilter] = useState("All"),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("Active");
  const filtered = data.quests.filter(
    (q) =>
      (filter === "All" || q.type === filter) &&
      (status === "All" ||
        (status === "Completed" ? q.completed_at : !q.completed_at)) &&
      q.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="INTENTION INTO ACTION"
        title="Make today count."
        description="Small, meaningful actions. A life moving forward."
        action={
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => setModal({ type: "quest" })}
          >
            Create quest
          </Button>
        }
      />
      <div className="summary-strip">
        <div>
          <span>Open quests</span>
          <strong>{data.quests.filter((q) => !q.completed_at).length}</strong>
        </div>
        <div>
          <span>Actions completed</span>
          <strong>{data.totals.quests}</strong>
        </div>
        <div>
          <span>XP earned today</span>
          <strong>{data.daily.find((d) => d.date === day())?.xp || 0}</strong>
        </div>
        <div>
          <span>Daily time budget</span>
          <strong>
            {data.profile.daily_minutes}
            <small> min</small>
          </strong>
        </div>
      </div>
      <div className="toolbar">
        <div className="filter-tabs">
          {[
            "All",
            "Daily",
            "Weekly",
            "Main",
            "Side",
            "AI Suggested",
            "Custom",
          ].map((t) => (
            <button
              className={filter === t ? "selected" : ""}
              key={t}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Quest status"
        >
          <option>Active</option>
          <option>Completed</option>
          <option>All</option>
        </select>
      </div>
      <div className="search-field">
        <I name="Search" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a quest…"
          aria-label="Search quests"
        />
      </div>
      <section className="panel quest-list">
        {filtered.length ? (
          filtered.map((q) => <QuestRow key={q.id} q={q} {...props} manage />)
        ) : (
          <Empty
            icon="CircleCheck"
            title={
              status === "Completed"
                ? "Your progress will appear here"
                : "A little space for your next step"
            }
            text="Create a quest or try a different filter."
            action="Create quest"
            onClick={() => setModal({ type: "quest" })}
          />
        )}
      </section>
    </>
  );
}
function Entities({ data, kind, setModal }) {
  const isSkills = kind === "Skills",
    list = isSkills ? data.skills : data.stats;
  const [search, setSearch] = useState("");
  return (
    <>
      <PageHeading
        eyebrow={
          isSkills ? "INVEST IN WHAT YOU CAN DO" : "GROW IN EVERY DIRECTION"
        }
        title={isSkills ? "A little more capable." : "A more balanced you."}
        description={
          isSkills
            ? "Every skill begins with curiosity. Keep yours growing."
            : "A personal reflection of your practice — never a measure of your worth."
        }
        action={
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => setModal({ type: "entity", kind })}
          >
            Add {isSkills ? "skill" : "stat"}
          </Button>
        }
      />
      <div className="search-field">
        <I name="Search" size={16} />
        <input
          placeholder={`Find a ${isSkills ? "skill" : "stat"}…`}
          aria-label={`Search ${kind}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="entity-grid">
        {list
          .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
          .map((s) => (
            <button
              className="panel entity-card"
              key={s.id}
              onClick={() =>
                setModal({ type: "entityDetail", kind, entity: s })
              }
            >
              <div className="entity-top">
                <span
                  className="entity-icon"
                  style={{ background: `${s.color}12`, color: s.color }}
                >
                  <I name={s.icon} size={24} />
                </span>
                <I name="ArrowUpRight" size={17} />
              </div>
              <h2>{s.name}</h2>
              <p>{s.description || "Your own direction for growth."}</p>
              <div className="entity-level">
                <strong>Level {s.level}</strong>
                <span>
                  {s.xp} / {s.needed} XP
                </span>
              </div>
              <Bar percent={s.percent} color={s.color} />
              <div className="entity-tags">
                {isSkills ? (
                  s.statIds.map((id) => (
                    <span key={id}>
                      {data.stats.find((st) => st.id === id)?.name}
                    </span>
                  ))
                ) : (
                  <span>
                    {
                      data.skills.filter((sk) => sk.statIds.includes(s.id))
                        .length
                    }{" "}
                    connected skills
                  </span>
                )}
                <small>{s.percent}% to next level</small>
              </div>
            </button>
          ))}
      </div>
      {!list.length && (
        <Empty
          action={`Add ${isSkills ? "skill" : "stat"}`}
          onClick={() => setModal({ type: "entity", kind })}
        />
      )}
    </>
  );
}
function Goals({ data, setModal, mutate, busy }) {
  return (
    <>
      <PageHeading
        eyebrow="GIVE YOUR GROWTH A DIRECTION"
        title="The bigger picture."
        description="Meaningful goals, broken into steps you can actually take."
        action={
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => setModal({ type: "goal" })}
          >
            Set a goal
          </Button>
        }
      />
      <div className="goals-grid">
        {data.goals.map((g) => {
          const done = g.milestones.filter((m) => m.completed).length,
            percent = Math.round(
              (done / Math.max(1, g.milestones.length)) * 100,
            );
          return (
            <section className="panel goal-card" key={g.id}>
              <div className="goal-card-top">
                <span className="goal-category">
                  <I name="Flag" size={14} />
                  {g.category}
                </span>
                <button
                  className="icon-button"
                  aria-label={`Delete ${g.title}`}
                  onClick={() =>
                    setModal({
                      type: "delete",
                      path: `/goals/${g.id}`,
                      title: g.title,
                    })
                  }
                >
                  <I name="Trash2" size={15} />
                </button>
              </div>
              <h2>{g.title}</h2>
              <p>{g.description}</p>
              <div className="goal-meta">
                <span>
                  {done} of {g.milestones.length} milestones
                </span>
                <strong>{percent}%</strong>
              </div>
              <Bar percent={percent} />
              <div className="milestones">
                {g.milestones.map((m, i) => (
                  <div key={m.id} className={m.completed ? "done" : ""}>
                    <button
                      className="milestone-check"
                      aria-label={`Toggle ${m.title}`}
                      disabled={busy}
                      onClick={() =>
                        mutate(
                          `/milestones/${m.id}`,
                          "PATCH",
                          { completed: !m.completed },
                          m.completed
                            ? "Milestone reopened"
                            : "Milestone reached",
                        )
                      }
                    >
                      {m.completed ? <I name="Check" size={12} /> : i + 1}
                    </button>
                    <span>{m.title}</span>
                    {!m.completed && (
                      <button
                        className="icon-button"
                        aria-label={`Create quest for ${m.title}`}
                        onClick={() =>
                          setModal({
                            type: "quest",
                            quest: {
                              title: m.title,
                              goalId: g.id,
                              milestoneId: m.id,
                              type: "Main",
                            },
                          })
                        }
                      >
                        <I name="Plus" size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {g.target_date && (
                <div className="goal-target">
                  <I name="CalendarDays" size={13} /> Target:{" "}
                  {dateLabel(g.target_date)}
                </div>
              )}
            </section>
          );
        })}
      </div>
      {!data.goals.length && (
        <Empty
          icon="Flag"
          title="What would you like to work toward?"
          action="Set your first goal"
          onClick={() => setModal({ type: "goal" })}
        />
      )}
    </>
  );
}
function Analytics({ data, go }) {
  const [period, setPeriod] = useState(7);
  const from = new Date(Date.now() - (period - 1) * 86400000)
    .toISOString()
    .slice(0, 10);
  const days = data.daily.filter((d) => d.date >= from),
    xp = days.reduce((a, d) => a + d.xp, 0),
    minutes = days.reduce((a, d) => a + d.minutes, 0),
    count = days.reduce((a, d) => a + d.quests, 0);
  const quests = data.quests.filter(
    (q) => q.due_date >= from && q.due_date <= day(),
  );
  const completion = quests.length
    ? Math.round(
        (quests.filter((q) => q.completed_at).length / quests.length) * 100,
      )
    : 0;
  const skillGrowth = data.skills
    .map((s) => ({
      ...s,
      gained: data.transactions
        .filter(
          (t) =>
            t.entity_type === "skill" &&
            t.entity_id === s.id &&
            t.created_at.slice(0, 10) >= from &&
            t.completion_id,
        )
        .reduce((a, t) => a + t.amount, 0),
    }))
    .sort((a, b) => b.gained - a.gained);
  const timeStats = data.stats.map((s) => ({
    ...s,
    minutes: data.quests
      .filter(
        (q) =>
          q.completed_at &&
          q.completed_at.slice(0, 10) >= from &&
          q.statIds.includes(s.id),
      )
      .reduce((a, q) => a + q.minutes / Math.max(1, q.statIds.length), 0),
  }));
  const totalTime = timeStats.reduce((a, s) => a + s.minutes, 0);
  return (
    <>
      <PageHeading
        eyebrow="SEE HOW FAR YOU’VE COME"
        title="Your effort, made visible."
        description="Look for patterns. Celebrate progress. Find your balance."
        action={
          <div className="segmented">
            {[7, 30].map((n) => (
              <button
                className={period === n ? "selected" : ""}
                onClick={() => setPeriod(n)}
                key={n}
              >
                {n === 7 ? "This week" : "This month"}
              </button>
            ))}
          </div>
        }
      />
      <div className="summary-strip analytics-metrics">
        {[
          ["Zap", "XP earned", fmt(xp)],
          ["Clock3", "Time invested", `${(minutes / 60).toFixed(1)} hrs`],
          ["CircleCheck", "Actions completed", count],
          ["Target", "Quest completion", `${completion}%`],
        ].map(([i, l, v]) => (
          <div key={l}>
            <span>
              <I name={i} size={16} />
              {l}
            </span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <section className="panel">
        <SectionTitle
          title="Consistency over intensity"
          subtitle={`Your XP over the last ${period} days`}
        />
        <ActivityChart daily={data.daily} days={period} />
      </section>
      <div className="two-column analytics-bottom">
        <section className="panel">
          <SectionTitle
            title="Skills moving forward"
            subtitle="XP earned through recorded practice"
          />
          {skillGrowth.map((s) => (
            <div className="growth-row" key={s.id}>
              <span className="skill-icon" style={{ color: s.color }}>
                <I name={s.icon} />
              </span>
              <div>
                <strong>{s.name}</strong>
                <Bar
                  percent={
                    (s.gained /
                      Math.max(1, ...skillGrowth.map((x) => x.gained))) *
                    100
                  }
                  color={s.color}
                />
              </div>
              <span>+{s.gained} XP</span>
            </div>
          ))}
        </section>
        <section className="panel">
          <SectionTitle
            title="Where your time goes"
            subtitle="Time split across stats linked to completed quests"
          />
          {timeStats
            .filter((s) => s.minutes)
            .map((s) => (
              <div className="time-row" key={s.id}>
                <span>
                  <i style={{ background: s.color }} />
                  {s.name}
                </span>
                <Bar
                  percent={(s.minutes / Math.max(1, totalTime)) * 100}
                  color={s.color}
                />
                <strong>{Math.round(s.minutes)} min</strong>
              </div>
            ))}
          {!totalTime && (
            <Empty
              icon="Clock3"
              title="More context with every action"
              text="Complete a quest linked to a stat to see your time distribution."
            />
          )}
          <div className="insight-note">
            <I name="Sparkles" size={20} />
            <div>
              <strong>A moment to reflect</strong>
              <p>
                {data.recommendation?.description ||
                  "Every recorded action helps you understand your learning patterns."}
              </p>
              <button className="text-link" onClick={() => go("AI Assistant")}>
                Explore with your assistant
                <I name="ArrowUpRight" size={13} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
function Timeline({ data, setModal }) {
  const [filter, setFilter] = useState("All");
  const entries = [
    ...(data.events || []).map((event) => ({
      ...event,
      type: "Level",
      at: event.created_at,
    })),
    ...data.completions.map((c) => ({
      ...c,
      type: "Action",
      at: c.completed_at,
    })),
    ...data.achievements
      .filter((a) => a.unlocked_at)
      .map((a) => ({ ...a, type: "Achievement", at: a.unlocked_at })),
    ...data.transactions
      .filter((t) => !t.completion_id)
      .map((t) => ({
        ...t,
        id: `xp-${t.id}`,
        title: t.reason,
        type: "Profile",
        at: t.created_at,
        xp: t.amount,
      })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .filter((e) => filter === "All" || e.type === filter);
  const grouped = Object.groupBy
    ? Object.groupBy(entries, (e) => e.at.slice(0, 10))
    : entries.reduce((a, e) => {
        (a[e.at.slice(0, 10)] ??= []).push(e);
        return a;
      }, {});
  return (
    <>
      <PageHeading
        eyebrow="A RECORD OF BECOMING"
        title="Look how far you’ve come."
        description="Not just the milestones. Every small step along the way."
        action={
          <Button
            icon="Plus"
            variant="primary"
            onClick={() => setModal({ type: "log" })}
          >
            Log progress
          </Button>
        }
      />
      <div className="filter-tabs timeline-filters">
        {["All", "Action", "Level", "Achievement", "Profile"].map((t) => (
          <button
            key={t}
            className={filter === t ? "selected" : ""}
            onClick={() => setFilter(t)}
          >
            {t === "All" ? "Everything" : t + "s"}
          </button>
        ))}
      </div>
      <div className="timeline">
        {Object.entries(grouped).map(([date, items]) => (
          <div className="timeline-group" key={date}>
            <div className="timeline-date">
              <span>
                {date === day()
                  ? "Today"
                  : new Date(date + "T12:00:00").toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
              </span>
              <small>{new Date(date).getFullYear()}</small>
            </div>
            <div className="timeline-entries">
              {items.map((e) => (
                <div className="panel timeline-entry" key={`${e.type}-${e.id}`}>
                  <span className={`timeline-icon ${e.type.toLowerCase()}`}>
                    <I
                      name={
                        e.type === "Achievement"
                          ? "Award"
                          : e.type === "Level"
                            ? "TrendingUp"
                            : e.type === "Action"
                              ? "Check"
                              : "SlidersHorizontal"
                      }
                      size={18}
                    />
                  </span>
                  <div>
                    <span className="eyebrow">
                      {e.type === "Action"
                        ? "PROGRESS LOGGED"
                        : e.type === "Achievement"
                          ? "MILESTONE WORTH CELEBRATING"
                          : e.type === "Level"
                            ? "A NEW LEVEL OF PRACTICE"
                            : "PROFILE UPDATED"}
                    </span>
                    <h3>{e.title}</h3>
                    <p>
                      {e.minutes
                        ? `${e.minutes} minutes invested in yourself`
                        : e.description ||
                          "Your personal starting point, in your own terms."}
                    </p>
                  </div>
                  {e.xp != null && (
                    <span className="xp-reward">
                      {e.xp >= 0 ? "+" : ""}
                      {e.xp} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!entries.length && (
        <Empty
          icon="History"
          title="Your story is just beginning"
          text="Log an action to start building your personal timeline."
        />
      )}
    </>
  );
}
function Achievements({ data }) {
  return (
    <>
      <PageHeading
        eyebrow="REAL EFFORT. REAL MILESTONES."
        title="Worth a moment of pride."
        description="Meaningful markers of the things you’ve actually done."
      />
      <div className="achievement-summary">
        <I name="Award" size={24} />
        <strong>
          {data.achievements.filter((a) => a.unlocked_at).length}
          <span> / {data.achievements.length} milestones reached</span>
        </strong>
        <p>There’s no rush. These are yours to grow into.</p>
      </div>
      <div className="entity-grid">
        {data.achievements.map((a, i) => (
          <section
            className={`panel achievement-card ${a.unlocked_at ? "unlocked" : ""}`}
            key={a.id}
          >
            <div className="achievement-medal">
              <I
                name={
                  [
                    "Sprout",
                    "Flame",
                    "CalendarCheck",
                    "BookOpen",
                    "Layers",
                    "Flag",
                  ][i]
                }
                size={31}
              />
              {a.unlocked_at && (
                <span>
                  <I name="Check" size={11} />
                </span>
              )}
            </div>
            <span className="eyebrow">
              {a.unlocked_at ? "MILESTONE REACHED" : "IN THE MAKING"}
            </span>
            <h2>{a.title}</h2>
            <p>{a.description}</p>
            <Bar percent={(a.current / a.target) * 100} />
            <div className="goal-meta">
              <span>
                {a.current} / {a.target} {a.metric}
              </span>
              {a.unlocked_at ? (
                <span>{dateLabel(a.unlocked_at)}</span>
              ) : (
                <I name="LockKeyhole" size={12} />
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
function Chat({ data, mutate, busy, setModal }) {
  const [message, setMessage] = useState("");
  const bottom = useRef();
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [data.conversations.length]);
  const send = async (text) => {
    if (!text.trim() || busy) return;
    const result = await mutate("/chat", "POST", { message: text });
    if (result) setMessage("");
  };
  return (
    <>
      <PageHeading
        eyebrow="YOUR PERSONAL CO-PILOT"
        title="A little clarity goes a long way."
        description="Think out loud. Find your next step. Keep moving in your direction."
      />
      <div className="chat-layout">
        <section className="panel chat-panel">
          <div className="chat-header">
            <span className="ai-symbol">
              <I name="Sparkles" />
            </span>
            <div>
              <strong>Ascend assistant</strong>
              <span>
                <i />
                {data.aiMode === "local"
                  ? "Local guidance · no external AI connected"
                  : "AI connected"}
              </span>
            </div>
            <I name="ShieldCheck" size={18} />
          </div>
          <div className="chat-messages">
            {!data.conversations.length && (
              <div className="chat-welcome">
                <div className="large-ai">
                  <I name="Sparkles" size={30} />
                </div>
                <h2>What’s on your mind, {data.profile.name.split(" ")[0]}?</h2>
                <p>
                  Your goals, skills, and progress — all in context.
                  <br />
                  Let’s make your next step a little clearer.
                </p>
                <div className="prompt-grid">
                  {[
                    "What should I work on today?",
                    "Create a 7-day plan for English",
                    "I have 40 minutes. Suggest a quest.",
                    "Analyze my last month",
                  ].map((q, i) => (
                    <button key={q} onClick={() => send(q)} disabled={busy}>
                      <I
                        name={
                          [
                            "Sun",
                            "CalendarDays",
                            "Clock3",
                            "ChartNoAxesCombined",
                          ][i]
                        }
                        size={17}
                      />
                      {q}
                      <I name="ArrowUpRight" size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {data.conversations.map((c) => (
              <div className={`chat-message ${c.role}`} key={c.id}>
                <span className="chat-avatar">
                  {c.role === "assistant" ? (
                    <I name="Sparkles" size={15} />
                  ) : (
                    data.profile.name[0]
                  )}
                </span>
                <div>
                  <small>
                    {c.role === "assistant" ? "Ascend assistant" : "You"}
                  </small>
                  <div className="message-content">{c.content}</div>
                  {c.action && (
                    <div className="chat-action">
                      <span>
                        <I name="CircleCheck" size={16} />
                        {c.action.title}
                      </span>
                      <small>
                        {c.action.minutes} min · +{c.action.xp} XP
                      </small>
                      <Button
                        icon="Plus"
                        onClick={() =>
                          setModal({ type: "quest", quest: c.action })
                        }
                      >
                        Review & add quest
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="thinking">
                <span />
                <span />
                <span />
                Finding a useful next step…
              </div>
            )}
            <div ref={bottom} />
          </div>
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(message);
            }}
          >
            <textarea
              aria-label="Message your assistant"
              placeholder="What would you like to work on?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(message);
                }
              }}
              maxLength={500}
              rows={2}
            />
            <button
              className="send-button"
              type="submit"
              disabled={busy || !message.trim()}
              aria-label="Send message"
            >
              <I name="ArrowUp" size={20} />
            </button>
          </form>
          <p className="chat-note">
            {data.aiMode === "local"
              ? "Local guidance uses transparent rules, not a language model. Connect a provider in server settings."
              : "Suggestions are a starting point. You decide what works for you."}
          </p>
        </section>
        <aside className="chat-context panel">
          <span className="eyebrow">YOUR CONTEXT</span>
          <h3>Built around you.</h3>
          <div>
            <span>Available each day</span>
            <strong>{data.profile.daily_minutes} minutes</strong>
          </div>
          <div>
            <span>Current streak</span>
            <strong>{data.streak} days</strong>
          </div>
          <div>
            <span>Skills you’re growing</span>
            <strong>{data.skills.length} skills</strong>
          </div>
          <div>
            <span>Your main goals</span>
            {data.goals.map((g) => (
              <p key={g.id}>
                <I name="Flag" size={13} />
                {g.title}
              </p>
            ))}
          </div>
          <span className="privacy-note">
            <I name="LockKeyhole" size={14} />
            {data.aiMode === "local"
              ? "Your data stays in this workspace."
              : "Relevant profile data is shared with your configured AI provider."}
          </span>
        </aside>
      </div>
    </>
  );
}
function Profile({ data, setModal, mutate, busy }) {
  const [name, setName] = useState(data.profile.name),
    [role, setRole] = useState(data.profile.role),
    [bio, setBio] = useState(data.profile.bio);
  return (
    <>
      <PageHeading
        eyebrow="THE PERSON BEHIND THE PROGRESS"
        title="Your own kind of becoming."
        description="A life in progress. A story only you can write."
      />
      <section className="panel profile-hero">
        <div className="profile-avatar">
          {data.profile.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <span className="eyebrow">
            LEVEL {data.profile.level} ·{" "}
            {data.profile.onboarded ? "PERSONAL PROFILE" : "DEMO PROFILE"}
          </span>
          <h2>{data.profile.name}</h2>
          <p>{data.profile.bio}</p>
        </div>
        <Button
          icon="WandSparkles"
          onClick={() => setModal({ type: "onboarding" })}
        >
          {data.profile.onboarded ? "New assessment" : "Set up my profile"}
        </Button>
      </section>
      <div className="summary-strip">
        <div>
          <span>Hours invested</span>
          <strong>{(data.totals.minutes / 60).toFixed(1)}</strong>
        </div>
        <div>
          <span>Skills growing</span>
          <strong>{data.skills.length}</strong>
        </div>
        <div>
          <span>Actions completed</span>
          <strong>{data.totals.quests}</strong>
        </div>
        <div>
          <span>Goals reached</span>
          <strong>
            {
              data.goals.filter(
                (g) =>
                  g.milestones.length && g.milestones.every((m) => m.completed),
              ).length
            }
          </strong>
        </div>
      </div>
      <form
        className="panel profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          mutate("/profile", "PATCH", { name, role, bio }, "Profile updated");
        }}
      >
        <SectionTitle
          title="Make it yours"
          subtitle="Your identity is bigger than any number on this page."
        />
        <div className="two-column">
          <Field label="Your name">
            <input
              required
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="What you do">
            <input
              value={role}
              maxLength={100}
              onChange={(e) => setRole(e.target.value)}
            />
          </Field>
        </div>
        <Field label="A note to yourself">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={3}
          />
        </Field>
        <Button type="submit" variant="primary" disabled={busy}>
          Save changes
        </Button>
      </form>
    </>
  );
}
function Settings({ data, mutate, busy, notify, setModal }) {
  const [minutes, setMinutes] = useState(data.profile.daily_minutes);
  const [reduced, setReduced] = useState(
    data.profile.preferences.reducedMotion || false,
  );
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduced);
  }, [reduced]);
  return (
    <>
      <PageHeading
        eyebrow="ON YOUR TERMS"
        title="Make room for what matters."
        description="A system that fits your life, with you in control."
      />
      <div className="settings-stack">
        <section className="panel settings-panel">
          <div className="settings-title">
            <I name="LockKeyhole" />
            <div>
              <h2>{data.account ? "Your account" : "A space of your own"}</h2>
              <p>
                {data.account
                  ? data.account.email
                  : "Create an account to keep your personal progress in a separate, protected workspace."}
              </p>
            </div>
          </div>
          <div className="account-actions">
            {data.account ? (
              <>
                <Button onClick={() => setModal({ type: "password" })}>
                  Change password
                </Button>
                <Button
                  onClick={async () => {
                    await mutate("/auth/logout", "POST", {}, "Signed out");
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                icon="ArrowRight"
                onClick={() => setModal({ type: "auth", register: true })}
              >
                Create an account
              </Button>
            )}
          </div>
        </section>
        <section className="panel settings-panel">
          <div className="settings-title">
            <I name="Clock3" />
            <div>
              <h2>Your pace</h2>
              <p>Choose a realistic daily time budget. Short sessions count.</p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutate(
                "/profile",
                "PATCH",
                {
                  daily_minutes: Number(minutes),
                  preferences: {
                    ...data.profile.preferences,
                    reducedMotion: reduced,
                  },
                },
                "Preferences saved",
              );
            }}
          >
            <Field label="Daily development time (minutes)">
              <input
                type="number"
                min="5"
                max="480"
                required
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </Field>
            <label className="setting-toggle">
              <span>
                <strong>Reduce motion</strong>
                <small>Keep transitions and celebrations subtle.</small>
              </span>
              <input
                type="checkbox"
                checked={reduced}
                onChange={(e) => setReduced(e.target.checked)}
              />
            </label>
            <Button variant="primary" type="submit" disabled={busy}>
              Save preferences
            </Button>
          </form>
        </section>
        <section className="panel settings-panel">
          <div className="settings-title">
            <I name="Sparkles" />
            <div>
              <h2>Your assistant</h2>
              <p>
                {data.aiMode === "local"
                  ? "Local guidance is active. No data is sent to an AI service."
                  : "Your external AI provider is connected."}
              </p>
            </div>
            <span className="status-pill">
              {data.aiMode === "local" ? "Local mode" : "Connected"}
            </span>
          </div>
          <p className="settings-explainer">
            Local guidance uses your saved goals, activity, available time, and
            linked skills to suggest a manageable next step. Automatic XP
            estimates are always editable.
          </p>
          <details>
            <summary>Connect a language model</summary>
            <p>
              Set <code>AI_API_URL</code>, <code>AI_API_KEY</code>, and{" "}
              <code>AI_MODEL</code> in your server environment, then restart the
              server. The endpoint must support the chat-completions format.
              Keys stay on the server; your profile and recent progress are sent
              only when you use chat.
            </p>
          </details>
        </section>
        <section className="panel settings-panel">
          <div className="settings-title">
            <I name="Database" />
            <div>
              <h2>Your data belongs to you</h2>
              <p>
                Your progress is automatically saved to the server database.
                Sign in to access your personal workspace again.
              </p>
            </div>
          </div>
          <Button
            icon="Download"
            onClick={async () => {
              try {
                const r = await fetch("/api/export");
                if (!r.ok) throw new Error();
                const b = await r.blob();
                const url = URL.createObjectURL(b);
                const a = document.createElement("a");
                a.href = url;
                a.download = "ascend-data.json";
                a.click();
                URL.revokeObjectURL(url);
                notify("Your data export is ready");
              } catch {
                notify("Export failed. Please try again.");
              }
            }}
          >
            Export all data
          </Button>
        </section>
        <section className="panel settings-panel philosophy">
          <I name="Sprout" size={24} />
          <div>
            <h2>Progress, without the pressure.</h2>
            <p>
              Levels are an internal record of practice, not an objective
              assessment of you. There are no punishments for taking a break.
              Repeating the same action in a day earns less XP, so growth stays
              meaningful.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {React.cloneElement(children, {
        "aria-label": label,
        ...(hint ? { "aria-description": hint } : {}),
      })}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function ModalHost({ modal, close, data, mutate, busy, notify, setModal }) {
  const ref = useRef();
  useEffect(() => {
    const prior = document.activeElement;
    const dialog = ref.current;
    const first = dialog?.querySelector("input,textarea,select,button");
    first?.focus();
    const handle = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const els = [
          ...dialog.querySelectorAll(
            "button:not(:disabled),input:not(:disabled),textarea,select,a[href]",
          ),
        ].filter((el) => el.offsetParent !== null);
        if (e.shiftKey && document.activeElement === els[0]) {
          e.preventDefault();
          els.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
          e.preventDefault();
          els[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = "";
      prior?.focus();
    };
  }, []);
  const common = { modal, close, data, mutate, busy, notify, setModal };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) close();
      }}
    >
      <div
        className={`modal ${modal.type === "onboarding" ? "onboarding-modal" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={
          modal.type === "log"
            ? "Log progress"
            : modal.type === "quest"
              ? "Create quest"
              : modal.type === "onboarding"
                ? "Set up your profile"
                : "Manage your growth"
        }
        ref={ref}
      >
        <button
          className="modal-close icon-button"
          onClick={close}
          aria-label="Close dialog"
        >
          <I name="X" />
        </button>
        {modal.type === "auth" ? (
          <AuthModal {...common} />
        ) : modal.type === "password" ? (
          <PasswordModal {...common} />
        ) : modal.type === "log" ? (
          <LogModal {...common} />
        ) : modal.type === "quest" ? (
          <QuestForm {...common} />
        ) : modal.type === "entity" ? (
          <EntityForm {...common} />
        ) : modal.type === "entityDetail" ? (
          <EntityDetail {...common} />
        ) : modal.type === "goal" ? (
          <GoalForm {...common} />
        ) : modal.type === "onboarding" ? (
          <Onboarding {...common} />
        ) : modal.type === "delete" ? (
          <>
            <span className="modal-symbol">
              <I name="Trash2" />
            </span>
            <h2>Remove this item?</h2>
            <p>
              “{modal.title}” will be removed. Recorded progress and XP history
              will be preserved.
            </p>
            <div className="modal-actions">
              <Button onClick={close}>Keep it</Button>
              <Button
                variant="danger"
                disabled={busy}
                onClick={async () => {
                  if (
                    await mutate(
                      modal.path,
                      "DELETE",
                      undefined,
                      "Item removed",
                    )
                  )
                    close();
                }}
              >
                Remove item
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
function QuestFields({ form, setForm, data }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <>
      <Field label="What will you do?">
        <input
          autoFocus
          required
          maxLength={200}
          placeholder="e.g. Solve one algorithm problem"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <div className="two-column">
        <Field label="Quest type">
          <select
            value={form.type || "Custom"}
            onChange={(e) => set("type", e.target.value)}
          >
            {["Daily", "Weekly", "Main", "Side", "AI Suggested", "Custom"].map(
              (t) => (
                <option key={t}>{t}</option>
              ),
            )}
          </select>
        </Field>
        <Field label="Skill">
          <select
            value={form.skillId || ""}
            onChange={(e) => {
              const skill = data.skills.find((s) => s.id === e.target.value);
              setForm((f) => ({
                ...f,
                skillId: e.target.value,
                statIds: skill?.statIds || f.statIds,
              }));
            }}
          >
            <option value="">General development</option>
            {data.skills.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="three-column">
        <Field label="Minutes">
          <input
            required
            type="number"
            min="1"
            max="480"
            value={form.minutes}
            onChange={(e) => set("minutes", e.target.value)}
          />
        </Field>
        <Field label="Reward XP">
          <input
            required
            type="number"
            min="5"
            max="200"
            value={form.xp}
            onChange={(e) => set("xp", e.target.value)}
          />
        </Field>
        <Field label="Difficulty">
          <select
            value={form.difficulty || "Moderate"}
            onChange={(e) => set("difficulty", e.target.value)}
          >
            <option>Easy</option>
            <option>Moderate</option>
            <option>Challenging</option>
          </select>
        </Field>
      </div>
      <div className="field">
        <span>Related life stats</span>
        <div className="tag-selector">
          {data.stats.map((s) => (
            <button
              className={form.statIds?.includes(s.id) ? "chosen" : ""}
              type="button"
              key={s.id}
              onClick={() =>
                set(
                  "statIds",
                  form.statIds?.includes(s.id)
                    ? form.statIds.filter((id) => id !== s.id)
                    : [...(form.statIds || []), s.id],
                )
              }
            >
              <I name={s.icon} size={12} />
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
function QuestForm({ modal, data, mutate, busy, close }) {
  const [form, setForm] = useState({
    title: "",
    type: "Custom",
    minutes: 30,
    xp: 40,
    skillId: "",
    statIds: [],
    difficulty: "Moderate",
    due_date: day(),
    ...modal.quest,
  });
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (
          await mutate(
            "/quests",
            "POST",
            form,
            "Quest added. One step at a time.",
          )
        )
          close();
      }}
    >
      <span className="eyebrow">INTENTION INTO ACTION</span>
      <h2>Create a meaningful quest.</h2>
      <p>Something small enough to start. Important enough to matter.</p>
      <QuestFields form={form} setForm={setForm} data={data} />
      <Field label="Planned date">
        <input
          type="date"
          required
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />
      </Field>
      <div className="modal-actions">
        <Button type="button" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" icon="Plus" disabled={busy}>
          Create quest
        </Button>
      </div>
    </form>
  );
}
function LogModal({ data, mutate, busy, close, notify }) {
  const [text, setText] = useState(""),
    [form, setForm] = useState(null),
    [estimating, setEstimating] = useState(false);
  return (
    <>
      <span className="modal-symbol">
        <I name="Sparkles" />
      </span>
      <span className="eyebrow">MAKE YOUR EFFORT VISIBLE</span>
      <h2>
        {form ? "A little credit for your effort." : "What did you work on?"}
      </h2>
      <p>
        {form
          ? "Review the estimate. You know your effort best."
          : "Big or small, it counts. Tell us what you did."}
      </p>
      {!form ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setEstimating(true);
            try {
              setForm(await api("/log/preview", "POST", { text }));
            } catch (e) {
              notify(e.message);
            } finally {
              setEstimating(false);
            }
          }}
        >
          <Field label="Your progress">
            <textarea
              autoFocus
              required
              rows={5}
              maxLength={500}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="I studied programming for an hour and solved two algorithm problems…"
            />
          </Field>
          <div className="log-examples">
            {[
              "Read for 25 minutes",
              "Practiced piano for 30 minutes",
              "Went running for 40 minutes",
            ].map((s) => (
              <button type="button" key={s} onClick={() => setText(s)}>
                {s}
                <I name="ArrowUpLeft" size={12} />
              </button>
            ))}
          </div>
          <div className="info-note">
            <I name="Info" size={15} />
            {data.aiMode === "connected"
              ? "Your AI provider will estimate skills and XP. Review every field before saving."
              : "A local estimate based on duration and activity. You can edit every field before saving."}
          </div>
          <div className="modal-actions">
            <Button
              variant="primary"
              icon="Sparkles"
              type="submit"
              disabled={estimating || !text.trim()}
            >
              {estimating ? "Estimating…" : "Review progress"}
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              await mutate(
                "/log/confirm",
                "POST",
                form,
                "Progress recorded. Keep becoming.",
              )
            )
              close();
          }}
        >
          <QuestFields data={data} form={form} setForm={setForm} />
          <div className="reward-preview">
            <span>Overall +{form.xp} XP</span>
            {form.skillId && (
              <span>
                {data.skills.find((s) => s.id === form.skillId)?.name} +
                {form.xp} XP
              </span>
            )}
            {form.statIds?.map((id) => (
              <span key={id}>
                {data.stats.find((s) => s.id === id)?.name} +
                {Math.round(form.xp * 0.3)} XP
              </span>
            ))}
          </div>
          <p className="small-note">
            Repeated identical actions today receive diminishing XP. Final
            rewards may be lower.
          </p>
          <div className="modal-actions">
            <Button type="button" onClick={() => setForm(null)}>
              Back
            </Button>
            <Button
              variant="primary"
              icon="Check"
              type="submit"
              disabled={busy}
            >
              Confirm progress
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
function EntityForm({ modal, data, mutate, busy, close }) {
  const isSkill = modal.kind === "Skills",
    entity = modal.entity;
  const [form, setForm] = useState({
    name: entity?.name || "",
    description: entity?.description || "",
    level: entity?.level || 1,
    color: entity?.color || "#a9baff",
    statIds: entity?.statIds || [],
  });
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (
          await mutate(
            `/${isSkill ? "skills" : "stats"}${entity ? "/" + entity.id : ""}`,
            entity ? "PATCH" : "POST",
            form,
            `${isSkill ? "Skill" : "Stat"} ${entity ? "updated" : "created"}`,
          )
        )
          close();
      }}
    >
      <span className="eyebrow">YOUR OWN DIRECTION</span>
      <h2>
        {entity ? "Shape your" : "Start a new"}{" "}
        {isSkill ? "skill" : "life stat"}.
      </h2>
      <p>Your system should reflect what matters to you.</p>
      <Field label="Name">
        <input
          required
          maxLength={60}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>
      <Field label="What does this mean to you?">
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </Field>
      <Field
        label={entity ? "Level" : "Starting level"}
        hint="A personal reference point, not a test of your ability."
      >
        <input
          type="number"
          required
          min="1"
          max="100"
          value={form.level}
          onChange={(e) => setForm({ ...form, level: e.target.value })}
        />
      </Field>
      {isSkill && (
        <div className="field">
          <span>Connected life stats</span>
          <div className="tag-selector">
            {data.stats.map((s) => (
              <button
                type="button"
                key={s.id}
                className={form.statIds.includes(s.id) ? "chosen" : ""}
                onClick={() =>
                  setForm({
                    ...form,
                    statIds: form.statIds.includes(s.id)
                      ? form.statIds.filter((x) => x !== s.id)
                      : [...form.statIds, s.id],
                  })
                }
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="modal-actions">
        <Button type="button" onClick={close}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={busy}>
          Save {isSkill ? "skill" : "stat"}
        </Button>
      </div>
    </form>
  );
}
function EntityDetail({ modal, data, setModal }) {
  const s = modal.entity,
    isSkill = modal.kind === "Skills";
  const history = data.transactions.filter(
    (t) =>
      t.entity_type === (isSkill ? "skill" : "stat") && t.entity_id === s.id,
  );
  const related = data.quests.filter((q) =>
    isSkill ? q.skill_id === s.id : q.statIds.includes(s.id),
  );
  return (
    <>
      <span
        className="entity-icon"
        style={{ color: s.color, background: `${s.color}15` }}
      >
        <I name={s.icon} size={26} />
      </span>
      <h2>{s.name}</h2>
      <p>{s.description}</p>
      <div className="entity-level">
        <strong>Level {s.level}</strong>
        <span>
          {s.xp} / {s.needed} XP
        </span>
      </div>
      <Bar percent={s.percent} color={s.color} />
      <div className="detail-section">
        <h3>{isSkill ? "Related life stats" : "Connected skills"}</h3>
        <div className="entity-tags">
          {(isSkill
            ? data.stats.filter((st) => s.statIds.includes(st.id))
            : data.skills.filter((sk) => sk.statIds.includes(s.id))
          ).map((item) => (
            <span key={item.id}>
              {item.name} · Lv. {item.level}
            </span>
          ))}
        </div>
      </div>
      <div className="detail-section">
        <h3>Related quests</h3>
        {related.slice(-5).map((q) => (
          <div className="detail-row" key={q.id}>
            <span>
              {q.completed_at ? "✓" : "○"} {q.title}
            </span>
            <small>+{q.xp} XP</small>
          </div>
        ))}
        {!related.length && <p>No linked quests yet.</p>}
      </div>
      <div className="detail-section">
        <h3>Recent growth</h3>
        {history.slice(0, 6).map((t) => (
          <div className="detail-row" key={t.id}>
            <div>
              <span>{t.reason}</span>
              <small>{dateLabel(t.created_at)}</small>
            </div>
            <span className="xp-reward">
              {t.amount >= 0 ? "+" : ""}
              {t.amount} XP
            </span>
          </div>
        ))}
        {!history.length && <p>Your next action starts this history.</p>}
      </div>
      <div className="modal-actions">
        <Button
          variant="danger-text"
          icon="Trash2"
          onClick={() =>
            setModal({
              type: "delete",
              path: `/${isSkill ? "skills" : "stats"}/${s.id}`,
              title: s.name,
            })
          }
        >
          Delete
        </Button>
        <Button
          variant="primary"
          icon="Pencil"
          onClick={() =>
            setModal({ type: "entity", kind: modal.kind, entity: s })
          }
        >
          Edit {isSkill ? "skill" : "stat"}
        </Button>
      </div>
    </>
  );
}
function GoalForm({ mutate, busy, close, notify }) {
  const [title, setTitle] = useState(""),
    [description, setDescription] = useState(""),
    [category, setCategory] = useState("Personal"),
    [date, setDate] = useState(""),
    [milestones, setMilestones] = useState(""),
    [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const roadmap = async () => {
    setGenerating(true);
    try {
      const result = await api("/goals/roadmap", "POST", { title });
      setMilestones(result.milestones.join("\n"));
      setGenerated(result.mode);
    } catch (error) {
      notify(error.message);
    } finally {
      setGenerating(false);
    }
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (
          await mutate(
            "/goals",
            "POST",
            {
              title,
              description,
              category,
              target_date: date,
              milestones: milestones
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            },
            "A new direction. Goal created.",
          )
        )
          close();
      }}
    >
      <span className="eyebrow">THE BIGGER PICTURE</span>
      <h2>What are you working toward?</h2>
      <p>Give it a name. Then make the first step smaller.</p>
      <Field label="Your goal">
        <input
          required
          maxLength={200}
          placeholder="Become a full-stack developer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>
      <Field label="Why does it matter?">
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      <div className="two-column">
        <Field label="Life area">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {[
              "Personal",
              "Career",
              "Intellect",
              "Body",
              "Creativity",
              "Communication",
              "Capital",
              "Exploration",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Target date (optional)">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
      </div>
      <div className="roadmap-label">
        <strong>Milestones</strong>
        <button
          className="text-link"
          type="button"
          disabled={generating || !title.trim()}
          onClick={roadmap}
        >
          <I name="Sparkles" size={13} />
          {generating ? "Preparing…" : "Suggest roadmap"}
        </button>
      </div>
      <Field
        label={
          generated
            ? generated === "ai"
              ? "AI roadmap — review and edit your milestones"
              : "Suggested starter template — edit to fit your goal"
            : "One milestone per line"
        }
      >
        <textarea
          rows={5}
          required
          value={milestones}
          onChange={(e) => setMilestones(e.target.value)}
          placeholder={
            "Learn the fundamentals\nBuild a first project\nShare your work"
          }
        />
      </Field>
      <div className="modal-actions">
        <Button type="button" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={busy}>
          Create goal
        </Button>
      </div>
    </form>
  );
}
function Onboarding({ data, mutate, busy, close }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: data.account?.name || "",
    age: "18–24",
    occupation: "",
    goal: "",
    learn: "",
    skills: "",
    languages: "",
    hobbies: "",
    projects: "",
    career: "",
    finance: "",
    daily_minutes: 60,
    experience: 3,
    education: 3,
    activity: 3,
    creative: 3,
    languageLevel: 3,
    careerLevel: 3,
    financeLevel: 3,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (step < 2) {
          setStep(step + 1);
          return;
        }
        if (
          await mutate(
            "/onboarding",
            "POST",
            form,
            "Your next chapter starts now.",
          )
        )
          close();
      }}
    >
      <span className="eyebrow">YOUR STARTING POINT · {step + 1} OF 3</span>
      <h2>
        {
          [
            "A system as individual as you.",
            "Bring your experience with you.",
            "Find a pace you can keep.",
          ][step]
        }
      </h2>
      <p>
        {
          [
            "Tell us a little about the life you want to build.",
            "You’re not starting from zero. Neither should your profile.",
            "These are personal reference points, not a judgment of your ability.",
          ][step]
        }
      </p>
      <div className="onboarding-progress">
        {[0, 1, 2].map((i) => (
          <span key={i} className={i <= step ? "active" : ""} />
        ))}
      </div>
      {step === 0 ? (
        <>
          <div className="two-column">
            <Field label="What should we call you?">
              <input
                autoFocus
                required
                maxLength={80}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Age range">
              <select
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
              >
                {[
                  "Under 18",
                  "18–24",
                  "25–34",
                  "35–44",
                  "45–54",
                  "55+",
                  "Prefer not to say",
                ].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="What do you do?">
            <input
              placeholder="Student, designer, developer, exploring…"
              value={form.occupation}
              onChange={(e) => set("occupation", e.target.value)}
            />
          </Field>
          <Field label="Your most important goal">
            <input
              required
              placeholder="What would make this year meaningful?"
              value={form.goal}
              onChange={(e) => set("goal", e.target.value)}
            />
          </Field>
          <Field label="What would you like to learn?">
            <input
              value={form.learn}
              onChange={(e) => set("learn", e.target.value)}
            />
          </Field>
        </>
      ) : step === 1 ? (
        <>
          <Field
            label="Skills you already practice"
            hint="Separate skills with commas. Each becomes its own skill card."
          >
            <input
              required
              placeholder="Programming, English, Piano"
              value={form.skills}
              onChange={(e) => set("skills", e.target.value)}
            />
          </Field>
          <div className="two-column">
            <Field label="Languages you know">
              <input
                value={form.languages}
                onChange={(e) => set("languages", e.target.value)}
              />
            </Field>
            <Field label="Hobbies and creative interests">
              <input
                value={form.hobbies}
                onChange={(e) => set("hobbies", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Current projects">
            <input
              value={form.projects}
              onChange={(e) => set("projects", e.target.value)}
            />
          </Field>
          <div className="two-column">
            <Field label="Career goals">
              <input
                value={form.career}
                onChange={(e) => set("career", e.target.value)}
              />
            </Field>
            <Field label="Financial goals">
              <input
                value={form.finance}
                onChange={(e) => set("finance", e.target.value)}
              />
            </Field>
          </div>
        </>
      ) : (
        <>
          <div className="assessment-ratings">
            {[
              ["experience", "Discipline & focused practice"],
              ["education", "Learning & exploration"],
              ["activity", "Movement & physical activity"],
              ["creative", "Creative practice"],
              ["languageLevel", "Languages & communication"],
              ["careerLevel", "Career & programming experience"],
              ["financeLevel", "Financial literacy"],
            ].map(([key, label]) => (
              <label key={key}>
                <span>{label}</span>
                <select
                  value={form[key]}
                  onChange={(e) => set(key, Number(e.target.value))}
                >
                  {[
                    [1, "Just beginning"],
                    [3, "Some experience"],
                    [5, "Regular practice"],
                    [7, "Confident"],
                    [9, "Extensive experience"],
                  ].map(([v, l]) => (
                    <option value={v} key={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <Field label="Time you can realistically give each day">
            <select
              value={form.daily_minutes}
              onChange={(e) => set("daily_minutes", Number(e.target.value))}
            >
              {[15, 30, 45, 60, 90, 120].map((n) => (
                <option value={n} key={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </Field>
          <div className="info-note">
            <I name="Info" size={18} />
            <span>
              {data.profile.onboarded
                ? "This creates a fresh profile and replaces your current quests, goals, and progress history. Export your data in Settings first if you want to keep it."
                : "Your demo data will be replaced with your own profile. Starting levels reflect your self-assessment and can be edited anytime."}
            </span>
          </div>
        </>
      )}
      <div className="modal-actions">
        <Button
          type="button"
          onClick={() => (step ? setStep(step - 1) : close())}
        >
          {step ? "Back" : "Maybe later"}
        </Button>
        <Button
          variant="primary"
          icon={step === 2 ? "ArrowUpRight" : "ArrowRight"}
          type="submit"
          disabled={busy}
        >
          {step === 2 ? "Create my starting point" : "Continue"}
        </Button>
      </div>
    </form>
  );
}

function AuthModal({ modal, mutate, busy, close, setModal }) {
  const [register, setRegister] = useState(!!modal.register);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [issue, setIssue] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setIssue("");
        const result = await mutate(
          register ? "/auth/register" : "/auth/login",
          "POST",
          form,
          register ? "Your account is ready" : "Welcome back",
        );
        if (result) {
          if (register || !result.state.profile.onboarded)
            setModal({ type: "onboarding" });
          else close();
        } else
          setIssue(
            "Check your details and try again. See the notification for more information.",
          );
      }}
    >
      <span className="modal-symbol">
        <I name="LockKeyhole" />
      </span>
      <span className="eyebrow">YOUR OWN SPACE TO GROW</span>
      <h2>
        {register ? "Your next chapter starts here." : "Good to have you back."}
      </h2>
      <p>
        {register
          ? "Create a private workspace, then build your starting profile. Your progress is stored separately from the demo."
          : "Sign in to pick up where you left off."}
      </p>
      {register && (
        <Field label="Your name">
          <input
            required
            autoComplete="name"
            maxLength={80}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
      )}
      <Field label="Email address">
        <input
          required
          type="email"
          autoComplete="email"
          maxLength={254}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </Field>
      <Field label="Password" hint="At least 10 characters.">
        <input
          required
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
          minLength={10}
          maxLength={128}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </Field>
      {issue && (
        <p className="form-error" role="alert">
          {issue}
        </p>
      )}
      <div className="modal-actions">
        <button
          className="text-link"
          type="button"
          onClick={() => {
            setRegister(!register);
            setIssue("");
          }}
        >
          {register
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "One moment…" : register ? "Create account" : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
function PasswordModal({ mutate, busy, close }) {
  const [currentPassword, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (
          await mutate(
            "/auth/password",
            "POST",
            { currentPassword, password },
            "Password changed. Other sessions have been signed out.",
          )
        )
          close();
      }}
    >
      <span className="eyebrow">ACCOUNT SECURITY</span>
      <h2>Update your password.</h2>
      <p>Your other sessions will be signed out after this change.</p>
      <Field label="Current password">
        <input
          required
          type="password"
          autoComplete="current-password"
          maxLength={128}
          value={currentPassword}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </Field>
      <Field label="New password" hint="At least 10 characters.">
        <input
          required
          type="password"
          autoComplete="new-password"
          minLength={10}
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <div className="modal-actions">
        <Button type="button" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={busy}>
          Update password
        </Button>
      </div>
    </form>
  );
}

createRoot(document.getElementById("root")).render(<App />);
