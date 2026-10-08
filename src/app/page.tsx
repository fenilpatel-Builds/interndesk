import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SecurityTrust } from "@/components/landing/security";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <SecurityTrust />
        <FAQ />

        {/* Final CTA Banner */}
        <section className="py-16 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-200">
              Start Your Career Today
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              Ready to Accelerate Your Career with InternDesk?
            </h2>
            <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
              Join hundreds of student interns working on industry projects, gaining verifiable skills, and graduating with official credentials.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-8 shadow-lg rounded-xl">
                  Register Free
                  <ArrowRight className="w-5 h-5 ml-2 text-blue-700" />
                </Button>
              </Link>
              <Link href="/programs">
                <Button size="lg" variant="outline" className="border-blue-300 text-white hover:bg-blue-800/40 font-semibold px-6 rounded-xl">
                  Explore Programs
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
