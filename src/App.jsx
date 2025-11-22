// src/App.jsx
import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  getUserSubmissions,
  calculateUserStats,
  verifyUserHandle,
  calculateStreaks,
  getLeetCodePOTD,
} from "./services/cfService";
import LandingPage from "./components/LandingPage";
import Onboarding from "./components/Onboarding";
import StatsView from "./components/StatsView";
import RecommendationView from "./components/RecommendationView";
import ContestView from "./components/ContestView";
import StreakCalendar from "./components/StreakCalendar";
import TrainingView from "./components/TrainingView";
import ComparisonView from "./components/ComparisonView";
import RatingGraph from "./components/RatingGraph";
import GoalsWidget from "./components/GoalsWidget";
import {
  LogOut,
  Edit2,
  Award,
  LayoutDashboard,
  BarChart2,
  Target,
  Calendar,
  Flame,
  ExternalLink,
  Swords,
} from "lucide-react";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Your existing Dashboard component, unchanged
const Dashboard = () => {
  const { user, login, logout, data, loading, updatePrefs } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [levelData, setLevelData] = useState({
    level: 1,
    xp: 0,
    nextXp: 100,
    progress: 0,
  });
  const [streakData, setStreakData] = useState({
    current: 0,
    max: 0,
    activityMap: {},
  });
  const [potd, setPotd] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [cfAvatar, setCfAvatar] = useState(null);

  const [goals, setGoals] = useState([]);

  const cfHandle = data?.prefs?.user?.cf_handle;

  useEffect(() => {
    const saved = localStorage.getItem("algoradar_goals");
    if (saved) setGoals(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("algoradar_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    if (!cfHandle || loading || !data) return;

    const fetchData = async () => {
      const [subs, profile, daily] = await Promise.all([
        getUserSubmissions(cfHandle),
        verifyUserHandle(cfHandle),
        getLeetCodePOTD(),
      ]);

      setSubmissions(subs);
      if (profile?.titlePhoto) setCfAvatar(profile.titlePhoto);
      if (daily) setPotd(daily);

      const { xp: totalXp } = calculateUserStats(subs);
      const sData = calculateStreaks(subs);
      setStreakData(sData);

      const currentLevel = Math.floor(Math.sqrt(totalXp) / 5) + 1;
      const nextLevelXp = Math.pow(currentLevel * 5, 2);
      const prevLevelXp = Math.pow((currentLevel - 1) * 5, 2);
      const levelProgress =
        ((totalXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

      setLevelData({
        level: currentLevel,
        xp: totalXp,
        nextXp: nextLevelXp,
        progress: Math.min(Math.max(levelProgress, 0), 100),
      });
    };
    fetchData();
  }, [cfHandle, loading, data]);

  if (!user) return <LandingPage onLogin={login} />;
  if (loading || !data)
    return (
      <div className="h-screen flex items-center justify-center text-blue-400 font-mono animate-pulse">
        INITIALIZING...
      </div>
    );

  const showOnboarding = !cfHandle || cfHandle === "";
  const changeUser = () => updatePrefs({ user: { cf_handle: "" } });

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "training", label: "Training", icon: Target },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "compare", label: "Compare", icon: Swords },
    { id: "contests", label: "Contests", icon: Calendar },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8 relative pb-24 bg-[#030712] text-white selection:bg-blue-500/30">
      {showOnboarding && <Onboarding />}

      <nav className="flex justify-between items-center mb-8 max-w-[1600px] mx-auto w-full">
        <span className="text-2xl font-bold tracking-wider">
          ALGO<span className="text-blue-400">RADAR</span>
        </span>
        <div className="flex items-center gap-4 glass-panel px-4 py-2 rounded-full border border-white/5">
          <img
            src={cfAvatar || user.imageUrl}
            alt="Avatar"
            className="w-8 h-8 rounded-full ring-2 ring-blue-500/50 object-cover"
          />
          <button
            onClick={logout}
            className="text-red-400 hover:text-white transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {cfHandle ? (
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* BANNER */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0B1121]/60 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={cfAvatar || user.imageUrl}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/30 shadow-lg shadow-blue-500/20"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#030712] rounded-full p-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-mono font-bold text-white">
                    {cfHandle}
                  </h2>
                  <button
                    onClick={changeUser}
                    className="opacity-50 hover:opacity-100 transition"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                  <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                    <Award size={12} /> Level {levelData.level}
                  </span>
                  <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    {Math.floor(levelData.xp)} XP
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/3 flex flex-col justify-center">
              <div className="flex justify-between text-[10px] text-gray-400 mb-2 uppercase tracking-widest">
                <span>Next Level Progress</span>
                <span>
                  {Math.floor(levelData.nextXp - levelData.xp)} XP Left
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                  style={{ width: `${levelData.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-b border-gray-800/50 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative top-[1px] border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[500px]">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-[800px]">
                <div className="lg:col-span-3 space-y-6">
                  {potd && (
                    <div className="glass-panel p-6 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-900/10 to-transparent flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="text-orange-500" size={20} />
                          <span className="text-xs font-bold text-orange-400 uppercase">
                            LeetCode Daily
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {potd.title}
                        </h3>
                        <div className="flex gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              potd.difficulty === "Easy"
                                ? "bg-green-500/20 text-green-400"
                                : potd.difficulty === "Medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {potd.difficulty}
                          </span>
                          {potd.tags.slice(0, 3).map((t) => (
                            <span key={t} className="text-xs text-gray-500">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <a
                        href={potd.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition shadow-lg shadow-orange-900/20 flex items-center gap-2"
                      >
                        Solve <ExternalLink size={16} />
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RatingGraph handle={cfHandle} />
                    <GoalsWidget goals={goals} setGoals={setGoals} />
                  </div>

                  <RecommendationView handle={cfHandle} />
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-6 h-full lg:h-auto">
                  <div className="shrink-0">
                    <StreakCalendar
                      activityMap={streakData.activityMap}
                      currentStreak={streakData.current}
                      longestStreak={streakData.max}
                      goals={goals}
                    />
                  </div>
                  <div className="flex-1">
                    <ContestView
                      widget={true}
                      limit={7}
                      onViewMore={() => setActiveTab("contests")}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "training" && <TrainingView handle={cfHandle} />}
            {activeTab === "analytics" && <StatsView handle={cfHandle} />}
            {activeTab === "compare" && (
              <ComparisonView myHandle={cfHandle} />
            )}

            {activeTab === "contests" && (
              <div className="h-[calc(100vh-140px)]">
                <ContestView limit={null} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-20">
          Awaiting configuration...
        </div>
      )}
    </div>
  );
};

// Top-level App: now wraps everything in GoogleOAuthProvider + AuthProvider
function App() {
  if (!clientId) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#030712] text-white px-4">
        <div className="max-w-md w-full space-y-4 rounded-2xl border border-white/10 bg-black/40 p-6">
          <h1 className="text-xl font-semibold tracking-tight">
            AlgoRadar – Configuration required
          </h1>
          <p className="text-sm text-gray-300">
            <span className="font-mono">VITE_GOOGLE_CLIENT_ID</span> is not set.
            Add your Google OAuth 2.0 Web Client ID to a <code>.env</code> file:
          </p>
          <pre className="text-xs bg-black/60 border border-white/10 rounded-lg p-3 overflow-x-auto">
            {`VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`}
          </pre>
          <p className="text-xs text-gray-400">
            Then restart the dev server or redeploy. Make sure this Client ID
            belongs to an OAuth client with your localhost and production
            domain listed in{" "}
            <span className="font-mono">Authorized JavaScript origins</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

