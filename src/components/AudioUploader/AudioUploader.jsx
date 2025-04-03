import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaSave, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import styles from './AudioUploaderStyle.module.css';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [recordingName, setRecordingName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchRecordings = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/audio`);
        setRecordings(response.data);
        console.log(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recordings:', err);
        setError('Failed to load recordings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecordings();
  }, [API_BASE_URL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveRecording = async () => {
    if (!audioBlob || !recordingName.trim()) {
      setError('Please enter a name for your recording');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      const filename = `${recordingName.trim()}.mp3`;
      formData.append('audio', audioBlob, filename);
      formData.append('name', filename);

      const response = await axios.post(`${API_BASE_URL}/api/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setRecordings([response.data, ...recordings]);
      setAudioBlob(null);
      setRecordingName('');
    } catch (err) {
      console.error('Error saving recording:', err);
      setError('Failed to save recording. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecording = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) return;
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/audio/${id}`);
      setRecordings(recordings.filter(rec => rec.id !== id));
    } catch (err) {
      console.error('Error deleting recording:', err);
      setError('Failed to delete recording. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Audio Recorder</h2>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <div className={styles.controls}>
        {!isRecording ? (
          <button onClick={startRecording} disabled={isLoading} className={styles.button}>
            <FaMicrophone /> Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className={styles.button}>
            <FaStop /> Stop Recording
          </button>
        )}
        {audioBlob && (
          <div className={styles.saveSection}>
            <input
              type="text"
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              placeholder="Enter recording name"
              disabled={isLoading}
              className={styles.input}
            />
            <button onClick={saveRecording} disabled={isLoading} className={styles.button}>
              {isLoading ? <FaSpinner className={styles.spin} /> : <FaSave />} Save Recording
            </button>
          </div>
        )}
      </div>
      <div className={styles.recordingsList}>
        <h3>Saved Recordings</h3>
        {recordings.map(recording => (
           
          <div key={recording.id} className={styles.listItem}>
            <span>{recording.name}</span>
            <audio controls>
              <source src={recording.url} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioRecorder;
