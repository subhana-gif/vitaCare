import React, { useEffect, useState, useRef } from "react";
import { MoreVertical, Trash2, Share2 } from "lucide-react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import VideoCall from "../ui/videoCall";

const socket: Socket = io("http://localhost:5001", { withCredentials: true });

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

interface UserInfo {
  id: string;
  name: string;
  imageUrl?: string;
}

interface CommonChatProps {
  currentUserId: string;
  targetUserId: string;
  token: string | null;
  isDoctor: boolean;
  headerName?: string;
  headerImageUrl?: string;
}

const CommonChat: React.FC<CommonChatProps> = ({
  currentUserId,
  targetUserId,
  token,
  isDoctor,
  headerName,
  headerImageUrl,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [media, setMedia] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      await axios.delete(`http://localhost:5001/api/chat/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      
      // Determine userId and doctorId based on isDoctor prop
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
    if (!currentUserId || !targetUserId || !token) return;
  
    // Join the room
    socket.emit("joinRoom", { userId: targetUserId, doctorId: currentUserId });
  
    // Fetch initial messages
    axios
      .get<Message[]>(`http://localhost:5001/api/chat/${targetUserId}/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then((res) => {
        const sortedMessages = res.data.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
      })
      .catch((err) => console.error("Error fetching messages:", err));
  
    // Set up message receive listener
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
  
    // Set up message deletion listener
    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
        setMessages((prev) => {
          const newMessages = [...prev.filter((msg) => msg._id !== messageId)]; // Spread into a new array
          return newMessages;
        });
      };
      
      socket.on("messageDeleted", handleMessageDeleted);
  
    // Cleanup
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [currentUserId, targetUserId, token]);
  const sendMessage = async () => {
    if (!currentUserId || !targetUserId || (!text.trim() && !media) || !token) return;

    const formData = new FormData();
    formData.append("sender", currentUserId);
    formData.append("receiver", targetUserId);
    if (text.trim()) formData.append("text", text);
    if (media) formData.append("image", media);

    try {
      const res = await axios.post("http://localhost:5001/api/chat/send", formData, {
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
      {/* Chat Header */}
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
        <VideoCall socket={socket} userId={currentUserId} targetUserId={targetUserId} />
      </div>

      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No messages yet</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-3 my-2 rounded-lg max-w-xs relative flex items-start ${
                msg.sender === currentUserId
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-200 self-start mr-auto"
              }`}
            >
              <div className="flex-grow">
                {msg.text && <p>{msg.text}</p>}
                {msg.media && (
                  <div className="media-container">
                    {msg.media.endsWith(".mp4") ? (
                      <video src={msg.media} controls className="w-64 h-48 object-cover rounded" />
                    ) : (
                      <img src={msg.media} alt="Shared Media" className="w-64 h-48 object-cover rounded" />
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
                isOwnMessage={msg.sender === currentUserId}
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

      {/* Input Area */}
      <div className="p-3 border-t bg-white">
        {media && (
          <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center">
            <img
              src={URL.createObjectURL(media)}
              alt="Media preview"
              className="h-12 w-12 object-cover rounded"
            />
            <span className="truncate flex-grow ml-2">{media.name}</span>
            <button onClick={() => setMedia(null)} className="ml-2 text-red-500 hover:text-red-700">
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