import os
import json
import requests
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
MODEL_URL = "https://router.huggingface.co/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/json"
}

def match_jd(resume_text: str, jd_text: str) -> dict:
    payload = {
        "model": "meta-llama/Llama-3.1-8B-Instruct",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert ATS system and career coach. "
                    "Compare a resume against a job description. "
                    "Return ONLY a valid JSON object. No markdown, no extra text."
                )
            },
            {
                "role": "user",
                "content": f"""
Compare this resume against the job description below.
Return ONLY this JSON structure:

{{
  "match_score": 78,
  "matched_keywords": ["Python", "FastAPI", "React"],
  "missing_keywords": ["Kubernetes", "AWS", "Docker"],
  "recommendations": [
    "Add Docker and containerization experience",
    "Highlight any cloud deployment experience",
    "Mention team collaboration and agile methodology"
  ],
  "verdict": "Moderate Match"
}}

Rules:
- match_score is 0-100 based on how well resume matches JD
- matched_keywords: skills/tools present in BOTH resume and JD
- missing_keywords: important skills in JD that are MISSING from resume
- recommendations: 3-4 specific actionable tips to improve the match
- verdict: "Strong Match" if score>=75, "Moderate Match" if score>=50, "Weak Match" if below

RESUME:
{resume_text[:2000]}

JOB DESCRIPTION:
{jd_text[:2000]}
"""
            }
        ],
        "temperature": 0.2,
        "max_tokens": 800,
        "response_format": {"type": "json_object"}
    }

    response = requests.post(MODEL_URL, headers=HEADERS, json=payload, timeout=90)

    if response.status_code != 200:
        raise Exception(f"HuggingFace API error {response.status_code}: {response.text}")

    data = response.json()
    generated = data["choices"][0]["message"]["content"]

    generated = generated.replace("```json", "").replace("```", "").strip()
    start = generated.find("{")
    end = generated.rfind("}") + 1
    return json.loads(generated[start:end])