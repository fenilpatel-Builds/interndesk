import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SecurityTrust } from "@/components/landing/security";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import { ArrowRight, Building2, GraduationCap, Laptop, Briefcase, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const solutions = [
    {
      icon: <Building2 className="w-6 h-6 text-blue-600" />,
      title: "Corporate & MNCs",
      badge: "Enterprise Workforce",
      description: "Manage global employee tracks, internship cohorts, project deliverables, attendance shifts, and department hierarchies.",
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
      title: "Colleges & Universities",
      badge: "Academic Practicum",
      description: "Oversee academic internships, capstone project submissions, supervisor reviews, and university grade verification dossiers.",
    },
    {
      icon: <Laptop className="w-6 h-6 text-emerald-600" />,
      title: "Training Institutes",
      badge: "Skills Bootcamps",
      description: "Deliver structured learning paths, code examples, interactive assessments, and tamper-proof training certificates.",
    },
    {
      icon: <Briefcase className="w-6 h-6 text-amber-600" />,
      title: "Internship Providers",
      badge: "Placement Portals",
      description: "Streamline student applications, supervisor allocations, live attendance clocks, and verified letters of completion.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <Hero />

        {/* Solutions Section (Section 4) */}
        <section id="solutions" className="py-20 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Tailored Organizational Solutions
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                Built for Every Organization Type
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mt-3 font-normal">
                Whether managing multinational engineering teams or university graduating cohorts, InternDesk adapts terminology and workflows to your exact operational model.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {solutions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center mb-4 shadow-2xs">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-800">
                      {item.badge}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-3 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Features />
        <HowItWorks />
        <SecurityTrust />
        <FAQ />

        {/* Final CTA Banner */}
        <section className="py-20 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200 bg-blue-900/60 px-3.5 py-1.5 rounded-full border border-blue-600/50">
              One Platform • Every Organization
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Ready to Launch Your Organization Workspace?
            </h2>
            <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto font-normal">
              Join leading companies, universities, and institutes managing internships, attendance, assessments, and verifiable credentials with zero platform fees.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboard/organization">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-8 shadow-xl rounded-xl">
                  <Building2 className="w-5 h-5 mr-2 text-blue-700" />
                  Create Organization Workspace
                </Button>
              </Link>
              <Link href="/join">
                <Button size="lg" variant="outline" className="border-blue-300 text-white hover:bg-blue-800/40 font-semibold px-6 rounded-xl">
                  Find Your Organization
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
