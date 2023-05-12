
import Webcam from 'react-webcam';
import { useRef, useEffect, useState } from 'react';
import { boxBlur } from '../../lib/ImageManipualtion/maskFace';
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PhoneIcon from "@material-ui/icons/Phone";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";

const socket = io.connect('http://localhost:8000')

export default function Home() {
  const [me, setMe] = useState("");
  const [receivingCall, setReceivingCall] = useState(false);
	const [caller, setCaller] = useState("");
	const [callerSignal, setCallerSignal] = useState();
	const [callAccepted, setCallAccepted] = useState(false);
	const [idToCall, setIdToCall] = useState("");
	const [callEnded, setCallEnded] = useState(false);
	const [name, setName] = useState("");
  const webcamRef = useRef(null);
  const videoRef  = useRef(null);
  const [stream, setStream] = useState(null);
  
  const userVideo = useRef();
	const connectionRef = useRef();

  const canvasRef = useRef(null); // Set initial ref to null
  const ctxRef = useRef(null);

  useEffect(() => {
    canvasRef.current = document.createElement('canvas');
    ctxRef.current = canvasRef.current.getContext('2d');
  }, []);

  useEffect(() => {
    socket.on("me", (id) => {
			console.log("ID   " ,id);
		  setMe(id);
		});
	  
		socket.on("callUser", (data) => {
		  setReceivingCall(true);
		  setCaller(data.from);
		  setName(data.name);
		  setCallerSignal(data.signal);
		});
  }, []);

  function onResults(results) {
    if (results.multiFaceLandmarks) {
      const video = webcamRef.current.video;
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      ctxRef.current.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  
      // Get the face landmarks
      const faceLandmarks = results.multiFaceLandmarks[0];
  
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

  const callUser = (id) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream,
			config: {
				iceServers: [
					{
						 urls: "stun:stun.l.google.com:19302" 
					},
					
				],
			},
		})
		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			
				userVideo.current.srcObject = stream
			
		})
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}

	const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream,
			config: {
				iceServers: [
					{
						 urls: "stun:stun.l.google.com:19302" 
					},
					
				],
			},
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			console.log("stream", stream);
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}

	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()
	}

  return (
    <div className={""}>
      <h1 style={{ textAlign: "center", color: '#fff' }}>Image Processing and Coding Final Project</h1>
		<div className="container">
			<div className="video-container">
				<div className="video">
            <Webcam
              ref={webcamRef}
              
              hidden={true}
            />
            {stream && <video ref={videoRef} autoPlay playsInline style={{ width: "300px"}} />}
            </div>
				<div className="video">
					
					<video playsInline ref={userVideo} autoPlay style={{ width: "300px"}} />:
				
				</div>
			</div>
			<div className="myId">
				<TextField
					id="filled-basic"
					label="Name"
					variant="filled"
					value={name}
					onChange={(e) => setName(e.target.value)}
					style={{ marginBottom: "20px" }}
				/>
				
					<Button  onClick={() => {navigator.clipboard.writeText(me)}}variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
						Copy ID
					</Button>
		

				<TextField
					id="filled-basic"
					label="ID to call"
					variant="filled"
					value={idToCall}
					onChange={(e) => setIdToCall(e.target.value)}
				/>
				<div className="call-button">
					{callAccepted && !callEnded ? (
						<Button variant="contained" color="secondary" onClick={leaveCall}>
							End Call
						</Button>
					) : (
						<IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
							<PhoneIcon fontSize="large" />
						</IconButton>
					)}
					{idToCall}
				</div>
			</div>
			<div>
				{receivingCall && !callAccepted ? (
						<div className="caller">
						<h1 >{name} is calling...</h1>
						<Button variant="contained" color="primary" onClick={answerCall}>
							Answer
						</Button>
					</div>
				) : null}
			</div>
    </div>
    </div>
  );
}