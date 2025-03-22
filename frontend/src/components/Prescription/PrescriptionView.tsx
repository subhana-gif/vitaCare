import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { FaDownload } from 'react-icons/fa';

interface PrescriptionViewProps {
  appointmentId: string;
}

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

const PrescriptionView: React.FC<PrescriptionViewProps> = ({ appointmentId }) => {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/prescriptions/${appointmentId}`,
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
        `http://localhost:5001/api/prescriptions/${appointmentId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

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
    return <div className="text-center py-4">Loading prescription...</div>;
  }

  if (!prescription) {
    return <div className="text-center py-4 text-gray-500">No prescription available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Prescription Details</h3>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaDownload />
          Download PDF
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">Diagnosis</h4>
          <p className="text-gray-600">{prescription.diagnosis}</p>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">Medicines</h4>
          <div className="grid grid-cols-1 gap-4">
            {prescription.medicines.map((medicine, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Medicine</label>
                    <p className="font-medium">{medicine.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Dosage</label>
                    <p className="font-medium">{medicine.dosage}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Duration</label>
                    <p className="font-medium">{medicine.duration}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Timing</label>
                    <p className="font-medium">{medicine.timing}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {prescription.notes && (
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">Additional Notes</h4>
            <p className="text-gray-600">{prescription.notes}</p>
          </div>
        )}

        <div className="text-sm text-gray-500">
          Prescribed on: {new Date(prescription.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionView;