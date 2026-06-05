import os
import json
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

if not HF_API_KEY:
    raise Exception("HUGGINGFACE_API_KEY not found in .env")

# Hugging Face Router endpoint
MODEL_URL = "https://router.huggingface.co/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/json"
}


def analyze_resume(resume_text: str) -> dict:
    payload = {
        "model": "meta-llama/Llama-3.1-8B-Instruct",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert ATS Resume Analyzer. "
                    "Return ONLY a valid JSON object. "
                    "Do not use markdown. "
                    "Do not use code blocks. "
                    "Do not explain your reasoning. "
                    "Do not include any text outside the JSON."
                )
            },
            {
                "role": "user",
                "content": f"""
Analyze the following resume and return ONLY this JSON structure:

{{
  "name": "candidate full name or Unknown",
  "skills": ["skill1", "skill2", "skill3"],
  "experience_years": "X years or Fresher",
  "education": "highest degree and institution",
  "strengths": ["strength1", "strength2", "strength3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "score": 75,
  "summary": "2-3 sentence professional summary"
}}

Resume:
{resume_text[:3000]}
"""
            }
        ],
        "temperature": 0.2,
        "max_tokens": 1000,
        "response_format": {
        "type": "json_object"
        }
    }

    try:
        response = requests.post(
            MODEL_URL,
            headers=HEADERS,
            json=payload,
            timeout=90
        )

        if response.status_code != 200:
            print(response.text)
            raise Exception(
                f"HuggingFace API error {response.status_code}: {response.text}"
            )

        data = response.json()

        generated = data["choices"][0]["message"]["content"]

        # Remove markdown blocks if present
        generated = generated.replace("```json", "")
        generated = generated.replace("```", "")
        generated = generated.strip()

        # Extract JSON portion
        start = generated.find("{")
        end = generated.rfind("}")

        if start == -1:
            raise Exception(
            f"No JSON found in AI response:\n{generated}"
            )

        if end == -1:
            return {
                "name": "Unknown",
                "skills": [],
                "experience_years": "Unknown",
                "education": "Unknown",
                "strengths": [],
                "suggestions": [
                    "AI response was truncated"
                ],
                "score": 0,
                "summary": "Unable to analyze resume"
            }

        json_str = generated[start:end + 1]

        result = json.loads(json_str)

        return result

    except json.JSONDecodeError as e:
        raise Exception(
            f"Invalid JSON returned by AI:\n{str(e)}\n\nResponse:\n{generated}"
        )

    except requests.exceptions.RequestException as e:
        raise Exception(f"Request failed: {str(e)}")

    except Exception as e:
        raise Exception(f"Resume analysis failed: {str(e)}")