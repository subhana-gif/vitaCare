import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Video, Mic, MicOff, VideoOff, Video as VideoOn } from "lucide-react";
import { toast } from "react-toastify";
import basslineWonderland from "../../assets/bassline_wonderland.mp3";

interface VideoCallProps {
  socket: Socket;
  userId: string;
  targetUserId: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ socket, userId, targetUserId }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [muteLocalAudio, setMuteLocalAudio] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [remoteStreamId, setRemoteStreamId] = useState<string | null>(null);
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

  useEffect(() => {
    console.log("useEffect triggered for call state:", { isCalling, isRinging });
    if (isCalling && !isRinging) {
      console.log("Call started, setting callStartTime:", new Date());
      setCallStartTime(new Date());
    }
  }, [isCalling, isRinging]);
  
  const getCallDuration = () => {
    if (!callStartTime) {
      console.log("No callStartTime, returning duration 0");
      return 0;
    }
    const duration = Math.round((new Date().getTime() - callStartTime.getTime()) / 1000); // in seconds
    console.log("Calculated call duration:", duration, "seconds");
    return duration;
  };

  const playVideo = async (element: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!element || !stream) {
      console.log("playVideo: No element or stream provided");
      return;
    }
    
    try {
      console.log("playVideo: Assigning stream to element");
      if (element.srcObject !== stream) {
        element.srcObject = stream;
      }
      
      element.muted = element === localVideoRef.current;
      
      const playPromise = element.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log("playVideo: Video playback started successfully");
      }
    } catch (error) {
      console.error('playVideo: Error playing video:', error);
      if (error.name === 'AbortError') {
        console.log("playVideo: Retry scheduled due to AbortError");
        setTimeout(() => playVideo(element, stream), 500);
      }
    }
  };

  useEffect(() => {
    console.log("useEffect triggered for ringtone initialization");
    ringAudioRef.current = new Audio(basslineWonderland);
    ringAudioRef.current.loop = true;
    ringAudioRef.current.volume = 0.5;
    ringAudioRef.current.onloadeddata = () => {
      console.log("Ringtone loaded successfully");
      document.addEventListener(
        "click",
        () => {
          ringAudioRef.current?.play()
            .then(() => {
              ringAudioRef.current?.pause();
              console.log("Audio preloaded and unlocked");
            })
            .catch((e) => console.error("Preload error:", e));
        },
        { once: true }
      );
    };
    ringAudioRef.current.onerror = (e) => console.error("Error loading ringtone:", e);
  }, []);

  useEffect(() => {
    console.log("useEffect triggered for ringing state:", isRinging);
    if (isRinging && ringAudioRef.current) {
      console.log("Attempting to play ringtone");
      ringAudioRef.current.currentTime = 0;
      ringAudioRef.current
        .play()
        .then(() => console.log("Ringtone playing"))
        .catch((e) => console.error("Error playing ringtone:", e));
    } else if (!isRinging && ringAudioRef.current) {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
      console.log("Ringtone paused");
    }
  }, [isRinging]);

  const checkPermissions = async (): Promise<boolean> => {
    try {
      console.log("Checking permissions for camera and microphone");
      const cameraPermission = await navigator.permissions.query({ name: "camera" as PermissionName });
      const micPermission = await navigator.permissions.query({ name: "microphone" as PermissionName });
      if (cameraPermission.state === "denied" || micPermission.state === "denied") {
        console.log("Permissions denied for camera or microphone");
        toast.error("Camera or microphone access is denied. Please enable both in your browser settings.");
        return false;
      }
      console.log("Permissions granted");
      return true;
    } catch (err) {
      console.error("Permission check error:", err);
      return true;
    }
  };

  const createPeerConnection = () => {
    console.log("Creating new peer connection");
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
  
    pc.onicecandidate = (event) => {
      console.log("ICE Candidate:", event.candidate ? "Found" : "All candidates gathered");
      if (event.candidate && targetSocketId) {
        console.log("Sending ICE candidate to", targetSocketId);
        socket.emit("iceCandidate", { to: targetSocketId, candidate: event.candidate });
      }
    };
  
    pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      const remoteStream = new MediaStream();
      event.streams[0].getTracks().forEach((track) => {
        console.log(`Adding remote ${track.kind} track`);
        remoteStream.addTrack(track);
      });
      
      playVideo(remoteVideoRef.current, remoteStream);
      setRemoteStreamId(remoteStream.id);
    };
    
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      setConnectionState(state);
      console.log("PeerConnection state changed to:", state);
      if (state === "disconnected" || state === "failed" || state === "closed") {
        console.log("Call ended due to connection state:", state);
        endCall(false, getCallDuration());
      } else if (state === "connected") {
        console.log("Peer connection established successfully");
      }
    };
  
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      setIceState(state);
      console.log("ICE connection state changed to:", state);
      if (state === "failed" || state === "disconnected") {
        console.log("ICE connection failed, attempting to end call");
        endCall(false, getCallDuration());
      } else if (state === "connected") {
        console.log("ICE connection established");
      }
    };
  
    return pc;
  };

  const startCall = async () => {
    console.log("Starting call with userId:", userId, "targetUserId:", targetUserId);
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) return;

      setIsCalling(true);
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("Available devices:", devices);
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
      console.log("Local stream acquired");
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((e) => console.error("Error playing local video:", e));
      }
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      stream.getAudioTracks()[0].enabled = !muteLocalAudio;
      stream.getVideoTracks()[0].enabled = videoEnabled;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("Offer created and set, emitting callUser");
      socket.emit("callUser", { to: targetUserId, from: userId, offer });
    } catch (error: any) {
      console.error("Error starting call:", error.name, error.message);
      setIsCalling(false);
      toast.error(`Failed to start video call: ${error.message}`);
    }
  };

  const acceptCall = async (offer: RTCSessionDescriptionInit, socketId: string) => {
    console.log("Accepting call from socketId:", socketId);
    try {
      setIsRinging(false);
      if (isCalling) return;
      setIsCalling(true);

      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("Available devices:", devices);
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
      console.log("Local stream acquired");
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((e) => console.error("Error playing local video:", e));
      }
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      stream.getAudioTracks()[0].enabled = !muteLocalAudio;
      stream.getVideoTracks()[0].enabled = videoEnabled;

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log("Answer created and set, emitting acceptCall");
      socket.emit("acceptCall", { to: socketId, answer });
    } catch (error: any) {
      console.error("Error accepting call:", error.name, error.message);
      setIsCalling(false);
      toast.error(`Failed to accept call: ${error.message}`);
    }
  };

  const rejectCall = () => {
    console.log("Rejecting call, targetSocketId:", targetSocketId);
    setIsRinging(false);
    socket.emit("rejectCall", { to: targetSocketId });
  };

  const endCall = (initiatedLocally = true, callDuration = 0) => {
    console.log("Ending call, initiatedLocally:", initiatedLocally, "duration:", callDuration);
    if (initiatedLocally && targetSocketId) {
      console.log("Emitting endCall to:", targetSocketId);
      socket.emit("endCall", { to: targetSocketId });
    }
  
    let status: "Completed" | "Missed" | "Not Answered";
    if (initiatedLocally) {
      status = "Completed";
    } else {
      status = remoteHungUp ? "Not Answered" : "Missed";
    }
  
    // Emit callHistory regardless of connection state, since a call was initiated
    const callData = {
      sender: userId,
      receiver: targetUserId,
      type: "call",
      status,
      callDuration: Math.round(callDuration / 60), // Convert to minutes
      createdAt: new Date(),
    };
    console.log("Emitting callHistory with data:", callData);
    socket.emit("callHistory", callData);
  
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      console.log("Peer connection cleaned up");
    }
  
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
      console.log("Local stream tracks stopped");
    }
  
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
      console.log("Local video source cleared");
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      console.log("Remote video source cleared");
    }
  
    setIsCalling(false);
    setIsRinging(false);
    setRemoteHungUp(false);
    setRemoteStreamId(null);
    
    if (ringAudioRef.current) {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
      console.log("Ringtone paused and reset");
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setMuteLocalAudio(!audioTrack.enabled);
      console.log("Audio toggled, muted:", !audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
      console.log("Video toggled, enabled:", videoTrack.enabled);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered for socket listeners");
    socket.on("callTargetSocket", ({ targetSocketId }) => {
      console.log("Received callTargetSocket, setting targetSocketId:", targetSocketId);
      setTargetSocketId(targetSocketId);
    });
    socket.emit("registerVideoCall", userId);

    socket.on("incomingCall", async ({ from, offer, socketId }) => {
      console.log("Received incomingCall from:", from, "socketId:", socketId);
      setIsRinging(true);
      setTargetSocketId(socketId);
      const proceed = await checkPermissions();
      if (proceed) {
        (window as any).acceptCall = () => acceptCall(offer, socketId);
        setTimeout(() => {
          if (isRinging && !isCalling) rejectCall();
        }, 30000);
      }
    });

    socket.on("callAccepted", async ({ answer }) => {
      console.log("Received callAccepted, setting remote description");
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      console.log("Received iceCandidate");
      if (candidate && peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("Added ICE candidate");
      }
    });

    socket.on("callRejected", () => {
      console.log("Call was rejected by remote user");
      endCall(false, 0);
      toast.warn("The other user rejected your call");
    });

    socket.on("callEnded", () => {
      console.log("Remote user ended the call");
      endCall(false, getCallDuration());
    });

    socket.on("callFailed", ({ message }) => {
      console.error("Call failed:", message);
      setRemoteHungUp(true);
      endCall(false, 0);
      toast.error(`Call failed: ${message}`);
    });

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("callTargetSocket");
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("callFailed");
      if (ringAudioRef.current) ringAudioRef.current.pause();
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
                onError={(e) => console.error('Remote video error:', e)}
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