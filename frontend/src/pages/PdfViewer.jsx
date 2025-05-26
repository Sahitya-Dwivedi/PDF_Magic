import React, { useEffect, useState, useRef } from "react";

const PdfViewer = () => {
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [fileName, setFileName] = useState("");
  const [pdfno, setpdfno] = useState(0);

  // Add ref for the SVG container
  const svgContainerRef = useRef(null);

  // Add state for editable text overlay
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    document.title = "PDF Magic - PdfViewer";
    let filename = new URLSearchParams(window.location.search).get("filename");
    setpdfno(
      parseInt(new URLSearchParams(window.location.search).get("pdfno"))
    );
    setFileName(filename);
  }, []);

  useEffect(() => {
    async function fetchPdfData() {
      try {
        const response = await fetch("/api/pdf-results", { method: "POST" });
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Handle both array and object response
        let pdfInfo = null;
        if (Array.isArray(data)) {
          if (data.length > 0) pdfInfo = data[0];
        } else if (data?.pages) {
          pdfInfo = data;
        }
        setPdfData(pdfInfo);
      } catch (error) {
        console.error("Error fetching PDF data:", error);
        setPdfData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPdfData();
  }, [pdfno]);
  console.log(pdfData);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  const nextPage = () => {
    if (currentPageIndex < (pdfData?.pages?.length || 0) - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // Helper: convert color index to hex using color_dict
  const colorIdxToHex = (clrIdx) => {
    if (!pdfData?.color_dict) return "#000";
    for (const [colorInt, idx] of Object.entries(pdfData.color_dict)) {
      if (idx === clrIdx) {
        let hex = parseInt(colorInt).toString(16).padStart(6, "0");
        return "#" + hex;
      }
    }
    return "#000";
  };

  // Helper function to parse PDF font names for better style detection
  const parsePdfFontName = (pdfFontName) => {
    // Split font name by hyphen or underscore (common in PDF fonts)
    const parts = pdfFontName.split(/[-_]/);

    // The first part is usually the font family (e.g., "Courier")
    const fontFamily = parts[0] || "sans-serif";

    // Initialize CSS properties
    let fontWeight = "normal";
    let fontStyle = "normal";

    // Look for weight and style keywords in the rest of the parts
    parts.forEach((part) => {
      const lower = part.toLowerCase();
      if (lower.includes("bold")) fontWeight = "bold";
      if (lower.includes("oblique") || lower.includes("italic"))
        fontStyle = "italic";
    });

    return {
      fontFamily,
      fontWeight,
      fontStyle,
    };
  };

  // Helper: get style from style_dict with improved font name parsing
  const getStyleFromTS = (tsArr, page) => {
    let style = tsArr;
    if (typeof tsArr === "number" && Array.isArray(page?.style_dict)) {
      style = page.style_dict[tsArr];
    }
    if (Array.isArray(style) && style.length >= 4) {
      const [font, size, bold, italic] = style;

      // First apply style from font name parsing
      const parsedFont = parsePdfFontName(font || "");

      // Then override with explicit bold/italic flags if set
      return {
        fontFamily: parsedFont.fontFamily || "Helvetica, Arial, sans-serif",
        fontSize: size ? `${size * DISPLAY_SCALE}px` : "16px",
        fontWeight: bold === 1 ? "bold" : parsedFont.fontWeight,
        fontStyle: italic === 1 ? "italic" : parsedFont.fontStyle,
      };
    }
    return {};
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    
  };

  // Render content (SVG with text overlay)
  const renderContent = () => (
    <div className="page-content-container relative" ref={svgContainerRef}>

      {/* Render SVGs from the svgs array as background */}
      {Array.isArray(currentPage?.svgs) && currentPage.svgs.length > 0 ? (
        currentPage.svgs.map((svg, idx) => (
          <div
            key={`svg-${idx}`}
            className="page-svg-container"
            dangerouslySetInnerHTML={{ __html: svg.svg_content }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              transform: `scale(${DISPLAY_SCALE})`,
              transformOrigin: "top left",
              zIndex: 1,
            }}
          />
        ))
      ) : (
        <div className="page-no-svg-message flex items-center justify-center h-full">
          <div className="text-lg text-gray-500">No SVG content available</div>
        </div>
      )}

      {/* Text Overlay Layer with higher z-index */}
      <div
        className="page-text-overlay-layer absolute top-0 left-0 w-full h-full"
        style={{
          zIndex: 10,
          pointerEvents: editMode ? "auto" : "none",
        }}
      >
        {/* Render Texts from pdfData */}
        {Array.isArray(currentPage?.Texts) &&
          currentPage.Texts.map((text, idx) => (
            <div
              key={`text-overlay-${idx}`}
              className={`page-text-item page-text-${idx} ${editMode ? 'page-text-editable' : ''}`}
              contentEditable={editMode}
              style={{
                position: "absolute",
                left: toPx(text.x),
                top: toPx(text.y),
                width: toPx(text.w),
                color: colorIdxToHex(text.clr),
                textAlign: text.A || "left",
                whiteSpace: "pre",
                background: "white", // White background
                padding: "2px",
                borderRadius: "2px",
                boxShadow: editMode
                  ? "0 0 0 1px rgba(59, 130, 246, 0.5)"
                  : "none",
                cursor: editMode ? "text" : "default",
                userSelect: "text",
                zIndex: 10,
              }}
              onBlur={(e) => {
                if (editMode) {
                  console.log("Text edited:", e.currentTarget.outerHTML);
                }
              }}
            >
              {text.R?.map((run, rIdx) => (
                <span
                  key={rIdx}
                  className={`page-text-run page-text-run-${rIdx}`}
                  style={{
                    ...getStyleFromTS(run.TS, currentPage),
                  }}
                >
                  {run.T}
                </span>
              ))}
            </div>
          ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-2xl text-gray-600">Loading PDF...</div>
      </div>
    );
  }

  if (!pdfData || !pdfData.pages || pdfData.pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-2xl text-gray-600">No PDF data available</div>
      </div>
    );
  }

  const currentPage = pdfData.pages[currentPageIndex];
  const totalPages = pdfData.pages.length;

  // Use page Width/Height if present
  let pageWidth = currentPage?.Width || 800;
  let pageHeight = currentPage?.Height || 1100;

  // Scale for display
  const DISPLAY_SCALE = 1.5 * scale;

  // Helper: convert PDF points to px (if needed)
  const toPx = (pt) => pt * DISPLAY_SCALE;

  return (
    <div className="page-viewer-container min-h-screen bg-black">
      {/* Toolbar */}
      <div className="page-toolbar bg-gray-800 text-white p-4 shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto flex flex-row items-center justify-between">
          <div className="flex items-center min-w-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 mr-2 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ minWidth: 28 }}
            >
              <path
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span
              className="truncate font-extrabold text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 select-text tracking-wide"
              title={fileName}
              style={{ userSelect: "text" }}
            >
              {fileName || "Untitled"}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={prevPage}
              disabled={currentPageIndex === 0}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="inline-block">
              Page {currentPageIndex + 1} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPageIndex === totalPages - 1}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleZoomOut}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              -
            </button>
            <span className="inline-block">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              +
            </button>
          </div>
          {/* Add Edit Mode toggle button */}
          <button
            onClick={toggleEditMode}
            className={`px-3 py-1 rounded ${
              editMode
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {editMode ? "Save Changes" : "Edit Text"}
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div
        className="page-scroll-container overflow-auto p-6 text-center"
        style={{ paddingTop: "80px" }}
      >
        <div className="page-scaling-container flex justify-center">
          <div
            className="page-scale-wrapper relative transform origin-top inline-block mx-2 mb-6"
            style={{ transform: `scale(${scale})` }}
          >
            <div
              className="page-display bg-white shadow-lg rounded-sm overflow-hidden inline-block"
              style={{
                width: `${pageWidth * DISPLAY_SCALE}px`,
                minHeight: `${pageHeight * DISPLAY_SCALE}px`,
                position: "relative",
              }}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
