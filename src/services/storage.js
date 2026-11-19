// ============================================================
// storage.js — the ONLY file that touches localStorage.
// Used by mockApi.js only. When the backend arrives, this file
// (and mockApi.js) are simply no longer used.
// ============================================================

const KEYS = {
  APPOINTMENTS: "mediqueue:appointments",
  QUEUES: "mediqueue:queues",
  RATINGS: "mediqueue:ratings",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback; // corrupted JSON or storage blocked
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked — ignore, app keeps working in-memory per call
  }
}

// Appointment[]
export const loadAppointments = () => read(KEYS.APPOINTMENTS, []);
export const saveAppointments = (list) => write(KEYS.APPOINTMENTS, list);

// { [`${doctorId}_${date}`]: Queue }
export const loadQueues = () => read(KEYS.QUEUES, {});
export const saveQueues = (map) => write(KEYS.QUEUES, map);

// { [doctorId]: { rating, ratingCount } } — overrides the mock doctor ratings
export const loadRatings = () => read(KEYS.RATINGS, {});
export const saveRatings = (map) => write(KEYS.RATINGS, map);

export const queueKey = (doctorId, date) => `${doctorId}_${date}`;

// Removes only MediQueue data (not other localStorage keys). Used by resetDemoData().
export function clearAll() {
  try {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  } catch {
    // storage blocked — nothing to clear
  }
}

/**
 * Listen for data changes made in ANOTHER browser tab (the browser's `storage` event
 * does not fire in the tab that made the change).
 * Use it to refresh the UI, e.g. the patient's /queue page when staff calls the next patient.
 *
 * @param {() => void} callback  called when appointments, queues or ratings change
 * @returns {() => void}         unsubscribe function (use it in a React effect cleanup)
 *
 * @example
 * useEffect(() => subscribe(() => refetchQueue()), [])
 */
export function subscribe(callback) {
  if (typeof window === "undefined") return () => {};
  const watched = Object.values(KEYS);
  const handler = (event) => {
    // event.key === null means localStorage.clear() was called
    if (event.key === null || watched.includes(event.key)) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
