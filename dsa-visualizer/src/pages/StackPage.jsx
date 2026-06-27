import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { randomArray } from "../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator, ArrowRight, ArrowLeft, Hash,
  Plus, Minus, ChevronUp, RefreshCw,
  AlertCircle, Brain,
} from "lucide-react";

const OPERATORS = ["+", "-", "*", "/", "^"];

const precedence = (operator) => {
  switch (operator) {
    case "^": return 3;
    case "*":
    case "/": return 2;
    case "+":
    case "-": return 1;
    default: return 0;
  }
};

// Tokenizes an infix expression into multi-character operands (numbers or
// identifiers) and single-character operators/parentheses, e.g.
// "12+AB*(3-4)" -> ["12", "+", "AB", "*", "(", "3", "-", "4", ")"]
const tokenize = (expression) => {
  const expr = expression.replace(/\s+/g, "");
  const tokens = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    if (/[a-zA-Z0-9]/.test(char)) {
      let j = i;
      while (j < expr.length && /[a-zA-Z0-9]/.test(expr[j])) j++;
      tokens.push(expr.slice(i, j));
      i = j;
    } else {
      tokens.push(char);
      i++;
    }
  }

  return tokens;
};

const isOperand = (token) => /^[a-zA-Z0-9]+$/.test(token);

// Validates an infix expression: balanced parens, valid characters,
// no consecutive operators, and no trailing/leading operator.
const isValidInfix = (expression) => {
  const expr = expression.replace(/\s+/g, "");
  if (!expr) return false;

  const validChars = /^[a-zA-Z0-9+\-*/^()]+$/;
  if (!validChars.test(expr)) return false;

  let balance = 0;
  for (const char of expr) {
    if (char === "(") balance++;
    else if (char === ")") balance--;
    if (balance < 0) return false;
  }
  if (balance !== 0) return false;

  const tokens = tokenize(expr);
  if (OPERATORS.includes(tokens[0]) || OPERATORS.includes(tokens[tokens.length - 1])) {
    return false;
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    if (OPERATORS.includes(tokens[i]) && OPERATORS.includes(tokens[i + 1])) {
      return false;
    }
  }

  return true;
};

const infixToPostfix = (infix) => {
  const output = [];
  const stack = [];
  const tokens = tokenize(infix);

  for (const token of tokens) {
    if (isOperand(token)) {
      output.push(token);
    } else if (token === "(") {
      stack.push(token);
    } else if (token === ")") {
      while (stack.length > 0 && stack[stack.length - 1] !== "(") {
        output.push(stack.pop());
      }
      stack.pop();
    } else {
      while (stack.length > 0 && precedence(stack[stack.length - 1]) >= precedence(token)) {
        output.push(stack.pop());
      }
      stack.push(token);
    }
  }

  while (stack.length > 0) output.push(stack.pop());
  return output.join(" ");
};

const infixToPrefix = (infix) => {
  const reversedTokens = tokenize(infix).reverse().map((token) => {
    if (token === "(") return ")";
    if (token === ")") return "(";
    return token;
  });

  const stack = [];
  const output = [];

  for (const token of reversedTokens) {
    if (isOperand(token)) {
      output.push(token);
    } else if (token === "(") {
      stack.push(token);
    } else if (token === ")") {
      while (stack.length > 0 && stack[stack.length - 1] !== "(") {
        output.push(stack.pop());
      }
      stack.pop();
    } else {
      while (stack.length > 0 && precedence(stack[stack.length - 1]) > precedence(token)) {
        output.push(stack.pop());
      }
      stack.push(token);
    }
  }

  while (stack.length > 0) output.push(stack.pop());
  return output.reverse().join(" ");
};

const evaluatePostfixTokens = (tokens) => {
  const stack = [];

  for (const token of tokens) {
    if (isOperand(token)) {
      const n = Number(token);
      if (Number.isNaN(n)) throw new Error(`Cannot evaluate non-numeric operand "${token}"`);
      stack.push(n);
    } else {
      if (stack.length < 2) throw new Error(`Not enough operands for operator "${token}"`);
      const b = stack.pop();
      const a = stack.pop();
      switch (token) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/":
          if (b === 0) throw new Error("Division by zero");
          stack.push(a / b);
          break;
        case "^": stack.push(Math.pow(a, b)); break;
        default: throw new Error(`Unknown operator "${token}"`);
      }
    }
  }

  if (stack.length !== 1) throw new Error("Invalid postfix expression");
  return stack[0];
};

const isNumericExpression = (expr) => /^[\s0-9+\-*/^().]+$/.test(expr);

export default function StackPage() {
  const [stack, setStack] = useState(() => randomArray(4));
  const [value, setValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [operationSteps, setOperationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [operationType, setOperationType] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [runtime, setRuntime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [infixExpression, setInfixExpression] = useState("A+B*(C^D-E)");
  const [postfixResult, setPostfixResult] = useState("");
  const [prefixResult, setPrefixResult] = useState("");
  const [conversionSteps, setConversionSteps] = useState([]);
  const [conversionType, setConversionType] = useState("");
  const [operatorStack, setOperatorStack] = useState([]);
  const [outputQueue, setOutputQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState("");

  const exampleExpressions = [
    { name: "Simple Addition", expr: "A+B" },
    { name: "Complex Expression", expr: "A+B*(C^D-E)" },
    { name: "Nested Parentheses", expr: "(A+B)*(C-D)" },
    { name: "Multiple Operators", expr: "A+B*C/D-E" },
    { name: "Exponentiation", expr: "A^B^C" },
    { name: "Numeric Example", expr: "12+45*2/(10-15)^2" },
  ];

  const basicStackOperations = [
    { name: "Push", symbol: "→", description: "Add element to top" },
    { name: "Pop", symbol: "←", description: "Remove from top" },
    { name: "Peek", symbol: "👁️", description: "View top element" },
    { name: "Empty", symbol: "∅", description: "Check if stack is empty" },
  ];

  // Live elapsed-time ticker while any operation is animating
  useEffect(() => {
    if (!isAnimating) return;
    const startedAt = performance.now();
    setElapsed(0);
    const id = setInterval(() => setElapsed(Math.round(performance.now() - startedAt)), 50);
    return () => clearInterval(id);
  }, [isAnimating]);

  const resetConversion = () => {
    setConversionSteps([]);
    setCurrentStep(0);
    setCurrentToken(null);
    setOperatorStack([]);
    setOutputQueue([]);
    setPostfixResult("");
    setPrefixResult("");
    setEvaluationResult(null);
    setShowEvaluation(false);
    setError("");
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const convertToPostfix = async () => {
    if (isAnimating || !infixExpression.trim()) return;

    if (!isValidInfix(infixExpression)) {
      setError("Invalid infix expression! Please check:\n1. Balanced parentheses\n2. Valid characters\n3. No consecutive operators");
      return;
    }

    setIsAnimating(true);
    setOperationType("postfix_conversion");
    setConversionType("postfix");
    resetConversion();
    const start = performance.now();

    const steps = [];
    const stack = [];
    const output = [];
    const tokens = tokenize(infixExpression);

    const recordStep = (step) => {
      steps.push(step);
      setConversionSteps([...steps]);
      setCurrentStep(steps.length - 1);
    };

    recordStep({ description: `Starting conversion of infix expression: ${infixExpression}` });

    for (const token of tokens) {
      setCurrentToken(token);

      if (isOperand(token)) {
        output.push(token);
        setOutputQueue([...output]);
        recordStep({ description: `Operand "${token}" → Add directly to output` });
        await sleep(700);
      } else if (token === "(") {
        stack.push(token);
        setOperatorStack([...stack]);
        recordStep({ description: `Opening parenthesis "(" → Push to stack` });
        await sleep(700);
      } else if (token === ")") {
        recordStep({ description: `Closing parenthesis ")" → Pop operators until "("` });
        await sleep(700);

        while (stack.length > 0 && stack[stack.length - 1] !== "(") {
          const popped = stack.pop();
          output.push(popped);
          setOutputQueue([...output]);
          setOperatorStack([...stack]);
          recordStep({ description: `Popped operator "${popped}" from stack → Added to output` });
          await sleep(700);
        }
        if (stack.length > 0) {
          stack.pop();
          setOperatorStack([...stack]);
        }
      } else {
        recordStep({ description: `Operator "${token}" encountered (Precedence: ${precedence(token)})` });
        await sleep(700);

        while (
          stack.length > 0 &&
          precedence(stack[stack.length - 1]) >= precedence(token) &&
          stack[stack.length - 1] !== "("
        ) {
          const popped = stack.pop();
          output.push(popped);
          setOutputQueue([...output]);
          setOperatorStack([...stack]);
          recordStep({ description: `Popped "${popped}" (precedence ${precedence(popped)}) → ${token}'s precedence is ${precedence(token)}` });
          await sleep(700);
        }

        stack.push(token);
        setOperatorStack([...stack]);
        recordStep({ description: `Pushed "${token}" to operator stack` });
        await sleep(700);
      }
    }

    while (stack.length > 0) {
      const popped = stack.pop();
      output.push(popped);
      setOutputQueue([...output]);
      setOperatorStack([...stack]);
      recordStep({ description: `Popped remaining operator "${popped}" from stack` });
      await sleep(700);
    }

    const result = output.join(" ");
    setPostfixResult(result);
    setCurrentToken(null);
    recordStep({ description: `✅ Conversion complete! Postfix expression: ${result}` });

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const convertToPrefix = async () => {
    if (isAnimating || !infixExpression.trim()) return;

    if (!isValidInfix(infixExpression)) {
      setError("Invalid infix expression! Please check:\n1. Balanced parentheses\n2. Valid characters\n3. No consecutive operators");
      return;
    }

    setIsAnimating(true);
    setOperationType("prefix_conversion");
    setConversionType("prefix");
    resetConversion();
    const start = performance.now();

    const steps = [];
    const stack = [];
    const output = [];

    const recordStep = (step) => {
      steps.push(step);
      setConversionSteps([...steps]);
      setCurrentStep(steps.length - 1);
    };

    const reversedTokens = tokenize(infixExpression).reverse().map((token) => {
      if (token === "(") return ")";
      if (token === ")") return "(";
      return token;
    });

    recordStep({ description: "Step 1: Reversed expression and swapped parentheses" });
    await sleep(700);

    for (const token of reversedTokens) {
      setCurrentToken(token);

      if (isOperand(token)) {
        output.push(token);
        setOutputQueue([...output]);
        recordStep({ description: `Operand "${token}" → Add to output` });
        await sleep(700);
      } else if (token === "(") {
        stack.push(token);
        setOperatorStack([...stack]);
        recordStep({ description: `"(" → Push to stack` });
        await sleep(700);
      } else if (token === ")") {
        recordStep({ description: `")" → Pop until "("` });
        await sleep(700);

        while (stack.length > 0 && stack[stack.length - 1] !== "(") {
          const popped = stack.pop();
          output.push(popped);
          setOutputQueue([...output]);
          setOperatorStack([...stack]);
          recordStep({ description: `Popped "${popped}" → Added to output` });
          await sleep(700);
        }
        if (stack.length > 0) {
          stack.pop();
          setOperatorStack([...stack]);
        }
      } else {
        recordStep({ description: `Operator "${token}" encountered (Precedence: ${precedence(token)})` });
        await sleep(700);

        while (stack.length > 0 && precedence(stack[stack.length - 1]) > precedence(token)) {
          const popped = stack.pop();
          output.push(popped);
          setOutputQueue([...output]);
          setOperatorStack([...stack]);
          recordStep({ description: `Popped "${popped}" (precedence ${precedence(popped)}) > ${token}'s (${precedence(token)})` });
          await sleep(700);
        }

        stack.push(token);
        setOperatorStack([...stack]);
        recordStep({ description: `Pushed "${token}" to stack` });
        await sleep(700);
      }
    }

    while (stack.length > 0) {
      const popped = stack.pop();
      output.push(popped);
      setOutputQueue([...output]);
      setOperatorStack([...stack]);
      recordStep({ description: `Popped remaining operator "${popped}"` });
      await sleep(700);
    }

    const prefix = output.reverse().join(" ");
    setPrefixResult(prefix);
    setCurrentToken(null);
    recordStep({ description: `✅ Prefix expression: ${prefix}` });

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const evaluateExpression = async () => {
    if (isEvaluating || !postfixResult.trim()) return;

    setIsEvaluating(true);
    setShowEvaluation(true);
    setError("");

    const tokens = postfixResult.split(" ").filter((t) => t !== "");
    const evalStack = [];

    try {
      for (const token of tokens) {
        if (isOperand(token)) {
          const n = Number(token);
          if (Number.isNaN(n)) {
            throw new Error(`"${token}" is a variable, not a number — evaluation only works on numeric expressions`);
          }
          evalStack.push(n);
        } else {
          if (evalStack.length < 2) throw new Error(`Not enough operands for operator "${token}"`);
          const b = evalStack.pop();
          const a = evalStack.pop();
          let result;
          switch (token) {
            case "+": result = a + b; break;
            case "-": result = a - b; break;
            case "*": result = a * b; break;
            case "/":
              if (b === 0) throw new Error("Division by zero");
              result = a / b;
              break;
            case "^": result = Math.pow(a, b); break;
            default: throw new Error(`Unknown operator "${token}"`);
          }
          evalStack.push(result);
        }
        await sleep(600);
      }

      if (evalStack.length !== 1) throw new Error("Invalid expression");
      setEvaluationResult(evalStack[0]);
    } catch (err) {
      setError(`Evaluation error: ${err.message}`);
      setEvaluationResult(null);
    }

    setIsEvaluating(false);
  };

  const push = async () => {
    if (isAnimating || !value) return;

    setIsAnimating(true);
    setOperationType("push");
    setHighlightedIndex(-1);
    setOperationSteps([]);
    setCurrentStep(0);
    const start = performance.now();

    const newValue = Number(value);
    const insertIndex = stack.length;

    const steps = [
      { action: "check_full", description: "Checking if stack has space..." },
      { action: "create_value", value: newValue, description: `Creating value ${newValue} to push onto stack` },
      { action: "move_to_top", description: "Moving new element to top of stack" },
      { action: "update_top", description: "Updating top pointer to new element" },
      { action: "push_complete", value: newValue, description: `Successfully pushed ${newValue} onto stack!` },
    ];

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);

      if (steps[i].action === "update_top") {
        setHighlightedIndex(insertIndex);
        await sleep(300);
        setStack((prev) => [...prev, newValue]);
        await sleep(200);
      } else {
        await sleep(500);
      }
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
    setValue("");
  };

  const pop = async () => {
    if (isAnimating || stack.length === 0) return;

    setIsAnimating(true);
    setOperationType("pop");
    setHighlightedIndex(-1);
    setOperationSteps([]);
    setCurrentStep(0);
    const start = performance.now();

    const topValue = stack[stack.length - 1];
    const topIndex = stack.length - 1;

    const steps = [
      { action: "check_empty", description: "Checking if stack is empty..." },
      { action: "access_top", value: topValue, description: `Accessing top element: ${topValue}` },
      { action: "highlight_top", description: "Top element highlighted for removal" },
      { action: "remove_element", value: topValue, description: `Removing ${topValue} from stack` },
      { action: "update_top", description: "Updating top pointer to new top element" },
      { action: "pop_complete", value: topValue, description: `Successfully popped ${topValue} from stack!` },
    ];

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];

      if (step.action === "highlight_top") {
        setHighlightedIndex(topIndex);
        await sleep(700);
      } else if (step.action === "remove_element") {
        setStack((prev) => prev.slice(0, -1));
        await sleep(300);
      } else if (step.action === "update_top") {
        setHighlightedIndex(topIndex > 0 ? topIndex - 1 : -1);
        await sleep(400);
      } else {
        await sleep(400);
      }
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const peek = async () => {
    if (isAnimating || stack.length === 0) return;

    setIsAnimating(true);
    setOperationType("peek");
    setHighlightedIndex(-1);
    setOperationSteps([]);
    setCurrentStep(0);
    const start = performance.now();

    const topValue = stack[stack.length - 1];
    const topIndex = stack.length - 1;

    const steps = [
      { action: "check_empty", description: "Checking if stack is empty..." },
      { action: "access_top", value: topValue, description: "Accessing top element without removing" },
      { action: "highlight_top", value: topValue, description: `Top element is ${topValue}` },
      { action: "peek_complete", value: topValue, description: `Peek operation complete. Top element: ${topValue}` },
    ];

    setOperationSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      if (steps[i].action === "highlight_top") {
        setHighlightedIndex(topIndex);
        await sleep(900);
      } else {
        await sleep(400);
      }
    }

    setRuntime(Math.round(performance.now() - start));
    setIsAnimating(false);
  };

  const resetStack = () => {
    if (isAnimating) return;
    setStack(randomArray(4));
    setHighlightedIndex(-1);
    setOperationSteps([]);
    setCurrentStep(0);
    setValue("");
  };

  const loadExample = (expr) => {
    if (isAnimating) return;
    setInfixExpression(expr);
    setOperationType("");
    resetConversion();
  };

  const canEvaluate = postfixResult && isNumericExpression(infixExpression);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <NavBar runtime={runtime} />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Stack Data Structure</h1>
              <p className="text-gray-600">LIFO Operations with Infix to Postfix/Prefix Conversion</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
              <Calculator className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <div className="text-sm whitespace-pre-line">{error}</div>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Basic Stack Operations */}
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ChevronUp className="w-5 h-5 text-emerald-500" />
                Basic Stack Operations
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Value to Push</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter a value to push"
                  disabled={isAnimating}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex-1 min-w-[120px] ${
                    isAnimating || !value ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md"
                  }`}
                  onClick={push}
                  disabled={isAnimating || !value}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Push
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex-1 min-w-[120px] ${
                    isAnimating || stack.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md"
                  }`}
                  onClick={pop}
                  disabled={isAnimating || stack.length === 0}
                >
                  <Minus className="w-4 h-4 inline mr-2" />
                  Pop
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex-1 min-w-[120px] ${
                    isAnimating || stack.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                  }`}
                  onClick={peek}
                  disabled={isAnimating || stack.length === 0}
                >
                  <ChevronUp className="w-4 h-4 inline mr-2" />
                  Peek
                </button>
              </div>

              <button
                className={`w-full mt-4 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
                }`}
                onClick={resetStack}
                disabled={isAnimating}
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Generate Random Stack
              </button>
            </div>

            {/* Stack Visualization */}
            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Stack Visualization</h3>

              <div className="relative">
                <div className="flex flex-col items-center mb-6">
                  <div className="text-sm font-medium text-gray-600 mb-2">Top Pointer</div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-emerald-800 font-semibold">TOP</span>
                    <div className="w-8 h-1 bg-emerald-400" />
                    <div className="w-3 h-3 border-r-2 border-t-2 border-emerald-400 transform rotate-45" />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex flex-col-reverse items-center w-full relative">
                    <div className="w-full h-2 bg-gray-800 rounded-b-lg" />

                    <AnimatePresence>
                      {stack.map((item, index) => {
                        const isTop = index === stack.length - 1;
                        const isHighlighted = highlightedIndex === index;

                        return (
                          <motion.div
                            key={`${item}-${index}`}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, scale: isHighlighted ? 1.05 : 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`w-full relative ${isHighlighted ? "z-10" : ""}`}
                          >
                            {index > 0 && (
                              <div className="h-4 flex items-center justify-center">
                                <div className="w-4 h-1 bg-gray-300" />
                              </div>
                            )}

                            <div className={`relative rounded-lg transition-all duration-300 ${isHighlighted ? "ring-4 ring-emerald-300 shadow-xl" : "shadow-md"}`}>
                              <div
                                className={`p-6 text-center border-2 rounded-lg transition-all duration-300 ${
                                  isTop ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-600" : "bg-gradient-to-br from-green-100 to-emerald-100 text-gray-800 border-green-200"
                                }`}
                              >
                                <div className="text-2xl font-bold mb-1">{item}</div>
                                <div className={`text-xs font-medium ${isTop ? "text-emerald-100" : "text-gray-500"}`}>
                                  {isTop ? "TOP" : `Index: ${index}`}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {stack.length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                        <div className="text-gray-400 text-lg mb-2">Stack is Empty</div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="text-center mt-6">
                  <div className="inline-block px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium">BOTTOM</div>
                </div>
              </div>
            </div>

            {/* Stack Properties */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Stack Properties</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-emerald-100">
                  <div className="text-sm text-gray-600 mb-1">Current Size</div>
                  <div className="text-2xl font-bold text-emerald-600">{stack.length}</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-emerald-100">
                  <div className="text-sm text-gray-600 mb-1">Top Element</div>
                  <div className="text-2xl font-bold text-gray-800">{stack.length > 0 ? stack[stack.length - 1] : "None"}</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-emerald-100">
                  <div className="text-sm text-gray-600 mb-1">Time Taken</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {isAnimating ? `${elapsed}ms` : runtime > 0 ? `${runtime}ms` : "—"}
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-emerald-100">
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className="text-2xl font-bold text-gray-800">{isAnimating ? "Running" : "Ready"}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Basic Operations:</div>
                <div className="grid grid-cols-2 gap-2">
                  {basicStackOperations.map((op, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{op.symbol}</span>
                        <div>
                          <div className="font-medium text-gray-700">{op.name}</div>
                          <div className="text-xs text-gray-500">{op.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Expression Conversion */}
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-500" />
                Infix to Postfix/Prefix Conversion
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Infix Expression</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-mono"
                  value={infixExpression}
                  onChange={(e) => setInfixExpression(e.target.value)}
                  placeholder="Enter infix expression (e.g., A+B*(C-D))"
                  disabled={isAnimating}
                />
                <div className="mt-2 text-xs text-gray-500">
                  Use letters/variables (A, B, C...) or multi-digit numbers. Operators: + - * / ^ ( )
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex-1 min-w-[140px] ${
                    isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md"
                  }`}
                  onClick={convertToPostfix}
                  disabled={isAnimating}
                >
                  <ArrowRight className="w-4 h-4 inline mr-2" />
                  Infix → Postfix
                </button>

                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex-1 min-w-[140px] ${
                    isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
                  }`}
                  onClick={convertToPrefix}
                  disabled={isAnimating}
                >
                  <ArrowLeft className="w-4 h-4 inline mr-2" />
                  Infix → Prefix
                </button>
              </div>

              <div className="mt-6">
                <div className="text-sm font-medium text-gray-700 mb-2">Try Examples:</div>
                <div className="flex flex-wrap gap-2">
                  {exampleExpressions.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadExample(example.expr)}
                      disabled={isAnimating}
                      className="px-3 py-2 text-sm bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-lg transition-all duration-200"
                    >
                      {example.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversion Results */}
            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversion Results</h3>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Infix Expression</div>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 font-mono text-lg">
                    {infixExpression || "Enter an expression"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Postfix (RPN)</div>
                    <div className={`p-4 rounded-lg border-2 font-mono text-lg ${postfixResult ? "border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50" : "border-gray-200 bg-gray-50"}`}>
                      {postfixResult || "Not converted yet"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Prefix (Polish)</div>
                    <div className={`p-4 rounded-lg border-2 font-mono text-lg ${prefixResult ? "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50" : "border-gray-200 bg-gray-50"}`}>
                      {prefixResult || "Not converted yet"}
                    </div>
                  </div>
                </div>

                {/* Evaluation Section */}
                {postfixResult && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-amber-800">Numerical Evaluation</div>
                      {canEvaluate ? (
                        <button
                          onClick={evaluateExpression}
                          disabled={isEvaluating || isAnimating}
                          className={`px-3 py-1 text-sm rounded ${
                            isEvaluating || isAnimating ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                          }`}
                        >
                          {isEvaluating ? "Evaluating..." : "Evaluate Postfix"}
                        </button>
                      ) : (
                        <span className="text-xs text-amber-600">Variables can't be evaluated numerically</span>
                      )}
                    </div>

                    {showEvaluation && (
                      <div className="mt-2">
                        <div className="text-sm text-amber-700 font-mono mb-1">Expression: {postfixResult}</div>
                        {evaluationResult !== null && (
                          <div className="p-3 bg-white rounded border border-amber-300">
                            <div className="text-lg font-bold text-amber-800">Result: {evaluationResult}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Conversion Visualization */}
            {(conversionSteps.length > 0 || operatorStack.length > 0) && (
              <div className="p-6 bg-white rounded-2xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {conversionType === "postfix" ? "Infix → Postfix Conversion" : "Infix → Prefix Conversion"}
                </h3>

                <div className="mb-6 grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Current Token</div>
                    <div className="text-lg font-bold text-gray-800 font-mono">{currentToken ?? "-"}</div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-gray-500 mb-1">Operator Stack</div>
                    <div className="flex gap-1 flex-wrap">
                      {operatorStack.map((op, idx) => (
                        <div key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono">{op}</div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-xs text-gray-500 mb-1">Output Queue</div>
                    <div className="flex gap-1 flex-wrap">
                      {outputQueue.map((item, idx) => (
                        <div key={idx} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-sm font-mono">{item}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {conversionSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: index <= currentStep ? 1 : 0.4, x: 0 }}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        index === currentStep ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            index === currentStep ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="text-sm text-gray-700">{step.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Algorithm Explanation */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-lg">
              <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                How Stack Helps in Conversion
              </h4>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                  <div className="text-sm text-gray-700"><strong>Operator Precedence:</strong> Stack helps maintain correct order of operations</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                  <div className="text-sm text-gray-700"><strong>Parentheses Handling:</strong> Stack manages nested expressions</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                  <div className="text-sm text-gray-700"><strong>LIFO Nature:</strong> Last operator pushed is first to be popped when needed</div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                  <div className="text-xs text-purple-700"><strong>Key Insight:</strong> Stack acts as a "waiting room" for operators until their operands are ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operation Steps (for basic stack ops) */}
        {operationSteps.length > 0 && operationType !== "postfix_conversion" && operationType !== "prefix_conversion" && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Operation Steps ({operationType === "push" ? "Push" : operationType === "pop" ? "Pop" : "Peek"})
            </h3>
            <div className="space-y-2">
              {operationSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: index <= currentStep ? 1 : 0.4, y: 0 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${index === currentStep ? "border-emerald-500 bg-emerald-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === currentStep ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{step.description}</span>
                    {step.value !== undefined && (
                      <span className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">Value: {step.value}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="p-6 bg-white rounded-2xl shadow-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Visualization Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
              <div className="w-8 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Top Element</span>
                <span className="text-xs text-gray-500">Currently accessible</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm font-mono">+</div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Operator Stack</span>
                <span className="text-xs text-gray-500">Holds operators temporarily</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded text-sm font-mono">A</div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Output Queue</span>
                <span className="text-xs text-gray-500">Final converted expression</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="w-16 h-2 bg-gray-800 rounded" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Stack Base</span>
                <span className="text-xs text-gray-500">Bottom of stack</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}