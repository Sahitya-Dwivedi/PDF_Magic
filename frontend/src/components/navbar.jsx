import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.documentElement.style.scroll;
  }, []);

  return (
    <nav
      className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 px-6 shadow-lg"
      style={{ height: "77.19px" }}
    >
      <div className="container mx-auto flex justify-between items-center h-full">
        <div className="flex items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            PDF Magic
          </span>
        </div>

        <div className="hidden md:flex space-x-8">
          <Link
            to="/home"
            className="relative hover:text-purple-400 transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-purple-400 after:transition-all after:duration-300 hover:after:w-full"
          >
            Home
          </Link>
          <Link
            to="#features"
            className="relative hover:text-purple-400 transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-purple-400 after:transition-all after:duration-300 hover:after:w-full"
            hidden={window.location.pathname === "/pdfviewer" ? true : false}
          >
            Features
          </Link>
          <Link
            to="/about"
            className="relative hover:text-purple-400 transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-purple-400 after:transition-all after:duration-300 hover:after:w-full"
          >
            About
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Substitute for removed Sign In button to preserve spacing */}
          <div style={{ width: "120px" }} />
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 pt-2 space-y-3">
          <Link
            to="#home"
            className="block px-4 py-2 hover:bg-gray-800 rounded-md relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-purple-400 after:transition-all after:duration-300 hover:after:w-full"
          >
            Home
          </Link>
          <Link
            to="#features"
            className="block px-4 py-2 hover:bg-gray-800 rounded-md relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-purple-400 after:transition-all after:duration-300 hover:after:w-full"
          >
            Features
          </Link>
          <Link
            to="#tutorials"
            className="block px-4 py-2 hover:bg-gray-800 rounded-md relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-purple-400 after:transition-all after:duration-300 hover:after:w-full"
          >
            Tutorials
          </Link>
          <Link
            to="#about"
            className="block px-4 py-2 hover:bg-gray-800 rounded-md relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-purple-400 after:transition-all after:duration-300 hover:after:w-full"
          >
            About
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
