import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { SecurityTrust } from "@/components/landing/security";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import { ArrowRight, GraduationCap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const departments = [
    {
      code: "CSE",
      name: "Computer Science & Engineering",
      desc: "Full stack engineering, systems architecture, algorithms, and distributed software systems.",
      badge: "Flagship Program",
    },
    {
      code: "IT",
      name: "Information Technology",
      desc: "Web platforms, enterprise database management, API development, and software lifecycle.",
      badge: "Industry Certified",
    },
    {
      code: "AIML",
      name: "AI & Machine Learning",
      desc: "Deep learning, predictive data models, neural networks, computer vision, and NLP.",
      badge: "Next-Gen Tech",
    },
    {
      code: "Cloud",
      name: "Cloud & DevOps",
      desc: "Kubernetes, Docker containerization, AWS/GCP pipelines, and CI/CD automation.",
      badge: "High Demand",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section with Integrated Sign-in Card matching Image 1 Top-Left */}
        <Hero />

        {/* Academic Departments Section */}
        <section id="about" className="py-20 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#E52329] bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
                Akash Technolabs Departments
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                Pre-Configured Academic Disciplines
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mt-3 font-normal">
                Structured curriculum and student activity tracks tailored for real-world industry readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {departments.map((dept, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center mb-4 text-[#0F4C81] font-black text-sm">
                      {dept.code}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0F4C81]">
                      {dept.badge}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-3 mb-2">
                      {dept.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {dept.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <Features />

        {/* Security & Trust */}
        <SecurityTrust />

        {/* Frequently Asked Questions */}
        <FAQ />

        {/* Final CTA Banner */}
        <section className="py-20 bg-gradient-to-br from-[#0B192C] via-[#0F4C81] to-[#1E3A8A] text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200 bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
              Akash Technolabs • 100% Free Student Enrollment
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Ready to Begin Your Academic Journey?
            </h2>
            <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto font-normal">
              Join Ahmedabad&apos;s leading tech institution. Submit assignments, track your attendance, and build career-defining projects with zero fees.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-[#E52329] hover:bg-[#C41C22] text-white font-bold px-8 shadow-xl rounded-xl cursor-pointer">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Register as Student
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-bold px-7 rounded-xl cursor-pointer">
                  Access Portal Sign In
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
