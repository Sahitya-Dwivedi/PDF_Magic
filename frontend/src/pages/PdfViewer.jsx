import React, { useEffect, useState } from "react";

const PdfViewer = () => {
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [fileName, setFileName] = useState("");
  const [pdfno, setpdfno] = useState(0);

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
        const response = await fetch("/api/pdf-results",{method:"POST"});
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
  console.log(pdfData)

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  const nextPage = () => {
    if (currentPageIndex < ((pdfData?.pages?.length) || 0) - 1) {
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
    const fontFamily = parts[0] || 'sans-serif';

    // Initialize CSS properties
    let fontWeight = 'normal';
    let fontStyle = 'normal';

    // Look for weight and style keywords in the rest of the parts
    parts.forEach(part => {
      const lower = part.toLowerCase();
      if (lower.includes('bold')) fontWeight = 'bold';
      if (lower.includes('oblique') || lower.includes('italic')) fontStyle = 'italic';
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
      const parsedFont = parsePdfFontName(font || '');
      
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

  // Render HLines, VLines, Fills
  const renderExtras = () => (
    <>
      {Array.isArray(currentPage?.HLines) &&
        currentPage.HLines.map((line, i) => (
          <div
            key={`hline-${i}`}
            style={{
              position: "absolute",
              left: toPx(line.x),
              top: toPx(line.y),
              width: toPx(line.l),
              height: toPx(line.w || 2),
              background: colorIdxToHex(line.clr),
              opacity: 0.7,
              pointerEvents: "none",
              borderRadius: 1,
              borderBottom: line.dsh === 1 ? "1px dashed #000" : undefined,
            }}
          />
        ))}
      {Array.isArray(currentPage?.VLines) &&
        currentPage.VLines.map((line, i) => (
          <div
            key={`vline-${i}`}
            style={{
              position: "absolute",
              left: toPx(line.x),
              top: toPx(line.y),
              width: toPx(line.w || 2),
              height: toPx(line.l),
              background: colorIdxToHex(line.clr),
              opacity: 0.7,
              pointerEvents: "none",
              borderRadius: 1,
              borderRight: line.dsh === 1 ? "1px dashed #000" : undefined,
            }}
          />
        ))}
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
              background: colorIdxToHex(fill.clr),
              opacity: 0.3,
              pointerEvents: "none",
            }}
          />
        ))}
    </>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Toolbar */}
      <div className="bg-gray-800 text-white p-4 shadow-md fixed top-0 left-0 right-0 z-10">
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
        </div>
      </div>
      {/* PDF Content */}
      <div
        className="overflow-auto p-6 text-center"
        style={{ paddingTop: "80px" }}
      >
        <div
          className="relative transform origin-top inline-block"
          style={{ transform: `scale(${scale})` }}
        >
          <div
            className="bg-white shadow-lg rounded-sm overflow-hidden inline-block"
            style={{
              width: `${pageWidth * DISPLAY_SCALE}px`,
              minHeight: `${pageHeight * DISPLAY_SCALE}px`,
              position: "relative",
            }}
          >
            {/* Render extras (lines, fills, etc) */}
            {renderExtras()}
            {/* Render Texts */}
            {currentPage?.Texts?.map((text, idx) => (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: toPx(text.x),
                  top: toPx(text.y),
                  width: toPx(text.w),
                  color: colorIdxToHex(text.clr),
                  textAlign: text.A || "left",
                  whiteSpace: "pre",
                  pointerEvents: "auto",
                  userSelect: "text",
                }}
              >
                {text.R?.map((run, rIdx) => (
                  <span
                    key={rIdx}
                    style={{
                      ...getStyleFromTS(run.TS, currentPage),
                    }}
                  >
                    {run.T}
                  </span>
                ))}
              </div>
            ))}
            {/* Render images */}
            {currentPage?.images?.map((img, idx) => (
              <img
                key={idx}
                src={`data:image/${img.ext};base64,${img.base64}`}
                alt={`img-${img.xref}`}
                style={{
                  position: "absolute",
                  left: 40,
                  top: 40 + idx * (img.height * DISPLAY_SCALE + 10),
                  width: img.width * DISPLAY_SCALE,
                  height: img.height * DISPLAY_SCALE,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  background: "#eee",
                }}
              />
            ))}
            {/* Optionally, render font info */}
            {/* <pre style={{position:"absolute",bottom:0,left:0,background:"#fff8",fontSize:12}}>
              {JSON.stringify(currentPage.fonts, null, 2)}
            </pre> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
