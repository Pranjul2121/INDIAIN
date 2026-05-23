import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function JobDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const title = searchParams.get("title");
  const company = searchParams.get("company");
  const location = searchParams.get("location");
  const redirectUrl = searchParams.get("url");

  const handleApply = () => {
    if (redirectUrl) {
      window.open(redirectUrl, "_blank");
    } else {
      alert("Application link not available.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcff] text-slate-800 font-sans p-6 md:p-12 relative overflow-hidden z-0">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/10 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-400/10 blur-[120px] mix-blend-multiply" />
      </div>

      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button 
           onClick={() => navigate(-1)}
           className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:text-indigo-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
           Back to Dashboard
        </button>

        {/* Job Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up">
          
           <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 border-b border-slate-100 pb-8 mb-8">
              <div>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 font-black text-2xl uppercase shadow-sm">
                       {company ? company.charAt(0) : "C"}
                    </div>
                    <div>
                       <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">{title}</h1>
                       <p className="text-xl font-medium text-slate-500 mt-1">{company}</p>
                    </div>
                 </div>
                 
                 <div className="flex flex-wrap gap-4 mt-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                       {location || "Remote"}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-600 font-bold text-sm">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                       Full-time
                    </span>
                 </div>
              </div>
              
              <button 
                 onClick={handleApply}
                 className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
              >
                 Apply Now
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </button>
           </div>

           <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Job Description</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                 We are hiring an outstanding <strong>{title}</strong> to join our dynamic team at <strong>{company}</strong>. In this role, you will be solving complex technical challenges, leading new feature development, and ensuring high-quality standards in production code. 
                 <br/><br/>
                 *(Note: Full job descriptions are hosted on the partner site. Click 'Apply Now' to view the complete requirements and responsibilities directly via Adzuna).*
              </p>
              
              <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                 <h4 className="text-lg font-bold text-blue-900 mb-2">Why apply through INDIAIN?</h4>
                 <ul className="list-disc list-inside text-blue-800/80 font-medium space-y-1">
                    <li>AI-backed matching guarantees your resume aligns.</li>
                    <li>Easily track companies that fit your missing skill gaps.</li>
                    <li>Generate custom cover letters for this highly-matched role instantly.</li>
                 </ul>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
