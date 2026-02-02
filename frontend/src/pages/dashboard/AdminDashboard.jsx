import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiGrid,
  FiBook,
} from "react-icons/fi";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, recentApplications, chartData, loading } = useSelector(
    (state) => state.dashboard,
  );

  // Mock data for demonstration
  const mockStats = {
    totalApplications: 1245,
    activeAgents: 87,
    totalRevenue: 456789,
    pendingPayouts: 23450,
    totalStudents: 2156,
    totalUniversities: 145,
    totalCourses: 892,
  };

  const mockApplicationData = [
    { name: "Jan", applications: 65 },
    { name: "Feb", applications: 78 },
    { name: "Mar", applications: 95 },
    { name: "Apr", applications: 112 },
    { name: "May", applications: 135 },
    { name: "Jun", applications: 98 },
  ];

  const mockStatusData = [
    { name: "Submitted", value: 45, color: "#3b82f6" },
    { name: "Under Review", value: 25, color: "#f59e0b" },
    { name: "Offer Issued", value: 15, color: "#8b5cf6" },
    { name: "Enrolled", value: 10, color: "#22c55e" },
    { name: "Rejected", value: 5, color: "#ef4444" },
  ];

  const StatCard = ({ icon: Icon, label, value, color, trend, link }) => (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </h3>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              <FiTrendingUp className="inline mr-1" size={14} />
              {trend}
            </p>
          )}
        </div>
        <div
          className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center`}
        >
          <Icon size={24} className="text-white" />
        </div>
      </div>
      {link && (
        <Link
          to={link}
          className="text-primary-600 text-sm mt-3 inline-block hover:underline"
        >
          View Details →
        </Link>
      )}
    </Card>
  );

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiFileText}
          label="Total Applications"
          value={mockStats.totalApplications}
          color="bg-primary-500"
          trend="+12% from last month"
          link="/applications"
        />
        <StatCard
          icon={FiUsers}
          label="Active Agents"
          value={mockStats.activeAgents}
          color="bg-secondary-500"
          trend="+5% from last month"
          link="/agents"
        />
        <StatCard
          icon={FiDollarSign}
          label="Total Revenue"
          value={`$${mockStats.totalRevenue.toLocaleString()}`}
          color="bg-accent-500"
          trend="+18% from last month"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Pending Payouts"
          value={`$${mockStats.pendingPayouts.toLocaleString()}`}
          color="bg-amber-500"
          link="/payouts/requests"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={FiGrid}
          label="Universities"
          value={mockStats.totalUniversities}
          color="bg-purple-500"
          link="/universities"
        />
        <StatCard
          icon={FiBook}
          label="Courses"
          value={mockStats.totalCourses}
          color="bg-blue-500"
          link="/courses"
        />
        <StatCard
          icon={FiUsers}
          label="Students"
          value={mockStats.totalStudents}
          color="bg-green-500"
          link="/students"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Trend */}
        <Card>
          <Card.Header>
            <h3 className="font-semibold text-gray-900">Applications Trend</h3>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockApplicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        {/* Application Status Distribution */}
        <Card>
          <Card.Header>
            <h3 className="font-semibold text-gray-900">
              Application Status Distribution
            </h3>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <Card.Header>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Recent Applications</h3>
            <Link
              to="/applications"
              className="text-primary-600 text-sm hover:underline"
            >
              View All
            </Link>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>University</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8">
                    No recent applications
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminDashboard;
