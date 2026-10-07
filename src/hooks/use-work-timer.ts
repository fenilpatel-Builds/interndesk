"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export type SessionStatus = "IDLE" | "WORKING" | "ON_BREAK" | "COMPLETED";
export type BreakCategory = "LUNCH" | "COFFEE" | "PERSONAL" | "TEA";

export interface TimelineEntry {
  id: string;
  type: "WORK" | "BREAK";
  label: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
}

const STORAGE_KEY = "interndesk_timer_v2";
const DAILY_TARGET_SECONDS = 8 * 3600; // 8 Hours (28,800s)

interface StoredTimerData {
  status: SessionStatus;
  startTime: number | null;
  clockInIso: string | null;
  breakStartTime: number | null;
  totalBreakSeconds: number;
  breakType: BreakCategory;
  timeline: TimelineEntry[];
  lastTick: number;
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
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number>(0);

  const [state, setState] = useState<StoredTimerData>(() => ({
    status: "WORKING",
    startTime: null,
    clockInIso: "09:02 AM",
    breakStartTime: null,
    totalBreakSeconds: 45 * 60,
    breakType: "LUNCH",
    timeline: [
      {
        id: "t-1",
        type: "WORK",
        label: "Morning Deep Work",
        startTime: "09:00 AM",
        endTime: "12:30 PM",
        durationSeconds: 3.5 * 3600,
      },
      {
        id: "t-2",
        type: "BREAK",
        label: "Lunch Break",
        startTime: "12:30 PM",
        endTime: "01:15 PM",
        durationSeconds: 45 * 60,
      },
      {
        id: "t-3",
        type: "WORK",
        label: "Afternoon Development",
        startTime: "01:15 PM",
        durationSeconds: 0,
      },
    ],
    lastTick: 0,
  }));

  // Safe client-side initialization to avoid Next.js 16 prerender Date.now() blocking
  useEffect(() => {
    setMounted(true);
    const timeNow = Date.now();
    setNow(timeNow);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState(parsed);
      } else {
        // Initial baseline: 04h 32m 15s elapsed
        const initialStart = timeNow - (4 * 3600 + 32 * 60 + 15) * 1000;
        setState((prev) => ({
          ...prev,
          startTime: initialStart,
          lastTick: timeNow,
        }));
      }
    } catch {
      // Ignored
    }

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignored
      }
    }
  }, [state, mounted]);

  // Compute live seconds
  const currentElapsedSeconds = useMemo(() => {
    if (!mounted || state.status === "IDLE" || !state.startTime) {
      return 4 * 3600 + 32 * 60 + 15; // Initial render baseline: 04h 32m 15s
    }
    if (state.status === "COMPLETED") {
      return state.timeline
        .filter((t) => t.type === "WORK")
        .reduce((sum, t) => sum + (t.durationSeconds || 0), 0);
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
  const clockIn = useCallback(() => {
    const timeNow = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    playChime("start");

    setState((prev) => ({
      ...prev,
      status: "WORKING",
      startTime: timeNow,
      clockInIso: timeStr,
      breakStartTime: null,
      totalBreakSeconds: 0,
      timeline: [
        {
          id: `t-${timeNow}`,
          type: "WORK",
          label: "Productive Work Session",
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
  const clockOut = useCallback(() => {
    const timeNow = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    playChime("stop");

    setState((prev) => {
      const finalTimeline = prev.timeline.map((entry, idx) => {
        if (idx === prev.timeline.length - 1) {
          return {
            ...entry,
            endTime: timeStr,
          };
        }
        return entry;
      });

      return {
        ...prev,
        status: "COMPLETED",
        timeline: finalTimeline,
        lastTick: timeNow,
      };
    });
  }, []);

  // Reset shift
  const resetSession = useCallback(() => {
    setState({
      status: "IDLE",
      startTime: null,
      clockInIso: null,
      breakStartTime: null,
      totalBreakSeconds: 0,
      breakType: "LUNCH",
      timeline: [],
      lastTick: 0,
    });
  }, []);

  return {
    status: state.status,
    elapsedSeconds: currentElapsedSeconds,
    breakSeconds: currentBreakSeconds,
    hoursStr,
    minutesStr,
    secondsStr,
    hours,
    minutes,
    seconds,
    breakFormatted,
    clockInTime: state.clockInIso || "09:02 AM",
    progressPercent,
    remainingFormatted,
    breakType: state.breakType,
    timeline: state.timeline,
    clockIn,
    takeBreak,
    resumeWork,
    clockOut,
    resetSession,
  };
}
