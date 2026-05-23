import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }
    try {
      setIsLoading(true);
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);
      const res = await API.post("/login", formData);
      localStorage.setItem("token", res.data.access_token);
      
      setLoginSuccess(true);
      setTimeout(() => setShowSplash(true), 100);
      
      setTimeout(() => {
          navigate("/dashboard");
      }, 1800);

    } catch (err) {
      alert("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const bgClass = isDark ? "bg-[#0b0d17] text-white" : "bg-[#f8fafc] text-slate-900";
  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/80 border-slate-200/60";

  const [bootStatus, setBootStatus] = useState("Authenticating...");

  useEffect(() => {
    if (loginSuccess) {
      const statuses = ["Authenticating...", "Syncing AI Core...", "Encrypting Session...", "Loading Workspace..."];
      let i = 0;
      const interval = setInterval(() => {
        if (i < statuses.length - 1) {
          i++;
          setBootStatus(statuses[i]);
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [loginSuccess]);

  if (loginSuccess) {
      return (
          <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-[#0b0d17]' : 'bg-[#fafcff]'}`}>
              {/* Immersive Portal & Grid Effect */}
              <div className={`absolute inset-0 transition-all duration-[2s] ease-[cubic-bezier(0.23,1,0.32,1)] ${showSplash ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}>
                  <div className={`absolute inset-0 opacity-[0.03] ${isDark ? 'bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")]' : ''}`} />
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full blur-[120px] mix-blend-screen opacity-20 ${isDark ? 'bg-indigo-500' : 'bg-indigo-300'}`} />
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] rounded-full blur-[80px] mix-blend-screen opacity-10 ${isDark ? 'bg-orange-500' : 'bg-orange-300'}`} />
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                  {/* The Golden Logo Portal with Orbital Ring */}
                  <div className={`relative transition-all duration-[1.2s] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showSplash ? 'scale-100 opacity-100 rotate-0' : 'scale-[0.2] opacity-0 rotate-12'}`}>
                      {/* Orbital Loading Ring */}
                      <div className="absolute -inset-8 border-2 border-indigo-500/20 rounded-full" />
                      <div className="absolute -inset-8 border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
                      
                      <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-40 animate-pulse" />
                      <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-orange-500 via-indigo-600 to-indigo-700 flex items-center justify-center shadow-[0_0_80px_rgba(79,70,229,0.5)] ring-4 ring-white/10 overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                         <svg className={`w-20 h-20 text-white transition-all duration-1000 ${showSplash ? 'scale-110' : 'scale-50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                         </svg>
                      </div>
                  </div>

                  {/* Text Animation */}
                  <div className={`mt-12 flex flex-col items-center transition-all duration-1000 delay-300 ${showSplash ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                      <h1 className={`text-7xl font-black tracking-[-0.05em] flex items-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          <span>INDIA</span><span className="text-orange-500">IN</span>
                      </h1>
                      
                      {/* Flickering Status Log */}
                      <div className="mt-6 flex flex-col items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-[0.5em] animate-pulse ${isDark ? 'text-indigo-400/60' : 'text-indigo-600/60'}`}>
                              System Boot Sequence
                          </span>
                          <div className="h-6 overflow-hidden relative w-64 text-center">
                              <p className={`text-sm font-bold tracking-tight transition-all duration-300 ${isDark ? 'text-indigo-200' : 'text-slate-600'}`}>
                                  {bootStatus}
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
              
              {/* Background Glass Overlay */}
              <div className={`absolute inset-0 backdrop-blur-[2px] transition-opacity duration-1000 ${showSplash ? 'opacity-100' : 'opacity-0'}`} />
          </div>
      )
  }

  return (
    <div className={`min-h-screen flex font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-500 ${bgClass}`}>
      
      {/* Floating Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className={`fixed top-8 right-8 z-[60] p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-xl group/theme ${isDark ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10' : 'bg-white/80 border-slate-200 text-indigo-600 hover:bg-white'}`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      >
        {isDark ? (
           <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg> 
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
                  Scale your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Future Career</span> <br/> with Intelligence.
              </h1>
              
              <div className="space-y-6 max-w-lg">
                  <div className={`flex backdrop-blur-xl border p-6 rounded-[2rem] items-center gap-6 transition-all duration-300 ${cardBg}`}>
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                          <span className="text-emerald-500 text-2xl font-black">98%</span>
                      </div>
                      <div>
                          <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>ATS Success Rate</h3>
                          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>AI Tailoring formats your resume for FAANG-level parsers instantly.</p>
                      </div>
                  </div>

                  <div className={`flex backdrop-blur-xl border p-6 rounded-[2rem] items-center gap-6 transition-all duration-300 ${cardBg}`}>
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                           <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"/></svg>
                      </div>
                      <div>
                          <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Smart Profile Engine</h3>
                          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Verified LeetCode & GitHub insights for a data-driven candidacy.</p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-sm font-bold opacity-60">
              <span className={isDark ? "text-slate-400" : "text-slate-600"}>Built for the modern student</span>
              <div className={`w-12 h-px ${isDark ? "bg-slate-700" : "bg-slate-300"}`} />
          </div>
      </div>

      {/* RIGHT COLUMN: The Login Interface */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative z-10">
         <div className="w-full max-w-md mx-auto">
            <div className={`p-8 md:p-12 rounded-[3rem] border backdrop-blur-2xl shadow-2xl ${cardBg}`}>
                <h2 className={`text-4xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome back.</h2>
                <p className={`font-medium mb-10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sign in to your intelligent workspace.</p>

                <div className="space-y-6">
                    <div>
                        <label className={`block text-xs font-black uppercase tracking-widest mb-3 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Email Address</label>
                        <input
                            type="email"
                            className={`w-full px-6 py-4 rounded-2xl border transition-all outline-none text-lg font-medium shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500 focus:bg-white/10' : 'bg-slate-100/50 border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white'}`}
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3 ml-1">
                            <label className={`block text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Password</label>
                            <a href="#" className="text-xs font-bold text-indigo-500 hover:text-orange-500 transition-colors">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            className={`w-full px-6 py-4 rounded-2xl border transition-all outline-none text-lg font-medium shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500 focus:bg-white/10' : 'bg-slate-100/50 border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white'}`}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={login}
                        disabled={isLoading}
                        className="w-full mt-4 bg-gradient-to-r from-orange-500 to-indigo-600 text-white font-black py-5 rounded-2xl shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_25px_60px_-10px_rgba(79,70,229,0.7)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                    >
                        {isLoading ? "Authenticating..." : "Sign In to Workspace"}
                    </button>
                </div>

                <div className="mt-10 text-center text-sm font-bold">
                    <span className={isDark ? "text-slate-500" : "text-slate-400"}>New to INDIAIN?</span>{" "}
                    <Link to="/signup" className="text-indigo-500 hover:text-orange-500 transition-colors border-b-2 border-indigo-500/20 pb-0.5">
                       Create Free Account
                    </Link>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}