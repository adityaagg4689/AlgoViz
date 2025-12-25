// components/TreeVisualizer.jsx
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';

// Helper component for rendering nodes
const TreeNode = ({ 
  node, 
  isHighlighted, 
  level = 0,
  x = 0,
  y = 0
}) => {
  if (!node) return null;

  return (
    <div 
      className={`
        absolute transform -translate-x-1/2 -translate-y-1/2
        w-14 h-14 rounded-full
        flex items-center justify-center
        text-white font-bold text-lg
        border-3 border-white
        shadow-lg z-10
        transition-all duration-300
        ${isHighlighted 
          ? 'bg-gradient-to-br from-yellow-500 to-orange-500 scale-110 shadow-xl' 
          : 'bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-105'
        }
      `}
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="relative">
        <span className="text-lg font-bold">{node.val}</span>
        <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded-full shadow-sm">
          h:{node.height || 1}
        </div>
      </div>
    </div>
  );
};

const TreeVisualizer = ({ 
  root, 
  treeType, 
  highlightedNodes = [], 
  isAnimating 
}) => {
  const [treeInfo, setTreeInfo] = useState({ 
    height: 0, 
    nodes: 0,
    leaves: 0
  });
  const [containerSize, setContainerSize] = useState({ 
    width: 1200, 
    height: 600,
    offsetX: 0 
  });
  const [isTraversing, setIsTraversing] = useState(false);
  const [treeLayout, setTreeLayout] = useState({ nodes: [], connections: [] });
  const containerRef = useRef(null);

  // Calculate all node positions and connections in one pass
  const calculateTreeLayout = useCallback((node, level = 0, nodeX = 0, nodeY = 80, parentX = null, parentY = null, parentVal = null) => {
    if (!node) return { nodes: [], connections: [] };
    
    const baseSpacing = 180;
    const spacing = baseSpacing / Math.pow(1.4, level);
    const childY = nodeY + 90;
    
    // Current node display data
    const currentNode = {
      val: node.val,
      height: node.height || 1,
      x: nodeX,
      y: nodeY,
      isHighlighted: highlightedNodes.includes(node.val),
      hasParent: parentX !== null
    };
    
    // Calculate connections - create edge from parent to this node
    const connections = [];
    if (parentX !== null && parentY !== null) {
      connections.push({
        x1: parentX,
        y1: parentY + 25,
        x2: nodeX,
        y2: nodeY - 25,
        highlighted: highlightedNodes.includes(node.val) || (parentVal && highlightedNodes.includes(parentVal))
      });
    }
    
    // Process children - pass current node's position as parent for next level
    const leftLayout = node.left ? 
      calculateTreeLayout(node.left, level + 1, nodeX - spacing, childY, nodeX, nodeY, node.val) : 
      { nodes: [], connections: [] };
    const rightLayout = node.right ? 
      calculateTreeLayout(node.right, level + 1, nodeX + spacing, childY, nodeX, nodeY, node.val) : 
      { nodes: [], connections: [] };
    
    return {
      nodes: [currentNode, ...leftLayout.nodes, ...rightLayout.nodes],
      connections: [...connections, ...leftLayout.connections, ...rightLayout.connections]
    };
  }, [highlightedNodes]);

  // Calculate tree bounds for centering
  const calculateTreeBounds = useCallback((node, level = 0, x = 0, y = 80, bounds = { minX: Infinity, maxX: -Infinity, maxY: 0 }) => {
    if (!node) return bounds;
    
    const baseSpacing = 180;
    const spacing = baseSpacing / Math.pow(1.4, level);
    const childY = y + 90;
    
    // Update bounds
    bounds.minX = Math.min(bounds.minX, x - 30);
    bounds.maxX = Math.max(bounds.maxX, x + 30);
    bounds.maxY = Math.max(bounds.maxY, y + 30);
    
    // Recurse for children
    if (node.left) {
      calculateTreeBounds(node.left, level + 1, x - spacing, childY, bounds);
    }
    if (node.right) {
      calculateTreeBounds(node.right, level + 1, x + spacing, childY, bounds);
    }
    
    return bounds;
  }, []);

  useEffect(() => {
    const calculateTreeInfo = (node) => {
      if (!node) return { height: 0, nodes: 0, leaves: 0 };
      
      const left = calculateTreeInfo(node.left);
      const right = calculateTreeInfo(node.right);
      const isLeaf = !node.left && !node.right;
      
      return {
        height: Math.max(left.height, right.height) + 1,
        nodes: left.nodes + right.nodes + 1,
        leaves: left.leaves + right.leaves + (isLeaf ? 1 : 0)
      };
    };

    if (root) {
      const info = calculateTreeInfo(root);
      setTreeInfo(info);
      
      // Calculate tree bounds first
      const bounds = calculateTreeBounds(root);
      const treeWidth = bounds.maxX - bounds.minX;
      const treeHeight = bounds.maxY;
      
      // Calculate container size with proper margins - make it wide enough!
      const calculatedWidth = Math.max(1200, treeWidth + 400);
      const calculatedHeight = Math.min(Math.max(400, treeHeight + 200), 800);
      
      // Center the tree by calculating starting X position
      const centerX = calculatedWidth / 2;
      
      setContainerSize({ 
        width: calculatedWidth, 
        height: calculatedHeight,
        centerX
      });

      // Calculate initial layout with centered X position
      const layout = calculateTreeLayout(root, 0, centerX, 80, null, null, null);
      
      setTreeLayout(layout);
    }
  }, [root, calculateTreeBounds, calculateTreeLayout]);

  useEffect(() => {
    // Update layout when highlightedNodes change
    if (root && containerSize.width) {
      const centerX = containerSize.centerX || containerSize.width / 2;
      const layout = calculateTreeLayout(root, 0, centerX, 80, null, null, null);
      setTreeLayout(layout);
    }
  }, [highlightedNodes, root, containerSize, calculateTreeLayout]);

  useEffect(() => {
    if (highlightedNodes.length > 0 && isAnimating) {
      setIsTraversing(true);
    } else {
      setTimeout(() => setIsTraversing(false), 500);
    }
  }, [highlightedNodes, isAnimating]);

  // Calculate edge count
  const edgeCount = useMemo(() => {
    return treeLayout.connections.length;
  }, [treeLayout.connections]);

  if (!root) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-6xl mb-6 text-gray-400">🌲</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-3">No Tree Generated</h3>
          <p className="text-gray-500 mb-6">Select a tree type and generate a tree to start visualization</p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="px-4 py-3 bg-purple-100 rounded-lg">
              <div className="font-bold text-purple-700">Binary Tree</div>
              <div className="text-sm text-purple-600">Random structure</div>
            </div>
            <div className="px-4 py-3 bg-blue-100 rounded-lg">
              <div className="font-bold text-blue-700">BST</div>
              <div className="text-sm text-blue-600">Sorted order</div>
            </div>
            <div className="px-4 py-3 bg-green-100 rounded-lg">
              <div className="font-bold text-green-700">AVL Tree</div>
              <div className="text-sm text-green-600">Self-balancing</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`
              px-4 py-2 rounded-lg font-bold text-white
              ${treeType === 'binary' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                treeType === 'bst' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                'bg-gradient-to-r from-emerald-600 to-teal-600'}
            `}>
              {treeType === 'binary' ? '🌳 Binary Tree' : 
               treeType === 'bst' ? '🔍 Binary Search Tree' : 
               '⚖️ AVL Tree'}
            </div>
            {isTraversing && (
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Traversing
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-gray-700">Total Nodes: <strong>{treeInfo.nodes}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-700">Tree Height: <strong>{treeInfo.height}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-700">Leaf Nodes: <strong>{treeInfo.leaves}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-700">Edges: <strong>{edgeCount}</strong></span>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 border-2 border-white shadow-sm"></div>
            <span className="text-xs text-gray-600">Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 border-2 border-white shadow-sm"></div>
            <span className="text-xs text-gray-600">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-500"></div>
            <span className="text-xs text-gray-600">Connection</span>
          </div>
        </div>
      </div>

      {/* Tree Container */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-2xl border-2 border-gray-200 shadow-inner overflow-auto">
        <div 
          ref={containerRef}
          className="relative"
          style={{ 
            width: `${containerSize.width}px`,
            height: `${Math.min(containerSize.height, 600)}px`,
            margin: '0 auto',
            padding: '40px'
          }}
        >
          {/* Single SVG canvas for all connections */}
          <svg
            className="absolute top-0 left-0 pointer-events-none z-0"
            style={{ 
              width: `${containerSize.width}px`,
              height: `${containerSize.height}px`,
              minWidth: '100%',
              minHeight: '100%'
            }}
          >
            {treeLayout.connections.map((conn, index) => {
              console.log(`Rendering edge ${index}:`, conn);
              return (
                <line
                  key={`edge-${index}-${conn.x1}-${conn.y1}-${conn.x2}-${conn.y2}`}
                  x1={conn.x1}
                  y1={conn.y1}
                  x2={conn.x2}
                  y2={conn.y2}
                  stroke={conn.highlighted ? "#f59e0b" : "#4b5563"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Render all tree nodes */}
          {treeLayout.nodes.map((node, index) => (
            <TreeNode
              key={`node-${node.val}-${index}`}
              node={{ val: node.val, height: node.height }}
              isHighlighted={node.isHighlighted}
              x={node.x}
              y={node.y}
            />
          ))}
        </div>
      </div>

      {/* Tree stats */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <div className="inline-flex items-center gap-4 px-4 py-2 bg-gray-100 rounded-lg">
          <span>Nodes: {treeInfo.nodes}</span>
          <span>•</span>
          <span>Edges: {edgeCount}</span>
          <span>•</span>
          <span>Height: {treeInfo.height}</span>
          {edgeCount === treeInfo.nodes - 1 && (
            <>
              <span>•</span>
              <span className="text-green-600 font-medium">✓ All edges connected</span>
            </>
          )}
        </div>
      </div>

      {/* Scroll hint if tree is wide */}
      {containerSize.width > 1200 && (
        <div className="mt-4 text-center text-sm text-gray-500 animate-pulse">
          ↕ Scroll horizontally to view the entire tree
        </div>
      )}

      {/* Traversal Path */}
      {highlightedNodes.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Traversal Path</h4>
              <p className="text-sm text-gray-600">Following the traversal order through the tree</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {highlightedNodes.map((val, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`
                  px-4 py-2.5 rounded-lg font-medium
                  ${idx === highlightedNodes.length - 1 
                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 text-yellow-800 animate-pulse' 
                    : 'bg-white border border-blue-200 text-blue-700'
                  }
                `}>
                  <div className="flex items-center gap-2">
                    <span>{val}</span>
                    {idx === highlightedNodes.length - 1 && (
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
                    )}
                  </div>
                </div>
                {idx < highlightedNodes.length - 1 && (
                  <div className="px-2 text-blue-400 font-bold">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-blue-600 font-medium">
            Showing {highlightedNodes.length} of {treeInfo.nodes} nodes traversed
          </div>
        </div>
      )}

      {/* Tree Structure Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-200 rounded-lg">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-gray-800">Pre-calculated Layout</div>
              <div className="text-sm text-gray-600">All positions computed before rendering</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-gray-800">Complete Edge Rendering</div>
              <div className="text-sm text-gray-600">All {edgeCount} connections shown</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-gray-800">Optimized Performance</div>
              <div className="text-sm text-gray-600">Single-pass calculation and rendering</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualizer;