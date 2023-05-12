
import Webcam from 'react-webcam';
import { useRef, useEffect, useState } from 'react';
import { boxBlur } from '../../lib/ImageManipualtion/maskFace';

export default function Home() {
  const webcamRef = useRef(null);
  const videoRef  = useRef(null);
  const [stream, setStream] = useState(null);

  const canvasRef = useRef(null); // Set initial ref to null
  const ctxRef = useRef(null);

  useEffect(() => {
    canvasRef.current = document.createElement('canvas');
    ctxRef.current = canvasRef.current.getContext('2d');
  }, []);

  function onResults(results) {
    if (results.multiFaceLandmarks) {
      const faceLandmarks = results.multiFaceLandmarks[0];
  
      if (faceLandmarks && Array.isArray(faceLandmarks)) {
        const video = webcamRef.current.video;
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        ctxRef.current.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
        // Get the bounds of the face
        let minX = video.videoWidth, minY = video.videoHeight, maxX = 0, maxY = 0;
        for (const landmark of faceLandmarks) {
          minX = Math.min(minX, landmark.x * video.videoWidth);
          minY = Math.min(minY, landmark.y * video.videoHeight);
          maxX = Math.max(maxX, landmark.x * video.videoWidth);
          maxY = Math.max(maxY, landmark.y * video.videoHeight);
        }
    
        // Calculate the size of the face
        const faceWidth = maxX - minX;
        const faceHeight = maxY - minY;
    
        // Get the image data of the face
        const faceImageData = ctxRef.current.getImageData(minX, minY, faceWidth, faceHeight);
    
        // Blur the face
        const blurredFaceImageData = boxBlur(faceImageData, 10); // Increase the radius as needed
    
        // Draw the blurred face back on the canvas
        ctxRef.current.putImageData(blurredFaceImageData, minX, minY);
      }
    }
  }
  

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    import('@mediapipe/face_mesh').then((FaceMeshModule) => {
      const faceMesh = new FaceMeshModule.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(onResults);

      import('@mediapipe/camera_utils').then((CameraUtilsModule) => {
        if (
          typeof webcamRef.current !== 'undefined' &&
          webcamRef.current !== null
        ) {
          const camera = new CameraUtilsModule.Camera(webcamRef.current.video, {
            onFrame: async () => {
              await faceMesh.send({ image: webcamRef.current.video });
            },
            width: 640,
            height: 480,
          });
          camera.start();
        }
      });

      // Capture the stream just once
      setStream(canvasRef.current.captureStream(30));
    });
  }, []);

  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={""}>
      <Webcam
        ref={webcamRef}
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 9,
          width: 640,
          height: 480,
        }}
        hidden={true}
      />
      <video ref={videoRef} autoPlay playsInline style={{ position: 'absolute', zIndex: 10 }} />
    </div>
  );
}