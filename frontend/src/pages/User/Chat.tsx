import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store"; 
import { userService } from "../../services/userService";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const token = useSelector((state: RootState) => state.auth.accessToken); 
  // Focus input field when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = { 
      sender: "user", 
      text: message.trim(),
      timestamp: new Date()
    };
    
    setChatHistory((prevChat) => [...prevChat, userMessage]);
    setIsLoading(true);

    try {
      const data = await userService.sendMessage(message, token || ""); 

      console.log("API Response:", data); // Debugging

      setChatHistory((prevChat) => [
          ...prevChat,
          { sender: "bot", text: data.response, timestamp: new Date() },
      ]);
  } catch (error) {
      console.error("Chat API error:", error);
      
      setChatHistory((prevChat) => [
          ...prevChat,
          { 
              sender: "bot", 
              text: "Sorry, I'm having trouble connecting. Please try again in a moment.",
              timestamp: new Date()
          },
      ]);
  } finally {
      setIsLoading(false);
      setMessage(""); // Clear input field
  }  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col max-w-xl mx-auto bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 h-[80vh]">
      {/* Header */}
      <div className="bg-gray-900 text-white p-2 flex items-center">
        <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
        <h2 className="font-medium text-xl">AI Assistant</h2>
      </div>

      {/* Chat Container - Full height without scrolling */}
      <div className="flex-1 p-2 bg-gray-800 space-y-2">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-400 mt-4">
            <p className="text-lg"> Ask me anything to get started...</p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div 
              key={index} 
              className={`max-w-[85%] mb-2 ${msg.sender === "user" ? "ml-auto" : "mr-auto"}`}
            >
              <div 
                className={`py-1 px-2 rounded-lg ${
                  msg.sender === "user" 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-gray-700 text-gray-100 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              <div 
                className={`text-xl ${
                  msg.sender === "user" ? "text-right" : "text-left"
                } text-gray-500`}
              >
                {formatTime(msg.timestamp)}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-center max-w-[85%]">
            <div className="bg-gray-700 p-1 rounded-lg flex space-x-1">
              <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="p-2 bg-gray-900 border-t border-gray-700">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type message..."
            className="flex-1 py-1 px-3 text-xl border border-gray-600 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !message.trim()}
            className={`ml-1 p-1 rounded-full ${
              isLoading || !message.trim() 
                ? "bg-gray-600 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 transition-colors"
            } text-white flex items-center justify-center`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
