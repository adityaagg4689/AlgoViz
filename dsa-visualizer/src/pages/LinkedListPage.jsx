import { useState, useEffect, useRef } from "react";
import NavBar from "../components/NavBar";
import { sleep, randomArray } from "../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rabbit, Turtle, 
  Search, PlusCircle, Trash2, RefreshCw, 
  Play, Pause, SkipForward, Circle,
  Zap, AlertTriangle, CheckCircle, XCircle
} from "lucide-react";

// Linked List Node class
class ListNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
    this.id = Math.random().toString(36).substr(2, 9);
    this.isCycleNode = false;
  }
}

// Convert array to linked list (with optional cycle)
const arrayToLinkedList = (arr, createCycleAt = -1) => {
  if (arr.length === 0) return null;
  
  let head = new ListNode(arr[0]);
  let current = head;
  let cycleNode = null;
  
  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i]);
    current = current.next;
    
    // Mark the node where cycle should start
    if (i === createCycleAt) {
      cycleNode = current;
    }
  }
  
  // Create cycle if specified
  if (cycleNode) {
    current.next = cycleNode;
    cycleNode.isCycleNode = true;
  }
  
  return head;
};

// Check if linked list has cycle
const hasCycle = (head) => {
  let slow = head;
  let fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      return true;
    }
  }
  
  return false;
};

// Find cycle start node
const findCycleStart = (head) => {
  if (!hasCycle(head)) return null;
  
  let slow = head;
  let fast = head;
  
  // Find meeting point
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      break;
    }
  }
  
  // Move slow to head and move both one step at a time
  slow = head;
  while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
  }
  
  return slow; // Cycle start node
};

export default function LinkedListPage() {
  const [list, setList] = useState([1, 2, 3, 4, 5]);
  const [value, setValue] = useState("");
  const [position, setPosition] = useState("");
  const [highlight, setHighlight] = useState([]);
  const [runtime, setRuntime] = useState(0);
  const [linkedListHead, setLinkedListHead] = useState(arrayToLinkedList([1, 2, 3, 4, 5]));
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
  const [cycleCreationIndex, setCycleCreationIndex] = useState(2); // Default cycle at index 2

  // Track animation positions
  const tortoiseRef = useRef(-1);
  const hareRef = useRef(-1);

  // Update linked list when array changes
  useEffect(() => {
    const head = arrayToLinkedList(list, isCycleMode ? cycleCreationIndex : -1);
    setLinkedListHead(head);
    setHasCycleInList(hasCycle(head));
    
    // Find cycle start if exists
    if (isCycleMode) {
      const cycleStart = findCycleStart(head);
      if (cycleStart) {
        // Find index of cycle start
        let index = 0;
        let current = head;
        while (current !== cycleStart && current) {
          current = current.next;
          index++;
        }
        setCycleStartIndex(index);
        
        // Trace cycle path
        const path = [];
        let cycleNode = cycleStart;
        do {
          path.push(findNodeIndex(head, cycleNode));
          cycleNode = cycleNode.next;
        } while (cycleNode !== cycleStart);
        setCyclePath(path);
      }
    } else {
      setCycleStartIndex(-1);
      setCyclePath([]);
    }
  }, [list, isCycleMode, cycleCreationIndex]);

  // Helper: Find index of node in list
  const findNodeIndex = (head, targetNode) => {
    let index = 0;
    let current = head;
    while (current && current !== targetNode) {
      current = current.next;
      index++;
    }
    return current === targetNode ? index : -1;
  };

  // Tortoise and Hare Algorithm Visualization
  const visualizeTortoiseHare = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperationType("cycle_detection");
    setRuntime(0);
    setHighlight([]);
    setTortoisePos(0);
    setHarePos(0);
    setMeetingPoint(-1);
    setOperationSteps([]);
    setCurrentStep(0);
    
    const startTime = performance.now();
    const steps = [];
    
    steps.push({
      action: "initialize",
      tortoisePos: 0,
      harePos: 0,
      description: "Initializing Tortoise 🐢 and Hare 🐇 at the head of the list"
    });
    
    let head = linkedListHead;
    let tortoise = head;
    let hare = head;
    let stepCount = 0;
    
    // Store node positions for animation
    const nodePositions = [];
    let current = head;
    while (current && nodePositions.length < 100) { // Prevent infinite loops
      nodePositions.push(current);
      current = current.next;
      if (nodePositions.includes(current)) break; // Found cycle
    }
    
    const getNodeIndex = (node) => {
      if (!node) return -1;
      return nodePositions.indexOf(node);
    };
    
    // Main algorithm loop
    while (hare && hare.next) {
      stepCount++;
      
      // Move tortoise one step
      steps.push({
        action: "tortoise_move",
        tortoisePos: getNodeIndex(tortoise),
        harePos: getNodeIndex(hare),
        step: stepCount,
        description: `Step ${stepCount}: Tortoise 🐢 moves 1 step to position ${getNodeIndex(tortoise)}`
      });
      
      // Move hare two steps
      hare = hare.next;
      steps.push({
        action: "hare_first_move",
        tortoisePos: getNodeIndex(tortoise),
        harePos: getNodeIndex(hare),
        step: stepCount,
        description: `Step ${stepCount}: Hare 🐇 moves 1 step to position ${getNodeIndex(hare)}`
      });
      
      if (!hare) break;
      
      hare = hare.next;
      steps.push({
        action: "hare_second_move",
        tortoisePos: getNodeIndex(tortoise),
        harePos: getNodeIndex(hare),
        step: stepCount,
        description: `Step ${stepCount}: Hare 🐇 moves 2nd step to position ${getNodeIndex(hare)}`
      });
      
      // Move tortoise after hare's second move
      tortoise = tortoise.next;
      
      // Check if they meet
      if (tortoise === hare) {
        steps.push({
          action: "meeting_point",
          tortoisePos: getNodeIndex(tortoise),
          harePos: getNodeIndex(hare),
          meetingPoint: getNodeIndex(tortoise),
          description: `🎉 Tortoise and Hare meet at position ${getNodeIndex(tortoise)}! Cycle detected!`
        });
        
        // Find cycle start
        tortoise = head;
        let findCycleSteps = 0;
        while (tortoise !== hare) {
          findCycleSteps++;
          steps.push({
            action: "find_cycle_start",
            tortoisePos: getNodeIndex(tortoise),
            harePos: getNodeIndex(hare),
            step: stepCount + findCycleSteps,
            description: `Moving both one step to find cycle start...`
          });
          
          tortoise = tortoise.next;
          hare = hare.next;
        }
        
        steps.push({
          action: "cycle_start_found",
          tortoisePos: getNodeIndex(tortoise),
          harePos: getNodeIndex(hare),
          cycleStart: getNodeIndex(tortoise),
          description: `✨ Cycle starts at position ${getNodeIndex(tortoise)}!`
        });
        
        break;
      }
      
      if (!hare || !hare.next) {
        steps.push({
          action: "no_cycle",
          description: "Hare reached the end of the list. No cycle detected! 🎯"
        });
        break;
      }
    }
    
    if (!hare || !hare.next) {
      steps.push({
        action: "no_cycle",
        description: "List traversal completed. No cycle detected! ✅"
      });
    }
    
    setOperationSteps(steps);
    
    // Animate the steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      // Update positions based on step action
      if (steps[i].action === "initialize" || 
          steps[i].action === "tortoise_move" || 
          steps[i].action === "hare_first_move" ||
          steps[i].action === "hare_second_move" ||
          steps[i].action === "find_cycle_start") {
        setTortoisePos(steps[i].tortoisePos);
        setHarePos(steps[i].harePos);
        setHighlight([steps[i].tortoisePos, steps[i].harePos]);
      }
      
      if (steps[i].action === "meeting_point") {
        setMeetingPoint(steps[i].meetingPoint);
        setHighlight([steps[i].meetingPoint]);
      }
      
      if (steps[i].action === "cycle_start_found") {
        setHighlight([steps[i].cycleStart]);
      }
      
      await sleep(animationSpeed);
    }
    
    setRuntime(Math.round(performance.now() - startTime));
    setIsAnimating(false);
  };

  // Existing operations (search, insert, delete) - keep them as is with minor updates
  const search = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperationType("search");
    const start = performance.now();
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);

    let head = linkedListHead;
    let index = 0;
    const steps = [];

    while (head) {
      steps.push({
        action: "visit",
        index,
        value: head.value,
        description: `Visiting node at position ${index} with value ${head.value}`
      });

      if (head.value === Number(value)) {
        steps.push({
          action: "found",
          index,
          value: head.value,
          description: `Found ${value} at position ${index}!`
        });
        break;
      }

      head = head.next;
      index++;
    }

    setOperationSteps(steps);

    // Animate the steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      setHighlight([steps[i].index]);
      await sleep(animationSpeed);
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const insertAtEnd = async () => {
    if (isAnimating || !value) return;
    
    setIsAnimating(true);
    setOperationType("insert_end");
    const start = performance.now();
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const newValue = Number(value);
    const steps = [];
    let head = linkedListHead;

    steps.push({
      action: "create_node",
      value: newValue,
      description: `Creating new node with value ${newValue}`
    });

    // If list is empty
    if (!head) {
      steps.push({
        action: "set_head",
        value: newValue,
        description: `List is empty, setting new node as head`
      });
      
      const newNode = new ListNode(newValue);
      setLinkedListHead(newNode);
      setList([newValue]);
      setRuntime(Math.round(performance.now() - start));
      setIsAnimating(false);
      return;
    }

    // Traverse to the end
    let index = 0;
    let current = head;
    
    while (current.next) {
      steps.push({
        action: "traverse",
        index,
        value: current.value,
        description: `Moving to next node at position ${index}`
      });
      current = current.next;
      index++;
    }

    steps.push({
      action: "reached_end",
      index,
      value: current.value,
      description: `Reached end of list at position ${index}`
    });

    steps.push({
      action: "link_node",
      index: index + 1,
      value: newValue,
      description: `Linking new node to the end`
    });

    setOperationSteps(steps);

    // Animate traversal
    for (let i = 0; i < steps.length - 1; i++) {
      setCurrentStep(i);
      if (steps[i].action === "traverse") {
        setHighlight([steps[i].index]);
      }
      await sleep(animationSpeed);
    }

    // Add new node
    const newArray = [...list, newValue];
    setList(newArray);
    setHighlight([newArray.length - 1]);

    setCurrentStep(steps.length - 1);
    setRuntime(Math.round(performance.now() - start));
    await sleep(animationSpeed);
    setIsAnimating(false);
  };

  const insertAtPosition = async () => {
    if (isAnimating || !value || !position) return;
    
    const pos = Number(position);
    if (pos < 0 || pos > list.length) {
      alert("Invalid position!");
      return;
    }

    setIsAnimating(true);
    setOperationType("insert_position");
    const start = performance.now();
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const newValue = Number(value);
    const steps = [];
    let head = linkedListHead;

    steps.push({
      action: "create_node",
      value: newValue,
      description: `Creating new node with value ${newValue}`
    });

    // Insert at beginning
    if (pos === 0) {
      steps.push({
        action: "insert_beginning",
        value: newValue,
        description: `Inserting at position 0 (beginning of list)`
      });
      
      const newArray = [newValue, ...list];
      setList(newArray);
      setHighlight([0]);
      
      setOperationSteps(steps);
      setCurrentStep(1);
      setRuntime(Math.round(performance.now() - start));
      await sleep(animationSpeed);
      setIsAnimating(false);
      return;
    }

    // Insert at specific position
    steps.push({
      action: "start_traversal",
      description: `Starting traversal to find position ${pos}`
    });

    let current = head;
    let prev = null;
    let index = 0;

    while (index < pos - 1) {
      steps.push({
        action: "traverse",
        index,
        value: current.value,
        description: `Moving to position ${index}, looking for position ${pos - 1}`
      });
      prev = current;
      current = current.next;
      index++;
    }

    steps.push({
      action: "found_position",
      index: pos - 1,
      description: `Found insertion point at position ${pos - 1}`
    });

    steps.push({
      action: "insert_between",
      index: pos,
      value: newValue,
      description: `Inserting new node between position ${pos - 1} and ${pos}`
    });

    setOperationSteps(steps);

    // Animate traversal
    for (let i = 0; i < steps.length - 1; i++) {
      setCurrentStep(i);
      if (steps[i].action === "traverse") {
        setHighlight([steps[i].index]);
      }
      await sleep(animationSpeed);
    }

    // Insert at position
    const newArray = [...list];
    newArray.splice(pos, 0, newValue);
    setList(newArray);
    setHighlight([pos]);

    setCurrentStep(steps.length - 1);
    setRuntime(Math.round(performance.now() - start));
    await sleep(animationSpeed);
    setIsAnimating(false);
  };

  const deleteValue = async () => {
    if (isAnimating || !value) return;
    
    setIsAnimating(true);
    setOperationType("delete");
    const start = performance.now();
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const targetValue = Number(value);
    const steps = [];
    let head = linkedListHead;
    let current = head;
    let prev = null;
    let index = 0;
    let found = false;

    steps.push({
      action: "start_search",
      value: targetValue,
      description: `Starting search for value ${targetValue}`
    });

    while (current) {
      steps.push({
        action: "compare",
        index,
        value: current.value,
        target: targetValue,
        description: `Comparing node value ${current.value} with target ${targetValue}`
      });

      if (current.value === targetValue) {
        steps.push({
          action: "found_delete",
          index,
          value: current.value,
          description: `Found value ${targetValue} at position ${index}`
        });

        if (index === 0) {
          steps.push({
            action: "delete_head",
            index,
            description: `Deleting head node, updating head pointer`
          });
        } else {
          steps.push({
            action: "delete_middle",
            index,
            description: `Deleting node at position ${index}, updating previous node's next pointer`
          });
        }

        steps.push({
          action: "removed",
          index,
          description: `Successfully removed value ${targetValue}`
        });

        found = true;
        break;
      }

      prev = current;
      current = current.next;
      index++;
    }

    if (!found) {
      steps.push({
        action: "not_found",
        description: `Value ${targetValue} not found in the list`
      });
    }

    setOperationSteps(steps);

    // Animate search
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      if (steps[i].action === "compare" || steps[i].action === "found_delete") {
        setHighlight([steps[i].index]);
      }
      await sleep(animationSpeed);
      
      // If found, remove from array
      if (steps[i].action === "found_delete") {
        setList(list.filter(x => x !== targetValue));
        await sleep(animationSpeed);
      }
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const createCycle = () => {
    if (isAnimating) return;
    setIsCycleMode(!isCycleMode);
  };

  const resetList = () => {
    if (isAnimating) return;
    const newArray = randomArray(5);
    setList(newArray);
    setLinkedListHead(arrayToLinkedList(newArray, isCycleMode ? cycleCreationIndex : -1));
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);
    setTortoisePos(-1);
    setHarePos(-1);
    setMeetingPoint(-1);
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position (for insert)
              </label>
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

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isAnimating
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
              }`}
              onClick={insertAtEnd}
              disabled={isAnimating}
            >
              <PlusCircle className="w-4 h-4" />
              Insert at End
            </button>
            
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isAnimating
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md"
              }`}
              onClick={insertAtPosition}
              disabled={isAnimating}
            >
              <PlusCircle className="w-4 h-4" />
              Insert at Position
            </button>
            
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isAnimating
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md"
              }`}
              onClick={deleteValue}
              disabled={isAnimating}
            >
              <Trash2 className="w-4 h-4" />
              Delete Value
            </button>
            
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isAnimating
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
              }`}
              onClick={search}
              disabled={isAnimating}
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
                    onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                    className="w-32"
                    disabled={isAnimating}
                  />
                  <span className="text-sm font-medium">{animationSpeed}ms</span>
                </div>
                
                <button
                  onClick={() => setIsCycleMode(!isCycleMode)}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    isCycleMode
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                  isAnimating
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                }`}
                onClick={visualizeTortoiseHare}
                disabled={isAnimating}
              >
                <Play className="w-4 h-4" />
                Run Tortoise & Hare
              </button>
              
              <button
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  isAnimating
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
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
                    max={list.length - 1}
                    value={cycleCreationIndex}
                    onChange={(e) => setCycleCreationIndex(parseInt(e.target.value) || 0)}
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
                    scale: index === currentStep ? 1.02 : 1
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === currentStep
                        ? operationType === "cycle_detection" 
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" 
                          : "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}>
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
            <h3 className="text-lg font-semibold text-gray-800">
              Linked List Visualization
            </h3>
            
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
                    <span>Cycle: Node {cycleStartIndex} → Node {cyclePath[1]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative">
            {/* Tortoise & Hare Indicators */}
            {(tortoisePos >= 0 || harePos >= 0) && (
              <div className="absolute -top-12 left-0 right-0 flex justify-between px-8">
                {tortoisePos >= 0 && (
                  <motion.div
                    animate={{ x: tortoisePos * 104 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Turtle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold text-blue-600 mt-1">Tortoise</span>
                  </motion.div>
                )}
                
                {harePos >= 0 && (
                  <motion.div
                    animate={{ x: harePos * 104 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Rabbit className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold text-red-600 mt-1">Hare</span>
                  </motion.div>
                )}
              </div>
            )}
            
            {/* Meeting Point Indicator */}
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
            
            {/* Linked List Nodes */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-12">
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
                            : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center"
                    >
                      {/* Node Container */}
                      <div className="relative">
                        {/* Node */}
                        <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative z-10 ${
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
                        }`}>
                          {/* Cycle start indicator */}
                          {isCycleStart && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                          )}
                          
                          <div className={`text-2xl font-bold ${
                            isCycleStart ? "text-white" :
                            isHighlighted ? "text-white" : 
                            "text-gray-800"
                          }`}>
                            {nodeValue}
                          </div>
                          <div className={`text-xs mt-1 ${
                            isCycleStart ? "text-purple-100" :
                            isHighlighted ? "text-blue-100" : 
                            "text-gray-500"
                          }`}>
                            Node {index}
                            {isCycleStart && " (Cycle Start)"}
                          </div>
                        </div>
                        
                        {/* Tortoise indicator */}
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
                        
                        {/* Hare indicator */}
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
                      
                      {/* Arrow to next node */}
                      {index < list.length - 1 && (
                        <motion.div
                          animate={{ 
                            opacity: isHighlighted ? 1 : 0.7,
                            scale: isHighlighted ? 1.1 : 1
                          }}
                          className="relative"
                        >
                          {/* Cycle arrow special styling */}
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
                          <div className={`absolute right-0 top-1/2 w-3 h-3 border-r-2 border-t-2 transform -translate-y-1/2 rotate-45 ${
                            isCycleNode ? "border-purple-500" : "border-gray-300"
                          }`} />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {/* Cycle connection arrow */}
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
              
              {/* Null indicator at the end (if no cycle) */}
              {!hasCycleInList && list.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center"
                >
                  <div className="w-16 h-1 bg-gray-300" />
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">NULL</span>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Head pointer */}
            {list.length > 0 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                  <span className="text-emerald-800 font-semibold">Head</span>
                  <div className="w-8 h-1 bg-emerald-400" />
                  <div className="w-3 h-3 border-r-2 border-t-2 border-emerald-400 transform rotate-45" />
                </div>
              </div>
            )}
            
            {/* Empty list state */}
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
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-700">Space Complexity</span>
                  <span className="font-bold text-emerald-600">O(1)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full w-1/4"></div>
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