import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CommonChat from "../../components/common/chats";
import { doctorService } from "../../services/doctorService";
import { Chat } from "../../types/chat";

interface UnreadInfo {
  count: number;
  lastOpened: Date | null;
}

const DoctorChatPage: React.FC = () => {
  const doctorId = useSelector((state: any) => state.doctors.doctorId);
  const token = useSelector((state: any) => state.doctors.token);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [unreadInfo, setUnreadInfo] = useState<{ [key: string]: UnreadInfo }>({});

  // Fetch chat list and sort by the most recent message
useEffect(() => {
  if (!doctorId) return;

  const fetchChats = async () => {
    try {
      const chats = await doctorService.fetchDoctorChats(doctorId, token);
      
      // Sort by lastMessageTime in descending order
      const sortedChats = [...chats].sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });
      
      setChatList(sortedChats);
    } catch (err) {
      console.error("Error fetching chat list:", err);
    }
  };

  fetchChats();
}, [doctorId, token]);

  // Helper function to safely get a valid date object
  const getValidDate = (dateString: string | Date | undefined | null): Date | null => {
    if (!dateString) return null;
    
    // If already a Date object
    if (dateString instanceof Date) {
      return isNaN(dateString.getTime()) ? null : dateString;
    }
    
    // Try parsing string date
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      console.error("Invalid date format:", dateString);
      return null;
    }
  };

  // Handle patient selection and update unread message info
  const handleSelectPatient = (patientId: string) => {
    setSelectedPatient(patientId);
    console.log(`Selected patient: currentUserId=${doctorId}, targetUserId=${patientId}`);
    const now = new Date();
    setUnreadInfo((prev) => ({
      ...prev,
      [patientId]: { ...(prev[patientId] || { count: 0, lastOpened: null }), lastOpened: now },
    }));
  };

  const formatMessageTime = (dateString: string | Date | undefined | null): string => {
    if (!dateString) return "No messages";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "No messages";
    
    const now = new Date();
    
    // Today - show time with AM/PM
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday " + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Within 7 days - show weekday and time
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    if (date > lastWeek) {
      return date.toLocaleDateString([], { weekday: 'short' }) + " " + 
             date.toLocaleTimeString([], {
               hour: '2-digit',
               minute: '2-digit',
               hour12: true
             });
    }
    
    // Older than 7 days - show date and time
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' })
    }) + " " + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{chat.userDetails.name}</h3>
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(chat.lastMessageTime)} 
                  </span>
                </div>
                <p className="text-gray-600 truncate">
                  {chat.lastMessage || "No messages yet"}
                </p>
              </div>
              {unreadInfo[chat._id]?.count > 0 && (
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
          <CommonChat
            currentUserId={doctorId}
            targetUserId={selectedPatient}
            token={token}
            isDoctor={true}
            headerName={chatList.find((chat) => chat._id === selectedPatient)?.userDetails.name}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-8 max-w-md">
              <h2 className="text-xl font-bold mt-4">Select a chat to start messaging</h2>
              <p className="text-gray-600 mt-2">
                Choose a patient from the list to view your conversation history
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChatPage;