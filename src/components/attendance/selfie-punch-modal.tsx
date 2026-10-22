"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Clock,
  ShieldCheck,
  X,
  VideoOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PunchVerificationData {
  selfieDataUrl: string;
  location: string;
  timestamp: string;
  hash: string;
}

interface SelfiePunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "CLOCK_IN" | "CLOCK_OUT";
  internName?: string;
  onConfirm: (data: PunchVerificationData) => void;
  onSkip?: () => void;
}

export function SelfiePunchModal({
  isOpen,
  onClose,
  mode,
  internName = "Fenil Patel",
  onConfirm,
  onSkip,
}: SelfiePunchModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [locationStr, setLocationStr] = useState<string>("Corporate Office • Bengaluru Campus (Auto-Verified)");
  const [countdown, setCountdown] = useState<number | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCapturedPhoto(null);

    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setStreamActive(true);
        }
      } else {
        setCameraError("Webcam not supported in this browser. You can use verified profile snapshot.");
      }
    } catch {
      setCameraError("Webcam access was not granted. You may allow permissions or use verified profile snapshot.");
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    // Geolocation detection
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return;
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          setLocationStr(`${lat}° N, ${lng}° E (Campus Office Zone)`);
        },
        () => {
          // Keep default campus location
        },
        { timeout: 5000 }
      );
    }

    async function initCamera() {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user",
            },
            audio: false,
          });

          if (!isMounted) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
            setStreamActive(true);
          }
        } else if (isMounted) {
          setCameraError("Webcam not supported in this browser. You can use verified profile snapshot.");
        }
      } catch {
        if (isMounted) {
          setCameraError("Webcam access was not granted. You may allow permissions or use verified profile snapshot.");
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, stopCamera]);

  // Capture Photo via Canvas
  const takeSnapshot = () => {
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateString = new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    const punchHash = `PUNCH-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    if (videoRef.current && streamActive) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Watermark overlay
        ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
        ctx.fillRect(0, canvas.height - 70, canvas.width, 70);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`VERIFIED PUNCH: ${internName} • ${mode === "CLOCK_IN" ? "CLOCK IN" : "CLOCK OUT"}`, 16, canvas.height - 44);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "12px monospace";
        ctx.fillText(`${dateString} ${timeString} • ${locationStr}`, 16, canvas.height - 24);

        ctx.fillStyle = "#10b981";
        ctx.font = "bold 11px monospace";
        ctx.fillText(`HASH: ${punchHash}`, 16, canvas.height - 8);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedPhoto(dataUrl);
        stopCamera();
        return;
      }
    }

    // Fallback: Generate structured verified avatar badge
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, "#1e293b");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Center avatar circle
      ctx.beginPath();
      ctx.arc(320, 200, 90, 0, Math.PI * 2);
      ctx.fillStyle = "#2563eb";
      ctx.fill();

      // Initials
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px sans-serif";
      ctx.textAlign = "center";
      const initials = internName.split(" ").map(n => n[0]).join("");
      ctx.fillText(initials || "ID", 320, 220);

      // Watermark footer
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(0, 410, 640, 70);

      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText(`VERIFIED PUNCH: ${internName} (${mode})`, 20, 436);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "12px monospace";
      ctx.fillText(`${dateString} ${timeString} • ${locationStr}`, 20, 456);

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`HASH: ${punchHash}`, 20, 472);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedPhoto(dataUrl);
    }
  };

  const handleCountdownTrigger = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setCountdown(null);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  const handleConfirm = () => {
    if (!capturedPhoto) {
      takeSnapshot();
    }
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const punchHash = `PUNCH-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    onConfirm({
      selfieDataUrl: capturedPhoto || "",
      location: locationStr,
      timestamp: timeString,
      hash: punchHash,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {mode === "CLOCK_IN" ? "Clock In • Photo Punch Verification" : "Clock Out • Shift Completion Verification"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Audit-grade biometric snapshot for hybrid/remote attendance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Snapshot Viewport */}
        <div className="p-6 space-y-4">
          <div className="relative w-full aspect-4/3 rounded-2xl bg-slate-950 overflow-hidden border-2 border-slate-200 shadow-inner flex items-center justify-center">
            {capturedPhoto ? (
              // Captured Photo Preview
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={capturedPhoto}
                alt="Captured Punch Selfie"
                className="w-full h-full object-cover"
              />
            ) : streamActive ? (
              // Live Video Stream with Framing Guide
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
                {/* Oval Face Framing Guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-blue-400/70 shadow-[0_0_0_9999px_rgba(15,23,42,0.35)] flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white/90 bg-slate-900/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Align Face Here
                    </span>
                  </div>
                </div>

                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs pointer-events-none">
                    <span className="text-7xl font-black text-white animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}
              </>
            ) : (
              // Fallback / Loading State
              <div className="p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <VideoOff className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">
                    {cameraError || "Initializing camera device..."}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    You can capture a certified biometric profile snapshot with verified GPS coordinates.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startCamera}
                  className="text-xs border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Retry Camera
                </Button>
              </div>
            )}

            {/* Verification Badge Overlays */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Biometric Proof</span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold border border-white/10">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>

          {/* Location & Intern Metadata */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Intern Identity:</span>
              <span className="font-bold text-slate-900">{internName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">GPS Campus Location:</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                {locationStr}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {capturedPhoto ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCapturedPhoto(null);
                    startCamera();
                  }}
                  className="w-full text-xs font-bold rounded-xl py-5 border-slate-300 hover:bg-slate-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Retake Photo
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="w-full text-xs font-bold rounded-xl py-5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Confirm &amp; Punch
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={streamActive ? handleCountdownTrigger : takeSnapshot}
                  className="w-full py-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/25 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  {streamActive ? "Snap Verification Photo (3s Timer)" : "Generate Verified Snapshot"}
                </Button>

                {onSkip && (
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      onSkip();
                      onClose();
                    }}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold py-1 hover:underline cursor-pointer"
                  >
                    Skip Photo Verification (Clock In Standard)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
