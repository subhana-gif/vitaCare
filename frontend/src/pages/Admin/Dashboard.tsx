import React, { useState, useEffect } from 'react';
import { dashboardService } from "../../services/dashboardService";
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

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

interface SummaryStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: {
    total: number;
    today: number;
    week: number;
    month: number;
  };
  totalRevenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  pendingAppointments: number;
  completedAppointments: number;
}

interface AppointmentStatusDistribution {
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

interface PaymentStatusDistribution {
  pending: number;
  paid: number;
  refunded: number;
}

interface TimeSeriesData {
  date: any;
  label: string;
  appointments: number;
  revenue: number;
}

interface TopEntityData {
  id: string;
  name: string;
  count: number;
}

const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('month'); // 'week', 'month', 'year'
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for all dashboard data
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    },
    totalRevenue: {
      today: 0,
      week: 0,
      month: 0,
      total: 0,
    },
    pendingAppointments: 0,
    completedAppointments: 0,
  });
  
  const [appointmentStatusDistribution, setAppointmentStatusDistribution] = useState<AppointmentStatusDistribution>({
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  });
  
  const [paymentStatusDistribution, setPaymentStatusDistribution] = useState<PaymentStatusDistribution>({
    pending: 0,
    paid: 0,
    refunded: 0,
  });
  
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [topDoctors, setTopDoctors] = useState<TopEntityData[]>([]);
  const [topPatients, setTopPatients] = useState<TopEntityData[]>([]);
  const token = localStorage.getItem("adminToken")
  

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
  
      try {
        setIsLoading(true);
  
        const [
          summary,
          appointmentStatus,
          paymentStatus,
          timeSeries,
          topDoctors,
          topPatients,
        ] = await Promise.all([
          dashboardService.getSummaryStats(token, dateRange),
          dashboardService.getAppointmentStatus(token, dateRange),
          dashboardService.getPaymentStatus(token, dateRange),
          dashboardService.getTimeSeries(token, dateRange),
          dashboardService.getTopDoctors(token, dateRange),
          dashboardService.getTopPatients(token, dateRange),
        ]);
  
        setSummaryStats(summary);
        setAppointmentStatusDistribution(appointmentStatus);
        setPaymentStatusDistribution(paymentStatus);
        setTimeSeriesData(timeSeries);
        setTopDoctors(topDoctors);
        setTopPatients(topPatients);
      } catch (err: any) {
        setError("Failed to load dashboard data");
        console.error("Dashboard data fetch error:", err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchDashboardData();
  }, [dateRange, token]);
    
  // Prepare chart data
  const appointmentStatusData = {
    labels: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    datasets: [
      {
        label: 'Appointments by Status',
        data: [
          appointmentStatusDistribution?.pending || 0,
          appointmentStatusDistribution?.confirmed || 0,
          appointmentStatusDistribution?.cancelled || 0,
          appointmentStatusDistribution?.completed || 0,
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
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
  const paymentStatusData = {
    labels: ['Pending', 'Paid', 'Refunded'],
    datasets: [
      {
        label: 'Payments by Status',
        data: [
          paymentStatusDistribution.pending,
          paymentStatusDistribution.paid,
          paymentStatusDistribution.refunded,
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
  
  const appointmentsOverTimeData = {
    labels: timeSeriesData.map(item => item.date), // Use the `date` property as labels
    datasets: [
      {
        label: 'Appointments',
        data: timeSeriesData.map(item => item.appointments || 0),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };
  
  const revenueOverTimeData = {
    labels: timeSeriesData.map(item => item.date), // Use the `date` property as labels
    datasets: [
      {
        label: 'Revenue (₹)',
        data: timeSeriesData.map(item => item.revenue || 0),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };  

const topDoctorsData = {
  labels: topDoctors.length > 0 ? topDoctors.map(doctor => doctor.name || 'N/A') : ['No Data'], // Use `name` field
  datasets: [
    {
      label: 'Appointments',
      data: topDoctors.length > 0 ? topDoctors.map(doctor => doctor.appointments || 0) : [0], // Use `appointments` field
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};
const topPatientsData = {
  labels: topPatients.length > 0 ? topPatients.map(patient => patient.name || 'N/A') : ['No Data'], // Fallback for empty data
  datasets: [
    {
      label: 'Appointments',
      data: topPatients.length > 0 ? topPatients.map(patient => patient.appointments || 0) : [0], // Fallback for empty data
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    },
  ],
};

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center p-8">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center p-8 text-red-500">{error}</div>
      </div>
    );
  }


  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
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
      
      {/* Top Summary Cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Doctors</h3>
          <p className="text-3xl font-bold text-blue-600">{summaryStats.totalDoctors}</p>
        </div>
        <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Patients</h3>
          <p className="text-3xl font-bold text-purple-600">{summaryStats.totalPatients}</p>
        </div>
        <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Appointments</h3>
          <p className="text-3xl font-bold text-blue-600">
            {summaryStats.totalAppointments}
          </p>
        </div>        
        <div className="bg-white p-4 rounded shadow">
  <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
  <p className="text-3xl">
  ₹{summaryStats?.totalRevenue?.toLocaleString() || 0}
  </p>
        </div>
      </div>
      
      
      
      {/* Charts - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Appointment Status Distribution</h3>
          <div className="h-80">
            <Doughnut data={appointmentStatusData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Payment Status Distribution</h3>
          <div className="h-80">
            <Pie data={paymentStatusData} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Charts - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Appointments Over Time</h3>
          <div className="h-80">
            <Line 
              data={appointmentsOverTimeData} 
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Appointments'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: dateRange === 'week' ? 'Day' : dateRange === 'month' ? 'Week' : 'Month'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Revenue Over Time</h3>
          <div className="h-80">
            <Line 
              data={revenueOverTimeData} 
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Revenue (₹)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: dateRange === 'week' ? 'Day' : dateRange === 'month' ? 'Week' : 'Month'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      {/* Charts - Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Top Doctors by Appointments</h3>
          <div className="h-80">
            <Bar 
              data={topDoctorsData} 
              options={{
                ...chartOptions,
                indexAxis: 'y' as const,
                scales: {
                  x: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Appointments'
                    }
                  }
                },
                plugins: {
                  title: {
                    display: true,
                    text: 'Top 5 Doctors by Appointment Count'
                  }
                }
              }} 
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Top Patients by Appointments</h3>
          <div className="h-80">
            <Bar 
              data={topPatientsData} 
              options={{
                ...chartOptions,
                indexAxis: 'y' as const,
                scales: {
                  x: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Appointments'
                    }
                  }
                },
                plugins: {
                  title: {
                    display: true,
                    text: 'Top 5 Patients by Appointment Count'
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;