// ✅ ProblemPage.jsx — LeetCode-style Full Page (Final)

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { Play, Send, Loader2, ChevronUp, ChevronDown } from "lucide-react";

const LANGUAGE_MAP = {
  "c++": { monacoLang: "cpp", label: "C++" },
  java: { monacoLang: "java", label: "Java" },
  javascript: { monacoLang: "javascript", label: "JavaScript" },
};

// ✅ Normalize DB language names to internal keys
const normalizeLanguage = (lang) => {
  if (!lang) return "c++";
  const lower = String(lang).toLowerCase();
  if (lower === "c++" || lower === "cpp") return "c++";
  if (lower === "java") return "java";
  if (lower === "javascript" || lower === "js") return "javascript";
  return lower;
};

const API_BASE_URL = "http://localhost:3000";
axios.defaults.withCredentials = true;

export default function ProblemPage() {
  const { id: problemId } = useParams();

  // ✅ Core state
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedLanguage, setSelectedLanguage] = useState("c++");
  const [code, setCode] = useState("");
  const [codeByLanguage, setCodeByLanguage] = useState({});

  // Left panel tabs
  const [descriptionTab, setDescriptionTab] = useState("description"); // description | solutions | submissions
  const [descriptionOpen, setDescriptionOpen] = useState(true);

  // Console tabs
  const [consoleTab, setConsoleTab] = useState("testcases"); // testcases | output | submission | custom

  // Run / submit results
  const [runOutput, setRunOutput] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Submission history
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Custom input
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState(null);

  // Flags
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Manual timer (Option 2: start/pause/resume/reset)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStartTimer = () => {
    setTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setTimerRunning(false);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  // ✅ FETCH PROBLEM + BOILERPLATE FROM DB
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${API_BASE_URL}/problem/getProblemById/${problemId}`
        );
        const prob = res.data;
        setProblem(prob);

        // Build starter code map: { "c++": "...", "java": "...", ... }
        const starterMap = {};
        prob.startCode?.forEach((sc) => {
          const lang = normalizeLanguage(sc.language);
          starterMap[lang] = sc.initialCode || "";
        });

        setCodeByLanguage(starterMap);

        // Decide initial language
        let initialLang =
          normalizeLanguage(prob.startCode?.[0]?.language) || "c++";

        if (!starterMap[initialLang]) {
          // fallback to c++ if present
          if (starterMap["c++"]) initialLang = "c++";
          // or first available language
          else if (Object.keys(starterMap).length > 0) {
            initialLang = Object.keys(starterMap)[0];
          }
        }

        setSelectedLanguage(initialLang);
        setCode(starterMap[initialLang] || "");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load problem");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // ✅ FETCH SUBMISSION HISTORY (when opening Submissions tab)
  const fetchSubmissionHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await axios.get(
        `${API_BASE_URL}/problem/submittedProblem/${problemId}`
      );
      const data = Array.isArray(res.data) ? res.data.slice().reverse() : [];
      setSubmissionHistory(data);
    } catch {
      setSubmissionHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // ✅ RUN CODE (visible testcases)
  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setError(null);
      setConsoleTab("output");
      setRunOutput(null);

      const response = await axios.post(
        `${API_BASE_URL}/submission/run/${problemId}`,
        {
          code,
          language: normalizeLanguage(selectedLanguage),
        }
      );

      setRunOutput(response.data);
    } catch (err) {
      setError(err.response?.data || "Run failed");
    } finally {
      setIsRunning(false);
    }
  };

  // ✅ SUBMIT CODE (hidden testcases)
  const handleSubmitCode = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setConsoleTab("submission");
      setSubmissionResult(null);

      const response = await axios.post(
        `${API_BASE_URL}/submission/submit/${problemId}`,
        {
          code,
          language: normalizeLanguage(selectedLanguage),
        }
      );

      setSubmissionResult(response.data);
    } catch (err) {
      setError(err.response?.data || "Submit failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ RUN with CUSTOM INPUT
  const handleRunCustom = async () => {
    try {
      setIsRunning(true);
      setError(null);
      setCustomOutput(null);

      const response = await axios.post(
        `${API_BASE_URL}/submission/run/${problemId}`,
        {
          code,
          language: normalizeLanguage(selectedLanguage),
          stdin: customInput, // backend may ignore, but safe to send
        }
      );

      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        setCustomOutput(
          data[0].stdout || data[0].stderr || JSON.stringify(data, null, 2)
        );
      } else if (data && typeof data === "object") {
        setCustomOutput(
          data.stdout || data.stderr || JSON.stringify(data, null, 2)
        );
      } else {
        setCustomOutput(String(data));
      }
    } catch {
      setCustomOutput("Error running custom input.");
    } finally {
      setIsRunning(false);
    }
  };

  // ✅ LANGUAGE SWITCH — preserve code per language
  const handleLanguageChange = (key) => {
    const lang = normalizeLanguage(key);
    setSelectedLanguage(lang);

    // restore if user typed before
    if (codeByLanguage[lang] !== undefined) {
      setCode(codeByLanguage[lang]);
      return;
    }

    // else use backend starter code for that language if available
    if (problem?.startCode) {
      const block = problem.startCode.find(
        (sc) => normalizeLanguage(sc.language) === lang
      );
      if (block?.initialCode) {
        setCode(block.initialCode);
        return;
      }
    }

    // default empty
    setCode("");
  };

  // ✅ On editor change, store per language
  const handleCodeChange = (value) => {
    const newCode = value || "";
    setCode(newCode);
    setCodeByLanguage((prev) => ({
      ...prev,
      [selectedLanguage]: newCode,
    }));
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  // ✅ NULL SAFETY
  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <p className="text-red-400 text-lg">Problem not found.</p>
      </div>
    );
  }

  // ✅ Difficulty style (DaisyUI)
  const difficultyClass =
    problem.difficulty === "easy"
      ? "badge-success"
      : problem.difficulty === "medium"
      ? "badge-warning"
      : "badge-error";

  // ✅ Helpers for run output coloring
  const isCaseAccepted = (r) =>
    r?.status_id === 3 || r?.status?.id === 3 || r?.status === "accepted";

  let allRunAccepted = false;
  if (Array.isArray(runOutput) && runOutput.length > 0) {
    allRunAccepted = runOutput.every(isCaseAccepted);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* ✅ HEADER */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-8 py-4 flex items-center justify-between">
        {/* Left: title, difficulty, tags */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {problem.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Difficulty badge */}
            <span className={`badge ${difficultyClass} badge-lg font-semibold`}>
              {problem.difficulty?.toUpperCase()}
            </span>

            {/* Tags */}
            {problem.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="badge badge-outline border-neutral-600 text-xs uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Timer controls */}
        <div className="flex flex-col items-end gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Time Spent</span>
            <span className="badge badge-neutral badge-md font-mono">
              {formatTime(timerSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Start / Pause / Resume logic */}
            {!timerRunning && timerSeconds === 0 && (
              <button
                onClick={handleStartTimer}
                className="btn btn-xs md:btn-sm btn-success"
              >
                Start
              </button>
            )}

            {timerRunning && (
              <button
                onClick={handlePauseTimer}
                className="btn btn-xs md:btn-sm btn-warning"
              >
                Pause
              </button>
            )}

            {!timerRunning && timerSeconds > 0 && (
              <button
                onClick={handleStartTimer}
                className="btn btn-xs md:btn-sm btn-success"
              >
                Resume
              </button>
            )}

            <button
              onClick={handleResetTimer}
              disabled={timerSeconds === 0}
              className="btn btn-xs md:btn-sm btn-ghost border border-neutral-600"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* ✅ MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* ✅ LEFT PANEL — DESCRIPTION / SOLUTIONS / SUBMISSIONS */}
        <div
          className={`bg-neutral-900 border-r border-neutral-800 transition-all duration-200 flex flex-col ${
            descriptionOpen ? "w-full md:w-[50%]" : "w-0 md:w-0"
          } overflow-hidden`}
        >
          {/* Tabs */}
          <div className="flex items-center border-b border-neutral-800">
            {["description", "solutions", "submissions"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setDescriptionTab(tab);
                  if (tab === "submissions") fetchSubmissionHistory();
                }}
                className={`px-5 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors ${
                  descriptionTab === tab
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-8 py-5 text-sm">
            {/* DESCRIPTION TAB */}
            {descriptionTab === "description" && (
              <div className="space-y-8">
                {/* Main description (HTML from backend) */}
                <div
                  className="prose prose-invert max-w-none text-neutral-200"
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                />

                {/* Examples from visibleTestCases */}
                {problem.visibleTestCases?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-100">
                      Examples
                    </h3>
                    {problem.visibleTestCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="bg-neutral-800/70 border border-neutral-700 rounded-lg p-4 space-y-3"
                      >
                        <p className="text-xs font-semibold text-neutral-400">
                          Example {idx + 1}
                        </p>

                        <div>
                          <p className="text-xs text-neutral-400">Input:</p>
                          <pre className="mt-1 bg-neutral-950 rounded p-3 text-xs text-neutral-100 whitespace-pre-wrap">
                            {tc.input}
                          </pre>
                        </div>

                        <div>
                          <p className="text-xs text-neutral-400">Output:</p>
                          <pre className="mt-1 bg-neutral-950 rounded p-3 text-xs text-neutral-100 whitespace-pre-wrap">
                            {tc.output}
                          </pre>
                        </div>

                        {tc.explanation && (
                          <div>
                            <p className="text-xs text-neutral-400">
                              Explanation:
                            </p>
                            <p className="mt-1 text-xs text-neutral-200">
                              {tc.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional constraints if backend sends them */}
                {problem.constraints && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-neutral-100">
                      Constraints
                    </h3>
                    <pre className="bg-neutral-900 border border-neutral-800 rounded p-3 text-xs whitespace-pre-wrap">
                      {problem.constraints}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* SOLUTIONS TAB */}
            {descriptionTab === "solutions" && (
              <div className="space-y-4">
                {problem.referenceSolution?.length ? (
                  problem.referenceSolution.map((sol, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-800/70 border border-neutral-700 rounded-lg p-4 space-y-2"
                    >
                      <p className="text-xs font-semibold text-orange-400 uppercase">
                        {sol.language}
                      </p>
                      <pre className="bg-neutral-950 rounded p-3 text-xs text-neutral-100 whitespace-pre-wrap overflow-x-auto">
                        {sol.completeCode}
                      </pre>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-400 text-sm">
                    Editorial is locked or not available yet.
                  </p>
                )}
              </div>
            )}

            {/* SUBMISSIONS TAB */}
            {descriptionTab === "submissions" && (
              <div className="space-y-4">
                {loadingHistory && (
                  <p className="text-neutral-400 text-sm">Loading...</p>
                )}

                {!loadingHistory && submissionHistory.length === 0 && (
                  <p className="text-neutral-500 text-sm text-center">
                    No submissions yet. Solve &amp; submit to see history.
                  </p>
                )}

                {!loadingHistory &&
                  submissionHistory.map((sub, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-800/60 border border-neutral-700 rounded-lg p-4 space-y-2"
                    >
                      <p
                        className={`text-sm font-semibold ${
                          sub.status === "accepted"
                            ? "text-green-400"
                            : sub.status === "wrong"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {sub.status?.toUpperCase()}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleString()
                          : ""}
                      </p>
                      <p className="text-xs text-neutral-300">
                        Passed: {sub.testCasesPassed}/{sub.testCasesTotal}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* ✅ RIGHT PANEL — EDITOR + CONSOLE */}
        <div className="flex flex-col flex-1 bg-neutral-900">
          {/* Top bar: languages + actions */}
          <div className="border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
            {/* Languages */}
            <div className="flex gap-2">
              {Object.entries(LANGUAGE_MAP).map(([key, lang]) => (
                <button
                  key={key}
                  onClick={() => handleLanguageChange(key)}
                  className={`btn btn-xs md:btn-sm rounded-md ${
                    normalizeLanguage(selectedLanguage) === key
                      ? "btn-primary"
                      : "btn-ghost text-neutral-400"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="btn btn-xs md:btn-sm btn-info flex items-center gap-1"
              >
                {isRunning ? (
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 md:w-4 md:h-4" />
                )}
                <span>Run</span>
              </button>

              <button
                onClick={() => setConsoleTab("custom")}
                className={`btn btn-xs md:btn-sm ${
                  consoleTab === "custom"
                    ? "btn-accent"
                    : "btn-ghost text-blue-400 border border-blue-700/60"
                }`}
              >
                Custom Input
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="btn btn-xs md:btn-sm btn-warning flex items-center gap-1"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                ) : (
                  <Send className="w-3 h-3 md:w-4 md:h-4" />
                )}
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              language={
                LANGUAGE_MAP[normalizeLanguage(selectedLanguage)]?.monacoLang ||
                "cpp"
              }
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                tabSize: 2,
                lineNumbers: "on",
                wordWrap: "on",
                automaticLayout: true,
                fontFamily: "Fira Code, monospace",
              }}
            />
          </div>

          {/* Console */}
          <div className="bg-neutral-900 border-t border-neutral-800 h-64 flex flex-col">
            {/* Console tabs */}
            <div className="flex items-center border-b border-neutral-800">
              {["testcases", "output", "submission", "custom"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setConsoleTab(tab)}
                  className={`px-4 py-2 text-xs md:text-sm border-b-2 ${
                    consoleTab === tab
                      ? "border-orange-500 text-orange-400"
                      : "border-transparent text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}

              {/* Toggle left panel */}
              <button
                onClick={() => setDescriptionOpen((prev) => !prev)}
                className="ml-auto pr-4 text-neutral-400 hover:text-neutral-200"
              >
                {descriptionOpen ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Console content */}
            <div className="flex-1 overflow-y-auto p-4 text-xs md:text-sm font-mono text-neutral-200">
              {/* Error block */}
              {error && (
                <div className="mb-3 p-3 rounded bg-red-900/40 border border-red-700 text-red-200 whitespace-pre-wrap">
                  {typeof error === "string"
                    ? error
                    : JSON.stringify(error, null, 2)}
                </div>
              )}

              {/* Testcases tab */}
              {consoleTab === "testcases" &&
                problem.visibleTestCases?.length > 0 && (
                  <div className="space-y-3">
                    {problem.visibleTestCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded bg-neutral-800/70 border border-neutral-700"
                      >
                        <p className="font-semibold mb-1">Case {idx + 1}</p>
                        <p>
                          <span className="text-blue-400">Input:</span>{" "}
                          {tc.input}
                        </p>
                        <p>
                          <span className="text-green-400">Output:</span>{" "}
                          {tc.output}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* Output tab (Run) */}
              {consoleTab === "output" && (
                <div className="space-y-3">
                  {isRunning && (
                    <p className="flex items-center gap-2 text-neutral-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running...
                    </p>
                  )}

                  {/* Summary banner like LeetCode */}
                  {Array.isArray(runOutput) && runOutput.length > 0 && (
                    <div
                      className={`p-3 rounded text-sm font-semibold ${
                        allRunAccepted
                          ? "bg-green-900/40 text-green-300 border border-green-700/60"
                          : "bg-red-900/40 text-red-300 border border-red-700/60"
                      }`}
                    >
                      {allRunAccepted
                        ? "All visible testcases passed ✓"
                        : "Some visible testcases failed ✗"}
                    </div>
                  )}

                  {/* Per testcase result */}
                  {Array.isArray(runOutput) &&
                    runOutput.map((r, idx) => {
                      const accepted = isCaseAccepted(r);
                      return (
                        <div
                          key={idx}
                          className={`mt-1 p-3 rounded border text-xs space-y-1 ${
                            accepted
                              ? "bg-green-900/20 border-green-700 text-green-200"
                              : "bg-red-900/20 border-red-700 text-red-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">Test Case {idx + 1}</p>
                            <span
                              className={`badge badge-sm ${
                                accepted ? "badge-success" : "badge-error"
                              }`}
                            >
                              {accepted ? "Success" : "Failed"}
                            </span>
                          </div>

                          {r.stdout && (
                            <div>
                              <p className="text-[10px] opacity-80 mb-1">
                                Stdout
                              </p>
                              <pre className="whitespace-pre-wrap bg-black/20 rounded p-2">
                                {r.stdout}
                              </pre>
                            </div>
                          )}

                          {r.stderr && (
                            <div>
                              <p className="text-[10px] opacity-80 mb-1">
                                Stderr
                              </p>
                              <pre className="whitespace-pre-wrap bg-black/20 rounded p-2">
                                {r.stderr}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {!isRunning && !runOutput && (
                    <p className="text-neutral-500">
                      Run your code to see output.
                    </p>
                  )}
                </div>
              )}

              {/* Submission tab */}
              {consoleTab === "submission" && (
                <div>
                  {isSubmitting && (
                    <p className="flex items-center gap-2 text-neutral-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </p>
                  )}

                  {submissionResult && (
                    <div className="space-y-4 mt-2">
                      <div
                        className={`p-4 rounded text-center font-bold text-base
                          ${
                            submissionResult.status === "accepted"
                              ? "bg-green-900/40 text-green-300"
                              : submissionResult.status === "wrong"
                              ? "bg-red-900/40 text-red-300"
                              : "bg-yellow-900/40 text-yellow-300"
                          }`}
                      >
                        {submissionResult.status === "accepted"
                          ? "✓ Accepted"
                          : submissionResult.status === "wrong"
                          ? "✗ Wrong Answer"
                          : "⚠ Error"}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-2 rounded bg-neutral-800/60 text-center">
                          <p className="text-[10px] text-neutral-400">Passed</p>
                          <p className="text-sm font-bold">
                            {submissionResult.testCasesPassed}/
                            {submissionResult.testCasesTotal}
                          </p>
                        </div>

                        <div className="p-2 rounded bg-neutral-800/60 text-center">
                          <p className="text-[10px] text-neutral-400">
                            Runtime
                          </p>
                          <p className="text-sm font-bold">
                            {submissionResult.runtime?.toFixed(3)}s
                          </p>
                        </div>

                        <div className="p-2 rounded bg-neutral-800/60 text-center">
                          <p className="text-[10px] text-neutral-400">Memory</p>
                          <p className="text-sm font-bold">
                            {submissionResult.memory} KB
                          </p>
                        </div>
                      </div>

                      {submissionResult.errorMessage && (
                        <pre className="p-3 rounded bg-red-900/40 border border-red-700 text-red-200 whitespace-pre-wrap">
                          {submissionResult.errorMessage}
                        </pre>
                      )}
                    </div>
                  )}

                  {!isSubmitting && !submissionResult && (
                    <p className="text-neutral-500">
                      Submit your code to evaluate against all testcases.
                    </p>
                  )}
                </div>
              )}

              {/* Custom tab */}
              {consoleTab === "custom" && (
                <div className="space-y-3">
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input..."
                    className="textarea textarea-bordered w-full h-28 bg-neutral-800 border-neutral-700 text-neutral-100"
                  />
                  <button
                    onClick={handleRunCustom}
                    disabled={isRunning}
                    className="btn btn-sm btn-accent"
                  >
                    {isRunning ? "Running..." : "Run Custom Input"}
                  </button>

                  {customOutput && (
                    <pre className="mt-2 p-3 rounded bg-neutral-800/70 border border-neutral-700 whitespace-pre-wrap">
                      {customOutput}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
