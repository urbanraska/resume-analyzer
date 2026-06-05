from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from services.pdf_parser import extract_text_from_pdf
from services.ai_analyzer import analyze_resume
from services.jd_analyzer import match_jd          # NEW
from models.schemas import AnalysisResponse, JDMatchResponse  # NEW

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")
    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text or len(resume_text) < 50:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")
    result = analyze_resume(resume_text)
    return result

# NEW ENDPOINT
@router.post("/match-jd", response_model=JDMatchResponse)
async def match_jd_endpoint(
    file: UploadFile = File(...),
    jd_text: str = Form(...)   # job description sent as form field alongside the file
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")
    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text or len(resume_text) < 50:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")
    result = match_jd(resume_text, jd_text)
    return result