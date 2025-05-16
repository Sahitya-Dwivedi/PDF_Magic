import express from "express";
import PDFParser from "pdf2json";
import multer from "multer";

const app = express();
const upload = multer();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/api/pdf", upload.single("pdfBlob"), (req, res) => {
  const buffer   = req.file.buffer

  const pdfParser = new PDFParser();

  pdfParser.on("pdfParser_dataError", errData => {
    console.error("PDF parse error:", errData.parserError);
    return res.status(500).json({ error: errData.parserError.toString() });
  });

  pdfParser.on("pdfParser_dataReady", pdfData => {
   
    res.json(pdfData);
  });

  // Read file from disk and parse it
  pdfParser.parseBuffer(buffer);

});

app.listen(5000);
