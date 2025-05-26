from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import base64

app = FastAPI()
pdfData = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_color_index(color, color_dict):
    """Convert PyMuPDF color to index in color_dict"""
    if color not in color_dict:
        color_dict[color] = len(color_dict)
    return color_dict[color]

@app.post("/api/pdf")
async def parse_pdf(pdfBlob: UploadFile = File(...)):
    try:
        contents = await pdfBlob.read()
        doc = fitz.open(stream=contents, filetype="pdf")
        color_dict = {}
        pdf_info = {
            "color_dict": color_dict,
            "pages": []
        }
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            width, height = float(page.rect.width), float(page.rect.height)
            
            # --- Extract SVGs only ---
            svgs = []
            try:
                # Get whole page as SVG
                page_svg = page.get_svg_image(text_as_path=False)
                if page_svg:
                    svgs.append({
                        "type": "page",
                        "svg_content": page_svg,
                        "width": width,
                        "height": height
                    })
            except Exception as e:
                print(f"Error extracting SVG for page {page_num+1}: {e}")
            
            # --- Add page elements to page object (SVG-focused) ---
            pdf_info["pages"].append({
                "page_number": page_num + 1,
                "Width": width,
                "Height": height,
                "svgs": svgs,
                # Keep minimal info for compatibility
                "Texts": [],
                "images": [],
                "fonts": [],
                "HLines": [],
                "VLines": [],
                "Fills": [],
                "Fields": [],
                "Boxsets": [],
                "style_dict": []
            })
        
        # Add to pdfData array and return result
        pdfData.append(pdf_info)
        return pdf_info
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/pdf-results")
async def get_pdf_results():
    return pdfData

@app.post("/api/clear-memo")
async def clear_memo():
    pdfData.clear()
    return {"message": "Memo cleared."}
