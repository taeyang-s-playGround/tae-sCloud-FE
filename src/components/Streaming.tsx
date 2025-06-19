import React, { useState } from 'react';
import { Video, Mic, Cloud } from 'lucide-react';

function Streaming() {
  const [isStreaming, setIsStreaming] = useState(false);

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      const videoElement = document.getElementById('streamVideo') as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopStreaming = () => {
    const videoElement = document.getElementById('streamVideo') as HTMLVideoElement;
    if (videoElement && videoElement.srcObject) {
      const tracks = (videoElement.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoElement.srcObject = null;
      setIsStreaming(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-xl p-8 border border-teal-100">
        <div className="text-center mb-8">
          <Cloud className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">실시간 스트리밍</h1>
          <p className="text-gray-600 mt-2">카메라와 마이크를 통해 실시간으로 방송하세요</p>
        </div>
        
        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6 border-4 border-teal-100">
          <video
            id="streamVideo"
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex justify-center space-x-4">
          {!isStreaming ? (
            <button
              onClick={startStreaming}
              className="flex items-center bg-teal-600 text-white py-3 px-8 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Video className="w-5 h-5 mr-2" />
              스트리밍 시작
            </button>
          ) : (
            <button
              onClick={stopStreaming}
              className="flex items-center bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Mic className="w-5 h-5 mr-2" />
              스트리밍 중지
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Streaming;