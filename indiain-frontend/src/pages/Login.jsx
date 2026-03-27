import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const login = async () => {

    // ✅ Validation
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

      // ✅ Token store
      localStorage.setItem("token", res.data.access_token);

      // ✅ Redirect (React way)
      navigate("/dashboard");

    } catch (err) {
      alert("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#fafcff] overflow-hidden z-0 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/20 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-400/20 blur-[120px] mix-blend-multiply" />
      </div>

      {/* Card */}
      <div className="w-full max-w-md mx-4 relative group">
        
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-sm border border-indigo-100">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-800">
              Welcome back
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-5 py-3.5 rounded-xl bg-white/50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none shadow-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-sm font-bold text-slate-700">
                  Password
                </label>
                <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                className="w-full px-5 py-3.5 rounded-xl bg-white/50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Button */}
            <button
              onClick={login}
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Sign in to account"}
            </button>

          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-500 font-medium">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-500">
              Sign up for free
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}