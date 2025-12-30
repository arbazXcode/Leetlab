import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { useNavigate, useParams } from "react-router-dom";

/**
 * AdminPanel.jsx — LeetCode Dark (Unified Create & Edit)
 * - Handles /admin (Create)
 * - Handles /admin/edit/:id (Edit)
 */

const LANGS = [
  { key: "cpp", label: "C++" },
  { key: "java", label: "Java" },
  { key: "javascript", label: "JavaScript" },
];

const IconPlus = () => (
  <svg
    className="inline-block w-4 h-4 mr-1"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

const IconTrash = () => (
  <svg className="inline-block w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M6.5 3.5A1 1 0 017.5 2h5a1 1 0 011 .999V4h2.25a.75.75 0 010 1.5H3.25a.75.75 0 010-1.5H5v-.001zM4 6.5h12l-.9 9.5a2 2 0 01-2 1.9H8.9a2 2 0 01-2-1.9L6 6.5z"
      clipRule="evenodd"
    />
  </svg>
);

const Spinner = () => <span className="loading loading-spinner loading-sm" />;

function Badge({ difficulty = "easy" }) {
  const cls =
    difficulty === "easy"
      ? "badge-success"
      : difficulty === "medium"
      ? "badge-warning"
      : "badge-error";
  return <span className={`badge ${cls} lowercase`}>{difficulty}</span>;
}

export default function AdminPanel() {
  const { user } = useSelector((s) => s.auth || { auth: {} });
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL
  const isEditMode = Boolean(id); // True if we are editing

  // Auth check
  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") navigate("/", { replace: true });
  }, [user, navigate]);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [tags, setTags] = useState([]);
  const [visibleTestCases, setVisibleTestCases] = useState([
    { input: "", output: "", explanation: "" },
  ]);
  const [hiddenTestCases, setHiddenTestCases] = useState([
    { input: "", output: "" },
  ]);

  // Fixed three languages
  const [startCode, setStartCode] = useState(
    LANGS.map((l) => ({ language: l.key, initialCode: "" }))
  );
  const [referenceSolution, setReferenceSolution] = useState(
    LANGS.map((l) => ({ language: l.key, completeCode: "" }))
  );

  // General State
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // 1. Fetch Problem for Editing
  useEffect(() => {
    if (!isEditMode) {
      // Reset form if switching from Edit to Create
      resetForm();
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await axiosClient.get(`/problem/getProblemById/${id}`);
        const p = res.data;
        setTitle(p.title);
        setDescription(p.description);
        setDifficulty(p.difficulty);
        setTags(p.tags || []);
        setVisibleTestCases(
          p.visibleTestCases?.length
            ? p.visibleTestCases
            : [{ input: "", output: "", explanation: "" }]
        );
        setHiddenTestCases(
          p.hiddenTestCases?.length
            ? p.hiddenTestCases
            : [{ input: "", output: "" }]
        );

        // Merge fetched codes with default structure to ensure all languages exist
        if (p.startCode) {
          setStartCode((prev) =>
            prev.map((l) => {
              const found = p.startCode.find(
                (sc) => sc.language === l.language
              );
              return found ? { ...l, initialCode: found.initialCode } : l;
            })
          );
        }
        if (p.referenceSolution) {
          setReferenceSolution((prev) =>
            prev.map((l) => {
              const found = p.referenceSolution.find(
                (rc) => rc.language === l.language
              );
              return found ? { ...l, completeCode: found.completeCode } : l;
            })
          );
        }
      } catch (err) {
        setError("Failed to load problem for editing.", err);
      }
    };
    fetchDetails();
  }, [id, isEditMode]);

  // 2. Fetch All Problems (Sidebar)
  const fetchProblems = async () => {
    try {
      setLoadingProblems(true);
      const res = await axiosClient.get("/problem/getAllProblem");
      setProblems(res.data || []);
    } catch (err) {
      setError("Failed to load problems.", err);
    } finally {
      setLoadingProblems(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // Helpers
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDifficulty("easy");
    setTags([]);
    setVisibleTestCases([{ input: "", output: "", explanation: "" }]);
    setHiddenTestCases([{ input: "", output: "" }]);
    setStartCode(LANGS.map((l) => ({ language: l.key, initialCode: "" })));
    setReferenceSolution(
      LANGS.map((l) => ({ language: l.key, completeCode: "" }))
    );
    setError(null);
    setMessage(null);
  };

  const updateArrayItem = (setter, idx, key, value) =>
    setter((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it))
    );
  const addArrayItem = (setter, item) => setter((prev) => [...prev, item]);
  const removeArrayItem = (setter, idx) =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  const handleTagsChange = (raw) =>
    setTags(
      raw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    );

  // Validation
  const validate = (payload) => {
    const errs = [];
    if (!payload.title) errs.push("Title is required.");
    if (!payload.description) errs.push("Description is required.");
    if (payload.visibleTestCases.length === 0)
      errs.push("Add at least one visible testcase.");
    if (payload.hiddenTestCases.length === 0)
      errs.push("Add at least one hidden testcase.");
    return errs;
  };

  const buildPayload = () => ({
    title: title.trim(),
    description: description.trim(),
    difficulty,
    tags,
    visibleTestCases: visibleTestCases.filter((t) => t.input && t.output),
    hiddenTestCases: hiddenTestCases.filter((t) => t.input && t.output),
    startCode: startCode.map((s) => ({
      language: s.language,
      initialCode: s.initialCode ?? "",
    })),
    referenceSolution: referenceSolution.map((r) => ({
      language: r.language,
      completeCode: r.completeCode ?? "",
    })),
  });

  // 3. Handle Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const payload = buildPayload();
    const errs = validate(payload);
    if (errs.length) {
      setError(errs.join("\n"));
      return;
    }

    try {
      setSubmitting(true);
      if (isEditMode) {
        // UPDATE MODE
        await axiosClient.put(`/problem/update/${id}`, payload);
        setMessage("Problem updated successfully.");
        // We stay in edit mode, but refresh sidebar
      } else {
        // CREATE MODE
        await axiosClient.post("/problem/create", payload);
        setMessage("Problem created successfully.");
        resetForm();
      }
      await fetchProblems();
    } catch (err) {
      console.error(err);
      const server =
        err?.response?.data?.message || err?.message || "Operation failed";
      setError(String(server));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (pid) => {
    if (!window.confirm("Delete this problem? This cannot be undone.")) return;
    try {
      await axiosClient.delete(`/problem/delete/${pid}`);
      setMessage("Deleted successfully.");
      await fetchProblems();
      if (isEditMode && pid === id) {
        navigate("/admin"); // Redirect if deleting currently edited problem
      }
    } catch (err) {
      setError("Failed to delete.", err);
    }
  };

  const LangBlock = ({ idx }) => {
    const label = LANGS[idx].label;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs opacity-60">{startCode[idx].language}</div>
        </div>
        <label className="label pt-0">
          <span className="label-text text-xs">Starter Code</span>
        </label>
        <textarea
          value={startCode[idx].initialCode}
          onChange={(e) =>
            updateArrayItem(setStartCode, idx, "initialCode", e.target.value)
          }
          className="textarea textarea-bordered w-full font-mono bg-base-300 text-base-content"
          rows={8}
          placeholder={`Starter code for ${label}`}
        />
        <label className="label pt-0">
          <span className="label-text text-xs">Reference Solution</span>
        </label>
        <textarea
          value={referenceSolution[idx].completeCode}
          onChange={(e) =>
            updateArrayItem(
              setReferenceSolution,
              idx,
              "completeCode",
              e.target.value
            )
          }
          className="textarea textarea-bordered w-full font-mono bg-base-300 text-base-content"
          rows={8}
          placeholder={`Reference solution for ${label}`}
        />
      </div>
    );
  };

  return (
    <div
      data-theme="dark"
      className="min-h-screen bg-neutral p-6 md:p-10 text-neutral-content"
    >
      <div className="max-w-7xl mx-auto">
        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin — Problem Manager</h1>
            <p className="text-sm opacity-70 mt-1">
              {isEditMode
                ? `Editing Problem: ${title}`
                : "Create a new problem"}
            </p>
          </div>
          {isEditMode && (
            <button
              onClick={() => {
                navigate("/admin");
                resetForm();
              }}
              className="btn btn-sm btn-accent"
            >
              Switch to Create Mode
            </button>
          )}
        </header>

        {error && (
          <div className="alert alert-error shadow-lg mb-4 whitespace-pre-wrap">
            {String(error)}
          </div>
        )}
        {message && (
          <div className="alert alert-success shadow-lg mb-4">
            {String(message)}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: FORM */}
          <div className="lg:col-span-2 card bg-base-100 shadow-lg border border-base-300">
            <form onSubmit={handleSubmit} className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title text-2xl">
                  {isEditMode ? "Edit Problem" : "Create Problem"}
                </h2>
                <div className="text-sm opacity-60">
                  {loadingProblems ? "…" : `${problems.length} problems`}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    className="input input-bordered w-full bg-base-300"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Two Sum"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Difficulty</span>
                  </label>
                  <select
                    className="select select-bordered w-full bg-base-300"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Description (Markdown)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-36 bg-base-300"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Problem statement..."
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Tags (comma separated)</span>
                </label>
                <input
                  className="input input-bordered w-full bg-base-300"
                  value={tags.join(", ")}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="array, dp, graph"
                />
              </div>

              {/* Testcases */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visible */}
                <div className="card bg-base-200 border">
                  <div className="card-body p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        Visible Testcases
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          addArrayItem(setVisibleTestCases, {
                            input: "",
                            output: "",
                            explanation: "",
                          })
                        }
                        className="btn btn-xs btn-outline"
                      >
                        <IconPlus /> Add
                      </button>
                    </div>
                    <div className="space-y-3 mt-3 max-h-64 overflow-y-auto pr-2">
                      {visibleTestCases.map((tc, i) => (
                        <div
                          key={i}
                          className="p-2 border rounded bg-base-100 relative"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem(setVisibleTestCases, i)
                            }
                            className="btn btn-xs btn-ghost btn-circle absolute top-2 right-2 text-error"
                          >
                            <IconTrash />
                          </button>
                          <textarea
                            rows={2}
                            value={tc.input}
                            onChange={(e) =>
                              updateArrayItem(
                                setVisibleTestCases,
                                i,
                                "input",
                                e.target.value
                              )
                            }
                            placeholder="stdin"
                            className="textarea textarea-sm w-full font-mono bg-base-300 mb-2"
                          />
                          <textarea
                            rows={2}
                            value={tc.output}
                            onChange={(e) =>
                              updateArrayItem(
                                setVisibleTestCases,
                                i,
                                "output",
                                e.target.value
                              )
                            }
                            placeholder="expected output"
                            className="textarea textarea-sm w-full font-mono bg-base-300 mb-2"
                          />
                          <input
                            value={tc.explanation}
                            onChange={(e) =>
                              updateArrayItem(
                                setVisibleTestCases,
                                i,
                                "explanation",
                                e.target.value
                              )
                            }
                            placeholder="explanation (optional)"
                            className="input input-sm w-full bg-base-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Hidden */}
                <div className="card bg-base-200 border">
                  <div className="card-body p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        Hidden Testcases
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          addArrayItem(setHiddenTestCases, {
                            input: "",
                            output: "",
                          })
                        }
                        className="btn btn-xs btn-outline"
                      >
                        <IconPlus /> Add
                      </button>
                    </div>
                    <div className="space-y-3 mt-3 max-h-64 overflow-y-auto pr-2">
                      {hiddenTestCases.map((tc, i) => (
                        <div
                          key={i}
                          className="p-2 border rounded bg-base-100 relative"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem(setHiddenTestCases, i)
                            }
                            className="btn btn-xs btn-ghost btn-circle absolute top-2 right-2 text-error"
                          >
                            <IconTrash />
                          </button>
                          <textarea
                            rows={2}
                            value={tc.input}
                            onChange={(e) =>
                              updateArrayItem(
                                setHiddenTestCases,
                                i,
                                "input",
                                e.target.value
                              )
                            }
                            placeholder="stdin"
                            className="textarea textarea-sm w-full font-mono bg-base-300 mb-2"
                          />
                          <textarea
                            rows={2}
                            value={tc.output}
                            onChange={(e) =>
                              updateArrayItem(
                                setHiddenTestCases,
                                i,
                                "output",
                                e.target.value
                              )
                            }
                            placeholder="expected output"
                            className="textarea textarea-sm w-full font-mono bg-base-300 mb-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Language Blocks */}
              <div className="grid grid-cols-1 gap-4 mt-3">
                {LANGS.map((l, idx) => (
                  <div key={l.key} className="card bg-base-200 border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{l.label}</div>
                      <div className="text-xs opacity-60">{l.key}</div>
                    </div>
                    <LangBlock idx={idx} />
                  </div>
                ))}
              </div>

              <div className="card-actions mt-6 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-ghost"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-44"
                >
                  {submitting ? (
                    <Spinner />
                  ) : isEditMode ? (
                    "Update Problem"
                  ) : (
                    "Create Problem"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: PROBLEM LIST */}
          <aside className="w-full lg:w-auto">
            <div className="card bg-base-100 border shadow-lg">
              <div className="card-body p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Problems</h3>
                  <div className="text-sm opacity-60">
                    {loadingProblems ? "…" : problems.length}
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[60vh]">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Diff</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingProblems && (
                        <tr>
                          <td colSpan="3" className="text-center">
                            <Spinner />
                          </td>
                        </tr>
                      )}
                      {!loadingProblems &&
                        problems.map((p) => (
                          <tr
                            key={p._id}
                            className={p._id === id ? "bg-base-200" : "hover"}
                          >
                            <td className="font-semibold text-xs md:text-sm">
                              {p.title}
                            </td>
                            <td>
                              <Badge difficulty={p.difficulty} />
                            </td>
                            <td className="flex gap-1">
                              <button
                                onClick={() => navigate(`/admin/edit/${p._id}`)}
                                className="btn btn-xs btn-ghost"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(p._id)}
                                className="btn btn-xs btn-ghost text-error"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-right">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={fetchProblems}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
