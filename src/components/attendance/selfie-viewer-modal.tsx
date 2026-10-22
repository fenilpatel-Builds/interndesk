"use client";

import React from "react";
import {
  ShieldCheck,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  X,
  Download,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PunchVerificationData } from "@/hooks/use-work-timer";

interface SelfieViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: PunchVerificationData | null;
  modeLabel?: string;
  internName?: string;
}

export function SelfieViewerModal({
  isOpen,
  onClose,
  verification,
  modeLabel = "Clock In",
  internName = "Fenil Patel",
}: SelfieViewerModalProps) {
  if (!isOpen || !verification) return null;

  const handleDownload = () => {
    if (!verification.selfieDataUrl) return;
    const a = document.createElement("a");
    a.href = verification.selfieDataUrl;
    a.download = `audit-punch-${verification.hash || "verified"}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Biometric Punch Record
              </h3>
              <p className="text-[11px] text-slate-400">
                Audit-grade biometric snapshot • {modeLabel}
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

        {/* Snapshot View */}
        <div className="p-6 space-y-4">
          <div className="relative w-full aspect-4/3 rounded-2xl bg-slate-950 overflow-hidden border-2 border-slate-200 shadow-inner flex items-center justify-center">
            {verification.selfieDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={verification.selfieDataUrl}
                alt="Audit Biometric Snapshot"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 text-slate-400">
                <Fingerprint className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                <p className="text-xs font-semibold">Verified System Attendance Punch</p>
              </div>
            )}

            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Biometric Proof Verified</span>
            </div>
          </div>

          {/* Audit Metadata Details */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Intern:
              </span>
              <span className="font-bold text-slate-900">{internName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Recorded Time:
              </span>
              <span className="font-mono font-bold text-slate-800">
                {verification.timestamp}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Geolocation:
              </span>
              <span className="font-semibold text-slate-700 text-[11px] text-right truncate max-w-[200px]">
                {verification.location}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-purple-600" /> Punch Hash:
              </span>
              <span className="font-mono font-bold text-blue-600 text-[11px]">
                {verification.hash}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="text-xs font-bold rounded-xl py-5 border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Image
            </Button>
            <Button
              onClick={onClose}
              className="text-xs font-bold rounded-xl py-5 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            >
              Close Record
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
