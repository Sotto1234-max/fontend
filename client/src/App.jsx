import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import VideoPanels from './components/VideoPanels';
import ControlButtons from './components/ControlButtons';

const socket = io('https://backendnode-index-js.onrender.com'); // ⛔ Replace this with your real backend URL

export default function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const [connected, setConnected] = useState(false);

  // STUN server for NAT traversal
  const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  useEffect(() => {
    socket.on('offer', async (offer) => {
      await createPeer();
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit('answer', answer);
    });

    socket.on('answer', async (answer) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async (candidate) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate', e);
        }
      }
    });

    socket.on('stop', () => closeConnection());

    return () => {
      socket.disconnect();
    };
  }, []);

  const createPeer = async () => {
    peerConnection.current = new RTCPeerConnection(config);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate);
      }
    };

    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.current.getTracks().forEach((track) =>
      peerConnection.current.addTrack(track, localStream.current)
    );

    localVideoRef.current.srcObject = localStream.current;
  };

  const handleStart = async () => {
    await createPeer();
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit('offer', offer);
    setConnected(true);
  };

  const handleNext = () => {
    socket.emit('stop'); // end old connection
    closeConnection();
    handleStart(); // find a new peer
  };

  const handleStop = () => {
    socket.emit('stop');
    closeConnection();
  };

  const closeConnection = () => {
    setConnected(false);
    if (peerConnection.current) peerConnection.current.close();
    peerConnection.current = null;

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <h1 className="text-2xl font-bold mb-6">1-on-1 Random Video Chat</h1>
      <VideoPanels localRef={localVideoRef} remoteRef={remoteVideoRef} />
      <ControlButtons onStart={handleStart} onNext={handleNext} onStop={handleStop} />
      {connected && <p className="mt-4 text-green-400">You're connected!</p>}
    </div>
  );
}
