import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import MyDoc from "../components/CreatePDF";

const PdfViewer = () => {
  const pdf = new URLSearchParams(window.location.search);
  const pdfContent = pdf.get("content");
  const pdfContentType = pdf.get("contenttype");
  console.log(pdfContentType);
  return (
    <PDFViewer width="100%" height="600" showToolbar={true}>
      <MyDoc content={pdfContent} contentType={pdfContentType} />
    </PDFViewer>
  );
};

export default PdfViewer;
