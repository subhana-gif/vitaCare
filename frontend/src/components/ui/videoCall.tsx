import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5001", {
  withCredentials: true,
});

const VideoCall: React.FC<{ userId: string; targetUserId: string }> = ({
  userId,
  targetUserId,
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    socket.emit("registerVideoCall", userId);

    socket.on("incomingCall", async ({ from, offer, socketId }) => {
      setIsRinging(true);
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("acceptCall", { to: socketId, answer });
    });

    socket.on("callAccepted", async ({ answer }) => {
      await peerConnectionRef.current?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (candidate) {
        await peerConnectionRef.current?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    });

    socket.on("callRejected", () => {
      setIsRinging(false);
      setIsCalling(false);
      alert("Call rejected");
    });

    socket.on("callEnded", () => {
      setIsCalling(false);
      peerConnectionRef.current?.close();
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("callRejected");
      socket.off("callEnded");
    };
  }, [userId]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { to: targetUserId, candidate: event.candidate });
      }
    };
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    return pc;
  };

  const startCall = async () => {
    setIsCalling(true);
    const pc = createPeerConnection();
    peerConnectionRef.current = pc;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("callUser", { to: targetUserId, from: userId, offer });
  };

  const acceptCall = () => {
    setIsRinging(false);
    setIsCalling(true);
  };

  const rejectCall = () => {
    setIsRinging(false);
    socket.emit("rejectCall", { to: targetUserId });
  };

  const endCall = () => {
    setIsCalling(false);
    peerConnectionRef.current?.close();
    socket.emit("endCall", { to: targetUserId });
  };

  return (
    <div>
      <h2>Video Call</h2>
      <video ref={localVideoRef} autoPlay muted style={{ width: "300px" }} />
      <video ref={remoteVideoRef} autoPlay style={{ width: "300px" }} />
      {!isCalling && !isRinging && (
        <button onClick={startCall}>Call {targetUserId}</button>
      )}
      {isRinging && (
        <div>
          <p>Incoming call from {targetUserId}...</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}
      {isCalling && <button onClick={endCall}>End Call</button>}
    </div>
  );
};

export default VideoCall;