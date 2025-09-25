function Features() {
  return (
    <div id="features" className="bg-gray-900/50 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Powerful Features
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Merge PDFs",
              description: "Combine multiple PDFs into a single document",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )
            },
            {
              title: "TEXT to PDF",
              description: "Convert your TEXT files into PDF documents",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* New SVG for TXT to PDF */}
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <text x="7" y="13" fontSize="6" fill="currentColor" fontFamily="monospace">TXT</text>
                  <path d="M8 17h8M12 17v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )
            },
            {
              title: "Text Edit",
              description: "Add or modify text content in your PDF documents",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )
            }
          ].map((feature, index) => (
            <div key={index} className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-all hover:shadow-purple-500/10">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-full mb-4">
                <div className="text-purple-400">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Features;
