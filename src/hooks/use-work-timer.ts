"use client";

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from "react";

export type SessionStatus = "IDLE" | "WORKING" | "ON_BREAK" | "COMPLETED";
export type BreakCategory = "LUNCH" | "COFFEE" | "WATER" | "PERSONAL" | "TEA" | "OTHER";

export interface TimelineEntry {
  id: string;
  type: "WORK" | "BREAK";
  label: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
}

export interface PunchVerificationData {
  selfieDataUrl: string;
  location: string;
  timestamp: string;
  hash: string;
}

const BASE_STORAGE_KEY = "interndesk_timer_v4";
const DAILY_TARGET_SECONDS = 8 * 3600; // 8 Hours (28,800s)
const MAX_DAY_SECONDS = 24 * 3600; // 24 Hours (86,400s maximum day shift)

export function getUserStorageKey(baseKey: string): string {
  if (typeof window === "undefined") return baseKey;
  try {
    const match = document.cookie.match(/(?:^|;\s*)(?:interndesk_user|akash_user)=([^;]+)/);
    if (match) {
      const raw = decodeURIComponent(match[1]).trim();
      let email = "";
      if (raw.includes(".")) {
        const parts = raw.split(".");
        if (parts.length >= 2) {
          let b64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
          while (b64.length % 4) b64 += "=";
          const payload = JSON.parse(atob(b64));
          email = payload?.email || "";
        }
      } else {
        const payload = JSON.parse(raw);
        email = payload?.email || "";
      }
      if (email) {
        return `${baseKey}_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
    }
  } catch {}
  return baseKey;
}

export function getTodayIsoDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface StoredTimerData {
  status: SessionStatus;
  workDate: string; // YYYY-MM-DD
  startTime: number | null;
  clockInIso: string | null;
  clockOutIso?: string | null;
  breakStartTime: number | null;
  totalBreakSeconds: number;
  finalWorkedSeconds?: number;
  breakType: BreakCategory;
  timeline: TimelineEntry[];
  lastTick: number;
  clockInVerification?: PunchVerificationData | null;
  clockOutVerification?: PunchVerificationData | null;
}

// Gentle Web Audio API chime (zero external dependencies)
function playChime(type: "start" | "break" | "stop") {
  if (typeof window === "undefined") return;
  try {
    const AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const nowTime = ctx.currentTime;
    gain.gain.setValueAtTime(0.05, nowTime);

    if (type === "start") {
      osc.frequency.setValueAtTime(523.25, nowTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, nowTime + 0.15); // E5
      gain.gain.exponentialRampToValueAtTime(0.001, nowTime + 0.3);
      osc.start(nowTime);
      osc.stop(nowTime + 0.3);
    } else if (type === "break") {
      osc.frequency.setValueAtTime(440, nowTime); // A4
      osc.frequency.exponentialRampToValueAtTime(349.23, nowTime + 0.2); // F4
      gain.gain.exponentialRampToValueAtTime(0.001, nowTime + 0.35);
      osc.start(nowTime);
      osc.stop(nowTime + 0.35);
    } else {
      osc.frequency.setValueAtTime(587.33, nowTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, nowTime + 0.2); // A5
      gain.gain.exponentialRampToValueAtTime(0.001, nowTime + 0.4);
      osc.start(nowTime);
      osc.stop(nowTime + 0.4);
    }
  } catch {
    // Non-blocking
  }
}

export function useWorkTimer() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [now, setNow] = useState<number>(0);

  const [state, setState] = useState<StoredTimerData>(() => {
    const todayStr = getTodayIsoDate();
    if (typeof window !== "undefined") {
      try {
        const storageKey = getUserStorageKey(BASE_STORAGE_KEY);
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          // If stored session belongs to today, continue it
          if (parsed.workDate === todayStr) {
            // Auto-complete if running past 24-hour daily boundary
            if (parsed.startTime && Date.now() - parsed.startTime >= MAX_DAY_SECONDS * 1000 && parsed.status === "WORKING") {
              parsed.status = "COMPLETED";
              parsed.finalWorkedSeconds = MAX_DAY_SECONDS;
            }
            return parsed;
          }

          // If from a previous day, auto-archive to attendance history
          if (parsed.status !== "IDLE" && parsed.startTime) {
            try {
              const histKey = getUserStorageKey("interndesk_attendance_history");
              const histRaw = localStorage.getItem(histKey);
              const hist = histRaw ? JSON.parse(histRaw) : [];
              hist.unshift({
                date: parsed.workDate || todayStr,
                clockIn: parsed.clockInIso || "09:00 AM",
                clockOut: parsed.clockOutIso || "05:30 PM",
                breaks: `${parsed.timeline?.filter((t: TimelineEntry) => t.type === "BREAK").length || 1} Breaks`,
                productiveHours: parsed.finalWorkedSeconds
                  ? `${Math.floor(parsed.finalWorkedSeconds / 3600)}h ${Math.floor((parsed.finalWorkedSeconds % 3600) / 60)}m`
                  : "08h 00m",
                status: "PRESENT",
              });
              localStorage.setItem(histKey, JSON.stringify(hist.slice(0, 30)));
            } catch {
              // Non-blocking
            }
          }
        }
      } catch {
        // Fallback to default
      }
    }
    return {
      status: "IDLE",
      workDate: todayStr,
      startTime: null,
      clockInIso: null,
      clockOutIso: null,
      breakStartTime: null,
      totalBreakSeconds: 0,
      finalWorkedSeconds: 0,
      breakType: "LUNCH",
      timeline: [],
      lastTick: 0,
      clockInVerification: null,
      clockOutVerification: null,
    };
  });

  // Sync external system clock interval
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setNow(Date.now());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Save state to localStorage on user interaction
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        const storageKey = getUserStorageKey(BASE_STORAGE_KEY);
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        // Ignored
      }
    }
  }, [state, mounted]);

  // Compute live seconds accurately
  const currentElapsedSeconds = useMemo(() => {
    if (!mounted || state.status === "IDLE") {
      return 0;
    }
    if (state.status === "COMPLETED") {
      if (typeof state.finalWorkedSeconds === "number" && state.finalWorkedSeconds > 0) {
        return state.finalWorkedSeconds;
      }
      const sum = state.timeline
        .filter((t) => t.type === "WORK")
        .reduce((acc, t) => acc + (t.durationSeconds || 0), 0);
      return sum > 0 ? sum : 0;
    }

    if (!state.startTime) {
      return 0;
    }

    const totalSecondsSinceStart = Math.max(0, Math.floor((now - state.startTime) / 1000));
    const productive = Math.max(0, totalSecondsSinceStart - state.totalBreakSeconds);

    if (state.status === "ON_BREAK" && state.breakStartTime) {
      const currentBreak = Math.max(0, Math.floor((now - state.breakStartTime) / 1000));
      return Math.max(0, productive - currentBreak);
    }

    return productive;
  }, [mounted, state, now]);

  // Compute current break seconds if active
  const currentBreakSeconds = useMemo(() => {
    if (!mounted || state.status !== "ON_BREAK" || !state.breakStartTime) return 0;
    return Math.max(0, Math.floor((now - state.breakStartTime) / 1000));
  }, [mounted, state.status, state.breakStartTime, now]);

  // Formatted components
  const hours = Math.floor(currentElapsedSeconds / 3600);
  const minutes = Math.floor((currentElapsedSeconds % 3600) / 60);
  const seconds = currentElapsedSeconds % 60;

  const hoursStr = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");

  const breakMins = Math.floor(currentBreakSeconds / 60);
  const breakSecs = currentBreakSeconds % 60;
  const breakFormatted = `${breakMins.toString().padStart(2, "0")}m ${breakSecs.toString().padStart(2, "0")}s`;

  // Progress metrics
  const progressPercent = Math.min(
    100,
    Math.round((currentElapsedSeconds / DAILY_TARGET_SECONDS) * 100)
  );
  const remainingSeconds = Math.max(0, DAILY_TARGET_SECONDS - currentElapsedSeconds);
  const remHours = Math.floor(remainingSeconds / 3600);
  const remMinutes = Math.floor((remainingSeconds % 3600) / 60);
  const remainingFormatted = `${remHours}h ${remMinutes}m remaining`;

  // Start Work Session (Clock In)
  const clockIn = useCallback((verification?: PunchVerificationData | unknown) => {
    const timeNow = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const isPunchData = verification && typeof verification === "object" && "hash" in (verification as object);
    const validVerification = isPunchData ? (verification as PunchVerificationData) : null;
    playChime("start");

    setState((prev) => ({
      ...prev,
      status: "WORKING",
      workDate: getTodayIsoDate(),
      startTime: timeNow,
      clockInIso: timeStr,
      clockOutIso: null,
      breakStartTime: null,
      totalBreakSeconds: 0,
      clockInVerification: validVerification,
      clockOutVerification: null,
      timeline: [
        {
          id: `t-${timeNow}`,
          type: "WORK",
          label: validVerification ? "Productive Work Session (Biometrically Verified)" : "Productive Work Session",
          startTime: timeStr,
          durationSeconds: 0,
        },
      ],
      lastTick: timeNow,
    }));
  }, []);

  // Take a Break
  const takeBreak = useCallback((type: BreakCategory = "LUNCH") => {
    const timeNow = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    playChime("break");

    setState((prev) => {
      const updatedTimeline = prev.timeline.map((entry, idx) => {
        if (idx === prev.timeline.length - 1 && entry.type === "WORK") {
          return {
            ...entry,
            endTime: timeStr,
            durationSeconds: Math.max(
              0,
              Math.floor((timeNow - (prev.startTime || timeNow)) / 1000) - prev.totalBreakSeconds
            ),
          };
        }
        return entry;
      });

      return {
        ...prev,
        status: "ON_BREAK",
        breakStartTime: timeNow,
        breakType: type,
        timeline: [
          ...updatedTimeline,
          {
            id: `b-${timeNow}`,
            type: "BREAK",
            label:
              type === "LUNCH"
                ? "Lunch Break"
                : type === "COFFEE"
                ? "Coffee Break"
                : "Short Rest",
            startTime: timeStr,
            durationSeconds: 0,
          },
        ],
        lastTick: timeNow,
      };
    });
  }, []);

  // Resume Work
  const resumeWork = useCallback(() => {
    const timeNow = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    playChime("start");

    setState((prev) => {
      const addedBreak = prev.breakStartTime
        ? Math.max(0, Math.floor((timeNow - prev.breakStartTime) / 1000))
        : 0;
      const newTotalBreaks = prev.totalBreakSeconds + addedBreak;

      const updatedTimeline = prev.timeline.map((entry, idx) => {
        if (idx === prev.timeline.length - 1 && entry.type === "BREAK") {
          return {
            ...entry,
            endTime: timeStr,
            durationSeconds: addedBreak,
          };
        }
        return entry;
      });

      return {
        ...prev,
        status: "WORKING",
        breakStartTime: null,
        totalBreakSeconds: newTotalBreaks,
        timeline: [
          ...updatedTimeline,
          {
            id: `w-${timeNow}`,
            type: "WORK",
            label: "Resumed Work Session",
            startTime: timeStr,
            durationSeconds: 0,
          },
        ],
        lastTick: timeNow,
      };
    });
  }, []);

  // Clock Out (Complete Shift)
  const clockOut = useCallback((verification?: PunchVerificationData | unknown) => {
    const timeNow = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const isPunchData = verification && typeof verification === "object" && "hash" in (verification as object);
    const validVerification = isPunchData ? (verification as PunchVerificationData) : null;
    playChime("stop");

    setState((prev) => {
      const totalSecondsSinceStart = prev.startTime
        ? Math.max(0, Math.floor((timeNow - prev.startTime) / 1000))
        : 0;
      const finalProductive = Math.max(0, totalSecondsSinceStart - prev.totalBreakSeconds);

      const finalTimeline = prev.timeline.map((entry, idx) => {
        if (idx === prev.timeline.length - 1) {
          return {
            ...entry,
            endTime: timeStr,
            durationSeconds: entry.type === "WORK" ? finalProductive : entry.durationSeconds,
          };
        }
        return entry;
      });

      return {
        ...prev,
        status: "COMPLETED",
        clockOutIso: timeStr,
        clockOutVerification: validVerification,
        finalWorkedSeconds: finalProductive > 0 ? finalProductive : 0,
        timeline: finalTimeline,
        lastTick: timeNow,
      };
    });

    // Archive completed shift to history
    try {
      const histKey = getUserStorageKey("interndesk_attendance_history");
      const histRaw = localStorage.getItem(histKey);
      const hist = histRaw ? JSON.parse(histRaw) : [];
      const todayIso = getTodayIsoDate();
      const existingIdx = hist.findIndex((h: { date: string }) => h.date === todayIso);
      const record = {
        date: todayIso,
        clockIn: state.clockInIso || "09:00 AM",
        clockOut: timeStr,
        breaks: `${state.timeline.filter((t) => t.type === "BREAK").length} Breaks`,
        productiveHours: `${hoursStr}h ${minutesStr}m`,
        breakTime: breakFormatted,
        status: "COMPLETED",
      };
      if (existingIdx >= 0) {
        hist[existingIdx] = record;
      } else {
        hist.unshift(record);
      }
      localStorage.setItem(histKey, JSON.stringify(hist.slice(0, 30)));
    } catch {
      // Non-blocking
    }
  }, [state, hoursStr, minutesStr, breakFormatted]);

  // Reset shift to clean 00:00:00 IDLE state
  const resetSession = useCallback(() => {
    setState({
      status: "IDLE",
      workDate: getTodayIsoDate(),
      startTime: null,
      clockInIso: null,
      clockOutIso: null,
      breakStartTime: null,
      totalBreakSeconds: 0,
      finalWorkedSeconds: 0,
      breakType: "LUNCH",
      timeline: [],
      lastTick: 0,
      clockInVerification: null,
      clockOutVerification: null,
    });
  }, []);

  const todayDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const live24hClock = useMemo(() => {
    const d = now > 0 ? new Date(now) : new Date();
    return d.toLocaleTimeString("en-US", { hour12: false });
  }, [now]);

  return {
    status: mounted ? state.status : "IDLE",
    isMounted: mounted,
    workDate: state.workDate || getTodayIsoDate(),
    todayDateFormatted,
    live24hClock,
    elapsedSeconds: currentElapsedSeconds,
    breakSeconds: currentBreakSeconds,
    hoursStr,
    minutesStr,
    secondsStr,
    hours,
    minutes,
    seconds,
    breakFormatted,
    clockInTime: (mounted && state.clockInIso) || "--:--",
    progressPercent,
    remainingFormatted,
    breakType: state.breakType,
    timeline: state.timeline,
    clockInVerification: state.clockInVerification,
    clockOutVerification: state.clockOutVerification,
    clockIn,
    takeBreak,
    resumeWork,
    clockOut,
    resetSession,
  };
}
