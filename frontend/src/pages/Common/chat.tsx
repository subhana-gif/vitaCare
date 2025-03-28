import React, { useEffect, useState, useRef } from "react";
import { Share2, MoreVertical, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import io, { Socket } from "socket.io-client";
import { RootState } from "../../redux/store";
import { useParams } from "react-router-dom";
import axios from "axios";
import { doctorService } from "../../services/doctorService";

const socket: Socket = io("http://localhost:5001");

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
  
  const user = useSelector((state: RootState) => state.auth.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useSelector((state: RootState) => state.auth.accessToken);

  const handleDelete = async (messageId: string) => {
    try {
      await axios.delete(`http://localhost:5001/api/chat/message/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    isOwnMessage
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
            <div className="py-1">
              <button
                onClick={onDelete}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
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
              onClick={() => {
                if (messageToDelete) {
                  handleDelete(messageToDelete);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Fetch doctor details
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

  // Fetch chat history and set up Socket.IO listeners
  useEffect(() => {
    if (user && userId && doctorId) {
      // Join the room
      socket.emit("joinRoom", { userId, doctorId });

      // Listen for message deletion events
      const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      };
      socket.on("messageDeleted", handleMessageDeleted);

      // Fetch previous chat history
      axios.get<Message[]>(`http://localhost:5001/api/chat/${userId}/${doctorId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      .then((res) => {
        // Sort messages by createdAt timestamp
        const sortedMessages = res.data.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
      });

      // Listen for incoming messages
      const handleReceiveMessage = (msg: Message) => {
        setMessages((prev) => {
          // Check if the message already exists in the state to avoid duplicates
          if (!prev.some(m => m._id === msg._id)) {
            // Sort messages after adding new one
            const newMessages = [...prev, msg].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return newMessages;
          }
          return prev;
        });
      };

      socket.on("receiveMessage", handleReceiveMessage);

      // Cleanup listeners when component unmounts
      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("messageDeleted");
      };
    }
  }, [user, userId, doctorId, token]);

  // Send a message
  const sendMessage = async () => {
    if ((message.trim() || media) && user && userId && doctorId) {
      const receiverId = user._id === userId ? doctorId : userId;
  
      const formData = new FormData();
      formData.append("sender", user._id);
      formData.append("receiver", receiverId!);
      if (message.trim()) formData.append("text", message);
      if (media) formData.append("image", media);

      try {
        const res = await axios.post(
          "http://localhost:5001/api/chat/send",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );        

        socket.emit("sendMessage", res.data);
        setMessages((prev) => [...prev, res.data]);

        setMessage("");
        setMedia(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Trigger file input click
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full">
      <div className="chat-container flex flex-col h-[80vh] border rounded-lg shadow-lg w-full max-w-2xl mx-auto overflow-hidden">
        {/* Chat header */}
        <div className="chat-header p-3 border-b bg-blue-500 text-white rounded-t-lg flex-shrink-0 flex items-center gap-3">
          {doctor?.imageUrl && (
            <img
              src={doctor.imageUrl}
              alt="Doctor Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          )}
          <h2 className="font-semibold text-2xl">{doctor?.name || "Loading..."}</h2>
        </div>

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
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                (message.trim() || media) ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
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