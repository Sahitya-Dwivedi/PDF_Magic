import React, { useEffect, useState } from "react";
import testData from './Untitled-1.json'; // Import test data as fallback

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

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  
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
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* PDF Toolbar */}
      <div className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={prevPage} 
              disabled={currentPageIndex === 0}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {currentPageIndex + 1} of {totalPages}</span>
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
            <span>{Math.round(scale * 100)}%</span>
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
      <div className="flex-1 overflow-auto p-6 flex justify-center">
        <div className="relative transform origin-top-center" style={{ transform: `scale(${scale})` }}>
          {/* PDF Page */}
          <div 
            className="bg-white shadow-lg rounded-sm overflow-hidden"
            style={{ 
              width: '794px',  // A4 width at 96dpi
              minHeight: '1123px', // A4 height at 96dpi
              padding: '48px',
            }}
          >
            {paragraphs.map((paragraph, pIndex) => (
              <div 
                key={pIndex} 
                className={`${paragraph.length === 0 ? 'h-4' : 'mb-4'}`}
              >
                {paragraph.map((text, tIndex) => (
                  <span 
                    key={`${pIndex}-${tIndex}`}
                    className="text-black text-[17px] leading-relaxed font-['Helvetica',sans-serif]"
                    style={{
                      fontWeight: text.sw > 0.4 ? 'bold' : 'normal',
                      // fontSize: `${text.TS[2]}px`,
                      // Add any other styles based on text properties
                    }}
                  >
                    {text.R?.map((run, rIndex) => (
                      <span key={rIndex}>
                        {decodeText(run.T)}
                      </span>
                    ))}
                    {tIndex < paragraph.length - 1 ? ' ' : ''}
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
