"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "@/lib/api";

export default function ResultsPage() {
  const router = useRouter();
  const [result] = useState<AnalysisResult | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("analysisResult");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (!result) {
      router.push("/");
    }
  }, [result, router]);

  if (!result) return null;

  // Color changes based on score
  const scoreColor = result.score >= 75 ? "text-green-400" 
                   : result.score >= 50 ? "text-yellow-400" 
                   : "text-red-400";

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-4xl mx-auto">
      <button onClick={() => router.push("/")} className="text-gray-400 hover:text-white mb-6">
        ← Analyze Another Resume
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-gray-400 mb-2">Resume Score</p>
          <p className={`text-7xl font-bold ${scoreColor}`}>{result.score}</p>
          <p className="text-gray-500 text-sm">out of 100</p>
        </div>

        {/* Basic Info */}
        <div className="bg-gray-900 rounded-2xl p-6 col-span-2">
          <h2 className="text-2xl font-bold text-blue-400">{result.name}</h2>
          <p className="text-gray-300 mt-1">🎓 {result.education}</p>
          <p className="text-gray-300 mt-1">💼 {result.experience_years} experience</p>
          <p className="text-gray-400 mt-3 text-sm">{result.summary}</p>
        </div>

        {/* Skills */}
        <div className="bg-gray-900 rounded-2xl p-6 col-span-2">
          <h3 className="font-semibold text-gray-200 mb-3">🛠 Skills Detected</h3>
          <div className="flex flex-wrap gap-2">
            {result.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-200 mb-3">✅ Strengths</h3>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-green-300 text-sm">• {s}</li>
            ))}
          </ul>
        </div>

        {/* Suggestions */}
        <div className="bg-gray-900 rounded-2xl p-6 col-span-3">
          <h3 className="font-semibold text-gray-200 mb-3">💡 Suggestions to Improve</h3>
          <ul className="space-y-2">
            {result.suggestions.map((s, i) => (
              <li key={i} className="text-yellow-300 text-sm">• {s}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}