import React, { useState } from "react";
import API from "../services/api";

export default function JobRecommendations({ resumeText }) {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);

    try {
      const payloadText = resumeText || "I know Python, React, Machine Learning"; // fallback

      const res = await API.post("/smart-job-match", {
        resume_text: payloadText,
      });

      const data = res.data;

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

      {/* Jobs Grids */}
      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            <div className="flex justify-between items-start gap-4">
               <div>
                  <h4 className="font-bold text-lg text-slate-800 leading-tight">{job.title}</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1">{job.company} • {job.location}</p>
               </div>
               <div className="flex flex-col items-end">
                 <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-sm whitespace-nowrap">
                    {job.match}% Match
                 </span>
               </div>
            </div>

            {/* Missing Skills */}
            {job.missing_skills && job.missing_skills.length > 0 && (
               <div className="mt-4">
                  <p className="text-xs font-bold text-rose-500 mb-2 uppercase tracking-wider">Missing Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                     {job.missing_skills.map((ms) => (
                        <span key={ms} className="px-2 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 rounded-md">
                           {ms}
                        </span>
                     ))}
                  </div>
               </div>
            )}

            {/* Actions */}
            <div className="mt-auto pt-5 flex gap-2">
               <a
                  href={`/job/${job.id}?url=${encodeURIComponent(job.redirect_url)}&title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location)}`}
                  className="flex-1 text-center px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl transition-colors"
               >
                  View Details
               </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}