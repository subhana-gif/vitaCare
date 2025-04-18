import React, { useEffect, useState, useRef } from "react";
import { MoreVertical, Trash2, Share2, Video } from "lucide-react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import VideoCall from "../ui/videoCall";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { userService } from "../../services/userService";
import { doctorService } from "../../services/doctorService";

const socket: Socket = io("https://vitacare.life", {
  withCredentials: true,
});

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  text?: string;
  media?: string;
  type?: "image" | "video" | "call";
  createdAt: Date;
  read: boolean;
  status?: "Missed" | "Not Answered" | "Completed";
  callDuration?: number;
}

interface CommonChatProps {
  currentUserId: string;
  targetUserId: string;
  token: string | null;
  isDoctor: boolean;
  headerName?: string;
  headerImageUrl?: string;
  targetUserName?: string; 
}

const CommonChat: React.FC<CommonChatProps> = ({
  currentUserId,
  targetUserId,
  token,
  isDoctor,
  headerName,
  headerImageUrl,
  targetUserName,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [media, setMedia] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>(""); // Add state for currentUserName
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

useEffect(() => {
  const fetchCurrentUser = async () => {
    if (!accessToken || !currentUserId) return;
    
    try {
      // First try to get user profile
      try {
        const profileData = await userService.getProfile(accessToken);
        setCurrentUserName(profileData.name);
      } catch (userError) {
        console.log("Not a regular user, trying doctor profile...");
        // If user profile fails, try doctor profile
        const doctorData = await doctorService.getDoctorById(currentUserId);
        setCurrentUserName(doctorData.name);
      }
    } catch (error) {
      console.error("Error fetching current user name:", error);
      setCurrentUserName("User"); // Fallback name
    }
  };
  
  fetchCurrentUser();
}, [currentUserId, accessToken]); // Use accessToken instead of token
  const getDateHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const messageDate = new Date(date);
    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!token || !currentUserId || !targetUserId) {
      console.error("Cannot delete message: missing token, currentUserId, or targetUserId", {
        token,
        currentUserId,
        targetUserId,
      });
      return;
    }
    try {
      await axios.delete(`https://vitacare.life/api/chat/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));

      const userId = isDoctor ? targetUserId : currentUserId;
      const doctorId = isDoctor ? currentUserId : targetUserId;

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
    if (!currentUserId || !targetUserId || !token) {
      console.error("Missing required params:", { currentUserId, targetUserId, token });
      return;
    }

    socket.emit("joinRoom", { userId: targetUserId, doctorId: currentUserId });

    const fetchMessages = async () => {
      try {
        const res = await axios.get<Message[]>(`https://vitacare.life/api/chat/${targetUserId}/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const sortedMessages = res.data.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();

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

    const handleCallHistory = (callData: Message) => {
      // Add call history directly instead of refetching all messages
      setMessages((prev) => {
        const exists = prev.some((m) => 
          m.createdAt.toString() === callData.createdAt.toString() && 
          m.type === "call" && 
          m.sender === callData.sender && 
          m.receiver === callData.receiver
        );
        if (!exists) {
          return [...prev, callData].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        return prev; // Skip if duplicate
      });
    };
    socket.on("callHistory", handleCallHistory);

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => [...prev.filter((msg) => msg._id !== messageId)]);
    };
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("callHistory", handleCallHistory);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [currentUserId, targetUserId, token]);

  const sendMessage = async () => {
    if (!currentUserId || !targetUserId || (!text.trim() && !media) || !token) {
      console.error("Cannot send message: missing required fields", { currentUserId, targetUserId, text, media, token });
      return;
    }

    const formData = new FormData();
    formData.append("sender", currentUserId);
    formData.append("receiver", targetUserId);
    if (text.trim()) formData.append("text", text);
    if (media) formData.append("image", media);

    try {
      const res = await axios.post("https://vitacare.life/api/chat/send", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      socket.emit("sendMessage", res.data);
      setMessages((prev) => [...prev, res.data]);
      setText("");
      setMedia(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error sending message:", err);
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
    <div className="flex flex-col h-[80vh] border rounded-lg shadow-lg overflow-hidden">
      <div className="p-3 border-b bg-blue-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          {headerImageUrl && (
            <img
              src={headerImageUrl}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <h2 className="text-xl font-semibold">{headerName || "Chat"}</h2>
        </div>
        <VideoCall 
          socket={socket} 
          userId={currentUserId} 
          targetUserId={targetUserId}
          userName={currentUserName || "You"} 
          targetUserName={targetUserName || headerName || "User"} 
        />
      </div>

      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No messages yet</div>
        ) : (
          <>
            {messages
              .reduce((acc: { date: string; messages: Message[] }[], msg) => {
                const dateHeader = getDateHeader(new Date(msg.createdAt));
                const lastGroup = acc[acc.length - 1];
                if (lastGroup && lastGroup.date === dateHeader) {
                  lastGroup.messages.push(msg);
                } else {
                  acc.push({ date: dateHeader, messages: [msg] });
                }
                return acc;
              }, [])
              .map((group, index) => (
                <div key={index}>
                  <div className="text-center text-gray-500 my-4">{group.date}</div>
                  {group.messages.map((msg) => {
                    const isOutgoing = msg.sender === currentUserId;
                    return (
                      <div
                        key={msg._id}
                        className={`p-3 my-2 rounded-lg max-w-xs relative ${
                          isOutgoing
                            ? "bg-blue-500 text-white self-end ml-auto"
                            : "bg-gray-200 self-start mr-auto"
                        } ${
                          msg.type === "call"
                            ? (msg.status === "Missed" || msg.status === "Not Answered"
                                ? "bg-red-800 text-red-800"
                                : "bg-green-950 text-green-950") + " !bg-opacity-20"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-grow">
                            {msg.type === "call" ? (
                              <div className="flex items-center gap-2">
                                <Video
                                  size={18}
                                  className={
                                    msg.status === "Missed" || msg.status === "Not Answered"
                                      ? "text-red-800"
                                      : "text-green-800"
                                  }
                                />
                                <div>
                                  <p className="font-medium">
                                    {msg.status === "Completed"
                                      ? `${isOutgoing ? "Outgoing" : "Incoming"} video call (${msg.callDuration || 0} min)`
                                      : msg.status === "Missed"
                                      ? `${isOutgoing ? "Outgoing" : "Incoming"} missed video call`
                                      : `${isOutgoing ? "Outgoing" : "Incoming"} not answered video call`}
                                  </p>
                                  <p className="text-xs opacity-75 mt-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.text && <p>{msg.text}</p>}
                                {msg.media && (
                                  <div className="media-container mt-2">
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
                                {(msg.text || msg.media) && (
                                  <span className="text-xs opacity-75 block text-right mt-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          {msg.type !== "call" && (
                            <MessageDropdown
                              isOwnMessage={msg.sender === currentUserId}
                              onDelete={() => {
                                setMessageToDelete(msg._id);
                                setShowConfirm(true);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t bg-white">
        {media && (
          <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center">
            <img
              src={URL.createObjectURL(media)}
              alt="Media preview"
              className="h-12 w-12 object-cover rounded"
            />
            <span className="truncate flex-grow ml-2">{media.name}</span>
            <button
              onClick={() => setMedia(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
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
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            placeholder="Type a message..."
            rows={2}
          />
          <button
            onClick={sendMessage}
            className={`p-2 rounded ${
              text.trim() || media ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
            }`}
            disabled={!text.trim() && !media}
          >
            Send
          </button>
        </div>
      </div>
      <ConfirmationDialog />
    </div>
  );
};

export default CommonChat;