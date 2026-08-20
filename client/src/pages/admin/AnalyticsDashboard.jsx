import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, Activity, Globe } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const COLORS = ['#2b58ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to fetch analytics", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Enterprise Analytics...</div>;
  if (!data) return <div style={{ padding: '2rem', color: 'red' }}>Failed to load analytics or insufficient permissions.</div>;

  return (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>
        Enterprise Analytics Dashboard
      </h1>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <MetricCard icon={<Users />} title="Total Users" value={data.metrics.total_users} />
        <MetricCard icon={<Activity />} title="Daily Active (DAU)" value={data.metrics.dau} color="#10b981" />
        <MetricCard icon={<BookOpen />} title="Weekly Active (WAU)" value={data.metrics.wau} color="#f59e0b" />
        <MetricCard icon={<Globe />} title="Monthly Active (MAU)" value={data.metrics.mau} color="#8b5cf6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Activity Trend Chart */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#475569' }}>Activity Completions (7 Days)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.activityTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completions" fill="#2b58ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Distribution */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#475569' }}>Learning Language Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.languageDistribution} dataKey="count" nameKey="learning_language" cx="50%" cy="50%" outerRadius={100} label>
                  {data.languageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

const MetricCard = ({ icon, title, value, color = '#2b58ff' }) => (
  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
    <div style={{ background: `${color}15`, padding: '1rem', borderRadius: '12px', color: color }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>{title}</p>
      <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem', fontWeight: 800 }}>{value}</h3>
    </div>
  </div>
);

export default AnalyticsDashboard;
