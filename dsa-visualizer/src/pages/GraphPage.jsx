// pages/graph.jsx
import { useState, useEffect, useRef } from "react";
import NavBar from "../components/NavBar";

// Maze generation with weights
const generateMaze = (rows, cols, startRow, startCol, isWeighted = false) => {
  const maze = Array(rows).fill().map((_, rowIdx) => 
    Array(cols).fill().map((_, colIdx) => ({
      row: rowIdx,
      col: colIdx,
      isWall: true,
      weight: 1,
      distance: Infinity
    }))
  );
  
  // Directions: up, right, down, left
  const directions = [
    { dr: -2, dc: 0 },
    { dr: 0, dc: 2 },
    { dr: 2, dc: 0 },
    { dr: 0, dc: -2 }
  ];
  
  const stack = [{ r: startRow, c: startCol }];
  maze[startRow][startCol].isWall = false;
  
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const { r, c } = current;
    
    // Shuffle directions
    const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
    let found = false;
    
    for (const dir of shuffledDirs) {
      const nr = r + dir.dr;
      const nc = c + dir.dc;
      
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc].isWall) {
        // Carve path
        maze[r + dir.dr/2][c + dir.dc/2].isWall = false;
        maze[nr][nc].isWall = false;
        stack.push({ r: nr, c: nc });
        found = true;
        break;
      }
    }
    
    if (!found) {
      stack.pop();
    }
  }
  
  // Add weights if weighted mode
  if (isWeighted) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!maze[row][col].isWall && Math.random() < 0.25) {
          maze[row][col].weight = 3; // "Difficult terrain"
        }
      }
    }
  }
  
  // Create entrance and exit
  maze[startRow][startCol].isStart = true;
  
  // Find furthest point from start for exit
  let exitRow = startRow;
  let exitCol = startCol;
  let maxDist = 0;
  
  // Simple BFS to find furthest point
  const visited = Array(rows).fill().map(() => Array(cols).fill(false));
  const queue = [{ r: startRow, c: startCol, dist: 0 }];
  visited[startRow][startCol] = true;
  
  while (queue.length > 0) {
    const { r, c, dist } = queue.shift();
    
    if (dist > maxDist && !maze[r][c].isWall) {
      maxDist = dist;
      exitRow = r;
      exitCol = c;
    }
    
    const neighbors = [
      { r: r-1, c },
      { r: r+1, c },
      { r, c: c-1 },
      { r, c: c+1 }
    ];
    
    for (const neighbor of neighbors) {
      if (
        neighbor.r >= 0 && neighbor.r < rows &&
        neighbor.c >= 0 && neighbor.c < cols &&
        !visited[neighbor.r][neighbor.c] &&
        !maze[neighbor.r][neighbor.c].isWall
      ) {
        visited[neighbor.r][neighbor.c] = true;
        queue.push({ r: neighbor.r, c: neighbor.c, dist: dist + 1 });
      }
    }
  }
  
  maze[exitRow][exitCol].isEnd = true;
  
  return { maze, start: { row: startRow, col: startCol }, end: { row: exitRow, col: exitCol } };
};

// DFS Algorithm for maze solving
const dfs = (grid, start, end) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array(rows).fill().map(() => Array(cols).fill(false));
  const prev = Array(rows).fill().map(() => Array(cols).fill(null));
  const stack = [start];
  const visitedNodesInOrder = [];
  const path = [];
  
  while (stack.length > 0) {
    const current = stack.pop();
    
    if (visited[current.row][current.col]) continue;
    
    visited[current.row][current.col] = true;
    visitedNodesInOrder.push({row: current.row, col: current.col});
    
    if (current.row === end.row && current.col === end.col) {
      break;
    }
    
    // Try directions in this order: right, down, up, left
    const neighbors = [
      {row: current.row, col: current.col + 1},
      {row: current.row + 1, col: current.col},
      {row: current.row - 1, col: current.col},
      {row: current.row, col: current.col - 1},
    ];
    
    // Filter valid neighbors
    const validNeighbors = neighbors.filter(neighbor => 
      neighbor.row >= 0 && neighbor.row < rows &&
      neighbor.col >= 0 && neighbor.col < cols &&
      !grid[neighbor.row][neighbor.col].isWall &&
      !visited[neighbor.row][neighbor.col]
    );
    
    // Sort neighbors based on distance to exit (heuristic)
    validNeighbors.sort((a, b) => {
      const distA = Math.abs(a.row - end.row) + Math.abs(a.col - end.col);
      const distB = Math.abs(b.row - end.row) + Math.abs(b.col - end.col);
      return distA - distB;
    });
    
    for (const neighbor of validNeighbors) {
      prev[neighbor.row][neighbor.col] = {row: current.row, col: current.col};
      stack.push(neighbor);
    }
  }
  
  // Reconstruct path
  let current = end;
  while (current && (current.row !== start.row || current.col !== start.col)) {
    path.unshift(current);
    current = prev[current.row][current.col];
  }
  if (path.length > 0) {
    path.unshift(start);
  }
  
  return { visitedNodesInOrder, path };
};

// BFS Algorithm for maze solving (unweighted)
const bfs = (grid, start, end) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array(rows).fill().map(() => Array(cols).fill(false));
  const prev = Array(rows).fill().map(() => Array(cols).fill(null));
  const queue = [start];
  const visitedNodesInOrder = [];
  const path = [];
  
  visited[start.row][start.col] = true;
  
  while (queue.length > 0) {
    const current = queue.shift();
    visitedNodesInOrder.push({row: current.row, col: current.col});
    
    if (current.row === end.row && current.col === end.col) {
      break;
    }
    
    const neighbors = [
      {row: current.row - 1, col: current.col},
      {row: current.row + 1, col: current.col},
      {row: current.row, col: current.col - 1},
      {row: current.row, col: current.col + 1},
    ];
    
    for (const neighbor of neighbors) {
      if (
        neighbor.row >= 0 && neighbor.row < rows &&
        neighbor.col >= 0 && neighbor.col < cols &&
        !grid[neighbor.row][neighbor.col].isWall &&
        !visited[neighbor.row][neighbor.col]
      ) {
        visited[neighbor.row][neighbor.col] = true;
        prev[neighbor.row][neighbor.col] = {row: current.row, col: current.col};
        queue.push(neighbor);
      }
    }
  }
  
  // Reconstruct path
  let current = end;
  while (current && (current.row !== start.row || current.col !== start.col)) {
    path.unshift(current);
    current = prev[current.row][current.col];
  }
  if (path.length > 0) path.unshift(start);
  
  return { visitedNodesInOrder, path };
};

// Dijkstra's Algorithm (weighted)
const dijkstra = (grid, start, end) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const distances = Array(rows).fill().map(() => Array(cols).fill(Infinity));
  const visited = Array(rows).fill().map(() => Array(cols).fill(false));
  const prev = Array(rows).fill().map(() => Array(cols).fill(null));
  const visitedNodesInOrder = [];
  const path = [];
  
  distances[start.row][start.col] = 0;
  const unvisited = [{...start, distance: 0}];
  
  while (unvisited.length > 0) {
    unvisited.sort((a, b) => a.distance - b.distance);
    const current = unvisited.shift();
    
    if (visited[current.row][current.col]) continue;
    
    visited[current.row][current.col] = true;
    visitedNodesInOrder.push({row: current.row, col: current.col});
    
    if (current.row === end.row && current.col === end.col) break;
    
    const neighbors = [
      {row: current.row - 1, col: current.col},
      {row: current.row + 1, col: current.col},
      {row: current.row, col: current.col - 1},
      {row: current.row, col: current.col + 1},
    ];
    
    for (const neighbor of neighbors) {
      if (
        neighbor.row >= 0 && neighbor.row < rows &&
        neighbor.col >= 0 && neighbor.col < cols &&
        !grid[neighbor.row][neighbor.col].isWall &&
        !visited[neighbor.row][neighbor.col]
      ) {
        // KEY: Use the cell's weight, not just +1
        const newDist = distances[current.row][current.col] + 
                       grid[neighbor.row][neighbor.col].weight;
        
        if (newDist < distances[neighbor.row][neighbor.col]) {
          distances[neighbor.row][neighbor.col] = newDist;
          prev[neighbor.row][neighbor.col] = {row: current.row, col: current.col};
          unvisited.push({...neighbor, distance: newDist});
        }
      }
    }
  }
  
  // Reconstruct path
  let current = end;
  while (current && (current.row !== start.row || current.col !== start.col)) {
    path.unshift(current);
    current = prev[current.row][current.col];
  }
  if (path.length > 0) path.unshift(start);
  
  return { visitedNodesInOrder, path, distances };
};

// Grid Cell Component with weight display
const GridCell = ({ 
  cell, 
  isStart, 
  isEnd, 
  isWall, 
  isVisited, 
  isPath,
  isCurrent,
  distance,
  weight,
  onClick 
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        w-8 h-8 md:w-10 md:h-10 flex items-center justify-center
        border transition-all duration-150 relative
        ${isStart ? 'bg-green-500 hover:bg-green-600 border-green-600' :
         isEnd ? 'bg-red-500 hover:bg-red-600 border-red-600' :
         isWall ? 'bg-gray-900 hover:bg-gray-800 border-gray-800' :
         isPath ? 'bg-yellow-500 animate-pulse border-yellow-600' :
         isCurrent ? 'bg-blue-400 scale-105 border-blue-500' :
         isVisited ? 'bg-blue-200 border-blue-300' :
         weight > 1 ? 'bg-amber-100 border-amber-300 hover:bg-amber-200' :
         'bg-gray-100 hover:bg-gray-200 border-gray-300'}
        cursor-pointer rounded-sm
        ${(isVisited || isPath || isCurrent) ? 'shadow-inner' : ''}
        flex flex-col items-center justify-center
      `}
      title={weight > 1 ? `Cost to move here: ${weight}` : 'Cost to move here: 1'}
    >
      {/* Show weight badge if > 1 */}
      {weight > 1 && !isStart && !isEnd && !isWall && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
          {weight}
        </div>
      )}
      
      {/* Show distance for Dijkstra's */}
      {distance !== Infinity && distance !== 0 && (
        <span className="text-xs font-bold text-gray-700">
          {distance}
        </span>
      )}
    </div>
  );
};

// Algorithm Comparison Table
const AlgorithmComparison = ({ isWeighted }) => (
  <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
    <h3 className="text-xl font-bold text-gray-800 mb-4">When to Use Which Algorithm</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <th className="p-3 text-left">Algorithm</th>
            <th className="p-3 text-left">Graph Type</th>
            <th className="p-3 text-left">Finds Shortest Path?</th>
            <th className="p-3 text-left">Time Complexity</th>
            <th className="p-3 text-left">Real-World Use</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="p-3 font-bold text-purple-600">DFS</td>
            <td className="p-3">Unweighted</td>
            <td className="p-3">
              <span className="text-red-500">❌ No</span>
              <div className="text-xs text-gray-500">Finds any path</div>
            </td>
            <td className="p-3">O(V + E)</td>
            <td className="p-3">Maze solving, cycle detection</td>
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="p-3 font-bold text-blue-600">BFS</td>
            <td className="p-3">Unweighted</td>
            <td className="p-3">
              <span className="text-green-500">✅ Yes</span>
              <div className="text-xs text-gray-500">By number of steps</div>
            </td>
            <td className="p-3">O(V + E)</td>
            <td className="p-3">Social networks, web crawling</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="p-3 font-bold text-emerald-600">Dijkstra's</td>
            <td className="p-3">Weighted (non-negative)</td>
            <td className="p-3">
              <span className="text-green-500">✅ Yes</span>
              <div className="text-xs text-gray-500">By total cost</div>
            </td>
            <td className="p-3">O((V+E) log V)</td>
            <td className="p-3">GPS navigation, network routing</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
      <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Key Insight: Weighted vs Unweighted
      </h4>
      <p className="text-amber-700">
        {isWeighted ? (
          <>
            <strong>Weighted Maze Active:</strong> Yellow cells cost 3x more to traverse.
            <br />
            <strong>BFS</strong> finds the path with fewest steps (ignoring weights).
            <br />
            <strong>Dijkstra's</strong> finds the path with lowest total cost (considering weights).
          </>
        ) : (
          <>
            <strong>Unweighted Maze:</strong> All moves cost the same (1).
            <br />
            <strong>BFS and Dijkstra's</strong> give the same result.
            <br />
            <strong>Dijkstra's</strong> is overkill here - use BFS for better performance.
          </>
        )}
      </p>
    </div>
  </div>
);

export default function GraphPage() {
  const ROWS = 19; // Odd number for better maze generation
  const COLS = 29; // Odd number for better maze generation
  const SPEED = 20;
  
  const [grid, setGrid] = useState([]);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [pathNodes, setPathNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [distances, setDistances] = useState([]);
  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);
  const [isWeighted, setIsWeighted] = useState(true);
  const [totalCost, setTotalCost] = useState(0);
  
  // Initialize with a weighted maze
  useEffect(() => {
    generateNewMaze(true);
  }, []);
  
  const generateNewMaze = (weighted = true) => {
    const centerRow = Math.floor(ROWS / 2);
    const centerCol = Math.floor(COLS / 2);
    
    const { maze, start, end } = generateMaze(ROWS, COLS, centerRow, centerCol, weighted);
    
    setGrid(maze);
    setStartPos(start);
    setEndPos(end);
    setIsWeighted(weighted);
    resetVisualization();
  };
  
  const resetVisualization = () => {
    setVisitedNodes([]);
    setPathNodes([]);
    setCurrentNode(null);
    setDistances(Array(ROWS).fill().map(() => Array(COLS).fill(Infinity)));
    setTotalCost(0);
  };
  
  const generateDarkMaze = () => {
    if (isVisualizing) return;
    
    const newGrid = Array(ROWS).fill().map((_, rowIdx) => 
      Array(COLS).fill().map((_, colIdx) => ({
        row: rowIdx,
        col: colIdx,
        isWall: true,
        weight: isWeighted && Math.random() < 0.3 ? 3 : 1,
        distance: Infinity
      }))
    );
    
    // Create a few random paths
    for (let i = 0; i < 80; i++) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      newGrid[row][col].isWall = false;
    }
    
    // Set start in center, end at edge
    const centerRow = Math.floor(ROWS / 2);
    const centerCol = Math.floor(COLS / 2);
    newGrid[centerRow][centerCol].isStart = true;
    newGrid[centerRow][centerCol].isWall = false;
    
    // Find edge cell for end
    const edgeRow = Math.random() < 0.5 ? 0 : ROWS - 1;
    const edgeCol = Math.floor(Math.random() * COLS);
    newGrid[edgeRow][edgeCol].isEnd = true;
    newGrid[edgeRow][edgeCol].isWall = false;
    
    setGrid(newGrid);
    setStartPos({ row: centerRow, col: centerCol });
    setEndPos({ row: edgeRow, col: edgeCol });
    resetVisualization();
  };
  
  const generateOpenMaze = () => {
    if (isVisualizing) return;
    
    const newGrid = Array(ROWS).fill().map((_, rowIdx) => 
      Array(COLS).fill().map((_, colIdx) => ({
        row: rowIdx,
        col: colIdx,
        isWall: false,
        weight: isWeighted && Math.random() < 0.3 ? 3 : 1,
        distance: Infinity
      }))
    );
    
    // Add some random walls
    for (let i = 0; i < 40; i++) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      if (!newGrid[row][col].isStart && !newGrid[row][col].isEnd) {
        newGrid[row][col].isWall = true;
      }
    }
    
    // Set start and end
    const centerRow = Math.floor(ROWS / 2);
    const centerCol = Math.floor(COLS / 2);
    newGrid[centerRow][centerCol].isStart = true;
    
    const edgeRow = Math.random() < 0.5 ? 0 : ROWS - 1;
    const edgeCol = Math.floor(Math.random() * COLS);
    newGrid[edgeRow][edgeCol].isEnd = true;
    
    setGrid(newGrid);
    setStartPos({ row: centerRow, col: centerCol });
    setEndPos({ row: edgeRow, col: edgeCol });
    resetVisualization();
  };
  
  const handleCellClick = (row, col) => {
    if (isVisualizing) return;
    
    const newGrid = [...grid];
    if (!newGrid[row][col].isStart && !newGrid[row][col].isEnd) {
      if (isWeighted) {
        // Cycle through: normal → weighted → wall → normal
        if (newGrid[row][col].isWall) {
          newGrid[row][col].isWall = false;
          newGrid[row][col].weight = 1;
        } else if (newGrid[row][col].weight === 1) {
          newGrid[row][col].weight = 3;
        } else {
          newGrid[row][col].isWall = true;
        }
      } else {
        newGrid[row][col].isWall = !newGrid[row][col].isWall;
      }
      setGrid(newGrid);
    }
  };
  
  const solveMaze = async () => {
    if (isVisualizing || !startPos || !endPos) return;
    
    setIsVisualizing(true);
    resetVisualization();
    
    let result;
    switch (algorithm) {
      case "dfs":
        result = dfs(grid, startPos, endPos);
        break;
      case "bfs":
        result = bfs(grid, startPos, endPos);
        break;
      case "dijkstra":
        result = dijkstra(grid, startPos, endPos);
        setDistances(result.distances);
        break;
      default:
        result = dijkstra(grid, startPos, endPos);
    }
    
    // Animate visited nodes
    for (let i = 0; i < result.visitedNodesInOrder.length; i++) {
      setCurrentNode(result.visitedNodesInOrder[i]);
      setVisitedNodes(prev => [...prev, result.visitedNodesInOrder[i]]);
      await new Promise(resolve => setTimeout(resolve, SPEED));
    }
    
    // Animate path and calculate total cost
    setCurrentNode(null);
    if (result.path.length > 0) {
      let cost = 0;
      for (let i = 0; i < result.path.length; i++) {
        const node = result.path[i];
        setPathNodes(prev => [...prev, node]);
        
        // Calculate total cost for Dijkstra's
        if (algorithm === "dijkstra" && i > 0) {
          const prevNode = result.path[i-1];
          const cellCost = grid[node.row][node.col].weight;
          cost += cellCost;
          setTotalCost(cost);
        } else if (algorithm !== "dijkstra") {
          setTotalCost(result.path.length - 1); // Steps for BFS/DFS
        }
        
        await new Promise(resolve => setTimeout(resolve, SPEED * 2));
      }
    } else {
      setTimeout(() => {
        alert("No path found! The mouse cannot reach the cheese. Try generating a new maze.");
      }, 500);
    }
    
    setIsVisualizing(false);
  };
  
  const calculatePathCost = () => {
    if (pathNodes.length < 2) return 0;
    
    if (algorithm === "dijkstra") {
      return totalCost;
    } else {
      // For BFS/DFS, cost = number of steps (each step = 1)
      return pathNodes.length - 1;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Weighted Maze Algorithm Visualizer
          </h1>
          <p className="text-gray-600">
            See how different algorithms handle weighted vs unweighted paths
          </p>
        </div>
        
        {/* Maze Type Toggle */}
        <div className="mb-8">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
              <span className="text-gray-700 font-medium">Maze Type:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => generateNewMaze(false)}
                  className={`px-4 py-2 rounded-lg transition-all ${!isWeighted 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  disabled={isVisualizing}
                >
                  Unweighted
                </button>
                <button
                  onClick={() => generateNewMaze(true)}
                  className={`px-4 py-2 rounded-lg transition-all ${isWeighted 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  disabled={isVisualizing}
                >
                  Weighted
                </button>
              </div>
            </div>
            
            {isWeighted && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-2xl">
                <div className="flex items-center gap-2 text-amber-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Weighted Maze Active:</strong> Yellow cells (⚫) cost 3x more to traverse!</span>
                </div>
                <div className="mt-2 text-amber-700 text-sm">
                  Watch how BFS finds a path with fewest steps, while Dijkstra's finds the path with lowest total cost.
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Algorithm Selection */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {[
              {id: "dfs", name: "DFS", color: "from-purple-500 to-pink-500", ring: "ring-purple-200"},
              {id: "bfs", name: "BFS", color: "from-blue-500 to-cyan-500", ring: "ring-blue-200"},
              {id: "dijkstra", name: "Dijkstra", color: "from-emerald-500 to-teal-500", ring: "ring-emerald-200"}
            ].map((algo) => (
              <button
                key={algo.id}
                onClick={() => setAlgorithm(algo.id)}
                disabled={isVisualizing}
                className={`
                  px-6 py-3 rounded-lg font-bold text-white
                  transition-all duration-200 shadow-md
                  ${algorithm === algo.id 
                    ? 'ring-4 ring-opacity-50 scale-105' 
                    : 'opacity-90 hover:opacity-100 hover:scale-102'
                  }
                  ${isVisualizing ? 'cursor-not-allowed' : ''}
                  bg-gradient-to-r ${algo.color} ${algo.ring}
                `}
              >
                {algo.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-sm">
          <button
            onClick={solveMaze}
            disabled={isVisualizing}
            className={`
              px-6 py-3 rounded-lg font-bold text-white shadow-md
              transition-all duration-200 flex items-center gap-2
              ${isVisualizing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Visualize {algorithm === 'dfs' ? 'DFS' : algorithm === 'bfs' ? 'BFS' : 'Dijkstra'}
          </button>
          
          <button
            onClick={() => generateNewMaze(isWeighted)}
            disabled={isVisualizing}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Maze
          </button>
          
          <button
            onClick={generateDarkMaze}
            disabled={isVisualizing}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Dark Maze
          </button>
          
          <button
            onClick={generateOpenMaze}
            disabled={isVisualizing}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
            </svg>
            Open Maze
          </button>
        </div>
        
        {/* Maze Grid */}
        <div className="mb-8">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-2 md:p-4 overflow-auto">
            <div className="flex justify-center">
              <div 
                className="grid gap-0.5"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`
                }}
              >
                {grid.map((row, rowIdx) => 
                  row.map((cell, colIdx) => {
                    const isVisited = visitedNodes.some(
                      node => node.row === rowIdx && node.col === colIdx
                    );
                    const isPath = pathNodes.some(
                      node => node.row === rowIdx && node.col === colIdx
                    );
                    const isCurrent = currentNode && 
                      currentNode.row === rowIdx && 
                      currentNode.col === colIdx;
                    
                    return (
                      <GridCell
                        key={`${rowIdx}-${colIdx}`}
                        cell={cell}
                        isStart={cell.isStart}
                        isEnd={cell.isEnd}
                        isWall={cell.isWall}
                        isVisited={isVisited}
                        isPath={isPath}
                        isCurrent={isCurrent}
                        distance={distances[rowIdx]?.[colIdx]}
                        weight={cell.weight}
                        onClick={() => handleCellClick(rowIdx, colIdx)}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
              <div className="text-2xl font-bold text-emerald-700">{visitedNodes.length}</div>
              <div className="text-sm text-emerald-600">Cells Explored</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">{pathNodes.length}</div>
              <div className="text-sm text-blue-600">Path Length</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
              <div className="text-2xl font-bold text-amber-700">
                {calculatePathCost()}
              </div>
              <div className="text-sm text-amber-600">
                {algorithm === 'dijkstra' ? 'Total Cost' : 'Steps'}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="text-2xl font-bold text-purple-700">
                {algorithm === 'dfs' ? 'DFS' :
                 algorithm === 'bfs' ? 'BFS' :
                 'Dijkstra'}
              </div>
              <div className="text-sm text-purple-600">Algorithm</div>
            </div>
          </div>
        </div>
        
        {/* Algorithm Comparison */}
        <AlgorithmComparison isWeighted={isWeighted} />
        
        {/* Legend */}
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-8 h-8 rounded bg-green-500"></div>
              <div>
                <div className="font-bold text-gray-700">Start</div>
                <div className="text-sm text-gray-500">Mouse position</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-8 h-8 rounded bg-red-500"></div>
              <div>
                <div className="font-bold text-gray-700">End</div>
                <div className="text-sm text-gray-500">Cheese position</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-8 h-8 rounded bg-amber-100 relative">
                <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full"></div>
              </div>
              <div>
                <div className="font-bold text-gray-700">Weighted Cell</div>
                <div className="text-sm text-gray-500">Costs 3 to traverse</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-8 h-8 rounded bg-yellow-500 animate-pulse"></div>
              <div>
                <div className="font-bold text-gray-700">Shortest Path</div>
                <div className="text-sm text-gray-500">Found solution</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}