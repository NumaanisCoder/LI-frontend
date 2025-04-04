import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import VideoUpload from './components/VideoUploader/VideoMx';
import PdfUploader from './components/PdfUploader/PdfUploader';
import AudioRecorder from './components/AudioUploader/AudioUploader';



const App = () => {
  return (
    <Router>
      <div>
        <NavBar/>
        <Routes>
          <Route path="/" element={<VideoUpload/>} />
          <Route path="/pdfviewer" element={<PdfUploader />} />
          <Route path="/audio" element={<AudioRecorder />} />
    
        </Routes>
      </div>
    </Router>
  );
};

export default App;
