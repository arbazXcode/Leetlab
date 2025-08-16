import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

//schema validation for signup form

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password should contain atleast 8 characters."),
});

function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const submittedData = (data) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-96 bg-base100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl">Leetcode</h2>
          <form onSubmit={handleSubmit(submittedData)}>
            <div className="form-control">
              <label className="label mb-1">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className={`input input-bordered ${
                  errors.firstName && "input-error"
                }`}
                {...register("firstName")}
              />
              {errors.firstName && (
                <span className="text-error">{errors.firstName.message}</span>
              )}
            </div>

            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`input input-bordered ${
                  errors.email && "input-error"
                }`}
                {...register("email")}
              />
              {errors.email && (
                <span className="text-error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="........"
                className={`input input-bordered ${
                  errors.password && "input-error"
                }`}
                {...register("password")}
              />
              {errors.password && (
                <span className="text-error">{errors.password.message}</span>
              )}
            </div>

            <div className="form-control mt-6 flex justify-center">
              <button type="submit" className="btn btn-primary">
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;

// import { useState, useEffect } from "react";

// function Signup() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     //validation kro

//     //form ko submit kar dengey -backend me
//   };

//   return (
//     <>
//       <form
//         onSubmit={handleSubmit}
//         className="flex flex-col justify-center items-center min-h-screen gap-y-3"
//       >
//         <input
//           type="text"
//           value={name}
//           placeholder="Enter your name"
//           onChange={(e) => setName(e.target.value)}
//         ></input>
//         <input
//           type="email"
//           value={email}
//           placeholder="Enter your email"
//           onChange={(e) => setEmail(e.target.value)}
//         ></input>
//         <input
//           type="password"
//           value={password}
//           placeholder="Enter your password"
//           onChange={(e) => setPassword(e.target.value)}
//         ></input>
//         <button type="submit">Submit</button>
//       </form>
//     </>
//   );
// }
