import fitz  # PyMuPDF - reads PDF files

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Takes raw PDF bytes (uploaded file content),
    returns all text extracted from every page.
    """
    # Open PDF from memory (no need to save to disk)
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    
    full_text = ""
    for page in doc:
        full_text += page.get_text()  # Extract text per page
    
    doc.close()
    return full_text.strip()