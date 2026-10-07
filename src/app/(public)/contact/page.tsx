"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, CheckCircle2, Send } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
              Get In Touch
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Contact InternDesk Support
            </h1>
            <p className="text-base text-slate-600 max-w-xl mx-auto">
              Have questions regarding registration, payment verification, or university partnerships? Our team is here to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Contact Information */}
            <div className="md:col-span-5 space-y-4">
              <Card className="border-slate-200/90 shadow-xs">
                <CardContent className="p-6 space-y-6 text-xs text-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Official Support</h4>
                      <p className="text-slate-500">support@interndesk.local</p>
                      <p className="text-slate-500">admissions@interndesk.local</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Headquarters</h4>
                      <p className="text-slate-500">Cyber City Innovation Hub, Tower B</p>
                      <p className="text-slate-500">Bengaluru, Karnataka, 560100</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Helpline Hours</h4>
                      <p className="text-slate-500">+91 (080) 4920-0000</p>
                      <p className="text-slate-500">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form */}
            <div className="md:col-span-7">
              <Card className="border-slate-200/90 shadow-xs">
                <CardContent className="p-6">
                  {submitted ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto">
                        Thank you for reaching out. An admissions counselor will respond to your inquiry within 1 business day.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Your Name" placeholder="e.g. Aarav Sharma" required />
                        <Input label="Email Address" type="email" placeholder="intern@college.edu" required />
                      </div>

                      <Input label="Subject" placeholder="e.g. Payment inquiry or Certificate verification" required />

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-700">Message</label>
                        <textarea
                          rows={4}
                          placeholder="How can our support team assist you today?"
                          required
                          className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 font-semibold">
                        <Send className="w-4 h-4 mr-1.5" />
                        Send Inquiry
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
