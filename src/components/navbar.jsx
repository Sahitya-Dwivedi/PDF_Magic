import { useState } from "react";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 px-6 py-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">PDF Magic</span>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <a href="#" className="hover:text-purple-400 transition-colors">Home</a>
          <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Tutorials</a>
          <a href="#" className="hover:text-purple-400 transition-colors">About</a>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-full font-medium transition-all transform hover:scale-105">
            Sign In
          </button>
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 pt-2 space-y-3">
          <a href="#" className="block px-4 py-2 hover:bg-gray-800 rounded-md">Home</a>
          <a href="#features" className="block px-4 py-2 hover:bg-gray-800 rounded-md">Features</a>
          <a href="#" className="block px-4 py-2 hover:bg-gray-800 rounded-md">Tutorials</a>
          <a href="#" className="block px-4 py-2 hover:bg-gray-800 rounded-md">About</a>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
