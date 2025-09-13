import React from 'react';
import useFetch from '../../hooks/useFetch.js';
import { getAdminDashboard, getAnalytics } from '../../services/adminService.js';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import chartConfig from '../../utils/chartConfig.js';
import styles from '../../styles/dashboard.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const { data: dashboard, loading: dashboardLoading, error: dashboardError } = useFetch(getAdminDashboard);
  const { data: analytics, loading: analyticsLoading } = useFetch(getAnalytics);

  if (dashboardLoading) return <div className="loading"><div className="spinner"></div>Loading dashboard...</div>;
  if (dashboardError) return <div className="alert alert-error">Error loading dashboard: {dashboardError}</div>;

  const { overview, topPlans, monthlyTrends, recentUsers, recentSubscriptions } = dashboard || {};

  // Chart data for subscription status
  const subscriptionStatusData = {
    labels: ['Active', 'Cancelled', 'Expired', 'Pending'],
    datasets: [{
      data: [
        overview?.activeSubscriptions || 0,
        analytics?.cancelled || 0,
        analytics?.expired || 0,
        analytics?.pending || 0
      ],
      ...chartConfig.pie,
    }],
  };

  // Chart data for monthly trends
  const monthlyTrendsData = {
    labels: monthlyTrends?.map(trend => `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`) || [],
    datasets: [{
      label: 'New Subscriptions',
      data: monthlyTrends?.map(trend => trend.count) || [],
      ...chartConfig.bar,
    }],
  };

  return (
    <div className="container">
      <div className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
            <p className={styles.dashboardSubtitle}>Overview of your subscription management system</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.success}`}>
            <h3 className={styles.statValue}>{overview?.totalUsers || 0}</h3>
            <p className={styles.statLabel}>Total Users</p>
          </div>
          <div className={`${styles.statCard} ${styles.success}`}>
            <h3 className={styles.statValue}>{overview?.activeSubscriptions || 0}</h3>
            <p className={styles.statLabel}>Active Subscriptions</p>
          </div>
          <div className={`${styles.statCard} ${styles.success}`}>
            <h3 className={styles.statValue}>{overview?.totalSubscriptions || 0}</h3>
            <p className={styles.statLabel}>Total Subscriptions</p>
          </div>
          <div className={`${styles.statCard} ${styles.success}`}>
            <h3 className={styles.statValue}>${overview?.totalRevenue?.toFixed(2) || 0}</h3>
            <p className={styles.statLabel}>Monthly Revenue</p>
          </div>
          <div className={`${styles.statCard} ${overview?.churnRate > 5 ? styles.danger : styles.success}`}>
            <h3 className={styles.statValue}>{overview?.churnRate?.toFixed(1) || 0}%</h3>
            <p className={styles.statLabel}>Churn Rate</p>
          </div>
          <div className={`${styles.statCard} ${styles.success}`}>
            <h3 className={styles.statValue}>{overview?.totalPlans || 0}</h3>
            <p className={styles.statLabel}>Available Plans</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Subscription Status Pie Chart */}
          <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>Subscription Status Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <Pie data={subscriptionStatusData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }} />
            </div>
          </div>

          {/* Monthly Trends Bar Chart */}
          <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>Monthly Subscription Trends</h3>
            <div className="h-64 flex items-center justify-center">
              <Bar data={monthlyTrendsData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }} />
            </div>
          </div>
        </div>

        {/* Top Plans */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Top Performing Plans</h2>
          {topPlans?.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📊</div>
              <h3 className={styles.emptyStateTitle}>No Data Available</h3>
              <p className={styles.emptyStateDescription}>
                No subscription data available yet.
              </p>
            </div>
          ) : (
            <div className="tableContainer">
              <table className="table">
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Subscriptions</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlans?.map(plan => (
                    <tr key={plan._id}>
                      <td>
                        <div>
                          <p className="font-medium">{plan.planName}</p>
                        </div>
                      </td>
                      <td>
                        <span className="planType">{plan.planType}</span>
                      </td>
                      <td>${plan.planPrice}</td>
                      <td>{plan.subscriptionCount}</td>
                      <td>${(plan.subscriptionCount * plan.planPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent User Registrations</h2>
            {recentUsers?.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>👥</div>
                <h3 className={styles.emptyStateTitle}>No Recent Users</h3>
                <p className={styles.emptyStateDescription}>
                  No new user registrations in the last period.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers?.slice(0, 5).map(user => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`statusBadge ${user.role === 'admin' ? 'active' : 'pending'}`}>
                        {user.role}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Subscriptions */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent Subscriptions</h2>
            {recentSubscriptions?.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📝</div>
                <h3 className={styles.emptyStateTitle}>No Recent Subscriptions</h3>
                <p className={styles.emptyStateDescription}>
                  No new subscriptions in the last period.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubscriptions?.slice(0, 5).map(subscription => (
                  <div key={subscription._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{subscription.planId.name}</p>
                      <p className="text-sm text-gray-600">{subscription.userId.username}</p>
                    </div>
                    <div className="text-right">
                      <span className={`statusBadge ${subscription.status}`}>
                        {subscription.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        ${subscription.planId.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/admin/manage-plans" className="btn btn-primary text-center">
              Manage Plans
            </a>
            <a href="/admin/manage-discounts" className="btn btn-secondary text-center">
              Manage Discounts
            </a>
            <a href="/admin/audit-log" className="btn btn-outline text-center">
              View Audit Logs
            </a>
            <button className="btn btn-success text-center">
              Send Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
