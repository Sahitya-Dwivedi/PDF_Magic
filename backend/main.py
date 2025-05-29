from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
import fitz  # PyMuPDF
import tempfile
import os
import uuid
import io

app = FastAPI(debug=True)
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
async def save_pdf(req: dict):    
    try:
        data = req
        print("Generating PDF from data...")
        
        # Create a new PDF document
        doc = fitz.open()
        
        # For each page in the data
        for page_data in data["pages"]:
            # Create a page with the appropriate dimensions
            page = doc.new_page(width=page_data["Width"], height=page_data["Height"])
            
            # Add text elements to the page
            for text in page_data.get("Texts", []):
                x, y = text.get("x", 0), text.get("y", 0)
                
                # Process each text run
                for run in text.get("R", []):
                    text_content = run.get("T", "")
                    if not text_content:
                        continue
                    
                    # Get style information
                    style_info = run.get("TS", [])
                    if isinstance(style_info, list) and len(style_info) >= 2:
                        font_name, font_size = style_info[0], style_info[1]
                        # Check if font is a built-in PDF font, otherwise use a default font
                        # Built-in fonts: helv (Helvetica), tiro (Times), cour (Courier), symb (Symbol), zadb (Zapf Dingbats)
                        built_in_fonts = ["helv", "tiro", "cour", "symb", "zadb"]
                        if font_name.lower() not in built_in_fonts and not font_name.lower().startswith(tuple(built_in_fonts)):
                            font_name = "helv"
                    else:
                        # Default font and size
                        font_name, font_size = "helv", 11
                    
                    # Insert text
                    try:
                        page.insert_text(
                            (x, y),
                            text_content,
                            fontname=font_name,
                            fontsize=font_size
                        )
                    except Exception as text_error:
                        print(f"Error inserting text: {text_error}")
            
        # Save PDF to memory buffer instead of temporary file
        pdf_bytes = io.BytesIO()
        doc.save(pdf_bytes)
        doc.close()
        
        # Reset buffer position to beginning
        pdf_bytes.seek(0)
        
        print("PDF generated successfully in memory")
        
        # Return as streaming response
        return StreamingResponse(
            pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=generated_document.pdf"}
        )
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clear-memo")
async def clear_memo():
    pdfData.clear()
    return {"message": "Memo cleared."}
