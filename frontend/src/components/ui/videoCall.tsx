// src/components/VideoCall.tsx
import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Video } from "lucide-react";

interface VideoCallProps {
  socket: Socket;
  userId: string;
  targetUserId: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ socket, userId, targetUserId }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

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
    try {
      setIsCalling(true);
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Get available devices and select the first video device
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      const videoDeviceId = videoDevices.length > 0 ? videoDevices[0].deviceId : undefined;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("callUser", { to: targetUserId, from: userId, offer });
    } catch (error: any) {
      console.error("Error starting call:", error.name, error.message);
      setIsCalling(false);
      alert(
        `Failed to start video call. Check camera/microphone permissions or availability. Error: ${error.name} - ${error.message}`
      );
    }
  };

  const acceptCall = async () => {
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
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("callRejected", () => {
      setIsRinging(false);
      setIsCalling(false);
    });

    socket.on("callEnded", () => {
      setIsCalling(false);
      peerConnectionRef.current?.close();
    });

    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        console.log("Available devices:", devices);
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        const audioDevices = devices.filter(device => device.kind === "audioinput");
        console.log("Video devices:", videoDevices);
        console.log("Audio devices:", audioDevices);
      })
      .catch(err => console.error("Error enumerating devices:", err));

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("callRejected");
      socket.off("callEnded");
    };
  }, [socket, userId]);

  return (
    <>
      <button
        onClick={startCall}
        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center gap-1"
        disabled={isCalling || isRinging}
      >
        <Video size={20} />
        <span>Video Call</span>
      </button>

      {(isCalling || isRinging) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-40 h-40 rounded object-cover border"
              />
              <video
                ref={remoteVideoRef}
                autoPlay
                className="w-40 h-40 rounded object-cover border"
              />
            </div>
            {isRinging && !isCalling && (
              <div className="flex gap-4">
                <button
                  onClick={acceptCall}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={rejectCall}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            )}
            {isCalling && (
              <button
                onClick={endCall}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                End Call
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCall;