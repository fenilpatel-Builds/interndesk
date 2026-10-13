"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Users,
  CheckSquare,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  Building2,
} from "lucide-react";
import { multiTenantStore } from "@/lib/multitenant/store";
import { Organization } from "@/types/multitenant";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrg: Organization;
  onNavigateToTab: (tab: string) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  activeOrg,
  onNavigateToTab,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const members = multiTenantStore.getMemberships(activeOrg.id);
  const tasks = multiTenantStore.getTasks(activeOrg.id);
  const programs = multiTenantStore.getPrograms(activeOrg.id);
  const materials = multiTenantStore.getLearningMaterials(activeOrg.id);
  const documents = multiTenantStore.getIssuedDocuments(activeOrg.id);

  const q = query.trim().toLowerCase();

  const matchingMembers = q ? members.filter((m) => m.user_full_name?.toLowerCase().includes(q) || m.job_title?.toLowerCase().includes(q)) : [];
  const matchingTasks = q ? tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) : [];
  const matchingPrograms = q ? programs.filter((p) => p.name.toLowerCase().includes(q) || p.technology.toLowerCase().includes(q)) : [];
  const matchingMaterials = q ? materials.filter((m) => m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)) : [];
  const matchingDocs = q ? documents.filter((d) => d.document_number.toLowerCase().includes(q) || d.title.toLowerCase().includes(q) || d.recipient_name.toLowerCase().includes(q)) : [];

  const totalResults = matchingMembers.length + matchingTasks.length + matchingPrograms.length + matchingMaterials.length + matchingDocs.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-fadeIn">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={`Search members, tasks, programs, documents in ${activeOrg.name}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-sm font-medium placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-8 text-xs text-slate-400 space-y-2">
              <p>Type to search across authorized workspace resources.</p>
              <div className="flex justify-center gap-2 flex-wrap text-[11px] font-medium text-slate-500 pt-2">
                <span className="bg-slate-100 px-2 py-0.5 rounded">Members</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Tasks</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">LMS Modules</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Certificates</span>
              </div>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching records found in <span className="font-semibold text-slate-700">{activeOrg.name}</span>.
            </div>
          )}

          {matchingMembers.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-600" />
                Members ({matchingMembers.length})
              </p>
              {matchingMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => { onNavigateToTab("members"); onClose(); }}
                  className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{m.user_full_name}</p>
                    <p className="text-[11px] text-slate-500">{m.job_title} • {m.role}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {matchingTasks.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-emerald-600" />
                Tasks ({matchingTasks.length})
              </p>
              {matchingTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => { onNavigateToTab("tasks"); onClose(); }}
                  className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.title}</p>
                    <p className="text-[11px] text-slate-500">Status: {t.status} • Priority: {t.priority}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {matchingPrograms.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Programs ({matchingPrograms.length})
              </p>
              {matchingPrograms.map((p) => (
                <div
                  key={p.id}
                  onClick={() => { onNavigateToTab("programs"); onClose(); }}
                  className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.technology} • {p.duration}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {matchingDocs.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-600" />
                Documents & Certificates ({matchingDocs.length})
              </p>
              {matchingDocs.map((d) => (
                <div
                  key={d.id}
                  onClick={() => { onNavigateToTab("documents"); onClose(); }}
                  className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{d.title}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{d.document_number} • {d.recipient_name}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400 flex items-center justify-between px-4">
          <span>Tenant Scope: <strong className="text-slate-700">{activeOrg.name}</strong></span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
