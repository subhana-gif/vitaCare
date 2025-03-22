import React from "react";
import { Appointment } from "../../types/appointment";
import AppointmentCard from "./AppointmentCard";

interface AppointmentListProps {
  appointments: Appointment[];
  onPayment: (appointment: Appointment) => void;
  onCancel: (appointmentId: string) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onPayment,
  onCancel
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600 text-2xl uppercase tracking-wider">
              <th className="px-4 py-4">Doctor</th>
              <th className="px-4 py-4">Appointment Details</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-16 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                onPayment={onPayment}
                onCancel={onCancel}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentList;