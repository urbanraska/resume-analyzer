from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze

app = FastAPI(
    title="Resume Analyzer API",
    description="AI-powered resume analysis using HuggingFace",
    version="1.0.0"
)

# CORS lets your Next.js frontend talk to this backend
# During dev: allow localhost. In production: add your Vercel URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",           # Next.js dev server
        "https://resume-analyzer-fawn-delta.vercel.app",
        "https://resume-analyzer-git-main-subarna-kars-projects.vercel.app",
        "https://resume-analyzer-kla1q2lxv-subarna-kars-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(analyze.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Resume Analyzer API is running!"}