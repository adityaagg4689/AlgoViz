// components/NavBar.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Table, GitBranch, Layers, ListOrdered, Network, Binary,
  X, Menu, Play, Code, MousePointer, ArrowRight, ChevronRight,
  Info, Brain,
} from "lucide-react";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const currentPath = location.pathname;

  // detect if we're on the dark landing page
  const isLanding = currentPath === "/";

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setHeaderVisible(y < lastScrollY.current || y < 80);
      setScrolled(y > 20);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  const navItems = [
    { name: "Arrays",       path: "/array",       icon: Table },
    { name: "Linked Lists", path: "/linked-list", icon: GitBranch },
    { name: "Stacks",       path: "/stack",       icon: Layers },
    { name: "Queues",       path: "/queue",       icon: ListOrdered },
    { name: "Trees",        path: "/tree",        icon: Binary },
    { name: "Graphs",       path: "/graph",       icon: Network },
  ];

  const tutorialSteps = [
    {
      title: "Select a Data Structure",
      description: "Choose from Arrays, Linked Lists, Trees, Graphs, and more. Each has unique visualizations tailored to its operations.",
      icon: <Table style={{ width: 20, height: 20, color: "#2563eb" }} />,
      example: (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Array", "Tree", "Graph", "List"].map((ds) => (
            <div key={ds} style={{ padding: "5px 12px", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 6, fontSize: 12, color: "#2563eb", fontFamily: "monospace" }}>{ds}</div>
          ))}
        </div>
      ),
    },
    {
      title: "Explore Operations",
      description: "Try insertion, deletion, searching, and sorting. Watch the data structure update with every operation in real time.",
      icon: <Code style={{ width: 20, height: 20, color: "#2563eb" }} />,
      example: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[["#16a34a", "Insert"], ["#dc2626", "Delete"], ["#2563eb", "Search"]].map(([color, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#64748b" }}>{label}: operates on elements</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Visualize Algorithms",
      description: "Watch algorithms execute step-by-step with real-time animations. See how sorting, searching, and traversal actually work.",
      icon: <Play style={{ width: 20, height: 20, color: "#2563eb" }} />,
      example: (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 32, height: 32 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#2563eb", opacity: 0.8 }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid #2563eb", animation: "navping 1.5s ease-in-out infinite" }} />
          </div>
          <span style={{ fontSize: 13, color: "#64748b" }}>Step-by-step execution with live highlights</span>
        </div>
      ),
    },
    {
      title: "Interactive Exploration",
      description: "Click to add or remove nodes, run different algorithms, and get immediate visual feedback. Learn by doing.",
      icon: <MousePointer style={{ width: 20, height: 20, color: "#2563eb" }} />,
      example: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[["#16a34a", <Play key="p" style={{ width: 10, height: 10 }} />, "Run algorithms"],
            ["#dc2626", <X key="x" style={{ width: 10, height: 10 }} />, "Remove nodes"],
            ["#2563eb", <MousePointer key="m" style={{ width: 10, height: 10 }} />, "Click to add"],
          ].map(([color, icon, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>{icon}</div>
              <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{label}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const handleNavigate = (path) => { navigate(path); setIsMenuOpen(false); };
  const isActive = (path) => path !== "/" && currentPath.startsWith(path);

  // ── theme: dark on landing, light on inner pages ──
  const t = isLanding ? {
    navBg: scrolled ? "rgba(8,11,20,0.92)" : "rgba(8,11,20,0.75)",
    border: "rgba(255,255,255,0.07)",
    logo: "#fff",
    linkColor: "rgba(255,255,255,0.45)",
    linkHoverColor: "#fff",
    linkActiveBg: "rgba(37,99,235,0.18)",
    linkActiveBorder: "rgba(37,99,235,0.4)",
    linkActiveColor: "#fff",
    howBorder: "rgba(37,99,235,0.35)",
    howBg: "rgba(37,99,235,0.1)",
    howColor: "#60a5fa",
    sep: "rgba(255,255,255,0.09)",
    hamBorder: "rgba(255,255,255,0.1)",
    hamBg: "rgba(255,255,255,0.04)",
    hamColor: "rgba(255,255,255,0.55)",
    mobileBg: "rgba(8,11,20,0.98)",
    mobileBorder: "rgba(255,255,255,0.07)",
    mobileLink: "rgba(255,255,255,0.5)",
    dotOff: "rgba(255,255,255,0.2)",
    modalBg: "#fff",
    modalBorder: "rgba(0,0,0,0.08)",
    modalText: "#0f172a",
    modalSub: "#64748b",
    modalCode: "#2563eb",
    modalExBg: "#f8fafc",
    modalExBorder: "rgba(0,0,0,0.06)",
    modalDotOff: "#cbd5e1",
    progressBg: "#e2e8f0",
  } : {
    navBg: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.8)",
    border: "rgba(0,0,0,0.07)",
    logo: "#0f172a",
    linkColor: "#64748b",
    linkHoverColor: "#0f172a",
    linkActiveBg: "rgba(37,99,235,0.08)",
    linkActiveBorder: "rgba(37,99,235,0.3)",
    linkActiveColor: "#2563eb",
    howBorder: "rgba(37,99,235,0.25)",
    howBg: "rgba(37,99,235,0.06)",
    howColor: "#2563eb",
    sep: "rgba(0,0,0,0.08)",
    hamBorder: "rgba(0,0,0,0.1)",
    hamBg: "rgba(0,0,0,0.03)",
    hamColor: "#64748b",
    mobileBg: "rgba(255,255,255,0.98)",
    mobileBorder: "rgba(0,0,0,0.07)",
    mobileLink: "#64748b",
    dotOff: "#cbd5e1",
    modalBg: "#fff",
    modalBorder: "rgba(0,0,0,0.08)",
    modalText: "#0f172a",
    modalSub: "#64748b",
    modalCode: "#2563eb",
    modalExBg: "#f8fafc",
    modalExBorder: "rgba(0,0,0,0.06)",
    modalDotOff: "#cbd5e1",
    progressBg: "#e2e8f0",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .nav-root *, .nav-root *::before, .nav-root *::after { box-sizing: border-box; margin: 0; }

        .nv-item {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 13px; border-radius: 7px;
          border: 1px solid transparent; background: transparent;
          font-size: 13.5px; font-weight: 500;
          font-family: 'Inter', system-ui, sans-serif;
          cursor: pointer; white-space: nowrap;
          transition: color .15s, background .15s, border-color .15s;
        }

        .nv-sep { width: 1px; height: 20px; flex-shrink: 0; }

        .nv-how {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 15px; border-radius: 7px;
          font-size: 13.5px; font-weight: 600;
          font-family: 'Inter', system-ui, sans-serif;
          cursor: pointer;
          transition: background .15s, transform .12s, box-shadow .15s;
          border: 1px solid;
        }
        .nv-how:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37,99,235,0.18); }

        .nv-ham {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 8px;
          cursor: pointer;
          transition: background .15s;
          border: 1px solid;
        }

        .nv-mob-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 8px;
          border: 1px solid transparent; background: transparent;
          font-size: 14px; font-weight: 500;
          font-family: 'Inter', system-ui, sans-serif;
          cursor: pointer; width: 100%; text-align: left;
          transition: color .15s, background .15s;
        }

        .nv-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(15,23,42,0.5); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px; animation: nvFade .18s ease;
        }
        .nv-modal {
          border-radius: 16px; width: 100%; max-width: 460px;
          overflow: hidden; animation: nvScale .22s cubic-bezier(.22,1,.36,1);
          font-family: 'Inter', system-ui, sans-serif;
          box-shadow: 0 24px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06);
        }

        @keyframes nvFade  { from{opacity:0} to{opacity:1} }
        @keyframes nvScale { from{opacity:0;transform:scale(.97) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes navping { 0%,100%{transform:scale(1);opacity:.8} 50%{transform:scale(1.6);opacity:0} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        .nv-desk { display:flex; align-items:center; }
        .nv-mob-only { display:none; }
        @media (max-width: 960px) {
          .nv-desk { display:none !important; }
          .nv-mob-only { display:flex !important; }
        }
        @media (prefers-reduced-motion:reduce) {
          .nv-overlay,.nv-modal,.nv-mobile-menu{animation:none;}
        }

        /* subtle logo pulse on hover */
        .nv-logo-icon { transition: box-shadow .2s, transform .2s; }
        .nv-logo-icon:hover { box-shadow: 0 0 0 4px rgba(37,99,235,0.15); transform: scale(1.05); }

        .nv-mobile-menu { animation: slideDown .2s cubic-bezier(.22,1,.36,1); }
      `}</style>

      <div className="nav-root">

        {/* ═══ NAV BAR ═══ */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          backgroundColor: t.navBg,
          borderBottom: `1px solid ${t.border}`,
          transform: headerVisible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform .3s cubic-bezier(.22,1,.36,1), background-color .3s",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 6, height: 60 }}>

            {/* Logo */}
            <button
              onClick={() => handleNavigate("/")}
              style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer", flexShrink: 0, marginRight: 4 }}
            >
              <div
                className="nv-logo-icon"
                style={{ width: 34, height: 34, borderRadius: 8, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(37,99,235,0.35)" }}
              >
                <Brain style={{ width: 18, height: 18, color: "#fff" }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: t.logo, letterSpacing: "-0.025em" }}>AlgoViz</span>
            </button>

            {/* separator */}
            <div className="nv-sep nv-desk" style={{ background: t.sep, marginLeft: 6, marginRight: 6 }} />

            {/* Desktop nav links */}
            <div className="nv-desk" style={{ gap: 2, flex: 1 }}>
              {navItems.map(({ name, path, icon: Icon }) => {
                const active = isActive(path);
                return (
                  <button
                    key={path}
                    className="nv-item"
                    onClick={() => handleNavigate(path)}
                    style={{
                      color: active ? t.linkActiveColor : t.linkColor,
                      background: active ? t.linkActiveBg : "transparent",
                      borderColor: active ? t.linkActiveBorder : "transparent",
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.color = t.linkHoverColor; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.color = t.linkColor; }}
                  >
                    <Icon style={{ width: 13, height: 13 }} />{name}
                  </button>
                );
              })}
            </div>

            {/* Desktop right */}
            <div className="nv-desk" style={{ gap: 10, marginLeft: "auto", flexShrink: 0 }}>
              <button
                className="nv-how"
                onClick={() => { setShowTutorial(true); setTutorialStep(0); }}
                style={{ borderColor: t.howBorder, background: t.howBg, color: t.howColor }}
              >
                <Info style={{ width: 13, height: 13 }} />How to use
              </button>
            </div>

            {/* Mobile right */}
            <div className="nv-mob-only" style={{ marginLeft: "auto", gap: 8 }}>
              <button
                className="nv-ham"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                style={{ borderColor: t.hamBorder, background: t.hamBg, color: t.hamColor }}
              >
                {isMenuOpen ? <X style={{ width: 17, height: 17 }} /> : <Menu style={{ width: 17, height: 17 }} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {isMenuOpen && (
            <div
              className="nv-mobile-menu"
              style={{
                borderTop: `1px solid ${t.mobileBorder}`,
                background: t.mobileBg,
                padding: "8px 12px 14px",
              }}
            >
              {navItems.map(({ name, path, icon: Icon }) => {
                const active = isActive(path);
                return (
                  <button
                    key={path}
                    className="nv-mob-btn"
                    onClick={() => handleNavigate(path)}
                    style={{
                      color: active ? "#2563eb" : t.mobileLink,
                      background: active ? "rgba(37,99,235,0.07)" : "transparent",
                    }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />{name}
                  </button>
                );
              })}
              <div style={{ height: 1, background: t.mobileBorder, margin: "8px 0" }} />
              <button
                className="nv-mob-btn"
                onClick={() => { setIsMenuOpen(false); setShowTutorial(true); setTutorialStep(0); }}
                style={{ color: "#2563eb" }}
              >
                <Info style={{ width: 16, height: 16 }} />How to use AlgoViz
              </button>
            </div>
          )}
        </nav>

        {/* Spacer */}
        <div style={{ height: 60 }} />

        {/* ═══ TUTORIAL MODAL ═══ */}
        {showTutorial && (
          <div
            className="nv-overlay"
            onClick={(e) => e.target === e.currentTarget && setShowTutorial(false)}
          >
            <div className="nv-modal" style={{ background: t.modalBg, border: `1px solid ${t.modalBorder}` }}>

              {/* Header */}
              <div style={{
                padding: "20px 24px 18px",
                borderBottom: `1px solid ${t.modalBorder}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "#2563eb", textTransform: "uppercase", marginBottom: 4 }}>
                    // getting started
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: t.modalText, letterSpacing: "-0.02em" }}>
                    How to use AlgoViz
                  </div>
                </div>
                <button
                  onClick={() => setShowTutorial(false)}
                  style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${t.modalBorder}`, background: t.modalExBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.modalSub }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {/* Progress bar */}
              <div style={{ padding: "14px 24px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: t.modalSub, fontFamily: "monospace" }}>
                    step {tutorialStep + 1} / {tutorialSteps.length}
                  </span>
                  <span style={{ fontSize: 11, color: "#2563eb", fontFamily: "monospace" }}>
                    {Math.round(((tutorialStep + 1) / tutorialSteps.length) * 100)}%
                  </span>
                </div>
                <div style={{ height: 3, background: t.progressBg, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", background: "#2563eb", borderRadius: 2,
                    width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%`,
                    transition: "width .3s cubic-bezier(.22,1,.36,1)",
                  }} />
                </div>
              </div>

              {/* Step content */}
              <div style={{ padding: "20px 24px" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
                }}>
                  {tutorialSteps[tutorialStep].icon}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: t.modalText, letterSpacing: "-0.015em", marginBottom: 7 }}>
                  {tutorialSteps[tutorialStep].title}
                </div>
                <div style={{ fontSize: 13.5, color: t.modalSub, lineHeight: 1.65, marginBottom: 18 }}>
                  {tutorialSteps[tutorialStep].description}
                </div>
                <div style={{
                  background: t.modalExBg, border: `1px solid ${t.modalExBorder}`,
                  borderRadius: 10, padding: "13px 16px",
                }}>
                  <div style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: t.modalSub, textTransform: "uppercase", marginBottom: 10 }}>
                    example
                  </div>
                  {tutorialSteps[tutorialStep].example}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: "12px 24px 20px",
                borderTop: `1px solid ${t.modalBorder}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                {/* Prev */}
                <button
                  onClick={() => setTutorialStep(p => p === 0 ? tutorialSteps.length - 1 : p - 1)}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: t.modalSub, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "color .15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = t.modalText}
                  onMouseLeave={e => e.currentTarget.style.color = t.modalSub}
                >
                  <ArrowRight style={{ width: 13, height: 13, transform: "rotate(180deg)" }} /> Prev
                </button>

                {/* Dots */}
                <div style={{ display: "flex", gap: 5 }}>
                  {tutorialSteps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTutorialStep(i)}
                      style={{
                        width: 6, height: 6, borderRadius: "50%", border: "none", cursor: "pointer",
                        background: i === tutorialStep ? "#2563eb" : t.dotOff,
                        transform: i === tutorialStep ? "scale(1.4)" : "scale(1)",
                        transition: "background .2s, transform .2s",
                      }}
                    />
                  ))}
                </div>

                {/* Next / Go */}
                {tutorialStep < tutorialSteps.length - 1 ? (
                  <button
                    onClick={() => setTutorialStep(p => p + 1)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "8px 16px", background: "#2563eb", border: "none",
                      borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit", transition: "background .15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                    onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
                  >
                    Next <ArrowRight style={{ width: 13, height: 13 }} />
                  </button>
                ) : (
                  <button
                    onClick={() => { handleNavigate("/array"); setShowTutorial(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "8px 16px", background: "#16a34a", border: "none",
                      borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit", transition: "background .15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
                    onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}
                  >
                    Let's go <ChevronRight style={{ width: 13, height: 13 }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}