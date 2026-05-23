import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function ReadinessDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/api/readiness");
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(true);
        // Provide fallback data so UI still renders beautifully
        setData({
          total_score: 0,
          is_leetcode_verified: false,
          is_github_verified: false,
          metrics: { skills: 0, projects: 0, github: 0, dsa: 0, resume: 0 }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-12 ${isDark ? 'text-white' : 'text-slate-800'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Calculating your readiness...</p>
        </div>
      </div>
    );
  }

  const { total_score, metrics, is_leetcode_verified, is_github_verified } = data;
  const scoreStatus = total_score >= 70 ? "✓ PLACEMENT READY" : total_score >= 40 ? "⚡ MAKING PROGRESS" : "⚠ NEEDS ATTENTION";
  const statusClass = total_score >= 70 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : total_score >= 40 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-red-500/20 text-red-400 border-red-500/30";
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (total_score / 100) * circumference;

  const bars = [
    { label: "Skills",          pct: metrics.skills,   color: "#06d6a0", glow: "rgba(6,214,160,0.4)",   weight: "30%" },
    { label: "Projects",        pct: metrics.projects,  color: "#a663cc", glow: "rgba(166,99,204,0.4)",  weight: "20%" },
    { label: "GitHub Activity", pct: metrics.github,   color: "#ff9f1c", glow: "rgba(255,159,28,0.4)",  weight: "20%" },
    { label: "DSA Progress",    pct: metrics.dsa,      color: "#4cc9f0", glow: "rgba(76,201,240,0.4)",  weight: "20%" },
    { label: "Resume Quality",  pct: metrics.resume,   color: "#fbbc05", glow: "rgba(251,188,5,0.4)",   weight: "10%" },
  ];

  const cardBg = isDark ? "bg-[#1a1d27] border-[#2a2e3d]" : "bg-white border-slate-200";
  const headText = isDark ? "text-white" : "text-slate-800";
  const subText = isDark ? "text-slate-400" : "text-slate-500";
  const trackColor = isDark ? "#2a2e3d" : "#e2e8f0";
  const barBg = isDark ? "bg-[#1a1d27] border-[#2a2e3d]" : "bg-slate-100 border-slate-200";

  return (
    <div className={`font-sans transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
      {/* Header */}
      <div className="mb-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-3 border ${isDark ? 'bg-amber-900/30 text-amber-300 border-amber-700/50' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Placement Intelligence
        </div>
        <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${headText}`}>Readiness Dashboard</h1>
        <p className={`mt-2 font-medium ${subText}`}>Your composite placement score computed from verified data</p>
        {error && <div className={`mt-3 text-sm font-bold px-4 py-2 rounded-xl border inline-block ${isDark ? 'bg-red-900/20 text-red-400 border-red-700/30' : 'bg-red-50 text-red-600 border-red-200'}`}>⚠ Could not connect to backend — showing default scores. Start the backend server.</div>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

        {/* Left: Dial */}
        <div className="xl:col-span-5 flex flex-col items-center">
          <div className={`relative w-full max-w-xs rounded-[2rem] border p-8 flex flex-col items-center ${cardBg}`}>

            <div className="relative w-60 h-60 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 80px rgba(251,188,5,0.15)` }} />
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={radius} fill="none" stroke={trackColor} strokeWidth="8" />
                <circle
                  cx="100" cy="100" r={radius} fill="none" stroke="#fbbc05" strokeWidth="8"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" className="transition-all duration-1000 ease-out"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(251,188,5,0.6))' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-7xl font-black leading-none text-amber-400" style={{ textShadow: '0 0 30px rgba(251,188,5,0.4)' }}>{total_score}</span>
                <div className={`w-12 h-px ${isDark ? 'bg-white/20' : 'bg-slate-300'} my-2`} />
                <span className={`text-xs font-bold tracking-widest ${subText} uppercase`}>Placement Score</span>
              </div>
            </div>

            <div className={`px-6 py-2.5 rounded-xl font-bold text-xs tracking-widest uppercase border ${statusClass}`}>
              {scoreStatus}
            </div>

            {/* Verification Badges */}
            <div className="mt-6 w-full space-y-2">
              <div className={`flex items-center justify-between px-4 py-2 rounded-xl border text-sm font-bold ${is_leetcode_verified ? (isDark ? 'bg-emerald-900/20 border-emerald-700/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600') : (isDark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400')}`}>
                <span>LeetCode</span>
                <span>{is_leetcode_verified ? '✓ Verified' : 'Not Verified'}</span>
              </div>
              <div className={`flex items-center justify-between px-4 py-2 rounded-xl border text-sm font-bold ${is_github_verified ? (isDark ? 'bg-emerald-900/20 border-emerald-700/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600') : (isDark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400')}`}>
                <span>GitHub</span>
                <span>{is_github_verified ? '✓ Verified' : 'Not Verified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bars */}
        <div className="xl:col-span-7">
          <div className={`backdrop-blur-xl border rounded-[2rem] p-8 ${cardBg}`}>
            <h2 className={`text-2xl font-bold mb-8 ${headText}`}>Score Breakdown</h2>
            <div className="space-y-7">
              {bars.map(bar => (
                <div key={bar.label} className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-bold ${headText}`}>{bar.label}</span>
                    <span className={`text-xs font-medium ${subText}`}>Weight {bar.weight}</span>
                  </div>
                  <div className={`w-full h-5 rounded-full relative overflow-hidden border ${barBg}`}>
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${bar.pct}%`, backgroundColor: bar.color, boxShadow: `0 0 12px ${bar.glow}` }}
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs font-bold" style={{ color: bar.color }}>{bar.pct}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Improvement Tip */}
            {!is_leetcode_verified && !is_github_verified && (
              <div className={`mt-8 p-4 rounded-2xl border ${isDark ? 'bg-indigo-900/20 border-indigo-700/30' : 'bg-indigo-50 border-indigo-200'}`}>
                <p className={`text-sm font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                  💡 Verify your LeetCode &amp; GitHub profiles in the <a href="/profile" className="underline cursor-pointer">Smart Profile Engine</a> to unlock a significant score boost!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
