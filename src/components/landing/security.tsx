import { ShieldCheck, Lock, KeyRound, Server, History, Layers } from "lucide-react";

export function SecurityTrust() {
  const points = [
    {
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      title: "Strict Multi-Tenant Isolation",
      desc: "Every database query and API operation enforces organization_id scoping at the server layer. One organization can never view or modify another's data.",
    },
    {
      icon: <Lock className="w-5 h-5 text-indigo-400" />,
      title: "Granular Enterprise RBAC",
      desc: "10 enterprise roles enforce least-privilege access. Changing tenant ID in requests or client tampering is actively blocked.",
    },
    {
      icon: <KeyRound className="w-5 h-5 text-sky-400" />,
      title: "Protected Organization Codes",
      desc: "Unique system-generated codes (ORG-XXXXXX) facilitate discovery without exposing internal rosters or granting unauthenticated access.",
    },
    {
      icon: <History className="w-5 h-5 text-emerald-400" />,
      title: "Immutable Audit Trail",
      desc: "Every critical state transition (attendance clocks, break timers, admin approvals, exam attempts, document issuance) is permanently audited.",
    },
  ];

  return (
    <section id="security" className="py-20 bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enterprise Grade Security</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built on Zero-Trust Multi-Tenant Architecture
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              InternDesk is engineered from the ground up to prevent cross-tenant data leakage, credential sharing, and unauthorized document generation.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {points.map((pt, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 hover:border-blue-500/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                  {pt.icon}
                </div>
                <h3 className="text-base font-bold text-white">{pt.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{pt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
