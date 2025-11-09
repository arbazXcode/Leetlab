import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../authSlice";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
  });

  const handleLogout = async () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get("/problem/getAllProblem");
        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/problemSolvedByUser");
        setSolvedProblems(data);
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };

    const loadData = async () => {
      await fetchProblems();
      if (user) {
        await fetchSolvedProblems();
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "badge-success";
      case "medium":
        return "badge-warning";
      case "hard":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  const isProblemSolved = (problemId) => {
    return solvedProblems.some((sp) => sp._id === problemId);
  };

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === "all" ||
      problem.difficulty?.toLowerCase() === filters.difficulty;

    const tagMatch =
      filters.tag === "all" ||
      (problem.tags && problem.tags.includes(filters.tag));

    const statusMatch =
      filters.status === "all" ||
      (filters.status === "solved" && isProblemSolved(problem._id)) ||
      (filters.status === "unsolved" && !isProblemSolved(problem._id));

    return difficultyMatch && tagMatch && statusMatch;
  });

  const handleProblemClick = (problemId) => {
    navigate(`/problem/${problemId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-gray-600">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="navbar bg-white shadow-sm border-b border-gray-200 px-6">
        <div className="flex-1">
          <NavLink
            to="/"
            className="text-2xl font-bold text-gray-800 hover:text-primary transition-colors"
          >
            <span className="text-primary">Code</span>Judge
          </NavLink>
        </div>
        <div className="flex-none gap-4">
          <div className="stats shadow-sm hidden md:flex">
            <div className="stat place-items-center py-2 px-4">
              <div className="stat-title text-xs">Solved</div>
              <div className="stat-value text-lg text-success">
                {solvedProblems.length}
              </div>
            </div>
            <div className="stat place-items-center py-2 px-4">
              <div className="stat-title text-xs">Total</div>
              <div className="stat-value text-lg">{problems.length}</div>
            </div>
          </div>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar placeholder"
            >
              <div className="bg-primary text-white rounded-full w-10">
                <span className="text-sm font-medium">
                  {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
            <ul className="mt-3 p-2 shadow-lg menu menu-sm dropdown-content bg-white rounded-lg w-52 border border-gray-200">
              <li className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100">
                {user?.firstName} {user?.lastName}
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-error hover:bg-error hover:text-white"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Continue your coding journey with {problems.length} problems
            available.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stats shadow-lg bg-white">
            <div className="stat">
              <div className="stat-figure text-success">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="stat-title">Solved</div>
              <div className="stat-value text-success">
                {solvedProblems.length}
              </div>
            </div>
          </div>

          <div className="stats shadow-lg bg-white">
            <div className="stat">
              <div className="stat-figure text-success">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-title">Easy</div>
              <div className="stat-value text-success">
                {
                  solvedProblems.filter(
                    (p) => p.difficulty?.toLowerCase() === "easy"
                  ).length
                }
              </div>
            </div>
          </div>

          <div className="stats shadow-lg bg-white">
            <div className="stat">
              <div className="stat-figure text-warning">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="stat-title">Medium</div>
              <div className="stat-value text-warning">
                {
                  solvedProblems.filter(
                    (p) => p.difficulty?.toLowerCase() === "medium"
                  ).length
                }
              </div>
            </div>
          </div>

          <div className="stats shadow-lg bg-white">
            <div className="stat">
              <div className="stat-figure text-error">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="stat-title">Hard</div>
              <div className="stat-value text-error">
                {
                  solvedProblems.filter(
                    (p) => p.difficulty?.toLowerCase() === "hard"
                  ).length
                }
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Filter Problems
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="all">All Problems</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Difficulty</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.difficulty}
                onChange={(e) =>
                  setFilters({ ...filters, difficulty: e.target.value })
                }
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Tags</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.tag}
                onChange={(e) =>
                  setFilters({ ...filters, tag: e.target.value })
                }
              >
                <option value="all">All Tags</option>
                <option value="array">Array</option>
                <option value="string">String</option>
                <option value="dynamic-programming">Dynamic Programming</option>
                <option value="graph">Graph</option>
                <option value="tree">Tree</option>
                <option value="math">Math</option>
              </select>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Problems ({filteredProblems.length})
            </h2>
          </div>

          {filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No problems found</p>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProblems.map((problem, index) => (
                <div
                  key={problem._id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                  onClick={() => handleProblemClick(problem._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-gray-500 font-mono text-sm min-w-[3rem]">
                        {index + 1}
                      </div>

                      <div className="flex items-center gap-3">
                        {isProblemSolved(problem._id) ? (
                          <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                        )}

                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                            {problem.title}
                          </h3>
                          {problem.tags && problem.tags.length > 0 && (
                            <div className="flex gap-2 mt-1">
                              {problem.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {problem.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{problem.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`badge ${getDifficultyColor(
                          problem.difficulty
                        )} badge-sm font-medium`}
                      >
                        {problem.difficulty?.charAt(0)?.toUpperCase() +
                          problem.difficulty?.slice(1) || "Unknown"}
                      </span>

                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Homepage;
