import React, { useState, useRef, useEffect } from 'react';
import { UploadFile } from "@/api/integrations";
import { X, ChevronLeft, Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VoiceRecorder({ onSave, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);
  
  const startRecording = async () => {
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        if (audioRef.current) {
          audioRef.current.src = url;
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
        
        // Max recording time: 60 seconds
        if (seconds >= 60) {
          stopRecording();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('לא ניתן להקליט הודעה קולית. אנא אשר גישה למיקרופון.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };
  
  const resetRecording = () => {
    setAudioURL(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };
  
  const handleSave = async () => {
    if (!audioURL) return;
    
    try {
      // Get blob from URL
      const response = await fetch(audioURL);
      const blob = await response.blob();
      
      // Upload to server
      const { file_url } = await UploadFile({ file: blob });
      
      onSave({
        type: 'voice',
        url: file_url,
        duration: recordingTime
      });
      
    } catch (error) {
      console.error('Error uploading voice:', error);
      alert('שגיאה בשמירת ההודעה הקולית. נסה שוב.');
    }
  };
  
  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <button 
          className="w-10 h-10 flex items-center justify-center text-white"
          onClick={onCancel}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <h2 className="text-white text-lg font-medium">הודעה קולית</h2>
        
        <div className="w-10 h-10"></div>
      </div>
      
      {/* Recorder */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Waveform Visualization */}
        <div className="w-full h-32 mb-8 flex items-center justify-center">
          {isRecording ? (
            <div className="flex items-center space-x-1">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-purple-500 w-2 mx-0.5"
                  animate={{
                    height: [10, Math.random() * 50 + 10, 10],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          ) : audioURL ? (
            <div className="flex items-center space-x-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="bg-purple-500 w-2 mx-0.5"
                  style={{
                    height: Math.random() * 40 + 5,
                  }}
                />
              ))}
            </div>
          ) : (
            <Mic className="w-16 h-16 text-gray-400" />
          )}
        </div>
        
        {/* Time Display */}
        <div className="mb-8 text-2xl font-medium text-white">
          {formatTime(recordingTime)}
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-8">
          {!audioURL ? (
            <button
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isRecording ? 'bg-red-500' : 'bg-red-600'
              }`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <Square className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
          ) : (
            <>
              <button
                className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center"
                onClick={resetRecording}
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
              
              <button
                className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center"
                onClick={togglePlayback}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </button>
              
              <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                className="hidden"
              />
            </>
          )}
        </div>
      </div>
      
      {/* Footer */}
      {audioURL && (
        <div className="p-4 border-t border-gray-800">
          <button
            className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium"
            onClick={handleSave}
          >
            שיתוף
          </button>
        </div>
      )}
    </div>
  );
}