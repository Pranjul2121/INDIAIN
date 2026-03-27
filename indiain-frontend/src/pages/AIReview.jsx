import { useState } from "react";
import API from "../services/api";

export default function AIReview() {
  const [review, setReview] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      // Reset review to re-trigger the entrance animation
      setReview(""); 
      
      const res = await API.get("/ai-resume-review");
      setReview(res.data.ai_review);
    } catch (err) {
      console.error("AI Review failed", err);
      // Helpful error handling in case the user forgets to upload a resume first
      setError("Analysis failed. Please ensure you have uploaded a resume first.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full font-sans text-white">
      
      {/* --- Action Button --- */}
      {!review && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
             <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          </div>
          <button
            onClick={analyze}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_35px_rgba(79,70,229,0.7)] hover:-translate-y-1"
          >
            Generate AI Feedback
            <svg className="w-5 h-5 ml-2 -mr-1 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
          <p className="text-sm font-medium text-indigo-200/60 mt-4">Takes about ~15 seconds</p>
        </div>
      )}

      {/* --- Error State --- */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
          <div>
            <h4 className="font-bold text-sm">Analysis Failed</h4>
            <p className="text-sm text-red-200/80 mt-1">{error}</p>
            <button onClick={() => setError(null)} className="text-xs font-bold text-red-300 mt-2 hover:text-red-200 underline">Try again</button>
          </div>
        </div>
      )}

      {/* --- Loading / Analyzing State --- */}
      {isAnalyzing && (
        <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center animate-pulse">
          <div className="relative w-20 h-20">
            {/* Rotating AI rings */}
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
            <div className="absolute inset-4 rounded-full border-b-2 border-cyan-400 animate-spin" style={{ animationDuration: '3s' }}></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
               <svg className="w-6 h-6 text-indigo-300 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
          </div>
          <p className="mt-6 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 animate-pulse">
            Analyzing phrasing & impact...
          </p>
        </div>
      )}

      {/* --- Review Output State --- */}
      {review && !isAnalyzing && (
        <div className="flex flex-col h-full animate-fade-in-up">
           <div className="flex items-center justify-between mb-4 border-b border-indigo-500/30 pb-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                AI Feedback Complete
              </div>
              <button 
                onClick={analyze}
                title="Regenerate Review"
                className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-lg transition-colors"
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              </button>
           </div>
           
           {/* Custom Scrollable Output Box */}
           <div className="flex-grow max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             <div className="text-indigo-50 font-medium leading-relaxed whitespace-pre-wrap text-[15px]">
               {review}
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
