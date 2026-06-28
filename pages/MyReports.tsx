import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Inbox, CheckCircle, Mail, Eye, Check, X, MessageSquare, Trash2, Pencil, ShieldCheck } from 'lucide-react';
import { ContactChat } from '../components/ContactChat';
import { useApp } from '../contexts/AppContext';
import { ReportCard } from '../components/ReportCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatRelativeTime } from '../utils/dateUtils';

export function MyReports() {
  const { currentUser, reports, contactRequests, deleteReport, updateContactRequest } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reports' | 'requests' | 'contacts'>('reports');
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!currentUser || activeChatRequestId) return;

    const newestOpenIncomingRequest = contactRequests.find(req => {
      const report = reports.find(r => r.id === req.reportId);
      return report?.ownerId === currentUser.id && req.status !== 'denied';
    });

    if (newestOpenIncomingRequest) {
      setActiveChatRequestId(newestOpenIncomingRequest.id);
    }
  }, [activeChatRequestId, contactRequests, currentUser, reports]);

  if (!currentUser) return null;

  const userReports = reports.filter(r => r.ownerId === currentUser.id);
  const userContactRequests = contactRequests.filter(req => {
    const report = reports.find(r => r.id === req.reportId);
    return report?.ownerId === currentUser.id;
  });
  const myContactRequests = contactRequests
    .filter(req => req.requesterId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getRequestStatusClass = (status: 'pending' | 'approved' | 'denied') => {
    if (status === 'approved') return 'bg-green-100 text-green-800';
    if (status === 'denied') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const handleDeleteReport = (reportId: string, title: string) => {
    if (!confirm(`Delete the report "${title}"? This action cannot be undone.`)) return;
    deleteReport(reportId);
  };

  const handleApproveRequest = (requestId: string, reportId: string) => {
    updateContactRequest(requestId, 'approved');
    const request = contactRequests.find(r => r.id === requestId);
    if (request) {
      alert(
        `Contact approved! The requester (${request.requesterName}) can now see your contact information: ${reports.find(r => r.id === reportId)?.contactMethod}`
      );
    }
  };

  const handleDenyRequest = (requestId: string) => {
    updateContactRequest(requestId, 'denied');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Dashboard</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'reports'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>My Reports</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {userReports.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'requests'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Contact Requests</span>
                  {userContactRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                      {userContactRequests.filter(r => r.status === 'pending').length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'contacts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>My Conversations</span>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                    {myContactRequests.length}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'reports' && (
              <div>
                {userReports.length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
                    <p className="text-gray-600 mb-6">
                      You haven't created any reports. Start by reporting a lost or found item.
                    </p>
                    <Link
                      to="/add-report"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Create Your First Report
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <p className="text-gray-600">You have {userReports.length} active report(s)</p>
                      <Link
                        to="/add-report"
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        + Add New Report
                      </Link>
                    </div>

                    <div className="space-y-6">
                      {userReports.map(report => (
                        <div key={report.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                              <ReportCard report={report} />
                            </div>
                            <div className="p-4 bg-gray-50 flex flex-col justify-between">
                              <div>
                                <h4 className="font-medium text-sm text-gray-900 mb-3">
                                  Status
                                </h4>
                                <div className="mb-2">
                                  <StatusBadge status={report.status} />
                                </div>
                                <p className="text-xs text-gray-500">
                                  Report status is managed by the platform team and updates
                                  automatically as your case progresses.
                                </p>
                              </div>
                              <div className="mt-4 space-y-2">
                                <Link
                                  to={`/report/${report.id}`}
                                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition text-sm"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>View Details</span>
                                </Link>
                                <Link
                                  to={`/edit-report/${report.id}`}
                                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-blue-200 rounded-md text-blue-600 hover:bg-blue-50 transition text-sm"
                                >
                                  <Pencil className="w-4 h-4" />
                                  <span>Edit</span>
                                </Link>
                                <button
                                  onClick={() => handleDeleteReport(report.id, report.title)}
                                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-red-200 rounded-md text-red-600 hover:bg-red-50 transition text-sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                {userContactRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Contact Requests
                    </h3>
                    <p className="text-gray-600">
                      You haven't received any contact requests for your reports yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userContactRequests.map(request => {
                      const report = reports.find(r => r.id === request.reportId);
                      if (!report) return null;

                      return (
                        <div
                          key={request.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">
                                  Contact Request for "{report.title}"
                                </h3>
                              </div>
                              <p className="text-sm text-gray-500">
                                {formatRelativeTime(request.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {request.verificationPassed && (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full inline-flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> Verification PASS
                                </span>
                              )}
                              {request.status === 'pending' && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                  Pending
                                </span>
                              )}
                              {request.status === 'approved' && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Approved
                                </span>
                              )}
                              {request.status === 'denied' && (
                                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                  Denied
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              From: {request.requesterName}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">
                              Email: {request.requesterEmail}
                            </p>
                            <div className="border-t border-gray-200 pt-3">
                              <p className="text-sm font-medium text-gray-900 mb-1">Reason:</p>
                              <p className="text-sm text-gray-700 mb-3">{request.reason}</p>
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                Additional Details:
                              </p>
                              <p className="text-sm text-gray-700">{request.additionalDetails}</p>
                            </div>
                          </div>

                          {request.status === 'pending' && (
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-col sm:flex-row sm:space-x-3">
                                <button
                                  onClick={() => handleApproveRequest(request.id, request.reportId)}
                                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Approve & Share Contact</span>
                                </button>
                                <button
                                  onClick={() => handleDenyRequest(request.id)}
                                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                                >
                                  <X className="w-4 h-4" />
                                  <span>Deny Request</span>
                                </button>
                              </div>
                              <button
                                onClick={() => setActiveChatRequestId(activeChatRequestId === request.id ? null : request.id)}
                                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span>{activeChatRequestId === request.id ? 'Hide Chat' : 'Open Chat'}</span>
                              </button>
                            </div>
                          )}

                          {request.status === 'approved' && (
                            <div className="mb-4">
                              <button
                                onClick={() => setActiveChatRequestId(activeChatRequestId === request.id ? null : request.id)}
                                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span>{activeChatRequestId === request.id ? 'Hide Chat' : 'Open Chat'}</span>
                              </button>
                            </div>
                          )}

                          {activeChatRequestId === request.id && (
                            <ContactChat
                              request={request}
                              currentUserId={currentUser.id}
                              currentUserName={currentUser.name}
                            />
                          )}

                          {request.status === 'approved' && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-4">
                              <div className="flex items-center text-green-800 text-sm">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                <span>
                                  You approved this request. The requester can now contact you via:{' '}
                                  <span className="font-medium">{report.contactMethod}</span>
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div>
                {myContactRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Conversations Yet
                    </h3>
                    <p className="text-gray-600">
                      Your outgoing contact conversations will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myContactRequests.map(request => {
                      const report = reports.find(r => r.id === request.reportId);
                      if (!report) return null;

                      return (
                        <div
                          key={request.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">
                                  Conversation for "{report.title}"
                                </h3>
                              </div>
                              <p className="text-sm text-gray-500">
                                Started {formatRelativeTime(request.createdAt)} with {report.ownerName}
                              </p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRequestStatusClass(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>

                          {request.status === 'approved' && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                              <p className="text-sm font-medium text-green-800 mb-2">
                                Contact Information:
                              </p>
                              <p className="text-sm text-green-700 font-medium">
                                {report.contactMethod}
                              </p>
                              <p className="text-xs text-green-600 mt-2">
                                Report Owner: {report.ownerName}
                              </p>
                            </div>
                          )}

                          {request.status === 'denied' ? (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">
                              This request was denied, so the conversation is closed.
                            </div>
                          ) : (
                            <ContactChat
                              request={request}
                              currentUserId={currentUser.id}
                              currentUserName={currentUser.name}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
