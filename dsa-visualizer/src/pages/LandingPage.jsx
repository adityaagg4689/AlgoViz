import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play, ArrowRight, Code, Zap, Brain,
  GitBranch, Binary, Network, Layers, Table, ListOrdered,
  X, Github, ChevronRight, Eye, Boxes, GitCompare, Timer, BookOpen, Sparkles, TrendingUp
} from "lucide-react";

/* ─── Sorting animation for hero ──────────────────────────── */
function SortingDemo() {
  const [bars, setBars] = useState([]);
  const [comparing, setComparing] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const timeoutsRef = useRef([]);

  const BAR_COUNT = 18;

  const randomBars = () =>
    Array.from({ length: BAR_COUNT }, (_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 80) + 15,
    }));

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const scheduleTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
  };

  const runBubbleSort = useCallback((arr) => {
    const steps = [];
    const a = arr.map((b) => b.value);
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({ type: "compare", i: j, j: j + 1, arr: [...a] });
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          steps.push({ type: "swap", i: j, j: j + 1, arr: [...a] });
        }
      }
      steps.push({ type: "sorted", idx: n - 1 - i });
    }
    steps.push({ type: "done" });
    return steps;
  }, []);

  const animate = useCallback(() => {
    clearTimeouts();
    setSorted([]);
    setComparing([]);
    setPhase("running");
    const initial = randomBars();
    setBars(initial);

    const steps = runBubbleSort(initial);
    let delay = 0;
    const SPEED = 55;

    steps.forEach((step) => {
      delay += SPEED;
      scheduleTimeout(() => {
        if (step.type === "compare") {
          setComparing([step.i, step.j]);
        } else if (step.type === "swap") {
          setComparing([step.i, step.j]);
          setBars(step.arr.map((v, idx) => ({ id: idx, value: v })));
        } else if (step.type === "sorted") {
          setSorted((prev) => [...prev, step.idx]);
          setComparing([]);
        } else if (step.type === "done") {
          setSorted(Array.from({ length: BAR_COUNT }, (_, i) => i));
          setComparing([]);
          setPhase("done");
          // loop after pause
          scheduleTimeout(() => animate(), 2200);
        }
      }, delay);
    });
  }, [runBubbleSort]);

  useEffect(() => {
    scheduleTimeout(() => animate(), 600);
    return () => clearTimeouts();
  }, []);

  const maxVal = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* terminal top bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d1117] border-b border-white/10 rounded-t-xl">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs font-mono text-gray-500">bubble_sort.live</span>
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${phase === "running" ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
          <span className="text-xs font-mono text-gray-500">{phase === "running" ? "sorting..." : phase === "done" ? "sorted ✓" : "ready"}</span>
        </div>
      </div>

      {/* bars */}
      <div className="flex-1 bg-[#0d1117] rounded-b-xl px-5 pt-4 pb-3 flex items-end gap-[3px] overflow-hidden">
        {bars.map((bar, idx) => {
          const isComparing = comparing.includes(idx);
          const isSorted = sorted.includes(idx);
          const heightPct = (bar.value / maxVal) * 100;
          return (
            <div
              key={bar.id}
              className="flex-1 rounded-sm transition-all"
              style={{
                height: `${heightPct}%`,
                backgroundColor: isSorted
                  ? "#22c55e"
                  : isComparing
                  ? "#f59e0b"
                  : "#2563eb",
                transitionDuration: "60ms",
                transitionProperty: "height, background-color",
                opacity: isSorted ? 0.85 : isComparing ? 1 : 0.7,
                boxShadow: isComparing
                  ? "0 0 8px #f59e0b88"
                  : isSorted
                  ? "0 0 6px #22c55e66"
                  : "none",
              }}
            />
          );
        })}
      </div>

      {/* legend */}
      <div className="absolute bottom-3 left-5 flex items-center gap-4 pointer-events-none">
        <span className="flex items-center gap-1.5 text-xs font-mono text-gray-500">
          <span className="w-2 h-2 rounded-sm bg-[#2563eb] inline-block" />unsorted
        </span>
        <span className="flex items-center gap-1.5 text-xs font-mono text-gray-500">
          <span className="w-2 h-2 rounded-sm bg-[#f59e0b] inline-block" />comparing
        </span>
        <span className="flex items-center gap-1.5 text-xs font-mono text-gray-500">
          <span className="w-2 h-2 rounded-sm bg-[#22c55e] inline-block" />sorted
        </span>
      </div>
    </div>
  );
}

/* ─── Main Landing ─────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setHeaderVisible(y < lastScrollY.current || y < 80);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection observer for scroll-reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, e.target.dataset.section]));
          }
        });
      },
      { threshold: 0.12 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const registerSection = (key) => (el) => {
    if (el) {
      el.dataset.section = key;
      sectionRefs.current[key] = el;
    }
  };

  const isVisible = (key) => visibleSections.has(key);

  const handleNavigate = (path) => {
    navigate(path);
    setIsModalOpen(false);
  };

  const dataStructures = [
    { name: "Arrays", icon: Table, path: "/array", desc: "Sort & search with visual feedback", algo: "O(n log n)", tag: "Sorting" },
    { name: "Linked Lists", icon: GitBranch, path: "/linked-list", desc: "Watch nodes connect in real-time", algo: "O(n)", tag: "Traversal" },
    { name: "Stacks", icon: Layers, path: "/stack", desc: "LIFO operations visualized", algo: "O(1)", tag: "LIFO" },
    { name: "Queues", icon: ListOrdered, path: "/queue", desc: "FIFO processing animated", algo: "O(1)", tag: "FIFO" },
    { name: "Trees", icon: Binary, path: "/tree", desc: "BST & AVL rotations live", algo: "O(log n)", tag: "Recursion" },
    { name: "Graphs", icon: Network, path: "/graph", desc: "Pathfinding algorithms in action", algo: "O(V+E)", tag: "BFS/DFS" },
  ];

  const features = [
    { icon: Eye, title: "Watch it happen", desc: "Algorithms animate step-by-step so the logic is impossible to miss." },
    { icon: Zap, title: "Control the speed", desc: "Slow-motion to instant — pause, step, and replay any moment." },
    { icon: Code, title: "Code syncs live", desc: "The highlighted line follows every operation as it executes." },
    { icon: GitCompare, title: "Compare side-by-side", desc: "Run two algorithms at once and watch the performance gap emerge." },
    { icon: Boxes, title: "Multiple perspectives", desc: "Switch view modes to understand structure from different angles." },
    { icon: Brain, title: "Custom inputs", desc: "Type your own data and see exactly how the algorithm responds." },
  ];

  return (
    <div className="min-h-screen bg-[#080B14] text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }

        .mono { font-family: 'JetBrains Mono', monospace; }

        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(.22,1,.36,1), transform 0.65s cubic-bezier(.22,1,.36,1);
        }
        .reveal.in {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }
        .reveal-delay-5 { transition-delay: 0.5s; }

        .ds-card {
          position: relative;
          border: 1px solid rgba(255,255,255,0.07);
          background: #0d1117;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: border-color 0.25s, background 0.25s, transform 0.2s;
          overflow: hidden;
        }
        .ds-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(37,99,235,0.07) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .ds-card:hover {
          border-color: rgba(37,99,235,0.45);
          background: #0f1623;
          transform: translateY(-2px);
        }
        .ds-card:hover::before { opacity: 1; }

        .feature-card {
          border: 1px solid rgba(255,255,255,0.06);
          background: #0d1117;
          border-radius: 12px;
          padding: 28px;
          transition: border-color 0.25s, transform 0.2s;
        }
        .feature-card:hover {
          border-color: rgba(37,99,235,0.3);
          transform: translateY(-2px);
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .hero-scanline {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent);
          animation: scanline 6s linear infinite;
          pointer-events: none;
        }

        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .demo-float { animation: floatUp 4s ease-in-out infinite; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .cursor-blink { animation: blink 1.1s step-end infinite; }

        .glow-blue { box-shadow: 0 0 40px rgba(37,99,235,0.25); }

        .modal-overlay {
          animation: fadeIn 0.2s ease;
        }
        .modal-panel {
          animation: scaleIn 0.25s cubic-bezier(.22,1,.36,1);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .tag {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 2px 7px;
          border-radius: 4px;
          background: rgba(37,99,235,0.15);
          color: #60a5fa;
          border: 1px solid rgba(37,99,235,0.2);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: #2563eb;
          color: white;
          font-weight: 600;
          font-size: 15px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(37,99,235,0.4);
        }
        .btn-primary:active { transform: translateY(0); }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 28px;
          background: transparent;
          color: rgba(255,255,255,0.8);
          font-weight: 600;
          font-size: 15px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }

        /* Grid noise texture */
        .grid-bg {
          background-image:
            linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal { transition: none; opacity: 1; transform: none; }
          .demo-float { animation: none; }
          .hero-scanline { animation: none; }
          .cursor-blink { animation: none; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          backgroundColor: "rgba(8,11,20,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          transform: headerVisible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <button onClick={() => handleNavigate("/")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain style={{ width: 18, height: 18, color: "white" }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>AlgoViz</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#features" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}>
              Features
            </a>
            <a href="#structures" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}>
              Structures
            </a>
            <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }} onClick={() => setIsModalOpen(true)}>
              Start
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="grid-bg" style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 80, position: "relative", overflow: "hidden" }}>
        <div className="hero-scanline" />

        {/* corner glow */}
        <div style={{ position: "absolute", top: -200, right: -200, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

          {/* Left */}
          <div>
            <div className="reveal in mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#2563eb", textTransform: "uppercase", marginBottom: 24 }}>
              // algorithm visualizer
            </div>

            <h1 style={{ fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 24, color: "white" }}>
              See the code<br />
              <span style={{ color: "#2563eb" }}>think</span>{" "}
              <span style={{ color: "rgba(255,255,255,0.25)" }}>in</span>{" "}
              <span style={{ color: "white" }}>real time</span>
            </h1>

            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 440, marginBottom: 40 }}>
              Interactive visualizations for every major data structure and algorithm. 
              Watch, control, and understand — not just read.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn-primary glow-blue" onClick={() => setIsModalOpen(true)}>
                <Play style={{ width: 16, height: 16 }} />
                Start visualizing
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
              <button className="btn-ghost" onClick={() => handleNavigate("/array")}>
                <Code style={{ width: 16, height: 16 }} />
                Try arrays now
              </button>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 40, marginTop: 52 }}>
              {[
                { n: "15+", label: "algorithms" },
                { n: "6", label: "data structures" },
                { n: "∞", label: "custom inputs" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: "white" }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — live demo */}
          <div className="demo-float" style={{ position: "relative" }}>
            {/* outer glow ring */}
            <div style={{ position: "absolute", inset: -20, borderRadius: 20, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", zIndex: 0 }} />

            <div style={{ position: "relative", zIndex: 1, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)", height: 340 }}>
              <SortingDemo />
            </div>

            {/* floating label */}
            <div className="mono" style={{ position: "absolute", bottom: -18, right: 16, fontSize: 11, color: "rgba(37,99,235,0.7)", background: "#080B14", padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(37,99,235,0.2)" }}>
              live_execution
              <span className="cursor-blink">▊</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        ref={registerSection("features")}
        style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto" }}
      >
        <div className={`reveal${isVisible("features") ? " in" : ""}`}>
          <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#2563eb", textTransform: "uppercase", marginBottom: 12 }}>
            // why it works
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 16 }}>
            Built around how people<br />actually learn algorithms
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 480, marginBottom: 64 }}>
            Every feature exists because reading pseudocode is rarely enough.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`feature-card reveal${isVisible("features") ? " in" : ""} reveal-delay-${Math.min(i + 1, 5)}`}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <Icon style={{ width: 18, height: 18, color: "#60a5fa" }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Divider line ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)" }} />
      </div>

      {/* ── Data Structures ── */}
      <section
        id="structures"
        ref={registerSection("structures")}
        style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto" }}
      >
        <div className={`reveal${isVisible("structures") ? " in" : ""}`}>
          <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#2563eb", textTransform: "uppercase", marginBottom: 12 }}>
            // pick a structure
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 16 }}>
            Six structures.<br />All interactive.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 440, marginBottom: 64 }}>
            From arrays to graphs — each one visualized with complete algorithm animations.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {dataStructures.map((ds, i) => {
            const Icon = ds.icon;
            return (
              <button
                key={i}
                className={`ds-card reveal${isVisible("structures") ? " in" : ""} reveal-delay-${Math.min(i + 1, 5)}`}
                onClick={() => handleNavigate(ds.path)}
                style={{ textAlign: "left", width: "100%" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: 18, height: 18, color: "#60a5fa" }} />
                  </div>
                  <ChevronRight style={{ width: 16, height: 16, color: "rgba(255,255,255,0.2)", marginTop: 4 }} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{ds.name}</span>
                  <span className="tag">{ds.tag}</span>
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.55, marginBottom: 14 }}>{ds.desc}</div>

                <div className="mono" style={{ fontSize: 11, color: "#2563eb", fontWeight: 500 }}>
                  {ds.algo}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section
        ref={registerSection("cta")}
        style={{ padding: "80px 32px" }}
      >
        <div
          className={`reveal${isVisible("cta") ? " in" : ""}`}
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0.04) 100%)",
            border: "1px solid rgba(37,99,235,0.2)",
            borderRadius: 16,
            padding: "64px 64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#2563eb", textTransform: "uppercase", marginBottom: 12 }}>
              // free, no sign-up
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 12 }}>
              Ready to stop guessing<br />and start seeing?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 420 }}>
              Every algorithm runs live in your browser. No install, no account, no paywall.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 220 }}>
            <button className="btn-primary glow-blue" onClick={() => setIsModalOpen(true)}>
              <Play style={{ width: 16, height: 16 }} />
              Choose a structure
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
            <button className="btn-ghost" onClick={() => handleNavigate("/array")}>
              Start with arrays
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "36px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain style={{ width: 14, height: 14, color: "white" }} />
            </div>
            <span style={{ fontWeight: 700, color: "white", fontSize: 15 }}>AlgoViz</span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>— Visualize, Learn, Master</span>
          </div>

          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
            © {new Date().getFullYear()} AlgoViz
          </div>

          <a
            href="https://github.com/adityaagg4689/AlgoViz"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13, padding: "7px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            <Github style={{ width: 15, height: 15 }} />
            GitHub
          </a>
        </div>
      </footer>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            className="modal-panel"
            style={{
              background: "#0d1117",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: 32,
              width: "100%",
              maxWidth: 560,
              position: "relative",
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>

            <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#2563eb", textTransform: "uppercase", marginBottom: 10 }}>
              // select structure
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Where do you want to start?</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>Every visualization runs instantly in your browser.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {dataStructures.map((ds, i) => {
                const Icon = ds.icon;
                return (
                  <button
                    key={i}
                    className="ds-card"
                    onClick={() => handleNavigate(ds.path)}
                    style={{ textAlign: "left", padding: 16 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 7, background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon style={{ width: 15, height: 15, color: "#60a5fa" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{ds.name}</div>
                        <div className="mono" style={{ fontSize: 10, color: "#2563eb", marginTop: 2 }}>{ds.algo}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Recommended */}
            <button
              onClick={() => handleNavigate("/array")}
              style={{ width: "100%", padding: "14px 20px", background: "#2563eb", border: "none", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
              onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Table style={{ width: 16, height: 16, color: "white" }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Recommended: Arrays</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Best starting point for beginners</div>
                </div>
              </div>
              <ArrowRight style={{ width: 16, height: 16, color: "white" }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}