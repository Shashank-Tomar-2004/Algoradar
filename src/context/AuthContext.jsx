// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  initializeDriveStorage,
  loadUserData,
  saveData,
  FILES,
  INITIAL_DATA,
} from "../services/driveService";

const defaultData = {
  prefs: INITIAL_DATA[FILES.PREFS],
  gamification: INITIAL_DATA[FILES.GAMIFICATION],
  cache: INITIAL_DATA[FILES.CACHE],
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { authType, email, name, accessToken? }
  const [fileIds, setFileIds] = useState(null); // { [filename]: fileId }
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  // Google Identity login
  const googleLogin = useGoogleLogin({
    scope:
      "openid email profile https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file",
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;
        if (!accessToken) {
          console.error("No access_token in Google response");
          return;
        }

        // Fetch basic profile
        const profileRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const profile = await profileRes.json();

        const newUser = {
          authType: "google",
          email: profile.email,
          name: profile.name || profile.email,
          accessToken,
        };

        setUser(newUser);
        localStorage.setItem("algoradar_user", JSON.stringify(newUser));

        setLoading(true);
        const ids = await initializeDriveStorage(accessToken);
        setFileIds(ids);
        const loaded = await loadUserData(accessToken, ids);
        setData(loaded);
      } catch (err) {
        console.error("Google login flow failed:", err);
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error("Google login error:", err);
    },
  });

  // Public login("google" | "local")
  const login = useCallback(
    (provider) => {
      if (provider === "google") {
        googleLogin();
      } else if (provider === "local") {
        const localUser = { authType: "local" };
        setUser(localUser);
        localStorage.setItem("algoradar_user", JSON.stringify(localUser));

        const stored = localStorage.getItem("algoradar_data");
        if (stored) {
          try {
            setData(JSON.parse(stored));
          } catch {
            setData(defaultData);
          }
        } else {
          setData(defaultData);
        }
        setLoading(false);
      }
    },
    [googleLogin]
  );

  const logout = useCallback(() => {
    setUser(null);
    setFileIds(null);
    setData(defaultData);
    localStorage.removeItem("algoradar_user");
  }, []);

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("algoradar_user");
    if (!storedUser) {
      setLoading(false);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(storedUser);
    } catch {
      setLoading(false);
      return;
    }

    // Local mode
    if (parsed.authType === "local") {
      setUser(parsed);
      const storedData = localStorage.getItem("algoradar_data");
      if (storedData) {
        try {
          setData(JSON.parse(storedData));
        } catch {
          setData(defaultData);
        }
      } else {
        setData(defaultData);
      }
      setLoading(false);
      return;
    }

    // Google mode
    if (parsed.authType === "google" && parsed.accessToken) {
      (async () => {
        try {
          setUser(parsed);
          setLoading(true);
          const ids = await initializeDriveStorage(parsed.accessToken);
          setFileIds(ids);
          const loaded = await loadUserData(parsed.accessToken, ids);
          setData(loaded);
        } catch (err) {
          console.error("Failed to restore Google session:", err);
          setUser(null);
          setData(defaultData);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, []);

  const saveAllToLocal = useCallback((newData) => {
    localStorage.setItem("algoradar_data", JSON.stringify(newData));
  }, []);

  const updatePrefs = useCallback(
    (updater) => {
      setData((prev) => {
        const newPrefs =
          typeof updater === "function" ? updater(prev.prefs) : updater;
        const newData = { ...prev, prefs: newPrefs };

        if (user?.authType === "google" && fileIds?.[FILES.PREFS]) {
          saveData(user.accessToken, fileIds[FILES.PREFS], newPrefs).catch(
            (err) => console.error("Failed to save prefs to Drive:", err)
          );
        } else {
          saveAllToLocal(newData);
        }

        return newData;
      });
    },
    [user, fileIds, saveAllToLocal]
  );

  const updateGamification = useCallback(
    (updater) => {
      setData((prev) => {
        const newGam =
          typeof updater === "function" ? updater(prev.gamification) : updater;
        const newData = { ...prev, gamification: newGam };

        if (user?.authType === "google" && fileIds?.[FILES.GAMIFICATION]) {
          saveData(
            user.accessToken,
            fileIds[FILES.GAMIFICATION],
            newGam
          ).catch((err) =>
            console.error("Failed to save gamification to Drive:", err)
          );
        } else {
          saveAllToLocal(newData);
        }

        return newData;
      });
    },
    [user, fileIds, saveAllToLocal]
  );

  const updateCache = useCallback(
    (updater) => {
      setData((prev) => {
        const newCache =
          typeof updater === "function" ? updater(prev.cache) : updater;
        const newData = { ...prev, cache: newCache };

        if (user?.authType === "google" && fileIds?.[FILES.CACHE]) {
          saveData(user.accessToken, fileIds[FILES.CACHE], newCache).catch(
            (err) => console.error("Failed to save cache to Drive:", err)
          );
        } else {
          saveAllToLocal(newData);
        }

        return newData;
      });
    },
    [user, fileIds, saveAllToLocal]
  );

  const value = {
    user,
    data,
    loading,
    login,
    logout,
    updatePrefs,
    updateGamification,
    updateCache,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

