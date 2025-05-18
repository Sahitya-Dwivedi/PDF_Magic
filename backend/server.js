import express from "express";
import PDFParser from "pdf2json";
import multer from "multer";

const app = express();
const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

let pages = [];
app.post("/api/pdf", upload.single("pdfBlob"), (req, res) => {
  const buffer = req.file.buffer;

  const pdfParser = new PDFParser();

  pdfParser.on("pdfParser_dataError", (errData) => {
    console.error("PDF parse error:", errData.parserError);
    return res.status(500).json({ error: errData.parserError.toString() });
  });

  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    pages = pdfData.Pages;
    console.log("PDF data sent to client");
    console.log(pdfData);
    res.json(pages);
  });

  // Read file from disk and parse it
  pdfParser.parseBuffer(buffer);
});
app.get("/api/pdf-results", (req, res) => {
  if (pages.length === 0) {
    return res.status(404).json({ error: "No PDF data available" });
  }
  res.json(pages);
});
app.listen(5000);
