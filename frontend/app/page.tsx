"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { analyzeResume } from "@/lib/api";

// Animated dots for loading state
function LoadingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-white animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.type === "application/pdf") {
      setFile(f);
      setError("");
    } else setError("Only PDF files are accepted");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const result = await analyzeResume(file);
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      // Store file as base64 so JD match can reuse it
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem("resumeFile", reader.result as string);
        sessionStorage.setItem("resumeFileName", file.name);
        router.push("/results");
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.",
      );
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-8">
        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          AI-Powered · Free · Instant
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            Resume
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {" "}
              Analyzer
            </span>
          </h1>
          <p className="mt-3 text-gray-400 text-lg">
            Get AI feedback on your resume in under 60 seconds
          </p>
        </div>

        {/* Upload card */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !loading && document.getElementById("fi")?.click()}
          className={`w-full rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer p-10 text-center
            ${
              dragOver
                ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                : file
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-gray-700 bg-white/[0.02] hover:border-gray-500 hover:bg-white/[0.04]"
            }`}
        >
          <input
            id="fi"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">
                📄
              </div>
              <div>
                <p className="text-green-400 font-semibold">{file.name}</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {(file.size / 1024).toFixed(0)} KB · PDF
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-xs text-gray-500 hover:text-gray-300 underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-2xl">
                📎
              </div>
              <div>
                <p className="text-gray-300 font-medium">
                  Drop your PDF resume here
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  or click to browse · Max 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
            ${
              file && !loading
                ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-100"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <LoadingDots />
              <span>Analyzing your resume…</span>
            </span>
          ) : (
            "Analyze Resume →"
          )}
        </button>

        {/* Stats row */}
        <div className="flex gap-8 text-center">
          {[
            ["Free", "No sign up needed"],
            ["~30s", "Average analysis time"],
            ["AI", "LLaMA 3.1 powered"],
          ].map(([val, label]) => (
            <div key={val}>
              <div className="text-white font-bold text-lg">{val}</div>
              <div className="text-gray-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
