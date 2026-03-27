import { useState } from "react";
import API from "../services/api";

export default function ATSChecker() {
  const [skills, setSkills] = useState("");
  const [score, setScore] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  const checkATS = async () => {
    // Basic validation
    if (!skills.trim()) {
      setError("Please enter at least one skill to check.");
      return;
    }

    try {
      setIsChecking(true);
      setError(null);
      setScore(null); // Reset previous score to trigger entrance animation

      // Clean up the input string into a neat array
      const skillList = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await API.post("/advanced-ats-check", {
        job_skills: skillList,
      });

      setScore(res.data.ats_score);
    } catch (err) {
      console.error("ATS Check failed", err);
      setError("Unable to calculate score. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  // Helper function to animate and color-code the score
  const getScoreDetails = (value) => {
    if (value >= 80) return { color: "text-emerald-500", bg: "bg-emerald-500", text: "Excellent Match" };
    if (value >= 50) return { color: "text-amber-500", bg: "bg-amber-500", text: "Fair Match" };
    return { color: "text-rose-500", bg: "bg-rose-500", text: "Needs Improvement" };
  };

  return (
    <div className="w-full flex flex-col h-full font-sans">
      
      {/* --- Input Section --- */}
      <div className="relative mb-6">
        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
          Target Job Skills
        </label>
        
        {/* Input Wrapper with Icon */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none shadow-sm"
            placeholder="e.g. React, Node.js, Python..."
            value={skills}
            onChange={(e) => {
              setSkills(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 ml-1">Separate multiple skills with commas</p>
      </div>

      {/* --- Error Message --- */}
      {error && (
        <div className="mb-4 text-sm text-rose-500 font-medium animate-fade-in flex items-center gap-1.5 ml-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      {/* --- Visual Score Display --- */}
      {score !== null && !isChecking && (
        <div className="mb-6 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm animate-fade-in-up">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Match Rate</p>
              <p className={`text-sm font-bold ${getScoreDetails(score).color}`}>
                {getScoreDetails(score).text}
              </p>
            </div>
            <div className={`text-4xl font-black ${getScoreDetails(score).color} tabular-nums`}>
              {score}<span className="text-2xl text-slate-400 ml-1">%</span>
            </div>
          </div>
          
          {/* Animated Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div 
              className={`h-full ${getScoreDetails(score).bg} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      {/* --- Action Button --- */}
      <div className="mt-auto pt-2">
        <button
          onClick={checkATS}
          disabled={isChecking || !skills.trim()}
          className={`w-full py-3.5 rounded-xl font-bold flex justify-center items-center transition-all duration-300 shadow-sm
            ${skills.trim() && !isChecking 
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
        >
          {isChecking ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Resume...
            </>
          ) : (
            "Calculate ATS Score"
          )}
        </button>
      </div>

    </div>
  );
}
