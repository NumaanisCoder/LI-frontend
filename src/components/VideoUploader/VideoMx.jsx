import React, { useEffect, useState } from 'react'
import styles from './VideoMxStyle.module.css'
import axios from 'axios';



const VideoUpload = () => {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [videos, setVideos] = useState([]);
    console.log(process.env.REACT_APP_API_URL)
  
    useEffect(() => {
      fetchVideos();
    }, []);
  
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/videos`);
        
        // Filter out videos with size 0
        const filteredVideos = response.data.filter(video => video.size > 0);
    
        console.log(filteredVideos);
        setVideos(filteredVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };
    
  
    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };
  
    const handleUpload = async () => {
      if (!file) {
        alert('Please select a file first!');
        return;
      }
    
      // Validate file size before upload
      if (file.size > 500 * 1024 * 1024) {
        alert('File size exceeds 500MB limit!');
        return;
      }
    
      const formData = new FormData();
      formData.append('video', file);
    
      try {
        setUploadStatus('Uploading...');
        setProgress(0);
        
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
          timeout: 600000 // 10 minute timeout for large files
        });
    
        setUploadStatus('Upload successful!');
        setVideoUrl(response.data.location);
        fetchVideos();
      } catch (error) {
        setUploadStatus('Upload failed!');
        setProgress(0);
        
        let errorMessage = 'Upload failed';
        if (error.response) {
          // Server responded with error status
          errorMessage += `: ${error.response.data?.error || error.response.statusText}`;
          console.error('Server error:', error.response.data);
        } else if (error.request) {
          // Request was made but no response
          errorMessage += ': No response from server';
          console.error('No response:', error.request);
        } else {
          // Other errors
          errorMessage += `: ${error.message}`;
          console.error('Error:', error.message);
        }
        
        alert(errorMessage);
      }
    };
  
    return (
      <div className={styles.videoUploadContainer}>
  
        <div className={styles.videouploaderSection}>
        <h2>Video Upload to AWS S3</h2>
        <input type="file" accept="video/*" onChange={handleFileChange} className={styles.fileInput} />
        <button onClick={handleUpload} className={styles.uploadButton}>Upload Video</button>
        </div>
        
        {progress > 0 && (
          <div>
            <progress value={progress} max="100" className={styles.progressBar} />
            <span>{progress}%</span>
          </div>
        )}
        
        {uploadStatus && <p className={styles.uploadStatus}>{uploadStatus}</p>}
  
        {videoUrl && (
          <div>
            <h3>Uploaded Video</h3>
            <video width="600" controls className={styles.uploadedVideo}>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
  
        <div className={styles.videoGallery}>
          <h3 style={{textAlign:'center'}}>All Uploaded Videos</h3>
          {videos.length > 0 ? (
            <div className={styles.videoGrid}>
              {videos.map((video, index) => (
                <div key={index} className={styles.videoItem}>
                  <h4>{video.name}</h4>
                  <video controls className={styles.videoElement}>
                    <source src={video.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <p>Uploaded: {new Date(video.lastModified).toLocaleString()}</p>
                  <p>Size: {(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No videos uploaded yet</p>
          )}
        </div>
      </div>
    );
  };
  
  export default VideoUpload;
  