# Resume Analyzer

AI-powered resume analysis web app with a Next.js frontend and a FastAPI backend.

## Project Structure

- `frontend/` - Next.js application
- `backend/` - FastAPI API server

## Features

- Upload a resume PDF from the browser
- Extract text from resumes using `PyMuPDF`
- Analyze resume content through Hugging Face chat completion API
- Return structured resume insights as JSON

## Prerequisites

- Node.js 20+ and npm
- Python 3.12+ (or compatible)
- A Hugging Face API key

## Setup

1. Install backend dependencies:

```powershell
cd "c:\Work and study\Full stack\resume-analyzer\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Create a `.env` file in `backend/`:

```text
HUGGINGFACE_API_KEY=your_api_key_here
```

3. Install frontend dependencies:

```powershell
cd "c:\Work and study\Full stack\resume-analyzer\frontend"
npm install
```

## Run Locally

### Start the backend

```powershell
cd "c:\Work and study\Full stack\resume-analyzer\backend"
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start the frontend

```powershell
cd "c:\Work and study\Full stack\resume-analyzer\frontend"
npm run dev
```

Open the app at `http://localhost:3000`. The API is available at `http://localhost:8000`.

## API Endpoint

- `POST /api/analyze`
  - Accepts `file` as a PDF upload
  - Returns a JSON resume analysis with keys:
    - `name`
    - `skills`
    - `experience_years`
    - `education`
    - `strengths`
    - `suggestions`
    - `score`
    - `summary`

## Notes

- The backend validates that uploads are `.pdf` files only.
- The AI analyzer uses the Hugging Face chat completion router endpoint with `meta-llama/Llama-3.1-8B-Instruct`.
- Update allowed CORS origins in `backend/main.py` before deploying to production.

## License

This repository does not include a license file. Add one if you want to publish the project publicly.