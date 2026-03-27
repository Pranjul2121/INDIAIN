import React, { useState } from "react";

export default function JobRecommendations({ resumeText }) {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);

    try {
      const payloadText = resumeText || "I know Python, React, Machine Learning"; // fallback

      const res = await fetch("http://127.0.0.1:8000/smart-job-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_text: payloadText,
        }),
      });

      const data = await res.json();

      setJobs(data.jobs || []);
      setSkills(data.skills || []);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <div>
      {/* Button */}
      <button
        onClick={fetchJobs}
        className="bg-indigo-600 text-white px-4 py-2 rounded-xl mb-4"
      >
        Smart Job Match
      </button>

      {/* Loading */}
      {loading && <p>Loading jobs...</p>}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold text-indigo-600">Your Skills:</h4>
          <p className="text-sm text-gray-600">
            {skills.join(", ")}
          </p>
        </div>
      )}

      {/* Jobs */}
      <div className="space-y-3">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="p-4 bg-white rounded-xl shadow hover:shadow-md transition"
          >
            <h4 className="font-bold text-lg">{job.title}</h4>
            <p className="text-sm text-gray-600">{job.company}</p>
            <p className="text-sm">{job.location}</p>

            {/* Match % */}
            <div className="mt-2">
              <span className="text-green-600 font-bold">
                Match: {job.match}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}