import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  BarChart3,
  FileText,
  Mail,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Wallet,
  Ban,
  UserCheck,
  Crown,
  Search,
  Clock,
  Award,
  Check,
  X,
  Gift,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { RewardManagement } from '../components/admin/RewardManagement';
import { formatRelativeTime } from '../utils/dateUtils';
import { User as UserType, Payout } from '../types';

export function AdminPanel() {
  const {
    reports,
    contactRequests,
    deleteReport,
    updateReport,
    currentUser,
    updateContactRequest,
    deleteContactRequest,
    reviewRecoveryReward,
    fetchUsers,
    updateUser,
    deleteUser,
    fetchPayouts,
    updatePayout,
  } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'recovery' | 'rewards' | 'users' | 'payouts'>('dashboard');
  const [users, setUsers] = useState<UserType[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [reportSearch, setReportSearch] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'new' | 'pending' | 'resolved'>('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');
  const [userSearch, setUserSearch] = useState('');

  const isAdmin = currentUser && currentUser.role === 'admin';

  const loadUsers = () => fetchUsers().then(setUsers);
  const loadPayouts = () => fetchPayouts().then(setPayouts);

  useEffect(() => {
    if (!isAdmin) return;
    // Users are also loaded for the dashboard so the "Registered Users" stat is accurate.
    if (activeTab === 'dashboard' || activeTab === 'users') loadUsers();
    if (activeTab === 'payouts') loadPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdmin]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalReports: reports.length,
    activeReports: reports.filter(r => r.status !== 'resolved').length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length,
    newReports: reports.filter(r => r.status === 'new').length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    pendingRequests: contactRequests.filter(r => r.status === 'pending').length,
    totalRequests: contactRequests.length,
    lostItems: reports.filter(r => r.type === 'lost').length,
    foundItems: reports.filter(r => r.type === 'found').length,
    uniqueUsers: new Set(reports.map(r => r.ownerId)).size,
    registeredUsers: users.length,
  };

  // Derived, memoized views for search/filter and lightweight per-user activity.
  const filteredReports = useMemo(() => {
    const term = reportSearch.trim().toLowerCase();
    return reports.filter(r => {
      if (reportTypeFilter !== 'all' && r.type !== reportTypeFilter) return false;
      if (reportStatusFilter !== 'all' && r.status !== reportStatusFilter) return false;
      if (!term) return true;
      return (
        r.title.toLowerCase().includes(term) ||
        r.location.toLowerCase().includes(term) ||
        r.ownerName.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term)
      );
    });
  }, [reports, reportSearch, reportTypeFilter, reportStatusFilter]);

  const reportCountByOwner = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => { counts[r.ownerId] = (counts[r.ownerId] || 0) + 1; });
    return counts;
  }, [reports]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone || '').toLowerCase().includes(term)
    );
  }, [users, userSearch]);

  const filteredRequests = useMemo(() => {
    if (requestStatusFilter === 'all') return contactRequests;
    return contactRequests.filter(r => r.status === requestStatusFilter);
  }, [contactRequests, requestStatusFilter]);

  // Recovery reward reviews, grouped by recovery status (admin-only reward gate).
  const recoveryReviews = useMemo(() => {
    const withRecovery = contactRequests.filter(r => r.recovery && r.recovery.status && r.recovery.status !== 'none');
    return {
      pending: withRecovery.filter(r => r.recovery!.status === 'pending_admin_reward_review'),
      approved: withRecovery.filter(r => r.recovery!.status === 'completed'),
      rejected: withRecovery.filter(r => r.recovery!.status === 'reward_rejected'),
    };
  }, [contactRequests]);

  // Resolve display names for the two recovery parties from the report + request.
  const recoveryParties = (request: typeof contactRequests[number]) => {
    const report = reports.find(r => r.id === request.reportId);
    if (!report) return { found: '—', lost: '—', reportTitle: 'Unknown report' };
    const found = report.type === 'lost' ? request.requesterName : report.ownerName;
    const lost = report.type === 'lost' ? report.ownerName : request.requesterName;
    return { found, lost, reportTitle: report.title };
  };

  const handleApproveReward = async (id: string) => { await reviewRecoveryReward(id, 'approve'); };
  const handleRejectReward = async (id: string) => {
    const reason = window.prompt('Reason for rejecting the reward (optional):', '') ?? '';
    await reviewRecoveryReward(id, 'reject', reason);
  };

  const recentActivity = useMemo(() => {
    const reportItems = reports.slice(0, 6).map(r => ({
      key: `r-${r.id}`,
      label: `${r.type === 'lost' ? 'Lost' : 'Found'} report: ${r.title}`,
      who: r.ownerName,
      at: r.createdAt,
    }));
    // Contact requests are private between users and never surfaced to admins.
    return reportItems
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 8);
  }, [reports]);

  const handleDeleteReport = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the report "${title}"? This action cannot be undone.`)) {
      deleteReport(id);
    }
  };

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csvContent = rows.map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReportsCsv = () => {
    const rows = [
      ['Title', 'Type', 'Category', 'Status', 'Location', 'Created At', 'Owner', 'Contact Method'],
      ...reports.map(report => [
        report.title,
        report.type,
        report.category,
        report.status,
        report.location,
        report.createdAt,
        report.ownerName,
        report.contactMethod,
      ]),
    ];
    downloadCsv('lostfound_reports.csv', rows);
  };

  const exportRequestsCsv = () => {
    const rows = [
      ['Report Title', 'Requester', 'Requester Email', 'Status', 'Created At', 'Reason'],
      ...contactRequests.map(request => {
        const report = reports.find(r => r.id === request.reportId);
        return [
          report?.title || 'Unknown',
          request.requesterName,
          request.requesterEmail,
          request.status,
          request.createdAt,
          request.reason,
        ];
      }),
    ];
    downloadCsv('lostfound_contact_requests.csv', rows);
  };

  const handleMarkAsSpam = (id: string, title: string) => {
    if (confirm(`Mark "${title}" as spam and delete it?`)) {
      deleteReport(id);
      alert('Report marked as spam and removed.');
    }
  };

  const handleToggleRole = async (user: UserType) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${user.name}'s role to ${nextRole}?`)) return;
    const updated = await updateUser(user.id, { role: nextRole });
    if (updated) loadUsers();
  };

  const handleToggleBlock = async (user: UserType & { isBlocked?: boolean }) => {
    const updated = await updateUser(user.id, { isBlocked: !(user as any).isBlocked });
    if (updated) loadUsers();
  };

  const handleDeleteUser = async (user: UserType) => {
    if (!confirm(`Delete user ${user.name} and all of their reports? This cannot be undone.`)) return;
    const ok = await deleteUser(user.id);
    if (ok) loadUsers();
  };

  const handlePayout = async (id: string, status: 'approved' | 'rejected') => {
    const updated = await updatePayout(id, status);
    if (updated) loadPayouts();
  };

  const handleStatusChange = async (report: { id: string; status: string }, status: 'new' | 'pending' | 'resolved') => {
    if (report.status === status) return;
    await updateReport(report.id, { status });
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Delete this contact request? This action cannot be undone.')) return;
    await deleteContactRequest(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600">Monitor and manage the Lost & Found platform</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={exportReportsCsv}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <FileText className="w-4 h-4" />
              Export Reports
            </button>
          </div>

          <div className="mt-6 flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'dashboard'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'reports'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>All Reports</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('recovery')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'recovery'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Recovery Reviews</span>
                {recoveryReviews.pending.length > 0 && (
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{recoveryReviews.pending.length}</span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'rewards'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Rewards</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'users'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Users</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'payouts'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <span>Payouts</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium mb-1">Total Reports</p>
                        <p className="text-3xl font-bold text-blue-900">{stats.totalReports}</p>
                      </div>
                      <FileText className="w-12 h-12 text-blue-600 opacity-50" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium mb-1">Resolved</p>
                        <p className="text-3xl font-bold text-green-900">{stats.resolvedReports}</p>
                      </div>
                      <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600 font-medium mb-1">Pending Reward Reviews</p>
                        <p className="text-3xl font-bold text-yellow-900">{recoveryReviews.pending.length}</p>
                      </div>
                      <Award className="w-12 h-12 text-yellow-600 opacity-50" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium mb-1">Registered Users</p>
                        <p className="text-3xl font-bold text-purple-900">{stats.registeredUsers}</p>
                        <p className="text-xs text-purple-600/80 mt-1">{stats.uniqueUsers} active contributors</p>
                      </div>
                      <Users className="w-12 h-12 text-purple-600 opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                      Report Types
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Lost Items</span>
                        <span className="font-bold text-red-600">{stats.lostItems}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Found Items</span>
                        <span className="font-bold text-green-600">{stats.foundItems}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-bold text-blue-600">
                          {stats.totalReports > 0
                            ? Math.round((stats.resolvedReports / stats.totalReports) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                      Platform Health
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Active Reports</span>
                          <span className="text-sm font-medium">{stats.activeReports}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                stats.totalReports > 0
                                  ? (stats.activeReports / stats.totalReports) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Resolved Reports</span>
                          <span className="text-sm font-medium">{stats.resolvedReports}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                stats.totalReports > 0
                                  ? (stats.resolvedReports / stats.totalReports) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status breakdown + recent activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Reports by Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">New</span>
                        <span className="font-bold text-blue-600">{stats.newReports}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-bold text-yellow-600">{stats.pendingReports}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Resolved</span>
                        <span className="font-bold text-green-600">{stats.resolvedReports}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className="text-gray-600">Pending Reward Reviews</span>
                        <span className="font-bold text-purple-600">{recoveryReviews.pending.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-purple-600" />
                      Recent Activity
                    </h3>
                    {recentActivity.length === 0 ? (
                      <p className="text-sm text-gray-500">No activity yet.</p>
                    ) : (
                      <ul className="space-y-3">
                        {recentActivity.map(item => (
                          <li key={item.key} className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm text-gray-800 truncate">{item.label}</p>
                              <p className="text-xs text-gray-500">by {item.who}</p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{formatRelativeTime(item.at)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={reportSearch}
                      onChange={e => setReportSearch(e.target.value)}
                      placeholder="Search by title, location, owner, category…"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <select
                    value={reportTypeFilter}
                    onChange={e => setReportTypeFilter(e.target.value as 'all' | 'lost' | 'found')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All types</option>
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                  </select>
                  <select
                    value={reportStatusFilter}
                    onChange={e => setReportStatusFilter(e.target.value as 'all' | 'new' | 'pending' | 'resolved')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All statuses</option>
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                  Showing {filteredReports.length} of {reports.length} report{reports.length !== 1 ? 's' : ''}
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Report
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Posted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReports.map(report => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded overflow-hidden">
                                {report.imageUrl && (
                                  <img
                                    src={report.imageUrl}
                                    alt={report.title}
                                    className="h-full w-full object-contain"
                                  />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {report.title}
                                </div>
                                <div className="text-sm text-gray-500">{report.ownerName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                report.type === 'lost'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {report.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={report.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatRelativeTime(report.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <select
                                value={report.status}
                                onChange={e => handleStatusChange(report, e.target.value as 'new' | 'pending' | 'resolved')}
                                className="text-xs border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                title="Change status"
                              >
                                <option value="new">New</option>
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                              </select>
                              <Link
                                to={`/report/${report.id}`}
                                className="text-blue-600 hover:text-blue-900"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleMarkAsSpam(report.id, report.title)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Mark as Spam"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReport(report.id, report.title)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'recovery' && (
              <div className="space-y-8">
                {([
                  { key: 'pending', label: 'Pending Reward Reviews', items: recoveryReviews.pending, tone: 'amber' },
                  { key: 'approved', label: 'Approved Rewards', items: recoveryReviews.approved, tone: 'green' },
                  { key: 'rejected', label: 'Rejected Rewards', items: recoveryReviews.rejected, tone: 'red' },
                ] as const).map(section => (
                  <div key={section.key}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      {section.label}
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{section.items.length}</span>
                    </h3>
                    {section.items.length === 0 ? (
                      <p className="text-sm text-gray-500 mb-2">None.</p>
                    ) : (
                      <div className="space-y-3">
                        {section.items.map(request => {
                          const parties = recoveryParties(request);
                          const rec = request.recovery!;
                          return (
                            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="text-sm">
                                  <p className="font-semibold text-gray-900 mb-1">{parties.reportTitle}</p>
                                  <p className="text-gray-600">Finder (to be rewarded): <span className="font-medium">{parties.found}</span></p>
                                  <p className="text-gray-600">Owner: <span className="font-medium">{parties.lost}</span></p>
                                  <p className="text-gray-500 mt-1 text-xs">
                                    Delivered: {rec.finderDeliveredAt ? new Date(rec.finderDeliveredAt).toLocaleString() : '—'}
                                    {' · '}Receipt: {rec.ownerReceived || '—'} {rec.ownerReceivedAt ? `(${new Date(rec.ownerReceivedAt).toLocaleString()})` : ''}
                                  </p>
                                  {rec.rewardGrantedAt && <p className="text-emerald-700 text-xs mt-1">Rewarded {new Date(rec.rewardGrantedAt).toLocaleString()}</p>}
                                  {rec.rewardSkippedReason && <p className="text-amber-700 text-xs mt-1">Completed · no points ({rec.rewardSkippedReason})</p>}
                                  {rec.rewardRejectedReason && <p className="text-red-700 text-xs mt-1">Rejected: {rec.rewardRejectedReason}</p>}
                                </div>
                                {section.key === 'pending' && (
                                  <div className="flex gap-2 flex-none">
                                    <button onClick={() => handleApproveReward(request.id)}
                                      className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm">
                                      <Check className="w-4 h-4" /> Approve Reward
                                    </button>
                                    <button onClick={() => handleRejectReward(request.id)}
                                      className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm">
                                      <X className="w-4 h-4" /> Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'rewards' && <RewardManagement />}

            {activeTab === 'users' && (
              <div>
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      placeholder="Search users by name, username, email, phone…"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-gray-600 text-sm whitespace-nowrap">
                    {filteredUsers.length} of {users.length} user{users.length !== 1 ? 's' : ''}
                  </p>
                  <button onClick={loadUsers} className="text-sm text-purple-600 hover:text-purple-800 font-medium">Refresh</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points / Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reports</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map(user => {
                        const isSelf = currentUser?.id === user.id;
                        const ownedReports = reportCountByOwner[user.id] || 0;
                        return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                              {isSelf && <span className="ml-2 text-xs text-purple-600">(you)</span>}
                            </div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div>{user.email}</div>
                            <div className="text-xs text-gray-500">{user.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="font-semibold text-amber-700">{user.points ?? 0}</span> pts
                            <div className="text-xs text-gray-500">{(user.balance ?? 0).toFixed(2)} EGP</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{ownedReports}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${(user as any).isBlocked ? 'bg-red-100 text-red-800' : user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                              {(user as any).isBlocked ? 'Blocked' : user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {isSelf ? (
                              <span className="text-xs text-gray-400" title="You cannot moderate your own account">—</span>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <button onClick={() => handleToggleRole(user)} title="Toggle admin" className="text-purple-600 hover:text-purple-900">
                                  <Crown className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleToggleBlock(user as any)} title="Block / unblock" className="text-yellow-600 hover:text-yellow-900">
                                  {(user as any).isBlocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                </button>
                                <button onClick={() => handleDeleteUser(user)} title="Delete" className="text-red-600 hover:text-red-900">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'payouts' && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-gray-600">{payouts.length} payout request{payouts.length !== 1 ? 's' : ''}</p>
                  <button onClick={loadPayouts} className="text-sm text-purple-600 hover:text-purple-800 font-medium">Refresh</button>
                </div>
                <div className="space-y-3">
                  {payouts.length === 0 && <p className="text-sm text-gray-500">No payout requests.</p>}
                  {payouts.map(payout => (
                    <div key={payout.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{payout.userName}</p>
                        <p className="text-sm text-gray-600">{payout.points} pts → <b>{payout.amount.toFixed(2)} EGP</b></p>
                        <p className="text-xs text-gray-500">{payout.method} · {payout.account} · {formatRelativeTime(payout.createdAt)}</p>
                      </div>
                      {payout.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <button onClick={() => handlePayout(payout.id, 'approved')} className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700">Approve & pay</button>
                          <button onClick={() => handlePayout(payout.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700">Reject</button>
                        </div>
                      ) : (
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${payout.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {payout.status === 'approved' ? 'Paid' : 'Rejected'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
