import { useState, useEffect, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import MyDoc from "../components/CreatePDF";

function Hero() {
  // Modal visibility states
  const [showOptions, setShowOptions] = useState(false);
  const [showEditPdfModal, setShowEditPdfModal] = useState(false);
  const [showTextToPdfModal, setShowTextToPdfModal] = useState(false);
  const [showPhotoToPdfModal, setShowPhotoToPdfModal] = useState(false);
  const [showPdfResultModal, setShowPdfResultModal] = useState(false);
  // Animation state
  const [animateModal, setAnimateModal] = useState(false);

  // File content states
  const [selectedTextFileName, setSelectedTextFileName] = useState("");
  const [selectedPhotoFileName, setSelectedPhotoFileName] = useState("");
  const [textContent, setTextContent] = useState("");
  const [photoContent, setPhotoContent] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");

  // Processing state
  const [isConverting, setIsConverting] = useState(false);
  const [isParsingPdf, setIsParsingPdf] = useState(false);

  // Pdf count state
  const [pdfCount, setPdfCount] = useState(0);
  // Refs for file inputs
  const pdfFileInputRef = useRef(null);
  const textFileInputRef = useRef(null);
  const photoFileInputRef = useRef(null);

  useEffect(() => {
    if (showOptions) {
      // Trigger animation after modal is shown
      const timer = setTimeout(() => setAnimateModal(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimateModal(false);
    }
  }, [showOptions]);
  useEffect(() => {
    (async () => {
      await fetch("/api/clear-memo", { method: "POST" })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            console.error("Error clearing memo");
          }
        })
        .then((data) => {
          console.log("Memo cleared successfully:", data);
        })
        .catch((error) => {
          console.error("Error clearing memo:", error);
        });
    })();
  }, []);

  const handleEditPdfClick = () => {
    // Open file dialog for PDF selection
    if (pdfFileInputRef.current) {
      pdfFileInputRef.current.value = "";
      pdfFileInputRef.current.click();
    }
  };

  // Handle PDF file selection, send to backend, and open viewer
  const handlePdfFileSelected = async (e) => {
    const file = e.target.files && e.target.files[0];
    const fileName = file && file.name;
    if (!file) return;
    setIsParsingPdf(true); // Show parsing overlay
    // Send PDF blob to backend
    const sendToBackend = async () => {
      const formData = new FormData();
      formData.append("pdfBlob", file);
      try {
        await fetch("/api/pdf", {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            console.log("PDF sent to backend successfully");
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Response from backend:", data);
            // Open PDF in a new tab
            window.open(
              `/pdfviewer?filename=${fileName}&pdfno=${pdfCount}`,
              "_blank"
            );
          })
          .catch((error) => {
            console.error("Error sending PDF to backend:", error);
          });
      } catch (error) {
        console.error("Error sending PDF to backend:", error);
      } finally {
        setIsParsingPdf(false); // Hide parsing overlay
      }
    };
    await sendToBackend();
    // Open the PDF viewer page
    setPdfCount((prevCount) => prevCount + 1);
  };

  const handleTextToPdfClick = () => {
    setShowOptions(false);
    setShowTextToPdfModal(true);
  };

  const handlePhotoToPdfClick = () => {
    setShowOptions(false);
    setShowPhotoToPdfModal(true);
  };

  const handleTextFileSelected = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedTextFileName(file.name);

      // Read the file content
      const reader = new FileReader();
      reader.onload = (event) => {
        setTextContent(event.target.result);
      };
      reader.readAsText(file);

      return file;
    }
  };

  const handlePhotoFileSelected = (e) => {
    const files = Object.values(e.target.files);
    if (files && files.length > 0) {
      if (files.length < 3)
        setSelectedPhotoFileName(files.map((file) => file.name).join(", "));
      else
        setSelectedPhotoFileName(
          files
            .map((file, i) => (i < 2 ? file.name : undefined))
            .filter((value) => value !== undefined)
            .join(", ") + " and more..."
        );
      const reader = files.map((file) => URL.createObjectURL(file));
      setPhotoContent(reader);

      return files;
    }
  };

  const convertTextToPdf = async () => {
    if (!textContent || !selectedTextFileName) {
      console.error("No file or content available");
      return;
    }

    setIsConverting(true);

    try {
      const blob = await pdf(
        <MyDoc content={textContent} contentType={"Text"} />
      ).toBlob();
      const url = URL.createObjectURL(blob);

      // Store the blob and URL in state
      setPdfBlob(blob);
      setPdfUrl(url);

      // Hide the text-to-pdf modal and show the result modal
      setShowTextToPdfModal(false);
      setShowPdfResultModal(true);
      setIsConverting(false);
    } catch (error) {
      console.error("Error converting PDF:", error);
      setIsConverting(false);
    }
  };

  const convertPhotoToPdf = async () => {
    setIsConverting(true);

    try {
      const blob = await pdf(
        <MyDoc content={photoContent} contentType={"Image"} />
      ).toBlob();
      const url = URL.createObjectURL(blob);

      // Store the blob and URL in state
      setPdfBlob(blob);
      setPdfUrl(url);

      // Hide the photo-to-pdf modal and show the result modal
      setShowPhotoToPdfModal(false);
      setShowPdfResultModal(true);
      setIsConverting(false);
    } catch (error) {
      console.error("Error converting PDF:", error);
      setIsConverting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfBlob) return;

    const fileName = selectedTextFileName.replace(/\.[^/.]+$/, ".pdf");
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = fileName;
    a.click();

    // Clean up after download
    setTimeout(() => {
      setShowPdfResultModal(false);
      resetPdfStates();
    }, 500);
  };
  function handleViewPdf() {
    console.log("fd");
    console.log("PDF URL:", pdfUrl);
    if (!pdfUrl) return;
    // Open PDF in a new tab
    const sendToBackend = async () => {
      const formData = new FormData();
      formData.append("pdfBlob", pdfBlob);
      let data = await fetch("/api/pdf", {
        method: "POST",
        body: formData, // Send the raw blob
      });
      let response = await data.json();
      console.log(response);
      if (response.ok) {
        console.log(response);
        console.log("PDF sent to backend successfully");
      } else {
        console.error("Error sending PDF to backend");
      }
    };
    sendToBackend();
    // Open the PDF viewer page
    window.open(
      `/pdfviewer?filename=${selectedTextFileName}&pdfno=${pdfCount}`,
      "_blank"
    );
    setPdfCount((prevCount) => prevCount + 1);
  }

  const resetPdfStates = () => {
    // Clean up URL object to prevent memory leaks
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);

    setPdfBlob(null);
    setPdfUrl("");
    setSelectedTextFileName("");
    setSelectedPhotoFileName("");
    setTextContent("");
    setPhotoContent("");
    if (textFileInputRef.current) {
      textFileInputRef.current.value = "";
    }
    if (photoFileInputRef.current) {
      photoFileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex-1">
      {/* PDF Parsing Overlay */}
      {isParsingPdf && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
          <div className="flex flex-col items-center">
            {/* Custom loader */}
            <style>
              {`
              .loader {
                position: relative;
                width: 85px;
                height: 50px;
                background-repeat: no-repeat;
                background-image: linear-gradient(#FFF 50px, transparent 0),
                                  linear-gradient(#FFF 50px, transparent 0),
                                  linear-gradient(#FFF 50px, transparent 0),
                                  linear-gradient(#FFF 50px, transparent 0),
                                  linear-gradient(#FFF 50px, transparent 0),
                                  linear-gradient(#FFF 50px, transparent 0);
                background-position: 0px center, 15px center, 30px center, 45px center, 60px center, 75px center, 90px center;
                animation: rikSpikeRoll 0.65s linear infinite alternate;
              }
              @keyframes rikSpikeRoll {
                0% { background-size: 10px 3px;}
                16% { background-size: 10px 50px, 10px 3px, 10px 3px, 10px 3px, 10px 3px, 10px 3px}
                33% { background-size: 10px 30px, 10px 50px, 10px 3px, 10px 3px, 10px 3px, 10px 3px}
                50% { background-size: 10px 10px, 10px 30px, 10px 50px, 10px 3px, 10px 3px, 10px 3px}
                66% { background-size: 10px 3px, 10px 10px, 10px 30px, 10px 50px, 10px 3px, 10px 3px}
                83% { background-size: 10px 3px, 10px 3px,  10px 10px, 10px 30px, 10px 50px, 10px 3px}
                100% { background-size: 10px 3px, 10px 3px, 10px 3px,  10px 10px, 10px 30px, 10px 50px}
              }
              `}
            </style>
            <span className="loader mb-8"></span>
            <div className="text-xl font-semibold text-purple-200 mb-2">
              Parsing your PDF...
            </div>
            <div className="text-gray-400 text-center max-w-xs">
              This may take a few seconds for large or complex files.
            </div>
          </div>
        </div>
      )}
      <div className="container w-screen mx-auto px-6 py-16 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Your PDF, Your Way
          </span>
        </h1>
        <p className="text-xl text-gray-300 text-center max-w-2xl mb-10">
          Create, edit, and transform your PDFs with our powerful yet
          easy-to-use tools
        </p>

        {/* Main action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <div className="bg-gray-800/60 hover:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-xl transition-all hover:shadow-purple-500/20 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-full mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">Create PDF</h2>
              <p className="text-gray-300 text-center mb-6">
                Start from scratch or convert existing documents to PDF format
              </p>
              <button
                className="Get-Started bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-medium transition-all"
                onClick={() => setShowOptions(true)}
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="bg-gray-800/60 hover:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-xl transition-all hover:shadow-purple-500/20 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-full mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">Edit PDF</h2>
              <p className="text-gray-300 text-center mb-6">
                Modify existing PDFs with our full suite of editing tools
              </p>
              <button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-medium transition-all"
                onClick={handleEditPdfClick}
              >
                Upload PDF
              </button>
              <input
                type="file"
                ref={pdfFileInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handlePdfFileSelected}
              />
            </div>
          </div>
        </div>

        {showOptions && (
          <div className="absolute top-1/2 left-1/2 -translate-1/2 flex w-screen h-screen items-center justify-center z-50">
            <div
              className={`bg-gray-800 border border-purple-500/30 rounded-xl p-6 w-1/2 h-1/2 shadow-2xl shadow-purple-500/20 transform transition-all duration-300 ${
                animateModal ? "scale-100 opacity-100" : "scale-90 opacity-0"
              }`}
              onClick={(e) => e.stopPropagation()}
              style={{ backdropFilter: "blur(12px)" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                  Choose Conversion Type
                </h3>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowOptions(false)}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <button
                  className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl p-5 cursor-pointer transition-all flex flex-col items-center shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 border border-purple-500/30 hover:border-pink-400/50 transform hover:scale-105 duration-300"
                  onClick={handleTextToPdfClick}
                >
                  <div className="bg-white/10 p-4 rounded-full mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="font-semibold text-lg text-white">
                    Text to PDF
                  </span>
                  <span className="text-white/80 text-sm mt-1">
                    Convert documents to PDF
                  </span>
                </button>

                <button
                  className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl p-5 cursor-pointer transition-all flex flex-col items-center shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30 border border-purple-500/30 hover:border-pink-400/50 transform hover:scale-105 duration-300"
                  onClick={handlePhotoToPdfClick}
                >
                  <div className="bg-white/10 p-4 rounded-full mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="font-semibold text-lg text-white">
                    Photo to PDF
                  </span>
                  <span className="text-white/80 text-sm mt-1">
                    Convert images to PDF
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Text to PDF Modal */}
        {showTextToPdfModal && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowTextToPdfModal(false)}
          >
            <div
              className="bg-gray-800 border border-purple-500/30 rounded-xl p-8 w-full max-w-md transform transition-all shadow-2xl shadow-purple-500/20"
              onClick={(e) => e.stopPropagation()}
              style={{ backdropFilter: "blur(12px)" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                  Select Text Document
                </h3>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowTextToPdfModal(false)}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-700/40 border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center">
                  {selectedTextFileName ? (
                    <div className="flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-green-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-gray-300 mb-2 font-medium">
                        File Selected:
                      </p>
                      <p className="text-purple-300 mb-4 text-lg">
                        {selectedTextFileName}
                      </p>
                      <button
                        className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-full font-medium transition-all text-sm"
                        onClick={() => {
                          setSelectedTextFileName("");
                          textFileInputRef.current.value = "";
                        }}
                      >
                        Change File
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-purple-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-gray-300 mb-2">
                        Drag & drop your text file here
                      </p>
                      <p className="text-gray-400 text-sm mb-4">or</p>
                      <input
                        type="file"
                        ref={textFileInputRef}
                        className="hidden"
                        accept=".txt,.doc,.docx,.rtf,.odt"
                        onChange={handleTextFileSelected}
                      />
                      <button
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-medium transition-all"
                        onClick={() => textFileInputRef.current.click()}
                      >
                        Browse Files
                      </button>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-all"
                    onClick={() => setShowTextToPdfModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-lg transition-all ${
                      !selectedTextFileName || isConverting
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={convertTextToPdf}
                    disabled={!selectedTextFileName || isConverting}
                  >
                    {isConverting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Converting...
                      </span>
                    ) : (
                      "Convert"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo to PDF Modal */}
        {showPhotoToPdfModal && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowPhotoToPdfModal(false)}
          >
            <div
              className="bg-gray-800 border border-purple-500/30 rounded-xl p-8 w-full max-w-md transform transition-all shadow-2xl shadow-purple-500/20"
              onClick={(e) => e.stopPropagation()}
              style={{ backdropFilter: "blur(12px)" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                  Select Image
                </h3>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowPhotoToPdfModal(false)}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-700/40 border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center">
                  {selectedPhotoFileName ? (
                    <div className="flex flex-col items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-green-400 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-gray-300 mb-2 font-medium">
                        Image Selected:
                      </p>
                      <p className="text-purple-300 mb-4 text-lg">
                        {selectedPhotoFileName}
                      </p>
                      <button
                        className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-full font-medium transition-all text-sm"
                        onClick={() => {
                          setSelectedPhotoFileName("");
                          setPhotoContent("");
                          photoFileInputRef.current.value = "";
                        }}
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-purple-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-300 mb-2">
                        Drag & drop your image here
                      </p>
                      <p className="text-gray-400 text-sm mb-4">or</p>
                      <input
                        type="file"
                        ref={photoFileInputRef}
                        className="hidden"
                        accept="image/*"
                        multiple={true}
                        onChange={handlePhotoFileSelected}
                      />
                      <button
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-medium transition-all"
                        onClick={() => photoFileInputRef.current.click()}
                      >
                        Browse Images
                      </button>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-all"
                    onClick={() => setShowPhotoToPdfModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-lg transition-all ${
                      !selectedPhotoFileName || isConverting
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={convertPhotoToPdf}
                    disabled={!selectedPhotoFileName || isConverting}
                  >
                    {isConverting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Converting...
                      </span>
                    ) : (
                      "Convert"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Result Modal */}
        {showPdfResultModal && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => {
              setShowPdfResultModal(false);
              resetPdfStates();
            }}
          >
            <div
              className="bg-gray-800 border border-purple-500/30 rounded-xl p-8 w-full max-w-md transform transition-all shadow-2xl shadow-purple-500/20"
              onClick={(e) => e.stopPropagation()}
              style={{ backdropFilter: "blur(12px)" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                  PDF Successfully Created!
                </h3>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => {
                    setShowPdfResultModal(false);
                    resetPdfStates();
                  }}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-700/40 rounded-lg p-8 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-green-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-300 mb-2 font-medium">
                    Your PDF is ready!
                  </p>
                  <p className="text-purple-300 mb-4">
                    {selectedTextFileName.replace(/\.[^/.]+$/, ".pdf")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-all flex items-center justify-center"
                    onClick={handleViewPdf}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View PDF
                  </button>
                  <button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg transition-all flex items-center justify-center"
                    onClick={handleDownloadPdf}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
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
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit PDF Modal */}
        {showEditPdfModal && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowEditPdfModal(false)}
          >
            <div
              className="bg-gray-800 border border-purple-500/30 rounded-xl p-8 w-full max-w-md transform transition-all shadow-2xl shadow-purple-500/20"
              onClick={(e) => e.stopPropagation()}
              style={{ backdropFilter: "blur(12px)" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                  Select PDF to Edit
                </h3>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowEditPdfModal(false)}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-700/40 border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-purple-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-gray-300 mb-2">
                    Drag & drop your PDF file here
                  </p>
                  <p className="text-gray-400 text-sm mb-4">or</p>
                  <input
                    type="file"
                    ref={pdfFileInputRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={handlePdfFileSelected}
                  />
                  <button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-medium transition-all"
                    onClick={() => pdfFileInputRef.current.click()}
                  >
                    Browse Files
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-all"
                    onClick={() => setShowEditPdfModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 rounded-lg transition-all"
                    onClick={() => {}}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Hero;
