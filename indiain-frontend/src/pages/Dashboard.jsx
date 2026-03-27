import React, { useState } from "react";
import ResumeUpload from "./ResumeUpload";
import ATSChecker from "./ATSChecker";
import AIReview from "./AIReview";
import JobRecommendations from "./JobRecommendations";

export default function Dashboard() {
  const [resumeText, setResumeText] = useState("");
  return (
    <div className="min-h-screen relative bg-[#fafcff] text-slate-800 font-sans overflow-hidden z-0">
      
      {/* --- Ambient Background Glows --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/20 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-400/20 blur-[120px] mix-blend-multiply" />
        <div className="absolute top-[20%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-indigo-300/20 blur-[100px] mix-blend-multiply" />
      </div>

      {/* --- Floating Glass Navigation --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto backdrop-blur-md bg-white/60 border border-white/20 shadow-sm rounded-2xl px-6 py-3 flex justify-between items-center transition-all duration-300">
          <div className="flex items-center gap-2 text-2xl font-black tracking-tight">
            <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              INDIAIN
            </span>
          </div>
          <button className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5">
            My Profile
          </button>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold mb-6 hover:bg-indigo-100 transition-colors cursor-pointer">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            AI-Powered Career Growth
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Elevate Your <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
              Career Journey
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium">
            Upload your resume, analyze your ATS score, and receive personalized AI coaching—all in one intelligent workspace.
          </p>
        </div>

        {/* Bento Box Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">

          {/* Card 1: Resume Upload (Large focused layout) */}
          <div className="group relative bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 md:col-span-2 overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10 translate-x-1/2 -translate-y-1/2" />
            
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
                  <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Resume Upload</h3>
                <p className="text-slate-500 font-medium mt-1">Upload your latest CV to power up your profile.</p>
              </div>
            </div>
            <div className="relative z-10 w-full">
              <ResumeUpload setResumeText={setResumeText} />
            </div>
          </div>

          {/* Card 2: ATS Checker (Vertical focused) */}
          <div className="group relative bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden flex flex-col">
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10 -translate-x-1/2 translate-y-1/2" />
            
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-600 transition-all duration-500">
              <svg className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">ATS Score</h3>
            <p className="text-slate-500 font-medium mt-1 mb-6">See how parsable your resume actually is.</p>
            
            <div className="mt-auto relative z-10 w-full">
              <ATSChecker />
            </div>
          </div>
          
          {/* Card 4: Job Recommendations */}
<div className="group relative bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 md:col-span-3 overflow-hidden">

  <div className="absolute top-0 left-0 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10 -translate-x-1/2 -translate-y-1/2" />

  <div className="flex items-center gap-3 mb-4">
    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 014-4h4"/>
      </svg>
    </div>
    <h3 className="text-2xl font-bold">Job Recommendations</h3>
  </div>

  <p className="text-slate-500 mb-6">
    Get AI-powered job suggestions based on your resume.
  </p>

  <JobRecommendations resumeText={resumeText} />
</div>
          {/* Card 3: AI Review (Full width bottom row) */}
          <div className="group relative bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-800 rounded-[2rem] p-8 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 md:col-span-3 overflow-hidden text-white flex flex-col md:flex-row gap-8 items-center lg:items-start">
            
             {/* Decorative lines */}
             <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="199.5" stroke="white"/><circle cx="200" cy="200" r="149.5" stroke="white"/><circle cx="200" cy="200" r="99.5" stroke="white"/></svg>
             </div>

            <div className="md:w-1/3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-800 mb-4 flex items-center justify-center ring-4 ring-indigo-900 shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-2">Smart AI Review</h3>
              <p className="text-indigo-200 text-lg">
                Let our advanced algorithms analyze your profile and provide actionable feedback to land your dream job faster.
              </p>
            </div>
            
            <div className="md:w-2/3 w-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 z-10 h-full">
              <AIReview />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
