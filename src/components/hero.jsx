function Hero() {
  return (
    <div className="flex-1">
      <div className="container mx-auto px-6 py-16 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Your PDF, Your Way
          </span>
        </h1>
        <p className="text-xl text-gray-300 text-center max-w-2xl mb-10">
          Create, edit, and transform your PDFs with our powerful yet easy-to-use tools
        </p>
        
        {/* Main action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <div className="bg-gray-800/60 hover:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-xl transition-all hover:shadow-purple-500/20 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">Create PDF</h2>
              <p className="text-gray-300 text-center mb-6">
                Start from scratch or convert existing documents to PDF format
              </p>
              <button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-medium transition-all"
                onClick={() => console.log("Create PDF clicked")}
              >
                Get Started
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800/60 hover:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-xl transition-all hover:shadow-purple-500/20 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
      </div>
    </div>
  );
}

export default Hero;
