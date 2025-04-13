import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Video, Mic, MicOff, VideoOff, Video as VideoOn } from "lucide-react";
import { toast } from "react-toastify";
import basslineWonderland from "../../assets/bassline_wonderland.mp3";

interface VideoCallProps {
  socket: Socket;
  userId: string;
  targetUserId: string;
  userName?: string;       
  targetUserName?: string; 
}

const VideoCall: React.FC<VideoCallProps> = ({ 
  socket, 
  userId, 
  targetUserId, 
  userName = "User", 
  targetUserName = "Contact" 
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [muteLocalAudio, setMuteLocalAudio] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [remoteStreamId, setRemoteStreamId] = useState<string | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callRejected, setCallRejected] = useState(false);
  const [isLocalMain, setIsLocalMain] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [targetSocketId, setTargetSocketId] = useState<string | null>(null);
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  const [remoteHungUp, setRemoteHungUp] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [connectionState, setConnectionState] = useState<string>("");
  const [iceState, setIceState] = useState<string>("");
  const [callerName, setCallerName] = useState<string>("");  // Store caller's name

  const getCallDuration = () => {
    if (!callStartTime) {
      return 0;
    }
    const duration = Math.round((new Date().getTime() - callStartTime.getTime()) / 1000); // Duration in seconds
    return duration;
  };

  const playVideo = async (element: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!element || !stream) {
      return;
    }
    try {
      if (element.srcObject !== stream) {
        element.srcObject = stream;
      }
      element.muted = element === localVideoRef.current;
      const playPromise = element.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (error: any) {
      console.error("playVideo: Error playing video:", error);
      if (error.name === "AbortError") {
        setTimeout(() => playVideo(element, stream), 500);
      }
    }
  };

  useEffect(() => {
    ringAudioRef.current = new Audio(basslineWonderland);
    ringAudioRef.current.loop = true;
    ringAudioRef.current.volume = 0.5;
    ringAudioRef.current.onloadeddata = () => {
      document.addEventListener(
        "click",
        () => {
          ringAudioRef.current?.play()
            .then(() => {
              ringAudioRef.current?.pause();
            })
            .catch((e) => console.error("Preload error:", e));
        },
        { once: true }
      );
    };
    ringAudioRef.current.onerror = (e) => console.error("Error loading ringtone:", e);
  }, []);

  useEffect(() => {
    if (isRinging && ringAudioRef.current) {
      ringAudioRef.current.currentTime = 0;
      ringAudioRef.current
        .play()
        .catch((e) => console.error("Error playing ringtone:", e));
    } else if (!isRinging && ringAudioRef.current) {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
    }
  }, [isRinging]);

  const checkPermissions = async (): Promise<boolean> => {
    try {
      const cameraPermission = await navigator.permissions.query({ name: "camera" as PermissionName });
      const micPermission = await navigator.permissions.query({ name: "microphone" as PermissionName });
      if (cameraPermission.state === "denied" || micPermission.state === "denied") {
        toast.error("Camera or microphone access is denied. Please enable both in your browser settings.");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Permission check error:", err);
      return true; // Fallback to true if permission API fails
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && targetSocketId) {
        socket.emit("iceCandidate", { to: targetSocketId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = new MediaStream();
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      playVideo(remoteVideoRef.current, remoteStream);
      setRemoteStreamId(remoteStream.id);
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      setConnectionState(state);
      if (state === "disconnected" || state === "failed" || state === "closed") {
        endCall(false, getCallDuration());
      } else if (state === "connected") {
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      setIceState(state);
      if (state === "failed" || state === "disconnected") {
        endCall(false, getCallDuration());
      } else if (state === "connected") {
      }
    };

    return pc;
  };

  const startCall = async () => {
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) return;

      setIsCalling(true);
      setCallStartTime(new Date());
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      const audioDevices = devices.filter((device) => device.kind === "audioinput");

      if (videoDevices.length === 0 || audioDevices.length === 0) {
        throw new Error("No video or audio input devices found.");
      }

      const videoDeviceId = videoDevices[1]?.deviceId || videoDevices[0].deviceId;
      const audioDeviceId = audioDevices[0].deviceId;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoDeviceId ? { deviceId: videoDeviceId } : true,
        audio: audioDeviceId ? { deviceId: audioDeviceId } : true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((e) => console.error("Error playing local video:", e));
      }
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
      stream.getAudioTracks()[0].enabled = !muteLocalAudio;
      stream.getVideoTracks()[0].enabled = videoEnabled;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("callUser", { 
        to: targetUserId, 
        from: userId, 
        offer, 
        userName // Send the user's name with the call
      });
    } catch (error: any) {
      console.error("Error starting call:", error.name, error.message);
      setIsCalling(false);
      toast.error(`Failed to start video call: ${error.message}`);
    }
  };

  const acceptCall = async (offer: RTCSessionDescriptionInit, socketId: string) => {
    try {
      setIsRinging(false);
      if (isCalling) {
        return;
      }
      setIsCalling(true);
      setCallAccepted(true);
      setCallStartTime(new Date());

      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      const audioDevices = devices.filter((device) => device.kind === "audioinput");

      if (videoDevices.length === 0 || audioDevices.length === 0) {
        throw new Error("No video or audio input devices found.");
      }

      const videoDeviceId = videoDevices[1]?.deviceId || videoDevices[0].deviceId;
      const audioDeviceId = audioDevices[0].deviceId;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoDeviceId ? { deviceId: videoDeviceId } : true,
        audio: audioDeviceId ? { deviceId: audioDeviceId } : true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((e) => console.error("Error playing local video:", e));
      }
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
      stream.getAudioTracks()[0].enabled = !muteLocalAudio;
      stream.getVideoTracks()[0].enabled = videoEnabled;

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("acceptCall", { 
        to: socketId, 
        answer, 
        userName // Send the user's name when accepting
      });
    } catch (error: any) {
      console.error("Error accepting call:", error.name, error.message);
      setIsCalling(false);
      setCallAccepted(false);
      toast.error(`Failed to accept call: ${error.message}`);
    }
  };

  const rejectCall = () => {
    setCallRejected(true);
    setIsRinging(false);
    socket.emit("rejectCall", { to: targetSocketId });
    endCall(false, 0); // Explicitly end call on rejection
  };

  const endCall = (initiatedLocally = true, callDuration = 0) => {
    const calculatedDuration = callDuration || getCallDuration();
    if (initiatedLocally && targetSocketId) {
      socket.emit("endCall", { to: targetSocketId, duration: calculatedDuration });
    }

    let status: "Completed" | "Missed" | "Not Answered";
    if (callAccepted || (isCalling && (calculatedDuration > 0 || remoteStreamId))) {
      status = "Completed";
    } else if (callRejected) {
      status = "Missed";
    } else if (remoteHungUp || connectionState === "disconnected" || iceState === "disconnected") {
      status = "Not Answered";
    } else {
      status = "Missed";
    }

    // Only emit callHistory if this peer initiated the call end or rejection
    if (initiatedLocally || callRejected) {
      const callData = {
        sender: userId,
        receiver: targetUserId,
        type: "call",
        status,
        callDuration: Math.round(calculatedDuration / 60), // Convert to minutes
        createdAt: new Date(),
      };
      socket.emit("callHistory", callData);
    } else {
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsCalling(false);
    setIsRinging(false);
    setRemoteHungUp(false);
    setRemoteStreamId(null);
    setCallAccepted(false);
    setCallRejected(false);
    setCallStartTime(null);
    setConnectionState("");
    setIceState("");
    setCallerName("");
    if (ringAudioRef.current) {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setMuteLocalAudio(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  useEffect(() => {
    socket.on("callTargetSocket", ({ targetSocketId }) => {
      setTargetSocketId(targetSocketId);
    });

    socket.emit("registerVideoCall", userId);

    socket.on("incomingCall", async ({ from, offer, socketId, userName: callerName }) => {
      setIsRinging(true);
      setTargetSocketId(socketId);
      setCallerName(callerName || "Unknown Caller");
      const proceed = await checkPermissions();
      if (proceed) {
        (window as any).acceptCall = () => acceptCall(offer, socketId);
        setTimeout(() => {
          if (isRinging && !isCalling) {
            rejectCall();
          }
        }, 30000);
      }
    });

    socket.on("callAccepted", async ({ answer }) => {
      setCallAccepted(true);
      try {
        await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (candidate && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    socket.on("callRejected", () => {
      setCallRejected(true);
      endCall(false, 0);
      toast.warn("The other user rejected your call");
    });

    socket.on("callEnded", ({ duration }) => {
      endCall(false, duration || getCallDuration());
    });

    socket.on("callFailed", ({ message }) => {
      console.error("Call failed:", message);
      setRemoteHungUp(true);
      endCall(false, 0);
      toast.error(`Call failed: ${message}`);
    });

    return () => {
      socket.off("callTargetSocket");
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("callFailed");
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
      }
    };
  }, [socket, userId, targetUserId]);

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
        <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
          {/* Display user name */}
          <div className="absolute top-4 left-0 right-0 text-center">
            <h2 className="text-white text-2xl font-semibold">
              {isRinging && !isCalling ? (
                <span>Incoming call from <span className="text-green-400">{callerName}</span></span>
              ) : (
                <span>Calling <span className="text-green-400">{targetUserName}</span></span>
              )}
            </h2>
          </div>
          
          <div className="relative w-full h-[80vh] max-w-5xl flex items-center justify-center">
            {isLocalMain ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted={muteLocalAudio}
                playsInline
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            ) : (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                onError={(e) => console.error("Remote video error:", e)}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            )}
            <div className="absolute bottom-4 right-4 w-40 h-40 bg-gray-800 rounded-lg overflow-hidden shadow-md border-2 border-white">
              {isLocalMain ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted={muteLocalAudio}
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            {isRinging && !isCalling ? (
              <>
                <button
                  onClick={() => (window as any).acceptCall()}
                  className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center gap-2"
                >
                  <Video size={20} />
                  Accept
                </button>
                <button
                  onClick={rejectCall}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center gap-2"
                >
                  <Video size={20} />
                  Reject
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleAudio}
                  className={`px-4 py-2 rounded-full text-white flex items-center gap-2 ${
                    muteLocalAudio ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {muteLocalAudio ? <MicOff size={20} /> : <Mic size={20} />}
                  {muteLocalAudio ? "Unmute" : "Mute"}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`px-4 py-2 rounded-full text-white flex items-center gap-2 ${
                    videoEnabled ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {videoEnabled ? <VideoOn size={20} /> : <VideoOff size={20} />}
                  {videoEnabled ? "Video Off" : "Video On"}
                </button>
                <button
                  onClick={() => endCall(true, getCallDuration())}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center gap-2"
                >
                  <Video size={20} />
                  End Call
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCall;