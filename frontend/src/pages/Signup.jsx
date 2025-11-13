import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, clearError } from "../authSlice";
import { useEffect, useState } from "react";

const signupSchema = z.object({
  firstName: z.string().min(3, "Name must be at least 3 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(registerUser(data));
      if (registerUser.fulfilled.match(result)) {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] p-6">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl p-8 text-white">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Leetlab
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Join and start solving coding challenges
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error shadow-lg mb-6">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* First Name */}
          <div className="form-control">
            <label className="label text-sm font-medium text-gray-300">
              First Name
            </label>
            <input
              type="text"
              placeholder="John"
              className={`input input-bordered w-full bg-white/10 text-white border-gray-600 ${
                errors.firstName ? "border-red-500" : "focus:border-yellow-500"
              }`}
              {...register("firstName")}
            />
            {errors.firstName && (
              <span className="text-red-400 text-sm">
                {errors.firstName.message}
              </span>
            )}
          </div>

          {/* Last Name */}
          <div className="form-control">
            <label className="label text-sm font-medium text-gray-300">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Doe"
              className={`input input-bordered w-full bg-white/10 text-white border-gray-600 ${
                errors.lastName ? "border-red-500" : "focus:border-yellow-500"
              }`}
              {...register("lastName")}
            />
            {errors.lastName && (
              <span className="text-red-400 text-sm">
                {errors.lastName.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              className={`input input-bordered w-full bg-white/10 text-white border-gray-600 ${
                errors.email ? "border-red-500" : "focus:border-yellow-500"
              }`}
              {...register("email")}
            />
            {errors.email && (
              <span className="text-red-400 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-control relative">
            <label className="label text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`input input-bordered w-full bg-white/10 text-white border-gray-600 pr-10 ${
                errors.password ? "border-red-500" : "focus:border-yellow-500"
              }`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-400 hover:text-yellow-400"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18m-9-3c-5 0-9-3.5-9-7.5a8.973 8.973 0 012.538-5.977M9.88 9.88A3 3 0 0115 12m2.466 2.466A8.975 8.975 0 0121 12.5c0-4-4-7.5-9-7.5a8.978 8.978 0 00-5.977 2.538"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7.999C20.268 16.057 16.478 19 12 19c-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
            {errors.password && (
              <span className="text-red-400 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-warning text-black w-full mt-6 font-bold hover:scale-105 transition-all duration-200"
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-yellow-400 font-semibold hover:text-yellow-500"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
