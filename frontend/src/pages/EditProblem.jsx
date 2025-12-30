import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";

export default function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    axiosClient
      .get(`/problem/getProblemById/${id}`)
      .then((res) => setProblem(res.data))
      .catch(() => alert("Failed to load problem"));
  }, [id]);

  if (!problem) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Problem</h1>

      <button onClick={() => navigate(-1)} className="btn btn-sm btn-ghost">
        ⬅ Back
      </button>

      {/* Later you’ll reuse AdminPanel form here */}
      <pre className="mt-4 bg-base-300 p-4 rounded">
        {JSON.stringify(problem, null, 2)}
      </pre>
    </div>
  );
}
