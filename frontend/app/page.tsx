"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeResume } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === "application/pdf") {
      setFile(selected);
      setError("");
    } else {
      setError("Please upload a PDF file");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
      setError("");
    } else {
      setError("Please drop a PDF file");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      const result = await analyzeResume(file);
      // Store result in sessionStorage to pass to results page
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      router.push("/results");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-2 text-center">
        Resume <span className="text-blue-400">Analyzer</span>
      </h1>
      <p className="text-gray-400 mb-10 text-center">
        Upload your resume and get AI-powered feedback in seconds
      </p>

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
          ${dragOver ? "border-blue-400 bg-blue-950/30" : "border-gray-600 hover:border-gray-400"}`}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        {file ? (
          <div>
            <p className="text-green-400 text-xl">✓ {file.name}</p>
            <p className="text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-6xl mb-4">📄</p>
            <p className="text-gray-300">Drop your PDF resume here</p>
            <p className="text-gray-500 text-sm mt-1">or click to browse</p>
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      <button
        onClick={handleAnalyze}
        disabled={!file || loading}
        className="mt-6 px-10 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 
                   disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all"
      >
        {loading ? "Analyzing... (this may take ~30s)" : "Analyze Resume"}
      </button>
    </main>
  );
}