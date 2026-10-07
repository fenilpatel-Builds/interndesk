"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Building,
  User,
  Briefcase,
  FileCheck,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrencyINR } from "@/lib/utils";
import {
  personalInfoSchema,
  academicInfoSchema,
  internshipInfoSchema,
  type RegistrationFormData,
} from "@/validations/registration";

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [applicationSuccessData, setApplicationSuccessData] = useState<{
    applicationNumber: string;
    receiptNumber: string;
  } | null>(null);

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: "",
    email: "",
    mobile: "",
    dateOfBirth: "",
    address: "",
    college: "",
    university: "",
    course: "B.Tech Computer Science",
    semester: "6th Semester",
    technology: "Modern Fullstack Web Development",
    duration: "3 Months",
    startDate: "2026-11-01",
    category: "Academic Internship",
  });

  const updateField = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNextFromStep1 = () => {
    const result = personalInfoSchema.safeParse({
      fullName: formData.fullName,
      email: formData.email,
      mobile: formData.mobile,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    const result = academicInfoSchema.safeParse({
      college: formData.college,
      university: formData.university,
      course: formData.course,
      semester: formData.semester,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setCurrentStep(3);
  };

  const handleNextFromStep3 = () => {
    const result = internshipInfoSchema.safeParse({
      technology: formData.technology,
      duration: formData.duration,
      startDate: formData.startDate,
      category: formData.category,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setCurrentStep(4); // Review
  };

  const handleProceedToPayment = () => {
    setCurrentStep(5); // Registration Fee
  };

  // Step 5: Process ₹1,000 Payment
  const handlePayRegistrationFee = async () => {
    setIsProcessingPayment(true);
    setErrors({});
    try {
      // 1. Create order on server
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create payment order.");
      }

      // 2. Mock or trigger Razorpay gateway checkout
      // For automated simulation or checkout integration:
      const simulatedPaymentId = `pay_${Date.now()}`;
      const simulatedSignature = `sig_${Date.now()}`;

      // 3. Verify payment server-side
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.orderId,
          paymentId: simulatedPaymentId,
          signature: simulatedSignature,
          formData,
        }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Payment verification failed.");
      }

      // Step 6: Success!
      setApplicationSuccessData({
        applicationNumber: verifyData.applicationNumber,
        receiptNumber: verifyData.receiptNumber,
      });
      setCurrentStep(6);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed. Please retry.";
      setErrors({ payment: msg });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const stepsList = [
    { num: 1, label: "Personal", icon: <User className="w-4 h-4" /> },
    { num: 2, label: "Academic", icon: <Building className="w-4 h-4" /> },
    { num: 3, label: "Internship", icon: <Briefcase className="w-4 h-4" /> },
    { num: 4, label: "Review", icon: <FileCheck className="w-4 h-4" /> },
    { num: 5, label: "Fee Payment", icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              InternDesk
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Learn • Work • Grow
            </span>
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
          Internship Application Portal
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Complete the guided registration to enroll in the official 2026 internship cohort.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Step Progress Tracker */}
        {currentStep <= 5 && (
          <div className="mb-8 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="grid grid-cols-5 gap-2">
              {stepsList.map((s) => {
                const isCurrent = currentStep === s.num;
                const isPassed = currentStep > s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isCurrent
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                        isCurrent ? "text-blue-600" : isPassed ? "text-emerald-700" : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1: PERSONAL INFORMATION */}
        {currentStep === 1 && (
          <Card className="shadow-md border-slate-200/90">
            <CardHeader>
              <CardTitle>Step 1 — Personal Information</CardTitle>
              <CardDescription>
                Provide your primary contact and identification information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Legal Name"
                  placeholder="e.g. Aarav Sharma"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  error={errors.fullName}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="aarav@college.edu"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  error={errors.email}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="10-Digit Mobile Number"
                  placeholder="9876543210"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => updateField("mobile", e.target.value)}
                  error={errors.mobile}
                  required
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  error={errors.dateOfBirth}
                  required
                />
              </div>

              <Input
                label="Permanent / Residential Address"
                placeholder="Full address with city, state, and pincode"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                error={errors.address}
                required
              />

              <div className="pt-4 flex justify-end">
                <Button onClick={handleNextFromStep1} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Next: Academic Info
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: ACADEMIC INFORMATION */}
        {currentStep === 2 && (
          <Card className="shadow-md border-slate-200/90">
            <CardHeader>
              <CardTitle>Step 2 — Academic Information</CardTitle>
              <CardDescription>
                Details of your college, university, and current degree program.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="College / Institute Name"
                  placeholder="e.g. National Institute of Technology"
                  value={formData.college}
                  onChange={(e) => updateField("college", e.target.value)}
                  error={errors.college}
                  required
                />
                <Input
                  label="Affiliated University"
                  placeholder="e.g. State Technical University"
                  value={formData.university}
                  onChange={(e) => updateField("university", e.target.value)}
                  error={errors.university}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Course / Degree"
                  placeholder="e.g. B.Tech Computer Science"
                  value={formData.course}
                  onChange={(e) => updateField("course", e.target.value)}
                  error={errors.course}
                  required
                />
                <Input
                  label="Current Year / Semester"
                  placeholder="e.g. 6th Semester"
                  value={formData.semester}
                  onChange={(e) => updateField("semester", e.target.value)}
                  error={errors.semester}
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button onClick={handleNextFromStep2} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Next: Internship Preferences
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: INTERNSHIP INFORMATION */}
        {currentStep === 3 && (
          <Card className="shadow-md border-slate-200/90">
            <CardHeader>
              <CardTitle>Step 3 — Internship Information</CardTitle>
              <CardDescription>
                Choose your desired technology specialization and timing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Internship Technology Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.technology}
                  onChange={(e) => updateField("technology", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                >
                  <option value="Modern Fullstack Web Development">Modern Fullstack Web Development</option>
                  <option value="Python for Enterprise & Automation">Python for Enterprise & Automation</option>
                  <option value="Data Science & Analytics">Data Science & Analytics</option>
                  <option value="Applied AI & Machine Learning">Applied AI & Machine Learning</option>
                  <option value="Enterprise Java Development">Enterprise Java Development</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Internship Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => updateField("duration", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months">2 Months</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                  </select>
                </div>

                <Input
                  label="Preferred Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                  error={errors.startDate}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Internship Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                >
                  <option value="Academic Internship">Academic Internship</option>
                  <option value="Skill Enhancement">Skill Enhancement</option>
                  <option value="Graduation Capstone">Graduation Capstone</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button onClick={handleNextFromStep3} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Next: Review Application
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: REVIEW APPLICATION */}
        {currentStep === 4 && (
          <Card className="shadow-md border-slate-200/90">
            <CardHeader>
              <CardTitle>Step 4 — Review Your Application</CardTitle>
              <CardDescription>
                Verify all information before moving to the registration fee payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Info Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Personal Details</h4>
                  <button onClick={() => setCurrentStep(1)} className="text-xs text-blue-600 font-semibold hover:underline">
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500 text-xs">Name:</span> <p className="font-medium text-slate-900">{formData.fullName}</p></div>
                  <div><span className="text-slate-500 text-xs">Email:</span> <p className="font-medium text-slate-900">{formData.email}</p></div>
                  <div><span className="text-slate-500 text-xs">Mobile:</span> <p className="font-medium text-slate-900">{formData.mobile}</p></div>
                  <div><span className="text-slate-500 text-xs">DOB:</span> <p className="font-medium text-slate-900">{formData.dateOfBirth}</p></div>
                  <div className="col-span-2"><span className="text-slate-500 text-xs">Address:</span> <p className="font-medium text-slate-900">{formData.address}</p></div>
                </div>
              </div>

              {/* Academic Info Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Academic Details</h4>
                  <button onClick={() => setCurrentStep(2)} className="text-xs text-blue-600 font-semibold hover:underline">
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500 text-xs">College:</span> <p className="font-medium text-slate-900">{formData.college}</p></div>
                  <div><span className="text-slate-500 text-xs">University:</span> <p className="font-medium text-slate-900">{formData.university}</p></div>
                  <div><span className="text-slate-500 text-xs">Course:</span> <p className="font-medium text-slate-900">{formData.course}</p></div>
                  <div><span className="text-slate-500 text-xs">Semester:</span> <p className="font-medium text-slate-900">{formData.semester}</p></div>
                </div>
              </div>

              {/* Internship Info Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Internship Details</h4>
                  <button onClick={() => setCurrentStep(3)} className="text-xs text-blue-600 font-semibold hover:underline">
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500 text-xs">Domain:</span> <p className="font-medium text-slate-900">{formData.technology}</p></div>
                  <div><span className="text-slate-500 text-xs">Duration:</span> <p className="font-medium text-slate-900">{formData.duration}</p></div>
                  <div><span className="text-slate-500 text-xs">Start Date:</span> <p className="font-medium text-slate-900">{formData.startDate}</p></div>
                  <div><span className="text-slate-500 text-xs">Category:</span> <p className="font-medium text-slate-900">{formData.category}</p></div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button onClick={handleProceedToPayment} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Proceed to Payment
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 5: REGISTRATION FEE (₹1,000) */}
        {currentStep === 5 && (
          <Card className="shadow-md border-slate-200/90">
            <CardHeader className="text-center">
              <CardTitle>Step 5 — Internship Registration Fee</CardTitle>
              <CardDescription>
                One-time certified processing and verification fee.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-center space-y-3">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-700">
                  Total Payable Amount
                </span>
                <div className="text-4xl font-black text-slate-900">
                  {formatCurrencyINR(1000)}
                </div>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Includes full access to study materials, assessment engine, attendance tracking, and verified completion credentials.
                </p>
              </div>

              {errors.payment && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {errors.payment}
                </div>
              )}

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Candidate:</span>
                  <span className="font-semibold text-slate-800">{formData.fullName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Specialization:</span>
                  <span className="font-semibold text-slate-800">{formData.technology}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Gateway:</span>
                  <span className="font-semibold text-slate-800">Razorpay (Cards, UPI, NetBanking)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(4)} disabled={isProcessingPayment}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button
                  onClick={handlePayRegistrationFee}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-white px-8 shadow-sm"
                  isLoading={isProcessingPayment}
                >
                  Pay ₹1,000 Securely
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 6: SUBMISSION SUCCESS & PENDING ADMIN APPROVAL */}
        {currentStep === 6 && applicationSuccessData && (
          <Card className="shadow-xl border-emerald-200 bg-white text-center">
            <CardContent className="p-8 sm:p-10 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Registration Submitted Successfully!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Your payment of ₹1,000 has been verified and your application is now waiting for admin approval.
                </p>
              </div>

              {/* Reference box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Application Number:</span>
                  <span className="font-mono font-bold text-slate-900">{applicationSuccessData.applicationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt Number:</span>
                  <span className="font-mono font-bold text-slate-900">{applicationSuccessData.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold text-amber-600">PENDING_ADMIN_APPROVAL</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/student/status">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Track Application Status
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
