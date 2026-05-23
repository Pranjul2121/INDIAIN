import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Signup() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const navigate = useNavigate();

  const signup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      setIsLoading(true);
      await API.post(`/signup?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      setSuccess(true);
      setTimeout(() => setShowSplash(true), 100);
      setTimeout(() => navigate("/"), 2200);
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed. Email may already exist.");
    } finally {
      setIsLoading(false);
    }
  };

  const bgClass = isDark ? "bg-[#0b0d17] text-white" : "bg-[#f8fafc] text-slate-900";
  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/80 border-slate-200/60";

  if (success) {
      return (
          <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#0b0d17]' : 'bg-[#fafcff]'}`}>
              {/* Immersive Portal Effect */}
              <div className={`absolute inset-0 transition-all duration-[2s] ease-[cubic-bezier(0.23,1,0.32,1)] ${showSplash ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}>
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full blur-[120px] mix-blend-screen opacity-20 ${isDark ? 'bg-emerald-500' : 'bg-emerald-300'}`} />
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                  <div className={`relative transition-all duration-[1.2s] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showSplash ? 'scale-100 opacity-100 rotate-0' : 'scale-[0.2] opacity-0 rotate-12'}`}>
                      <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-40 animate-pulse" />
                      <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.4)] ring-4 ring-white/10">
                         <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      </div>
                  </div>

                  <div className={`mt-10 flex flex-col items-center transition-all duration-1000 delay-300 ${showSplash ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                      <h1 className={`text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Account Activated.</h1>
                      <p className={`mt-4 text-sm font-bold uppercase tracking-[0.4em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Welcome to the intelligence era</p>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className={`min-h-screen flex font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-500 ${bgClass}`}>
      
      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className={`fixed top-8 right-8 z-[60] p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-xl group/theme ${isDark ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10' : 'bg-white/80 border-slate-200 text-indigo-600 hover:bg-white'}`}
      >
        {isDark ? (
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg> 
        ) : (
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
        )}
      </button>

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] mix-blend-screen opacity-50 ${isDark ? 'bg-indigo-900/40' : 'bg-indigo-200/40'}`} />
          <div className={`absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] mix-blend-screen opacity-50 ${isDark ? 'bg-orange-900/20' : 'bg-orange-200/30'}`} />
      </div>

      {/* LEFT COLUMN: Hero Section */}
      <div className="hidden lg:flex flex-col flex-1 p-24 relative overflow-hidden justify-between group">
          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-16">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500 via-indigo-600 to-indigo-600 flex items-center justify-center shadow-2xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <span className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      INDIA<span className="text-orange-500">IN</span>
                  </span>
              </div>

              <h1 className={`text-6xl font-black leading-[1.05] mb-8 tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Join the elite <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">student workspace</span> <br/> built with AI.
              </h1>
              
              <div className="space-y-4 max-w-lg mt-12">
                {[
                  "AI-powered resume tailoring & ATS optimization",
                  "LeetCode & GitHub live verification",
                  "AI Career Roadmap generation",
                  "Real-time placement readiness score"
                ].map((f) => (
                  <div key={f} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 font-bold ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white/50 border-slate-200 text-slate-700'}`}>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    {f}
                  </div>
                ))}
            </div>
          </div>

          <div className="relative z-10 text-sm font-bold opacity-60">
              <span className={isDark ? "text-slate-400" : "text-slate-600"}>Empowering digital-first career growth.</span>
          </div>
      </div>

      {/* RIGHT COLUMN: Signup Interface */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative z-10 overflow-y-auto pt-24">
         <div className="w-full max-w-md mx-auto">
            <div className={`p-8 md:p-12 rounded-[3.5rem] border backdrop-blur-2xl shadow-2xl ${cardBg}`}>
                <h2 className={`text-4xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Start Today.</h2>
                <p className={`font-medium mb-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Create your intelligence-first account.</p>

                <div className="space-y-5">
                    <div>
                        <label className={`block text-xs font-black uppercase tracking-widest mb-3 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Full Name</label>
                        <input
                            type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)}
                            className={`w-full px-6 py-4 rounded-2xl border transition-all outline-none text-lg font-medium shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-100/50 border-slate-200 text-slate-800'}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-xs font-black uppercase tracking-widest mb-3 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Email Address</label>
                        <input
                            type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)}
                            className={`w-full px-6 py-4 rounded-2xl border transition-all outline-none text-lg font-medium shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-100/50 border-slate-200 text-slate-800'}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-xs font-black uppercase tracking-widest mb-3 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Password</label>
                        <input
                            type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                            className={`w-full px-6 py-4 rounded-2xl border transition-all outline-none text-lg font-medium shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-100/50 border-slate-200 text-slate-800'}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-xs font-black uppercase tracking-widest mb-3 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Confirm Password</label>
                        <input
                            type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            className={`w-full px-6 py-4 rounded-2xl border transition-all outline-none text-lg font-medium shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-100/50 border-slate-200 text-slate-800'}`}
                        />
                    </div>

                    <button
                        onClick={signup}
                        disabled={isLoading}
                        className="w-full mt-4 bg-gradient-to-r from-orange-500 to-indigo-600 text-white font-black py-5 rounded-2xl shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_25px_60px_-10px_rgba(79,70,229,0.7)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                        {isLoading ? "Creating Identity..." : "Initialize Workspace"}
                    </button>
                </div>

                <div className="mt-10 text-center text-sm font-bold">
                    <span className={isDark ? "text-slate-500" : "text-slate-400"}>Already of the community?</span>{" "}
                    <Link to="/" className="text-indigo-500 hover:text-orange-500 transition-colors border-b-2 border-indigo-500/20 pb-0.5">
                       Log In
                    </Link>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
