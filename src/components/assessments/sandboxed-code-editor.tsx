"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Terminal,
  Code2,
  Clock,
  AlertTriangle,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CodeTestCase,
  CodeExecutionResponse,
  executeJavaScriptInBrowser,
  executePythonInBrowserFallback,
} from "@/lib/assessments/code-sandbox-runner";

interface SandboxedCodeEditorProps {
  questionId: string;
  language?: "python" | "javascript" | "java" | "cpp" | "sql";
  starterCode?: string;
  initialCode?: string;
  testCases?: CodeTestCase[];
  onCodeChange: (code: string) => void;
  readOnly?: boolean;
}

export function SandboxedCodeEditor({
  questionId,
  language = "python",
  starterCode = "",
  initialCode,
  testCases = [],
  onCodeChange,
  readOnly = false,
}: SandboxedCodeEditorProps) {
  const [code, setCode] = useState<string>(
    initialCode !== undefined && initialCode !== null && initialCode !== ""
      ? initialCode
      : starterCode || (language === "javascript" ? "// Write JavaScript solution\nfunction solution() {\n  \n}" : "# Write Python solution\ndef solution():\n    pass")
  );

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"testcases" | "terminal">("testcases");
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external code changes
  useEffect(() => {
    if (initialCode !== undefined && initialCode !== code && initialCode !== "") {
      setCode(initialCode);
    }
  }, [initialCode]);

  // Track cursor position
  const handleSelect = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;
    const selStart = textareaRef.current.selectionStart;
    const lines = text.substring(0, selStart).split("\n");
    setCursorPos({
      line: lines.length,
      col: (lines[lines.length - 1]?.length || 0) + 1,
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    onCodeChange(val);
    handleSelect();
  };

  // Smart Indentation and Tab Handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Run shortcut: Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runAndTestCode();
      return;
    }

    if (readOnly) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;

    // Tab & Shift+Tab handling
    if (e.key === "Tab") {
      e.preventDefault();
      const indent = "    "; // 4 spaces standard

      if (e.shiftKey) {
        // Dedent current line
        const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
        const currentLine = value.substring(lineStart, selectionStart);
        if (currentLine.startsWith("    ")) {
          const updated = value.substring(0, lineStart) + value.substring(lineStart + 4);
          setCode(updated);
          onCodeChange(updated);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, selectionStart - 4);
          }, 0);
        }
      } else {
        // Insert 4 spaces
        const updated = value.substring(0, selectionStart) + indent + value.substring(selectionEnd);
        setCode(updated);
        onCodeChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
          handleSelect();
        }, 0);
      }
    }

    // Auto-indentation on Enter
    if (e.key === "Enter") {
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = value.substring(lineStart, selectionStart);
      const match = currentLine.match(/^(\s*)/);
      const currentIndent = match ? match[1] : "";
      const extraIndent = currentLine.trim().endsWith(":") || currentLine.trim().endsWith("{") ? "    " : "";

      if (currentIndent || extraIndent) {
        e.preventDefault();
        const insert = "\n" + currentIndent + extraIndent;
        const updated = value.substring(0, selectionStart) + insert + value.substring(selectionEnd);
        setCode(updated);
        onCodeChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + insert.length;
          handleSelect();
        }, 0);
      }
    }
  };

  // Reset to starter code
  const handleResetStarter = () => {
    if (starterCode) {
      setCode(starterCode);
      onCodeChange(starterCode);
      setExecutionResult(null);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Execute and test candidate code
  const runAndTestCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionResult(null);
    setActiveTab("testcases");

    try {
      // 1. If JavaScript, execute immediately in client sandbox for true O(1) response
      if (language === "javascript") {
        const clientRes = executeJavaScriptInBrowser(code, testCases);
        setExecutionResult(clientRes);
        setIsRunning(false);
        return;
      }

      // 2. For Python or complex environments, execute via isolated server API endpoint
      const res = await fetch("/api/student/assessments/code-runner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          testCases,
        }),
      });

      if (res.ok) {
        const data: CodeExecutionResponse = await res.json();
        setExecutionResult(data);
      } else {
        // Fallback to client Python evaluator
        const fallback = executePythonInBrowserFallback(code, testCases);
        setExecutionResult(fallback);
      }
    } catch {
      // Offline fallback
      if (language === "javascript") {
        const clientRes = executeJavaScriptInBrowser(code, testCases);
        setExecutionResult(clientRes);
      } else {
        const fallback = executePythonInBrowserFallback(code, testCases);
        setExecutionResult(fallback);
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Line numbers calculation
  const lineCount = Math.max(code.split("\n").length, 12);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const fileName = language === "python" ? "solution.py" : "solution.js";
  const langDisplay = language === "python" ? "Python 3.12" : "JavaScript (ES2024)";

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-[#121620] overflow-hidden shadow-2xl flex flex-col transition-all duration-200 ${
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl border-indigo-500/50" : "w-full"
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP VS-CODE / MONACO STYLE TAB BAR                                     */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0b0e17] border-b border-slate-800/80 text-xs select-none">
        <div className="flex items-center gap-2">
          {/* Active File Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a2030] text-indigo-300 font-mono font-semibold border border-indigo-500/30 shadow-xs">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{fileName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>

          {/* Language Badge */}
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md bg-slate-800/70 text-slate-400 text-[11px] font-medium border border-slate-700/60">
            {langDisplay}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {starterCode && !readOnly && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetStarter}
              className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-8 px-2.5 font-medium"
              title="Reset code back to original starter template"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Reset Starter
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-8 px-2.5"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                <span>Copy</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 p-0"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CODE EDITING AREA (GUTTER + SYNTAX EDITOR)                            */}
      {/* ========================================================================= */}
      <div className="relative flex bg-[#0c101a] font-mono text-xs sm:text-sm min-h-[260px] max-h-[500px] overflow-hidden">
        {/* Line Numbers Gutter */}
        <div className="w-12 sm:w-14 shrink-0 bg-[#0a0d14] py-4 text-right pr-3 select-none text-slate-600 font-mono text-xs border-r border-slate-800/80 overflow-hidden">
          {lineNumbers.map((num) => (
            <div
              key={num}
              className={`leading-6 transition-colors ${
                cursorPos.line === num ? "text-indigo-400 font-bold bg-indigo-500/10 -mr-3 pr-3" : ""
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Textarea Editor */}
        <div className="relative flex-1 overflow-auto">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onClick={handleSelect}
            onKeyUp={handleSelect}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            placeholder={
              language === "python"
                ? "# Write your clean Python 3 implementation here..."
                : "// Write your JavaScript solution here..."
            }
            className="w-full h-full min-h-[260px] bg-transparent p-4 text-emerald-300 font-mono text-xs sm:text-sm leading-6 resize-none outline-none border-none focus:ring-0 whitespace-pre tab-4 selection:bg-indigo-900/50 selection:text-white"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STATUS BAR & RUN CODE CONTROL BAR                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#0a0d14] border-t border-slate-800/80">
        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          </span>
          <span className="hidden sm:inline">Spaces: 4</span>
          <span className="hidden md:inline">UTF-8</span>
          <span className="hidden lg:inline text-slate-500">Press Ctrl+Enter to test</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={runAndTestCode}
            disabled={isRunning || readOnly}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md shadow-emerald-900/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Executing Sandbox...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run & Test Code</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TEST CASE RESULTS & RUNTIME TERMINAL PANEL                             */}
      {/* ========================================================================= */}
      {(testCases.length > 0 || executionResult) && (
        <div className="border-t border-slate-800/90 bg-[#0e121c] p-4 space-y-3">
          {/* Panel Navigation & Overall Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("testcases")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "testcases"
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Test Cases ({testCases.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("terminal")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "terminal"
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Stdout & Terminal
                {executionResult && (executionResult.stdout || executionResult.stderr) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </button>
            </div>

            {/* Overall Passed / Failed Pill */}
            {executionResult && (
              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                {executionResult.overallPassed ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All Test Cases Passed ({executionResult.passedTests}/{executionResult.totalTests})
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 shadow-xs">
                    <XCircle className="w-3.5 h-3.5" />
                    {executionResult.failedTests} of {executionResult.totalTests} Failed
                  </span>
                )}
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {executionResult.executionTimeMs}ms
                </span>
              </div>
            )}
          </div>

          {/* TAB 1: TEST CASES ACCORDION / CARDS */}
          {activeTab === "testcases" && (
            <div className="space-y-3">
              {/* Test Case Selection Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {testCases.map((tc, idx) => {
                  const testRes = executionResult?.results?.[idx];
                  const hasPassed = testRes?.passed;
                  const hasExecuted = testRes !== undefined;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTestCaseIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border ${
                        selectedTestCaseIdx === idx
                          ? "bg-slate-800 text-white border-indigo-500"
                          : "bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/60"
                      }`}
                    >
                      {hasExecuted ? (
                        hasPassed ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-400" />
                        )
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                      )}
                      <span>Case {idx + 1}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Test Case Inspection Card */}
              {testCases[selectedTestCaseIdx] && (
                <div className="bg-[#090c14] rounded-xl p-3.5 border border-slate-800/80 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Test Case #{selectedTestCaseIdx + 1}</span>
                    {executionResult?.results?.[selectedTestCaseIdx] && (
                      <span
                        className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                          executionResult.results[selectedTestCaseIdx].passed
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {executionResult.results[selectedTestCaseIdx].passed ? "PASSED" : "FAILED"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Input */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400">Input:</span>
                      <pre className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-slate-200 overflow-x-auto text-xs whitespace-pre-wrap">
                        {testCases[selectedTestCaseIdx].input}
                      </pre>
                    </div>

                    {/* Expected Output */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400">Expected Output:</span>
                      <pre className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-emerald-400 overflow-x-auto text-xs whitespace-pre-wrap">
                        {testCases[selectedTestCaseIdx].expected_output}
                      </pre>
                    </div>
                  </div>

                  {/* Actual Output from Execution */}
                  {executionResult?.results?.[selectedTestCaseIdx] && (
                    <div className="space-y-1 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Actual Output from Code:</span>
                        <span className="text-[10px] text-slate-500">
                          Execution: {executionResult.results[selectedTestCaseIdx].executionTimeMs}ms
                        </span>
                      </div>
                      <pre
                        className={`p-2.5 rounded-lg border overflow-x-auto text-xs whitespace-pre-wrap ${
                          executionResult.results[selectedTestCaseIdx].passed
                            ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                            : "bg-rose-950/20 border-rose-500/40 text-rose-300 font-bold"
                        }`}
                      >
                        {executionResult.results[selectedTestCaseIdx].actualOutput}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TERMINAL / STDOUT / STDERR */}
          {activeTab === "terminal" && (
            <div className="rounded-xl bg-black p-4 border border-slate-800 font-mono text-xs space-y-2 min-h-[120px]">
              <div className="text-slate-500 text-[11px] flex items-center justify-between pb-1 border-b border-slate-800">
                <span>Console Output (stdout / stderr)</span>
                <span>Sandboxed Execution Shell</span>
              </div>

              {executionResult ? (
                <div className="space-y-2">
                  {executionResult.stdout && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">stdout:</span>
                      <pre className="text-emerald-400 whitespace-pre-wrap leading-5">
                        {executionResult.stdout}
                      </pre>
                    </div>
                  )}

                  {executionResult.stderr && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-rose-500 uppercase tracking-wider">stderr / traceback:</span>
                      <pre className="text-rose-400 whitespace-pre-wrap leading-5">
                        {executionResult.stderr}
                      </pre>
                    </div>
                  )}

                  {!executionResult.stdout && !executionResult.stderr && (
                    <div className="text-slate-500 italic py-2">
                      Code executed successfully with zero stdout / console logs.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-600 italic py-4 text-center">
                  Click &quot;Run &amp; Test Code&quot; to compile and execute in the live sandbox.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
