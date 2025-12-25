// components/AVLBuilder.jsx
import { useState } from 'react';

const AVLBuilder = ({ onBuild }) => {
  const [input, setInput] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuild = () => {
    if (!input.trim()) {
      alert('Please enter numbers');
      return;
    }

    const numbers = input
      .split(',')
      .map(num => parseInt(num.trim()))
      .filter(num => !isNaN(num));
    
    if (numbers.length === 0) {
      alert('Please enter valid numbers');
      return;
    }

    if (numbers.length > 20) {
      alert('Please limit to 20 numbers for better visualization');
      return;
    }

    setIsBuilding(true);
    setTimeout(() => {
      onBuild(numbers);
      setInput('');
      setIsBuilding(false);
    }, 100);
  };

  const handleExample = (example) => {
    setInput(example.join(', '));
  };

  const examples = [
    { 
      name: "Simple BST", 
      values: [30, 20, 40, 10, 25, 35, 50],
      description: "Simple balanced insertion"
    },
    { 
      name: "Left Rotation", 
      values: [10, 20, 30, 40, 50, 60],
      description: "Requires left rotations"
    },
    { 
      name: "Complex AVL", 
      values: [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45],
      description: "Multiple rotations"
    },
    { 
      name: "Unbalanced to Balanced", 
      values: [41, 20, 65, 11, 29, 50, 91, 32, 72, 99],
      description: "Watch rebalancing"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">AVL Tree Builder</h3>
              <p className="text-gray-600">Build a self-balancing binary search tree step by step</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-3 font-medium">
              Enter numbers (comma-separated):
            </label>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., 30, 20, 40, 10, 25, 35, 50"
                  className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm"
                  disabled={isBuilding}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBuild}
                disabled={isBuilding || !input.trim()}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3"
              >
                {isBuilding ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Building...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Build AVL Tree
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Example Inputs
            </h4>
            <div className="space-y-3">
              {examples.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExample(example.values)}
                  className="w-full text-left p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800 group-hover:text-emerald-600">
                        {example.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {example.description}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {example.values.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Self-Balancing</div>
                <div className="text-sm text-gray-600">Height difference ≤ 1</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Fast Operations</div>
                <div className="text-sm text-gray-600">O(log n) time complexity</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Rotations</div>
                <div className="text-sm text-gray-600">Left, Right, Left-Right, Right-Left</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AVLBuilder;