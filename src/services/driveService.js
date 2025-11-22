// src/services/driveService.js
// Google Drive AppData storage using OAuth access token (no gapi).

// Filenames in appDataFolder
export const FILES = {
  PREFS: "algoradar_prefs.json",
  GAMIFICATION: "algoradar_gamification.json",
  CACHE: "algoradar_cache.json",
};

// Initial data (matches your schema)
export const INITIAL_DATA = {
  [FILES.PREFS]: {
    user: { cf_handle: "", safe_mode: true },
    ui: { theme: "system" },
    version: "1.0",
  },
  [FILES.GAMIFICATION]: {
    level_info: { current_xp: 0, current_level: 1, next_level_xp: 100 },
    streaks: { current_streak_days: 0, last_activity_date: null },
    badges: [],
  },
  [FILES.CACHE]: {
    timestamps: {},
    solved_problems: [],
    contest_history: [],
  },
};

const DRIVE_BASE = "https://www.googleapis.com/drive/v3";
const UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3/files";

async function authedFetch(token, url, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...init, headers });
}

async function findFile(token, filename) {
  try {
    const q = encodeURIComponent(
      `name='${filename}' and 'appDataFolder' in parents`
    );
    const url = `${DRIVE_BASE}/files?q=${q}&spaces=appDataFolder&fields=files(id,name)`;
    const res = await authedFetch(token, url);
    if (!res.ok) {
      console.error("findFile HTTP error", res.status);
      return null;
    }
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
  } catch (err) {
    console.error(`Error finding file ${filename}:`, err);
    return null;
  }
}

async function createFile(token, filename, content) {
  const metadata = {
    name: filename,
    parents: ["appDataFolder"],
  };

  const boundary = "algoradarBoundary" + Math.random().toString(16).slice(2);
  const delimiter = `--${boundary}`;
  const closeDelim = `--${boundary}--`;

  const metadataPart =
    `${delimiter}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n`;

  const contentPart =
    `${delimiter}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(content) +
    `\r\n`;

  const body = new Blob([metadataPart + contentPart + closeDelim], {
    type: `multipart/related; boundary=${boundary}`,
  });

  const url = `${UPLOAD_BASE}?uploadType=multipart`;

  const res = await authedFetch(token, url, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    console.error(`Error creating ${filename}:`, res.status, await res.text());
    return null;
  }

  const json = await res.json();
  return json.id;
}

async function updateFile(token, fileId, content) {
  const url = `${UPLOAD_BASE}/${fileId}?uploadType=media`;
  const res = await authedFetch(token, url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(content),
  });

  if (!res.ok) {
    console.error("Error updating file:", res.status, await res.text());
    return false;
  }
  return true;
}

async function readFile(token, fileId) {
  try {
    const url = `${DRIVE_BASE}/files/${fileId}?alt=media`;
    const res = await authedFetch(token, url);
    if (!res.ok) {
      console.error("Error reading file:", res.status, await res.text());
      return null;
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch (err) {
    console.error("Error reading file:", err);
    return null;
  }
}

// Ensure all 3 files exist; return { [filename]: fileId }
export async function initializeDriveStorage(token) {
  const storageMap = {};

  for (const filename of Object.values(FILES)) {
    let file = await findFile(token, filename);

    if (!file) {
      console.log(`Creating new storage file: ${filename}`);
      const id = await createFile(token, filename, INITIAL_DATA[filename]);
      storageMap[filename] = id;
    } else {
      console.log(`Found existing storage file: ${filename}`);
      storageMap[filename] = file.id;
    }
  }

  return storageMap;
}

// Load all user data
export async function loadUserData(token, fileIds) {
  const [prefs, gamification, cache] = await Promise.all([
    readFile(token, fileIds[FILES.PREFS]),
    readFile(token, fileIds[FILES.GAMIFICATION]),
    readFile(token, fileIds[FILES.CACHE]),
  ]);

  return {
    prefs: prefs || INITIAL_DATA[FILES.PREFS],
    gamification: gamification || INITIAL_DATA[FILES.GAMIFICATION],
    cache: cache || INITIAL_DATA[FILES.CACHE],
  };
}

export async function saveData(token, fileId, data) {
  return updateFile(token, fileId, data);
}

