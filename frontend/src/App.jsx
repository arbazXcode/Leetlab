import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { checkAuth } from "./authSlice";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Homepage from "./pages/Homepage.jsx"; // Fixed import name
import AdminPanel from "./pages/AdminPanel.jsx";
import ProblemPage from "./pages/ProblemPage.jsx";
import Footer from "./pages/Footer.jsx";
// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <svg
        className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mx-auto"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p className="mt-2 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, initialized } = useSelector((state) => state.auth);

//   if (!initialized) {
//     return <LoadingSpinner />;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, initialized, user } = useSelector(
    (state) => state.auth
  );

  if (!initialized) {
    return <LoadingSpinner />;
  }

  // Not logged in → block access
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route protection
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) {
      dispatch(checkAuth());
    }
  }, [dispatch, initialized]);

  if (!initialized) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Problem solving page */}
          <Route path="/problem/:id" element={<ProblemPage />} />
        </Routes>
      </div>

      {/* ✅ footer visible on all pages */}
      <Footer />
    </div>
  );
}

export default App;
