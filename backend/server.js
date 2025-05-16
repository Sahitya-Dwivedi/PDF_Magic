import express from "express";
import PDFParser from "pdf2json";
import fs from "fs";
import multer from "multer";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/api/pdf", (req, res) => {
  const pdfParser = new PDFParser();
  const pdfBlob = req.body.pdfBlob;
console.log(pdfBlob);
//   pdfParser.on("pdfParser_dataError", (err) => {
//     res
//       .status(500)
//       .send({ error: "Error parsing PDF.", details: err.parserError });
//     fs.unlinkSync(pdfBlob); // Clean up temp file
//   });
  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    // Example: Extract text content
    const extractedText = pdfData.formImage.Pages.map((page) =>
      page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(" ")
    ).join("\n");

    res.json({ text: extractedText, rawData: pdfData });
    fs.unlinkSync(pdfBlob); // Clean up temp file
  });
  // Save the PDF blob to a temporary file
//   pdfParser.loadPDF(pdfBlob);
});

app.listen(5000);
