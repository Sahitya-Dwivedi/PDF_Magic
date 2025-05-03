import "./App.css";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Features from "./components/features";
import Footer from "./components/footer";

function App() {
  // Set document title to PDF Magic
  document.title = "PDF Magic";
  
  return (
    <div className="App bg-gradient-to-br from-gray-900 to-black text-white w-screen min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}

export default App;
