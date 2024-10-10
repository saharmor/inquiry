import React, { useEffect, useRef, useState } from 'react';

interface MicrophoneRecorderProps {
  isManualMode: boolean;
  onAudioData: (data: Blob) => void;
}

export const MicrophoneRecorder: React.FC<MicrophoneRecorderProps> = ({ isManualMode, onAudioData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          onAudioData(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const handleMouseDown = () => {
    if (isManualMode && !isRecording) {
      startRecording();
    }
  };

  const handleMouseUp = () => {
    if (isManualMode && isRecording) {
      stopRecording();
    }
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop recording if mouse leaves button while pressed
    >
      {isRecording ? 'Recording...' : 'Hold to Record'}
    </button>
  );
};