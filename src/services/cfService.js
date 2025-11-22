import axios from "axios";

const CF_API = "https://codeforces.com/api";
const LC_API = "https://alfa-leetcode-api.onrender.com";
const AC_PROXY = "https://api.allorigins.win/raw?url=";
const AC_URL = "https://kenkoooo.com/atcoder/resources/contests.json";

export const verifyUserHandle = async (handle) => {
  try {
    const response = await axios.get(`${CF_API}/user.info`, {
      params: { handles: handle },
    });
    if (response.data.status === "OK") return response.data.result[0];
    return null;
  } catch (error) {
    return null;
  }
};

export const getUserSubmissions = async (handle) => {
  try {
    const response = await axios.get(`${CF_API}/user.status`, {
      params: { handle: handle },
    });
    if (response.data.status === "OK") return response.data.result;
    return [];
  } catch {
    return [];
  }
};

export const calculateUserStats = (submissions) => {
  const uniqueSolved = new Set();
  let totalXP = 0;
  submissions.forEach((sub) => {
    if (sub.verdict === "OK" && sub.problem.rating) {
      const key = `${sub.problem.contestId}${sub.problem.index}`;
      if (!uniqueSolved.has(key)) {
        uniqueSolved.add(key);
        totalXP += sub.problem.rating / 10;
      }
    }
  });
  return { xp: Math.floor(totalXP) };
};

export const calculateStreaks = (submissions) => {
  const activityMap = {};
  if (!submissions) return { current: 0, max: 0, activityMap: {} };

  submissions.forEach((sub) => {
    if (sub.verdict === "OK") {
      const date = new Date(sub.creationTimeSeconds * 1000)
        .toISOString()
        .split("T")[0];
      let type = "practice";
      if (sub.author.participantType === "CONTESTANT") type = "contest";
      else if (
        sub.problem.rating &&
        sub.problem.rating >= 1600 &&
        activityMap[date] !== "contest"
      )
        type = "milestone";
      if (!activityMap[date] || type === "contest") activityMap[date] = type;
    }
  });

  const dates = Object.keys(activityMap).sort();
  let maxStreak = 0,
    tempStreak = 0,
    currentStreak = 0;
  let prevDate = null;

  dates.forEach((dStr) => {
    const d = new Date(dStr);
    if (prevDate) {
      const diff = Math.ceil(Math.abs(d - prevDate) / (1000 * 60 * 60 * 24));
      if (diff === 1) tempStreak++;
      else tempStreak = 1;
    } else tempStreak = 1;
    if (tempStreak > maxStreak) maxStreak = tempStreak;
    prevDate = d;
  });

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (activityMap[today]) {
    currentStreak = 1;
    let d = new Date(Date.now() - 86400000);
    while (activityMap[d.toISOString().split("T")[0]]) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    }
  } else if (activityMap[yesterday]) {
    currentStreak = 1;
    let d = new Date(Date.now() - 172800000);
    while (activityMap[d.toISOString().split("T")[0]]) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    }
  }

  return { current: currentStreak, max: maxStreak, activityMap };
};

export const processProblemTags = (submissions) => {
  const tagCounts = {};
  const verdicts = { OK: 0, WA: 0, TLE: 0, OTHER: 0 };
  const solvedProblems = new Set();

  submissions.forEach((sub) => {
    if (sub.verdict === "OK") verdicts.OK++;
    else if (sub.verdict === "WRONG_ANSWER") verdicts.WA++;
    else if (sub.verdict === "TIME_LIMIT_EXCEEDED") verdicts.TLE++;
    else verdicts.OTHER++;

    if (sub.verdict === "OK") {
      const key = `${sub.problem.contestId}${sub.problem.index}`;
      if (!solvedProblems.has(key)) {
        solvedProblems.add(key);
        sub.problem.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    }
  });

  const topTags = Object.entries(tagCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const verdictData = [
    { name: "Accepted", value: verdicts.OK, color: "#10B981" },
    { name: "Wrong Ans", value: verdicts.WA, color: "#EF4444" },
    { name: "Time Limit", value: verdicts.TLE, color: "#F59E0B" },
    { name: "Other", value: verdicts.OTHER, color: "#6B7280" },
  ];

  return { topTags, verdictData };
};

export const getLeetCodePOTD = async () => {
  try {
    const response = await axios.get(`${LC_API}/daily`);
    const q = response.data;
    return {
      title: q.questionTitle,
      difficulty: q.difficulty,
      link: q.questionLink,
      tags: q.topicTags ? q.topicTags.map((t) => t.name) : [],
    };
  } catch (error) {
    return null;
  }
};

export const getRatingHistory = async (handle) => {
  try {
    const response = await axios.get(`${CF_API}/user.rating`, {
      params: { handle },
    });
    if (response.data.status === "OK") {
      return response.data.result.map((r) => ({
        contestId: r.contestId,
        contestName: r.contestName,
        rank: r.rank,
        oldRating: r.oldRating,
        newRating: r.newRating,
        date: new Date(r.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
      }));
    }
    return [];
  } catch {
    return [];
  }
};

export const getUpcomingContests = async () => {
  const contests = [];
  const now = Math.floor(Date.now() / 1000);

  try {
    // 1. Codeforces
    const cfRes = await axios.get(`${CF_API}/contest.list`, {
      params: { gym: false },
    });
    if (cfRes.data.status === "OK") {
      cfRes.data.result
        .filter((c) => c.phase === "BEFORE")
        .forEach((c) => {
          contests.push({
            id: `cf-${c.id}`,
            name: c.name,
            startTimeSeconds: c.startTimeSeconds,
            durationSeconds: c.durationSeconds,
            platform: "Codeforces",
            url: `https://codeforces.com/contests/${c.id}`,
          });
        });
    }

    // 2. AtCoder (Proxy)
    try {
      const acRes = await axios.get(`${AC_PROXY}${encodeURIComponent(AC_URL)}`);
      if (Array.isArray(acRes.data)) {
        acRes.data
          .filter((c) => c.start_epoch_second > now)
          .forEach((c) => {
            contests.push({
              id: `ac-${c.id}`,
              name: c.title,
              startTimeSeconds: c.start_epoch_second,
              durationSeconds: c.duration_second,
              platform: "AtCoder",
              url: `https://atcoder.jp/contests/${c.id}`,
            });
          });
      }
    } catch (e) {
      console.warn("AtCoder Fetch Failed");
    }

    // 3. Fallback / LeetCode / CodeChef
    const nextDay = (day, hour, min) => {
      const d = new Date();
      d.setDate(d.getDate() + ((day + 7 - d.getDay()) % 7));
      d.setHours(hour, min, 0, 0);
      if (d.getTime() < Date.now()) d.setDate(d.getDate() + 7);
      return Math.floor(d.getTime() / 1000);
    };
    contests.push({
      id: "lc-w",
      name: "Weekly Contest",
      startTimeSeconds: nextDay(0, 8, 0),
      durationSeconds: 5400,
      platform: "LeetCode",
      url: "https://leetcode.com/contest/",
    });
    contests.push({
      id: "lc-bw",
      name: "Biweekly Contest",
      startTimeSeconds: nextDay(6, 20, 0),
      durationSeconds: 5400,
      platform: "LeetCode",
      url: "https://leetcode.com/contest/",
    });
    contests.push({
      id: "cc-s",
      name: "Starters",
      startTimeSeconds: nextDay(3, 20, 0),
      durationSeconds: 7200,
      platform: "CodeChef",
      url: "https://codechef.com/",
    });
  } catch (err) {
    console.error(err);
  }

  // DATA GUARANTEE: Inject AtCoder if missing
  if (!contests.some((c) => c.platform === "AtCoder")) {
    // AtCoder Beginner Contest is usually Saturdays at 21:00 JST (17:30 IST)
    const nextSat = new Date();
    nextSat.setDate(nextSat.getDate() + ((6 - nextSat.getDay() + 7) % 7));
    nextSat.setHours(17, 30, 0, 0); // IST
    contests.push({
      id: "ac-fallback",
      name: "AtCoder Beginner Contest (Predicted)",
      startTimeSeconds: Math.floor(nextSat.getTime() / 1000),
      durationSeconds: 6000,
      platform: "AtCoder",
      url: "https://atcoder.jp/contests/",
    });
  }

  return contests.sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
};

export const getAdvancedRecommendations = async (handle, filters) => {
  try {
    const { minRating, maxRating, tags, count } = filters;
    const [submissions, problemsData] = await Promise.all([
      axios.get(`${CF_API}/user.status`, { params: { handle: handle } }),
      axios.get(`${CF_API}/problemset.problems`),
    ]);

    const solvedSet = new Set();
    submissions.data.result.forEach((sub) => {
      if (sub.verdict === "OK")
        solvedSet.add(`${sub.problem.contestId}${sub.problem.index}`);
    });

    const candidates = problemsData.data.result.problems.filter((p) => {
      if (!p.rating) return false;
      if (minRating && p.rating < parseInt(minRating)) return false;
      if (maxRating && p.rating > parseInt(maxRating)) return false;
      if (tags && tags.length > 0 && !tags.every((t) => p.tags.includes(t)))
        return false;
      if (solvedSet.has(`${p.contestId}${p.index}`)) return false;
      return true;
    });

    return candidates.sort(() => 0.5 - Math.random()).slice(0, count || 5);
  } catch (error) {
    return [];
  }
};

export const getRecommendations = async (handle) => {
  return getAdvancedRecommendations(handle, {
    minRating: 800,
    maxRating: 2000,
    count: 5,
  });
};

export const COMMON_TAGS = [
  "dp",
  "greedy",
  "math",
  "data structures",
  "constructive algorithms",
  "graphs",
  "sortings",
  "binary search",
  "dfs and similar",
  "trees",
  "strings",
  "number theory",
  "combinatorics",
  "geometry",
  "bitmasks",
  "two pointers",
];
