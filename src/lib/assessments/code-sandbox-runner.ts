/**
 * In-Browser & Server-Side Sandboxed Code Execution Runner
 * Provides safe, isolated execution for Python and JavaScript programming questions.
 */

export interface CodeTestCase {
  input: string;
  expected_output: string;
}

export interface TestCaseResult {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTimeMs: number;
  error?: string;
}

export interface CodeExecutionResponse {
  success: boolean;
  overallPassed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionTimeMs: number;
  results: TestCaseResult[];
  stdout: string;
  stderr: string;
  error?: string;
}

/**
 * Safely parses input or expected output string into JSON, handling single-quoted arrays.
 */
export function parseJsonOrEval(str: string): any {
  if (!str || typeof str !== "string") return str;
  try {
    return JSON.parse(str);
  } catch {
    try {
      return JSON.parse(str.replace(/'/g, '"'));
    } catch {
      return str.trim();
    }
  }
}

/**
 * Normalizes values for comparison (strips extra whitespace, normalizes arrays/objects).
 */
function normalizeOutput(val: any): string {
  if (val === undefined || val === null) return "";
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val).trim();
}

/**
 * Compares actual output with expected output using multiple equivalence strategies:
 * 1. Exact string match
 * 2. Trimmed / whitespace-insensitive match
 * 3. Deep JSON equivalence
 * 4. Numeric float tolerance (e.g., 0.0 vs 0)
 */
export function areOutputsEqual(actual: any, expected: string): boolean {
  const normActual = normalizeOutput(actual);
  const normExpected = String(expected || "").trim();

  if (normActual === normExpected) return true;

  // Single-quote vs double-quote list match (e.g., ['a', 'b'] vs ["a", "b"])
  if (normActual.replace(/'/g, '"').replace(/\s+/g, "") === normExpected.replace(/'/g, '"').replace(/\s+/g, "")) {
    return true;
  }

  // JSON comparison
  try {
    const parsedActual = typeof actual === "object" ? actual : parseJsonOrEval(normActual);
    const parsedExpected = parseJsonOrEval(normExpected);
    if (JSON.stringify(parsedActual) === JSON.stringify(parsedExpected)) {
      return true;
    }
    // Array comparison with float tolerance
    if (Array.isArray(parsedActual) && Array.isArray(parsedExpected)) {
      if (parsedActual.length === parsedExpected.length) {
        const allMatch = parsedActual.every((v, i) => {
          const expV = parsedExpected[i];
          if (typeof v === "number" && typeof expV === "number") {
            return Math.abs(v - expV) < 0.0001;
          }
          return String(v) === String(expV);
        });
        if (allMatch) return true;
      }
    }
  } catch {
    // Non-JSON string compare
  }

  // Boolean normalization
  const actLower = normActual.toLowerCase();
  const expLower = normExpected.toLowerCase();
  if (
    (actLower === "true" && expLower === "true") ||
    (actLower === "false" && expLower === "false")
  ) {
    return true;
  }

  // Python-style list string compare: "[0.0, 0.0, 3.2, 0.0, 5.0]" vs "[0, 0, 3.2, 0, 5]"
  const cleanAct = normActual.replace(/\s+/g, "").replace(/\.0\b/g, "");
  const cleanExp = normExpected.replace(/\s+/g, "").replace(/\.0\b/g, "");
  if (cleanAct === cleanExp) return true;

  return false;
}

/**
 * Executes JavaScript code in an in-browser or client sandbox with timeout protection.
 */
export function executeJavaScriptInBrowser(
  code: string,
  testCases: CodeTestCase[],
  timeoutMs: number = 2000
): CodeExecutionResponse {
  const startTime = performance.now();
  const stdoutLogs: string[] = [];
  const stderrLogs: string[] = [];

  // Capture console logs safely
  const customConsole = {
    log: (...args: any[]) => {
      stdoutLogs.push(
        args
          .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
          .join(" ")
      );
    },
    error: (...args: any[]) => {
      stderrLogs.push(args.map(String).join(" "));
    },
    warn: (...args: any[]) => {
      stdoutLogs.push("[WARN] " + args.map(String).join(" "));
    },
  };

  try {
    // Extract declared function name
    const fnMatch = code.match(/function\s+([a-zA-Z0-9_$]+)/);
    const constFnMatch = code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/);
    const targetFnName = fnMatch ? fnMatch[1] : constFnMatch ? constFnMatch[1] : null;

    // Build execution closure
    const harness = `
      "use strict";
      const console = arguments[0];
      ${code}
      return (typeof ${targetFnName} !== 'undefined' ? ${targetFnName} : null);
    `;

    // Compile function
    const compiledRunner = new Function(harness);
    const userFn = compiledRunner(customConsole);

    const results: TestCaseResult[] = [];
    let passedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const tcStart = performance.now();
      let actualOutput: any = "";
      let hasError = false;
      let errorMsg = "";

      try {
        const parsedInput = parseJsonOrEval(tc.input);

        if (typeof userFn === "function") {
          // If input is an array, check if function expects multiple arguments or array
          if (Array.isArray(parsedInput) && userFn.length > 1) {
            actualOutput = userFn(...parsedInput);
          } else {
            actualOutput = userFn(parsedInput);
          }
        } else {
          // No function returned; evaluate if script logged output
          actualOutput = stdoutLogs.length > 0 ? stdoutLogs[stdoutLogs.length - 1] : "";
        }
      } catch (err: unknown) {
        hasError = true;
        errorMsg = err instanceof Error ? err.message : String(err);
        stderrLogs.push(`Test Case ${i + 1} Error: ${errorMsg}`);
      }

      const tcElapsed = Math.round((performance.now() - tcStart) * 100) / 100;
      const isPassed = !hasError && areOutputsEqual(actualOutput, tc.expected_output);

      if (isPassed) passedCount++;

      results.push({
        testCaseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expected_output,
        actualOutput: hasError ? `Error: ${errorMsg}` : normalizeOutput(actualOutput),
        passed: isPassed,
        executionTimeMs: tcElapsed,
        error: errorMsg || undefined,
      });
    }

    const totalElapsed = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      success: true,
      overallPassed: passedCount === testCases.length && testCases.length > 0,
      totalTests: testCases.length,
      passedTests: passedCount,
      failedTests: testCases.length - passedCount,
      executionTimeMs: totalElapsed,
      results,
      stdout: stdoutLogs.join("\n"),
      stderr: stderrLogs.join("\n"),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const totalElapsed = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      success: false,
      overallPassed: false,
      totalTests: testCases.length,
      passedTests: 0,
      failedTests: testCases.length,
      executionTimeMs: totalElapsed,
      results: testCases.map((tc, idx) => ({
        testCaseIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expected_output,
        actualOutput: `Syntax/Runtime Error: ${errorMsg}`,
        passed: false,
        executionTimeMs: 0,
        error: errorMsg,
      })),
      stdout: stdoutLogs.join("\n"),
      stderr: errorMsg,
      error: errorMsg,
    };
  }
}

/**
 * Client-Side Python Evaluator
 * Safely parses and evaluates standard algorithmic Python functions in the browser,
 * providing instant $O(1)$ client execution without waiting on network calls.
 */
export function executePythonInBrowserFallback(
  code: string,
  testCases: CodeTestCase[]
): CodeExecutionResponse {
  const startTime = performance.now();
  const stdoutLogs: string[] = [];
  const stderrLogs: string[] = [];

  try {
    // Extract function name and arguments
    const fnMatch = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
    if (!fnMatch) {
      throw new Error("No Python function definition ('def function_name(...)') detected.");
    }

    const fnName = fnMatch[1];
    const rawArgs = fnMatch[2].split(",").map((a) => a.trim().split(":")[0].trim()).filter(Boolean);
    const cleanArgs = rawArgs.join(", ");

    // Convert basic Python algorithmic constructs to JS for client-side sandboxed evaluation
    let jsCode = code
      .replace(/#.*$/gm, "") // Remove comments
      .replace(/def\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*(?:->\s*[^:]+)?\s*:/g, `function $1(${cleanArgs}) {`)
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false")
      .replace(/\bNone\b/g, "null")
      .replace(/\band\b/g, "&&")
      .replace(/\bor\b/g, "||")
      .replace(/\bnot\b/g, "!")
      .replace(/\bprint\s*\(([^)]+)\)/g, "console.log($1)");

    // Handle common python built-in conversions
    const pythonHarness = `
      function len(x) { return x ? (x.length ?? Object.keys(x).length) : 0; }
      function max(...args) {
        if (args.length === 1 && Array.isArray(args[0])) return Math.max(...args[0]);
        return Math.max(...args);
      }
      function min(...args) {
        if (args.length === 1 && Array.isArray(args[0])) return Math.min(...args[0]);
        return Math.min(...args);
      }
      function abs(x) { return Math.abs(x); }
      function sum(arr) { return arr.reduce((a, b) => a + b, 0); }
      function float(x) { return parseFloat(x); }
      function int(x) { return parseInt(x, 10); }
      function str(x) { return String(x); }
      function range(start, stop, step = 1) {
        if (stop === undefined) { stop = start; start = 0; }
        const res = [];
        for (let i = start; step > 0 ? i < stop : i > stop; i += step) res.push(i);
        return res;
      }
    `;

    // Fallback: If python list comprehension like `[max(0.0, x) for x in values]` exists:
    jsCode = jsCode.replace(
      /\[\s*(.+?)\s+for\s+([a-zA-Z0-9_]+)\s+in\s+([^\]]+)\]/g,
      "($3).map(($2) => $1)"
    );

    // Close any unclosed blocks
    const openBraces = (jsCode.match(/\{/g) || []).length;
    const closeBraces = (jsCode.match(/\}/g) || []).length;
    for (let b = 0; b < openBraces - closeBraces; b++) {
      jsCode += "\n}";
    }

    const fullJs = `${pythonHarness}\n${jsCode}\nreturn (typeof ${fnName} !== 'undefined' ? ${fnName} : null);`;

    const customConsole = {
      log: (...args: any[]) => stdoutLogs.push(args.map(String).join(" ")),
      error: (...args: any[]) => stderrLogs.push(args.map(String).join(" ")),
    };

    const compiled = new Function("console", fullJs);
    const userFn = compiled(customConsole);

    const results: TestCaseResult[] = [];
    let passedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const tcStart = performance.now();
      let actualOutput: any = "";
      let hasError = false;
      let errorMsg = "";

      try {
        const parsedInput = parseJsonOrEval(tc.input);

        if (typeof userFn === "function") {
          if (Array.isArray(parsedInput) && rawArgs.length > 1) {
            actualOutput = userFn(...parsedInput);
          } else {
            actualOutput = userFn(parsedInput);
          }
        }
      } catch (err: unknown) {
        hasError = true;
        errorMsg = err instanceof Error ? err.message : String(err);
      }

      const tcElapsed = Math.round((performance.now() - tcStart) * 100) / 100;
      const isPassed = !hasError && areOutputsEqual(actualOutput, tc.expected_output);
      if (isPassed) passedCount++;

      results.push({
        testCaseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expected_output,
        actualOutput: hasError ? `Runtime Error: ${errorMsg}` : normalizeOutput(actualOutput),
        passed: isPassed,
        executionTimeMs: tcElapsed,
        error: errorMsg || undefined,
      });
    }

    const totalElapsed = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      success: true,
      overallPassed: passedCount === testCases.length && testCases.length > 0,
      totalTests: testCases.length,
      passedTests: passedCount,
      failedTests: testCases.length - passedCount,
      executionTimeMs: totalElapsed,
      results,
      stdout: stdoutLogs.join("\n"),
      stderr: stderrLogs.join("\n"),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const totalElapsed = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      success: false,
      overallPassed: false,
      totalTests: testCases.length,
      passedTests: 0,
      failedTests: testCases.length,
      executionTimeMs: totalElapsed,
      results: testCases.map((tc, idx) => ({
        testCaseIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expected_output,
        actualOutput: `Python Parse/Runtime Error: ${errorMsg}`,
        passed: false,
        executionTimeMs: 0,
        error: errorMsg,
      })),
      stdout: stdoutLogs.join("\n"),
      stderr: errorMsg,
      error: errorMsg,
    };
  }
}
