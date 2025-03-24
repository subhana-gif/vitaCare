import React, { useEffect, useState, useRef } from "react";
import { Share2 } from "lucide-react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { RootState } from "../../redux/store"; // Adjust this import based on your store setup
import { useParams } from "react-router-dom";
import axios from "axios";
import { doctorService } from "../../services/doctorService";

const socket = io("http://localhost:5001"); // Change to your backend URL

// Define the message type
interface Message {
  _id: string;
  sender: string;
  receiver: string;
  text: string;
  createdAt: Date;  
  media?: string; // For image messages
}

// Define the doctor type
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null); // State to store doctor details
  const user = useSelector((state: RootState) => state.auth.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch doctor details using the service
  useEffect(() => {
    if (doctorId) {
      const fetchDoctorDetails = async () => {
        try {
          const doctorData = await doctorService.getDoctorById(doctorId);
          setDoctor(doctorData); // Set doctor details
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
      setIsLoading(true);
      
      // Join the room
      socket.emit("joinRoom", { userId, doctorId });

      // Fetch previous chat history
      fetch(`http://localhost:5001/api/chat/${userId}/${doctorId}`)
        .then((res) => res.json())
        .then((data) => {
          setMessages(data); // Load old messages from DB
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching messages:", err);
          setIsLoading(false);
        });
      // Listen for incoming messages
      const handleReceiveMessage = (msg: Message) => {
        console.log("Received message:", msg);
        setMessages((prev) => {
          // Check if the message already exists in the state to avoid duplicates
          if (!prev.some(m => m._id === msg._id)) {
            return [...prev, msg];
          }
          return prev;
        });
      };

      socket.on("receiveMessage", handleReceiveMessage);

      // Cleanup the listener when the component unmounts or when userId/doctorId changes
      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [user, userId, doctorId]); // Depend on correct IDs

  // Send a message
  const sendMessage = async () => {
    if ((message.trim() || media) && user && userId && doctorId) {
      setIsLoading(true);
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
          { headers: { "Content-Type": "multipart/form-data" } }
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
      } finally {
        setIsLoading(false);
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
  
  return (
    <div className="w-full">
      <div className="chat-container flex flex-col h-[80vh] border rounded-lg shadow-lg w-full max-w-2xl mx-auto overflow-hidden">
        {/* Chat header - fixed at top */}
        <div className="chat-header p-3 border-b bg-blue-500 text-white rounded-t-lg flex-shrink-0 flex items-center gap-3">
  {doctor?.imageUrl && (
    <img
      src={doctor.imageUrl} // Updated to use imageUrl
      alt="Doctor Profile"
      className="w-20 h-20 rounded-full object-cover"
    />
  )}
  <h2 className="font-semibold text-2xl">{doctor?.name || "Loading..."}</h2>
</div>        
        {/* Messages container - only this section scrolls */}
        <div className="flex-grow overflow-y-auto p-3">
          {isLoading && messages.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No messages yet</div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 my-2 rounded-lg max-w-xs ${
                  msg.sender === user?._id
                    ? "bg-blue-500 text-white self-end ml-auto"
                    : "bg-gray-200 self-start mr-auto"
                }`}
              >
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
            ))
          )}
          <div ref={messagesEndRef} /> {/* Empty div for auto-scrolling */}
        </div>
        
        {/* Input area - fixed at bottom */}
        <div className="chat-input-area p-3 border-t flex-shrink-0">
          {/* Media preview if selected */}
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
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
            />
            <button
              className={`p-2 rounded ${
                (message.trim() || media) ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
              }`}
              onClick={sendMessage}
              disabled={isLoading || (!message.trim() && !media)}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chats;