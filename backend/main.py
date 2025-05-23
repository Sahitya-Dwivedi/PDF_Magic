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
    contents = await pdfBlob.read()
    doc = fitz.open(stream=contents, filetype="pdf")
    color_dict = {}
    pdf_info = {
        "color_dict": color_dict,
        "pages": []
    }
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        # Page dimensions in points (1/72 inch)
        width, height = float(page.rect.width), float(page.rect.height)
        style_dict = []
        
        # --- Extract text with precise positioning and formatting ---
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
                        
                        # More comprehensive font style detection
                        # Check flags first, then fall back to font name analysis
                        bold = 1 if ((flags & 2) != 0 or 
                                     "bold" in font_lower or 
                                     "black" in font_lower or
                                     "heavy" in font_lower or
                                     "extra" in font_lower) else 0
                                     
                        italic = 1 if ((flags & 1) != 0 or 
                                      "italic" in font_lower or 
                                      "oblique" in font_lower or
                                      "slant" in font_lower) else 0
                        
                        # Get color index
                        clr_idx = get_color_index(span["color"], color_dict)
                        
                        # Create style array and add to dict if new
                        style = [font, size, bold, italic]
                        if style not in style_dict:
                            style_dict.append(style)
                        
                        # Create text run with direct style array
                        run = {
                            "T": span["text"],
                            "S": 0,  # Style flags (0=normal, 4=underline)
                            "TS": style  # Style array embedded directly
                        }
                        
                        # Create text object with position, color, alignment
                        Texts.append({
                            "x": x0,
                            "y": y0,
                            "w": x1 - x0,
                            "clr": clr_idx,
                            "A": "left",  # Text alignment
                            "R": [run]  # Run array (can have multiple styles in one text block)
                        })
        
        # --- Extract images with proper positioning ---
        images = []
        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            base_image = doc.extract_image(xref)
            
            # Convert image to base64 for frontend
            image_bytes = base_image["image"]
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")
            
            # Get image dimensions
            img_width = base_image["width"]
            img_height = base_image["height"]
            
            # Add to images array
            images.append({
                "xref": xref,
                "ext": base_image["ext"],
                "width": img_width,
                "height": img_height,
                "base64": image_base64
            })
        
        # --- Extract fonts ---
        fonts = page.get_fonts()
        
        # --- Extract graphics: lines, rectangles, fills ---
        HLines, VLines, Fills = [], [], []
        
        # Process drawing commands to extract lines and fills
        for drawing in page.get_drawings():
            for item in drawing["items"]:
                if item[0] == "l":  # Line
                    x0, y0, x1, y1 = map(float, item[1])
                    width_line = float(drawing.get("width", 1))
                    color = drawing.get("color", 0)
                    clr_idx = get_color_index(color, color_dict)
                    # Check if dashed line
                    dsh = 1 if drawing.get("dashes") else 0
                    
                    # Determine if horizontal or vertical line
                    if abs(y0 - y1) < 1:  # Horizontal line
                        HLines.append({
                            "x": min(x0, x1),
                            "y": y0,
                            "l": abs(x1 - x0),
                            "w": width_line,
                            "clr": clr_idx,
                            "dsh": dsh
                        })
                    elif abs(x0 - x1) < 1:  # Vertical line
                        VLines.append({
                            "x": x0,
                            "y": min(y0, y1),
                            "w": width_line,
                            "l": abs(y1 - y0),
                            "clr": clr_idx,
                            "dsh": dsh
                        })
                
                elif item[0] == "re":  # Rectangle/fill
                    x0, y0, w, h = map(float, item[1])
                    # Use fill color for fills
                    fill_color = drawing.get("fill", 0)
                    if fill_color:  # Only add if there's actually a fill
                        clr_idx = get_color_index(fill_color, color_dict)
                        Fills.append({
                            "x": x0,
                            "y": y0,
                            "w": w,
                            "h": h,
                            "clr": clr_idx
                        })
        
        # --- Add all page elements to page object ---
        pdf_info["pages"].append({
            "page_number": page_num + 1,
            "Width": width,
            "Height": height,
            "Texts": Texts,
            "images": images,
            "fonts": fonts,
            "HLines": HLines,
            "VLines": VLines,
            "Fills": Fills,
            "Fields": [],
            "Boxsets": [],
            "style_dict": style_dict
        })
    
    # Add to pdfData array and return result
    pdfData.append(pdf_info)
    return pdf_info

@app.get("/api/pdf-results")
async def get_pdf_results():
    return pdfData

@app.post("/api/clear-memo")
async def clear_memo():
    pdfData.clear()
    return {"message": "Memo cleared."}
