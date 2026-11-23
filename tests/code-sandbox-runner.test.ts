import { describe, it, expect } from "vitest";
import {
  executeJavaScriptInBrowser,
  executePythonInBrowserFallback,
  areOutputsEqual,
  CodeTestCase,
} from "../src/lib/assessments/code-sandbox-runner";

describe("In-Browser Sandboxed Code Execution Runner", () => {
  it("executes JavaScript code against test cases with stdout capture", () => {
    const code = `
      function flattenArray(nested) {
        console.log("Flattening array:", JSON.stringify(nested));
        return nested.flat(Infinity);
      }
    `;

    const testCases: CodeTestCase[] = [
      {
        input: "[1, [2, [3, [4]], 5]]",
        expected_output: "[1, 2, 3, 4, 5]",
      },
      {
        input: "[['a'], 'b', ['c', ['d']]]",
        expected_output: "['a', 'b', 'c', 'd']",
      },
    ];

    const result = executeJavaScriptInBrowser(code, testCases);
    expect(result.success).toBe(true);
    expect(result.overallPassed).toBe(true);
    expect(result.totalTests).toBe(2);
    expect(result.passedTests).toBe(2);
    expect(result.failedTests).toBe(0);
    expect(result.stdout).toContain("Flattening array");
    expect(result.results[0].passed).toBe(true);
    expect(result.results[1].passed).toBe(true);
  });

  it("handles JavaScript syntax errors and failed test cases gracefully", () => {
    const faultyCode = `
      function faultyAdd(arr) {
        return arr.map(x => x * 100); // Incorrect logic
      }
    `;

    const testCases: CodeTestCase[] = [
      {
        input: "[1, 2, 3]",
        expected_output: "[1, 2, 3]", // Expected without * 100
      },
    ];

    const result = executeJavaScriptInBrowser(faultyCode, testCases);
    expect(result.success).toBe(true);
    expect(result.overallPassed).toBe(false);
    expect(result.passedTests).toBe(0);
    expect(result.failedTests).toBe(1);
    expect(result.results[0].passed).toBe(false);
  });

  it("evaluates Python algorithmic functions in client sandbox", () => {
    const pyCode = `
def relu_activation(values: list[float]) -> list[float]:
    # ReLU applies max(0, x)
    return [max(0.0, float(x)) for x in values]
    `;

    const testCases: CodeTestCase[] = [
      {
        input: "[-2.5, 0.0, 3.2, -1.0, 5.0]",
        expected_output: "[0.0, 0.0, 3.2, 0.0, 5.0]",
      },
      {
        input: "[-5.0, -10.0]",
        expected_output: "[0.0, 0.0]",
      },
    ];

    const result = executePythonInBrowserFallback(pyCode, testCases);
    expect(result.success).toBe(true);
    expect(result.overallPassed).toBe(true);
    expect(result.totalTests).toBe(2);
    expect(result.passedTests).toBe(2);
  });

  it("compares outputs accurately across different data types", () => {
    expect(areOutputsEqual("[1, 2, 3]", "[1,2,3]")).toBe(true);
    expect(areOutputsEqual([0.0, 3.2], "[0.0, 3.2]")).toBe(true);
    expect(areOutputsEqual(true, "True")).toBe(true);
    expect(areOutputsEqual(false, "False")).toBe(true);
    expect(areOutputsEqual("hello world", "hello world")).toBe(true);
    expect(areOutputsEqual("42", "43")).toBe(false);
  });
});
