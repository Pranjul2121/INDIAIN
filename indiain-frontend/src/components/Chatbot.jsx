import React, { useState, useRef, useEffect } from "react";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

const SYSTEM_INFO = `You are INDIAIN-Bot, the friendly AI assistant for the INDIAIN career platform.
INDIAIN helps students and job seekers with:
- Resume Upload & AI Analysis
- ATS Score Checker (how well your resume parses automated systems)
- Smart Job Match (AI recommends jobs from your resume)
- AI Resume Review (deep feedback on your resume)
- Resume Builder (tailor existing or generate new ATS-friendly resumes)
- Cover Letter Generator (AI-crafted cover letters for any job)
- AI Career Roadmap Generator (month-by-month learning plan to reach your dream role)
- Market Trends (live job demand charts via Adzuna API)
- Smart Profile Engine (link LeetCode & GitHub for verified placement score)
- Placement Readiness Dashboard (composite score based on skills, DSA, GitHub, resume quality)
Always be friendly, concise, and guide users to the right feature.`;

const QUICK_QUESTIONS = [
  "How does ATS check work?",
  "How to improve my readiness score?",
  "What is Smart Profile Engine?",
  "How to generate a roadmap?",
];

export default function Chatbot() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I'm INDIAIN-Bot. Ask me anything about the INDIAIN platform — features, how things work, tips to improve your profile, or anything career-related!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput("");
    const newMsgs = [...messages, { role: "user", content: userMsg }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      // Build conversation for API
      const conversationHistory = newMsgs.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n");
      const prompt = `${SYSTEM_INFO}\n\nConversation:\n${conversationHistory}\n\nAssistant:`;
      const res = await API.post("/api/chatbot", { message: userMsg, context: prompt });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't connect to the AI. Please make sure the backend is running!" }]);
    }
    setLoading(false);
  };

  const bg = isDark ? "bg-[#1a1d27] border-[#2a2e3d]" : "bg-white border-slate-200";
  const headerBg = "bg-gradient-to-r from-orange-500 to-indigo-600";
  const userBubble = "bg-indigo-600 text-white";
  const botBubble = isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-800";
  const inputClass = isDark ? "bg-white/10 border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400";

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}
        className={`w-16 h-16 rounded-full ${headerBg} text-white shadow-[0_8px_30px_rgba(79,70,229,0.4)] hover:shadow-[0_10px_40px_rgba(79,70,229,0.6)] hover:scale-110 transition-all flex items-center justify-center`}
      >
        {open ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
        {/* Pulsing dot to draw attention */}
        {!open && <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-ping" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{ position: "fixed", bottom: "100px", right: "24px", zIndex: 9998, width: "360px", maxHeight: "520px" }}
          className={`flex flex-col rounded-[2rem] border shadow-2xl overflow-hidden ${bg}`}
        >
          {/* Header */}
          <div className={`${headerBg} px-5 py-4 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🤖</div>
            <div>
              <h3 className="text-white font-black text-base tracking-tight">INDIA-Bot</h3>
              <p className="text-indigo-100/70 text-xs">AI Platform Assistant — Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-600 flex items-center justify-center text-xs mr-2 shrink-0 mt-1">🤖</div>}
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === "user" ? userBubble + " rounded-tr-sm" : botBubble + " rounded-tl-sm"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-600 flex items-center justify-center text-xs mr-2 shrink-0 mt-1`}>🤖</div>
                <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${botBubble}`}>
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendMessage(q)} className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-indigo-100 text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className={`p-3 border-t flex gap-2 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask me anything..."
              className={`flex-1 px-4 py-2.5 rounded-xl border outline-none text-sm transition-all ${inputClass}`}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
