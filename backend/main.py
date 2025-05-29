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
            
            # First, add SVGs as background if present
            for svg in page_data.get("svgs", []):
                try:
                    svg_content = svg.get("svg_content", "")
                    if svg_content:
                        # Insert SVG content to the page
                        page.insert_image(
                            rect=page.rect,  # Use full page rect
                            stream=svg_content.encode('utf-8'),
                            keep_proportion=True,
                            overlay=False  # Set as background
                        )
                except Exception as svg_error:
                    print(f"Error inserting SVG: {svg_error}")
            
            # Add images if present
            for img in page_data.get("images", []):
                try:
                    if "image_data" in img and "rect" in img:
                        # Insert image at the specified rectangle
                        page.insert_image(
                            rect=fitz.Rect(img["rect"]),
                            stream=img["image_data"],
                            keep_proportion=True
                        )
                except Exception as img_error:
                    print(f"Error inserting image: {img_error}")
            
            # Get color dictionary
            color_dict = data.get("color_dict", {})
            
            # Add text elements to the page
            for text in page_data.get("Texts", []):
                x, y = text.get("x", 0), text.get("y", 0)
                
                # Get text color from color_dict
                color = None
                color_idx = text.get("clr", 0)
                
                # Find the color in the dictionary by its index value
                for clr_int, idx in color_dict.items():
                    if idx == color_idx:
                        try:
                            # Convert color int to RGB tuple
                            color_int = int(clr_int)
                            r = (color_int >> 16) & 0xFF
                            g = (color_int >> 8) & 0xFF
                            b = color_int & 0xFF
                            color = (r/255, g/255, b/255)
                        except ValueError:
                            pass
                        break
                
                # Process each text run
                for run in text.get("R", []):
                    text_content = run.get("T", "")
                    if not text_content:
                        continue
                    
                    # Get style information
                    style_info = run.get("TS", [])
                    font_name, font_size = "helv", 11
                    is_bold, is_italic = False, False
                    
                    if isinstance(style_info, list):
                        if len(style_info) >= 1:
                            font_name = style_info[0] or "helv"
                        if len(style_info) >= 2:
                            font_size = style_info[1] or 11
                        if len(style_info) >= 3:
                            is_bold = bool(style_info[2])
                        if len(style_info) >= 4:
                            is_italic = bool(style_info[3])
                    
                    # Check if font is a built-in PDF font, otherwise use a default font
                    # Built-in fonts: helv (Helvetica), tiro (Times), cour (Courier), symb (Symbol), zadb (Zapf Dingbats)
                    built_in_fonts = ["helv", "tiro", "cour", "symb", "zadb"]
                    if font_name.lower() not in built_in_fonts and not font_name.lower().startswith(tuple(built_in_fonts)):
                        # Try to map common fonts to built-in fonts
                        font_lower = font_name.lower()
                        if "helvetica" in font_lower or "arial" in font_lower or "sans" in font_lower:
                            font_name = "helv"
                        elif "times" in font_lower or "roman" in font_lower or "serif" in font_lower:
                            font_name = "tiro"
                        elif "courier" in font_lower or "mono" in font_lower:
                            font_name = "cour"
                        else:
                            font_name = "helv"  # Default to Helvetica
                    
                    # Modify font name for bold and italic
                    if is_bold and is_italic:
                        font_name += "-BoldOblique"
                    elif is_bold:
                        font_name += "-Bold"
                    elif is_italic:
                        font_name += "-Oblique"
                    
                    # Insert text with color and style
                    try:
                        text_options = {
                            "fontname": font_name,
                            "fontsize": font_size,
                        }
                        
                        # Add color if available
                        if color:
                            text_options["color"] = color
                        
                        # Text alignment (left is default)
                        align = text.get("A", "left")
                        if align == "center":
                            text_options["align"] = 1
                        elif align == "right":
                            text_options["align"] = 2
                        
                        page.insert_text(
                            (x, y),
                            text_content,
                            **text_options
                        )
                    except Exception as text_error:
                        print(f"Error inserting text: {text_error}")
            
            # Add horizontal and vertical lines if present
            for line in page_data.get("HLines", []):
                try:
                    if "x1" in line and "x2" in line and "y" in line:
                        page.draw_line(
                            (line["x1"], line["y"]),
                            (line["x2"], line["y"]),
                            color=(0, 0, 0),
                            width=line.get("width", 1)
                        )
                except Exception as line_error:
                    print(f"Error drawing horizontal line: {line_error}")
            
            for line in page_data.get("VLines", []):
                try:
                    if "x" in line and "y1" in line and "y2" in line:
                        page.draw_line(
                            (line["x"], line["y1"]),
                            (line["x"], line["y2"]),
                            color=(0, 0, 0),
                            width=line.get("width", 1)
                        )
                except Exception as line_error:
                    print(f"Error drawing vertical line: {line_error}")
            
            # Add filled rectangles if present
            for fill in page_data.get("Fills", []):
                try:
                    if "rect" in fill:
                        rect = fitz.Rect(fill["rect"])
                        color = fill.get("color", (0.8, 0.8, 0.8))  # Default to light gray
                        page.draw_rect(rect, color=color, fill=color)
                except Exception as fill_error:
                    print(f"Error drawing fill: {fill_error}")
        
        # Save PDF to memory buffer
        pdf_bytes = io.BytesIO()
        doc.save(pdf_bytes)
        doc.close()
        
        # Reset buffer position to beginning
        pdf_bytes.seek(0)
        
        print("PDF generated successfully with preserved formatting")
        
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

@app.post("/api/pdf-merge")
async def merge_pdfs(pdfFiles: list[UploadFile] = File(None)):
    try:
        print("Merging PDFs...")
        
        # Validate that we have files to merge
        if not pdfFiles or len(pdfFiles) < 1:
            raise HTTPException(status_code=400, detail="No PDF files provided")
        
        # Create a new PDF document for the merged result
        merged_doc = fitz.open()
        
        # Process each uploaded PDF file
        for pdf_file in pdfFiles:
            if not pdf_file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail=f"File {pdf_file.filename} is not a PDF")
                
            contents = await pdf_file.read()
            try:
                doc = fitz.open(stream=contents, filetype="pdf")
                
                # Add all pages from this PDF to the merged document
                merged_doc.insert_pdf(doc)
                
                # Close the source document
                doc.close()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error processing {pdf_file.filename}: {str(e)}")
        
        # Save the merged PDF to a memory buffer
        pdf_bytes = io.BytesIO()
        merged_doc.save(pdf_bytes)
        merged_doc.close()
        
        # Reset buffer position to beginning
        pdf_bytes.seek(0)
        
        print(f"Successfully merged {len(pdfFiles)} PDFs")
        
        # Return as streaming response
        return StreamingResponse(
            pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=merged_document.pdf"}
        )
    except Exception as e:
        print(f"Error merging PDFs: {e}")
        raise HTTPException(status_code=500, detail=str(e))
