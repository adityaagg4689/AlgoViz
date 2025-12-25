// components/NavBar.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, Table, GitBranch, Layers, ListOrdered, Network, Binary,
  Sparkles, X, Menu, Zap, Play, Settings, Code, MousePointer,
  ArrowRight, ChevronRight, Info
} from "lucide-react";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const currentPath = location.pathname;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Arrays", path: "/array", icon: Table },
    { name: "Linked Lists", path: "/linked-list", icon: GitBranch },
    { name: "Stacks", path: "/stack", icon: Layers },
    { name: "Queues", path: "/queue", icon: ListOrdered },
    { name: "Trees", path: "/tree", icon: Binary },
    { name: "Graphs", path: "/graph", icon: Network }
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

const tutorialSteps = [
  {
    title: "Select a Data Structure",
    description: "Choose from Arrays, Linked Lists, Trees, Graphs, and more. Each has unique visualizations.",
    icon: <Table className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Explore Operations",
    description: "Try different operations like insertion, deletion, searching, and sorting. See the data structure update in real-time.",
    icon: <Code className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Visualize Algorithms",
    description: "Watch algorithms execute step-by-step with real-time animations. See how sorting, searching, and traversal work.",
    icon: <Play className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Interactive Exploration",
    description: "Click to add/remove nodes, run different algorithms, and see immediate visual feedback. Learn by doing!",
    icon: <MousePointer className="w-6 h-6" />,
    color: "from-orange-500 to-amber-500"
  }
];

  const nextTutorialStep = () => {
    setTutorialStep((prev) => (prev + 1) % tutorialSteps.length);
  };

  const startTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(0);
  };

  const goToDataStructure = () => {
    handleNavigate("/array");
    setShowTutorial(false);
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-2xl shadow-purple-500/5 border-b border-gray-200/50' 
          : 'bg-white/70 backdrop-blur-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <button 
              onClick={() => handleNavigate("/")}
              className="flex items-center gap-3 group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500" />
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md group-hover:blur-lg transition-all" />
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex flex-col relative">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AlgoViz
                </span>
                <span className="text-xs text-gray-500 font-medium hidden sm:block">
                  Interactive DSA Learning
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                      active
                        ? 'text-white shadow-lg shadow-purple-500/30'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl" />
                    )}
                    
                    <div className="relative flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    
                    {active && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Help/How-to Button */}
              <button
                onClick={startTutorial}
                className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 hover:scale-105"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-all" />
                
                <div className="relative flex items-center gap-2 text-white">
                  <Info className="w-4 h-4" />
                  How to Use
                </div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-700 transition-all hover:scale-105"
            >
              <div className="relative">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 animate-fade-in ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                        : 'text-gray-700 hover:bg-gray-100 active:scale-95'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      active ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-semibold text-base">{item.name}</span>
                    </div>
                    {active && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
              
              {/* Mobile How-to Button */}
              <button
                onClick={startTutorial}
                className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:scale-105 transition-all"
              >
                <Info className="w-5 h-5" />
                How to Use AlgoViz
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-20">
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={(e) => e.target === e.currentTarget && setShowTutorial(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Getting Started Guide</h3>
                    <p className="text-sm text-blue-100 mt-1">Learn how to use AlgoViz in 4 simple steps</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Step {tutorialStep + 1} of {tutorialSteps.length}</span>
                <span className="text-sm font-medium text-purple-600">
                  {Math.round(((tutorialStep + 1) / tutorialSteps.length) * 100)}% Complete
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Step Content */}
            <div className="p-6">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tutorialSteps[tutorialStep].color} flex items-center justify-center mb-4`}>
                {tutorialSteps[tutorialStep].icon}
              </div>
              
              <h4 className="text-xl font-bold text-gray-800 mb-2">
                {tutorialSteps[tutorialStep].title}
              </h4>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {tutorialSteps[tutorialStep].description}
              </p>

                         {/* Visual Demo for each step */}
              <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Example:</div>
                {tutorialStep === 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {["Array", "Tree", "Graph", "List"].map((ds, i) => (
                      <div key={i} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium">
                        {ds}
                      </div>
                    ))}
                  </div>
                )}
                {tutorialStep === 1 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Insert: Add new elements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Delete: Remove elements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Search: Find elements</span>
                    </div>
                  </div>
                )}
                {tutorialStep === 2 && (
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping"></div>
                    </div>
                    <span className="ml-4 text-sm font-medium">Real-time animation</span>
                  </div>
                )}
               {tutorialStep === 3 && (
  <div className="space-y-1">
    <div className="flex items-center gap-1">
      <div className="p-0.5 bg-green-500 rounded text-white">
        <MousePointer className="w-2.5 h-2.5" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-[11px]">Add</div>
      </div>
    </div>
    <div className="flex items-center gap-1">
      <div className="p-0.5 bg-red-500 rounded text-white">
        <X className="w-2.5 h-2.5" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-[11px]">Remove</div>
      </div>
    </div>
    <div className="flex items-center gap-1">
      <div className="p-0.5 bg-blue-500 rounded text-white">
        <Play className="w-2.5 h-2.5" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-[11px]">Algorithms</div>
      </div>
    </div>
  </div>
)}
              </div>
               </div>
            {/* Footer - Navigation */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setTutorialStep(prev => prev === 0 ? tutorialSteps.length - 1 : prev - 1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {tutorialSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setTutorialStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === tutorialStep 
                        ? 'bg-purple-600 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              {tutorialStep < tutorialSteps.length - 1 ? (
                <button
                  onClick={nextTutorialStep}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={goToDataStructure}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Start Visualizing!
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
}