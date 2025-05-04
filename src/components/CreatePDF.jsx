import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

/**
 * Creates a PDF from text content
 * @param {string} textContent - The text content to convert
 * @param {string} fileName - Name for the output file
 * @returns {Promise<Blob>} - The generated PDF as a Blob
 */
export const createPdfFromText = async (textContent, fileName) => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page to the document
  const page = pdfDoc.addPage([550, 750]);
  
  // Get the standard font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Set up some variables for text layout
  const fontSize = 12;
  const lineHeight = fontSize * 1.2;
  const margin = 50;
  const maxWidth = page.getWidth() - 2 * margin;
  
  // Draw the text on the page
  const paragraphs = textContent.split('\n');
  let y = page.getHeight() - margin;
  
  // Add title
  page.drawText(fileName, {
    x: margin,
    y: y,
    size: fontSize + 4,
    font,
    color: rgb(0, 0, 0)
  });
  
  y -= lineHeight * 2; // Space after title
  
  // Process paragraphs
  paragraphs.forEach(paragraph => {
    if (paragraph.trim() === '') {
      y -= lineHeight;
      return;
    }
    
    const words = paragraph.split(/\s+/);
    let line = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line ? `${line} ${words[i]}` : words[i];
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth > maxWidth) {
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0)
        });
        
        y -= lineHeight;
        line = words[i];
        
        // Add a new page if we've reached the bottom margin
        if (y < margin) {
          const newPage = pdfDoc.addPage([550, 750]);
          y = newPage.getHeight() - margin;
        }
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0)
      });
      y -= lineHeight * 1.5; // Extra space after paragraphs
    }
    
    // Add a new page if we've reached the bottom margin
    if (y < margin) {
      const newPage = pdfDoc.addPage([550, 750]);
      y = newPage.getHeight() - margin;
    }
  });
  
  // Serialize the PDFDocument to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Create a Blob from the PDF bytes
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const downloadPdf = (blob, fileName) => {
  saveAs(blob, fileName);
};

export default {
  createPdfFromText,
  downloadPdf
};
