import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import About from "./pages/about";
import Footer from "./components/footer";
import PdfViewer from "./pages/PdfViewer";

function App() {
  // Set document title to PDF Magic
  document.title = "PDF Magic";

  return (
    <Router>
      <div className="App bg-gradient-to-br from-gray-900 to-black text-white w-screen min-h-screen flex flex-col overflow-x-hidden">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pdfviewer" element={<PdfViewer />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
