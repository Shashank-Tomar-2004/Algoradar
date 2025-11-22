// src/components/LandingPage.jsx
import React from "react";
import {
  Zap,
  Terminal,
  Shield,
  BarChart2,
  Globe,
  LogIn,
  Code,
} from "lucide-react";

const LandingPage = ({ onLogin }) => {
  return (
    <div className="h-screen relative overflow-hidden bg-[#030712] text-white font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="mb-8 animate-fade-in-up">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            V1.0 Public Beta
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-center mb-6">
          Algo
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
            Radar
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl text-center mb-10 leading-relaxed">
          The Next-Gen Competitive Programming Companion. <br />
          <span className="text-gray-500">
            Analytics. Recommendations. Multi-Platform Contests.
          </span>
        </p>

        <div className="flex flex-col md:flex-row gap-4 mt-6">
          {/* GOOGLE LOGIN */}
          <button
            onClick={() => onLogin("google")}
            className="group relative flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full text-lg transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105"
          >
            <LogIn size={20} />
            <span>Sign in with Google</span>
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/60 transition-all" />
          </button>

          {/* DEV MODE */}
          <button
            onClick={() => onLogin("local")}
            className="flex items-center gap-3 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-full text-lg transition-all border border-gray-700 hover:border-gray-500"
          >
            <Code size={20} />
            <span>Dev Mode</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full">
          {[
            {
              icon: Shield,
              title: "Zero Backend",
              desc: "Your data lives in your Local Storage or Google Drive. Total privacy.",
            },
            {
              icon: Globe,
              title: "Multi-Platform",
              desc: "Sync contests from Codeforces, LeetCode, and AtCoder.",
            },
            {
              icon: BarChart2,
              title: "Deep Analytics",
              desc: "Radar charts, heatmaps, and weighted XP tracking.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition backdrop-blur-sm"
            >
              <f.icon className="text-blue-400 mb-4" size={24} />
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

