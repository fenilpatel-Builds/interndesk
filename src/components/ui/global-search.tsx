"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  CheckSquare,
  FileText,
  Award,
  GraduationCap,
  Clock,
  HelpCircle,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  category: "PROGRAMS" | "TASKS" | "LEARNING" | "ASSESSMENTS" | "DOCUMENTS" | "NAVIGATION";
  description: string;
  href: string;
  badge?: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Programs
  {
    id: "p1",
    title: "Full Stack Web Development",
    category: "PROGRAMS",
    description: "Next.js 16, React 19, TypeScript, TailwindCSS & PostgreSQL",
    href: "/programs/full-stack-development",
    badge: "12 Weeks",
  },
  {
    id: "p2",
    title: "Python & AI Engineering",
    category: "PROGRAMS",
    description: "FastAPI, PyTorch, LangChain, OpenAI & LLM Architecture",
    href: "/programs/python-ai-engineering",
    badge: "10 Weeks",
  },
  {
    id: "p3",
    title: "Data Science & Machine Learning",
    category: "PROGRAMS",
    description: "Pandas, NumPy, Scikit-Learn, Predictive Modeling & Big Data",
    href: "/programs/data-science-machine-learning",
    badge: "12 Weeks",
  },
  {
    id: "p4",
    title: "Cloud & DevOps Architecture",
    category: "PROGRAMS",
    description: "AWS, Docker, Kubernetes, CI/CD Pipelines & Terraform",
    href: "/programs/cloud-devops-architecture",
    badge: "8 Weeks",
  },

  // Tasks
  {
    id: "t1",
    title: "Dynamic Work Session Timer & Break Engine",
    category: "TASKS",
    description: "Implement real-time second counting with background delta protection",
    href: "/student/tasks",
    badge: "In Progress",
  },
  {
    id: "t2",
    title: "Free Multi-Step Registration with Resend OTP",
    category: "TASKS",
    description: "Zero registration fee student onboarding with 6-digit email verification",
    href: "/student/tasks",
    badge: "Completed",
  },
  {
    id: "t3",
    title: "MCQ Assessment Engine with Auto Evaluation",
    category: "TASKS",
    description: "Interactive question navigation, countdown timer, and circular score analysis",
    href: "/student/tasks",
    badge: "Pending",
  },

  // Learning
  {
    id: "l1",
    title: "Next.js 16 App Router & Server Components Guide",
    category: "LEARNING",
    description: "Deep dive into RSC, streaming hydration, and server actions",
    href: "/student/learning",
    badge: "PDF",
  },
  {
    id: "l2",
    title: "Building Scalable REST APIs with FastAPI",
    category: "LEARNING",
    description: "Asynchronous handlers, Pydantic validation, and OAuth2 security",
    href: "/student/learning",
    badge: "Video",
  },
  {
    id: "l3",
    title: "Containerization with Docker & Kubernetes",
    category: "LEARNING",
    description: "Multi-stage builds, ingress controllers, and microservice pods",
    href: "/student/learning",
    badge: "Document",
  },

  // Assessments
  {
    id: "a1",
    title: "Python Fundamentals & Data Structures Exam",
    category: "ASSESSMENTS",
    description: "25 questions • 24:38 timer • Pass threshold 75%",
    href: "/student/assessments",
    badge: "MCQ",
  },
  {
    id: "a2",
    title: "Modern Web Architecture & Security Assessment",
    category: "ASSESSMENTS",
    description: "Authentication, RLS, CSRF, and cryptographic payments",
    href: "/student/assessments",
    badge: "MCQ",
  },

  // Documents
  {
    id: "d1",
    title: "Internship Offer Letter",
    category: "DOCUMENTS",
    description: "Official cohort induction credential with signed verification",
    href: "/student/documents",
    badge: "PDF",
  },
  {
    id: "d2",
    title: "Internship Certificate of Completion",
    category: "DOCUMENTS",
    description: "Cryptographically recorded certificate with public QR verification",
    href: "/student/documents",
    badge: "Verified",
  },

  // Navigation
  {
    id: "n1",
    title: "Attendance & Live Work Sessions",
    category: "NAVIGATION",
    description: "Clock in, pause for breaks, and view certified shift records",
    href: "/student/attendance",
  },
  {
    id: "n2",
    title: "Daily Work Reports Editor",
    category: "NAVIGATION",
    description: "Timeline-based daily activity logging and mentor review",
    href: "/student/daily-reports",
  },
  {
    id: "n3",
    title: "Help & Support Center",
    category: "NAVIGATION",
    description: "Frequently asked questions and support ticket helpdesk",
    href: "/student/support",
  },
  {
    id: "n4",
    title: "Internship Calendar & Schedule",
    category: "NAVIGATION",
    description: "Milestones, sprint deadlines, mentor meetings, and holidays",
    href: "/student/calendar",
  },
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return SEARCH_DATABASE.slice(0, 8);
    }
    const q = query.toLowerCase().trim();
    return SEARCH_DATABASE.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Keyboard navigation inside list
  const handleItemSelect = useCallback(
    (item: SearchItem) => {
      setIsOpen(false);
      setQuery("");
      router.push(item.href);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleItemSelect(filteredItems[selectedIndex]);
    }
  };

  const getCategoryIcon = (category: SearchItem["category"]) => {
    switch (category) {
      case "PROGRAMS":
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case "TASKS":
        return <CheckSquare className="w-4 h-4 text-emerald-600" />;
      case "LEARNING":
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case "ASSESSMENTS":
        return <Award className="w-4 h-4 text-amber-600" />;
      case "DOCUMENTS":
        return <FileText className="w-4 h-4 text-teal-600" />;
      default:
        return <ArrowRight className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <>
      {/* Search Trigger Button for Topbars */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-100 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer shadow-2xs"
        aria-label="Global Search (Ctrl + K)"
      >
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">Search programs, tasks, materials...</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-500 shadow-2xs">
          Ctrl K
        </kbd>
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onKeyDown={handleKeyDown}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search programs, tasks, learning materials, assessments, documents..."
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd
                onClick={() => setIsOpen(false)}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer"
              >
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50/80 text-blue-950 border border-blue-200/80"
                          : "hover:bg-slate-50 text-slate-700 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-white shadow-2xs" : "bg-slate-100"
                          }`}
                        >
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold truncate">{item.title}</span>
                            {item.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 ml-3">
                        {item.category}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <HelpCircle className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">No matching items found</p>
                  <p className="text-[11px] text-slate-400">
                    Try searching for &quot;Python&quot;, &quot;Timer&quot;, &quot;Offer Letter&quot;, or &quot;Next.js&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold">
                    ↓
                  </kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold">
                    ↵
                  </kbd>
                  to select
                </span>
              </div>
              <span className="font-semibold text-slate-400">InternDesk Global Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
