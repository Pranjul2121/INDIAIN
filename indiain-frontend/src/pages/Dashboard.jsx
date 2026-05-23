import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useResume } from "../context/ResumeContext";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { resumeText, setResumeText } = useResume();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const bg = isDark ? "bg-[#11131c]" : "bg-[#f4f7fb]";
  const card = isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-100 text-slate-800";
  const subText = isDark ? "text-slate-400" : "text-slate-500";
  const headText = isDark ? "text-white" : "text-slate-800";

  return (
    <div className={`min-h-screen relative ${bg} font-sans transition-colors duration-500 overflow-x-hidden`}>
      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] mix-blend-multiply ${isDark ? 'bg-indigo-900/40' : 'bg-blue-400/20'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] mix-blend-multiply ${isDark ? 'bg-purple-900/40' : 'bg-purple-400/20'}`} />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6 animate-[fadeInUp_0.8s_ease-out]">

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 cursor-pointer border transition-colors ${isDark ? 'bg-indigo-900/40 border-indigo-700 text-indigo-300 hover:bg-indigo-900/60' : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100'}`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            AI-Powered Career Intelligence Platform
          </div>
          <h1 className={`text-5xl md:text-7xl font-black mb-4 tracking-tight leading-tight ${headText}`}>
            Elevate Your <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500">
              Career Journey
            </span>
          </h1>
          <p className={`text-lg md:text-xl font-medium ${subText}`}>
            Upload your resume, verify your profile, track your readiness—all in one smart workspace.
          </p>
        </div>

        {/* Quick Tools - 5 card horizontal grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[
            { to: "/market-trends", color: isDark ? "bg-indigo-900/40 border-indigo-700/50 hover:bg-indigo-800/60" : "bg-indigo-50/80 border-indigo-100 hover:bg-indigo-600", hoverText: "group-hover:text-white", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", label: "Market Trends", sub: "Live Adzuna Skills", iconBg: isDark ? "bg-indigo-700/50" : "bg-indigo-100", iconColor: "text-indigo-400" },
            { to: "/resume-builder", color: isDark ? "bg-fuchsia-900/40 border-fuchsia-700/50 hover:bg-fuchsia-800/60" : "bg-fuchsia-50/80 border-fuchsia-100 hover:bg-fuchsia-600", hoverText: "group-hover:text-white", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", label: "Tailor Resume", sub: "AI Alignment", iconBg: isDark ? "bg-fuchsia-700/50" : "bg-fuchsia-100", iconColor: "text-fuchsia-400" },
            { to: "/cover-letter", color: isDark ? "bg-purple-900/40 border-purple-700/50 hover:bg-purple-800/60" : "bg-purple-50/80 border-purple-100 hover:bg-purple-600", hoverText: "group-hover:text-white", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Cover Letter", sub: "AI Drafting", iconBg: isDark ? "bg-purple-700/50" : "bg-purple-100", iconColor: "text-purple-400" },
            { to: "/career-roadmap", color: isDark ? "bg-emerald-900/40 border-emerald-700/50 hover:bg-emerald-800/60" : "bg-emerald-50/80 border-emerald-100 hover:bg-emerald-600", hoverText: "group-hover:text-white", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", label: "AI Roadmap", sub: "Timeline Tracking", iconBg: isDark ? "bg-emerald-700/50" : "bg-emerald-100", iconColor: "text-emerald-400" },
            { to: "/readiness-dashboard", color: isDark ? "bg-amber-900/40 border-amber-700/50 hover:bg-amber-800/60" : "bg-amber-50/80 border-amber-100 hover:bg-amber-600", hoverText: "group-hover:text-white", icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z", label: "Readiness", sub: "Placement Score", iconBg: isDark ? "bg-amber-700/50" : "bg-amber-100", iconColor: "text-amber-400" },
          ].map((item) => (
            <Link key={item.to} to={item.to} className={`group rounded-2xl border p-4 transition-all duration-300 ${item.color}`}>
              <div className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center mb-3 transition-colors`}>
                <svg className={`w-5 h-5 ${item.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/></svg>
              </div>
              <h4 className={`font-bold text-sm ${headText} ${item.hoverText} transition-colors`}>{item.label}</h4>
              <p className={`text-xs ${subText} ${item.hoverText} transition-colors mt-0.5`}>{item.sub}</p>
            </Link>
          ))}
        </div>

        {/* Profile CTA Banner */}
        <div className="mb-8 cursor-pointer group hover:scale-[1.005] transition-transform duration-500" onClick={() => navigate("/profile")}>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 to-indigo-900 border border-indigo-800/60 shadow-2xl p-8 md:p-10">
            <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] scale-150 group-hover:bg-indigo-400/30 transition-colors duration-1000" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3">Smart Engine</span>
                <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2">Smart Profile Engine</h2>
                <p className="text-indigo-200/80 font-medium max-w-lg text-sm md:text-base">Verify your LeetCode & GitHub live. Get a verified readiness badge and boost your placement score by up to 34%.</p>
              </div>
              <button className="shrink-0 bg-emerald-500 text-slate-900 font-bold px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all text-sm">
                Verify Now <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Resume Upload */}
          <div className={`group relative backdrop-blur-xl border rounded-[2rem] p-7 shadow-sm hover:shadow-lg transition-all duration-300 md:col-span-2 overflow-hidden ${card}`}>
            <div className="absolute top-0 right-0 w-56 h-56 bg-blue-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${headText}`}>Resume Upload</h3>
                <p className={`text-sm font-medium ${subText}`}>Upload your CV to power all AI features.</p>
              </div>
            </div>
            <div className="relative z-10 w-full">
              <ResumeUploadInline isDark={isDark} />
            </div>
          </div>

          {/* ATS Checker - no overflow: hidden so button is never clipped */}
          <div className={`group relative backdrop-blur-xl border rounded-[2rem] p-7 shadow-sm hover:shadow-lg transition-all duration-300 ${card}`}>
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10" />
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${headText}`}>ATS Score</h3>
                <p className={`text-sm font-medium ${subText}`}>Check resume parsability.</p>
              </div>
            </div>
            <ATSCheckerInline isDark={isDark} />
          </div>

          {/* Job Recommendations - fixed height, no stretch */}
          <div className={`group relative backdrop-blur-xl border rounded-[2rem] p-7 shadow-sm hover:shadow-lg transition-all duration-300 md:col-span-3 overflow-hidden ${card}`}>
            <div className="absolute top-0 left-0 w-56 h-56 bg-green-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10" />
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-900/50' : 'bg-emerald-50'}`}>
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${headText}`}>Smart Job Match</h3>
                <p className={`text-sm font-medium ${subText}`}>AI-powered job suggestions from your resume.</p>
              </div>
            </div>
            <JobRecsInline isDark={isDark} />
          </div>

          {/* AI Review - full width dark card */}
          <div className="group relative bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-800/60 rounded-[2rem] p-7 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 md:col-span-3 overflow-hidden text-white">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
              <svg width="360" height="360" viewBox="0 0 400 400" fill="none"><circle cx="200" cy="200" r="199.5" stroke="white"/><circle cx="200" cy="200" r="149.5" stroke="white"/><circle cx="200" cy="200" r="99.5" stroke="white"/></svg>
            </div>
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              <div className="md:w-1/4">
                <div className="w-11 h-11 rounded-xl bg-indigo-800 mb-4 flex items-center justify-center ring-4 ring-indigo-900/50 shadow-[0_0_30px_rgba(79,70,229,0.4)]">
                  <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2">Smart AI Review</h3>
                <p className="text-indigo-200 text-sm leading-relaxed">Deep analysis of your resume and profile. Get actionable recommendations to land your dream role faster.</p>
              </div>
              <div className="md:w-3/4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                <AIReviewInline />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- Inline sub-components below ---

import { useRef } from "react";
import ATSChecker from "./ATSChecker";
import AIReview from "./AIReview";

function ResumeUploadInline({ isDark }) {
  const { setResumeText, setResumeFileName } = useResume();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setUploadStatus(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await API.post("/upload-resume", formData);
      setResumeText(res.data.text || "");
      setResumeFileName(file.name);
      setUploadStatus("success");
    } catch {
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleUpload} />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group/upload ${isDark ? 'border-slate-600 hover:border-indigo-500 hover:bg-indigo-900/20' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-indigo-400">Parsing resume...</span>
          </div>
        ) : (
          <>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-slate-700 group-hover/upload:bg-indigo-700/50' : 'bg-slate-100 group-hover/upload:bg-indigo-100'}`}>
              <svg className={`w-6 h-6 ${isDark ? 'text-slate-300' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            </div>
            <div className="text-center px-4">
              <p className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Click to upload PDF resume</p>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Required for AI review, ATS check, cover letter & tailoring</p>
            </div>
          </>
        )}
      </button>
      {uploadStatus === "success" && <p className="text-emerald-500 text-sm font-bold mt-2 text-center">✓ Resume uploaded & extracted successfully!</p>}
      {uploadStatus === "error" && <p className="text-red-500 text-sm font-bold mt-2 text-center">Upload failed. Please try again.</p>}
    </div>
  );
}

function ATSCheckerInline({ isDark }) {
  return <ATSChecker isDark={isDark} />;
}

function JobRecsInline({ isDark }) {
  const { resumeText } = useResume();
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.post("/smart-job-match", { resume_text: resumeText || "Python React Node Machine Learning Data Science" });
      setJobs(res.data.jobs || []);
      setSkills(res.data.skills || []);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const inputBorder = isDark ? "border-slate-700 text-slate-300 bg-transparent" : "border-slate-200 text-slate-600";

  return (
    <div>
      {skills.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {skills.map(s => <span key={s} className={`px-2.5 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>{s}</span>)}
        </div>
      )}
      {jobs.length === 0 && !loading && (
        <button onClick={fetchJobs} className={`mt-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-indigo-700/50 text-white hover:bg-indigo-600/60 border border-indigo-600/40' : 'bg-indigo-600 text-white hover:bg-indigo-700'} shadow-lg`}>
          {resumeText ? "Get Smart Job Match" : "Get Sample Match (Upload Resume for Personalization)"}
        </button>
      )}
      {loading && <div className="flex items-center gap-3 mt-4"><div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/><span className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>Finding your best matches...</span></div>}
      {jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-h-80 overflow-y-auto pr-1">
          {jobs.map((job, i) => (
            <div key={i} className={`p-4 rounded-2xl border transition-all hover:shadow-md ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <h4 className={`font-bold text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{job.title}</h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{job.company} · {job.location}</p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">{job.match}%</span>
              </div>
              {job.missing_skills?.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-rose-400 mb-1 uppercase">Missing</p>
                  <div className="flex flex-wrap gap-1">{job.missing_skills.slice(0, 3).map(ms => <span key={ms} className="px-1.5 py-0.5 text-[10px] font-bold text-rose-500 bg-rose-500/10 rounded">{ms}</span>)}</div>
                </div>
              )}
              <a href={`/job/${job.id}?url=${encodeURIComponent(job.redirect_url)}&title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location)}`} className={`block text-center text-xs font-bold py-2 rounded-xl transition-colors ${isDark ? 'bg-white/10 text-indigo-300 hover:bg-white/20' : 'bg-slate-50 text-indigo-600 hover:bg-indigo-50'}`}>View Details</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AIReviewInline() {
  const [review, setReview] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    try {
      setIsAnalyzing(true); setError(null); setReview("");
      const res = await API.get("/ai-resume-review");
      setReview(res.data.ai_review);
    } catch (err) {
      const msg = err.response?.data?.detail || "Analysis failed. Please ensure you have uploaded a resume first.";
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="text-white">
      {!review && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
            <svg className="w-7 h-7 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          </div>
          <button onClick={analyze} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-[0_0_25px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all">
            Generate AI Feedback
          </button>
          <p className="text-xs text-indigo-200/50 mt-3">Takes about ~15 seconds</p>
        </div>
      )}
      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">{error} <button onClick={() => setError(null)} className="underline ml-2">Retry</button></div>}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
            <div className="absolute inset-4 rounded-full border-b-2 border-cyan-400 animate-spin" style={{ animationDuration: '3s' }}></div>
          </div>
          <p className="font-bold text-indigo-300">Analyzing phrasing &amp; impact...</p>
        </div>
      )}
      {review && !isAnalyzing && (
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-indigo-500/30 pb-3">
            <span className="text-indigo-300 font-bold text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 block"/>AI Feedback Complete</span>
            <button onClick={analyze} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-indigo-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></button>
          </div>
          <div className="max-h-60 overflow-y-auto pr-1">
            <p className="text-indigo-50 font-medium leading-relaxed whitespace-pre-wrap text-sm">{review}</p>
          </div>
        </div>
      )}
    </div>
  );
}
