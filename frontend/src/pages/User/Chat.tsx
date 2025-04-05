import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../../redux/store";
import { doctorService } from "../../services/doctorService";
import CommonChat from "../../components/common/chats";

interface Doctor {
  _id: string;
  name: string;
  imageUrl: string;
}

const Chats: React.FC = () => {
  const { userId, doctorId } = useParams<{ userId?: string; doctorId?: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const [doctor, setDoctor] = useState<Doctor | null>(null);

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

  if (!user || !userId || !doctorId || !token) {
    console.log(`Chats.tsx: user=${JSON.stringify(user)}, userId=${userId}, doctorId=${doctorId}, token=${token}`);
    return <div>Loading...</div>;
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <CommonChat
        currentUserId={user._id}
        targetUserId={doctorId}
        token={token}
        isDoctor={false}
        headerName={doctor?.name}
        headerImageUrl={doctor?.imageUrl}
      />
    </div>
  );
};

export default Chats;