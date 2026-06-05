// Base URL switches automatically between dev and production
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AnalysisResult {
  name: string;
  skills: string[];
  experience_years: string;
  education: string;
  strengths: string[];
  suggestions: string[];
  score: number;
  summary: string;
}

export async function analyzeResume(file: File): Promise<AnalysisResult> {
  // FormData is how browsers send files to servers
  const formData = new FormData();
  formData.append("file", file);  // "file" must match FastAPI's parameter name

  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData,
    // Don't set Content-Type header! Browser sets it automatically with boundary
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Analysis failed");
  }

  return response.json();
}