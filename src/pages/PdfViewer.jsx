import React, { useEffect, useState } from "react";

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
          setPdfData([]);
          return;
        }

        const data = await response.json();
        setPdfData(data.Pages || data);
      } catch (error) {
        console.error("Error fetching PDF data:", error);
        setPdfData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPdfData();
  }, []);
  console.log("PDF Data:", pdfData); 

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

  // Function to get numerical font size value (without 'px' suffix)
  const getNumericFontSize = (run) => {
    if (run?.TS && run.TS.length >= 2 && run.TS[1]) {
      return run.TS[1] * PT_TO_PX;
    }
    return 17; // Default font size
  };

  // Function to calculate line height based on font size
  const getLineHeight = (run) => {
    const fontSize = getNumericFontSize(run);
    // Line height is typically 120-150% of font size for good readability
    // Using 1.3 (130%) as a standard value
    return `${fontSize * 1.3}px`;
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
        return { fontStyle: "normal", fontWeight: "normal" };
      case 1:
        return { fontWeight: "bold" };
      case 2:
        return { fontStyle: "italic" };
      case 3:
        return { fontStyle: "italic", fontWeight: "bold" };
      case 4:
        return { textDecoration: "underline" };
      default:
        return {};
    }
  };

  // Optionally map font IDs to font families (customize as needed)
  const fontIdToFamily = (fontId) => {
    // Example mapping, extend as needed
    switch (fontId) {
      case 0:
        return "Helvetica, Arial, sans-serif";
      case 1:
        return "Times New Roman, Times, serif";
      case 2:
        return "Courier New, Courier, monospace";
      // Add more mappings as needed
      default:
        return "Helvetica, Arial, sans-serif";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-2xl text-gray-600">Loading PDF...</div>
      </div>
    );
  }

  if (!pdfData || pdfData.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-2xl text-gray-600">No PDF data available</div>
      </div>
    );
  }

  const currentPage = pdfData[currentPageIndex];
  const totalPages = pdfData.length;

  // Convert PDF point dimensions to pixels (1 point = 1/72 inch, screen is typically 96dpi)
  const POINT_TO_PIXEL = 96 / 72;
  // Scale factor to make PDF visible at reasonable size
  const DISPLAY_SCALE = 19;

  // Get page dimensions from PDF data
  const pageWidth = currentPage?.Width
    ? currentPage.Width * POINT_TO_PIXEL * DISPLAY_SCALE
    : 794;
  const pageHeight = currentPage?.Height
    ? currentPage.Height * POINT_TO_PIXEL * DISPLAY_SCALE
    : 1123;

  // Group texts by similar y values to form paragraphs
  const paragraphs = [];
  // const yTolerance = 0.2; // Tolerance for grouping by y value

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

      if (lastY === null ) {
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

  // Helper to convert PDF points to px with scaling
  const toPx = (pt) => pt * POINT_TO_PIXEL * DISPLAY_SCALE;

  // Helper to get color from fill/stroke arrays (assume [r,g,b] 0-255)
  const rgbArrToCss = (arr) =>
    Array.isArray(arr) && arr.length === 3
      ? `rgb(${arr[0]},${arr[1]},${arr[2]})`
      : "black";

  // Render HLines, VLines, Fills, Fields, Boxsets
  const renderExtras = () => (
    <>
      {/* HLines */}
      {Array.isArray(currentPage?.HLines) &&
        currentPage.HLines.map((line, i) => (
          <div
            key={`hline-${i}`}
            style={{
              position: "absolute",
              left: toPx(line.x1),
              top: toPx(line.y1),
              width: Math.abs(toPx(line.x2) - toPx(line.x1)),
              height: Math.max(line.w ? toPx(line.w) : 2, 1),
              background: rgbArrToCss(line.oc || [0, 0, 0]),
              opacity: 0.7,
              pointerEvents: "none",
            }}
          />
        ))}
      {/* VLines */}
      {Array.isArray(currentPage?.VLines) &&
        currentPage.VLines.map((line, i) => (
          <div
            key={`vline-${i}`}
            style={{
              position: "absolute",
              left: toPx(line.x1),
              top: toPx(line.y1),
              width: Math.max(line.w ? toPx(line.w) : 2, 1),
              height: Math.abs(toPx(line.y2) - toPx(line.y1)),
              background: rgbArrToCss(line.oc || [0, 0, 0]),
              opacity: 0.7,
              pointerEvents: "none",
            }}
          />
        ))}
      {/* Fills */}
      {Array.isArray(currentPage?.Fills) &&
        currentPage.Fills.map((fill, i) => (
          <div
            key={`fill-${i}`}
            style={{
              position: "absolute",
              left: toPx(fill.x),
              top: toPx(fill.y),
              width: toPx(fill.w),
              height: toPx(fill.h),
              background: rgbArrToCss(fill.oc || [200, 200, 200]),
              opacity: 0.3,
              pointerEvents: "none",
            }}
          />
        ))}
      {/* Fields */}
      {Array.isArray(currentPage?.Fields) &&
        currentPage.Fields.map((field, i) => (
          <div
            key={`field-${i}`}
            style={{
              position: "absolute",
              left: toPx(field.x),
              top: toPx(field.y),
              width: toPx(field.w),
              height: toPx(field.h),
              border: "2px dashed #0070f3",
              borderRadius: "2px",
              background: "rgba(0,112,243,0.05)",
              pointerEvents: "none",
            }}
            title={field.T || ""}
          />
        ))}
      {/* Boxsets */}
      {Array.isArray(currentPage?.Boxsets) &&
        currentPage.Boxsets.map((box, i) => (
          <div
            key={`boxset-${i}`}
            style={{
              position: "absolute",
              left: toPx(box.x),
              top: toPx(box.y),
              width: toPx(box.w),
              height: toPx(box.h),
              border: "2px solid #f59e42",
              borderRadius: "2px",
              background: "rgba(245,158,66,0.07)",
              pointerEvents: "none",
            }}
            title={box.T || ""}
          />
        ))}
    </>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* PDF Toolbar */}
      <div className="bg-gray-800 text-white p-4 shadow-md fixed top-0 left-0 right-0 z-10">
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
          className="relative transform origin-top inline-block"
          style={{ transform: `scale(${scale})` }}
        >
          {/* PDF Page */}
          <div
            className="bg-white shadow-lg rounded-sm overflow-hidden inline-block"
            style={{
              width: `${pageWidth}px`,
              minHeight: `${pageHeight}px`,
              padding: "48px",
              position: "relative",
            }}
          >
            {/* Render extras (lines, fills, fields, boxsets) */}
            {renderExtras()}
            {/* Render each text absolutely using x/y */}
            {currentPage?.Texts?.map((text, tIndex) => (
              <div
                key={tIndex}
                className={`font-['Helvetica',sans-serif] ${getTextAlignmentClass(text.A)}`}
                style={{
                  position: "absolute",
                  left: toPx(text.x),
                  top: toPx(text.y),
                  color: getTextColor(text.clr),
                  textAlign: text.A,
                  width: text.w ? toPx(text.w) : "auto", // <--- "w" is being used here for width
                  // Optionally set background: "transparent"
                }}
              >
                {text.R?.map((run, rIndex) => (
                  <span
                    key={rIndex}
                    style={{
                      fontFamily:
                        run?.TS && run.TS.length > 0
                          ? fontIdToFamily(run.TS[0])
                          : undefined,
                      fontSize: getFontSize(run),
                      lineHeight: getLineHeight(run),
                      ...getStrokeStyle(text.sw),
                      ...getStyleFromS(run.S),
                    }}
                  >
                    {decodeText(run.T)}
                  </span>
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
