import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import VideoUpload from './components/VideoUploader/VideoMx';

import AudioRecorder from './components/AudioUploader/AudioUploader';
import PDFViewer from './components/PDFViewer/PDFViewer';





const App = () => {
  return (
    <Router>
      <div>
        <NavBar/>
        <Routes>
          <Route path="/" element={<VideoUpload/>} />
      
          <Route path="/audio" element={<AudioRecorder />} />
          <Route path="/pdfviewer" element={<PDFViewer />} />
    
        </Routes>
      </div>
    </Router>
  );
};

export default App;
