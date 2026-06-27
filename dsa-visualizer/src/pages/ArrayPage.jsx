import { useState, useEffect, useRef } from "react";
import NavBar from "../components/NavBar";
import { sleep, randomArray } from "../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";

const SORT_COLORS = {
  bubble_sort: { border: "border-pink-500 bg-pink-50", solid: "bg-pink-500 text-white" },
  selection_sort: { border: "border-purple-500 bg-purple-50", solid: "bg-purple-500 text-white" },
  insertion_sort: { border: "border-amber-500 bg-amber-50", solid: "bg-amber-500 text-white" },
  merge_sort: { border: "border-blue-500 bg-blue-50", solid: "bg-blue-500 text-white" },
  quick_sort: { border: "border-green-500 bg-green-50", solid: "bg-green-500 text-white" },
};
const DEFAULT_SORT_COLOR = SORT_COLORS.bubble_sort;

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

const OPERATION_LABELS = {
  bubble_sort: "Bubble Sort",
  selection_sort: "Selection Sort",
  insertion_sort: "Insertion Sort",
  merge_sort: "Merge Sort",
  quick_sort: "Quick Sort",
  binary_search: "Binary Search",
  linear_search: "Linear Search",
  insert: "Insert",
  delete: "Delete",
  update: "Update",
};

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
  const [mergeIndices, setMergeIndices] = useState([]);
  const [partitionIndices, setPartitionIndices] = useState([]);
  const [pivotIndex, setPivotIndex] = useState(-1);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [inputError, setInputError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerStartRef = useRef(0);

  const resetAnimationState = () => {
    setHighlight([]);
    setSwapIndices([]);
    setMergeIndices([]);
    setPartitionIndices([]);
    setPivotIndex(-1);
    setSortedIndices([]);
    setOperationSteps([]);
    setCurrentStep(0);
    setInputError("");
  };

  const generateNewArray = () => {
    if (isAnimating) return;
    setArr(randomArray());
    resetAnimationState();
  };

  // ---------- Sorting ----------

  const runSortAnimation = async (type, runner) => {
    setIsAnimating(true);
    setOperationType(type);
    resetAnimationState();
    const start = performance.now();

    await runner();

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const bubbleSort = () =>
    runSortAnimation("bubble_sort", async () => {
      const a = [...arr];
      const steps = [{ action: "start_sort", description: "Starting Bubble Sort algorithm" }];

      for (let i = 0; i < a.length; i++) {
        steps.push({ action: "outer_loop", description: `Outer loop iteration ${i + 1}/${a.length}` });

        for (let j = 0; j < a.length - i - 1; j++) {
          steps.push({
            action: "compare",
            indices: [j, j + 1],
            description: `Comparing elements at positions ${j} (${a[j]}) and ${j + 1} (${a[j + 1]})`,
          });

          if (a[j] > a[j + 1]) {
            steps.push({
              action: "swap",
              indices: [j, j + 1],
              description: `Swapping ${a[j]} and ${a[j + 1]}`,
            });
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
          } else {
            steps.push({ action: "no_swap", indices: [j, j + 1], description: `No swap needed (${a[j]} ≤ ${a[j + 1]})` });
          }
        }

        steps.push({
          action: "sorted_element",
          index: a.length - i - 1,
          description: `Element at position ${a.length - i - 1} (${a[a.length - i - 1]}) is now in correct position`,
        });
      }

      steps.push({ action: "sort_complete", description: "Array is now fully sorted!" });
      setOperationSteps(steps);

      const sorted = [];
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
          sorted.push(step.index);
          setSortedIndices([...sorted]);
          setHighlight([step.index]);
          await sleep(400);
        }
        await sleep(200);
      }
      setHighlight([]);
    });

  const selectionSort = () =>
    runSortAnimation("selection_sort", async () => {
      const a = [...arr];
      const steps = [{ action: "start_sort", description: "Starting Selection Sort algorithm" }];

      for (let i = 0; i < a.length; i++) {
        let minIdx = i;
        steps.push({ action: "set_min", index: i, description: `Setting minimum at position ${i} (${a[i]})` });

        for (let j = i + 1; j < a.length; j++) {
          steps.push({
            action: "compare_min",
            indices: [minIdx, j],
            description: `Comparing current minimum ${a[minIdx]} with element at ${j} (${a[j]})`,
          });
          if (a[j] < a[minIdx]) {
            minIdx = j;
            steps.push({ action: "update_min", index: j, description: `New minimum found at position ${j} (${a[j]})` });
          }
        }

        if (minIdx !== i) {
          steps.push({
            action: "swap",
            indices: [i, minIdx],
            description: `Swapping ${a[i]} (position ${i}) with ${a[minIdx]} (position ${minIdx})`,
          });
          [a[i], a[minIdx]] = [a[minIdx], a[i]];
        }

        steps.push({ action: "sorted_element", index: i, description: `Element at position ${i} (${a[i]}) is now in correct position` });
      }

      steps.push({ action: "sort_complete", description: "Array is now fully sorted!" });
      setOperationSteps(steps);

      const sorted = [];
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
          sorted.push(step.index);
          setSortedIndices([...sorted]);
          setHighlight([step.index]);
          await sleep(400);
        }
        await sleep(200);
      }
      setHighlight([]);
    });

  const insertionSort = () =>
    runSortAnimation("insertion_sort", async () => {
      const a = [...arr];
      const steps = [{ action: "start_sort", description: "Starting Insertion Sort algorithm" }];

      for (let i = 1; i < a.length; i++) {
        const key = a[i];
        let j = i - 1;
        steps.push({ action: "select_key", index: i, description: `Selecting element at position ${i} (${key}) as key` });

        while (j >= 0 && a[j] > key) {
          steps.push({
            action: "compare_shift",
            indices: [j, j + 1],
            description: `Comparing ${a[j]} with key (${key}) - shifting ${a[j]} to position ${j + 1}`,
          });
          a[j + 1] = a[j];
          j -= 1;
        }
        a[j + 1] = key;
        steps.push({ action: "insert_key", index: j + 1, description: `Inserting key (${key}) at position ${j + 1}` });
      }

      steps.push({ action: "sort_complete", description: "Array is now fully sorted!" });
      setOperationSteps(steps);

      const live = [...arr];
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        const step = steps[i];

        if (step.action === "select_key") {
          setHighlight([step.index]);
          await sleep(300);
        } else if (step.action === "compare_shift") {
          const [from, to] = step.indices;
          live[to] = live[from];
          setArr([...live]);
          setHighlight(step.indices);
          await sleep(300);
        } else if (step.action === "insert_key") {
          live[step.index] = a[step.index];
          setArr([...live]);
          setHighlight([step.index]);
          await sleep(400);
        }
        await sleep(150);
      }
      setHighlight([]);
      setSortedIndices(a.map((_, i) => i));
    });

  const mergeSort = () =>
    runSortAnimation("merge_sort", async () => {
      const a = [...arr];
      const steps = [{ action: "start_sort", description: "Starting Merge Sort algorithm (Divide and Conquer)" }];

      const recordStep = async (step, delay) => {
        steps.push(step);
        setCurrentStep(steps.length - 1);
        if (delay) await sleep(delay);
      };

      const mergeSortHelper = async (start, end) => {
        if (start >= end) return;
        const mid = Math.floor((start + end) / 2);

        setMergeIndices([{ start, end }]);
        await recordStep(
          { action: "divide", description: `Dividing array from index ${start} to ${end} (mid: ${mid})` },
          0
        );
        setHighlight([start, mid, end]);
        await sleep(500);

        await mergeSortHelper(start, mid);
        await mergeSortHelper(mid + 1, end);
        await merge(start, mid, end);
      };

      const merge = async (start, mid, end) => {
        await recordStep(
          { action: "merge_start", description: `Merging subarrays ${start}-${mid} and ${mid + 1}-${end}` },
          0
        );

        const left = a.slice(start, mid + 1);
        const right = a.slice(mid + 1, end + 1);
        let i = 0, j = 0, k = start;

        while (i < left.length && j < right.length) {
          await recordStep(
            { action: "compare_merge", description: `Comparing ${left[i]} (left) and ${right[j]} (right)` },
            0
          );
          setHighlight([start + i, mid + 1 + j]);
          await sleep(400);

          if (left[i] <= right[j]) {
            a[k] = left[i];
            await recordStep({ action: "take_left", description: `Taking ${left[i]} from left subarray` }, 0);
            i++;
          } else {
            a[k] = right[j];
            await recordStep({ action: "take_right", description: `Taking ${right[j]} from right subarray` }, 0);
            j++;
          }
          setArr([...a]);
          k++;
          await sleep(300);
        }

        while (i < left.length) {
          a[k] = left[i];
          i++; k++;
          setArr([...a]);
          await sleep(200);
        }
        while (j < right.length) {
          a[k] = right[j];
          j++; k++;
          setArr([...a]);
          await sleep(200);
        }

        await recordStep(
          { action: "merge_complete", description: `Successfully merged subarray ${start}-${end}` },
          0
        );
        setHighlight([start, end]);
        setMergeIndices([{ start, end }]);
        await sleep(400);
      };

      setOperationSteps(steps);
      await mergeSortHelper(0, a.length - 1);

      steps.push({ action: "sort_complete", description: "Array is now fully sorted using Merge Sort!" });
      setOperationSteps([...steps]);
      setCurrentStep(steps.length - 1);
      setHighlight([]);
      setMergeIndices([]);
      setSortedIndices(a.map((_, idx) => idx));
    });

  const quickSort = () =>
    runSortAnimation("quick_sort", async () => {
      const a = [...arr];
      const steps = [{ action: "start_sort", description: "Starting Quick Sort algorithm (Divide and Conquer)" }];

      const recordStep = async (step, delay) => {
        steps.push(step);
        setCurrentStep(steps.length - 1);
        if (delay) await sleep(delay);
      };

      const sortedSet = new Set();

      const partition = async (low, high) => {
        const pivot = a[high];
        setPivotIndex(high);
        await recordStep(
          { action: "select_pivot", description: `Selecting pivot: ${pivot} at index ${high}` },
          0
        );
        setHighlight([high]);
        await sleep(500);

        let i = low - 1;
        for (let j = low; j < high; j++) {
          await recordStep(
            { action: "compare_pivot", description: `Comparing ${a[j]} (index ${j}) with pivot ${pivot}` },
            0
          );
          setHighlight([j, high]);
          await sleep(300);

          if (a[j] < pivot) {
            i++;
            if (i !== j) {
              [a[i], a[j]] = [a[j], a[i]];
              setSwapIndices([i, j]);
              setArr([...a]);
              await recordStep(
                { action: "swap_partition", description: `Swapping ${a[j]} and ${a[i]} (both < pivot)` },
                400
              );
              setSwapIndices([]);
            }
          }
        }

        [a[i + 1], a[high]] = [a[high], a[i + 1]];
        setSwapIndices([i + 1, high]);
        setArr([...a]);
        await recordStep(
          { action: "place_pivot", description: `Placing pivot ${pivot} at correct position ${i + 1}` },
          400
        );
        setSwapIndices([]);
        return i + 1;
      };

      const quickSortHelper = async (low, high) => {
        if (low < high) {
          const pi = await partition(low, high);
          sortedSet.add(pi);
          setSortedIndices([...sortedSet]);
          await recordStep(
            { action: "partition_complete", description: `Partition complete. Pivot ${a[pi]} is now at correct position ${pi}` },
            0
          );
          setPivotIndex(pi);
          setHighlight([pi]);
          await sleep(500);

          await quickSortHelper(low, pi - 1);
          await quickSortHelper(pi + 1, high);
        } else if (low === high) {
          sortedSet.add(low);
          setSortedIndices([...sortedSet]);
          await recordStep(
            { action: "single_element", description: `Single element at index ${low} (${a[low]}) is already sorted` },
            300
          );
          setHighlight([low]);
        }
      };

      setOperationSteps(steps);
      await quickSortHelper(0, a.length - 1);

      steps.push({ action: "sort_complete", description: "Array is now fully sorted using Quick Sort!" });
      setOperationSteps([...steps]);
      setCurrentStep(steps.length - 1);
      setHighlight([]);
      setPivotIndex(-1);
      setSortedIndices(a.map((_, idx) => idx));
    });

  // ---------- Searching ----------

  const binarySearch = async () => {
    if (isAnimating || !key) return;
    setIsAnimating(true);
    setOperationType("binary_search");
    resetAnimationState();
    const start = performance.now();

    const a = [...arr].sort((x, y) => x - y);
    setArr(a);
    await sleep(500);

    const target = Number(key);
    let l = 0, r = a.length - 1;
    const steps = [
      { action: "start_search", description: `Starting Binary Search for value ${target}` },
      { action: "set_bounds", left: l, right: r, description: `Initial search range: positions ${l} to ${r}` },
    ];

    while (l <= r) {
      const m = Math.floor((l + r) / 2);
      steps.push({ action: "check_mid", index: m, description: `Checking element at position ${m}: ${a[m]}` });

      if (a[m] === target) {
        steps.push({ action: "found", index: m, description: `Found ${target} at position ${m}!` });
        break;
      } else if (a[m] < target) {
        steps.push({
          action: "move_right",
          newLeft: m + 1,
          oldRight: r,
          description: `${a[m]} < ${target}, searching in right half (positions ${m + 1} to ${r})`,
        });
        l = m + 1;
      } else {
        steps.push({
          action: "move_left",
          oldLeft: l,
          newRight: m - 1,
          description: `${a[m]} > ${target}, searching in left half (positions ${l} to ${m - 1})`,
        });
        r = m - 1;
      }
    }

    if (l > r && !steps.some((s) => s.action === "found")) {
      steps.push({ action: "not_found", description: `Value ${target} not found in the array` });
    }

    setOperationSteps(steps);
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];

      if (step.action === "check_mid" || step.action === "found") {
        setHighlight([step.index]);
        await sleep(600);
      } else if (step.action === "set_bounds") {
        setHighlight([step.left, step.right]);
        await sleep(500);
      } else if (step.action === "move_left") {
        setHighlight([step.oldLeft, step.newRight]);
        await sleep(500);
      } else if (step.action === "move_right") {
        setHighlight([step.newLeft, step.oldRight]);
        await sleep(500);
      }
      await sleep(300);
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const linearSearch = async () => {
    if (isAnimating || !key) return;
    setIsAnimating(true);
    setOperationType("linear_search");
    resetAnimationState();
    const start = performance.now();

    const target = Number(key);
    const steps = [{ action: "start_search", description: `Starting Linear Search for value ${target}` }];

    let foundAt = -1;
    for (let i = 0; i < arr.length; i++) {
      steps.push({ action: "check_element", index: i, description: `Checking element at position ${i}: ${arr[i]}` });
      if (arr[i] === target) {
        steps.push({ action: "found", index: i, description: `Found ${target} at position ${i}!` });
        foundAt = i;
        break;
      }
    }
    if (foundAt === -1) {
      steps.push({ action: "not_found", description: `Value ${target} not found in the array` });
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

  // ---------- Array operations ----------

  const validateIndex = (raw, max) => {
    if (raw === "") return null;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > max) {
      setInputError(`Index must be a whole number between 0 and ${max}`);
      return null;
    }
    return n;
  };

  const insertElement = async () => {
    if (isAnimating || !operationValue || operationIndex === "") return;
    const index = validateIndex(operationIndex, arr.length);
    if (index === null) return;

    setIsAnimating(true);
    setOperationType("insert");
    resetAnimationState();
    const start = performance.now();

    const value = Number(operationValue);
    const newArray = [...arr];
    newArray.splice(index, 0, value);

    const steps = [{ action: "start_operation", description: `Starting Insert operation at index ${index} with value ${value}` }];

    if (index === arr.length) {
      steps.push({ action: "insert_at_end", description: `Inserting ${value} at the end of array (index ${index})` });
    } else {
      steps.push({
        action: "prepare_shift",
        description: `Shifting elements from index ${index} onwards to make space`,
        startIndex: index,
      });
      for (let i = arr.length; i > index; i--) {
        steps.push({
          action: "shift_element",
          fromIndex: i - 1,
          toIndex: i,
          description: `Shifting element ${arr[i - 1]} from index ${i - 1} to ${i}`,
        });
      }
      steps.push({ action: "make_space", index, description: `Space created at index ${index} for new element` });
    }
    steps.push({ action: "place_element", index, description: `Placing value ${value} at index ${index}` });
    steps.push({ action: "operation_complete", description: `Successfully inserted ${value} at index ${index}` });

    setOperationSteps(steps);
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];

      if (step.action === "prepare_shift") {
        setHighlight(Array.from({ length: arr.length - index }, (_, k) => k + index));
        await sleep(600);
      } else if (step.action === "shift_element") {
        setHighlight([step.fromIndex, step.toIndex]);
        await sleep(300);
      } else if (step.action === "make_space") {
        setHighlight([index]);
        await sleep(400);
      } else if (step.action === "place_element") {
        setHighlight([index]);
        setArr(newArray);
        await sleep(500);
      }
      await sleep(200);
    }

    setOperationValue("");
    setOperationIndex("");
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const deleteElement = async () => {
    if (isAnimating || operationIndex === "") return;
    const index = validateIndex(operationIndex, arr.length - 1);
    if (index === null) return;

    setIsAnimating(true);
    setOperationType("delete");
    resetAnimationState();
    const start = performance.now();

    const value = arr[index];
    const newArray = [...arr];
    newArray.splice(index, 1);

    const steps = [
      { action: "start_operation", description: `Starting Delete operation at index ${index} (value: ${value})` },
      { action: "highlight_target", index, description: `Element to delete: ${value} at index ${index}` },
    ];

    if (index < arr.length - 1) {
      steps.push({
        action: "prepare_shift",
        description: `Shifting elements from index ${index + 1} onwards to fill gap`,
      });
      for (let i = index; i < arr.length - 1; i++) {
        steps.push({
          action: "shift_element",
          fromIndex: i + 1,
          toIndex: i,
          description: `Shifting element ${arr[i + 1]} from index ${i + 1} to ${i}`,
        });
      }
    }
    steps.push({ action: "remove_element", index, description: `Removing ${value} from index ${index}` });
    steps.push({ action: "operation_complete", description: `Successfully deleted ${value} from index ${index}` });

    setOperationSteps(steps);
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];

      if (step.action === "highlight_target") {
        setHighlight([index]);
        await sleep(600);
      } else if (step.action === "prepare_shift") {
        setHighlight(Array.from({ length: arr.length - index - 1 }, (_, k) => k + index + 1));
        await sleep(500);
      } else if (step.action === "shift_element") {
        setHighlight([step.fromIndex, step.toIndex]);
        await sleep(400);
      } else if (step.action === "remove_element") {
        setArr(newArray);
        setHighlight([index]);
        await sleep(500);
      }
      await sleep(200);
    }

    setOperationIndex("");
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const updateElement = async () => {
    if (isAnimating || !operationValue || operationIndex === "") return;
    const index = validateIndex(operationIndex, arr.length - 1);
    if (index === null) return;

    setIsAnimating(true);
    setOperationType("update");
    resetAnimationState();
    const start = performance.now();

    const oldValue = arr[index];
    const newValue = Number(operationValue);
    const newArray = [...arr];
    newArray[index] = newValue;

    const steps = [
      { action: "start_operation", description: `Starting Update operation: Changing index ${index} from ${oldValue} to ${newValue}` },
      { action: "highlight_old", index, oldValue, description: `Current value at index ${index}: ${oldValue}` },
      { action: "update_value", index, oldValue, newValue, description: `Updating value from ${oldValue} to ${newValue} at index ${index}` },
      { action: "highlight_new", index, newValue, description: `New value at index ${index}: ${newValue}` },
      { action: "operation_complete", oldValue, newValue, description: `Successfully updated index ${index} from ${oldValue} to ${newValue}` },
    ];

    setOperationSteps(steps);
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];

      if (step.action === "highlight_old") {
        setHighlight([index]);
        await sleep(500);
      } else if (step.action === "update_value") {
        setArr(newArray);
        setHighlight([index]);
        await sleep(400);
      } else if (step.action === "highlight_new") {
        setHighlight([index]);
        await sleep(400);
      }
      await sleep(200);
    }

    setOperationValue("");
    setOperationIndex("");
    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const sortColor = SORT_COLORS[operationType] ?? DEFAULT_SORT_COLOR;

  useEffect(() => {
    if (!isAnimating) return;
    timerStartRef.current = performance.now();
    setElapsed(0);

    const id = setInterval(() => {
      setElapsed(Math.round(performance.now() - timerStartRef.current));
    }, 50);

    return () => clearInterval(id);
  }, [isAnimating]);

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
                    isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  }`}
                  onClick={bubbleSort}
                  disabled={isAnimating}
                >
                  Bubble Sort
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white"
                  }`}
                  onClick={selectionSort}
                  disabled={isAnimating}
                >
                  Selection Sort
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  }`}
                  onClick={insertionSort}
                  disabled={isAnimating}
                >
                  Insertion Sort
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  }`}
                  onClick={mergeSort}
                  disabled={isAnimating}
                >
                  Merge Sort
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
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
                    isAnimating || !key ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  }`}
                  onClick={binarySearch}
                  disabled={isAnimating || !key}
                >
                  Binary Search
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating || !key ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Index (0 to {arr.length})</label>
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

              {inputError && (
                <div className="text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">
                  {inputError}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating || !operationValue || operationIndex === ""
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                  }`}
                  onClick={insertElement}
                  disabled={isAnimating || !operationValue || operationIndex === ""}
                >
                  Insert at Index
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating || operationIndex === ""
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                  }`}
                  onClick={deleteElement}
                  disabled={isAnimating || operationIndex === ""}
                >
                  Delete at Index
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isAnimating || !operationValue || operationIndex === ""
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  }`}
                  onClick={updateElement}
                  disabled={isAnimating || !operationValue || operationIndex === ""}
                >
                  Update at Index
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
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
              Operation Steps ({OPERATION_LABELS[operationType] ?? "Update"})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {operationSteps.map((step, index) => {
                const isActive = index === currentStep;
                const isSortType = operationType.includes("sort");
                const isSearchType = operationType.includes("search");

                const borderClass = !isActive
                  ? "border-gray-200"
                  : isSortType
                  ? sortColor.border
                  : isSearchType
                  ? "border-blue-500 bg-blue-50"
                  : "border-emerald-500 bg-emerald-50";

                const stepBgClass = !isActive
                  ? "bg-gray-200 text-gray-600"
                  : isSortType
                  ? sortColor.solid
                  : isSearchType
                  ? "bg-blue-500 text-white"
                  : "bg-emerald-500 text-white";

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: index <= currentStep ? 1 : 0.4, y: 0 }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${borderClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stepBgClass}`}>
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{step.description}</span>
                      {step.oldValue !== undefined && step.newValue !== undefined ? (
                        <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                          {step.oldValue} → {step.newValue}
                        </span>
                      ) : step.value !== undefined ? (
                        <span className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                          Value: {step.value}
                        </span>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Array Visualization */}
        <div className="p-6 bg-white rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Array Visualization ({arr.length} elements)
          </h3>

          <div className="flex flex-col items-center">
            <div className="flex flex-wrap gap-3 items-end justify-center min-h-64 p-6">
              <AnimatePresence>
                {arr.map((value, index) => {
                  const isHighlighted = highlight.includes(index);
                  const isSwapping = swapIndices.includes(index);
                  const isPivot = pivotIndex === index;
                  const isInMergeRange = mergeIndices.some((range) => index >= range.start && index <= range.end);
                  const isInPartition = partitionIndices.includes(index);
                  const isSorted =
                    sortedIndices.includes(index) ||
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
                        backgroundColor: getBarColor(isPivot, isSwapping, isHighlighted, isSorted, operationType),
                      }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                      className="relative flex flex-col items-center"
                    >
                      <div
                        className="w-12 rounded-lg transition-all duration-300 shadow-md flex items-end justify-center p-2"
                        style={{ height: Math.max(value * 3, 48) }}
                      >
                        <span className="text-white font-bold text-lg leading-none">{value}</span>
                      </div>

                      <div className="mt-2 text-center">
                        <div className="text-sm font-medium text-gray-700">Index: {index}</div>

                        {isPivot && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1">
                            <div className="text-xs font-bold px-2 py-1 bg-green-100 text-green-800 rounded-full">PIVOT</div>
                          </motion.div>
                        )}

                        {isHighlighted && !isPivot && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1">
                            <div
                              className={`text-xs font-bold px-2 py-1 rounded-full ${
                                operationType.includes("search")
                                  ? "bg-blue-100 text-blue-800"
                                  : operationType.includes("sort")
                                  ? "bg-pink-100 text-pink-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {operationType.includes("search")
                                ? "Checking"
                                : operationType.includes("swap")
                                ? "Swapping"
                                : operationType === "insert"
                                ? "Inserting"
                                : operationType === "delete"
                                ? "Deleting"
                                : "Updating"}
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

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 w-full">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl">
                <div className="text-sm text-pink-700 mb-1">Array Size</div>
                <div className="text-xl font-bold text-pink-800">{arr.length} elements</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                <div className="text-sm text-blue-700 mb-1">Min Value</div>
                <div className="text-xl font-bold text-blue-800">{arr.length > 0 ? Math.min(...arr) : "N/A"}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl">
                <div className="text-sm text-purple-700 mb-1">Max Value</div>
                <div className="text-xl font-bold text-purple-800">{arr.length > 0 ? Math.max(...arr) : "N/A"}</div>
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