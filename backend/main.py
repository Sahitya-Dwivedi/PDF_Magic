from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF

app = FastAPI()
pdfData = []
# Allow frontend access (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/pdf")
async def parse_pdf(pdfBlob: UploadFile = File(...)):
    print("Received pdfBlob:", pdfBlob.filename)
    contents = await pdfBlob.read()
    doc = fitz.open(stream=contents, filetype="pdf")

    first_page = doc[0]
    text = first_page.get_text()
    pdfData.append(text)
    print("Extracted text:", text)
    return {"text": text}

@app.get("/api/pdf-results")
async def get_pdf_results():
    # Placeholder for future implementation
    return {"message": pdfData}

@app.post("/api/clear-memo")
async def clear_memo():
    # Placeholder for future implementation
    return {"message": "Clear memo functionality will be implemented in the future."}