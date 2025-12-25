// pages/TreePage.jsx
import { useState, useEffect, useRef } from "react";
import NavBar from "../components/NavBar";
import TreeVisualizer from "../components/TreeVisualizer";
import ControlsPanel from "../components/ControlsPanel";
import AVLBuilder from "../components/AVLBuilder";
import { generateRandomTree, traverseTree } from "../utils/treeAlgorithms";
import { TREE_TYPES, TRAVERSAL_TYPES } from "../utils/treeTypes";
import { buildAVLFromArray } from "../utils/avlOperations";

export default function TreePage() {
  const [treeType, setTreeType] = useState(TREE_TYPES.BINARY);
  const [root, setRoot] = useState(null);
  const [traversalType, setTraversalType] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [showAVLBuilder, setShowAVLBuilder] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [treeData, setTreeData] = useState({ nodes: [], edges: [] });
  const treeRef = useRef(null);

  // Generate initial random tree
  useEffect(() => {
    generateNewTree();
  }, [treeType]);

  const generateNewTree = () => {
    const newRoot = generateRandomTree(treeType);
    setRoot(newRoot);
    setHighlightedNodes([]);
    setTraversalType(null);
    setSteps([]);
    setCurrentStep(0);
  };

  const handleTraversal = async (type) => {
    if (!root || isAnimating) return;
    
    setIsAnimating(true);
    setTraversalType(type);
    const nodes = traverseTree(root, type);
    
    // Animate traversal
    for (let i = 0; i < nodes.length; i++) {
      setHighlightedNodes(nodes.slice(0, i + 1));
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    
    setIsAnimating(false);
  };

  const handleAVLBuild = async (numbers) => {
    setTreeType(TREE_TYPES.AVL);
    setShowAVLBuilder(false);
    
    // Build AVL tree step by step
    const { root: avlRoot, steps: buildSteps } = await buildAVLFromArray(numbers);
    
    setSteps(buildSteps);
    setCurrentStep(0);
    
    // Animate through the steps
    if (buildSteps.length > 0) {
      setIsAnimating(true);
      for (let i = 0; i < buildSteps.length; i++) {
        setCurrentStep(i);
        setRoot(buildSteps[i].tree);
        setHighlightedNodes([buildSteps[i].value]);
        await new Promise(resolve => setTimeout(resolve, speed * 1.5));
      }
      setIsAnimating(false);
      setHighlightedNodes([]);
    }
    
    // Set final tree
    if (avlRoot) {
      setRoot(avlRoot);
    }
  };

  // Handle tree type change
  const handleTreeTypeChange = (type) => {
    setTreeType(type);
    generateNewTree();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Tree Visualization
            </h1>
            <p className="text-gray-600 mt-2">Interactive visualization of Binary Trees, BST, and AVL Trees</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={generateNewTree}
              disabled={isAnimating}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New Tree
            </button>
            
            <button
              onClick={() => setShowAVLBuilder(!showAVLBuilder)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Build AVL
            </button>
          </div>
        </div>

        {showAVLBuilder && (
          <div className="mb-8 animate-fadeIn">
            <AVLBuilder onBuild={handleAVLBuild} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ControlsPanel
              treeType={treeType}
              setTreeType={handleTreeTypeChange}
              traversalType={traversalType}
              onTraversal={handleTraversal}
              isAnimating={isAnimating}
              speed={speed}
              setSpeed={setSpeed}
              highlightedNodes={highlightedNodes}
            />
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-2xl p-6 min-h-[600px] border border-gray-200">
              <TreeVisualizer
                root={root}
                treeType={treeType}
                highlightedNodes={highlightedNodes}
                isAnimating={isAnimating}
                currentStep={currentStep}
                steps={steps}
                speed={speed}
              />
            </div>
          </div>
        </div>

        {steps.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">AVL Construction Steps</h3>
                <p className="text-gray-600">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.message || ''}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (currentStep > 0) {
                      setCurrentStep(currentStep - 1);
                      setRoot(steps[currentStep - 1].tree);
                    }
                  }}
                  disabled={currentStep === 0}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (currentStep < steps.length - 1) {
                      setCurrentStep(currentStep + 1);
                      setRoot(steps[currentStep + 1].tree);
                    }
                  }}
                  disabled={currentStep === steps.length - 1}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex gap-1 overflow-x-auto pb-2">
                {steps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentStep(idx);
                      setRoot(step.tree);
                    }}
                    className={`flex-1 min-w-[60px] h-3 rounded-full cursor-pointer transition-all ${
                      idx <= currentStep 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                        : 'bg-gray-200'
                    } ${idx === currentStep ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}
                    title={`Step ${idx + 1}: Insert ${step.value}`}
                  >
                    <div className="text-xs text-center mt-4 text-gray-600">
                      {step.value}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}