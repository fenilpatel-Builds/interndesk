"use client";

import React, { useState } from "react";
import { StudentTopbar } from "@/components/student/topbar";
import { Card } from "@/components/ui/card";
import {
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  FileText,
  AlertCircle,
  Check,
} from "lucide-react";

export default function StudentNotificationsPage() {
  const [activeTab, setActiveTab] = useState<"All" | "Unread" | "Read">("All");

  const [notifications, setNotifications] = useState([
    {
      id: "n-1",
      title: "New activity published: UI/UX Design Project",
      time: "2 hours ago",
      type: "ACTIVITY",
      isRead: false,
      color: "bg-purple-100 text-purple-700",
      icon: Sparkles,
    },
    {
      id: "n-2",
      title: "Your submission has been approved",
      time: "4 hours ago",
      type: "APPROVAL",
      isRead: false,
      color: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
    },
    {
      id: "n-3",
      title: "Reminder: Research Paper deadline is tomorrow",
      time: "6 hours ago",
      type: "REMINDER",
      isRead: false,
      color: "bg-amber-100 text-amber-700",
      icon: Clock,
    },
    {
      id: "n-4",
      title: "Feedback received for Web Development Assignment",
      time: "1 day ago",
      type: "FEEDBACK",
      isRead: true,
      color: "bg-blue-100 text-blue-700",
      icon: MessageSquare,
    },
    {
      id: "n-5",
      title: "Account approved by admin",
      time: "2 days ago",
      type: "SYSTEM",
      isRead: true,
      color: "bg-emerald-100 text-emerald-700",
      icon: Check,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === "Unread") return !n.isRead;
    if (activeTab === "Read") return n.isRead;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      <StudentTopbar title="Notifications & Messages" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Notifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Updates on assignments, evaluations, and academic events
            </p>
          </div>
          <button
            onClick={markAllAsRead}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Mark all as read
          </button>
        </div>

        {/* Tabs: All, Unread, Read matching Image 1 */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/90 rounded-2xl w-fit shadow-xs">
          {(["All", "Unread", "Read"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#0F4C81] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications List matching Image 1 Bottom Middle */}
        <div className="space-y-3">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  !item.isRead
                    ? "bg-white border-blue-200/80 shadow-xs"
                    : "bg-slate-50/70 border-slate-200/70 opacity-90"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#E52329] shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">{item.time}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
