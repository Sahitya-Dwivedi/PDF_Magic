import express from "express";
import PDFParser from "pdf2json";
import multer from "multer";

const app = express();
const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

let pages = [];
let pdfNo = 0;
app.post("/api/pdf", upload.single("pdfBlob"), (req, res) => {
  const buffer = req.file.buffer;

  const pdfParser = new PDFParser();

  pdfParser.on("pdfParser_dataError", (errData) => {
    console.error("PDF parse error:", errData.parserError);
    return res.status(500).json({ error: errData.parserError.toString() });
  });

  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    pages.push([pdfData.Pages, pdfNo]);
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
  pdfNo++;
});
app.post("/api/clear-memo", (_, res) => {
  pages = [];
  pdfNo = 0;
  res.json({ message: "Memo cleared" });
});
app.listen(5000);
