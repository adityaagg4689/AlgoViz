import { useState, useEffect, useRef, useLayoutEffect } from "react";
import NavBar from "../components/NavBar";
import { sleep, randomArray } from "../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rabbit, Turtle,
  Search, PlusCircle, Trash2, RefreshCw,
  Play, Zap, AlertTriangle, CheckCircle,
} from "lucide-react";

class ListNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
    this.id = Math.random().toString(36).slice(2, 11);
    this.isCycleNode = false;
  }
}

const arrayToLinkedList = (arr, createCycleAt = -1) => {
  if (arr.length === 0) return null;

  const head = new ListNode(arr[0]);
  let current = head;
  let cycleNode = null;

  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i]);
    current = current.next;
    if (i === createCycleAt) cycleNode = current;
  }

  if (cycleNode) {
    current.next = cycleNode;
    cycleNode.isCycleNode = true;
  }

  return head;
};

const hasCycle = (head) => {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
};

const findCycleStart = (head) => {
  if (!hasCycle(head)) return null;

  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) break;
  }

  slow = head;
  while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
  }
  return slow;
};

const findNodeIndex = (head, targetNode) => {
  let index = 0;
  let current = head;
  while (current && current !== targetNode) {
    current = current.next;
    index++;
  }
  return current === targetNode ? index : -1;
};

export default function LinkedListPage() {
  const [list, setList] = useState([1, 2, 3, 4, 5]);
  const [value, setValue] = useState("");
  const [position, setPosition] = useState("");
  const [highlight, setHighlight] = useState([]);
  const [runtime, setRuntime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [linkedListHead, setLinkedListHead] = useState(() => arrayToLinkedList([1, 2, 3, 4, 5]));
  const [isAnimating, setIsAnimating] = useState(false);
  const [operationSteps, setOperationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [operationType, setOperationType] = useState("");
  const [hasCycleInList, setHasCycleInList] = useState(false);
  const [cycleStartIndex, setCycleStartIndex] = useState(-1);
  const [tortoisePos, setTortoisePos] = useState(-1);
  const [harePos, setHarePos] = useState(-1);
  const [meetingPoint, setMeetingPoint] = useState(-1);
  const [cyclePath, setCyclePath] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isCycleMode, setIsCycleMode] = useState(false);
  const [cycleCreationIndex, setCycleCreationIndex] = useState(2);
  const [inputError, setInputError] = useState("");
  const rowRef = useRef(null);
  const nodeRefs = useRef([]);
  const [nodeOffsets, setNodeOffsets] = useState([]);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    nodeRefs.current.length = list.length;
    const rowRect = row.getBoundingClientRect();
    const offsets = nodeRefs.current.slice(0, list.length).map((el) => {
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return rect.left - rowRect.left + rect.width / 2;
    });
    setNodeOffsets(offsets);
  }, [list, highlight, isCycleMode, cyclePath]);

  // Live elapsed-time ticker while any operation is animating
  useEffect(() => {
    if (!isAnimating) return;
    const startedAt = performance.now();
    setElapsed(0);
    const id = setInterval(() => setElapsed(Math.round(performance.now() - startedAt)), 50);
    return () => clearInterval(id);
  }, [isAnimating]);

  // Rebuild the real linked-list chain whenever the displayed array changes
  useEffect(() => {
    const head = arrayToLinkedList(list, isCycleMode ? cycleCreationIndex : -1);
    setLinkedListHead(head);
    setHasCycleInList(hasCycle(head));

    if (!isCycleMode) {
      setCycleStartIndex(-1);
      setCyclePath([]);
      return;
    }

    const cycleStart = findCycleStart(head);
    if (!cycleStart) {
      setCycleStartIndex(-1);
      setCyclePath([]);
      return;
    }

    setCycleStartIndex(findNodeIndex(head, cycleStart));

    const path = [];
    let node = cycleStart;
    do {
      path.push(findNodeIndex(head, node));
      node = node.next;
    } while (node !== cycleStart);
    setCyclePath(path);
  }, [list, isCycleMode, cycleCreationIndex]);

  const resetAnimationState = () => {
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);
    setInputError("");
  };

  // ---------- Tortoise & Hare (Floyd's cycle detection) ----------

  const visualizeTortoiseHare = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setOperationType("cycle_detection");
    setRuntime(0);
    resetAnimationState();
    setTortoisePos(0);
    setHarePos(0);
    setMeetingPoint(-1);
    const startTime = performance.now();

    const steps = [{
      action: "initialize",
      tortoisePos: 0,
      harePos: 0,
      description: "Initializing Tortoise 🐢 and Hare 🐇 at the head of the list",
    }];

    const head = linkedListHead;
    let tortoise = head;
    let hare = head;
    let stepCount = 0;

    // Cap traversal at a safe bound even in cyclic lists
    const nodePositions = [];
    {
      let current = head;
      while (current && nodePositions.length < 200) {
        nodePositions.push(current);
        current = current.next;
        if (nodePositions.includes(current)) break;
      }
    }
    const getNodeIndex = (node) => (node ? nodePositions.indexOf(node) : -1);

    let cycleDetected = false;

    while (hare && hare.next) {
      stepCount++;

      steps.push({
        action: "tortoise_move",
        tortoisePos: getNodeIndex(tortoise),
        harePos: getNodeIndex(hare),
        description: `Step ${stepCount}: Tortoise 🐢 moves 1 step to position ${getNodeIndex(tortoise)}`,
      });

      hare = hare.next;
      steps.push({
        action: "hare_move",
        tortoisePos: getNodeIndex(tortoise),
        harePos: getNodeIndex(hare),
        description: `Step ${stepCount}: Hare 🐇 moves 1st step to position ${getNodeIndex(hare)}`,
      });

      if (!hare) break;

      hare = hare.next;
      steps.push({
        action: "hare_move",
        tortoisePos: getNodeIndex(tortoise),
        harePos: getNodeIndex(hare),
        description: `Step ${stepCount}: Hare 🐇 moves 2nd step to position ${getNodeIndex(hare)}`,
      });

      tortoise = tortoise.next;

      if (tortoise === hare) {
        cycleDetected = true;
        const meetIndex = getNodeIndex(tortoise);
        steps.push({
          action: "meeting_point",
          tortoisePos: meetIndex,
          harePos: meetIndex,
          meetingPoint: meetIndex,
          description: `🎉 Tortoise and Hare meet at position ${meetIndex}! Cycle detected!`,
        });

        let seeker = head;
        while (seeker !== hare) {
          steps.push({
            action: "find_cycle_start",
            tortoisePos: getNodeIndex(seeker),
            harePos: getNodeIndex(hare),
            description: "Moving both one step to find cycle start...",
          });
          seeker = seeker.next;
          hare = hare.next;
        }

        steps.push({
          action: "cycle_start_found",
          cycleStart: getNodeIndex(seeker),
          description: `✨ Cycle starts at position ${getNodeIndex(seeker)}!`,
        });
        break;
      }
    }

    if (!cycleDetected) {
      steps.push({ action: "no_cycle", description: "List traversal completed. No cycle detected! ✅" });
    }

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];

      if (step.action === "initialize" || step.action === "tortoise_move" || step.action === "hare_move" || step.action === "find_cycle_start") {
        setTortoisePos(step.tortoisePos);
        setHarePos(step.harePos);
        setHighlight([step.tortoisePos, step.harePos]);
      } else if (step.action === "meeting_point") {
        setMeetingPoint(step.meetingPoint);
        setHighlight([step.meetingPoint]);
      } else if (step.action === "cycle_start_found") {
        setHighlight([step.cycleStart]);
      }

      await sleep(animationSpeed);
    }

    setRuntime(Math.round(performance.now() - startTime));
    setIsAnimating(false);
  };

  // ---------- Search / Insert / Delete ----------

  const search = async () => {
    if (isAnimating || !value) return;
    setIsAnimating(true);
    setOperationType("search");
    resetAnimationState();
    const start = performance.now();

    const target = Number(value);
    const steps = [];
    const maxNodes = list.length; // bounded by the displayed list, safe even with a cycle

    let found = false;
    let node = linkedListHead;
    for (let index = 0; index < maxNodes && node; index++) {
      steps.push({ action: "visit", index, description: `Visiting node at position ${index} with value ${node.value}` });
      if (node.value === target) {
        steps.push({ action: "found", index, description: `Found ${target} at position ${index}!` });
        found = true;
        break;
      }
      node = node.next;
    }
    if (!found) {
      steps.push({ action: "not_found", description: `Value ${target} not found in the list` });
    }

    setOperationSteps(steps);
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      if (steps[i].index !== undefined) setHighlight([steps[i].index]);
      await sleep(animationSpeed);
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const insertAtEnd = async () => {
    if (isAnimating || !value) return;
    setIsAnimating(true);
    setOperationType("insert_end");
    resetAnimationState();
    const start = performance.now();

    const newValue = Number(value);
    const steps = [{ action: "create_node", description: `Creating new node with value ${newValue}` }];

    if (list.length === 0) {
      steps.push({ action: "set_head", description: "List is empty, setting new node as head" });
      setOperationSteps(steps);
      setCurrentStep(0);
      setList([newValue]);
      setValue("");
      setRuntime(Math.round(performance.now() - start));
      setIsAnimating(false);
      return;
    }

    for (let index = 0; index < list.length; index++) {
      steps.push({ action: "traverse", index, description: `Moving to next node at position ${index}` });
    }
    steps.push({ action: "reached_end", index: list.length - 1, description: `Reached end of list at position ${list.length - 1}` });
    steps.push({ action: "link_node", description: "Linking new node to the end" });

    setOperationSteps(steps);
    for (let i = 0; i < steps.length - 1; i++) {
      setCurrentStep(i);
      if (steps[i].action === "traverse") setHighlight([steps[i].index]);
      await sleep(animationSpeed);
    }

    const newArray = [...list, newValue];
    setList(newArray);
    setHighlight([newArray.length - 1]);
    setCurrentStep(steps.length - 1);

    setValue("");
    setRuntime(Math.round(performance.now() - start));
    await sleep(animationSpeed);
    setIsAnimating(false);
  };

  const insertAtPosition = async () => {
    if (isAnimating || !value || position === "") return;

    const pos = Number(position);
    if (!Number.isInteger(pos) || pos < 0 || pos > list.length) {
      setInputError(`Position must be a whole number between 0 and ${list.length}`);
      return;
    }

    setIsAnimating(true);
    setOperationType("insert_position");
    resetAnimationState();
    const start = performance.now();

    const newValue = Number(value);
    const steps = [{ action: "create_node", description: `Creating new node with value ${newValue}` }];

    if (pos === 0) {
      steps.push({ action: "insert_beginning", description: "Inserting at position 0 (beginning of list)" });
      setOperationSteps(steps);
      setCurrentStep(1);
      setList([newValue, ...list]);
      setHighlight([0]);
      setValue("");
      setPosition("");
      setRuntime(Math.round(performance.now() - start));
      await sleep(animationSpeed);
      setIsAnimating(false);
      return;
    }

    steps.push({ action: "start_traversal", description: `Starting traversal to find position ${pos}` });
    for (let index = 0; index < pos - 1; index++) {
      steps.push({ action: "traverse", index, description: `Moving to position ${index}, looking for position ${pos - 1}` });
    }
    steps.push({ action: "found_position", description: `Found insertion point at position ${pos - 1}` });
    steps.push({ action: "insert_between", index: pos, description: `Inserting new node between position ${pos - 1} and ${pos}` });

    setOperationSteps(steps);
    for (let i = 0; i < steps.length - 1; i++) {
      setCurrentStep(i);
      if (steps[i].action === "traverse") setHighlight([steps[i].index]);
      await sleep(animationSpeed);
    }

    const newArray = [...list];
    newArray.splice(pos, 0, newValue);
    setList(newArray);
    setHighlight([pos]);
    setCurrentStep(steps.length - 1);

    setValue("");
    setPosition("");
    setRuntime(Math.round(performance.now() - start));
    await sleep(animationSpeed);
    setIsAnimating(false);
  };

  const deleteValue = async () => {
    if (isAnimating || !value) return;
    setIsAnimating(true);
    setOperationType("delete");
    resetAnimationState();
    const start = performance.now();

    const targetValue = Number(value);
    const steps = [{ action: "start_search", description: `Starting search for value ${targetValue}` }];

    let foundIndex = -1;
    for (let index = 0; index < list.length; index++) {
      steps.push({
        action: "compare",
        index,
        description: `Comparing node value ${list[index]} with target ${targetValue}`,
      });

      if (list[index] === targetValue) {
        steps.push({ action: "found_delete", index, description: `Found value ${targetValue} at position ${index}` });
        steps.push({
          action: index === 0 ? "delete_head" : "delete_middle",
          index,
          description: index === 0
            ? "Deleting head node, updating head pointer"
            : `Deleting node at position ${index}, updating previous node's next pointer`,
        });
        steps.push({ action: "removed", index, description: `Successfully removed value ${targetValue}` });
        foundIndex = index;
        break;
      }
    }

    if (foundIndex === -1) {
      steps.push({ action: "not_found", description: `Value ${targetValue} not found in the list` });
    }

    setOperationSteps(steps);
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      if (step.action === "compare" || step.action === "found_delete") {
        setHighlight([step.index]);
      }
      await sleep(animationSpeed);

      if (step.action === "found_delete") {
        // Remove only the specific node found above, not every matching value
        setList((prev) => {
          const next = [...prev];
          next.splice(foundIndex, 1);
          return next;
        });
        await sleep(animationSpeed);
      }
    }

    setValue("");
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const createCycle = () => {
    if (isAnimating) return;
    setIsCycleMode((prev) => !prev);
  };

  const resetList = () => {
    if (isAnimating) return;
    const newArray = randomArray(5);
    setList(newArray);
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);
    setTortoisePos(-1);
    setHarePos(-1);
    setMeetingPoint(-1);
    setInputError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <NavBar runtime={runtime} />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Algorithm Info Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Rabbit className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Tortoise & Hare Algorithm</h2>
                <p className="text-gray-600">Floyd's Cycle Detection with Visual Animation</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center gap-1">
                  <Turtle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Tortoise: 1x speed</span>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <Rabbit className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Hare: 2x speed</span>
                </div>
              </div>

              <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                {hasCycleInList ? "🔴 Cycle Detected" : "🟢 No Cycle"}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter a value"
                disabled={isAnimating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position (for insert)</label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Enter position"
                disabled={isAnimating}
              />
            </div>
          </div>

          {inputError && (
            <div className="mb-4 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">
              {inputError}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
              }`}
              onClick={insertAtEnd}
              disabled={isAnimating || !value}
            >
              <PlusCircle className="w-4 h-4" />
              Insert at End
            </button>

            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md"
              }`}
              onClick={insertAtPosition}
              disabled={isAnimating || !value || position === ""}
            >
              <PlusCircle className="w-4 h-4" />
              Insert at Position
            </button>

            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md"
              }`}
              onClick={deleteValue}
              disabled={isAnimating || !value}
            >
              <Trash2 className="w-4 h-4" />
              Delete Value
            </button>

            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
              }`}
              onClick={search}
              disabled={isAnimating || !value}
            >
              <Search className="w-4 h-4" />
              Search Value
            </button>
          </div>

          {/* Tortoise & Hare Controls */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Tortoise & Hare Algorithm
              </h3>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Speed:</label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseInt(e.target.value, 10))}
                    className="w-32"
                  />
                  <span className="text-sm font-medium">{animationSpeed}ms</span>
                </div>

                <button
                  onClick={createCycle}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    isCycleMode ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  disabled={isAnimating}
                >
                  {isCycleMode ? "🔄 Cycle Mode On" : "Cycle Mode Off"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${
                  isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                }`}
                onClick={visualizeTortoiseHare}
                disabled={isAnimating || list.length === 0}
              >
                <Play className="w-4 h-4" />
                Run Tortoise & Hare
              </button>

              <button
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
                }`}
                onClick={resetList}
                disabled={isAnimating}
              >
                <RefreshCw className="w-4 h-4" />
                Random List
              </button>

              {isCycleMode && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <label className="text-sm text-amber-700">Cycle at node:</label>
                  <input
                    type="number"
                    min="0"
                    max={Math.max(list.length - 1, 0)}
                    value={cycleCreationIndex}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      setCycleCreationIndex(Number.isNaN(n) ? 0 : Math.min(Math.max(n, 0), Math.max(list.length - 1, 0)));
                    }}
                    className="w-16 px-2 py-1 border border-amber-300 rounded text-center text-amber-800 font-bold"
                    disabled={isAnimating}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Operation Steps */}
        {operationSteps.length > 0 && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {operationType === "cycle_detection" ? (
                  <>
                    <Zap className="w-5 h-5 text-purple-500" />
                    Tortoise & Hare Algorithm Steps
                  </>
                ) : (
                  "Operation Steps"
                )}
              </h3>
              <div className="text-sm text-gray-500">
                Step {currentStep + 1} of {operationSteps.length}
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {operationSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{
                    opacity: index <= currentStep ? 1 : 0.4,
                    y: 0,
                    scale: index === currentStep ? 1.02 : 1,
                  }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    index === currentStep
                      ? operationType === "cycle_detection"
                        ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50"
                        : "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === currentStep
                          ? operationType === "cycle_detection"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-700">{step.description}</span>
                      {step.action === "meeting_point" && (
                        <div className="mt-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded border border-green-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700">
                              Cycle detected! Meeting at position {step.meetingPoint}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Linked List Visualization with Tortoise & Hare */}
        <div className="p-6 bg-white rounded-2xl shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Linked List Visualization</h3>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Tortoise</span>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600">Hare</span>
                </div>
              </div>

              {hasCycleInList && (
                <div className="px-3 py-1 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Cycle: Node {cycleStartIndex} → Node {cyclePath[1] ?? cycleStartIndex}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            {(tortoisePos >= 0 || harePos >= 0) && (
              <div className="absolute -top-12 left-0 right-0">
                {tortoisePos >= 0 && (
                  <motion.div
                    animate={{ x: (nodeOffsets[tortoisePos] ?? 0) - 20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute top-0 left-0 flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Turtle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold text-blue-600 mt-1">Tortoise</span>
                  </motion.div>
                )}

                {harePos >= 0 && (
                  <motion.div
                    animate={{ x: (nodeOffsets[harePos] ?? 0) - 20 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute top-0 left-0 flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Rabbit className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold text-red-600 mt-1">Hare</span>
                  </motion.div>
                )}
              </div>
            )}

            {meetingPoint >= 0 && (
              <div className="absolute -top-6 left-0 right-0 flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-bold">Meeting Point: Node {meetingPoint}</span>
                  </div>
                </motion.div>
              </div>
            )}

            <div ref={rowRef} className="flex flex-wrap items-center justify-center gap-4 pt-12">
              <AnimatePresence>
                {list.map((nodeValue, index) => {
                  const isHighlighted = highlight.includes(index);
                  const isTortoisePos = tortoisePos === index;
                  const isHarePos = harePos === index;
                  const isMeetingPoint = meetingPoint === index;
                  const isCycleNode = isCycleMode && cyclePath.includes(index);
                  const isCycleStart = index === cycleStartIndex;

                  return (
                    <motion.div
                      key={`${nodeValue}-${index}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        boxShadow: isMeetingPoint
                          ? "0 0 0 8px rgba(34, 197, 94, 0.5)"
                          : isHighlighted
                          ? "0 0 0 4px rgba(59, 130, 246, 0.5)"
                          : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center"
                    >
                      <div className="relative">
                        <div
                          ref={(el) => (nodeRefs.current[index] = el)}
                          className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative z-10 ${
                            isCycleStart
                              ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
                              : isCycleNode
                              ? "bg-gradient-to-br from-pink-100 to-rose-100"
                              : isTortoisePos
                              ? "bg-gradient-to-br from-blue-100 to-cyan-100"
                              : isHarePos
                              ? "bg-gradient-to-br from-red-100 to-pink-100"
                              : isHighlighted
                              ? "bg-gradient-to-br from-blue-500 to-blue-600"
                              : "bg-gradient-to-br from-gray-100 to-gray-200"
                          }`}
                        >
                          {isCycleStart && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                          )}

                          <div className={`text-2xl font-bold ${isCycleStart || isHighlighted ? "text-white" : "text-gray-800"}`}>
                            {nodeValue}
                          </div>
                          <div className={`text-xs mt-1 ${isCycleStart ? "text-purple-100" : isHighlighted ? "text-blue-100" : "text-gray-500"}`}>
                            Node {index}
                            {isCycleStart && " (Cycle Start)"}
                          </div>
                        </div>

                        {isTortoisePos && (
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                          >
                            <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs rounded-lg whitespace-nowrap">
                              <Turtle className="w-3 h-3 inline mr-1" />
                              Tortoise
                            </div>
                          </motion.div>
                        )}

                        {isHarePos && (
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.3, repeat: Infinity }}
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                          >
                            <div className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-lg whitespace-nowrap">
                              <Rabbit className="w-3 h-3 inline mr-1" />
                              Hare
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {index < list.length - 1 && (
                        <motion.div
                          animate={{ opacity: isHighlighted ? 1 : 0.7, scale: isHighlighted ? 1.1 : 1 }}
                          className="relative"
                        >
                          {isCycleMode && cyclePath.includes(index) && (
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent"
                              />
                            </div>
                          )}

                          <div className={`w-12 h-1 ${isCycleNode ? "bg-gradient-to-r from-purple-400 to-pink-400" : "bg-gray-300"}`} />
                          <div
                            className={`absolute right-0 top-1/2 w-3 h-3 border-r-2 border-t-2 transform -translate-y-1/2 rotate-45 ${
                              isCycleNode ? "border-purple-500" : "border-gray-300"
                            }`}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isCycleMode && hasCycleInList && list.length > 0 && (
                <div className="absolute bottom-0 right-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-purple-400"
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-purple-600">
                    Cycle
                  </div>
                </div>
              )}

              {!hasCycleInList && list.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                  <div className="w-16 h-1 bg-gray-300" />
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">NULL</span>
                  </div>
                </motion.div>
              )}
            </div>

            {list.length > 0 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                  <span className="text-emerald-800 font-semibold">Head</span>
                  <div className="w-8 h-1 bg-emerald-400" />
                  <div className="w-3 h-3 border-r-2 border-t-2 border-emerald-400 transform rotate-45" />
                </div>
              </div>
            )}

            {list.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">Linked List is Empty</div>
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-800 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">NULL</span>
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-emerald-800 font-semibold">Head</span>
                    <div className="w-8 h-1 bg-emerald-400" />
                    <div className="w-3 h-3 border-r-2 border-t-2 border-emerald-400 transform rotate-45" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
            <div className="text-sm text-blue-700 mb-1">List Length</div>
            <div className="text-xl font-bold text-blue-800">{list.length} nodes</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
            <div className="text-sm text-purple-700 mb-1">Cycle Status</div>
            <div className="text-xl font-bold text-purple-800">{hasCycleInList ? "Cyclic" : "Linear"}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl">
            <div className="text-sm text-amber-700 mb-1">Time Taken</div>
            <div className="text-xl font-bold text-amber-800">
              {isAnimating ? `${elapsed}ms` : runtime > 0 ? `${runtime}ms` : "—"}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl">
            <div className="text-sm text-emerald-700 mb-1">Status</div>
            <div className="text-xl font-bold text-emerald-800">{isAnimating ? "Animating..." : "Ready"}</div>
          </div>
        </div>

        {/* Tortoise & Hare Explanation */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 shadow-lg">
            <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
              <Turtle className="w-5 h-5" />
              How Tortoise & Hare Works
            </h4>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</div>
                <span>Two pointers: <strong>Tortoise</strong> (moves 1 step) and <strong>Hare</strong> (moves 2 steps)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</div>
                <span>If there's a cycle, Hare will eventually lap Tortoise</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</div>
                <span>When they meet, we've detected a cycle</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</div>
                <span>Reset Tortoise to head, move both 1 step to find cycle start</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-lg">
            <h4 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Algorithm Complexity
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-700">Time Complexity</span>
                  <span className="font-bold text-purple-600">O(n)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-3/4" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-700">Space Complexity</span>
                  <span className="font-bold text-emerald-600">O(1)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full w-1/4" />
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">
                  <span className="font-bold text-gray-800">Real-world use:</span> Detecting infinite loops, finding duplicates,
                  cycle detection in graphs and state machines
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="p-6 bg-white rounded-2xl shadow-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Visualization Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Turtle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-700">Tortoise</div>
                <div className="text-xs text-gray-500">Moves 1 step at a time</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                <Rabbit className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-700">Hare</div>
                <div className="text-xs text-gray-500">Moves 2 steps at a time</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-gray-700">Cycle Start</div>
                <div className="text-xs text-gray-500">Where cycle begins</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
              <div className="w-8 h-8 rounded-2xl bg-gray-800 flex items-center justify-center">
                <span className="text-white text-xs font-bold">NULL</span>
              </div>
              <div>
                <div className="font-bold text-gray-700">End of List</div>
                <div className="text-xs text-gray-500">No cycle (linear)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}