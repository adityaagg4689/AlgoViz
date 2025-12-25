import { useState } from "react";
import NavBar from "../components/NavBar";
import { sleep, randomArray } from "../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";

export default function ArrayPage() {
  const [arr, setArr] = useState(randomArray());
  const [highlight, setHighlight] = useState([]);
  const [key, setKey] = useState("");
  const [runtime, setRuntime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [operationSteps, setOperationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [operationType, setOperationType] = useState("");
  const [swapIndices, setSwapIndices] = useState([]);
  const [viewMode, setViewMode] = useState("sorting");
  const [operationValue, setOperationValue] = useState("");
  const [operationIndex, setOperationIndex] = useState("");
  const [partitionIndices, setPartitionIndices] = useState([]);
  const [mergeIndices, setMergeIndices] = useState([]);
  const [pivotIndex, setPivotIndex] = useState(-1);

  const generateNewArray = () => {
    if (isAnimating) return;
    const newArray = randomArray();
    setArr(newArray);
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);
    setPartitionIndices([]);
    setMergeIndices([]);
    setPivotIndex(-1);
  };

  // Merge Sort Implementation
  const mergeSort = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperationType("merge_sort");
    const start = performance.now();
    setHighlight([]);
    setSwapIndices([]);
    setMergeIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const a = [...arr];
    const steps = [];
    const tempArray = [...a];
    
    steps.push({
      action: "start_sort",
      description: "Starting Merge Sort algorithm (Divide and Conquer)",
      array: [...a]
    });

    // Helper function for merge sort with visualization
    const mergeSortHelper = async (arr, start, end) => {
      if (start >= end) return;
      
      const mid = Math.floor((start + end) / 2);
      
      steps.push({
        action: "divide",
        start,
        mid,
        end,
        description: `Dividing array from index ${start} to ${end} (mid: ${mid})`
      });

      setMergeIndices([{ start, end }]);
      setHighlight([start, mid, end]);
      await sleep(500);

      await mergeSortHelper(arr, start, mid);
      await mergeSortHelper(arr, mid + 1, end);
      
      await merge(arr, start, mid, end);
    };

    const merge = async (arr, start, mid, end) => {
      steps.push({
        action: "merge_start",
        start,
        mid,
        end,
        description: `Merging subarrays ${start}-${mid} and ${mid + 1}-${end}`
      });

      const left = arr.slice(start, mid + 1);
      const right = arr.slice(mid + 1, end + 1);
      let i = 0, j = 0, k = start;
      
      steps.push({
        action: "merge_compare",
        description: "Comparing elements from left and right subarrays"
      });

      while (i < left.length && j < right.length) {
        steps.push({
          action: "compare_merge",
          leftIndex: start + i,
          rightIndex: mid + 1 + j,
          leftValue: left[i],
          rightValue: right[j],
          description: `Comparing ${left[i]} (left) and ${right[j]} (right)`
        });

        setHighlight([start + i, mid + 1 + j]);
        await sleep(400);

        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
          steps.push({
            action: "take_left",
            value: left[i - 1],
            index: k,
            description: `Taking ${left[i - 1]} from left subarray`
          });
        } else {
          arr[k] = right[j];
          j++;
          steps.push({
            action: "take_right",
            value: right[j - 1],
            index: k,
            description: `Taking ${right[j - 1]} from right subarray`
          });
        }
        
        setArr([...arr]);
        k++;
        await sleep(300);
      }

      // Copy remaining elements
      while (i < left.length) {
        arr[k] = left[i];
        i++;
        k++;
        setArr([...arr]);
        await sleep(200);
      }

      while (j < right.length) {
        arr[k] = right[j];
        j++;
        k++;
        setArr([...arr]);
        await sleep(200);
      }

      steps.push({
        action: "merge_complete",
        start,
        end,
        description: `Successfully merged subarray ${start}-${end}`
      });

      setHighlight([start, end]);
      setMergeIndices([{ start, end }]);
      await sleep(400);
    };

    setOperationSteps(steps);
    
    // Execute merge sort
    await mergeSortHelper(a, 0, a.length - 1);

    steps.push({
      action: "sort_complete",
      description: "Array is now fully sorted using Merge Sort!",
      array: [...a]
    });

    setOperationSteps([...steps, {
      action: "sort_complete",
      description: "Array is now fully sorted using Merge Sort!",
      array: [...a]
    }]);

    setCurrentStep(steps.length);
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  // Quick Sort Implementation
  const quickSort = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperationType("quick_sort");
    const start = performance.now();
    setHighlight([]);
    setSwapIndices([]);
    setPartitionIndices([]);
    setPivotIndex(-1);
    setOperationSteps([]);
    setCurrentStep(0);

    const a = [...arr];
    const steps = [];
    
    steps.push({
      action: "start_sort",
      description: "Starting Quick Sort algorithm (Divide and Conquer)",
      array: [...a]
    });

    const quickSortHelper = async (arr, low, high) => {
      if (low < high) {
        const pi = await partition(arr, low, high);
        
        steps.push({
          action: "partition_complete",
          pivotIndex: pi,
          description: `Partition complete. Pivot ${arr[pi]} is now at correct position ${pi}`
        });

        setPivotIndex(pi);
        setHighlight([pi]);
        await sleep(500);

        await quickSortHelper(arr, low, pi - 1);
        await quickSortHelper(arr, pi + 1, high);
      } else if (low === high) {
        steps.push({
          action: "single_element",
          index: low,
          value: arr[low],
          description: `Single element at index ${low} (${arr[low]}) is already sorted`
        });
        setHighlight([low]);
        await sleep(300);
      }
    };

    const partition = async (arr, low, high) => {
      const pivot = arr[high];
      setPivotIndex(high);
      
      steps.push({
        action: "select_pivot",
        pivotIndex: high,
        pivotValue: pivot,
        description: `Selecting pivot: ${pivot} at index ${high}`
      });

      setHighlight([high]);
      await sleep(500);

      let i = low - 1;
      
      steps.push({
        action: "start_partition",
        low,
        high,
        pivotValue: pivot,
        description: `Partitioning subarray ${low}-${high} with pivot ${pivot}`
      });

      for (let j = low; j < high; j++) {
        steps.push({
          action: "compare_pivot",
          currentIndex: j,
          pivotIndex: high,
          currentValue: arr[j],
          pivotValue: pivot,
          description: `Comparing ${arr[j]} (index ${j}) with pivot ${pivot}`
        });

        setHighlight([j, high]);
        await sleep(300);

        if (arr[j] < pivot) {
          i++;
          
          if (i !== j) {
            steps.push({
              action: "swap_partition",
              indices: [i, j],
              values: [arr[i], arr[j]],
              description: `Swapping ${arr[i]} and ${arr[j]} (both < pivot)`
            });

            [arr[i], arr[j]] = [arr[j], arr[i]];
            setSwapIndices([i, j]);
            setArr([...arr]);
            await sleep(400);
            setSwapIndices([]);
          }
        }
      }

      // Swap pivot to correct position
      steps.push({
        action: "place_pivot",
        indices: [i + 1, high],
        values: [arr[i + 1], pivot],
        description: `Placing pivot ${pivot} at correct position ${i + 1}`
      });

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      setSwapIndices([i + 1, high]);
      setArr([...arr]);
      await sleep(400);
      setSwapIndices([]);

      return i + 1;
    };

    setOperationSteps(steps);
    
    // Execute quick sort
    await quickSortHelper(a, 0, a.length - 1);

    steps.push({
      action: "sort_complete",
      description: "Array is now fully sorted using Quick Sort!",
      array: [...a]
    });

    setOperationSteps([...steps]);
    setCurrentStep(steps.length - 1);
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
    setPivotIndex(-1);
  };

  // Existing sorting algorithms (Bubble, Selection, Insertion) remain the same
  const bubbleSort = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperationType("bubble_sort");
    const start = performance.now();
    setHighlight([]);
    setSwapIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const a = [...arr];
    const steps = [];
    
    steps.push({
      action: "start_sort",
      description: "Starting Bubble Sort algorithm",
      array: [...a]
    });

    for (let i = 0; i < a.length; i++) {
      steps.push({
        action: "outer_loop",
        iteration: i + 1,
        description: `Outer loop iteration ${i + 1}/${a.length}`,
        array: [...a]
      });

      for (let j = 0; j < a.length - i - 1; j++) {
        steps.push({
          action: "compare",
          indices: [j, j + 1],
          values: [a[j], a[j + 1]],
          description: `Comparing elements at positions ${j} (${a[j]}) and ${j + 1} (${a[j + 1]})`
        });

        if (a[j] > a[j + 1]) {
          steps.push({
            action: "swap",
            indices: [j, j + 1],
            values: [a[j], a[j + 1]],
            description: `Swapping ${a[j]} and ${a[j + 1]}`
          });

          [a[j], a[j + 1]] = [a[j + 1], a[j]];
        } else {
          steps.push({
            action: "no_swap",
            indices: [j, j + 1],
            description: `No swap needed (${a[j]} ≤ ${a[j + 1]})`
          });
        }
      }

      steps.push({
        action: "sorted_element",
        index: a.length - i - 1,
        value: a[a.length - i - 1],
        description: `Element at position ${a.length - i - 1} (${a[a.length - i - 1]}) is now in correct position`
      });
    }

    steps.push({
      action: "sort_complete",
      description: "Array is now fully sorted!",
      array: [...a]
    });

    setOperationSteps(steps);

    // Animate the steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      
      if (step.action === "compare") {
        setHighlight(step.indices);
        await sleep(300);
      } else if (step.action === "swap") {
        setSwapIndices(step.indices);
        await sleep(200);
        setArr([...a]);
        setSwapIndices([]);
        await sleep(300);
      } else if (step.action === "sorted_element") {
        setHighlight([step.index]);
        await sleep(400);
      }
      
      await sleep(200);
    }

    setHighlight([]);
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const selectionSort = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperationType("selection_sort");
    const start = performance.now();
    setHighlight([]);
    setSwapIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const a = [...arr];
    const steps = [];
    
    steps.push({
      action: "start_sort",
      description: "Starting Selection Sort algorithm",
      array: [...a]
    });

    for (let i = 0; i < a.length; i++) {
      let minIdx = i;
      
      steps.push({
        action: "set_min",
        index: i,
        value: a[i],
        description: `Setting minimum at position ${i} (${a[i]})`
      });

      for (let j = i + 1; j < a.length; j++) {
        steps.push({
          action: "compare_min",
          indices: [minIdx, j],
          values: [a[minIdx], a[j]],
          description: `Comparing current minimum ${a[minIdx]} with element at ${j} (${a[j]})`
        });

        if (a[j] < a[minIdx]) {
          minIdx = j;
          steps.push({
            action: "update_min",
            index: j,
            value: a[j],
            description: `New minimum found at position ${j} (${a[j]})`
          });
        }
      }

      if (minIdx !== i) {
        steps.push({
          action: "swap",
          indices: [i, minIdx],
          values: [a[i], a[minIdx]],
          description: `Swapping ${a[i]} (position ${i}) with ${a[minIdx]} (position ${minIdx})`
        });

        [a[i], a[minIdx]] = [a[minIdx], a[i]];
      }

      steps.push({
        action: "sorted_element",
        index: i,
        value: a[i],
        description: `Element at position ${i} (${a[i]}) is now in correct position`
      });
    }

    steps.push({
      action: "sort_complete",
      description: "Array is now fully sorted!",
      array: [...a]
    });

    setOperationSteps(steps);

    // Animate the steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      
      if (step.action === "set_min" || step.action === "update_min") {
        setHighlight([step.index]);
        await sleep(400);
      } else if (step.action === "compare_min") {
        setHighlight(step.indices);
        await sleep(300);
      } else if (step.action === "swap") {
        setSwapIndices(step.indices);
        await sleep(200);
        setArr([...a]);
        setSwapIndices([]);
        await sleep(300);
      } else if (step.action === "sorted_element") {
        setHighlight([step.index]);
        await sleep(400);
      }
      
      await sleep(200);
    }

    setHighlight([]);
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const insertionSort = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperationType("insertion_sort");
    const start = performance.now();
    setHighlight([]);
    setSwapIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const a = [...arr];
    const steps = [];
    
    steps.push({
      action: "start_sort",
      description: "Starting Insertion Sort algorithm",
      array: [...a]
    });

    for (let i = 1; i < a.length; i++) {
      let key = a[i];
      let j = i - 1;
      
      steps.push({
        action: "select_key",
        index: i,
        value: key,
        description: `Selecting element at position ${i} (${key}) as key`
      });

      while (j >= 0 && a[j] > key) {
        steps.push({
          action: "compare_shift",
          indices: [j, j + 1],
          values: [a[j], key],
          description: `Comparing ${a[j]} with key (${key}) - shifting ${a[j]} to position ${j + 1}`
        });

        a[j + 1] = a[j];
        j = j - 1;
        setArr([...a]);
        await sleep(300);
      }

      a[j + 1] = key;
      steps.push({
        action: "insert_key",
        index: j + 1,
        value: key,
        description: `Inserting key (${key}) at position ${j + 1}`
      });

      setArr([...a]);
      await sleep(400);
    }

    steps.push({
      action: "sort_complete",
      description: "Array is now fully sorted!",
      array: [...a]
    });

    setOperationSteps(steps);
    setHighlight([]);
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  // Searching and Array Operations remain the same...
  const binarySearch = async () => {
    if (isAnimating || !key) return;
    
    setIsAnimating(true);
    setOperationType("binary_search");
    const start = performance.now();
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const a = [...arr].sort((x, y) => x - y);
    setArr(a);
    await sleep(500);

    let l = 0, r = a.length - 1;
    const steps = [];
    
    steps.push({
      action: "start_search",
      description: `Starting Binary Search for value ${key}`,
      target: Number(key)
    });

    steps.push({
      action: "set_bounds",
      left: l,
      right: r,
      description: `Initial search range: positions ${l} to ${r}`
    });

    while (l <= r) {
      const m = Math.floor((l + r) / 2);
      
      steps.push({
        action: "calculate_mid",
        index: m,
        value: a[m],
        description: `Calculating middle position: (${l} + ${r}) / 2 = ${m}`
      });

      steps.push({
        action: "check_mid",
        index: m,
        value: a[m],
        target: Number(key),
        description: `Checking element at position ${m}: ${a[m]}`
      });

      if (a[m] === Number(key)) {
        steps.push({
          action: "found",
          index: m,
          value: a[m],
          description: `Found ${key} at position ${m}!`
        });
        break;
      } else if (a[m] < Number(key)) {
        steps.push({
          action: "move_right",
          oldLeft: l,
          newLeft: m + 1,
          description: `${a[m]} < ${key}, searching in right half (positions ${m + 1} to ${r})`
        });
        l = m + 1;
      } else {
        steps.push({
          action: "move_left",
          oldRight: r,
          newRight: m - 1,
          description: `${a[m]} > ${key}, searching in left half (positions ${l} to ${m - 1})`
        });
        r = m - 1;
      }
    }

    if (l > r) {
      steps.push({
        action: "not_found",
        description: `Value ${key} not found in the array`
      });
    }

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      
      if (step.action === "check_mid" || step.action === "found") {
        setHighlight([step.index]);
        await sleep(600);
      } else if (step.action === "set_bounds" || step.action === "move_left" || step.action === "move_right") {
        setHighlight([step.oldLeft || step.newLeft, step.oldRight || step.newRight]);
        await sleep(500);
      }
      
      await sleep(300);
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };
  // Insert Element Function
  const insertElement = async () => {
    if (isAnimating || !operationValue || !operationIndex) return;
    
    const index = Number(operationIndex);
    if (index < 0 || index > arr.length) {
      alert(`Invalid index! Please enter a number between 0 and ${arr.length}`);
      return;
    }
    
    setIsAnimating(true);
    setOperationType("insert");
    const start = performance.now();
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const value = Number(operationValue);
    const steps = [];
    
    steps.push({
      action: "start_operation",
      description: `Starting Insert operation at index ${index} with value ${value}`,
      value,
      index
    });

    // Create new array with the inserted value
    const newArray = [...arr];
    newArray.splice(index, 0, value);

    // Animation steps for insertion
    if (index === arr.length) {
      // Insert at the end
      steps.push({
        action: "insert_at_end",
        description: `Inserting ${value} at the end of array (index ${index})`,
        value,
        index
      });
    } else {
      // Insert in the middle
      steps.push({
        action: "prepare_shift",
        description: `Shifting elements from index ${index} onwards to make space`,
        startIndex: index,
        endIndex: arr.length - 1
      });

      // Show shifting animation
      for (let i = arr.length; i > index; i--) {
        steps.push({
          action: "shift_element",
          fromIndex: i - 1,
          toIndex: i,
          value: arr[i - 1],
          description: `Shifting element ${arr[i - 1]} from index ${i - 1} to ${i}`
        });
      }

      steps.push({
        action: "make_space",
        description: `Space created at index ${index} for new element`,
        index
      });
    }

    steps.push({
      action: "place_element",
      description: `Placing value ${value} at index ${index}`,
      value,
      index
    });

    steps.push({
      action: "operation_complete",
      description: `Successfully inserted ${value} at index ${index}`,
      value,
      index
    });

    setOperationSteps(steps);

    // Animate the steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      
      if (step.action === "prepare_shift") {
        // Highlight the range to be shifted
        const indices = Array.from({ length: arr.length - index }, (_, i) => i + index);
        setHighlight(indices);
        await sleep(600);
      } else if (step.action === "shift_element") {
        // Show individual element shifting
        setHighlight([step.fromIndex, step.toIndex]);
        await sleep(300);
      } else if (step.action === "make_space") {
        setHighlight([index]);
        await sleep(400);
      } else if (step.action === "place_element") {
        setHighlight([index]);
        // Actually insert the value
        setArr(newArray);
        await sleep(500);
      }
      
      await sleep(200);
    }

    // Clear inputs
    setOperationValue("");
    setOperationIndex("");
    
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  // Delete Element Function
  const deleteElement = async () => {
    if (isAnimating || !operationIndex) return;
    
    const index = Number(operationIndex);
    if (index < 0 || index >= arr.length) {
      alert(`Invalid index! Please enter a number between 0 and ${arr.length - 1}`);
      return;
    }
    
    setIsAnimating(true);
    setOperationType("delete");
    const start = performance.now();
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const value = arr[index];
    const steps = [];
    
    steps.push({
      action: "start_operation",
      description: `Starting Delete operation at index ${index} (value: ${value})`,
      value,
      index
    });

    steps.push({
      action: "highlight_target",
      description: `Element to delete: ${value} at index ${index}`,
      value,
      index
    });

    // Create new array without the deleted element
    const newArray = [...arr];
    newArray.splice(index, 1);

    if (index < arr.length - 1) {
      // Need to shift elements
      steps.push({
        action: "prepare_shift",
        description: `Shifting elements from index ${index + 1} onwards to fill gap`,
        startIndex: index + 1,
        endIndex: arr.length - 1
      });

      // Show shifting animation
      for (let i = index; i < arr.length - 1; i++) {
        steps.push({
          action: "shift_element",
          fromIndex: i + 1,
          toIndex: i,
          value: arr[i + 1],
          description: `Shifting element ${arr[i + 1]} from index ${i + 1} to ${i}`
        });
      }
    }

    steps.push({
      action: "remove_element",
      description: `Removing ${value} from index ${index}`,
      value,
      index
    });

    steps.push({
      action: "operation_complete",
      description: `Successfully deleted ${value} from index ${index}`,
      value,
      index
    });

    setOperationSteps(steps);

    // Animate the steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      
      if (step.action === "highlight_target") {
        setHighlight([index]);
        await sleep(600);
      } else if (step.action === "prepare_shift") {
        // Highlight the range to be shifted
        const indices = Array.from({ length: arr.length - index - 1 }, (_, i) => i + index + 1);
        setHighlight(indices);
        await sleep(500);
      } else if (step.action === "shift_element") {
        // Show individual element shifting
        setHighlight([step.fromIndex, step.toIndex]);
        await sleep(400);
      } else if (step.action === "remove_element") {
        // Actually delete the element
        setArr(newArray);
        setHighlight([index]);
        await sleep(500);
      }
      
      await sleep(200);
    }

    // Clear input
    setOperationIndex("");
    
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  // Update Element Function
  const updateElement = async () => {
    if (isAnimating || !operationValue || !operationIndex) return;
    
    const index = Number(operationIndex);
    if (index < 0 || index >= arr.length) {
      alert(`Invalid index! Please enter a number between 0 and ${arr.length - 1}`);
      return;
    }
    
    setIsAnimating(true);
    setOperationType("update");
    const start = performance.now();
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const oldValue = arr[index];
    const newValue = Number(operationValue);
    const steps = [];
    
    steps.push({
      action: "start_operation",
      description: `Starting Update operation: Changing index ${index} from ${oldValue} to ${newValue}`,
      oldValue,
      newValue,
      index
    });

    steps.push({
      action: "highlight_old",
      description: `Current value at index ${index}: ${oldValue}`,
      value: oldValue,
      index
    });

    steps.push({
      action: "update_value",
      description: `Updating value from ${oldValue} to ${newValue} at index ${index}`,
      oldValue,
      newValue,
      index
    });

    steps.push({
      action: "highlight_new",
      description: `New value at index ${index}: ${newValue}`,
      value: newValue,
      index
    });

    steps.push({
      action: "operation_complete",
      description: `Successfully updated index ${index} from ${oldValue} to ${newValue}`,
      oldValue,
      newValue,
      index
    });

    setOperationSteps(steps);

    // Create new array with updated value
    const newArray = [...arr];
    newArray[index] = newValue;

    // Animate the steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      
      if (step.action === "highlight_old") {
        setHighlight([index]);
        await sleep(500);
      } else if (step.action === "update_value") {
        // Actually update the value
        setArr(newArray);
        setHighlight([index]);
        await sleep(400);
      } else if (step.action === "highlight_new") {
        setHighlight([index]);
        await sleep(400);
      }
      
      await sleep(200);
    }

    // Clear inputs
    setOperationValue("");
    setOperationIndex("");
    
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };
  const linearSearch = async () => {
    if (isAnimating || !key) return;
    
    setIsAnimating(true);
    setOperationType("linear_search");
    const start = performance.now();
    setHighlight([]);
    setOperationSteps([]);
    setCurrentStep(0);

    const steps = [];
    
    steps.push({
      action: "start_search",
      description: `Starting Linear Search for value ${key}`,
      target: Number(key)
    });

    for (let i = 0; i < arr.length; i++) {
      steps.push({
        action: "check_element",
        index: i,
        value: arr[i],
        target: Number(key),
        description: `Checking element at position ${i}: ${arr[i]}`
      });

      if (arr[i] === Number(key)) {
        steps.push({
          action: "found",
          index: i,
          value: arr[i],
          description: `Found ${key} at position ${i}!`
        });
        break;
      }
    }

    if (!steps.some(step => step.action === "found")) {
      steps.push({
        action: "not_found",
        description: `Value ${key} not found in the array`
      });
    }

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      
      if (step.action === "check_element" || step.action === "found") {
        setHighlight([step.index]);
        await sleep(500);
      }
      
      await sleep(300);
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  // Update the sorting controls section to include new algorithms
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <NavBar runtime={runtime} />
      
      <div className="p-8 max-w-7xl mx-auto">
        {/* Main Options Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                viewMode === "sorting"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setViewMode("sorting")}
              disabled={isAnimating}
            >
              📊 Sorting Algorithms
            </button>
            
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                viewMode === "searching"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setViewMode("searching")}
              disabled={isAnimating}
            >
              🔍 Searching Algorithms
            </button>
            
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                viewMode === "operations"
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setViewMode("operations")}
              disabled={isAnimating}
            >
              ⚙️ Array Operations
            </button>
          </div>
        </div>

        {/* Controls based on view mode */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
          {viewMode === "sorting" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sorting Algorithms</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  }`}
                  onClick={bubbleSort}
                  disabled={isAnimating}
                >
                  Bubble Sort
                </button>
                
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white"
                  }`}
                  onClick={selectionSort}
                  disabled={isAnimating}
                >
                  Selection Sort
                </button>
                
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  }`}
                  onClick={insertionSort}
                  disabled={isAnimating}
                >
                  Insertion Sort
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  }`}
                  onClick={mergeSort}
                  disabled={isAnimating}
                >
                  Merge Sort
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  }`}
                  onClick={quickSort}
                  disabled={isAnimating}
                >
                  Quick Sort
                </button>
              </div>
            </div>
          )}

          {viewMode === "searching" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Searching Algorithms</h3>
              <div className="flex flex-wrap items-center gap-4">
                <input
                  type="number"
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Search value"
                  disabled={isAnimating}
                />
                
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating || !key
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  }`}
                  onClick={binarySearch}
                  disabled={isAnimating || !key}
                >
                  Binary Search
                </button>
                
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating || !key
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
                  }`}
                  onClick={linearSearch}
                  disabled={isAnimating || !key}
                >
                  Linear Search
                </button>
              </div>
            </div>
          )}

          {viewMode === "operations" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Array Operations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    value={operationValue}
                    onChange={(e) => setOperationValue(e.target.value)}
                    placeholder="Enter value"
                    disabled={isAnimating}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Index (0 to {arr.length})
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    value={operationIndex}
                    onChange={(e) => setOperationIndex(e.target.value)}
                    placeholder="Enter index"
                    disabled={isAnimating}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating || !operationValue || !operationIndex
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                  }`}
                  onClick={insertElement}
                  disabled={isAnimating || !operationValue || !operationIndex}
                >
                  Insert at Index
                </button>
                
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating || !operationIndex
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                  }`}
                  onClick={deleteElement}
                  disabled={isAnimating || !operationIndex}
                >
                  Delete at Index
                </button>
                
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating || !operationValue || !operationIndex
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  }`}
                  onClick={updateElement}
                  disabled={isAnimating || !operationValue || !operationIndex}
                >
                  Update at Index
                </button>
              </div>
            </div>
          )}

          {/* Common controls */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isAnimating
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
              }`}
              onClick={generateNewArray}
              disabled={isAnimating}
            >
              🎲 Generate Random Array
            </button>
          </div>
        </div>
      

        {/* Operation Steps */}
{operationSteps.length > 0 && (
  <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      Operation Steps ({
        operationType === "bubble_sort" ? "Bubble Sort" :
        operationType === "selection_sort" ? "Selection Sort" :
        operationType === "insertion_sort" ? "Insertion Sort" :
        operationType === "merge_sort" ? "Merge Sort" :
        operationType === "quick_sort" ? "Quick Sort" :
        operationType === "binary_search" ? "Binary Search" :
        operationType === "linear_search" ? "Linear Search" :
        operationType === "insert" ? "Insert" :
        operationType === "delete" ? "Delete" : "Update"
      })
    </h3>
    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
      {operationSteps.map((step, index) => {
        // Helper function to determine border class
        const getBorderClass = () => {
          if (index !== currentStep) return "border-gray-200";
          
          if (operationType.includes("sort")) {
            return getSortBorderColor(operationType);
          } else if (operationType.includes("search")) {
            return "border-blue-500 bg-blue-50";
          } else {
            return "border-emerald-500 bg-emerald-50";
          }
        };

        // Helper function to determine background class for step number
        const getStepBgClass = () => {
          if (index !== currentStep) return "bg-gray-200 text-gray-600";
          
          if (operationType.includes("sort")) {
            return getSortBgColor(operationType) + " text-white";
          } else if (operationType.includes("search")) {
            return "bg-blue-500 text-white";
          } else {
            return "bg-emerald-500 text-white";
          }
        };

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: index <= currentStep ? 1 : 0.4, y: 0 }}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${getBorderClass()}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepBgClass()}`}>
                {index + 1}
              </div>
              <span className="text-gray-700">{step.description}</span>
              {step.value !== undefined && !step.oldValue && (
                <span className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                  Value: {step.value}
                </span>
              )}
              {step.oldValue && step.newValue && (
                <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  {step.oldValue} → {step.newValue}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
)}        {/* Array Visualization */}
        <div className="p-6 bg-white rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Array Visualization ({arr.length} elements)
          </h3>
          
          <div className="flex flex-col items-center">
            {/* Array elements as bars */}
            <div className="flex flex-wrap gap-3 items-end justify-center min-h-64 p-6">
              <AnimatePresence>
                {arr.map((value, index) => {
                  const isHighlighted = highlight.includes(index);
                  const isSwapping = swapIndices.includes(index);
                  const isPivot = pivotIndex === index;
                  const isInMergeRange = mergeIndices.some(range => index >= range.start && index <= range.end);
                  const isInPartition = partitionIndices.includes(index);
                  
                  const isSorted = operationType.includes("sort") && 
                    (operationType === "bubble_sort" && index >= arr.length - currentStep / 3) ||
                    (operationType === "selection_sort" && index <= currentStep / 3) ||
                    (operationType === "merge_sort" && isInMergeRange) ||
                    (operationType === "quick_sort" && isInPartition);
                  
                  return (
                    <motion.div
                      key={`${value}-${index}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: isHighlighted || isPivot ? 1.1 : 1,
                        backgroundColor: getBarColor(
                          isPivot, isSwapping, isHighlighted, isSorted, operationType
                        )
                      }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ 
                        duration: 0.3,
                        type: "spring",
                        stiffness: 200
                      }}
                      className="relative flex flex-col items-center"
                    >
                      {/* Value bar */}
                      <div 
                        className="w-12 rounded-lg transition-all duration-300 shadow-md"
                        style={{ height: value * 3 }}
                      >
                        <div className="h-full flex items-end justify-center p-2">
                          <span className="text-white font-bold text-lg">{value}</span>
                        </div>
                      </div>
                      
                      {/* Index label */}
                      <div className="mt-2 text-center">
                        <div className="text-sm font-medium text-gray-700">Index: {index}</div>
                        
                        {/* Special indicators */}
                        {isPivot && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-1"
                          >
                            <div className="text-xs font-bold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              PIVOT
                            </div>
                          </motion.div>
                        )}
                        
                        {isHighlighted && !isPivot && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-1"
                          >
                            <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                              operationType.includes("search") 
                                ? "bg-blue-100 text-blue-800"
                                : operationType.includes("sort")
                                ? "bg-pink-100 text-pink-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {operationType.includes("search") ? "Checking" :
                               operationType.includes("swap") ? "Swapping" :
                               operationType === "insert" ? "Inserting" :
                               operationType === "delete" ? "Deleting" : "Updating"}
                            </div>
                          </motion.div>
                        )}
                        
                        {isSorted && !isPivot && (
                          <div className="mt-1">
                            <div className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                              {operationType === "merge_sort" ? "Merged" : "Sorted"}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            {/* Algorithm-specific indicators */}
            {(operationType === "merge_sort" || operationType === "quick_sort") && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-2">
                  {operationType === "merge_sort" ? "Merge Sort Status" : "Quick Sort Status"}
                </div>
                <div className="text-sm text-blue-700">
                  {operationType === "merge_sort" 
                    ? mergeIndices.length > 0 
                      ? `Currently merging subarray ${mergeIndices[0].start}-${mergeIndices[0].end}`
                      : "Divide and Conquer in progress"
                    : pivotIndex >= 0
                    ? `Pivot: ${arr[pivotIndex]} at position ${pivotIndex}`
                    : "Partitioning in progress"}
                </div>
              </div>
            )}
            
            {/* Array info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl">
                <div className="text-sm text-pink-700 mb-1">Array Size</div>
                <div className="text-xl font-bold text-pink-800">{arr.length} elements</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                <div className="text-sm text-blue-700 mb-1">Min Value</div>
                <div className="text-xl font-bold text-blue-800">
                  {arr.length > 0 ? Math.min(...arr) : "N/A"}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl">
                <div className="text-sm text-purple-700 mb-1">Max Value</div>
                <div className="text-xl font-bold text-purple-800">
                  {arr.length > 0 ? Math.max(...arr) : "N/A"}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl">
                <div className="text-sm text-emerald-700 mb-1">Status</div>
                <div className="text-xl font-bold text-emerald-800">
                  {isAnimating ? "Animating..." : "Ready"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Visualization Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-24 rounded-lg bg-gradient-to-b from-pink-500 to-rose-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Array Element</span>
                <span className="text-xs text-gray-500">Height = value</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-24 rounded-lg bg-gradient-to-b from-blue-500 to-cyan-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Search Highlight</span>
                <span className="text-xs text-gray-500">Checking element</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-24 rounded-lg bg-gradient-to-b from-amber-500 to-orange-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Swapping</span>
                <span className="text-xs text-gray-500">During sort swap</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-24 rounded-lg bg-gradient-to-b from-green-500 to-emerald-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Pivot (Quick Sort)</span>
                <span className="text-xs text-gray-500">Current pivot element</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-24 rounded-lg bg-gradient-to-b from-purple-500 to-violet-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Sorted Position</span>
                <span className="text-xs text-gray-500">Final sorted position</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Helper functions
function getSortBorderColor(operationType) {
  switch(operationType) {
    case "bubble_sort": return "border-pink-500 bg-pink-50";
    case "selection_sort": return "border-purple-500 bg-purple-50";
    case "insertion_sort": return "border-amber-500 bg-amber-50";
    case "merge_sort": return "border-blue-500 bg-blue-50";
    case "quick_sort": return "border-green-500 bg-green-50";
    default: return "border-pink-500 bg-pink-50";
  }
}

function getSortBgColor(operationType) {
  switch(operationType) {
    case "bubble_sort": return "bg-pink-500 text-white";
    case "selection_sort": return "bg-purple-500 text-white";
    case "insertion_sort": return "bg-amber-500 text-white";
    case "merge_sort": return "bg-blue-500 text-white";
    case "quick_sort": return "bg-green-500 text-white";
    default: return "bg-pink-500 text-white";
  }
}

function getBarColor(isPivot, isSwapping, isHighlighted, isSorted, operationType) {
  if (isPivot) return "#10b981";
  if (isSwapping) return "#fbbf24";
  if (isHighlighted) {
    if (operationType?.includes("search")) return "#60a5fa";
    if (operationType?.includes("sort")) return "#ec4899";
    if (operationType === "insert") return "#10b981";
    if (operationType === "delete") return "#f43f5e";
    if (operationType === "update") return "#f59e0b";
    return "#10b981";
  }
  if (isSorted) return "#a78bfa";
  return "#f472b6";
}