import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Worker } from '@react-pdf-viewer/core';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './PdfViewerStyle.css';

// Latest PDF.js worker configuration
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function PDFViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfFile, setPdfFile] = useState(pdfUrl || null);
  const [pdfError, setPdfError] = useState('');

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = (e) => {
          setPdfFile(e.target.result);
          setPdfError('');
        };
        reader.onerror = () => {
          setPdfError('Failed to read file');
        };
      } else {
        setPdfFile(null);
        setPdfError('Please select a valid PDF file');
      }
    }
  };

  return (
    <Worker workerUrl={`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`}>
      <div className="pdf-viewer">
        {!pdfUrl && (
          <div className="pdf-controls">
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept="application/pdf" 
              className="file-input"
            />
            {pdfError && <div className="error-message">{pdfError}</div>}
          </div>
        )}

        <div className="pdf-container">
          {pdfFile ? (
            <>
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  console.error('PDF load error:', error);
                  setPdfError('Failed to load PDF. Please check the file or URL.');
                }}
                loading={<div className="loading">Loading PDF...</div>}
                error={<div className="error-message">Failed to load PDF</div>}
              >
                <Page 
                  pageNumber={pageNumber} 
                  loading={<div className="loading">Loading page...</div>}
                  error={<div className="error-message">Failed to load page</div>}
                />
              </Document>
              <div className="page-controls">
                <button
                  type="button"
                  disabled={pageNumber <= 1}
                  onClick={previousPage}
                  className="nav-button"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pageNumber} of {numPages || '--'}
                </span>
                <button
                  type="button"
                  disabled={pageNumber >= (numPages || 0)}
                  onClick={nextPage}
                  className="nav-button"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            !pdfUrl && <div className="placeholder">Select a PDF file or provide a URL</div>
          )}
        </div>
      </div>
    </Worker>
  );
}

export default PDFViewer;