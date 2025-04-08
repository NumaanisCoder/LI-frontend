import React, { useState, useRef } from 'react';
import { FiUpload, FiFile, FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi';
import PdfWorker from './PDFWorker';
import styles from './PDFViewer.module.css';

function PDFViewer() {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        processFile(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    };

    const processFile = (file) => {
        if (!file) return;
        
        if (file.type !== 'application/pdf') {
            setError('Please select a valid PDF file');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            setError('File size exceeds 50MB limit');
            return;
        }

        setError('');
        setFileName(file.name);
        const fileUrl = URL.createObjectURL(file);
        setPdfUrl(fileUrl);
    };

    const handleOpenFileClick = () => {
        fileInputRef.current.click();
    };

    const clearFile = () => {
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        setFileName('');
        setError('');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>PDF Viewer</h1>
                <p className={styles.subtitle}>View and navigate PDF documents</p>
            </div>

            {!pdfUrl ? (
                <div 
                    className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange} 
                        accept="application/pdf" 
                        className={styles.fileInput} 
                    />
                    <div className={styles.uploadContent}>
                        <FiUpload className={styles.uploadIcon} />
                        <p className={styles.uploadText}>Drag & drop a PDF file here, or</p>
                        <button 
                            onClick={handleOpenFileClick}
                            className={styles.browseButton}
                        >
                            Browse Files
                        </button>
                        <p className={styles.fileTypes}>Supports: .pdf files</p>
                    </div>
                </div>
            ) : (
                <div className={styles.pdfContainer}>
                    <div className={styles.pdfHeader}>
                        <div className={styles.fileInfo}>
                            <FiFile className={styles.fileIcon} />
                            <span className={styles.fileName}>{fileName}</span>
                        </div>
                        <button onClick={clearFile} className={styles.clearButton}>
                            <FiX />
                        </button>
                    </div>
                    
                    <div className={styles.pdfViewerWrapper}>
                        <PdfWorker fileUrl={pdfUrl} />
                    </div>
                </div>
            )}

            {error && (
                <div className={styles.errorMessage}>
                    <FiX className={styles.errorIcon} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

export default PDFViewer;