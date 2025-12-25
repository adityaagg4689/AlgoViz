// components/ControlsPanel.jsx
import { TREE_TYPES, TRAVERSAL_TYPES } from '../utils/treeTypes';

const ControlsPanel = ({
  treeType,
  setTreeType,
  traversalType,
  onTraversal,
  isAnimating,
  speed,
  setSpeed,
  highlightedNodes
}) => {
  const treeOptions = [
    { 
      value: TREE_TYPES.BINARY, 
      label: 'Binary Tree', 
      icon: '🌳',
      description: 'Random structure',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      value: TREE_TYPES.BST, 
      label: 'Binary Search Tree', 
      icon: '🔍',
      description: 'Sorted order',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      value: TREE_TYPES.AVL, 
      label: 'AVL Tree', 
      icon: '⚖️',
      description: 'Self-balancing',
      color: 'from-emerald-500 to-teal-500'
    },
  ];

  const traversalOptions = [
    { 
      value: TRAVERSAL_TYPES.INORDER, 
      label: 'Inorder Traversal',
      description: 'Left → Root → Right',
      icon: '← • →'
    },
    { 
      value: TRAVERSAL_TYPES.PREORDER, 
      label: 'Preorder Traversal',
      description: 'Root → Left → Right',
      icon: '• ← →'
    },
    { 
      value: TRAVERSAL_TYPES.POSTORDER, 
      label: 'Postorder Traversal',
      description: 'Left → Right → Root',
      icon: '← → •'
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full border border-gray-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Controls</h2>
      </div>
      
      {/* Tree Type Selection */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Tree Type
        </h3>
        <div className="space-y-3">
          {treeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTreeType(option.value)}
              disabled={isAnimating}
              className={`
                w-full text-left p-4 rounded-xl transition-all duration-300
                ${treeType === option.value 
                  ? `bg-gradient-to-r ${option.color} text-white shadow-lg transform scale-[1.02]` 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
                }
                ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}
                border border-gray-200
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-semibold">{option.label}</span>
                  </div>
                  <div className={`text-sm mt-1 ${treeType === option.value ? 'text-white/80' : 'text-gray-500'}`}>
                    {option.description}
                  </div>
                </div>
                {treeType === option.value && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Traversal Controls */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Tree Traversal
        </h3>
        <div className="space-y-3">
          {traversalOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTraversal(option.value)}
              disabled={isAnimating}
              className={`
                w-full p-4 rounded-xl transition-all duration-300
                ${traversalType === option.value 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg transform scale-[1.02]' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
                }
                ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}
                border border-gray-200
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{option.label}</div>
                  <div className={`text-sm mt-1 ${traversalType === option.value ? 'text-white/80' : 'text-gray-500'}`}>
                    {option.description}
                  </div>
                </div>
                <div className="text-lg">{option.icon}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Speed Control */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Animation Speed
          </h3>
          <span className="text-sm font-medium bg-gradient-to-r from-gray-800 to-gray-900 text-white px-3 py-1 rounded-full">
            {speed}ms
          </span>
        </div>
        <input
          type="range"
          min="100"
          max="1000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          className="
            w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full
            appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-gradient-to-r
            [&::-webkit-slider-thumb]:from-purple-500
            [&::-webkit-slider-thumb]:to-pink-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
          "
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>
      
      {/* Stats Panel */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Statistics
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
            <span className="text-gray-600">Tree Type</span>
            <span className="font-medium capitalize bg-gray-200 px-3 py-1 rounded-full text-sm">
              {treeType}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
            <span className="text-gray-600">Animation Status</span>
            <span className={`font-medium px-3 py-1 rounded-full text-sm ${
              isAnimating 
                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' 
                : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
            }`}>
              {isAnimating ? 'Running' : 'Ready'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
            <span className="text-gray-600">Nodes Highlighted</span>
            <span className="font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {highlightedNodes.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel;