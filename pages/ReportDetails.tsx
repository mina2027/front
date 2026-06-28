import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MapPin, Calendar, User, Mail, ArrowLeft, MessageSquare, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { MatchCard } from '../components/MatchCard';
import { ContactRequestModal } from '../components/ContactRequestModal';
import { ContactChat } from '../components/ContactChat';
import { formatDate } from '../utils/dateUtils';
import { apiUrl } from '../utils/api';
import { Report, ContactRequest, MatchResult } from '../types';

export function ReportDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reports, currentUser, contactRequests, getAIMatches } = useApp();
  const [showContactModal, setShowContactModal] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openedRequestId, setOpenedRequestId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const chatSectionRef = useRef<HTMLDivElement | null>(null);
  const reportCardRef = useRef<HTMLDivElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlighted, setHighlighted] = useState(false);
  const deepLinkProcessedRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadReport = async () => {
      if (!id) {
        if (isMounted) setIsLoading(false);
        return;
      }

      const found = reports.find(r => r.id === id);
      if (found) {
        if (isMounted) {
          setReport(found);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(apiUrl(`/api/reports/${id}`));
        if (response.ok) {
          const data = await response.json();
          if (isMounted) setReport(data);
        }
      } catch (error) {
        console.error('Failed to load report:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [id, reports]);

  const openedRequestExists = openedRequestId
    ? contactRequests.some(request => request.id === openedRequestId)
    : false;

  useEffect(() => {
    if (!openedRequestId || !openedRequestExists) return;

    const timeout = window.setTimeout(() => {
      chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [openedRequestId, openedRequestExists]);

  // Deep-link from a notification: scroll to + briefly highlight the report, and
  // optionally open a specific conversation thread (?request=<id>). The trigger
  // params are then stripped (replace) so the URL stays clean and the Back button
  // still returns to the previous page.
  useEffect(() => {
    if (!report || !id || deepLinkProcessedRef.current === id) return;
    const wantHighlight = searchParams.get('highlight') === '1' || searchParams.get('src') === 'notification';
    const requestId = searchParams.get('request');
    if (!wantHighlight && !requestId) return;
    deepLinkProcessedRef.current = id;

    if (requestId) setOpenedRequestId(requestId);

    if (wantHighlight) {
      setHighlighted(true);
      // Only scroll to the top report card when not also opening a conversation
      // (the conversation has its own scroll-into-view below).
      if (!requestId) {
        window.setTimeout(() => {
          reportCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      }
      window.setTimeout(() => setHighlighted(false), 2400);
    }

    const next = new URLSearchParams(searchParams);
    next.delete('highlight');
    next.delete('src');
    next.delete('request');
    setSearchParams(next, { replace: true });
  }, [report, id, searchParams, setSearchParams]);

  // Owners see vision-aware AI matches computed by the backend (CLIP + text
  // embeddings). Non-owners don't see the match list.
  useEffect(() => {
    let active = true;
    if (report && currentUser && report.ownerId === currentUser.id) {
      getAIMatches(report).then(res => {
        if (active) setMatches(res);
      });
    } else {
      setMatches([]);
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id, currentUser?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-700">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-4">The report you're looking for doesn't exist.</p>
          <Link to="/browse" className="text-blue-600 hover:text-blue-800 font-medium">
            Browse all reports
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser ? report.ownerId === currentUser.id : false;
  const reportRequests = contactRequests.filter(req => req.reportId === report.id);
  const myRequests = currentUser
    ? reportRequests
        .filter(req => req.requesterId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];
  const myRequest = openedRequestId
    ? myRequests.find(req => req.id === openedRequestId) || myRequests[0]
    : myRequests[0];
  const typeColor = report.type === 'lost' ? 'text-red-600' : 'text-green-600';
  const typeBgColor = report.type === 'lost' ? 'bg-red-50' : 'bg-green-50';
  const typeLabel = report.type === 'lost' ? 'LOST' : 'FOUND';
  const handleContactRequestCreated = (request: ContactRequest) => {
    setOpenedRequestId(request.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Card */}
            <div ref={reportCardRef} className={`bg-white rounded-lg shadow-md overflow-hidden scroll-mt-24 ${highlighted ? 'report-highlight' : ''}`}>
              {/* Image */}
              {report.imageUrl && (
                <div className="h-96 bg-gray-200">
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`px-4 py-2 rounded-full font-bold ${typeColor} ${typeBgColor}`}>
                      {typeLabel}
                    </span>
                    <StatusBadge status={report.status} />
                  </div>
                  <span className="text-sm text-gray-500 capitalize">
                    {report.category}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{report.title}</h1>

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-line">{report.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{report.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">
                        Date {report.type === 'lost' ? 'Lost' : 'Found'}
                      </p>
                      <p className="font-medium text-gray-900">{formatDate(report.dateLostFound)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Posted By</p>
                      <p className="font-medium text-gray-900">{report.ownerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Posted On</p>
                      <p className="font-medium text-gray-900">{formatDate(report.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {!isOwner && (
                  <div className="mt-6">
                    {currentUser ? (
                      myRequest ? (
                        <div ref={chatSectionRef}>
                          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                            <p className="text-sm font-medium text-blue-900">
                              Request sent. Chat is open with {report.ownerName}.
                            </p>
                            <p className="mt-1 text-xs text-blue-700">
                              The report owner can reply from their dashboard while the request is pending.
                            </p>
                          </div>
                          <ContactChat
                            request={myRequest}
                            currentUserId={currentUser.id}
                            currentUserName={currentUser.name}
                          />
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setShowContactModal(true)}
                            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                          >
                            <MessageSquare className="w-5 h-5" />
                            <span>Request Contact Information</span>
                          </button>
                          <p className="text-xs text-gray-500 text-center mt-2">
                            Your request will be sent to the report owner for approval
                          </p>
                        </>
                      )
                    ) : (
                      <Link
                        to="/signin"
                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Sign in to request contact information
                      </Link>
                    )}
                  </div>
                )}

                {isOwner && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">This is your report.</span> You can manage
                      contact requests from the{' '}
                      <Link to="/my-reports" className="underline font-medium">
                        My Reports
                      </Link>{' '}
                      page.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Matches */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-lg">Potential Matches</h2>
              </div>

              {isOwner ? (
                matches.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Our smart algorithm found {matches.length} potential match
                      {matches.length > 1 ? 'es' : ''} based on item type, location, and description.
                    </p>
                    {matches.map(match => (
                      <MatchCard key={match.report.id} match={match} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">
                      No potential matches found yet. Check back later as new reports are added.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">
                    Potential matches are only visible to the report owner.
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">How matching works:</span> We analyze item category,
                  location proximity, description similarity, and date to find the best matches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Request Modal */}
      <ContactRequestModal
        reportId={report.id}
        reportTitle={report.title}
        reportType={report.type}
        verificationMethod={report.verificationMethod}
        verificationQuestion={report.verificationQuestion}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onRequestCreated={handleContactRequestCreated}
      />
    </div>
  );
}
