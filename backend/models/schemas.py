from pydantic import BaseModel

class AnalysisResponse(BaseModel):
    name: str
    skills: list[str]
    experience_years: str
    education: str
    strengths: list[str]
    suggestions: list[str]
    score: int
    summary: str

# NEW — for JD matching
class JDMatchResponse(BaseModel):
    match_score: int           # 0-100 % match
    matched_keywords: list[str]   # skills found in both resume + JD
    missing_keywords: list[str]   # skills in JD but not in resume
    recommendations: list[str]   # what to add/change to pass ATS
    verdict: str               # "Strong Match" / "Moderate Match" / "Weak Match"