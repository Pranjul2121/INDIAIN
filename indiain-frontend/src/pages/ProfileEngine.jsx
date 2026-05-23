import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function ProfileEngine() {
  const [profile, setProfile] = useState({});
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifyingLC, setVerifyingLC] = useState(false);
  const [verifyingGH, setVerifyingGH] = useState(false);
  const [detachingLC, setDetachingLC] = useState(false);
  const [detachingGH, setDetachingGH] = useState(false);

  const fetchData = async () => {
    try {
      const [profRes, readRes] = await Promise.all([
        API.get("/api/profile/me"),
        API.get("/api/readiness")
      ]);
      setProfile(profRes.data.profile || {});
      setReadiness(readRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        college: profile.college || null,
        experience_years: profile.experience_years ? parseInt(profile.experience_years) : null,
        preferred_role: profile.preferred_role || null,
        skills: profile.skills || null,
        certifications: profile.certifications || null,
        leetcode_username: profile.leetcode_username || null,
        github_username: profile.github_username || null,
      };
      await API.post("/api/profile/update", payload);
      await fetchData();
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "object" ? JSON.stringify(detail) : detail;
      alert("Failed to update profile: " + (msg || "Internal Server Error"));
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyLeetCode = async () => {
    if (!profile.leetcode_username) return;
    setVerifyingLC(true);
    try {
      await API.post("/api/verify/leetcode", { username: profile.leetcode_username });
      await fetchData();
    } catch (err) {
      alert("LeetCode verification failed. Check username.");
    } finally {
      setVerifyingLC(false);
    }
  };

  const handleVerifyGitHub = async () => {
    if (!profile.github_username) return;
    setVerifyingGH(true);
    try {
      await API.post("/api/verify/github", { username: profile.github_username });
      await fetchData();
    } catch (err) {
      alert("GitHub verification failed. Check username.");
    } finally {
      setVerifyingGH(false);
    }
  };

  const handleDetachLeetCode = async () => {
    if (!window.confirm("Are you sure you want to remove your LeetCode verification? Your solved count will be reset.")) return;
    setDetachingLC(true);
    try {
      await API.post("/api/verify/leetcode/detach");
      await fetchData();
    } catch (err) {
      alert("Failed to detach LeetCode.");
    } finally {
      setDetachingLC(false);
    }
  };

  const handleDetachGitHub = async () => {
    if (!window.confirm("Are you sure you want to remove your GitHub verification? Your repo count will be reset.")) return;
    setDetachingGH(true);
    try {
      await API.post("/api/verify/github/detach");
      await fetchData();
    } catch (err) {
      alert("Failed to detach GitHub.");
    } finally {
      setDetachingGH(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafcff] flex items-center justify-center">
         <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafcff] text-slate-800 font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[0%] left-[-20%] w-[50vw] h-[50vw] rounded-full bg-emerald-400/10 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-400/10 blur-[120px] mix-blend-multiply" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* Top Status Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 border border-indigo-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-400/30 transition-all duration-1000 -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    </div>
                    <h2 className="text-xl font-bold tracking-widest text-indigo-200 uppercase text-sm">Authenticity Engine</h2>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    You are <span className={readiness?.total_score >= 70 ? "text-emerald-400" : "text-amber-400"}>{readiness?.total_score || 0}% placement ready</span> for <span className="underline decoration-indigo-400">{profile.preferred_role || "any"}</span> role.
                </h1>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-bold text-slate-300">
                    <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/5">
                        LeetCode: {profile.is_leetcode_verified ? <span className="text-emerald-400">✅ {profile.leetcode_count} Solved</span> : "Not Verified"}
                    </span>
                    <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/5">
                        GitHub: {profile.is_github_verified ? <span className="text-emerald-400">✅ Active</span> : "Not Verified"}
                    </span>
                    <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/5">
                        Projects: {profile.projects_count || 0}/3 Required
                    </span>
                </div>
            </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
            {/* Core Identity */}
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Smart Profile Core</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-bold text-slate-500 ml-1">Preferred Role</label>
                        <input type="text" value={profile.preferred_role || ""} onChange={e => setProfile({...profile, preferred_role: e.target.value})} className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium" placeholder="E.g. SDE, Data Analyst" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-500 ml-1">College / University</label>
                        <input type="text" value={profile.college || ""} onChange={e => setProfile({...profile, college: e.target.value})} className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium" placeholder="E.g. IIT Delhi" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-500 ml-1">Years of Experience</label>
                        <input type="number" value={profile.experience_years || ""} onChange={e => setProfile({...profile, experience_years: e.target.value})} className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium" placeholder="E.g. 0 for Fresher" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-500 ml-1">Core Skills (Comma separated)</label>
                        <input type="text" value={profile.skills || ""} onChange={e => setProfile({...profile, skills: e.target.value})} className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium" placeholder="React, Node, Python..." />
                    </div>
                </div>
            </div>

            {/* External Verifications */}
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-3">
                   Verification Links <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-widest">Boosts Score</span>
                </h3>
                
                <div className="space-y-6">
                    {/* LeetCode Sync */}
                    <div className={`p-6 rounded-2xl border transition-all ${profile.is_leetcode_verified ? 'bg-emerald-50/80 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-bold text-slate-500">LeetCode Username or URL</label>
                          {profile.is_leetcode_verified && (
                            <button
                              type="button"
                              onClick={handleDetachLeetCode}
                              disabled={detachingLC}
                              className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-all disabled:opacity-50"
                            >
                              {detachingLC ? (
                                <div className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              )}
                              {detachingLC ? "Detaching..." : "Detach"}
                            </button>
                          )}
                        </div>
                        <div className="flex gap-3">
                            <input
                              type="text"
                              value={profile.leetcode_username || ""}
                              onChange={e => setProfile({...profile, leetcode_username: e.target.value})}
                              disabled={profile.is_leetcode_verified}
                              className="flex-grow p-3 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-800 disabled:text-slate-500 disabled:bg-slate-100"
                              placeholder="E.g. pranjul2121 or https://leetcode.com/pranjul2121"
                            />
                            {profile.is_leetcode_verified ? (
                                <div className="px-6 flex items-center justify-center bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 whitespace-nowrap">
                                   ✓ Verified · {profile.leetcode_count} solved
                                </div>
                            ) : (
                                <button type="button" onClick={handleVerifyLeetCode} disabled={verifyingLC} className="px-6 flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all whitespace-nowrap disabled:opacity-50">
                                   {verifyingLC ? 'Syncing...' : 'Verify Now'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* GitHub Sync */}
                    <div className={`p-6 rounded-2xl border transition-all ${profile.is_github_verified ? 'bg-emerald-50/80 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-bold text-slate-500">GitHub Username or URL</label>
                          {profile.is_github_verified && (
                            <button
                              type="button"
                              onClick={handleDetachGitHub}
                              disabled={detachingGH}
                              className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-all disabled:opacity-50"
                            >
                              {detachingGH ? (
                                <div className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              )}
                              {detachingGH ? "Detaching..." : "Detach"}
                            </button>
                          )}
                        </div>
                        <div className="flex gap-3">
                            <input
                              type="text"
                              value={profile.github_username || ""}
                              onChange={e => setProfile({...profile, github_username: e.target.value})}
                              disabled={profile.is_github_verified}
                              className="flex-grow p-3 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-800 disabled:text-slate-500 disabled:bg-slate-100"
                              placeholder="E.g. pranjul2121 or https://github.com/pranjul2121"
                            />
                            {profile.is_github_verified ? (
                                <div className="px-6 flex items-center justify-center bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 whitespace-nowrap">
                                   ✓ Active · {profile.projects_count} repos
                                </div>
                            ) : (
                                <button type="button" onClick={handleVerifyGitHub} disabled={verifyingGH} className="px-6 flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all whitespace-nowrap disabled:opacity-50">
                                   {verifyingGH ? 'Syncing...' : 'Verify Now'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <button type="submit" disabled={saving} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
               {saving ? 'Syncing Server...' : 'Update Smart Profile'}
            </button>
        </form>

      </div>
    </div>
  );
}
