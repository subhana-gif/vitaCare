import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import { MoreVertical, Trash2 } from "lucide-react";

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const handleDelete = async (messageId: string) => {
    try {
      await axios.delete(`http://localhost:5001/api/chat/message/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      socket.emit("messageDeleted", { messageId, selectedPatient, doctorId });
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
  
  // Fetch chat list
  useEffect(() => {
    if (!doctorId) return;
  
    axios
      .get<Chat[]>(`http://localhost:5001/api/chat/doctor/${doctorId}/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setChatList(res.data))
      .catch((err) => console.error("Error fetching chat list:", err));
  
  }, [doctorId, token]);  
  
  useEffect(() => {
    if (!selectedPatient || !doctorId) return;

    // Join the room when a patient is selected
    socket.emit("joinRoom", { userId: selectedPatient, doctorId });

    // Listen for message deletion events
    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    };
    socket.on("messageDeleted", handleMessageDeleted);

    axios
      .get<Message[]>(`http://localhost:5001/api/chat/${selectedPatient}/${doctorId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // Sort messages by createdAt timestamp
        const sortedMessages = res.data.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
  
        // Mark messages as being viewed (but not yet read)
        const messageIds = new Set(sortedMessages.map(msg => msg._id));
        setViewedMessages(messageIds);
      })
      .catch((err) => console.error("Error fetching messages:", err));

    // Cleanup function to remove event listeners
    return () => {
      socket.off("messageDeleted");
    };
  }, [selectedPatient, doctorId, token]);

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
            // Sort messages after adding new one
            const newMessages = [...prev, message].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return newMessages;
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
                    className={`w-1/5 ${msg.sender === doctorId ? "bg-blue-200" : "bg-gray-200"} rounded-lg p-3 message-bubble relative flex flex-col`}
                    data-message-id={msg._id}
                    data-sender={msg.sender === doctorId ? "self" : "other"}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
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
                      </div>
                      {msg.sender === doctorId && (
                        <MessageDropdown
                          onDelete={() => {
                            setMessageToDelete(msg._id);
                            setShowConfirm(true);
                          }}
                          isOwnMessage={msg.sender === doctorId}
                        />
                      )}
                    </div>
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
            <ConfirmationDialog />

      </div>
    </div>
  );
};

export default DoctorChatPage;