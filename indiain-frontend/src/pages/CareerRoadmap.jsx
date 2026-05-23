import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

export default function CareerRoadmap() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [role, setRole] = useState("");
  const [autoMode, setAutoMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);

  const card = isDark ? "bg-[#1a1d27] border-[#2a2e3d]" : "bg-white border-slate-200";
  const headText = isDark ? "text-white" : "text-slate-800";
  const subText = isDark ? "text-slate-400" : "text-slate-500";
  const inputClass = isDark ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500";

  const fetchRoadmap = async () => {
    try {
      const res = await API.get("/api/roadmap");
      if (res.data.roadmap) setRoadmap(res.data.roadmap);
    } catch { }
  };

  useEffect(() => { fetchRoadmap(); }, []);

  const generateRoadmap = async () => {
    if (!role.trim()) { setError("Please specify a target role first."); return; }
    setLoading(true); setError(null);
    try {
      await API.post("/api/roadmap/generate", { role, auto_mode: autoMode });
      await fetchRoadmap();
    } catch {
      setError("Failed to generate roadmap. Did you upload your base resume?");
    } finally { setLoading(false); }
  };

  const toggleTask = async (taskId, currentStatus) => {
    const newStatus = !currentStatus;
    setRoadmap(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, is_completed: newStatus } : t) }));
    try { await API.put(`/api/roadmap/task/${taskId}`, { is_completed: newStatus }); }
    catch { console.error("Failed to update task"); }
  };

  const completedCount = roadmap?.tasks?.filter(t => t.is_completed).length || 0;
  const totalCount = roadmap?.tasks?.length || 0;

  return (
    <div className={`font-sans min-h-screen transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
      {/* Header + Input Card */}
      <div className="mb-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-3 border ${isDark ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />AI Career Roadmap Generator
        </div>
        <h1 className={`text-4xl md:text-5xl font-black tracking-tight mb-2 ${headText}`}>Career Roadmap</h1>
        <p className={`font-medium ${subText}`}>Month-by-month learning trajectory, tailored to your skills and dream role.</p>
      </div>

      <div className={`backdrop-blur-xl border rounded-[2rem] p-8 mb-8 ${card}`}>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-4">
            <div>
              <label className={`block text-sm font-bold mb-2 ${subText}`}>Target Role</label>
              <input
                type="text" value={role} onChange={e => setRole(e.target.value)}
                placeholder="e.g. Data Scientist, Backend SDE, ML Engineer"
                className={`w-full px-4 py-3.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${inputClass}`}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoMode(!autoMode)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${autoMode ? 'bg-emerald-500' : (isDark ? 'bg-white/20' : 'bg-slate-300')}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${autoMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <div>
                <p className={`text-sm font-bold ${headText}`}>Auto Mode (Resume-Aware)</p>
                <p className={`text-xs ${subText}`}>Uses your uploaded resume to tailor the roadmap</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-56 shrink-0">
            <button
              onClick={generateRoadmap} disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <><div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />Generating...</> : <>Generate Roadmap<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></>}
            </button>
            {error && <p className={`text-xs font-bold mt-2 text-center ${isDark ? 'text-red-400' : 'text-red-500'}`}>{error}</p>}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {roadmap && totalCount > 0 && (
        <div className={`backdrop-blur-xl border rounded-2xl p-5 mb-8 flex items-center gap-6 ${card}`}>
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className={`text-sm font-bold ${headText}`}>Overall Progress</span>
              <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{completedCount}/{totalCount} Months</span>
            </div>
            <div className={`h-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(completedCount / totalCount) * 100}%` }} />
            </div>
          </div>
          <div className="text-center shrink-0">
            <p className={`text-2xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{Math.round((completedCount/totalCount)*100)}%</p>
            <p className={`text-xs ${subText}`}>Complete</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      {roadmap && roadmap.tasks && roadmap.tasks.length > 0 && (
        <div className={`backdrop-blur-xl border rounded-[2rem] p-8 ${card}`}>
          <h2 className={`text-2xl font-black mb-8 ${headText}`}>
            Your Path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{roadmap.target_role}</span>
          </h2>
          <div className="space-y-6">
            {roadmap.tasks.map((task, index) => {
              const isDone = task.is_completed;
              return (
                <div key={task.id} className={`relative flex gap-5 pb-6 ${index < roadmap.tasks.length - 1 ? 'border-l-2 ml-5 pl-8' : 'ml-5 pl-8'} ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  {/* Timeline dot */}
                  <div
                    onClick={() => toggleTask(task.id, isDone)}
                    className={`absolute -left-5 top-0 w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${isDone ? 'bg-emerald-500 border-emerald-300 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : (isDark ? 'bg-[#1a1d27] border-white/20 hover:border-emerald-500' : 'bg-white border-slate-300 hover:border-emerald-400')}`}
                  >
                    {isDone ? <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> : <span className={`font-black text-sm ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{task.month_number}</span>}
                  </div>

                  {/* Content */}
                  <div className={`w-full p-5 rounded-2xl border transition-all ${isDone ? (isDark ? 'bg-emerald-900/10 border-emerald-800/20' : 'bg-emerald-50/50 border-emerald-100') : (isDark ? 'bg-white/3 border-white/10' : 'bg-white border-slate-100')}`}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <span className={`text-xs font-black uppercase tracking-widest ${isDone ? 'text-emerald-400' : subText}`}>Month {task.month_number}</span>
                        <h4 className={`text-xl font-bold mt-1 ${isDone ? (isDark ? 'text-slate-500 line-through' : 'text-slate-400 line-through') : headText}`}>{task.title}</h4>
                      </div>
                      <input type="checkbox" checked={isDone} onChange={() => toggleTask(task.id, isDone)} className="w-5 h-5 accent-emerald-500 rounded cursor-pointer mt-1 shrink-0" />
                    </div>
                    <p className={`text-sm leading-relaxed mb-4 ${isDone ? subText : (isDark ? 'text-slate-300' : 'text-slate-600')}`}>{task.description}</p>
                    {task.resources && task.resources.length > 0 && !isDone && (
                      <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                        <p className={`text-xs font-black uppercase tracking-widest mb-2 ${subText}`}>Resources</p>
                        <div className="flex flex-wrap gap-2">
                          {task.resources.map((res, i) => (
                            <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                              <svg className="w-3 h-3 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/></svg>
                              {res}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
