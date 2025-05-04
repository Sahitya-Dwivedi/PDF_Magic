import { useState, useEffect } from "react";

function Hero() {
  const [showOptions, setShowOptions] = useState(false);
  const [animateModal, setAnimateModal] = useState(false);

  useEffect(() => {
    if (showOptions) {
      // Trigger animation after modal is shown
      const timer = setTimeout(() => setAnimateModal(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimateModal(false);
    }
  }, [showOptions]);

  return (
    <div className="flex-1">
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
                onClick={() => console.log("Edit PDF clicked")}
              >
                Upload PDF
              </button>
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
                  onClick={() => console.log("Text to PDF clicked")}
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
                  onClick={() => console.log("Photo to PDF clicked")}
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
      </div>
    </div>
  );
}

export default Hero;
