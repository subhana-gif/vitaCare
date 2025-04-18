import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { FaDownload, FaNotesMedical, FaPills, FaCalendarAlt } from 'react-icons/fa';
import { useParams } from "react-router-dom";

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  timing: string;
}

interface Prescription {
  _id: string;
  appointmentId: string;
  medicines: Medicine[];
  diagnosis: string;
  notes: string;
  createdAt: string;
}

const PrescriptionView: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await axios.get(
          `https://vitacare.life/api/prescriptions/${appointmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setPrescription(response.data);
      } catch (error) {
        console.error('Error fetching prescription:', error);
        toast.error('Failed to load prescription');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchPrescription();
    }
  }, [appointmentId, token]);

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `https://vitacare.life/api/prescriptions/${appointmentId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      console.log("response from download:",response)
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-center">
          <div className="w-24 h-24 bg-blue-200 rounded-full mx-auto mb-6"></div>
          <div className="h-6 bg-gray-300 w-64 mx-auto rounded"></div>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center h-screen flex flex-col justify-center items-center bg-gray-50">
        <FaNotesMedical className="text-8xl text-gray-400 mb-6" />
        <p className="text-3xl text-gray-600">No prescription available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 flex justify-between items-center">
        <h3 className="text-3xl font-bold text-white flex items-center gap-4">
          <FaNotesMedical className="text-4xl" />
          Prescription Details
        </h3>
        <button
          onClick={handleDownload}
          className="flex items-center gap-3 px-6 py-3 bg-white text-blue-700 rounded-full text-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <FaDownload className="text-2xl" />
          Download PDF
        </button>
      </div>

      <div className="p-6 space-y-8">
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
            <FaNotesMedical className="text-blue-600 text-3xl" />
            Diagnosis
          </h4>
          <p className="text-xl text-gray-700 pl-6">{prescription.diagnosis}</p>
        </div>

        <div>
          <h4 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <FaPills className="text-blue-600 text-3xl" />
            Medicines
          </h4>
          <div className="space-y-6">
            {prescription.medicines.map((medicine, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'Medicine', value: medicine.name },
                    { label: 'Dosage', value: medicine.dosage },
                    { label: 'Duration', value: medicine.duration },
                    { label: 'Timing', value: medicine.timing }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <label className="text-sm uppercase tracking-wider text-gray-500">{item.label}</label>
                      <p className="text-xl font-medium text-gray-800 mt-2">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {prescription.notes && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
              <FaNotesMedical className="text-blue-600 text-3xl" />
              Additional Notes
            </h4>
            <p className="text-xl text-gray-700 pl-6 italic">{prescription.notes}</p>
          </div>
        )}

        <div className="text-lg text-gray-500 flex items-center gap-3 justify-end">
          <FaCalendarAlt className="text-2xl" />
          Prescribed on: {new Date(prescription.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionView;