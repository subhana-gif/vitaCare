import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientName: string;
}

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  timing: string;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  patientName,
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([{
    name: '',
    dosage: '',
    duration: '',
    timing: ''
  }]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useSelector((state: RootState) => state.doctors.token);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', timing: '' }]);
  };

  const handleRemoveMedicine = (index: number) => {
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicines[0].name || !diagnosis) {
      toast.error('Please fill in at least one medicine and diagnosis');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        'http://localhost:5001/api/prescriptions',
        {
          appointmentId,
          medicines,
          diagnosis,
          notes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Prescription created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Prescription</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-lg font-medium text-gray-700">Patient: {patientName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Medicines</label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Medicine
              </button>
            </div>

            {medicines.map((medicine, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg relative">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Medicine name"
                    value={medicine.name}
                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Dosage (e.g., 1 tablet)"
                    value={medicine.dosage}
                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Duration (e.g., 7 days)"
                    value={medicine.duration}
                    onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Timing (e.g., After meals)"
                    value={medicine.timing}
                    onChange={(e) => handleMedicineChange(index, 'timing', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;