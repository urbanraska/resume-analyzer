from pydantic import BaseModel

# This defines what data shapes our API sends/receives
class AnalysisResponse(BaseModel):
    name: str               # Extracted candidate name
    skills: list[str]       # List of skills found
    experience_years: str   # Estimated experience
    education: str          # Education summary
    strengths: list[str]    # AI-identified strengths
    suggestions: list[str]  # AI improvement tips
    score: int              # Resume score out of 100
    summary: str            # AI-written summary