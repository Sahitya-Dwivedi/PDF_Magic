import React, { useState, useEffect } from "react";

const PdfViewer = () => {
  document.title = "PDF Magic - PDF Viewer";
  const [content, setContent] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [fileName, setFileName] = useState("New Text Document.pdf");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const pdf = new URLSearchParams(window.location.search);
    const pdfContent = pdf.get("content");
    const pdfName = pdf.get("filename");

    console.log(pdfContent);
    try {
      setFileName(pdfName);
      const parsedContent = JSON.parse(pdfContent);
      const contentArray = Array.isArray(parsedContent)
        ? parsedContent
        : [{ text: parsedContent }];
      setContent(contentArray);
    } catch (error) {
      console.error("Error parsing content:", error);
      setContent([{ text: "Error loading content" }]);
    }
  }, []);

  const handleContentChange = (e, index) => {
    if (!isEditing) return;

    const updatedContent = [...content];
    updatedContent[index].text = e.target.innerHTML;
    setContent(updatedContent);
  };

  const totalPages = content.length || 1;

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const toggleEditing = () => {
    setIsEditing((prev) => !prev);
  };

  const downloadContent = () => {
    const contentString = JSON.stringify(content);
    const blob = new Blob([contentString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "document-content.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col bg-gray-900">
      {/* Document toolbar */}
      <div className="flex items-center bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-3 text-white border-b border-purple-900 shadow-md">
        <div className="flex items-center">
          <button className="p-1.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg shadow-purple-900/30 mr-3 transition-all duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            {fileName}
          </span>
        </div>

        <div className="flex items-center ml-auto space-x-5">
          {/* Page navigation */}
          <div className="flex items-center bg-gray-800 rounded-full px-4 py-1.5 shadow-inner border border-gray-700">
            <button
              className="text-pink-400 hover:text-pink-300 mr-2 disabled:text-gray-600"
              onClick={prevPage}
              disabled={currentPage <= 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-sm font-medium text-white">
              {currentPage} <span className="text-gray-400">/</span>{" "}
              {totalPages}
            </span>
            <button
              className="text-pink-400 hover:text-pink-300 ml-2 disabled:text-gray-600"
              onClick={nextPage}
              disabled={currentPage >= totalPages}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center space-x-3 bg-gray-800 rounded-full px-4 py-1.5 shadow-inner border border-gray-700">
            <button
              className="text-purple-400 hover:text-purple-300 transition-colors"
              onClick={zoomOut}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="text-sm font-medium text-white">
              {Math.round(scale * 100)}%
            </span>
            <button
              className="text-purple-400 hover:text-purple-300 transition-colors"
              onClick={zoomIn}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {/* Additional controls */}
          <div className="flex items-center space-x-3">
            <button
              className={`p-2 rounded-full ${
                isEditing
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg shadow-purple-900/30"
                  : "bg-gray-800 hover:bg-gray-700"
              } transition-all duration-300`}
              onClick={toggleEditing}
              title={isEditing ? "Exit Editing Mode" : "Enter Editing Mode"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300"
              onClick={downloadContent}
              title="Download Document"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
            <button
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300"
              title="More Options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-pink-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Document content */}
      <div
        className="w-[794px] h-[1123px] m-auto my-3 px-6 py-8 text-2xl bg-white text-black whitespace-pre-wrap text-wrap font-medium "
        style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        onInput={(e) => handleContentChange(e, currentPage - 1)}
        contentEditable={isEditing}
      >
        {content.map((item, index) => (
          <div key={index} className="text-black text-2xl font-medium mb-4">
            {item}
          </div>
        ))}
      </div>

      {/* Editing mode indicator */}
      {isEditing && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-1.5 px-4 text-sm rounded-full shadow-lg shadow-purple-500/30 animate-pulse">
          Editing Mode
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
