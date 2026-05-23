import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";

export default function MarketTrends() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-slate-200";
  const headText = isDark ? "text-white" : "text-slate-800";
  const subText = isDark ? "text-slate-400" : "text-slate-500";
  const tickFill = isDark ? "rgba(255,255,255,0.6)" : "rgba(30,30,60,0.7)";
  const gridStroke = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const tooltipBg = isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255,255,255,0.98)";
  const tooltipBorder = isDark ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.2)";
  const tooltipColor = isDark ? "#fff" : "#1e1b4b";

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await API.get("/market-trends");
        setData(res.data);
      } catch (err) { console.error("Failed to fetch trends", err); }
      finally { setLoading(false); }
    };
    fetchTrends();
  }, []);

  return (
    <div className={`font-sans transition-colors min-h-screen ${isDark ? 'text-white' : 'text-slate-800'}`}>
      {/* Header */}
      <div className="mb-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-3 ${isDark ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-700/50' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Live Adzuna Market Data
        </div>
        <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${headText}`}>Market Trends</h1>
        <p className={`mt-2 font-medium ${subText}`}>Real-time tech demand & in-demand roles from live job postings</p>
      </div>

      {loading || !data ? (
        <div className={`h-64 flex flex-col items-center justify-center rounded-[2rem] border ${cardBg}`}>
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className={`font-bold ${subText}`}>Loading live data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Skills Bar Chart */}
            <div className={`backdrop-blur-xl border rounded-[2rem] p-6 ${cardBg}`}>
              <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 ${headText}`}>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />In-Demand Technologies
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.skills} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="name" stroke="transparent" tick={{fill: tickFill, fontSize: 12}} dy={10} tickLine={false} />
                    <YAxis stroke="transparent" tick={{fill: tickFill, fontSize: 11}} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '1rem', color: tooltipColor, fontWeight: 'bold', fontSize: '13px' }} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                    <Bar dataKey="value" fill="url(#barGrad)" radius={[8, 8, 0, 0]} maxBarSize={48} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Roles Line Chart */}
            <div className={`backdrop-blur-xl border rounded-[2rem] p-6 ${cardBg}`}>
              <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 ${headText}`}>
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />Trending Job Roles
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.roles_time_series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="name" stroke="transparent" tick={{fill: tickFill, fontSize: 12}} dy={10} tickLine={false} />
                    <YAxis stroke="transparent" tick={{fill: tickFill, fontSize: 11}} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '1rem', color: tooltipColor, fontWeight: 'bold', fontSize: '13px' }} />
                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: tickFill }} />
                    {data.roles?.map((role, idx) => {
                      const colors = ["#f472b6","#8b5cf6","#38bdf8","#34d399","#fb923c"];
                      return <Line key={role} type="monotone" dataKey={role} stroke={colors[idx % colors.length]} strokeWidth={3} dot={{ r: 3, fill: colors[idx % colors.length] }} activeDot={{ r: 5 }} />;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Live Job Listings", value: data.total_jobs ? `${(data.total_jobs/1000).toFixed(1)}K+` : "Loading", color: "text-indigo-400", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01" },
              { label: "In-Demand Skills", value: data.skills?.length || 8, color: "text-purple-400", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1" },
              { label: "Trending Roles", value: data.roles?.length || 4, color: "text-cyan-400", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
              { label: "Data Source", value: "Adzuna API", color: "text-emerald-400", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
            ].map(stat => (
              <div key={stat.label} className={`backdrop-blur-xl border rounded-2xl p-5 ${cardBg}`}>
                <svg className={`w-5 h-5 ${stat.color} mb-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}/></svg>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className={`text-xs font-medium mt-1 ${subText}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
