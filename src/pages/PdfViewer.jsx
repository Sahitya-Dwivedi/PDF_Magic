import React, { useEffect, useState } from "react";

// Color Dictionary
const kColors = [
  "#000000", // 0
  "#ffffff", // 1
  "#4c4c4c", // 2
  "#808080", // 3
  "#999999", // 4
  "#c0c0c0", // 5
  "#cccccc", // 6
  "#e5e5e5", // 7
  "#f2f2f2", // 8
  "#008000", // 9
  "#00ff00", // 10
  "#bfffa0", // 11
  "#ffd629", // 12
  "#ff99cc", // 13
  "#004080", // 14
  "#9fc0e1", // 15
  "#5580ff", // 16
  "#a9c9fa", // 17
  "#ff0080", // 18
  "#800080", // 19
  "#ffbfff", // 20
  "#e45b21", // 21
  "#ffbfaa", // 22
  "#008080", // 23
  "#ff0000", // 24
  "#fdc59f", // 25
  "#808000", // 26
  "#bfbf00", // 27
  "#824100", // 28
  "#007256", // 29
  "#008000", // 30
  "#000080", // Last + 1
  "#008080", // Last + 2
  "#800080", // Last + 3
  "#ff0000", // Last + 4
  "#0000ff", // Last + 5
  "#008000", // Last + 6
  "#000000", // Last + 7
];

// Font Face Dictionary
const kFontFaces = [
  "QuickType,Arial,Helvetica,sans-serif", // 00 - QuickType - sans-serif variable font
  "QuickType Condensed,Arial Narrow,Arial,Helvetica,sans-serif", // 01 - QuickType Condensed - thin sans-serif variable font
  "QuickTypePi", // 02 - QuickType Pi
  "QuickType Mono,Courier New,Courier,monospace", // 03 - QuickType Mono - san-serif fixed font
  "OCR-A,Courier New,Courier,monospace", // 04 - OCR-A - OCR readable san-serif fixed font
  "OCR B MT,Courier New,Courier,monospace", // 05 - OCR-B MT - OCR readable san-serif fixed font
];

// Font Style Dictionary
const kFontStyles = [
  // Face  Size Bold Italic  StyleID(Comment)
  // ----- ---- ---- -----  -----------------
  [0, 6, 0, 0], //00
  [0, 8, 0, 0], //01
  [0, 10, 0, 0], //02
  [0, 12, 0, 0], //03
  [0, 14, 0, 0], //04
  [0, 18, 0, 0], //05
  [0, 6, 1, 0], //06
  [0, 8, 1, 0], //07
  [0, 10, 1, 0], //08
  [0, 12, 1, 0], //09
  [0, 14, 1, 0], //10
  [0, 18, 1, 0], //11
  [0, 6, 0, 1], //12
  [0, 8, 0, 1], //13
  [0, 10, 0, 1], //14
  [0, 12, 0, 1], //15
  [0, 14, 0, 1], //16
  [0, 18, 0, 1], //17
  [0, 6, 1, 1], //18
  [0, 8, 1, 1], //19
  [0, 10, 1, 1], //20
  [0, 12, 1, 1], //21
  [0, 14, 1, 1], //22
  [0, 18, 1, 1], //23
  [1, 6, 0, 0], //24
  [1, 8, 0, 0], //25
  [1, 10, 0, 0], //26
  [1, 12, 0, 0], //27
  [1, 14, 0, 0], //28
  [1, 18, 0, 0], //29
  [1, 6, 1, 0], //30
  [1, 8, 1, 0], //31
  [1, 10, 1, 0], //32
  [1, 12, 1, 0], //33
  [1, 14, 1, 0], //34
  [1, 18, 1, 0], //35
  [1, 6, 0, 1], //36
  [1, 8, 0, 1], //37
  [1, 10, 0, 1], //38
  [1, 12, 0, 1], //39
  [1, 14, 0, 1], //40
  [1, 18, 0, 1], //41
  [2, 8, 0, 0], //42
  [2, 10, 0, 0], //43
  [2, 12, 0, 0], //44
  [2, 14, 0, 0], //45
  [2, 12, 0, 0], //46
  [3, 8, 0, 0], //47
  [3, 10, 0, 0], //48
  [3, 12, 0, 0], //49
  [4, 12, 0, 0], //50
  [0, 9, 0, 0], //51
  [0, 9, 1, 0], //52
  [0, 9, 0, 1], //53
  [0, 9, 1, 1], //54
  [1, 9, 0, 0], //55
  [1, 9, 1, 0], //56
  [1, 9, 1, 1], //57
  [4, 10, 0, 0], //58
  [5, 10, 0, 0], //59
  [5, 12, 0, 0], //60
];

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

  // Helper to get color from color dictionary, oc, or fallback
  const getColorFromDict = (clr, oc) => {
    if (typeof clr === "number" && clr >= 0 && clr < kColors.length) {
      return kColors[clr];
    }
    if (Array.isArray(oc) && oc.length === 3) {
      return `rgb(${oc[0]},${oc[1]},${oc[2]})`;
    }
    if (typeof oc === "string") {
      return oc;
    }
    return "#000000";
  };

  // Function to convert color value to CSS color (for text)
  const getTextColor = (clr, oc) => getColorFromDict(clr, oc);

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

  // Function to resolve TS (Text Style) array, supporting both direct array and style index
  const resolveTS = (ts) => {
    if (Array.isArray(ts)) return ts;
    if (typeof ts === "number" && ts >= 0 && ts < kFontStyles.length) {
      return kFontStyles[ts];
    }
    return undefined;
  };

  // Function to get font size from TS array
  const getFontSize = (run) => {
    const ts = resolveTS(run?.TS);
    if (ts && ts.length >= 2 && ts[1]) {
      return `${ts[1] * PT_TO_PX}px`;
    }
    return "17px"; // Default font size if not specified
  };

  // Function to get numerical font size value (without 'px' suffix)
  const getNumericFontSize = (run) => {
    const ts = resolveTS(run?.TS);
    if (ts && ts.length >= 2 && ts[1]) {
      return ts[1] * PT_TO_PX;
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

  // Function to apply style based on TS array (bold/italic from TS[2]/TS[3])
  const getStyleFromTS = (ts, s) => {
    const styleArr = resolveTS(ts);
    if (!styleArr || styleArr.length < 4) return {};
    return {
      fontWeight: styleArr[2] === 1 ? "bold" : "normal",
      fontStyle: styleArr[3] === 1 ? "italic" : "normal",
      textDecoration: s === 4 ? "underline" : undefined, // S=4 for underline
    };
  };

  // Optionally map font IDs to font families (customize as needed)
  const fontIdToFamily = (fontId) => {
    if (
      typeof fontId === "number" &&
      fontId >= 0 &&
      fontId < kFontFaces.length
    ) {
      return kFontFaces[fontId];
    }
    return "Helvetica, Arial, sans-serif";
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

      if (lastY === null) {
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
              left: toPx(line.x),
              top: toPx(line.y),
              width: line.l ? toPx(line.l) : 0,
              height: line.w ? toPx(line.w) : 2,
              background: getColorFromDict(line.clr, line.oc),
              opacity: 0.7,
              pointerEvents: "none",
              borderRadius: 1,
              borderBottom: line.dsh === 1 ? "1px dashed #000" : undefined,
              border: line.dsh === 1 ? undefined : undefined,
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
              left: toPx(line.x),
              top: toPx(line.y),
              width: line.w ? toPx(line.w) : 2,
              height: line.l ? toPx(line.l) : 0,
              background: getColorFromDict(line.clr, line.oc),
              opacity: 0.7,
              pointerEvents: "none",
              borderRadius: 1,
              borderRight: line.dsh === 1 ? "1px dashed #000" : undefined,
              border: line.dsh === 1 ? undefined : undefined,
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
              background: getColorFromDict(fill.clr, fill.oc),
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
      <div className="overflow-auto p-6 text-center" style={{ paddingTop: "80px" }}>
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
                className={`font-['Helvetica',sans-serif] ${getTextAlignmentClass(
                  text.A
                )}`}
                style={{
                  position: "absolute",
                  left: toPx(text.x),
                  top: toPx(text.y),
                  color: getTextColor(text.clr, text.oc),
                  textAlign: text.A,
                  width: text.w ? toPx(text.w) : "auto",
                  // Optionally set background: "transparent"
                }}
              >
                {text.R?.map((run, rIndex) => {
                  const ts = resolveTS(run.TS);
                  // Add rotation style if run.RA is present
                  const rotationStyle =
                    typeof run.RA === "number"
                      ? { display: "inline-block", transform: `rotate(${run.RA}deg)` }
                      : {};
                  return (
                    <span
                      key={rIndex}
                      style={{
                        fontFamily:
                          ts && ts.length > 0
                            ? fontIdToFamily(ts[0])
                            : undefined,
                        fontSize: getFontSize(run),
                        lineHeight: getLineHeight(run),
                        ...getStrokeStyle(text.sw),
                        ...getStyleFromTS(run.TS, run.S),
                        ...rotationStyle,
                      }}
                    >
                      {decodeText(run.T)}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
