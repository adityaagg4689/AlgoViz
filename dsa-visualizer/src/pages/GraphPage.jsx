import { useState, useEffect, useRef, useMemo } from "react";
import NavBar from "../components/NavBar";

const oddCenter = (size) => {
  const c = Math.floor(size / 2);
  return c % 2 === 1 ? c : c - 1;
};

const blankGrid = (rows, cols) =>
  Array(rows)
    .fill(null)
    .map((_, r) =>
      Array(cols)
        .fill(null)
        .map((_, c) => ({ row: r, col: c, isWall: true, weight: 1 }))
    );

const bfsFurthest = (grid, sr, sc) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const vis = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const q = [{ r: sr, c: sc, dist: 0 }];
  vis[sr][sc] = true;
  let best = { r: sr, c: sc, dist: 0 };
  while (q.length) {
    const { r, c, dist } = q.shift();
    if (dist > best.dist) best = { r, c, dist };
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !vis[nr][nc] && !grid[nr][nc].isWall) {
        vis[nr][nc] = true;
        q.push({ r: nr, c: nc, dist: dist + 1 });
      }
    }
  }
  return best;
};

const applyWeights = (grid, density = 0.25) => {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!grid[r][c].isWall)
        grid[r][c].weight = Math.random() < density ? 3 : 1;
};

// Punches extra openings into an otherwise "perfect" maze to create loops.
// A perfect maze (a spanning tree) has exactly ONE route between any two
// cells — which means DFS, BFS, and Dijkstra are mathematically forced to
// return identical paths every time. Braiding adds a controlled number of
// alternate routes so the algorithms can actually disagree: DFS may wander
// down a longer branch, BFS will still find the fewest steps, and Dijkstra
// will find the lowest-cost route (which can differ from BFS's once weights
// are involved).
const braidMaze = (grid, probability = 0.12) => {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (!grid[r][c].isWall) continue;
      const up = !grid[r - 1][c].isWall;
      const down = !grid[r + 1][c].isWall;
      const left = !grid[r][c - 1].isWall;
      const right = !grid[r][c + 1].isWall;
      const wouldCreateLoop = (up && down) || (left && right);
      if (wouldCreateLoop && Math.random() < probability) {
        grid[r][c].isWall = false;
      }
    }
  }
};

const generateMaze = (rows, cols, startRow, startCol, isWeighted = false) => {
  const grid = blankGrid(rows, cols);
  const dirs = [[-2,0],[0,2],[2,0],[0,-2]];
  const stack = [{ r: startRow, c: startCol }];
  grid[startRow][startCol].isWall = false;

  while (stack.length) {
    const { r, c } = stack[stack.length - 1];
    const shuffled = [...dirs].sort(() => Math.random() - 0.5);
    let moved = false;
    for (const [dr, dc] of shuffled) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isWall) {
        grid[r + dr / 2][c + dc / 2].isWall = false;
        grid[nr][nc].isWall = false;
        stack.push({ r: nr, c: nc });
        moved = true;
        break;
      }
    }
    if (!moved) stack.pop();
  }

  braidMaze(grid, 0.12);

  if (isWeighted) applyWeights(grid);

  grid[startRow][startCol].isStart = true;
  const { r: er, c: ec } = bfsFurthest(grid, startRow, startCol);
  grid[er][ec].isEnd = true;

  return { maze: grid, start: { row: startRow, col: startCol }, end: { row: er, col: ec } };
};

const generateSpiralMaze = (rows, cols, isWeighted = false) => {
  const grid = blankGrid(rows, cols);

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      grid[r][c].isWall = false;

  for (let r = 0; r < rows; r++) { grid[r][0].isWall = true; grid[r][cols-1].isWall = true; }
  for (let c = 0; c < cols; c++) { grid[0][c].isWall = true; grid[rows-1][c].isWall = true; }

  let top = 2, bot = rows - 3, left = 2, right = cols - 3;
  let side = 0;
  while (top <= bot && left <= right) {
    const gapFactor = 0.3 + Math.random() * 0.4;
    if (side === 0) {
      for (let c = left; c <= right; c++) grid[top][c].isWall = true;
      const gap = Math.floor(left + (right - left) * gapFactor);
      grid[top][gap].isWall = false;
      top += 2; side = 1;
    } else if (side === 1) {
      for (let r = top; r <= bot; r++) grid[r][right].isWall = true;
      const gap = Math.floor(top + (bot - top) * gapFactor);
      grid[gap][right].isWall = false;
      right -= 2; side = 2;
    } else if (side === 2) {
      for (let c = right; c >= left; c--) grid[bot][c].isWall = true;
      const gap = Math.floor(left + (right - left) * gapFactor);
      grid[bot][gap].isWall = false;
      bot -= 2; side = 3;
    } else {
      for (let r = bot; r >= top; r--) grid[r][left].isWall = true;
      const gap = Math.floor(top + (bot - top) * gapFactor);
      grid[gap][left].isWall = false;
      left += 2; side = 0;
    }
  }

  // Rings only connect via a single gap each by default, which still leaves
  // one forced route. Braid a few extra gaps into the rings so there are
  // real alternate paths between rings.
  braidMaze(grid, 0.08);

  if (isWeighted) applyWeights(grid, 0.2);

  const sr = 1, sc = 1;
  grid[sr][sc].isWall = false;
  grid[sr][sc].isStart = true;
  const { r: er, c: ec } = bfsFurthest(grid, sr, sc);
  grid[er][ec].isEnd = true;

  return { maze: grid, start: { row: sr, col: sc }, end: { row: er, col: ec } };
};

const generateDivisionMaze = (rows, cols, isWeighted = false) => {
  const grid = blankGrid(rows, cols);

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      grid[r][c].isWall = false;

  for (let r = 0; r < rows; r++) { grid[r][0].isWall = true; grid[r][cols-1].isWall = true; }
  for (let c = 0; c < cols; c++) { grid[0][c].isWall = true; grid[rows-1][c].isWall = true; }

  const divide = (r1, c1, r2, c2) => {
    const h = r2 - r1, w = c2 - c1;
    if (h < 2 || w < 2) return;

    const horizontal = h > w ? true : w > h ? false : Math.random() < 0.5;

    if (horizontal) {

      const wallRow = r1 + 2 * Math.floor(Math.random() * Math.floor(h / 2)) + 1;

      const passCol = c1 + 2 * Math.floor(Math.random() * Math.ceil(w / 2));
      for (let c = c1; c <= c2; c++) grid[wallRow][c].isWall = true;
      if (passCol >= c1 && passCol <= c2) grid[wallRow][passCol].isWall = false;
      divide(r1, c1, wallRow - 1, c2);
      divide(wallRow + 1, c1, r2, c2);
    } else {
      const wallCol = c1 + 2 * Math.floor(Math.random() * Math.floor(w / 2)) + 1;
      const passRow = r1 + 2 * Math.floor(Math.random() * Math.ceil(h / 2));
      for (let r = r1; r <= r2; r++) grid[r][wallCol].isWall = true;
      if (passRow >= r1 && passRow <= r2) grid[passRow][wallCol].isWall = false;
      divide(r1, c1, r2, wallCol - 1);
      divide(r1, wallCol + 1, r2, c2);
    }
  };

  divide(1, 1, rows - 2, cols - 2);

  // Each divider wall only has a single passage by default, which still
  // forces one route per room boundary. Braid in extra passages so rooms
  // have more than one way in/out, giving BFS and Dijkstra room to diverge.
  braidMaze(grid, 0.08);

  if (isWeighted) {
    const midC = Math.floor(cols / 2);
    for (let r = 1; r < rows - 1; r++)
      for (let c = 1; c < cols - 1; c++)
        if (!grid[r][c].isWall)
          grid[r][c].weight = Math.abs(c - midC) < 4 && Math.random() < 0.6 ? 3 : 1;
  }

  const sr = 1, sc = 1;
  grid[sr][sc].isStart = true;
  const { r: er, c: ec } = bfsFurthest(grid, sr, sc);
  grid[er][ec].isEnd = true;

  return { maze: grid, start: { row: sr, col: sc }, end: { row: er, col: ec } };
};

const dfs = (grid, start, end) => {
  const rows = grid.length, cols = grid[0].length;
  const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const prev = Array(rows).fill(null).map(() => Array(cols).fill(null));
  const stack = [start];
  const visitedNodesInOrder = [];
  const path = [];

  while (stack.length) {
    const cur = stack.pop();
    if (visited[cur.row][cur.col]) continue;
    visited[cur.row][cur.col] = true;
    visitedNodesInOrder.push({ row: cur.row, col: cur.col });
    if (cur.row === end.row && cur.col === end.col) break;

    const neighbors = [
      { row: cur.row - 1, col: cur.col },
      { row: cur.row, col: cur.col - 1 },
      { row: cur.row + 1, col: cur.col },
      { row: cur.row, col: cur.col + 1 },
    ].filter(
      n =>
        n.row >= 0 && n.row < rows &&
        n.col >= 0 && n.col < cols &&
        !grid[n.row][n.col].isWall &&
        !visited[n.row][n.col]
    );

    for (const n of neighbors) {
      if (prev[n.row][n.col] === null)
        prev[n.row][n.col] = { row: cur.row, col: cur.col };
      stack.push(n);
    }
  }

  let cur = end;
  while (cur && !(cur.row === start.row && cur.col === start.col)) {
    path.unshift(cur);
    cur = prev[cur.row][cur.col];
  }
  if (path.length) path.unshift(start);

  const totalCost = path.reduce((sum, n) => sum + grid[n.row][n.col].weight, 0) - grid[start.row][start.col].weight;
  return { visitedNodesInOrder, path, totalCost };
};

const bfs = (grid, start, end) => {
  const rows = grid.length, cols = grid[0].length;
  const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const prev = Array(rows).fill(null).map(() => Array(cols).fill(null));
  const q = [start];
  const visitedNodesInOrder = [];
  const path = [];

  visited[start.row][start.col] = true;

  while (q.length) {
    const cur = q.shift();
    visitedNodesInOrder.push({ row: cur.row, col: cur.col });
    if (cur.row === end.row && cur.col === end.col) break;

    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = cur.row + dr, nc = cur.col + dc;
      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        !grid[nr][nc].isWall && !visited[nr][nc]
      ) {
        visited[nr][nc] = true;
        prev[nr][nc] = { row: cur.row, col: cur.col };
        q.push({ row: nr, col: nc });
      }
    }
  }

  let cur = end;
  while (cur && !(cur.row === start.row && cur.col === start.col)) {
    path.unshift(cur);
    cur = prev[cur.row][cur.col];
  }
  if (path.length) path.unshift(start);

  const totalCost = path.reduce((sum, n) => sum + grid[n.row][n.col].weight, 0) - grid[start.row][start.col].weight;
  return { visitedNodesInOrder, path, totalCost };
};

const dijkstra = (grid, start, end) => {
  const rows = grid.length, cols = grid[0].length;
  const dist = Array(rows).fill(null).map(() => Array(cols).fill(Infinity));
  const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const prev = Array(rows).fill(null).map(() => Array(cols).fill(null));
  const visitedNodesInOrder = [];
  const path = [];

  dist[start.row][start.col] = 0;

  const pq = [{ row: start.row, col: start.col, d: 0 }];

  while (pq.length) {
    pq.sort((a, b) => a.d - b.d);
    const cur = pq.shift();
    if (visited[cur.row][cur.col]) continue;
    visited[cur.row][cur.col] = true;
    visitedNodesInOrder.push({ row: cur.row, col: cur.col });
    if (cur.row === end.row && cur.col === end.col) break;

    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = cur.row + dr, nc = cur.col + dc;
      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        !grid[nr][nc].isWall && !visited[nr][nc]
      ) {
        const nd = dist[cur.row][cur.col] + grid[nr][nc].weight;
        if (nd < dist[nr][nc]) {
          dist[nr][nc] = nd;
          prev[nr][nc] = { row: cur.row, col: cur.col };
          pq.push({ row: nr, col: nc, d: nd });
        }
      }
    }
  }

  let cur = end;
  while (cur && !(cur.row === start.row && cur.col === start.col)) {
    path.unshift(cur);
    cur = prev[cur.row][cur.col];
  }
  if (path.length) path.unshift(start);

  const totalCost = path.length ? dist[end.row][end.col] : 0;
  return { visitedNodesInOrder, path, distances: dist, totalCost };
};

const GridCell = ({ cell, isStart, isEnd, isWall, isVisited, isPath, isCurrent, showDist, weight, onClick }) => (
  <div
    onClick={onClick}
    title={weight > 1 ? `Cost: ${weight}` : "Cost: 1"}
    className={`
      w-8 h-8 md:w-10 md:h-10 flex items-center justify-center
      border transition-all duration-150 relative cursor-pointer rounded-sm
      ${isStart
        ? "bg-green-500 border-green-600"
        : isEnd
        ? "bg-red-500 border-red-600"
        : isWall
        ? "bg-gray-900 border-gray-800 hover:bg-gray-700"
        : isPath
        ? "bg-yellow-400 border-yellow-500 animate-pulse"
        : isCurrent
        ? "bg-blue-400 scale-105 border-blue-500"
        : isVisited
        ? "bg-blue-200 border-blue-300"
        : weight > 1
        ? "bg-amber-100 border-amber-300 hover:bg-amber-200"
        : "bg-gray-100 border-gray-300 hover:bg-gray-200"}
    `}
  >
    {weight > 1 && !isStart && !isEnd && !isWall && (
      <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
        {weight}
      </div>
    )}
    {showDist !== Infinity && showDist !== undefined && showDist !== 0 && (
      <span className="text-[9px] font-bold text-gray-600">{showDist}</span>
    )}
  </div>
);

const AlgorithmComparison = ({ isWeighted }) => (
  <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
    <h3 className="text-xl font-bold text-gray-800 mb-4">When to Use Which Algorithm</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            {["Algorithm","Graph Type","Shortest Path?","Time Complexity","Real-World Use"].map(h => (
              <th key={h} className="p-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="p-3 font-bold text-purple-600">DFS</td>
            <td className="p-3">Any</td>
            <td className="p-3"><span className="text-red-500">❌ No</span><div className="text-xs text-gray-500">Finds any path</div></td>
            <td className="p-3">O(V + E)</td>
            <td className="p-3">Cycle detection, topological sort</td>
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="p-3 font-bold text-blue-600">BFS</td>
            <td className="p-3">Unweighted</td>
            <td className="p-3"><span className="text-green-500">✅ Yes</span><div className="text-xs text-gray-500">By step count</div></td>
            <td className="p-3">O(V + E)</td>
            <td className="p-3">Social networks, web crawling</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="p-3 font-bold text-emerald-600">Dijkstra's</td>
            <td className="p-3">Weighted (non-neg)</td>
            <td className="p-3"><span className="text-green-500">✅ Yes</span><div className="text-xs text-gray-500">By total cost</div></td>
            <td className="p-3">O((V+E) log V)</td>
            <td className="p-3">GPS navigation, network routing</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <h4 className="font-bold text-amber-800 mb-2">💡 Key Insight: Weighted vs Unweighted</h4>
      <p className="text-amber-700 text-sm">
        {isWeighted ? (
          <><strong>Weighted mode on.</strong> BFS finds fewest steps. Dijkstra finds lowest total cost — often a different route.</>
        ) : (
          <><strong>Unweighted mode.</strong> BFS and Dijkstra produce identical paths (DFS may still differ — it doesn't search for the shortest route).</>
        )}
      </p>
    </div>
  </div>
);

const SPEEDS = { Slow: 60, Normal: 20, Fast: 4 };

export default function GraphPage() {
  const ROWS = 19;
  const COLS = 29;

  const [grid, setGrid] = useState([]);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [visitedSet, setVisitedSet] = useState(new Set());
  const [pathSet, setPathSet] = useState(new Set());
  const [currentNode, setCurrentNode] = useState(null);
  const [distances, setDistances] = useState(null);
  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);
  const [isWeighted, setIsWeighted] = useState(true);
  const [totalCost, setTotalCost] = useState(null);
  const [runResults, setRunResults] = useState({});
  const [noPathMsg, setNoPathMsg] = useState(false);
  const [speedLabel, setSpeedLabel] = useState("Normal");
  const [mazeType, setMazeType] = useState("backtracker");

  const speedRef = useRef(SPEEDS["Normal"]);
  const cancelRef = useRef(false);

  useEffect(() => { buildMaze("backtracker", true); }, []);

  const key = (r, c) => `${r},${c}`;

  const buildMaze = (type = mazeType, weighted = isWeighted) => {

    cancelRef.current = true;
    setIsVisualizing(false);

    let result;
    const cr = oddCenter(ROWS), cc = oddCenter(COLS);

    if (type === "backtracker") result = generateMaze(ROWS, COLS, cr, cc, weighted);
    else if (type === "spiral")  result = generateSpiralMaze(ROWS, COLS, weighted);
    else                          result = generateDivisionMaze(ROWS, COLS, weighted);

    setGrid(result.maze);
    setStartPos(result.start);
    setEndPos(result.end);
    setMazeType(type);
    setIsWeighted(weighted);
    setRunResults({});
    resetVisualization();
  };

  const resetVisualization = () => {
    cancelRef.current = false;
    setVisitedSet(new Set());
    setPathSet(new Set());
    setCurrentNode(null);
    setDistances(null);
    setTotalCost(null);
    setNoPathMsg(false);
    setIsVisualizing(false);
  };

  const handleCellClick = (row, col) => {
    if (isVisualizing) return;
    const cell = grid[row][col];
    if (cell.isStart || cell.isEnd) return;

    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    const c = newGrid[row][col];

    if (isWeighted) {
      if (c.isWall)        { c.isWall = false; c.weight = 1; }
      else if (c.weight === 1) { c.weight = 3; }
      else                 { c.isWall = true; c.weight = 1; }
    } else {
      c.isWall = !c.isWall;
    }

    setGrid(newGrid);
    resetVisualization();
  };

  const setSpeed = (label) => {
    setSpeedLabel(label);
    speedRef.current = SPEEDS[label];
  };

  const solveMaze = async () => {
    if (isVisualizing || !startPos || !endPos) return;

    resetVisualization();
    setIsVisualizing(true);
    cancelRef.current = false;

    let result;
    if (algorithm === "dfs")           result = dfs(grid, startPos, endPos);
    else if (algorithm === "bfs")      result = bfs(grid, startPos, endPos);
    else { result = dijkstra(grid, startPos, endPos); setDistances(result.distances); }

    const vSet = new Set();
    for (const node of result.visitedNodesInOrder) {
      if (cancelRef.current) { setIsVisualizing(false); return; }
      vSet.add(key(node.row, node.col));
      setCurrentNode(node);

      setVisitedSet(new Set(vSet));
      await new Promise(r => setTimeout(r, speedRef.current));
    }
    setCurrentNode(null);

    if (!result.path.length) {
      setNoPathMsg(true);
      setIsVisualizing(false);
      return;
    }

    const pSet = new Set();
    for (const node of result.path) {
      if (cancelRef.current) { setIsVisualizing(false); return; }
      pSet.add(key(node.row, node.col));
      setPathSet(new Set(pSet));
      await new Promise(r => setTimeout(r, speedRef.current * 2));
    }

    setTotalCost(result.totalCost);
    setRunResults(prev => ({
      ...prev,
      [algorithm]: { steps: result.path.length - 1, cost: result.totalCost }
    }));
    setIsVisualizing(false);
  };

  const distMap = useMemo(() => {
    if (!distances) return null;
    const m = new Map();
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (distances[r][c] !== Infinity) m.set(key(r, c), distances[r][c]);
    return m;
  }, [distances]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <NavBar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Maze Algorithm Visualizer
          </h1>
          <p className="text-gray-600">
            Compare DFS, BFS, and Dijkstra's on structured mazes
          </p>
        </div>

        {/* Maze Type + Weighted Toggle */}
        <div className="flex flex-col items-center gap-4 mb-6">
          {/* Maze picker */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm flex-wrap justify-center">
            <span className="text-gray-700 font-medium">Maze:</span>
            {[
              { id: "backtracker", label: "Recursive Backtracker", desc: "Classic perfect maze, braided with extra loops" },
              { id: "spiral",      label: "Spiral",                desc: "Concentric rings with braided shortcuts — shows DFS vs BFS starkly" },
              { id: "division",    label: "Room Division",         desc: "Rooms + corridors — best for Dijkstra vs BFS" },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => buildMaze(m.id, isWeighted)}
                disabled={isVisualizing}
                title={m.desc}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
                  mazeType === m.id
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Weighted toggle */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
            <span className="text-gray-700 font-medium">Terrain:</span>
            <button
              onClick={() => buildMaze(mazeType, false)}
              disabled={isVisualizing}
              className={`px-4 py-2 rounded-lg transition-all ${!isWeighted ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              Unweighted
            </button>
            <button
              onClick={() => buildMaze(mazeType, true)}
              disabled={isVisualizing}
              className={`px-4 py-2 rounded-lg transition-all ${isWeighted ? "bg-amber-500 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              Weighted
            </button>
          </div>

          {/* Speed picker */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
            <span className="text-gray-700 font-medium">Speed:</span>
            {Object.keys(SPEEDS).map(label => (
              <button
                key={label}
                onClick={() => setSpeed(label)}
                className={`px-4 py-2 rounded-lg transition-all ${speedLabel === label ? "bg-indigo-500 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {isWeighted && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg max-w-2xl text-sm text-amber-800">
              <strong>Weighted mode on:</strong> amber cells cost 3× to traverse.
              Try <em>Room Division + Weighted</em> to see BFS and Dijkstra take different paths.
            </div>
          )}
        </div>

        {/* Algorithm Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {[
            { id: "dfs",      name: "DFS",     grad: "from-purple-500 to-pink-500",    ring: "ring-purple-300" },
            { id: "bfs",      name: "BFS",     grad: "from-blue-500 to-cyan-500",      ring: "ring-blue-300"   },
            { id: "dijkstra", name: "Dijkstra",grad: "from-emerald-500 to-teal-500",   ring: "ring-emerald-300"},
          ].map(a => (
            <button
              key={a.id}
              onClick={() => setAlgorithm(a.id)}
              disabled={isVisualizing}
              className={`
                px-6 py-3 rounded-lg font-bold text-white shadow-md
                transition-all duration-200 bg-gradient-to-r ${a.grad}
                ${algorithm === a.id ? `ring-4 ring-opacity-50 scale-105 ${a.ring}` : "opacity-90 hover:opacity-100"}
                ${isVisualizing ? "cursor-not-allowed" : ""}
              `}
            >
              {a.name}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-sm">
          <button
            onClick={solveMaze}
            disabled={isVisualizing}
            className={`px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center gap-2
              ${isVisualizing ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Visualize {algorithm === "dfs" ? "DFS" : algorithm === "bfs" ? "BFS" : "Dijkstra"}
          </button>

          <button
            onClick={resetVisualization}
            disabled={isVisualizing}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg shadow-md transition-all flex items-center gap-2 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset Path
          </button>

          <button
            onClick={() => buildMaze(mazeType, isWeighted)}
            disabled={isVisualizing}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Maze
          </button>
        </div>

        {/* No-path banner */}
        {noPathMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span><strong>No path found!</strong> The maze has no route from start to end. Generate a new maze.</span>
          </div>
        )}

        {/* Grid */}
        <div className="mb-8">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-2 md:p-4 overflow-auto">
            <div className="flex justify-center">
              <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
                {grid.map((row, ri) =>
                  row.map((cell, ci) => {
                    const k = key(ri, ci);
                    return (
                      <GridCell
                        key={k}
                        cell={cell}
                        isStart={cell.isStart}
                        isEnd={cell.isEnd}
                        isWall={cell.isWall}
                        isVisited={visitedSet.has(k)}
                        isPath={pathSet.has(k)}
                        isCurrent={currentNode?.row === ri && currentNode?.col === ci}
                        showDist={distMap?.get(k)}
                        weight={cell.weight}
                        onClick={() => handleCellClick(ri, ci)}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
              <div className="text-2xl font-bold text-emerald-700">{visitedSet.size || "—"}</div>
              <div className="text-sm text-emerald-600">Cells Explored</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">{totalCost !== null ? pathSet.size - 1 : "—"}</div>
              <div className="text-sm text-blue-600">Steps in Path</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
              <div className="text-2xl font-bold text-amber-700">{totalCost !== null ? totalCost : "—"}</div>
              <div className="text-sm text-amber-600">Weighted Cost</div>
            </div>
          </div>

          {/* Cross-algorithm comparison — appears after at least one run */}
          {Object.keys(runResults).length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="text-sm font-semibold text-gray-600 mb-3">
                Algorithm Comparison — same maze
                <span className="ml-2 text-xs font-normal text-gray-400">(run all 3 to compare)</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-100">
                    <th className="text-left pb-2 font-medium">Algorithm</th>
                    <th className="text-right pb-2 font-medium">Steps</th>
                    <th className="text-right pb-2 font-medium">Weighted Cost</th>
                    <th className="text-right pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "dfs",      label: "DFS",      color: "text-purple-600", note: "any valid path" },
                    { id: "bfs",      label: "BFS",      color: "text-blue-600",   note: "fewest steps"   },
                    { id: "dijkstra", label: "Dijkstra", color: "text-emerald-600",note: "lowest cost"    },
                  ].map(({ id, label, color, note }) => {
                    const r = runResults[id];
                    const minCost = Math.min(...Object.values(runResults).map(x => x.cost));
                    const minSteps = Math.min(...Object.values(runResults).map(x => x.steps));
                    const isCurrentAlgo = id === algorithm;
                    return (
                      <tr key={id} className={`border-b border-gray-50 ${isCurrentAlgo ? "bg-gray-50" : ""}`}>
                        <td className={`py-2 font-bold ${color}`}>
                          {label}
                          <div className="text-[10px] font-normal text-gray-400">{note}</div>
                          {isCurrentAlgo && <span className="ml-1 text-xs text-gray-400">(current)</span>}
                        </td>
                        <td className="text-right py-2 tabular-nums">
                          {r ? (
                            <span className={r.steps === minSteps && Object.keys(runResults).length > 1 ? "font-bold text-blue-600" : "text-gray-700"}>
                              {r.steps}
                              {r.steps === minSteps && Object.keys(runResults).length > 1 && " ✓"}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="text-right py-2 tabular-nums">
                          {r ? (
                            <span className={r.cost === minCost && Object.keys(runResults).length > 1 ? "font-bold text-emerald-600" : "text-gray-700"}>
                              {r.cost}
                              {r.cost === minCost && Object.keys(runResults).length > 1 && " ✓"}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="text-right py-2 text-xs text-gray-400 pl-2">
                          {r && r.cost === minCost && r.steps !== minSteps && Object.keys(runResults).length > 1
                            ? "lowest cost"
                            : r && r.steps === minSteps && r.cost !== minCost && Object.keys(runResults).length > 1
                            ? "fewest steps"
                            : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {Object.keys(runResults).length === 3 &&
                (!isWeighted || Object.values(runResults).every(x => x.cost === Object.values(runResults)[0].cost)) && (
                  <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                    {!isWeighted
                      ? "Unweighted maze: all cells cost 1, so BFS and Dijkstra always tie on cost. If DFS also matches here, generate a new maze — braiding adds loops randomly, so some mazes have more alternate routes than others."
                      : "All algorithms found equal cost on this maze. Try a new Room Division maze with Weighted mode — the center cost band forces Dijkstra to take a different route."}
                  </p>
                )}
            </div>
          )}

        <AlgorithmComparison isWeighted={isWeighted} />

        {/* Legend */}
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { bg: "bg-green-500",                label: "Start",         sub: "Source node" },
              { bg: "bg-red-500",                  label: "End",           sub: "Target node" },
              { bg: "bg-amber-100 border relative",label: "Weighted Cell", sub: "Costs 3 to enter", dot: true },
              { bg: "bg-yellow-400 animate-pulse", label: "Shortest Path", sub: "Solution route" },
            ].map(({ bg, label, sub, dot }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div className={`w-8 h-8 rounded ${bg} flex-shrink-0 relative`}>
                  {dot && <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full" />}
                </div>
                <div>
                  <div className="font-bold text-gray-700">{label}</div>
                  <div className="text-sm text-gray-500">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}