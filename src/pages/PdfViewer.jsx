import React, { useEffect, useState } from "react";
import testData from "./Untitled-1.json"; // Import test data as fallback

const decodeText = (encoded) =>
  decodeURIComponent(encoded || "").replace(/%0D/g, "");

const PdfViewer = () => {
  const [pdfData, setPdfData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    async function fetchPdfData() {
      try {
        const response = await fetch("/api/pdf-results");
        if (!response.ok) {
          console.warn("API didn't respond, using test data");
          setPdfData(testData.Pages || []);
          return;
        }

        const data = await response.json();
        setPdfData(data.Pages || data);
      } catch (error) {
        console.error("Error fetching PDF data:", error);
        setPdfData(testData.Pages || []);
      } finally {
        setLoading(false);
      }
    }

    fetchPdfData();
  }, []);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  const nextPage = () => {
    if (currentPageIndex < pdfData.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // Function to convert color value to CSS color
  const getTextColor = (clr) => {
    if (clr === 0 || clr === undefined) {
      return "black";
    }
    // Convert numeric color value to hex format
    return `#${Number(clr).toString(16).padStart(6, "0")}`;
  };

  // Function to get text alignment class
  const getTextAlignmentClass = (alignment) => {
    switch (alignment) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      case "justify":
        return "text-justify";
      case "left":
      default:
        return "text-left";
    }
  };

  // Helper constant for point to pixel conversion (1pt = 1.33333px at 96dpi)
  const PT_TO_PX = 96 / 72; // = 1.33333...

  // Function to get font size from TS array
  const getFontSize = (run) => {
    if (run?.TS && run.TS.length >= 2 && run.TS[1]) {
      // Convert point size to pixels for proper display
      return `${run.TS[1] * PT_TO_PX}px`;
    }
    return "17px"; // Default font size if not specified
  };

  // Function to apply stroke width styles
  const getStrokeStyle = (sw) => {
    if (!sw || sw === 0) return {};

    // Convert PDF stroke width to pixels
    const strokeWidth = sw * PT_TO_PX;

    return {
      WebkitTextStroke: `${strokeWidth}px black`,
    };
  };

  // Function to apply style based on S property
  const getStyleFromS = (s) => {
    // Default style or if S is not specified
    if (s === undefined || s === -1) return {};
    
    // Map S values to specific styles
    // Common values in PDF structure:
    // 0: Normal, 1: Bold, 2: Italic, 3: Bold-Italic, etc.
    switch (s) {
      case 0:
        return { fontStyle: 'normal', fontWeight: 'normal' };
      case 1:
        return { fontWeight: 'bold' };
      case 2:
        return { fontStyle: 'italic' };
      case 3:
        return { fontStyle: 'italic', fontWeight: 'bold' };
      case 4:
        return { textDecoration: 'underline' };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-2xl text-gray-600">Loading PDF...</div>
      </div>
    );
  }

  if (!pdfData || pdfData.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-2xl text-gray-600">No PDF data available</div>
      </div>
    );
  }

  const currentPage = pdfData[currentPageIndex];
  const totalPages = pdfData.length;

  // Convert PDF point dimensions to pixels (1 point = 1/72 inch, screen is typically 96dpi)
  const POINT_TO_PIXEL = 96 / 72;
  // Scale factor to make PDF visible at reasonable size
  const DISPLAY_SCALE = 20;

  // Get page dimensions from PDF data
  const pageWidth = currentPage?.Width
    ? currentPage.Width * POINT_TO_PIXEL * DISPLAY_SCALE
    : 794;
  const pageHeight = currentPage?.Height
    ? currentPage.Height * POINT_TO_PIXEL * DISPLAY_SCALE
    : 1123;

  // Group texts by similar y values to form paragraphs
  const paragraphs = [];
  const yTolerance = 0.2; // Tolerance for grouping by y value

  if (currentPage?.Texts) {
    // Sort texts by y coordinate
    const sortedTexts = [...currentPage.Texts].sort((a, b) => a.y - b.y);

    let currentParagraph = [];
    let lastY = null;

    sortedTexts.forEach((text) => {
      // Skip empty lines or newline markers
      if (text.R?.[0]?.T === "%0D" || text.w === 0) {
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph);
          currentParagraph = [];
        }
        paragraphs.push([]); // Add an empty paragraph to create spacing
        lastY = null;
        return;
      }

      if (lastY === null || Math.abs(text.y - lastY) <= yTolerance) {
        // Same paragraph
        currentParagraph.push(text);
      } else {
        // New paragraph
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph);
        }
        currentParagraph = [text];
      }

      lastY = text.y;
    });

    // Don't forget the last paragraph
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* PDF Toolbar */}
      <div className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto grid grid-cols-2">
          <div className="space-x-4">
            <button
              onClick={prevPage}
              disabled={currentPageIndex === 0}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 inline-block"
            >
              Previous
            </button>
            <div className="inline-block">
              Page {currentPageIndex + 1} of {totalPages}
            </div>
            <button
              onClick={nextPage}
              disabled={currentPageIndex === totalPages - 1}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 inline-block"
            >
              Next
            </button>
          </div>

          <div className="space-x-4 text-right">
            <button
              onClick={handleZoomOut}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 inline-block"
            >
              -
            </button>
            <div className="inline-block">{Math.round(scale * 100)}%</div>
            <button
              onClick={handleZoomIn}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 inline-block"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="overflow-auto p-6 text-center">
        <div
          className="relative transform origin-top-center inline-block"
          style={{ transform: `scale(${scale})` }}
        >
          {/* PDF Page */}
          <div
            className="bg-white shadow-lg rounded-sm overflow-hidden inline-block"
            style={{
              width: `${pageWidth}px`,
              minHeight: `${pageHeight}px`,
              padding: "48px",
            }}
          >
            {paragraphs.map((paragraph, pIndex) => (
              <div
                key={pIndex}
                className={`${paragraph.length === 0 ? "h-4" : "mb-4"}`}
              >
                {paragraph.map((text, tIndex) => (
                  <div
                    key={`${pIndex}-${tIndex}`}
                    className={`leading-relaxed font-['Helvetica',sans-serif] ${getTextAlignmentClass(
                      text.A
                    )}`}
                    style={{
                      color: getTextColor(text.clr),
                      textAlign: text.A,
                    }}
                  >
                    {text.R?.map((run, rIndex) => (
                      <span
                        key={rIndex}
                        style={{
                          fontSize: getFontSize(run),
                          ...getStrokeStyle(text.sw),
                          ...getStyleFromS(run.S),
                        }}
                      >
                        {decodeText(run.T)}
                      </span>
                    ))}
                    {tIndex < paragraph.length - 1 ? " " : ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
