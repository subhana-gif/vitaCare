import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { useSelector } from 'react-redux'; 
import { IAppointment } from '../../../../backend/src/models/appointment';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AppointmentSummary {
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

interface PaymentSummary {
  pending: number;
  paid: number;
  refunded: number;
  totalRevenue: number;
}

interface TimeSlotData {
  slot: string;
  count: number;
}

interface MonthlyData {
  month: string;
  appointments: number;
  revenue: number;
}

const DoctorDashboard: React.FC = () => {
  const doctorId = useSelector((state: any) => state.doctors.doctorId)  
  const token = useSelector((state: any) => state.doctors.token)  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appointmentSummary, setAppointmentSummary] = useState<AppointmentSummary>({
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  });
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    pending: 0,
    paid: 0,
    refunded: 0,
    totalRevenue: 0,
  });
  const [popularTimeSlots, setPopularTimeSlots] = useState<TimeSlotData[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyData[]>([]);
  const [dateRange, setDateRange] = useState<string>('month'); // 'week', 'month', 'year'
  const [error, setError] = useState<string | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<IAppointment[]>([]);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        setIsLoading(true);

        // Fetch today's appointments
        const todayAppointmentsRes = await axios.get(`http://localhost:5001/api/dashboard/${doctorId}/appointments/today`,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        setTodayAppointments(todayAppointmentsRes.data);

        setIsLoading(false);
      } catch (err: any) {
        console.error('Today\'s appointments fetch error:', err.response?.data || err.message);
        setError('Failed to load today\'s appointments. Please try again later.');
        setIsLoading(false);
      }
    };

    if (doctorId) {
      fetchTodayAppointments();
    } else {
      setError('Doctor ID is missing.');
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch appointment summary
        const appointmentRes = await axios.get(`http://localhost:5001/api/dashboard/${doctorId}/appointments/summary?range=${dateRange}`,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        setAppointmentSummary(appointmentRes.data);
        
        // Fetch payment summary
        const paymentRes = await axios.get(`http://localhost:5001/api/dashboard/${doctorId}/payments/summary?range=${dateRange}`,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        setPaymentSummary(paymentRes.data);
        
        // Fetch popular time slots
        const timeSlotsRes = await axios.get(`http://localhost:5001/api/dashboard/${doctorId}/appointments/time-slots?range=${dateRange}`,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        setPopularTimeSlots(timeSlotsRes.data);
        
        // Fetch monthly stats
        const monthlyStatsRes = await axios.get(`http://localhost:5001/api/dashboard/${doctorId}/monthly-stats?months=6`,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        setMonthlyStats(monthlyStatsRes.data);
        
        setIsLoading(false);
      } catch (err: any) {
        setError('Failed to load dashboard data');
        setIsLoading(false);
        console.error('Dashboard data fetch error:', err);
      }
    };

    if (doctorId) {
      fetchDashboardData();
    }
  }, [doctorId, dateRange]);

  // Chart data for appointment status
  const appointmentStatusData = {
    labels: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    datasets: [
      {
        label: 'Appointments by Status',
        data: [
          appointmentSummary.pending,
          appointmentSummary.confirmed,
          appointmentSummary.cancelled,
          appointmentSummary.completed,
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)', // yellow
          'rgba(54, 162, 235, 0.6)', // blue
          'rgba(255, 99, 132, 0.6)', // red
          'rgba(75, 192, 192, 0.6)', // green
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for payment status
  const paymentStatusData = {
    labels: ['Pending', 'Paid', 'Refunded'],
    datasets: [
      {
        label: 'Payments by Status',
        data: [
          paymentSummary.pending,
          paymentSummary.paid,
          paymentSummary.refunded,
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for popular time slots
  const timeSlotData = {
    labels: popularTimeSlots.map(slot => slot.slot),
    datasets: [
      {
        label: 'Number of Appointments',
        data: popularTimeSlots.map(slot => slot.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart data for monthly trends
  const monthlyData = {
    labels: monthlyStats.map(stat => stat.month),
    datasets: [
      {
        label: 'Appointments',
        data: monthlyStats.map(stat => stat.appointments),
        backgroundColor: 'rgba(54, 162, 235, 0.4)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        yAxisID: 'y',
        type: 'bar',
      },
      {
        label: 'Revenue (₹)',
        data: monthlyStats.map(stat => stat.revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.4)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        yAxisID: 'y1',
        type: 'line',
      },
    ],
  };

  const monthlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Appointments & Revenue',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Appointments',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Revenue (₹)',
        },
      },
    },
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-center p-8">Loading dashboard data...</div>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-center p-8 text-red-500">{error}</div>
    </div>;
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Doctor Dashboard</h1>
      
      {/* Date range selector */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <label className="mr-2 font-medium">Time Period:</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Appointments</h3>
          <p className="text-3xl font-bold text-blue-600">{
            appointmentSummary.pending + 
            appointmentSummary.confirmed + 
            appointmentSummary.cancelled + 
            appointmentSummary.completed
          }</p>
        </div>
        <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{appointmentSummary.completed}</p>
        </div>
        <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Upcoming</h3>
          <p className="text-3xl font-bold text-yellow-600">{appointmentSummary.pending + appointmentSummary.confirmed}</p>
        </div>
        <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Revenue</h3>
          <p className="text-3xl font-bold text-indigo-600">₹{paymentSummary.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Appointment Status</h3>
          <div className="h-80">
            <Doughnut data={appointmentStatusData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Payment Status</h3>
          <div className="h-80">
            <Pie data={paymentStatusData} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Popular Time Slots</h3>
          <div className="h-80">
            <Bar 
              data={timeSlotData} 
              options={{
                ...chartOptions,
                indexAxis: 'y' as const,
                plugins: {
                  title: {
                    display: true,
                    text: 'Most Booked Time Slots'
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Monthly Trends</h3>
          <div className="h-80">
            <Bar 
              data={monthlyData}
              options={{
                ...monthlyOptions
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Today's Appointments */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Today's Appointments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 border-b font-semibold text-left text-gray-600">Patient Name</th>
                <th className="py-3 px-4 border-b font-semibold text-left text-gray-600">Time</th>
                <th className="py-3 px-4 border-b font-semibold text-left text-gray-600">Status</th>
                <th className="py-3 px-4 border-b font-semibold text-left text-gray-600">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <tr key={appointment._id.toString()} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b text-gray-700">
                      {appointment.patientId?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 border-b text-gray-700">{appointment.time}</td>
                    <td className="py-3 px-4 border-b">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        appointment.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        appointment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">No appointments scheduled for today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;