import React, { useEffect, useState } from 'react'
import styles from './VideoMxStyle.module.css'
import axios from 'axios';
import { FiUpload, FiVideo, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const VideoUpload = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [progress, setProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/videos`);
            
            const filteredVideos = response.data
                .filter(video => video.size > 0)
                .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        
            setVideos(filteredVideos);
        } catch (error) {
            console.error('Error fetching videos:', error);
            setUploadStatus('Failed to load videos');
        } finally {
            setIsLoading(false);
        }
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
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type.startsWith('video/')) {
                setFile(droppedFile);
                setFileName(droppedFile.name);
            } else {
                setUploadStatus('Please select a video file');
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadStatus('Please select a file first!');
            return;
        }
    
        // Validate file size before upload
        if (file.size > 500 * 1024 * 1024) {
            setUploadStatus('File size exceeds 500MB limit!');
            return;
        }
    
        const formData = new FormData();
        formData.append('video', file);
    
        try {
            setUploadStatus('Uploading...');
            setProgress(0);
            setIsLoading(true);
            
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                },
                timeout: 600000 // 10-minute timeout for large files
            });
    
            setUploadStatus('Upload successful!');
            setVideoUrl(response.data.location);
    
            // Refresh the videos after a short delay
            setTimeout(() => {
                fetchVideos();
                setFile(null);
                setFileName('');
            }, 1000);
        } catch (error) {
            setUploadStatus('Upload failed!');
            setProgress(0);
            
            let errorMessage = 'Upload failed';
            if (error.response) {
                errorMessage += `: ${error.response.data?.error || error.response.statusText}`;
            } else if (error.request) {
                errorMessage += ': No response from server';
            } else {
                errorMessage += `: ${error.message}`;
            }
            
            setUploadStatus(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={styles.videoUploadContainer}>
            <div className={styles.videouploaderSection}>
                <h2><FiVideo /> Video Upload</h2>
                <p className={styles.subtitle}>Upload videos (Max 500MB)</p>
                
                <div 
                    className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input 
                        type="file" 
                        id="fileInput"
                        accept="video/*" 
                        onChange={handleFileChange} 
                        className={styles.fileInput} 
                    />
                    <label htmlFor="fileInput" className={styles.uploadLabel}>
                        <FiUpload className={styles.uploadIcon} />
                        <span>{fileName || 'Choose a file or drag it here'}</span>
                    </label>
                </div>
                
                {file && (
                    <div className={styles.fileInfo}>
                        <p>Selected: {fileName}</p>
                        <p>Size: {formatFileSize(file.size)}</p>
                    </div>
                )}
                
                <button 
                    onClick={handleUpload} 
                    className={styles.uploadButton}
                    disabled={!file || isLoading}
                >
                    {isLoading ? <FiRefreshCw className={styles.spinner} /> : 'Upload Video'}
                </button>
                
                {progress > 0 && (
                    <div className={styles.progressContainer}>
                        <progress 
                            value={progress} 
                            max="100" 
                            className={styles.progressBar} 
                        />
                        <span>{progress}%</span>
                    </div>
                )}
                
                {uploadStatus && (
                    <p className={`${styles.uploadStatus} ${
                        uploadStatus.includes('success') ? styles.success : 
                        uploadStatus.includes('fail') ? styles.error : ''
                    }`}>
                        {uploadStatus.includes('success') ? (
                            <FiCheckCircle className={styles.statusIcon} />
                        ) : uploadStatus.includes('fail') ? (
                            <FiAlertCircle className={styles.statusIcon} />
                        ) : null}
                        {uploadStatus}
                    </p>
                )}
            </div>
            
            <div className={styles.videoGallery}>
                <div className={styles.galleryHeader}>
                    <h3>Uploaded Videos</h3>
                    <button 
                        onClick={fetchVideos} 
                        className={styles.refreshButton}
                        disabled={isLoading}
                    >
                        <FiRefreshCw className={isLoading ? styles.spinner : ''} />
                        Refresh
                    </button>
                </div>
                
                {isLoading && videos.length === 0 ? (
                    <div className={styles.loading}>Loading videos...</div>
                ) : videos.length > 0 ? (
                    <div className={styles.videoGrid}>
                        {videos.map((video, index) => (
                            <div key={index} className={styles.videoItem}>
                                <div className={styles.videoWrapper}>
                                    <video controls className={styles.videoElement}>
                                        <source src={video.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                <div className={styles.videoInfo}>
                                    <h4>{video.name}</h4>
                                    <p className={styles.uploadDate}>
                                        Uploaded: {new Date(video.lastModified).toLocaleString()}
                                    </p>
                                    <p className={styles.fileSize}>{formatFileSize(video.size)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <FiVideo className={styles.emptyIcon} />
                        <p>No videos uploaded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoUpload;