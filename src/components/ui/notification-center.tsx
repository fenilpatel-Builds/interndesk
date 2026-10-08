"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Award,
  CreditCard,
  CheckCheck,
  X,
  Sparkles,
} from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "SYSTEM" | "IMPORTANT" | "GENERAL";
  type: "APPROVAL" | "TASK" | "ASSESSMENT" | "PAYMENT" | "CERTIFICATE" | "GENERAL";
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    title: "Registration Approved",
    message: "Your InternDesk registration has been verified and approved by admin.",
    category: "IMPORTANT",
    type: "APPROVAL",
    createdAt: "10 mins ago",
    isRead: false,
    actionUrl: "/student/dashboard",
  },
  {
    id: "n-2",
    title: "New Task Assigned",
    message: "A new sprint task 'Dynamic Work Session Timer' has been assigned to you.",
    category: "GENERAL",
    type: "TASK",
    createdAt: "1 hour ago",
    isRead: false,
    actionUrl: "/student/tasks",
  },
  {
    id: "n-3",
    title: "Assessment Available",
    message: "Python Fundamentals & Data Structures exam is now available for completion.",
    category: "IMPORTANT",
    type: "ASSESSMENT",
    createdAt: "3 hours ago",
    isRead: false,
    actionUrl: "/student/assessments",
  },
  {
    id: "n-4",
    title: "Program Enrollment Activated",
    message: "Your program enrollment in Full Stack Web Development is fully verified and active.",
    category: "SYSTEM",
    type: "PAYMENT",
    createdAt: "Yesterday",
    isRead: true,
    actionUrl: "/student/programs",
  },
  {
    id: "n-5",
    title: "Internship Certificate Ready",
    message: "Your internship credential has been signed and is available for download with QR verification.",
    category: "IMPORTANT",
    type: "CERTIFICATE",
    createdAt: "2 days ago",
    isRead: true,
    actionUrl: "/student/documents",
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "IMPORTANT" | "SYSTEM">("ALL");
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "UNREAD":
        return notifications.filter((n) => !n.isRead);
      case "IMPORTANT":
        return notifications.filter((n) => n.category === "IMPORTANT");
      case "SYSTEM":
        return notifications.filter((n) => n.category === "SYSTEM");
      default:
        return notifications;
    }
  }, [activeTab, notifications]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "APPROVAL":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "TASK":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "ASSESSMENT":
        return <Award className="w-4 h-4 text-amber-600" />;
      case "PAYMENT":
        return <CreditCard className="w-4 h-4 text-teal-600" />;
      case "CERTIFICATE":
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
          </span>
        )}
      </button>

      {/* Popover Dropdown Drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Notification Center
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark All Read
                </button>
              )}
            </div>

            {/* 4 Tabs conforming strictly to Section 52 */}
            <div className="grid grid-cols-4 gap-1 p-1.5 border-b border-slate-100 bg-white text-center">
              {(["ALL", "UNREAD", "IMPORTANT", "SYSTEM"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 flex items-start gap-3 transition-colors ${
                      n.isRead ? "bg-white opacity-80" : "bg-blue-50/30"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {n.createdAt}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between pt-2 mt-1">
                        {n.actionUrl ? (
                          <Link
                            href={n.actionUrl}
                            onClick={() => {
                              markAsRead(n.id);
                              setIsOpen(false);
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <span>Open</span> →
                          </Link>
                        ) : <div />}

                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <Bell className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                  <span>No notifications in this category.</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-medium">
                InternDesk Automated Notification Dispatcher
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
