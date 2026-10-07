"use client";

import React, { useState } from "react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, FileText, Upload, Folder } from "lucide-react";

export default function AdminLearningPage() {
  const [subjects] = useState([
    {
      id: "sub1",
      name: "Modern Fullstack Web Development",
      category: "Web Development",
      technology: "Next.js & TypeScript",
      materialsCount: 4,
    },
    {
      id: "sub2",
      name: "Python for Enterprise & Automation",
      category: "Python",
      technology: "Python 3 & Pandas",
      materialsCount: 3,
    },
    {
      id: "sub3",
      name: "Data Science & Analytics",
      category: "Data Science",
      technology: "Data Analytics",
      materialsCount: 2,
    },
  ]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AdminTopbar title="Subjects & Study Materials" />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Curriculum & Material Allocation
            </h2>
            <p className="text-xs text-slate-500">
              Manage technological tracks and upload protected learning resources into Supabase Storage.
            </p>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-1.5" />
            Upload Study Material
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <Card key={sub.id} className="border-slate-200/90 shadow-xs flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {sub.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Tech: {sub.technology}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>{sub.materialsCount} Published Documents</span>
                  <button className="text-blue-600 font-bold hover:underline">
                    Manage Files →
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
