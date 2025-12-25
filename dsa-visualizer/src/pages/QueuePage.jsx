import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { randomArray } from "../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";

export default function QueuePage() {
  const [queue, setQueue] = useState(randomArray(4));
  const [value, setValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [operationSteps, setOperationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [operationType, setOperationType] = useState("");
  const [highlightedIndices, setHighlightedIndices] = useState([]);
  const [runtime, setRuntime] = useState(0);
  
  // Circular queue states
  const [isCircular, setIsCircular] = useState(false);
  const [circularSize, setCircularSize] = useState(8);
  const [frontIndex, setFrontIndex] = useState(0);
  const [rearIndex, setRearIndex] = useState(3);
  const [circularQueue, setCircularQueue] = useState(() => {
    const arr = new Array(circularSize).fill(null);
    const initial = randomArray(4);
    initial.forEach((val, idx) => {
      arr[idx] = val;
    });
    return arr;
  });
  const [isFull, setIsFull] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  // Update empty/full status when circular queue changes
  useEffect(() => {
    if (!isCircular) return;
    
    const count = circularQueue.filter(item => item !== null).length;
    setIsFull(count === circularSize);
    setIsEmpty(count === 0);
  }, [circularQueue, circularSize, isCircular]);

  // Regular queue operations
  const enqueue = async () => {
    if (isAnimating || !value) return;
    
    if (isCircular) {
      await circularEnqueue();
      return;
    }
    
    setIsAnimating(true);
    setOperationType("enqueue");
    const start = performance.now();
    setHighlightedIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const newValue = Number(value);
    const steps = [
      {
        action: "create_value",
        value: newValue,
        description: `Creating value ${newValue} to add to queue`
      },
      {
        action: "find_rear",
        description: "Moving to rear of queue",
        index: queue.length
      },
      {
        action: "add_to_rear",
        description: `Adding ${newValue} to rear of queue`,
        value: newValue,
        index: queue.length
      },
      {
        action: "update_rear",
        description: "Updating rear pointer to new position",
        index: queue.length
      },
      {
        action: "enqueue_complete",
        description: `Successfully enqueued ${newValue}!`,
        value: newValue
      }
    ];

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      if (steps[i].action === "find_rear") {
        setHighlightedIndices([...Array(queue.length).keys()]);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (steps[i].action === "add_to_rear") {
        setQueue(prev => [...prev, newValue]);
        setHighlightedIndices([queue.length]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setValue("");
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const dequeue = async () => {
    if (isAnimating || (isCircular ? isEmpty : queue.length === 0)) return;
    
    if (isCircular) {
      await circularDequeue();
      return;
    }
    
    setIsAnimating(true);
    setOperationType("dequeue");
    const start = performance.now();
    setHighlightedIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const frontValue = queue[0];
    const steps = [
      {
        action: "check_empty",
        description: "Checking if queue is empty...",
        isEmpty: queue.length === 0
      },
      {
        action: "access_front",
        description: `Accessing front element: ${frontValue}`,
        value: frontValue,
        index: 0
      },
      {
        action: "highlight_front",
        description: "Front element ready for removal",
        index: 0
      },
      {
        action: "remove_element",
        description: `Removing ${frontValue} from front`,
        value: frontValue
      },
      {
        action: "shift_elements",
        description: "Shifting all elements forward (FIFO)",
        queueSize: queue.length - 1
      },
      {
        action: "update_front",
        description: "Front pointer now points to next element",
        index: 0
      },
      {
        action: "dequeue_complete",
        description: `Successfully dequeued ${frontValue}!`,
        value: frontValue
      }
    ];

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      if (steps[i].action === "highlight_front") {
        setHighlightedIndices([0]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      if (steps[i].action === "remove_element") {
        setHighlightedIndices([0]);
        await new Promise(resolve => setTimeout(resolve, 300));
        setQueue(prev => prev.slice(1));
      }
      
      if (steps[i].action === "shift_elements") {
        const indices = [...Array(queue.length - 1).keys()].map(i => i + 1);
        setHighlightedIndices(indices);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      if (steps[i].action === "update_front" && queue.length > 1) {
        setHighlightedIndices([0]);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const peekFront = async () => {
    if (isAnimating || (isCircular ? isEmpty : queue.length === 0)) return;
    
    if (isCircular) {
      await circularPeekFront();
      return;
    }
    
    setIsAnimating(true);
    setOperationType("peek_front");
    const start = performance.now();
    setHighlightedIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const frontValue = queue[0];
    const steps = [
      {
        action: "check_empty",
        description: "Checking if queue is empty...",
        isEmpty: queue.length === 0
      },
      {
        action: "access_front",
        description: `Accessing front element without removing`,
        value: frontValue,
        index: 0
      },
      {
        action: "highlight_front",
        description: `Front element is ${frontValue}`,
        value: frontValue,
        index: 0
      },
      {
        action: "peek_complete",
        description: `Front element: ${frontValue}`,
        value: frontValue
      }
    ];

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      if (steps[i].action === "highlight_front") {
        setHighlightedIndices([0]);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const peekRear = async () => {
    if (isAnimating || (isCircular ? isEmpty : queue.length === 0)) return;
    
    if (isCircular) {
      await circularPeekRear();
      return;
    }
    
    setIsAnimating(true);
    setOperationType("peek_rear");
    const start = performance.now();
    setHighlightedIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const rearValue = queue[queue.length - 1];
    const steps = [
      {
        action: "check_empty",
        description: "Checking if queue is empty...",
        isEmpty: queue.length === 0
      },
      {
        action: "traverse_to_rear",
        description: "Traversing to rear of queue...",
        indices: [...Array(queue.length).keys()]
      },
      {
        action: "access_rear",
        description: `Accessing rear element: ${rearValue}`,
        value: rearValue,
        index: queue.length - 1
      },
      {
        action: "highlight_rear",
        description: `Rear element is ${rearValue}`,
        value: rearValue,
        index: queue.length - 1
      },
      {
        action: "peek_complete",
        description: `Rear element: ${rearValue}`,
        value: rearValue
      }
    ];

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      if (steps[i].action === "traverse_to_rear") {
        for (let j = 0; j < queue.length; j++) {
          setHighlightedIndices([j]);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      if (steps[i].action === "highlight_rear") {
        setHighlightedIndices([queue.length - 1]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  // Circular Queue Operations
  const circularEnqueue = async () => {
    if (isFull) {
      alert("Circular queue is full!");
      return;
    }
    
    setIsAnimating(true);
    setOperationType("circular_enqueue");
    const start = performance.now();
    setHighlightedIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const newValue = Number(value);
    const nextRear = (rearIndex + 1) % circularSize;
    
    const steps = [
      {
        action: "check_full",
        description: `Checking if circular queue is full...`,
        isFull,
        availableSlots: circularSize - circularQueue.filter(item => item !== null).length
      },
      {
        action: "calculate_next_position",
        description: `Calculating next rear position: (${rearIndex} + 1) % ${circularSize} = ${nextRear}`,
        currentRear: rearIndex,
        nextRear,
        formula: `(rear + 1) % size`
      },
      {
        action: "move_to_position",
        description: `Moving to position ${nextRear}`,
        index: nextRear
      },
      {
        action: "add_element",
        description: `Adding ${newValue} to position ${nextRear}`,
        value: newValue,
        index: nextRear
      },
      {
        action: "update_rear_pointer",
        description: `Updating rear pointer from ${rearIndex} to ${nextRear}`,
        oldRear: rearIndex,
        newRear: nextRear
      },
      {
        action: "enqueue_complete",
        description: `Successfully enqueued ${newValue} at position ${nextRear}!`,
        value: newValue
      }
    ];

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      if (steps[i].action === "move_to_position") {
        // Animate moving to the position
        const path = [];
        let current = rearIndex;
        while (current !== nextRear) {
          path.push(current);
          current = (current + 1) % circularSize;
        }
        path.push(nextRear);
        
        for (const idx of path) {
          setHighlightedIndices([idx]);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      if (steps[i].action === "add_element") {
        setCircularQueue(prev => {
          const newQueue = [...prev];
          newQueue[nextRear] = newValue;
          return newQueue;
        });
        setHighlightedIndices([nextRear]);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (steps[i].action === "update_rear_pointer") {
        setRearIndex(nextRear);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setValue("");
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const circularDequeue = async () => {
    if (isEmpty) {
      alert("Circular queue is empty!");
      return;
    }
    
    setIsAnimating(true);
    setOperationType("circular_dequeue");
    const start = performance.now();
    setHighlightedIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const frontValue = circularQueue[frontIndex];
    const nextFront = (frontIndex + 1) % circularSize;
    
    const steps = [
      {
        action: "check_empty",
        description: "Checking if circular queue is empty...",
        isEmpty
      },
      {
        action: "access_front",
        description: `Accessing front element at position ${frontIndex}: ${frontValue}`,
        value: frontValue,
        index: frontIndex
      },
      {
        action: "highlight_front",
        description: `Front element ${frontValue} ready for removal`,
        index: frontIndex
      },
      {
        action: "remove_element",
        description: `Removing ${frontValue} from position ${frontIndex}`,
        value: frontValue,
        index: frontIndex
      },
      {
        action: "calculate_next_front",
        description: `Calculating next front position: (${frontIndex} + 1) % ${circularSize} = ${nextFront}`,
        currentFront: frontIndex,
        nextFront,
        formula: `(front + 1) % size`
      },
      {
        action: "update_front_pointer",
        description: `Updating front pointer from ${frontIndex} to ${nextFront}`,
        oldFront: frontIndex,
        newFront: nextFront
      },
      {
        action: "dequeue_complete",
        description: `Successfully dequeued ${frontValue}! New front at position ${nextFront}`,
        value: frontValue
      }
    ];

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      if (steps[i].action === "highlight_front") {
        setHighlightedIndices([frontIndex]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      if (steps[i].action === "remove_element") {
        setCircularQueue(prev => {
          const newQueue = [...prev];
          newQueue[frontIndex] = null;
          return newQueue;
        });
        setHighlightedIndices([frontIndex]);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (steps[i].action === "update_front_pointer") {
        setFrontIndex(nextFront);
        setHighlightedIndices([nextFront]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const circularPeekFront = async () => {
    if (isEmpty) {
      alert("Circular queue is empty!");
      return;
    }
    
    setIsAnimating(true);
    setOperationType("circular_peek_front");
    const start = performance.now();
    setHighlightedIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const frontValue = circularQueue[frontIndex];
    
    const steps = [
      {
        action: "check_empty",
        description: "Checking if circular queue is empty...",
        isEmpty
      },
      {
        action: "access_front",
        description: `Accessing front element at position ${frontIndex}`,
        index: frontIndex
      },
      {
        action: "highlight_front",
        description: `Front element is ${frontValue}`,
        value: frontValue,
        index: frontIndex
      },
      {
        action: "peek_complete",
        description: `Front element: ${frontValue}`,
        value: frontValue
      }
    ];

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      if (steps[i].action === "highlight_front") {
        setHighlightedIndices([frontIndex]);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const circularPeekRear = async () => {
    if (isEmpty) {
      alert("Circular queue is empty!");
      return;
    }
    
    setIsAnimating(true);
    setOperationType("circular_peek_rear");
    const start = performance.now();
    setHighlightedIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const rearValue = circularQueue[rearIndex];
    
    const steps = [
      {
        action: "check_empty",
        description: "Checking if circular queue is empty...",
        isEmpty
      },
      {
        action: "access_rear",
        description: `Accessing rear element at position ${rearIndex}`,
        index: rearIndex
      },
      {
        action: "highlight_rear",
        description: `Rear element is ${rearValue}`,
        value: rearValue,
        index: rearIndex
      },
      {
        action: "peek_complete",
        description: `Rear element: ${rearValue}`,
        value: rearValue
      }
    ];

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      if (steps[i].action === "highlight_rear") {
        setHighlightedIndices([rearIndex]);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const resetQueue = () => {
    if (isAnimating) return;
    
    if (isCircular) {
      const arr = new Array(circularSize).fill(null);
      const initial = randomArray(4);
      initial.forEach((val, idx) => {
        arr[idx] = val;
      });
      setCircularQueue(arr);
      setFrontIndex(0);
      setRearIndex(3);
    } else {
      setQueue(randomArray(4));
    }
    
    setHighlightedIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);
    setValue("");
  };

  const toggleQueueType = () => {
    if (isAnimating) return;
    
    setIsCircular(!isCircular);
    setHighlightedIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);
    setValue("");
  };

  const updateCircularSize = (size) => {
    if (isAnimating) return;
    
    setCircularSize(size);
    const arr = new Array(size).fill(null);
    const initial = randomArray(Math.min(4, size));
    initial.forEach((val, idx) => {
      arr[idx] = val;
    });
    setCircularQueue(arr);
    setFrontIndex(0);
    setRearIndex(initial.length - 1);
  };

  // Calculate circular queue statistics
  const getCircularQueueStats = () => {
    const count = circularQueue.filter(item => item !== null).length;
    const emptySlots = circularSize - count;
    const utilization = Math.round((count / circularSize) * 100);
    
    return { count, emptySlots, utilization };
  };

  const stats = isCircular ? getCircularQueueStats() : { 
    count: queue.length, 
    emptySlots: "∞", 
    utilization: "Dynamic" 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <NavBar runtime={runtime} />
      
      <div className="p-8 max-w-7xl mx-auto">
        {/* Controls */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
          {/* Queue Type Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Queue Type</h3>
                <p className="text-sm text-gray-600">Switch between regular and circular queue</p>
              </div>
              <button
                onClick={toggleQueueType}
                disabled={isAnimating}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isAnimating
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                }`}
              >
                {isCircular ? "Switch to Regular Queue" : "Switch to Circular Queue"}
              </button>
            </div>
            
            {isCircular && (
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-sm font-medium text-gray-700">Circular Queue Size:</span>
                  <div className="flex gap-2">
                    {[6, 8, 10, 12].map((size) => (
                      <button
                        key={size}
                        onClick={() => updateCircularSize(size)}
                        disabled={isAnimating}
                        className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                          circularSize === size
                            ? "bg-cyan-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Circular queue uses fixed-size array with wrap-around pointers
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value to Enqueue
            </label>
            <input
              type="number"
              className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter a value"
              disabled={isAnimating}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isAnimating || !value || (isCircular && isFull)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
              onClick={enqueue}
              disabled={isAnimating || !value || (isCircular && isFull)}
            >
              Enqueue
            </button>
            
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isAnimating || (isCircular ? isEmpty : queue.length === 0)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              }`}
              onClick={dequeue}
              disabled={isAnimating || (isCircular ? isEmpty : queue.length === 0)}
            >
              Dequeue
            </button>
            
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isAnimating || (isCircular ? isEmpty : queue.length === 0)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              onClick={peekFront}
              disabled={isAnimating || (isCircular ? isEmpty : queue.length === 0)}
            >
              Peek Front
            </button>
            
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isAnimating || (isCircular ? isEmpty : queue.length === 0)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
              onClick={peekRear}
              disabled={isAnimating || (isCircular ? isEmpty : queue.length === 0)}
            >
              Peek Rear
            </button>
            
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isAnimating
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
              onClick={resetQueue}
              disabled={isAnimating}
            >
              🎲 Random Queue
            </button>
          </div>
        </div>

        {/* Operation Steps */}
        {operationSteps.length > 0 && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Operation Steps ({
                operationType === "enqueue" ? "Enqueue" : 
                operationType === "dequeue" ? "Dequeue" : 
                operationType === "peek_front" ? "Peek Front" : 
                operationType === "peek_rear" ? "Peek Rear" :
                operationType === "circular_enqueue" ? "Circular Enqueue" :
                operationType === "circular_dequeue" ? "Circular Dequeue" :
                operationType === "circular_peek_front" ? "Circular Peek Front" : "Circular Peek Rear"
              })
            </h3>
            <div className="space-y-2">
              {operationSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: index <= currentStep ? 1 : 0.4, y: 0 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    index === currentStep
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === currentStep
                        ? "bg-amber-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{step.description}</span>
                    {step.value !== undefined && (
                      <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                        Value: {step.value}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Queue Visualization */}
        <div className="p-6 bg-white rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {isCircular ? "Circular Queue Visualization" : "Queue Visualization (FIFO - First In First Out)"}
            </h3>
            <div className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-medium">
              {isCircular ? "Circular Queue" : "Regular Queue"}
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Queue Visualization */}
            <div className="flex-1">
              {/* Front and Rear Pointers */}
              <div className="flex justify-between mb-6">
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">Front Pointer</div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl border border-blue-200">
                    <span className="text-blue-800 font-semibold">
                      {isCircular ? `FRONT: ${frontIndex}` : "FRONT"}
                    </span>
                    <div className="w-8 h-1 bg-blue-400" />
                    <div className="w-3 h-3 border-r-2 border-t-2 border-blue-400 transform rotate-45" />
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">Rear Pointer</div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl border border-purple-200">
                    <span className="text-purple-800 font-semibold">
                      {isCircular ? `REAR: ${rearIndex}` : "REAR"}
                    </span>
                    <div className="w-8 h-1 bg-purple-400" />
                    <div className="w-3 h-3 border-r-2 border-t-2 border-purple-400 transform rotate-45" />
                  </div>
                </div>
              </div>
              
{/* Circular Queue Visualization */}
              {isCircular ? (
                <div className="relative">
                  {/* Circular layout container */}
                  <div className="relative mx-auto w-[500px] h-[500px]">
                    {/* Circular background */}
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50" />
                    
                    {/* Center info */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center z-20 bg-white/80 rounded-lg px-4 py-2">
                        <div className="text-lg font-bold text-gray-800">Circular Queue</div>
                        <div className="text-sm text-gray-600">Size: {circularSize}</div>
                        <div className="text-xs text-gray-500">Wrap-around pointers</div>
                      </div>
                    </div>
                    
                    {/* Circular queue elements */}
                    {circularQueue.map((item, index) => {
                      const isHighlighted = highlightedIndices.includes(index);
                      const isFront = index === frontIndex;
                      const isRear = index === rearIndex;
                      const isEmptySlot = item === null;
                      const angle = (index * 360) / circularSize - 90; // Start from top
                      const radius = 180;
                      const x = 250 + radius * Math.cos(angle * Math.PI / 180);
                      const y = 250 + radius * Math.sin(angle * Math.PI / 180);
                      
                      // Calculate angle for arrow direction
                      const nextAngle = ((index + 1) * 360) / circularSize - 90;
                      const arrowAngle = (angle + nextAngle) / 2;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1
                          }}
                          transition={{ 
                            duration: 0.3,
                            delay: index * 0.05
                          }}
                          className={`absolute ${isHighlighted ? "z-10" : "z-0"}`}
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          {/* Position indicator */}
                          <div 
                            className="absolute left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-mono"
                            style={{
                              top: angle >= -90 && angle <= 90 ? '-24px' : 'auto',
                              bottom: angle < -90 || angle > 90 ? '-24px' : 'auto'
                            }}
                          >
                            [{index}]
                          </div>
                          
                          {/* Queue element */}
                          <div className={`relative w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            isEmptySlot
                              ? "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300"
                              : isHighlighted
                                ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg ring-4 ring-amber-300 border-amber-600"
                                : "bg-gradient-to-br from-amber-400 to-amber-500 shadow-md border-amber-500"
                          }`}>
                            {!isEmptySlot ? (
                              <div className="text-white font-bold text-xl">{item}</div>
                            ) : (
                              <div className="text-gray-400 text-xs">Empty</div>
                            )}
                            
                            {/* Front/Rear indicators */}
                            {isFront && !isEmptySlot && (
                              <div className="absolute -top-3 -left-3">
                                <div className="w-8 h-8 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                  F
                                </div>
                              </div>
                            )}
                            
                            {isRear && !isEmptySlot && (
                              <div className="absolute -bottom-3 -right-3">
                                <div className="w-8 h-8 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                  R
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {/* Draw arrows between elements */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="10"
                          refX="9"
                          refY="3"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3, 0 6" fill="#67e8f9" />
                        </marker>
                      </defs>
                      {circularQueue.map((_, index) => {
                        const angle = (index * 360) / circularSize - 90;
                        const nextAngle = ((index + 1) * 360) / circularSize - 90;
                        const radius = 180;
                        
                        const x1 = 250 + radius * Math.cos(angle * Math.PI / 180);
                        const y1 = 250 + radius * Math.sin(angle * Math.PI / 180);
                        const x2 = 250 + radius * Math.cos(nextAngle * Math.PI / 180);
                        const y2 = 250 + radius * Math.sin(nextAngle * Math.PI / 180);
                        
                        // Calculate control point for curved arrow
                        const midAngle = (angle + nextAngle) / 2;
                        const controlRadius = radius + 30;
                        const cx = 250 + controlRadius * Math.cos(midAngle * Math.PI / 180);
                        const cy = 250 + controlRadius * Math.sin(midAngle * Math.PI / 180);
                        
                        return (
                          <path
                            key={`arrow-${index}`}
                            d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                            stroke="#67e8f9"
                            strokeWidth="2"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                            opacity="0.6"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  
                  {/* Wrap-around indicator */}
                  <div className="flex justify-center gap-12 mt-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 border-2 border-cyan-300 flex items-center justify-center">
                        <div className="w-4 h-4 border-r-2 border-t-2 border-cyan-500 transform rotate-45" />
                      </div>
                      <span className="text-sm text-gray-700">Clockwise direction with wrap-around</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular Queue Visualization */
                <div className="relative">
                  <div className="absolute -inset-2 border-4 border-amber-200 rounded-2xl" />
                  
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                    <div className="text-sm text-gray-600">FIFO Flow</div>
                    <div className="flex items-center">
                      <div className="w-32 h-1 bg-amber-400" />
                      <div className="w-3 h-3 border-r-2 border-t-2 border-amber-400 transform rotate-45" />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 p-6 justify-center min-h-48">
                    <AnimatePresence>
                      {queue.map((item, index) => {
                        const isHighlighted = highlightedIndices.includes(index);
                        const isFront = index === 0;
                        const isRear = index === queue.length - 1;
                        
                        return (
                          <motion.div
                            key={`${item}-${index}`}
                            layout
                            initial={{ opacity: 0, scale: 0.9, x: -20 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1,
                              x: 0,
                              borderColor: isHighlighted ? "#f59e0b" : "#fbbf24"
                            }}
                            exit={{ opacity: 0, scale: 0.8, x: 20 }}
                            transition={{ 
                              duration: 0.3,
                              type: "spring",
                              stiffness: 200
                            }}
                            className="relative"
                          >
                            <div className={`relative w-32 h-32 rounded-xl border-2 transition-all duration-300 ${
                              isHighlighted
                                ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg ring-4 ring-amber-300"
                                : "bg-gradient-to-br from-amber-400 to-amber-500 shadow-md"
                            }`}>
                              <div className="h-full flex flex-col items-center justify-center p-4">
                                <div className="text-3xl font-bold text-white mb-2">
                                  {item}
                                </div>
                                <div className="text-sm text-amber-100">
                                  Position: {index}
                                </div>
                              </div>
                              
                              {index < queue.length - 1 && (
                                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                                  <div className="w-8 h-1 bg-amber-300" />
                                  <div className="absolute right-0 top-1/2 w-3 h-3 border-r-2 border-t-2 border-amber-300 transform -translate-y-1/2 rotate-45" />
                                </div>
                              )}
                            </div>
                            
                            {isFront && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                              >
                                <div className="px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded-full whitespace-nowrap">
                                  FRONT
                                </div>
                              </motion.div>
                            )}
                            
                            {isRear && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                              >
                                <div className="px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded-full whitespace-nowrap">
                                  REAR
                                </div>
                              </motion.div>
                            )}
                            
                            {isHighlighted && operationType === "enqueue" && isRear && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                              >
                                <div className="px-3 py-1 bg-emerald-500 text-white text-sm font-bold rounded-full">
                                  ENQUEUE HERE
                                </div>
                              </motion.div>
                            )}
                            
                            {isHighlighted && operationType === "dequeue" && isFront && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                              >
                                <div className="px-3 py-1 bg-rose-500 text-white text-sm font-bold rounded-full">
                                  DEQUEUE FROM HERE
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    
                    {queue.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-16 text-center"
                      >
                        <div className="text-gray-400 text-lg mb-2">Queue is Empty</div>
                        <div className="text-sm text-gray-500">Enqueue some values to get started!</div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Queue Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="text-sm text-blue-700 mb-1">Front Element</div>
                  <div className="text-xl font-bold text-blue-800">
                    {isCircular 
                      ? (circularQueue[frontIndex] || "Empty")
                      : (queue.length > 0 ? queue[0] : "Empty")
                    }
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="text-sm text-purple-700 mb-1">Rear Element</div>
                  <div className="text-xl font-bold text-purple-800">
                    {isCircular 
                      ? (circularQueue[rearIndex] || "Empty")
                      : (queue.length > 0 ? queue[queue.length - 1] : "Empty")
                    }
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl">
                  <div className="text-sm text-amber-700 mb-1">Queue Size</div>
                  <div className="text-xl font-bold text-amber-800">
                    {stats.count} {isCircular ? `of ${circularSize}` : "elements"}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl">
                  <div className="text-sm text-emerald-700 mb-1">Status</div>
                  <div className="text-xl font-bold text-emerald-800">
                    {isCircular 
                      ? (isFull ? "Full" : isEmpty ? "Empty" : "Active")
                      : (queue.length === 0 ? "Empty" : "Active")
                    }
                  </div>
                </div>
              </div>
              
              {/* Circular Queue Stats */}
              {isCircular && (
                <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Circular Queue Statistics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-600">{stats.count}</div>
                      <div className="text-xs text-gray-600">Occupied</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{stats.emptySlots}</div>
                      <div className="text-xs text-gray-600">Empty Slots</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{stats.utilization}%</div>
                      <div className="text-xs text-gray-600">Utilization</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Queue Properties */}
            <div className="lg:w-80 bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                {isCircular ? "Circular Queue Properties" : "Queue Properties"}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Queue Type</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {isCircular ? "Fixed-size Circular Queue" : "Dynamic Queue"}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    {isCircular ? "Circular Buffer Principle" : "FIFO Principle"}
                  </div>
                  <div className="text-sm text-gray-700">
                    {isCircular 
                      ? "Uses fixed-size array with wrap-around pointers. When end is reached, pointers wrap around to beginning."
                      : "First In, First Out - The first element enqueued is the first one dequeued."
                    }
                  </div>
                </div>
                
                <div className="pt-4 border-t border-amber-200">
                  <div className="text-sm text-gray-600 mb-2">Operations:</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span><strong>Enqueue</strong>: {isCircular ? "Add at (rear + 1) % size" : "Add to rear"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span><strong>Dequeue</strong>: {isCircular ? "Remove from front, then (front + 1) % size" : "Remove from front"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span><strong>Peek Front</strong>: View front element</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span><strong>Peek Rear</strong>: View rear element</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-amber-200">
                  <div className="text-sm text-gray-600 mb-2">Key Characteristics:</div>
                  <ul className="space-y-1 text-xs text-gray-700">
                    {isCircular ? (
                      <>
                        <li>• Fixed size: {circularSize} slots</li>
                        <li>• O(1) time complexity for all operations</li>
                        <li>• Memory efficient (reuses space)</li>
                        <li>• No element shifting required</li>
                        <li>• Used in buffers, task scheduling, traffic systems</li>
                        <li>• Wrap-around when pointers reach array bounds</li>
                      </>
                    ) : (
                      <>
                        <li>• Dynamic size (no fixed limit)</li>
                        <li>• Elements maintain insertion order</li>
                        <li>• O(1) enqueue at rear</li>
                        <li>• O(1) dequeue from front</li>
                        <li>• Used in breadth-first search, task scheduling</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Visualization Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Queue Element</span>
                <span className="text-xs text-gray-500">Occupied slot</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Empty</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Empty Slot</span>
                <span className="text-xs text-gray-500">Available for enqueue</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-800 font-semibold text-sm">FRONT: {isCircular ? frontIndex : ""}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Front Pointer</span>
                <span className="text-xs text-gray-500">Next element to dequeue</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg border border-purple-200">
                <span className="text-purple-800 font-semibold text-sm">REAR: {isCircular ? rearIndex : ""}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Rear Pointer</span>
                <span className="text-xs text-gray-500">Last element enqueued</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}