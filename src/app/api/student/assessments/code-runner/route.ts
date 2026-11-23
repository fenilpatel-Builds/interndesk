import { NextRequest, NextResponse } from "next/server";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import {
  CodeTestCase,
  TestCaseResult,
  areOutputsEqual,
  executePythonInBrowserFallback,
} from "@/lib/assessments/code-sandbox-runner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, language = "python", testCases = [] } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code content is required for execution." }, { status: 400 });
    }

    const startTime = performance.now();
    const normalizedLang = String(language).toLowerCase().trim();

    // 1. JAVASCRIPT EXECUTION VIA NODE:VM
    if (normalizedLang === "javascript" || normalizedLang === "js") {
      const stdoutLogs: string[] = [];
      const stderrLogs: string[] = [];

      const sandbox = {
        console: {
          log: (...args: any[]) =>
            stdoutLogs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
          error: (...args: any[]) => stderrLogs.push(args.map(String).join(" ")),
          warn: (...args: any[]) => stdoutLogs.push("[WARN] " + args.map(String).join(" ")),
        },
        setTimeout: () => { throw new Error("Asynchronous setTimeout is disabled in exam sandbox."); },
        setInterval: () => { throw new Error("Asynchronous setInterval is disabled in exam sandbox."); },
      };

      const context = vm.createContext(sandbox);

      const fnMatch = code.match(/function\s+([a-zA-Z0-9_$]+)/);
      const constFnMatch = code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/);
      const targetFnName = fnMatch ? fnMatch[1] : constFnMatch ? constFnMatch[1] : null;

      try {
        const script = new vm.Script(code + (targetFnName ? `\n;${targetFnName};` : ""));
        const userFn = script.runInContext(context, { timeout: 2500 });

        const results: TestCaseResult[] = [];
        let passedCount = 0;

        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const tcStart = performance.now();
          let actualOutput: any = "";
          let hasError = false;
          let errorMsg = "";

          try {
            let parsedInput: any;
            try {
              parsedInput = JSON.parse(tc.input);
            } catch {
              parsedInput = tc.input;
            }

            if (typeof userFn === "function") {
              if (Array.isArray(parsedInput) && userFn.length > 1) {
                actualOutput = userFn(...parsedInput);
              } else {
                actualOutput = userFn(parsedInput);
              }
            } else {
              actualOutput = stdoutLogs.length > 0 ? stdoutLogs[stdoutLogs.length - 1] : "";
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
            actualOutput: hasError ? `Runtime Error: ${errorMsg}` : String(actualOutput ?? ""),
            passed: isPassed,
            executionTimeMs: tcElapsed,
            error: errorMsg || undefined,
          });
        }

        const totalElapsed = Math.round((performance.now() - startTime) * 100) / 100;

        return NextResponse.json({
          success: true,
          overallPassed: passedCount === testCases.length && testCases.length > 0,
          totalTests: testCases.length,
          passedTests: passedCount,
          failedTests: testCases.length - passedCount,
          executionTimeMs: totalElapsed,
          results,
          stdout: stdoutLogs.join("\n"),
          stderr: stderrLogs.join("\n"),
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const totalElapsed = Math.round((performance.now() - startTime) * 100) / 100;
        return NextResponse.json({
          success: false,
          overallPassed: false,
          totalTests: testCases.length,
          passedTests: 0,
          failedTests: testCases.length,
          executionTimeMs: totalElapsed,
          results: testCases.map((tc: CodeTestCase, idx: number) => ({
            testCaseIndex: idx + 1,
            input: tc.input,
            expectedOutput: tc.expected_output,
            actualOutput: `Error: ${errorMsg}`,
            passed: false,
            executionTimeMs: 0,
            error: errorMsg,
          })),
          stdout: stdoutLogs.join("\n"),
          stderr: errorMsg,
          error: errorMsg,
        });
      }
    }

    // 2. PYTHON EXECUTION VIA CHILD_PROCESS WITH FALLBACK
    if (normalizedLang === "python" || normalizedLang === "py") {
      // Find candidate function name
      const fnMatch = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
      const fnName = fnMatch ? fnMatch[1] : null;

      const pythonDriver = `
import sys, json

student_code = ${JSON.stringify(code)}
test_cases = ${JSON.stringify(testCases)}
fn_name = ${JSON.stringify(fnName)}

globs = {}
try:
    exec(student_code, globs)
except Exception as e:
    print(json.dumps({"syntax_error": str(e)}))
    sys.exit(0)

fn = globs.get(fn_name) if fn_name else None

results = []
for idx, tc in enumerate(test_cases):
    inp_raw = tc.get("input", "")
    exp_raw = tc.get("expected_output", "")
    try:
        try:
            inp_val = json.loads(inp_raw)
        except Exception:
            inp_val = eval(inp_raw)
    except Exception:
        inp_val = inp_raw

    try:
        try:
            exp_val = json.loads(exp_raw)
        except Exception:
            exp_val = eval(exp_raw)
    except Exception:
        exp_val = exp_raw

    try:
        if callable(fn):
            if isinstance(inp_val, list) and fn.__code__.co_argcount > 1:
                res = fn(*inp_val)
            else:
                res = fn(inp_val)
        else:
            res = None

        passed = (res == exp_val)
        results.append({
            "testCaseIndex": idx + 1,
            "input": inp_raw,
            "expectedOutput": exp_raw,
            "actualOutput": json.dumps(res) if isinstance(res, (list, dict)) else str(res),
            "passed": passed,
            "executionTimeMs": 1.0
        })
    except Exception as e:
        results.append({
            "testCaseIndex": idx + 1,
            "input": inp_raw,
            "expectedOutput": exp_raw,
            "actualOutput": f"Runtime Error: {str(e)}",
            "passed": False,
            "executionTimeMs": 1.0,
            "error": str(e)
        })

print(json.dumps({"results": results}))
`;

      try {
        const proc = spawnSync("python", ["-c", pythonDriver], {
          timeout: 4000,
          encoding: "utf-8",
        });

        if (proc.status === 0 && proc.stdout) {
          const parsed = JSON.parse(proc.stdout.trim());
          if (parsed.syntax_error) {
            const totalElapsed = Math.round((performance.now() - startTime) * 100) / 100;
            return NextResponse.json({
              success: false,
              overallPassed: false,
              totalTests: testCases.length,
              passedTests: 0,
              failedTests: testCases.length,
              executionTimeMs: totalElapsed,
              results: testCases.map((tc: CodeTestCase, idx: number) => ({
                testCaseIndex: idx + 1,
                input: tc.input,
                expectedOutput: tc.expected_output,
                actualOutput: `Python Syntax Error: ${parsed.syntax_error}`,
                passed: false,
                executionTimeMs: 0,
                error: parsed.syntax_error,
              })),
              stdout: "",
              stderr: parsed.syntax_error,
              error: parsed.syntax_error,
            });
          }

          if (Array.isArray(parsed.results)) {
            const passedCount = parsed.results.filter((r: TestCaseResult) => r.passed).length;
            const totalElapsed = Math.round((performance.now() - startTime) * 100) / 100;
            return NextResponse.json({
              success: true,
              overallPassed: passedCount === testCases.length && testCases.length > 0,
              totalTests: testCases.length,
              passedTests: passedCount,
              failedTests: testCases.length - passedCount,
              executionTimeMs: totalElapsed,
              results: parsed.results,
              stdout: proc.stdout.substring(0, 1000),
              stderr: proc.stderr || "",
            });
          }
        }
      } catch {
        // Fallback to internal Python emulator if Python binary is missing on serverless host
      }

      // Safe fallback
      const fallbackResult = executePythonInBrowserFallback(code, testCases);
      return NextResponse.json(fallbackResult);
    }

    return NextResponse.json({ error: `Unsupported programming language: ${language}` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Code execution failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
