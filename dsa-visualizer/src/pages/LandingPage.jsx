import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, Sparkles, ArrowRight, Code, Zap, Brain, 
  GitBranch, Binary, Network, Layers, Table, ListOrdered,
  ChevronRight, X, ExternalLink, TrendingUp, Eye, Boxes, 
  GitCompare, Timer, BookOpen, Github
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setIsModalOpen(false);
  };

  const dataStructures = [
    { name: "Arrays", icon: Table, color: "from-blue-500 to-cyan-500", path: "/array", desc: "Sort & search with visual feedback" },
    { name: "Linked Lists", icon: GitBranch, color: "from-green-500 to-emerald-500", path: "/linked-list", desc: "Watch nodes connect in real-time" },
    { name: "Stacks", icon: Layers, color: "from-orange-500 to-amber-500", path: "/stack", desc: "LIFO operations visualized" },
    { name: "Queues", icon: ListOrdered, color: "from-pink-500 to-rose-500", path: "/queue", desc: "FIFO processing animated" },
    { name: "Trees", icon: Binary, color: "from-purple-500 to-violet-500", path: "/tree", desc: "BST & AVL rotations live" },
    { name: "Graphs", icon: Network, color: "from-indigo-500 to-blue-500", path: "/graph", desc: "Pathfinding algorithms in action" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-hidden">
      
      {/* Animated background effects */}
      <div className="fixed inset-0 opacity-40">
        <div 
          className="absolute w-[600px] h-[600px] bg-blue-500 rounded-full blur-[120px]"
          style={{
            left: `${mousePosition.x / 15}px`,
            top: `${mousePosition.y / 15}px`,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-pink-500 rounded-full blur-[100px]" />
      </div>

      {/* Animated grid overlay */}
      <div 
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        
        {/* Enhanced Navbar */}
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => handleNavigate("/")}
                className="flex items-center gap-3 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-md group-hover:blur-lg transition-all" />
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-xl">
                    <Brain className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AlgoViz
                  </span>
                  <div className="text-xs text-gray-400 hidden sm:block">Algorithm Visualizer</div>
                </div>
              </button>
              
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#structures" className="text-gray-300 hover:text-white transition-colors">Structures</a>
                <a href="#learn" className="text-gray-300 hover:text-white transition-colors">Learn</a>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all font-semibold shadow-lg shadow-purple-500/30 hover:scale-105"
                >
                  Get Started
                </button>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="md:hidden px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section - Enhanced */}
        <section className="px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-200">Interactive Learning Platform</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>

            {/* Main Heading with Animation */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight">
                <div className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                  AlgoViz
                </div>
              </h1>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white">
                Visualize Algorithms
              </h2>
              <h3 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-gray-400">
                In Real Time
              </h3>
            </div>

            {/* Enhanced Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              Transform complex data structures and algorithms into 
              <span className="text-blue-400 font-semibold"> beautiful</span>, 
              <span className="text-purple-400 font-semibold"> interactive</span> visualizations.
              <br />
              Learn by seeing, understand by doing.
            </p>

            {/* CTA Buttons - Enhanced */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative px-10 py-5 rounded-2xl overflow-hidden transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3 text-white font-bold text-lg">
                  <Play className="w-6 h-6" />
                  Start Visualizing
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>
              
              <button 
                onClick={() => handleNavigate('/array')}
                className="group flex items-center gap-3 px-10 py-5 rounded-2xl border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all text-lg font-bold"
              >
                <Code className="w-6 h-6" />
                Try It Live
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </button>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-3 gap-8 pt-20 max-w-3xl mx-auto">
              {[
                { value: "15+", label: "Algorithms", gradient: "from-blue-400 to-cyan-400" },
                { value: "6", label: "Data Structures", gradient: "from-purple-400 to-pink-400" },
                { value: "Live", label: "Animations", gradient: "from-pink-400 to-orange-400" }
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-pointer">
                  <div className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform`}>
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-gray-400 mt-2 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Redesigned */}
        <section id="features" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Why <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AlgoViz</span>?
            </h2>
            <p className="text-xl text-gray-400">Everything you need to master algorithms</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Eye,
                title: "Visual Learning",
                desc: "Watch algorithms come to life with smooth, real-time animations that make complex concepts crystal clear",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Control execution speed from slow-motion to blazing fast. Pause, replay, and step through at your own pace",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Brain,
                title: "Interactive Controls",
                desc: "Hands-on learning with full control over data inputs, algorithm parameters, and visualization speed",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Code,
                title: "Code Sync",
                desc: "See the actual code execute line-by-line synchronized with the visual representation",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Boxes,
                title: "Multiple Views",
                desc: "Switch between different visualization styles to understand algorithms from various perspectives",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: GitCompare,
                title: "Compare Algorithms",
                desc: "Run multiple algorithms side-by-side to compare performance and behavior in real-time",
                color: "from-pink-500 to-rose-500"
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={`group relative p-8 rounded-3xl border transition-all duration-500 cursor-pointer ${
                    activeFeature === i
                      ? 'bg-white/10 border-white/30 scale-105 shadow-2xl'
                      : 'bg-white/5 border-white/10 hover:border-white/30 hover:scale-102'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`} />
                  
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Data Structures Showcase */}
        <section id="structures" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Explore <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Data Structures</span>
            </h2>
            <p className="text-xl text-gray-400">Master fundamental and advanced concepts with interactive visualizations</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataStructures.map((ds, i) => {
              const Icon = ds.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleNavigate(ds.path)}
                  className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/30 transition-all hover:scale-105 text-left overflow-hidden"
                >
                  {/* Animated background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${ds.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Icon */}
                  <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${ds.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative">
                    <h3 className="text-2xl font-bold mb-2 flex items-center justify-between text-white">
                      {ds.name}
                      <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{ds.desc}</p>
                  </div>

                  {/* Decorative corner */}
                  <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${ds.color} rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-all duration-500`} />
                </button>
              );
            })}
          </div>
        </section>

        {/* Learning Path Section */}
        <section id="learn" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />
            
            <div className="relative p-12 md:p-20">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-semibold">Start Your Journey</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-white">
                  Ready to Master Algorithms?
                </h2>
                
                <p className="text-xl text-gray-300 leading-relaxed">
                  Join thousands of learners who are visualizing their way to algorithmic excellence. 
                  From beginner to expert, we've got you covered.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="group px-10 py-5 rounded-2xl bg-white text-black hover:bg-gray-100 transition-all hover:scale-105 text-lg font-bold flex items-center gap-3"
                  >
                    Get Started Now
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
                  
                  <button
                    onClick={() => handleNavigate('/array')}
                    className="px-10 py-5 rounded-2xl border-2 border-white/30 hover:bg-white/10 transition-all text-lg font-bold"
                  >
                    View Examples
                  </button>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-8 pt-8 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    <span>Free Forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>No Sign Up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Instant Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-16 border-t border-white/10 bg-black/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-md" />
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-xl">
                    <Brain className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AlgoViz
                  </div>
                  <div className="text-sm text-gray-400">Visualize, Learn, Master</div>
                </div>
              </div>
              
              <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} AlgoViz. All rights reserved.
              </div>
              
              <div className="flex items-center gap-4">
                <a 
                  href="https://github.com/adityaagg4689/AlgoViz" 
                  className="p-2 rounded-lg border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              
                  
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal */}
     {/* Compact Modal */}
{isModalOpen && (
  <div 
    className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
    onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
  >
    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-2xl w-full relative animate-scale-in shadow-2xl">
      {/* Close Button */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-all z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="text-xs font-medium text-gray-300">Interactive Visualizer</span>
        </div>
        
        <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Choose Your Path
        </h3>
        <p className="text-gray-400 text-sm">Select a data structure to begin your visualization journey</p>
      </div>

      {/* Compact Grid - 2x3 layout */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {dataStructures.map((ds, i) => {
          const Icon = ds.icon;
          return (
            <button
              key={i}
              onClick={() => handleNavigate(ds.path)}
              className="group relative p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all hover:scale-[1.02] text-left overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${ds.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative flex items-start gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${ds.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-base font-semibold text-white truncate">{ds.name}</h4>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{ds.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recommended Action */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Table className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Start with Arrays</h4>
              <p className="text-xs text-gray-400">Perfect for beginners</p>
            </div>
          </div>
          
          <button
            onClick={() => handleNavigate('/array')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all text-sm font-semibold whitespace-nowrap"
          >
            Begin Now
          </button>
        </div>
      </div>

      {/* Quick Tip */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">All visualizations run in your browser • No sign up required</p>
      </div>
    </div>
  </div>
)}
      {/* Animation styles */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}