import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, clearError } from "../authSlice";
import { useEffect, useState } from "react"; // Added useState import

const signupSchema = z.object({
  firstName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  // Added state for password visibility
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
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(registerUser(data));
      if (registerUser.fulfilled.match(result)) {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="card bg-base-100 shadow-2xl border border-base-300">
          <div className="card-body p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="avatar placeholder">
                  <div className="bg-gradient-to-r from-primary to-secondary text-primary-content rounded-full w-16">
                    <span className="text-2xl font-bold">CE</span>
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CodeExec
              </h1>
              <p className="text-base-content/70 mt-2 font-medium">
                Join our community of developers
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error mb-6 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">
                    Full Name
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className={`input input-bordered w-full pl-12 bg-base-200/50 border-2 transition-all duration-200 focus:bg-base-100 ${
                      errors.firstName
                        ? "input-error border-error"
                        : "hover:border-primary/50 focus:border-primary"
                    }`}
                    {...register("firstName")}
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-base-content/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                {errors.firstName && (
                  <label className="label">
                    <span className="label-text-alt text-error font-medium">
                      {errors.firstName.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Email Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="john.doe@example.com"
                    className={`input input-bordered w-full pl-12 bg-base-200/50 border-2 transition-all duration-200 focus:bg-base-100 ${
                      errors.email
                        ? "input-error border-error"
                        : "hover:border-secondary/50 focus:border-secondary"
                    }`}
                    {...register("email")}
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-base-content/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                </div>
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error font-medium">
                      {errors.email.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Password Field with Eye Toggle */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">
                    Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} // Modified to use showPassword state
                    placeholder="Create a secure password"
                    className={`input input-bordered w-full pl-12 pr-12 bg-base-200/50 border-2 transition-all duration-200 focus:bg-base-100 ${
                      errors.password
                        ? "input-error border-error"
                        : "hover:border-accent/50 focus:border-accent"
                    }`}
                    {...register("password")}
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-base-content/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  {/* Added Eye Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/40 hover:text-base-content transition-colors duration-200"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3.667-9-7.5 0-1.066.263-2.079.726-2.997m2.871-2.796A9.953 9.953 0 0112 4.5c5 0 9 3.667 9 7.5 0 1.067-.269 2.079-.73 2.999M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3l18 18"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5.5 12 5.5c4.478 0 8.268 2.443 9.542 6.5-1.274 4.057-5.064 6.5-9.542 6.5-4.477 0-8.268-2.443-9.542-6.5z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error font-medium">
                      {errors.password.message}
                    </span>
                  </label>
                )}
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Must be at least 8 characters long
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="form-control mt-8">
                <button
                  type="submit"
                  className={`btn btn-primary btn-lg w-full text-white font-bold shadow-lg transition-all duration-200 ${
                    loading
                      ? "loading"
                      : "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="divider text-base-content/60 my-6">or</div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-base-content/70">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="link link-primary font-semibold hover:link-secondary transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Additional Info */}
            <div className="text-center mt-6">
              <p className="text-xs text-base-content/50">
                By creating an account, you agree to our{" "}
                <a href="#" className="link link-primary text-xs">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="link link-primary text-xs">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-base-content/50">
            © 2025 CodeExec. Built with ❤️ for developers
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

//---------------------------------//---------------------------------//---------------------------------

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom"; // Corrected import from react-router
// import { registerUser } from "../authSlice";
// import { useEffect } from "react";

// // Schema validation for signup form
// // FIX: Changed 'firstName' to 'name' to match what the backend likely expects.
// const signupSchema = z.object({
//   name: z.string().min(3, "Minimum character should be 3"),
//   email: z.string().email("Invalid email"),
//   password: z.string().min(8, "Password should contain at least 8 characters."),
// });

// function Signup() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isAuthenticated, loading, error } = useSelector(
//     (state) => state.auth
//   );

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({ resolver: zodResolver(signupSchema) });

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate("/");
//     }
//   }, [isAuthenticated, navigate]);

//   const onSubmit = (data) => {
//     dispatch(registerUser(data));
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white">
//       <div className="card w-full max-w-sm bg-gray-800 shadow-xl border border-gray-700">
//         <div className="card-body">
//           <h2 className="card-title justify-center text-3xl font-bold">
//             Leetcode
//           </h2>
//           {error && (
//             <div className="alert alert-error shadow-lg mt-4">
//               <div>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="stroke-current flex-shrink-0 h-6 w-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//                 <span>{error.message || "Registration failed."}</span>
//               </div>
//             </div>
//           )}
//           <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
//             <div className="form-control">
//               <label className="label mb-1">
//                 <span className="label-text text-gray-300">Name</span>
//               </label>
//               <input
//                 type="text"
//                 placeholder="Enter your name"
//                 className={`input input-bordered w-full bg-gray-700 ${
//                   errors.name ? "input-error border-red-500" : "border-gray-600"
//                 }`}
//                 // FIX: Changed 'firstName' to 'name'
//                 {...register("name")}
//               />
//               {errors.name && (
//                 <span className="text-error text-red-400 mt-1">
//                   {errors.name.message}
//                 </span>
//               )}
//             </div>

//             <div className="form-control mt-4">
//               <label className="label mb-1">
//                 <span className="label-text text-gray-300">Email</span>
//               </label>
//               <input
//                 type="email"
//                 placeholder="john@example.com"
//                 className={`input input-bordered w-full bg-gray-700 ${
//                   errors.email
//                     ? "input-error border-red-500"
//                     : "border-gray-600"
//                 }`}
//                 {...register("email")}
//               />
//               {errors.email && (
//                 <span className="text-error text-red-400 mt-1">
//                   {errors.email.message}
//                 </span>
//               )}
//             </div>

//             <div className="form-control mt-4">
//               <label className="label mb-1">
//                 <span className="label-text text-gray-300">Password</span>
//               </label>
//               <input
//                 type="password"
//                 placeholder="********"
//                 className={`input input-bordered w-full bg-gray-700 ${
//                   errors.password
//                     ? "input-error border-red-500"
//                     : "border-gray-600"
//                 }`}
//                 {...register("password")}
//               />
//               {errors.password && (
//                 <span className="text-error text-red-400 mt-1">
//                   {errors.password.message}
//                 </span>
//               )}
//             </div>

//             <div className="form-control mt-6">
//               <button
//                 type="submit"
//                 className="btn btn-primary w-full"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <span className="loading loading-spinner"></span>
//                 ) : (
//                   "Sign Up"
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Signup;

// ------------------------------------------------------------------------------------------------------

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router";
// import { registerUser } from "../authSlice";
// import { useEffect } from "react";

// //schema validation for signup form

// const signupSchema = z.object({
//   firstName: z.string().min(3, "Minimum character should be 3"),
//   email: z.string().email("Invalid email"),
//   password: z.string().min(8, "Password should contain atleast 8 characters."),
// });

// function Signup() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isAuthenticated, loading, error } = useSelector(
//     (state) => state.auth
//   );

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({ resolver: zodResolver(signupSchema) });

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate("/");
//     }
//   }, [isAuthenticated, navigate]);

//   const onSubmit = (data) => {
//     dispatch(registerUser(data));
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="card w-96 bg-base100 shadow-xl">
//         <div className="card-body">
//           <h2 className="card-title justify-center text-3xl">Leetcode</h2>
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <div className="form-control">
//               <label className="label mb-1">
//                 <span className="label-text">First Name</span>
//               </label>
//               <input
//                 type="text"
//                 placeholder="Enter your name"
//                 className={`input input-bordered ${
//                   errors.firstName && "input-error"
//                 }`}
//                 {...register("firstName")}
//               />
//               {errors.firstName && (
//                 <span className="text-error">{errors.firstName.message}</span>
//               )}
//             </div>

//             <div className="form-control mt-4">
//               <label className="label mb-1">
//                 <span className="label-text">Email</span>
//               </label>
//               <input
//                 type="email"
//                 placeholder="john@example.com"
//                 className={`input input-bordered ${
//                   errors.email && "input-error"
//                 }`}
//                 {...register("email")}
//               />
//               {errors.email && (
//                 <span className="text-error">{errors.email.message}</span>
//               )}
//             </div>

//             <div className="form-control mt-4">
//               <label className="label mb-1">
//                 <span className="label-text">Password</span>
//               </label>
//               <input
//                 type="password"
//                 placeholder="........"
//                 className={`input input-bordered ${
//                   errors.password && "input-error"
//                 }`}
//                 {...register("password")}
//               />
//               {errors.password && (
//                 <span className="text-error">{errors.password.message}</span>
//               )}
//             </div>

//             <div className="form-control mt-6 flex justify-center">
//               <button type="submit" className="btn btn-primary">
//                 Sign Up
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Signup;

// // ------------------------------------------------------------------------------------------------------

// // function Signup() {
// //   const [name, setName] = useState("");
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");

// //   const handleSubmit = (e) => {
// //     e.preventDefault();

// //     //validation kro

// //     //form ko submit kar dengey -backend me
// //   };

// //   return (
// //     <>
// //       <form
// //         onSubmit={handleSubmit}
// //         className="flex flex-col justify-center items-center min-h-screen gap-y-3"
// //       >
// //         <input
// //           type="text"
// //           value={name}
// //           placeholder="Enter your name"
// //           onChange={(e) => setName(e.target.value)}
// //         ></input>
// //         <input
// //           type="email"
// //           value={email}
// //           placeholder="Enter your email"
// //           onChange={(e) => setEmail(e.target.value)}
// //         ></input>
// //         <input
// //           type="password"
// //           value={password}
// //           placeholder="Enter your password"
// //           onChange={(e) => setPassword(e.target.value)}
// //         ></input>
// //         <button type="submit">Submit</button>
// //       </form>
// //     </>
// //   );
// // }
