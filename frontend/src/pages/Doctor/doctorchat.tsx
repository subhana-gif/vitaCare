import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import CommonChat from "../../components/common/chats";

interface Chat {
  _id: string;
  userDetails: { name: string };
  lastMessage: string;
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
  const [unreadInfo, setUnreadInfo] = useState<{ [key: string]: UnreadInfo }>({});

  useEffect(() => {
    if (!doctorId) return;
    axios
      .get<Chat[]>(`http://localhost:5001/api/chat/doctor/${doctorId}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setChatList(res.data))
      .catch((err) => console.error("Error fetching chat list:", err));
      console.log(`DoctorChatPage: doctorId=${doctorId}, token=${token}`);
  }, [doctorId, token]);

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatient(patientId);
    console.log(`Selected patient: currentUserId=${doctorId}, targetUserId=${patientId}`);
    const now = new Date();  
    setUnreadInfo((prev) => ({
      ...prev,
      [patientId]: { ...(prev[patientId] || { count: 0, lastOpened: null }), lastOpened: now },
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