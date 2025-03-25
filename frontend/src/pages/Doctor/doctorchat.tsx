import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import io, { Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5001");

// Define types
interface Chat {
  _id: string;
  userDetails: { name: string };
  lastMessage: string;
}

interface Message {
  _id: string; // Add unique ID for messages
  sender: string;
  receiver: string;
  text?: string;
  media?: string;
  type?: "image" | "video";
  createdAt: Date;  
  read: boolean; // Track read status
}

interface UnreadInfo {
  count: number;
  lastOpened: Date | null;
}

const DoctorChatPage: React.FC = () => {
  const doctorId = useSelector((state: any) => state.doctors.doctorId);
  const token = useSelector((state: any) => state.doctors.token);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [media, setMedia] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadInfo, setUnreadInfo] = useState<{ [key: string]: UnreadInfo }>({});
  const [viewedMessages, setViewedMessages] = useState<Set<string>>(new Set());
  
  // Fetch chat list
  useEffect(() => {
    if (!doctorId) return;
  
    axios
      .get<Chat[]>(`http://localhost:5001/api/chat/doctor/${doctorId}/chats`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setChatList(res.data))
      .catch((err) => console.error("Error fetching chat list:", err));
  
  }, [doctorId, token]);  // Include token as dependency
  
  // Fetch messages when a patient is selected
  useEffect(() => {
    if (!selectedPatient || !doctorId) return;
  
    axios
      .get<Message[]>(`http://localhost:5001/api/chat/${selectedPatient}/${doctorId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMessages(res.data);
  
        // Mark messages as being viewed (but not yet read)
        const messageIds = new Set(res.data.map(msg => msg._id));
        setViewedMessages(messageIds);
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [selectedPatient, doctorId, token]);  // Include token as dependency
  
  // Track when messages are actually viewed (scrolled into view)
  useEffect(() => {
    if (!selectedPatient) return;
    
    // Create an intersection observer to detect when messages are in view
    const options = {
      root: document.querySelector('.messages-container'),
      rootMargin: '0px',
      threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = entry.target.getAttribute('data-message-id');
          if (messageId) {
            // Mark message as read in the database
            axios.post(`http://localhost:5001/api/chat/markAsRead`, {
              messageId,
              doctorId
            }).catch(err => console.error("Error marking message as read:", err));
            
            // Update unread count when messages are actually viewed
            if (selectedPatient && viewedMessages.has(messageId)) {
              setUnreadInfo(prev => {
                const currentInfo = prev[selectedPatient] || { count: 0, lastOpened: null };
                if (currentInfo.count > 0) {
                  return {
                    ...prev,
                    [selectedPatient]: {
                      ...currentInfo,
                      count: Math.max(0, currentInfo.count - 1)
                    }
                  };
                }
                return prev;
              });
            }
          }
          
          // Stop observing this message
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    // Observe all message elements from the other user
    const messageElements = document.querySelectorAll('.message-bubble[data-sender="other"]');
    messageElements.forEach(el => observer.observe(el));
    
    return () => {
      observer.disconnect();
    };
  }, [messages, selectedPatient, doctorId]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for incoming messages and update state dynamically
  useEffect(() => {
    const handleReceiveMessage = (message: Message) => {
      // Update unread count for chats that aren't currently selected
      if (message.sender !== doctorId && message.sender !== selectedPatient) {
        setUnreadInfo(prev => {
          const currentInfo = prev[message.sender] || { count: 0, lastOpened: null };
          return {
            ...prev,
            [message.sender]: {
              ...currentInfo,
              count: currentInfo.count + 1
            }
          };
        });
      }

      // Add message to current chat if relevant
      if (message.sender === selectedPatient || message.receiver === selectedPatient) {
        setMessages(prev => {
          // Check if the message already exists in the state to avoid duplicates
          if (!prev.some(msg => msg._id === message._id)) {
            // If this is a new message, add it to viewedMessages if the chat is currently open
            if (message.sender === selectedPatient) {
              setViewedMessages(prev => new Set(prev).add(message._id));
            }
            return [...prev, message];
          }
          return prev;
        });
      }
    };

    // Join the room when a patient is selected
    if (selectedPatient && doctorId) {
      socket.emit("joinRoom", { userId: selectedPatient, doctorId });
    }

    // Listen for incoming messages
    socket.on("receiveMessage", handleReceiveMessage);

    // Cleanup the listener when the component unmounts or selectedPatient changes
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedPatient, doctorId]);

  // Handle sending message
  const sendMessage = async () => {
    if (!doctorId || !selectedPatient || (!text.trim() && !media)) return;

    const formData = new FormData();
    formData.append("sender", doctorId);
    formData.append("receiver", selectedPatient);
    if (text.trim()) formData.append("text", text);
    if (media) formData.append("image", media);

    try {
    const res = await axios.post(
      "http://localhost:5001/api/chat/send",
      formData,  // Send formData directly as the request body
      {
        headers: {
          "Content-Type": "multipart/form-data" ,
          Authorization: `Bearer ${token}`,
        },
      }
    );

      // Emit the message to Socket.io
      socket.emit("sendMessage", res.data);

      // Append sent message to chat
      setMessages(prev => [...prev, res.data]);

      // Clear input fields
      setText("");
      setMedia(null);
    } catch (err) {
      console.error("Error sending message:", err);
      if (axios.isAxiosError(err)) {
        console.error("Error details:", err.response?.data);
      }
    }
  };

  // Handle Enter key to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatient(patientId);
    
    // Record the time of opening this chat
    const now = new Date();
    setUnreadInfo(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId] || { count: 0, lastOpened: null },
        lastOpened: now
      }
    }));
    
    // Update the last opened timestamp in the database
    axios.post(`http://localhost:5001/api/chat/updateLastOpened`, {
      doctorId,
      patientId,
      createdAt: now
    }).catch(err => console.error("Error updating last opened timestamp:", err));
  };

  return (
    <div className="flex h-screen">
      {/* Chat List Sidebar */}
      <div className="w-1/3 h-screen bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        {chatList.length > 0 ? (
          chatList.map((chat) => (
            <div
              key={chat._id}
              onClick={() => handleSelectPatient(chat._id)}
              className={`p-3 cursor-pointer border-b hover:bg-gray-200 transition-colors flex items-center justify-between ${
                selectedPatient === chat._id ? "bg-blue-100" : ""
              }`}
            >
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">{chat.userDetails.name}</h3>
                <p className="text-gray-600 truncate">{chat.lastMessage}</p>
              </div>
              {(unreadInfo[chat._id]?.count > 0) && (
                <div className="flex-shrink-0 ml-2">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-white bg-blue-600 rounded-full">
                    {unreadInfo[chat._id].count}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No chats available</p>
        )}
      </div>

      {/* Chat Window */}
      <div className="w-2/3 h-screen flex flex-col">
        {selectedPatient ? (
          <>
            {/* Messages container with fixed height and scrolling */}
            <div className="flex-grow overflow-y-auto p-4 bg-gray-50 messages-container">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-3 my-3 flex ${msg.sender === doctorId ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`w-1/5 ${msg.sender === doctorId ? "bg-blue-200" : "bg-gray-200"} rounded-lg p-3 message-bubble`}
                    data-message-id={msg._id}
                    data-sender={msg.sender === doctorId ? "self" : "other"}
                  >
                    {msg.text && <p className="break-words text-xl">{msg.text}</p>}
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
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area with fixed position at bottom */}
            <div className="p-3 border-t bg-white">
              <div className="flex items-center">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="border rounded-lg flex-grow p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  placeholder="Type a message..."
                  rows={2}
                />
                <div className="ml-2 flex flex-col">
                  <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg mb-2 flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*, video/*"
                      onChange={(e) => setMedia(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                    />
                  </label>
                  <button 
                    onClick={sendMessage} 
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
              {media && (
                <div className="mt-2 p-2 bg-gray-100 rounded-lg flex items-center">
                  <span className="truncate flex-grow">{media.name}</span>
                  <button 
                    onClick={() => setMedia(null)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-8 max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <h2 className="text-xl font-bold mt-4">Select a chat to start messaging</h2>
              <p className="text-gray-600 mt-2">Choose a patient from the list to view your conversation history</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChatPage;