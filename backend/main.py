from fastapi import FastAPI, UploadFile, File, HTTPException
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
            style_dict = []
            
            # --- Extract SVGs ---
            svgs = []
            try:
                # Get whole page as SVG
                page_svg = page.get_svg_image(text_as_path=False)   
                page_svg = page_svg.replace("text","text hidden")
                if page_svg:
                    svgs.append({
                        "type": "page",
                        "svg_content": page_svg,
                        "width": width,
                        "height": height
                    })
            except Exception as e:
                print(f"Error extracting SVG for page {page_num+1}: {e}")
            
            # --- Extract text for overlay ---
            Texts = []
            for block in page.get_text("dict")["blocks"]:
                if block["type"] == 0:  # Text block
                    for line in block["lines"]:
                        for span in line["spans"]:
                            # Get precise text positioning from bbox
                            x0, y0, x1, y1 = map(float, span["bbox"])
                            
                            # Handle font formatting
                            font = span["font"]
                            size = float(span["size"])
                            
                            # Enhanced style detection
                            flags = span.get("flags", 0)
                            font_name = span.get("font", "")
                            font_lower = font_name.lower()
                            
                            # Font style detection
                            bold = 1 if ((flags & 2) != 0 or 
                                        "bold" in font_lower or 
                                        "black" in font_lower) else 0
                                        
                            italic = 1 if ((flags & 1) != 0 or 
                                        "italic" in font_lower or 
                                        "oblique" in font_lower) else 0
                            
                            # Get color index
                            clr_idx = get_color_index(span["color"], color_dict)
                            
                            # Create style array
                            style = [font, size, bold, italic]
                            if style not in style_dict:
                                style_dict.append(style)
                            
                            # Create text run
                            run = {
                                "T": span["text"],
                                "S": 0,
                                "TS": style
                            }
                            
                            # Create text object
                            Texts.append({
                                "x": x0,
                                "y": y0,
                                "w": x1 - x0,
                                "clr": clr_idx,
                                "A": "left",
                                "R": [run]
                            })
            
            # --- Add page elements to page object ---
            pdf_info["pages"].append({
                "page_number": page_num + 1,
                "Width": width,
                "Height": height,
                "svgs": svgs,
                "Texts": Texts,  # Include text data for overlay
                "images": [],
                "fonts": [],
                "HLines": [],
                "VLines": [],
                "Fills": [],
                "Fields": [],
                "Boxsets": [],
                "style_dict": style_dict
            })
        
        # Add to pdfData array and return result
        pdfData.append(pdf_info)
        return pdf_info
    except Exception as e:
        pdfData.append({"error": str(e)})
        raise HTTPException(status_code=500, detail=str(e))
        # return {"error": e},500

@app.post("/api/pdf-results")
async def get_pdf_results():
    return pdfData

@app.post("/api/save-pdf")
async def savePdf(req):
    print(req.body)

@app.post("/api/clear-memo")
async def clear_memo():
    pdfData.clear()
    return {"message": "Memo cleared."}
