import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../authSlice";
import { useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
    search: "",
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    navigate("/login");
  };

  // Fetch all problems + solved problems
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setSolvedProblems([]);

        const problemsRes = await axiosClient.get("/problem/getAllProblem");
        setProblems(problemsRes.data);

        if (user) {
          const solvedRes = await axiosClient.get(
            "/problem/problemSolvedByUser"
          );
          setSolvedProblems(solvedRes.data);
        }
      } catch (error) {
        console.error("Error loading problems:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Check if a problem is solved
  const isSolved = (id) => solvedProblems.some((p) => p._id === id);

  // Filter logic
  const filteredProblems = problems.filter((problem) => {
    const isSolvedProblem = isSolved(problem._id);

    // Status filter
    if (filters.status === "solved" && !isSolvedProblem) return false;
    if (filters.status === "unsolved" && isSolvedProblem) return false;

    // Difficulty filter
    if (
      filters.difficulty !== "all" &&
      problem.difficulty.toLowerCase() !== filters.difficulty
    ) {
      return false;
    }

    // Tag filter (assuming each problem has tags: ["array", "string"])
    if (
      filters.tag !== "all" &&
      !problem.tags?.some((tag) => tag.toLowerCase() === filters.tag)
    ) {
      return false;
    }

    // Search filter (title or tags)
    if (
      filters.search.trim() !== "" &&
      !problem.title.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] text-gray-300">
        <span className="loading loading-spinner loading-lg text-yellow-400"></span>
        <p className="mt-4">Loading problems...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-md border-b border-white/10">
        <NavLink
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
        >
          Leetlab
        </NavLink>

        <div className="flex items-center gap-4">
          <span className="text-gray-300 hidden sm:block">
            {user?.firstName || "User"}
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-warning btn-sm text-black font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Welcome */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back,{" "}
          <span className="text-yellow-400">{user?.firstName || "Coder"}!</span>
        </h1>
        <p className="text-gray-400 mb-8">
          You’ve solved{" "}
          <span className="text-green-400 font-semibold">
            {solvedProblems.length}
          </span>{" "}
          out of{" "}
          <span className="text-yellow-400 font-semibold">
            {problems.length}
          </span>{" "}
          problems.
        </p>

        {/* 🔍 Filter + Search Bar */}
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
            <option value="unsolved">Unsolved Problems</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) =>
              setFilters({ ...filters, difficulty: e.target.value })
            }
            className="w-[140px] bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
          >
            <option value="all">Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Tag Filter */}
          <select
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 w-25"
          >
            <option value="all">Tags</option>
            <option value="array">Array</option>
            <option value="string">String</option>
            <option value="linkedlist">Linked List</option>
            <option value="dp">Dynamic Programming</option>
            <option value="graph">Graph</option>
          </select>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search problems..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 min-w-[200px] bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />
        </div>

        {/* Problems Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-gray-100">
              Problems List
            </h2>
          </div>

          {filteredProblems.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No problems found
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {filteredProblems.map((problem, index) => (
                <li
                  key={problem._id}
                  onClick={() => navigate(`/problem/${problem._id}`)}
                  className="flex justify-between items-center px-6 py-4 hover:bg-white/10 transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 w-6 text-right">
                      {index + 1}.
                    </span>

                    {/* Solved Icon */}
                    {isSolved(problem._id) ? (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="white"
                          className="w-3 h-3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 border border-gray-500 rounded-full"></div>
                    )}

                    <span className="font-medium">{problem.title}</span>
                  </div>

                  <span
                    className={`text-sm font-semibold ${getDifficultyColor(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Homepage;
