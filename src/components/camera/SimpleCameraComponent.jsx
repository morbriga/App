import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UploadFile } from "@/api/integrations";
import { X, Camera, SwitchCamera, Check, Upload, Image, Zap } from 'lucide-react';

export default function SimpleCameraComponent({ onClose, onCapture, eventCode }) {
  // States
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  
  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestId, setGuestId] = useState('');
  
  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Helper function to stop media tracks
  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };
  
  // Load guest info
  useEffect(() => {
    if (!eventCode) return;
    
    const name = localStorage.getItem(`guestName_${eventCode}`);
    const id = localStorage.getItem(`guestId_${eventCode}`);
    
    if (name) setGuestName(name);
    if (id) setGuestId(id);
  }, [eventCode]);
  
  // Camera initialization
  useEffect(() => {
    initCamera();
    
    return () => {
      stopMediaTracks();
    };
  }, [isFrontCamera]);
  
  const initCamera = async () => {
    try {
      stopMediaTracks();
      
      const constraints = {
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 2560 },
          height: { ideal: 1440 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Check flash capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.getCapabilities) {
        const capabilities = videoTrack.getCapabilities();
        if (capabilities.torch !== undefined) {
          setHasFlash(true);
          console.log("Flash capability detected!");
        }
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('לא ניתן לגשת למצלמה. אנא אשר גישה למצלמה ונסה שוב.');
    }
  };
  
  const toggleFlash = async () => {
    try {
      if (!streamRef.current || !hasFlash) return;
      
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (!videoTrack || !videoTrack.getCapabilities?.().torch) return;
      
      const newFlashState = !flashEnabled;
      await videoTrack.applyConstraints({
        advanced: [{ torch: newFlashState }]
      });
      
      setFlashEnabled(newFlashState);
    } catch (error) {
      console.error('Flash toggle error:', error);
      alert('לא ניתן להפעיל את הפלאש במכשיר זה');
    }
  };
  
  const takePhoto = async () => {
    if (!videoRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      
      if (isFrontCamera) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      setCapturedImage(URL.createObjectURL(blob));
      
      stopMediaTracks();
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('שגיאה בצילום התמונה. נסה שוב.');
    }
  };
  
  const uploadPhoto = async () => {
    if (!capturedImage) return;
    
    setIsUploading(true);
    
    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      const { file_url } = await UploadFile({ file: blob });
      
      const postData = {
        type: 'photo',
        media_url: file_url,
        caption: caption,
        guest_name: guestName,
        guest_id: guestId
      };
      
      onCapture(postData);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('שגיאה בהעלאת התמונה. נסה שוב.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Camera View */}
      <div className="relative flex-1">
        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: isFrontCamera ? 'scaleX(-1)' : 'none' }}
          />
        ) : (
          <img
            src={capturedImage}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* Top Controls */}
      <div className="absolute top-4 right-4 left-4 flex justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/50 text-white"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        
        {hasFlash && !capturedImage && (
          <Button
            variant={flashEnabled ? "default" : "ghost"}
            size="icon"
            className="rounded-full bg-black/50 text-white"
            onClick={toggleFlash}
          >
            <Zap className="h-6 w-6" />
          </Button>
        )}
      </div>
      
      {/* Caption Input */}
      {capturedImage && (
        <div className="absolute bottom-24 left-4 right-4">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="הוסף כיתוב..."
            className="bg-black/60 backdrop-blur-sm text-white border-white/20 rounded-lg resize-none"
          />
        </div>
      )}
      
      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
        {!capturedImage ? (
          <>
            <Button
              size="icon"
              className="w-16 h-16 rounded-full bg-white hover:bg-white/90"
              onClick={takePhoto}
            >
              <Camera className="h-8 w-8 text-black" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 bottom-0 rounded-full bg-black/50 text-white"
              onClick={() => setIsFrontCamera(!isFrontCamera)}
            >
              <SwitchCamera className="h-6 w-6" />
            </Button>
          </>
        ) : (
          <div className="flex gap-6">
            <Button
              variant="outline"
              className="rounded-full border-white text-white hover:bg-white/20"
              onClick={() => {
                setCapturedImage(null);
                setCaption('');
                initCamera();
              }}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              className="rounded-full bg-white text-black hover:bg-white/90"
              onClick={uploadPhoto}
              disabled={isUploading}
            >
              <Check className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-center">מעלה...</p>
          </div>
        </div>
      )}
    </div>
  );
}