"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult, matchJD, JDMatchResult } from "@/lib/api";

// Animated score ring
function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth="10"
        />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition:
              "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-4xl font-bold text-white" style={{ color }}>
          {score}
        </div>
        <div className="text-xs text-gray-500">/ 100</div>
      </div>
    </div>
  );
}

// Skill chip
function SkillChip({ skill }: { skill: string }) {
  return (
    <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium hover:bg-blue-500/20 transition-colors">
      {skill}
    </span>
  );
}

// Section card
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [jdText, setJdText] = useState("");
  const [jdResult, setJdResult] = useState<JDMatchResult | null>(null);
  const [jdLoading, setJdLoading] = useState(false);
  const [jdError, setJdError] = useState("");
  const [showJD, setShowJD] = useState(false);

  const handleJDMatch = async () => {
    if (!jdText.trim()) return;
    setJdLoading(true);
    setJdError("");
    try {
      // Reconstruct File from base64 stored in sessionStorage
      const base64 = sessionStorage.getItem("resumeFile");
      const fileName = sessionStorage.getItem("resumeFileName") || "resume.pdf";
      if (!base64)
        throw new Error("Resume file not found. Please go back and re-upload.");

      const res = await fetch(base64);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "application/pdf" });

      const result = await matchJD(file, jdText);
      setJdResult(result);
    } catch (err: unknown) {
      setJdError(err instanceof Error ? err.message : "Matching failed");
    } finally {
      setJdLoading(false);
    }
  };

  // Read sessionStorage once during render — no useEffect needed
  const result: AnalysisResult | null = (() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("analysisResult");
    return stored ? (JSON.parse(stored) as AnalysisResult) : null;
  })();

  // Redirect if no data
  useEffect(() => {
    if (!result) {
      router.push("/");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger fade-in animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!result)
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );

  const scoreLabel =
    result.score >= 75
      ? "Strong Resume"
      : result.score >= 50
        ? "Average Resume"
        : "Needs Work";
  const scoreColor =
    result.score >= 75
      ? "text-green-400"
      : result.score >= 50
        ? "text-amber-400"
        : "text-red-400";

  return (
    <main className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`relative z-10 max-w-5xl mx-auto px-4 py-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← New Analysis
          </button>
          <span className="text-xs text-gray-600 border border-gray-800 rounded-full px-3 py-1">
            Powered by LLaMA 3.1
          </span>
        </div>

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Score */}
          <Card className="flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-gray-500 text-sm uppercase tracking-widest text-xs">
              ATS Score
            </p>
            <ScoreRing score={result.score} />
            <p className={`font-semibold ${scoreColor}`}>{scoreLabel}</p>
          </Card>

          {/* Profile */}
          <Card className="col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                {result.name.charAt(0) || "?"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{result.name}</h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-gray-400 text-sm">
                    🎓 {result.education}
                  </span>
                  <span className="text-gray-400 text-sm">
                    💼 {result.experience_years}
                  </span>
                </div>
                <p className="mt-3 text-gray-300 text-sm leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Skills */}
        <Card className="mb-4">
          <h3 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Skills Detected
            <span className="ml-auto text-xs text-gray-600 font-normal">
              {result.skills.length} skills found
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.skills.map((skill, i) => (
              <SkillChip key={i} skill={skill} />
            ))}
          </div>
        </Card>

        {/* Strengths + Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card>
            <h3 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Strengths
            </h3>
            <ul className="space-y-3">
              {result.strengths.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-gray-300"
                >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    ✓
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Suggestions
            </h3>
            <ul className="space-y-3">
              {result.suggestions.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-gray-300"
                >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 text-xs">
                    💡
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* JD Match Section */}
        <div className="mt-4">
          {!showJD ? (
            <button
              onClick={() => setShowJD(true)}
              className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-400
                 hover:border-blue-500/50 hover:text-blue-400 transition-all text-sm font-medium"
            >
              ✨ Check how well this resume matches a job description →
            </button>
          ) : (
            <Card>
              <h3 className="text-gray-200 font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                Job Description Match
              </h3>

              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-gray-300
                   text-sm resize-none outline-none focus:border-blue-500/50 transition-colors
                   placeholder:text-gray-600"
              />

              {jdError && (
                <p className="mt-2 text-red-400 text-sm">{jdError}</p>
              )}

              <button
                onClick={handleJDMatch}
                disabled={!jdText.trim() || jdLoading}
                className={`mt-3 w-full py-3 rounded-xl font-semibold text-sm transition-all
          ${
            jdText.trim() && !jdLoading
              ? "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white"
              : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}
              >
                {jdLoading ? "Analyzing match…" : "Analyze JD Match →"}
              </button>

              {/* JD Results */}
              {jdResult && (
                <div className="mt-6 space-y-5">
                  {/* Match score bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm font-medium">
                        Match Score
                      </span>
                      <span
                        className={`font-bold text-lg ${
                          jdResult.match_score >= 75
                            ? "text-green-400"
                            : jdResult.match_score >= 50
                              ? "text-amber-400"
                              : "text-red-400"
                        }`}
                      >
                        {jdResult.match_score}% — {jdResult.verdict}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          jdResult.match_score >= 75
                            ? "bg-green-500"
                            : jdResult.match_score >= 50
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${jdResult.match_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Matched keywords */}
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                      ✅ Keywords Matched
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {jdResult.matched_keywords.map((k, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-xs"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing keywords */}
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                      ❌ Missing Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {jdResult.missing_keywords.map((k, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                      💡 Recommendations
                    </p>
                    <ul className="space-y-2">
                      {jdResult.recommendations.map((r, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-300"
                        >
                          <span className="text-violet-400 mt-0.5">→</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
