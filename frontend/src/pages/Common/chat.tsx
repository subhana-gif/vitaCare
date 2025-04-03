import React, { useEffect, useState, useRef } from "react";
import { Share2, MoreVertical, Trash2, Video } from "lucide-react"; // Added Video icon
import { useSelector } from "react-redux";
import io, { Socket } from "socket.io-client";
import { RootState } from "../../redux/store";
import { useParams } from "react-router-dom";
import axios from "axios";
import { doctorService } from "../../services/doctorService";

const socket: Socket = io("http://localhost:5001", { withCredentials: true });

// Define types
interface Message {
  _id: string;
  sender: string;
  receiver: string;
  text?: string;
  media?: string;
  type?: "image" | "video";
  createdAt: Date;
  read: boolean;
}

interface Doctor {
  _id: string;
  name: string;
  imageUrl: string;
}

const Chats: React.FC = () => {
  const { userId, doctorId } = useParams<{ userId?: string; doctorId?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [media, setMedia] = useState<File | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  // Video call states
  const [isCalling, setIsCalling] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useSelector((state: RootState) => state.auth.accessToken);

  // --- Video Call Logic ---
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: doctorId,
          candidate: event.candidate,
        });
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

    socket.emit("callUser", { to: doctorId, from: userId, offer });
  };

  const acceptCall = async () => {
    setIsRinging(false);
    setIsCalling(true);
  };

  const rejectCall = () => {
    setIsRinging(false);
    socket.emit("rejectCall", { to: doctorId });
  };

  const endCall = () => {
    setIsCalling(false);
    peerConnectionRef.current?.close();
    socket.emit("endCall", { to: doctorId });
  };

  useEffect(() => {
    if (userId && doctorId) {
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
    }
  }, [userId, doctorId]);

  // --- Existing Chat Logic ---
  const handleDelete = async (messageId: string) => {
    try {
      await axios.delete(`http://localhost:5001/api/chat/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      socket.emit("messageDeleted", { messageId, userId, doctorId });
      setShowConfirm(false);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const MessageDropdown = ({
    onDelete,
    isOwnMessage,
  }: {
    onDelete: () => void;
    isOwnMessage: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOwnMessage) return null;

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-gray-200 text-gray-700 hover:text-gray-900"
        >
          <MoreVertical size={18} />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <button
              onClick={onDelete}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  const ConfirmationDialog = () => {
    if (!showConfirm) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
          <p className="text-gray-800 mb-4">Are you sure you want to delete this message?</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => messageToDelete && handleDelete(messageToDelete)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (doctorId) {
      const fetchDoctorDetails = async () => {
        try {
          const doctorData = await doctorService.getDoctorById(doctorId);
          setDoctor(doctorData);
        } catch (err) {
          console.error("Error fetching doctor details:", err);
        }
      };
      fetchDoctorDetails();
    }
  }, [doctorId]);

  useEffect(() => {
    if (user && userId && doctorId) {
      socket.emit("joinRoom", { userId, doctorId });
      const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      };
      socket.on("messageDeleted", handleMessageDeleted);

      axios
        .get<Message[]>(`http://localhost:5001/api/chat/${userId}/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
        .then((res) => {
          const sortedMessages = res.data.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setMessages(sortedMessages);
        })
        .catch((err) => console.error("Error fetching messages:", err));

      const handleReceiveMessage = (msg: Message) => {
        setMessages((prev) =>
          prev.some((m) => m._id === msg._id)
            ? prev
            : [...prev, msg].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              )
        );
      };
      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("messageDeleted");
      };
    }
  }, [user, userId, doctorId, token]);

  const sendMessage = async () => {
    if ((message.trim() || media) && user && userId && doctorId) {
      const receiverId = user._id === userId ? doctorId : userId;
      const formData = new FormData();
      formData.append("sender", user._id);
      formData.append("receiver", receiverId!);
      if (message.trim()) formData.append("text", message);
      if (media) formData.append("image", media);

      try {
        const res = await axios.post("http://localhost:5001/api/chat/send", formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        socket.emit("sendMessage", res.data);
        setMessages((prev) => [...prev, res.data]);
        setMessage("");
        setMedia(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full">
      <div className="chat-container flex flex-col h-[80vh] border rounded-lg shadow-lg w-full max-w-2xl mx-auto overflow-hidden">
        {/* Chat header with Video Call button */}
        <div className="chat-header p-3 border-b bg-blue-500 text-white rounded-t-lg flex-shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {doctor?.imageUrl && (
              <img
                src={doctor.imageUrl}
                alt="Doctor Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <h2 className="font-semibold text-2xl">{doctor?.name || "Loading..."}</h2>
          </div>
          <button
            onClick={startCall}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center gap-1"
            disabled={isCalling || isRinging}
          >
            <Video size={20} />
            <span>Video Call</span>
          </button>
        </div>

        {/* Video Call UI (shown when calling or ringing) */}
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

        {/* Messages container */}
        <div className="flex-grow overflow-y-auto p-3">
          {messages.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No messages yet</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 my-2 rounded-lg max-w-xs relative flex items-start ${
                  msg.sender === user?._id
                    ? "bg-blue-500 text-white self-end ml-auto"
                    : "bg-gray-200 self-start mr-auto"
                }`}
              >
                <div className="flex-grow">
                  {msg.text && <p>{msg.text}</p>}
                  {msg.media && (
                    <div className="media-container">
                      {msg.media.endsWith(".mp4") ? (
                        <video
                          src={msg.media}
                          controls
                          className="w-64 h-48 object-cover rounded"
                        />
                      ) : (
                        <img
                          src={msg.media}
                          alt="Shared Media"
                          className="w-64 h-48 object-cover rounded"
                        />
                      )}
                    </div>
                  )}
                  <span className="text-xs opacity-75 block text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <MessageDropdown
                  isOwnMessage={msg.sender === user?._id}
                  onDelete={() => {
                    setMessageToDelete(msg._id);
                    setShowConfirm(true);
                  }}
                />
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-area p-3 border-t flex-shrink-0">
          {media && (
            <div className="media-preview mb-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={URL.createObjectURL(media)}
                    alt="Media preview"
                    className="h-12 w-12 object-cover rounded"
                  />
                  <button
                    onClick={() => setMedia(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
                <span className="text-sm text-gray-500 truncate max-w-xs">{media.name}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAttachmentClick}
              className="p-2 text-blue-500 hover:bg-blue-100 rounded-full"
            >
              <Share2 size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={(e) => setMedia(e.target.files ? e.target.files[0] : null)}
              className="hidden"
            />
            <input
              type="text"
              className="flex-1 p-2 border rounded"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
            />
            <button
              className={`p-2 rounded ${
                message.trim() || media ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
              }`}
              onClick={sendMessage}
              disabled={!message.trim() && !media}
            >
              Send
            </button>
          </div>
        </div>
        <ConfirmationDialog />
      </div>
    </div>
  );
};

export default Chats;