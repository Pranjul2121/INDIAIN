import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function RoleAnalysis() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [loadingFit, setLoadingFit] = useState(false);
  const [loadingGap, setLoadingGap] = useState(false);
  const [roleFit, setRoleFit] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [skillGap, setSkillGap] = useState(null);
  const [errorFit, setErrorFit] = useState(null);
  const [errorGap, setErrorGap] = useState(null);

  const card = isDark ? "bg-[#1a1d27] border-[#2a2e3d]" : "bg-white border-slate-200";
  const subText = isDark ? "text-slate-400" : "text-slate-500";
  const inputClass = isDark ? "bg-white/5 border-white/10 text-white placeholder-slate-500 shadow-inner" : "bg-slate-50 border-slate-200 text-slate-800 shadow-sm";

  const fetchRoleFit = async () => {
    console.log("Triggering: Analyze My Profile");
    setLoadingFit(true);
    setErrorFit(null);
    try {
      const res = await API.get("/api/ai/role-fit");
      console.log("Profile Fit Data:", res.data);
      if (res.data.error) {
        setErrorFit(`AI Error: ${res.data.error}`);
      } else {
        setRoleFit(res.data);
      }
    } catch (err) {
      console.error("Profile Fit Request Failed:", err);
      const msg = err.response?.data?.detail || "Network error or backend unreachable. Please ensure your resume is uploaded.";
      setErrorFit(msg);
    } finally {
      setLoadingFit(false);
    }
  };

  const analyzeGap = async () => {
    if (!targetRole.trim()) {
      setErrorGap("Please specify a target role first.");
      return;
    }
    console.log(`Triggering: Skill Gap Analysis for ${targetRole}`);
    setLoadingGap(true);
    setErrorGap(null);
    setSkillGap(null);
    try {
      const res = await API.post("/api/ai/skill-gap", { target_role: targetRole });
      console.log("Skill Gap Data:", res.data);
      if (res.data.error) {
        setErrorGap(`AI Error: ${res.data.error}`);
      } else {
        setSkillGap(res.data);
      }
    } catch (err) {
      console.error("Skill Gap Request Failed:", err);
      const msg = err.response?.data?.detail || "Network error. AI might be overloaded.";
      setErrorGap(msg);
    } finally {
      setLoadingGap(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans p-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">AI Skill Gap & Role Suitability</h1>
              <p className={`text-sm font-medium ${subText}`}>Harness the power of Gemini AI to map your career trajectory.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Role Suitability Section */}
          <div className={`p-8 rounded-[2.5rem] border backdrop-blur-3xl overflow-hidden relative shadow-2xl flex flex-col ${card}`}>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold">Best Fit Roles</h2>
                <p className={`text-xs ${subText}`}>Predicted based on your current resume</p>
              </div>
              <button 
                onClick={fetchRoleFit}
                disabled={loadingFit}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                {loadingFit ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : "Analyze Profile"}
              </button>
            </div>

            {errorFit && (
              <div className="p-5 mb-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-bold flex gap-3 animate-in fade-in duration-300">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {errorFit}
              </div>
            )}

            <div className="flex-1">
              {roleFit && !loadingFit ? (
                <div className="space-y-6">
                  {roleFit.best_roles?.map((item, idx) => (
                    <div key={idx} className={`p-6 rounded-3xl border transition-all hover:shadow-xl ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-black">{item.role}</h3>
                        <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">{item.match_score}% Match</span>
                      </div>
                      <p className={`text-sm leading-relaxed ${subText}`}>{item.reasoning}</p>
                    </div>
                  ))}
                  <div className="mt-8 p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-[10px] font-black uppercase text-indigo-500 mb-2 tracking-[0.2em]">Strategy Insight</p>
                    <p className="text-sm font-semibold leading-relaxed">{roleFit.overall_summary}</p>
                  </div>
                </div>
              ) : !loadingFit ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-indigo-500/5 rounded-[2rem] flex items-center justify-center mb-6 transform rotate-6 border border-indigo-500/10 hover:rotate-0 transition-transform">
                    <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Ready to Analyze?</h3>
                  <p className={`text-sm max-w-[280px] ${subText}`}>We'll cross-reference your resume with current market trends to find your ideal roles.</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12">
                   <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                   <p className="text-sm font-black uppercase tracking-widest animate-pulse text-indigo-500">Processing with Gemini...</p>
                </div>
              )}
            </div>
          </div>

          {/* Skill Gap Section */}
          <div className={`p-8 rounded-[2.5rem] border backdrop-blur-3xl overflow-hidden relative shadow-2xl flex flex-col ${card}`}>
            <h2 className="text-2xl font-bold mb-8">Target Role Analysis</h2>
            
            <div className="flex gap-4 mb-8">
              <input 
                type="text"
                placeholder="Enter dream role (e.g. Senior Frontend Dev)"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className={`flex-1 px-6 py-4 rounded-2xl border outline-none focus:ring-4 focus:ring-orange-500/20 transition-all font-semibold ${inputClass}`}
              />
              <button 
                onClick={analyzeGap}
                disabled={loadingGap}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingGap && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {loadingGap ? "Analyzing..." : "Check Gaps"}
              </button>
            </div>

            {errorGap && (
              <div className="p-5 mb-8 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-500 text-sm font-bold animate-in slide-in-from-top-2 duration-300 flex gap-3">
                 <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {errorGap}
              </div>
            )}

            <div className="flex-1">
              {skillGap && !loadingGap ? (
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-8 p-6 rounded-3xl bg-white/5 border border-white/5">
                    <div className="relative w-28 h-28 shrink-0">
                       <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" className={isDark ? "stroke-white/10" : "stroke-slate-200"} fill="none" strokeWidth="3" />
                          <circle cx="18" cy="18" r="16" className="stroke-orange-500 transition-all duration-1000" fill="none" strokeWidth="3.5" strokeDasharray={`${skillGap.readiness_percentage}, 100`} strokeLinecap="round" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-2xl font-black">{skillGap.readiness_percentage}%</span>
                         <span className="text-[9px] uppercase font-black opacity-50 tracking-tighter">Readiness</span>
                       </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight mb-2">{skillGap.target_role}</h3>
                      <p className={`text-sm leading-snug ${subText}`}>AI-benchmarked requirements vs your current profile.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
                      <p className="text-[10px] font-black text-emerald-500 uppercase mb-4 tracking-widest">Mastered Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {skillGap.current_skills?.map((s, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-[11px] font-bold border border-emerald-500/20">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20">
                      <p className="text-[10px] font-black text-rose-500 uppercase mb-4 tracking-widest">Skill Gaps</p>
                      <div className="flex flex-wrap gap-2">
                        {skillGap.missing_skills?.map((s, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-xl text-[11px] font-bold border border-rose-500/20">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase mb-5 tracking-[0.3em] flex items-center gap-2 text-indigo-500">
                       Personalized Learning Path
                    </h4>
                    <div className="space-y-4">
                      {skillGap.action_plan?.map((step, idx) => (
                        <div key={idx} className={`flex gap-5 p-5 rounded-3xl border ${isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-100'} hover:border-orange-500/30 transition-all group`}>
                          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-[10px] flex items-center justify-center font-black shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">{idx + 1}</span>
                          <p className="text-sm font-bold leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : !loadingGap ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center opacity-60">
                   <div className="w-24 h-24 bg-orange-500/10 rounded-[2rem] flex items-center justify-center mb-6 border border-orange-500/10 shadow-inner">
                    <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Target Your Dream Role</h3>
                  <p className={`text-sm max-w-[280px] ${subText}`}>Enter the role you want, and we'll tell you exactly what skills you're missing.</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12">
                   <div className="w-16 h-16 border-4 border-orange-500/10 border-t-orange-600 rounded-full animate-spin mb-6"></div>
                   <p className="text-sm font-black uppercase tracking-widest animate-pulse text-orange-500">Comparing with MAANG standards...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
