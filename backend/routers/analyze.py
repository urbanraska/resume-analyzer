from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pdf_parser import extract_text_from_pdf
from services.ai_analyzer import analyze_resume
from models.schemas import AnalysisResponse

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume_endpoint(file: UploadFile = File(...)):
    """
    POST /analyze
    Accepts a PDF file upload.
    Returns AI analysis as JSON.
    """
    
    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Read file bytes from the upload
    file_bytes = await file.read()
    
    # Step 1: Extract text from PDF
    resume_text = extract_text_from_pdf(file_bytes)
    
    if not resume_text or len(resume_text) < 50:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")
    
    # Step 2: Send to AI for analysis
    result = analyze_resume(resume_text)
    
    return result