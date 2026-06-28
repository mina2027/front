import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { Report, ContactRequest, User, Notification, ContactMessage, Payout, RewardConfig, MatchResult, UserLocation } from '../types';
import { fetchAIMatches } from '../utils/matchingAlgorithm';
import { apiUrl, apiRequest, getToken, setToken, authHeaders } from '../utils/api';

const normalizeReport = (report: any): Report => ({
  ...report,
  id: report.id || report._id,
  createdAt: report.createdAt ? new Date(report.createdAt).toISOString() : new Date().toISOString(),
  dateLostFound: report.dateLostFound ? new Date(report.dateLostFound).toISOString() : new Date().toISOString(),
});

const normalizeId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.id) return String(value.id);
  if (value._id) return String(value._id);
  return String(value);
};

const normalizeContactRequest = (request: any): ContactRequest => ({
  ...request,
  id: normalizeId(request.id || request._id),
  reportId: normalizeId(request.reportId),
  createdAt: request.createdAt ? new Date(request.createdAt).toISOString() : new Date().toISOString(),
  messages: (request.messages || []).map((message: any) => ({
    ...message,
    createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : new Date().toISOString(),
  })),
});

// Normalise a server-side (proximity) notification into the unified client shape.
const normalizeServerNotification = (n: any): Notification => {
  const reportId = n.reportId ? String(n.reportId) : '';
  return {
    id: String(n.id || n._id),
    userId: String(n.userId),
    reportId,
    title: n.title,
    body: n.body,
    message: n.body || n.message,
    distanceKm: typeof n.distanceKm === 'number' ? n.distanceKm : null,
    isRead: Boolean(n.isRead),
    createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    type: n.type || 'proximity',
    targetUrl: n.targetUrl || (reportId ? `/report/${reportId}` : ''),
    targetId: n.targetId || reportId,
    kind: 'proximity',
    source: 'server',
    data: n.data || {},
  };
};

interface AuthResult {
  success: boolean;
  message?: string;
}

interface SignUpData {
  name: string;
  username: string;
  phone: string;
  email: string;
  password: string;
  location: UserLocation; // verified map location — required to register
  emailVerified?: boolean; // email OTP verified server-side (Brevo) before signup
  emailVerifiedAt?: string;
}

interface AppContextType {
  reports: Report[];
  contactRequests: ContactRequest[];
  notifications: Notification[];
  currentUser: User | null;
  rewardConfig: RewardConfig | null;
  isLoading: boolean;
  apiError: string | null;
  refreshData: () => Promise<void>;
  refreshMe: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  addReport: (report: Omit<Report, 'id' | 'createdAt'>) => Promise<Report | { error: string } | null>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<Report | null>;
  deleteReport: (id: string) => Promise<boolean>;
  addContactRequest: (request: Omit<ContactRequest, 'id' | 'createdAt'>) => Promise<ContactRequest | null>;
  updateContactRequest: (id: string, status: 'approved' | 'denied') => Promise<ContactRequest | null>;
  confirmDelivery: (requestId: string) => Promise<ContactRequest | null>;
  confirmReceipt: (requestId: string, answer: 'yes' | 'no') => Promise<ContactRequest | null>;
  reviewRecoveryReward: (requestId: string, action: 'approve' | 'reject', reason?: string) => Promise<ContactRequest | null>;
  deleteContactRequest: (id: string) => Promise<boolean>;
  refreshContactRequest: (id: string) => Promise<ContactRequest | null>;
  addContactMessage: (requestId: string, message: Omit<ContactMessage, 'createdAt'>) => Promise<ContactRequest | null>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  getUserNotifications: (userId: string) => Notification[];
  signIn: (identifier: string, password: string) => Promise<AuthResult>;
  signUp: (data: SignUpData) => Promise<AuthResult>;
  signOut: () => void;
  updateProfile: (
    updates: Partial<Pick<User, 'name' | 'governorate' | 'city' | 'bio' | 'avatarUrl' | 'location' | 'notificationRadiusKm' | 'phoneVerified'>>
  ) => Promise<{ success: boolean; message?: string }>;
  getUserReports: (userId: string) => Report[];
  getReportContactRequests: (reportId: string) => ContactRequest[];
  getAIMatches: (report: Report) => Promise<MatchResult[]>;
  // Rewards
  requestPayout: (points: number, method: string, account: string) => Promise<{ success: boolean; message?: string }>;
  getMyPayouts: () => Promise<Payout[]>;
  // Admin
  fetchUsers: () => Promise<User[]>;
  updateUser: (id: string, updates: Partial<Pick<User, 'role'>> & { isBlocked?: boolean }) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  fetchPayouts: () => Promise<Payout[]>;
  updatePayout: (id: string, status: 'approved' | 'rejected') => Promise<Payout | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [serverNotifications, setServerNotifications] = useState<Notification[]>([]);
  const [rewardConfig, setRewardConfig] = useState<RewardConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lostandfound_user');
    return saved ? JSON.parse(saved) : null;
  });

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const createdNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      kind: notification.kind || 'match',
      source: 'local',
    };
    setNotifications(prev => [createdNotification, ...prev]);
  };

  // Pull the persisted (proximity) notifications for the signed-in user.
  const refreshNotifications = async () => {
    if (!getToken()) { setServerNotifications([]); return; }
    const result = await apiRequest<any[]>('/api/notifications');
    if (result.ok && Array.isArray(result.data)) {
      setServerNotifications(result.data.map(normalizeServerNotification));
    } else if (result.status === 401) {
      setServerNotifications([]);
    }
  };

  const markNotificationRead = (id: string) => {
    const isServer = serverNotifications.some(n => n.id === id);
    if (isServer) {
      setServerNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
      void apiRequest(`/api/notifications/${id}/read`, { method: 'PUT' });
      return;
    }
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setServerNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (getToken()) await apiRequest('/api/notifications/read-all', { method: 'PUT' });
  };

  // Merge persisted (server proximity) + in-session (local match) alerts, newest first.
  const getUserNotifications = (userId: string): Notification[] => {
    const local = notifications.filter(n => n.userId === userId);
    return [...serverNotifications, ...local].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const loadPlatformData = async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
      setApiError(null);
    }
    try {
      const [reportsRes, contactsRes] = await Promise.all([
        fetch(apiUrl('/api/reports'), { headers: authHeaders() }),
        fetch(apiUrl('/api/contact-requests'), { headers: authHeaders() }),
      ]);
      if (!reportsRes.ok || !contactsRes.ok) {
        throw new Error('Unable to load the latest platform data.');
      }
      const [reportsData, contactsData] = await Promise.all([reportsRes.json(), contactsRes.json()]);
      setReports(reportsData.map((r: any) => normalizeReport(r)));
      setContactRequests(contactsData.map((request: any) => normalizeContactRequest(request)));
      setApiError(null);
    } catch (error) {
      console.error('Failed to load API data:', error);
      if (showLoading) {
        setApiError('We could not connect to the backend. Showing the latest available data.');
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const refreshData = () => loadPlatformData(true);

  // Refresh the authenticated user (points / balance change over time).
  const refreshMe = async () => {
    if (!getToken()) return;
    const result = await apiRequest<{ user: User }>('/api/auth/me');
    if (result.ok && result.data?.user) {
      setCurrentUser(result.data.user);
    } else if (result.status === 401) {
      // Session expired – sign out silently.
      setToken(null);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    refreshData();
    apiRequest<RewardConfig>('/api/rewards/config').then(res => {
      if (res.ok && res.data) setRewardConfig(res.data);
    });
    if (getToken()) {
      refreshMe();
      void refreshNotifications();
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    // Load the user's notifications immediately on login, then poll alongside the
    // platform data (near-real-time in-app feed; Web Push handles instant alerts).
    void refreshNotifications();
    const interval = window.setInterval(() => {
      void loadPlatformData(false);
      void refreshMe();
      void refreshNotifications();
    }, 8000);
    return () => window.clearInterval(interval);
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lostandfound_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lostandfound_user');
    }
  }, [currentUser]);

  const addReport = async (report: Omit<Report, 'id' | 'createdAt'>) => {
    const result = await apiRequest<any>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
    if (!result.ok || !result.data) {
      const code = (result.data as any)?.code;
      if (code === 'MONTHLY_REPORT_LIMIT_REACHED') return { error: code };
      if (result.message) toast.error(result.message);
      return null;
    }
    const created = normalizeReport(result.data);
    setReports(prev => [created, ...prev]);
    void refreshMe(); // points may have been awarded

    // Strong-match notifications use the VISION-AWARE server matcher so the
    // two-stage filter (type → category → visual object validation) runs first.
    // Candidates rejected at the filter stage never reach here, so users are
    // never notified about fundamentally different objects. Only matches at or
    // above the strong threshold (0.7) generate a notification.
    try {
      // fallback:false → if the vision-aware backend is down we send NO
      // notification rather than risk a false positive from the image-blind engine.
      const strongMatches = await fetchAIMatches(created.id, created, [...reports, created], 0.7, { fallback: false });
      for (const match of strongMatches) {
        if (match.report.ownerId !== created.ownerId) {
          const pct = match.finalScore ?? Math.round((match.score ?? 0) * 100);
          addNotification({
            userId: created.ownerId,
            reportId: created.id,
            matchedReportId: match.report.id,
            // Clicking opens the MATCHED report (the thing the user wants to see).
            targetUrl: `/report/${match.report.id}`,
            targetId: match.report.id,
            type: 'match',
            title: 'Potential Match Found',
            message: `Strong match (${pct}%) between your report "${created.title}" and "${match.report.title}".`,
          });
          addNotification({
            userId: match.report.ownerId,
            reportId: match.report.id,
            matchedReportId: created.id,
            targetUrl: `/report/${created.id}`,
            targetId: created.id,
            type: 'match',
            title: 'Potential Match Found',
            message: `Strong match (${pct}%) between your report "${match.report.title}" and "${created.title}".`,
          });
        }
      }
    } catch {
      // Matching is best-effort; never block report creation on it.
    }
    return created;
  };

  const updateReport = async (id: string, updates: Partial<Report>) => {
    const result = await apiRequest<any>(`/api/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!result.ok || !result.data) return null;
    const updated = normalizeReport(result.data);
    setReports(prev => prev.map(rep => (rep.id === id ? updated : rep)));
    void refreshMe();
    return updated;
  };

  const deleteReport = async (id: string) => {
    const result = await apiRequest(`/api/reports/${id}`, { method: 'DELETE' });
    if (!result.ok) return false;
    setReports(prev => prev.filter(rep => rep.id !== id));
    setContactRequests(prev => prev.filter(req => req.reportId !== id));
    return true;
  };

  const addContactRequest = async (request: Omit<ContactRequest, 'id' | 'createdAt'>) => {
    const result = await apiRequest<any>('/api/contact-requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (!result.ok || !result.data) {
      // Surfaces backend gate messages, e.g. "Incorrect verification answer."
      if (result.message) toast.error(result.message);
      return null;
    }
    const created = normalizeContactRequest(result.data);
    setContactRequests(prev => [created, ...prev.filter(req => req.id !== created.id)]);
    setReports(prev => prev.map(r => (r.id === created.reportId ? { ...r, status: 'pending' } : r)));
    return created;
  };

  const refreshContactRequest = async (id: string) => {
    const result = await apiRequest<any>(`/api/contact-requests/${id}`);
    if (!result.ok || !result.data) return null;
    const updated = normalizeContactRequest(result.data);
    setContactRequests(prev => {
      const exists = prev.some(req => req.id === id);
      return exists ? prev.map(req => (req.id === id ? updated : req)) : [updated, ...prev];
    });
    return updated;
  };

  const addContactMessage = async (requestId: string, message: Omit<ContactMessage, 'createdAt'>) => {
    const result = await apiRequest<any>(`/api/contact-requests/${requestId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
    if (!result.ok || !result.data) return null;
    const updated = normalizeContactRequest(result.data);
    setContactRequests(prev => prev.map(req => (req.id === requestId ? updated : req)));
    return updated;
  };

  const updateContactRequest = async (id: string, status: 'approved' | 'denied') => {
    const result = await apiRequest<any>(`/api/contact-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (!result.ok || !result.data) return null;
    const updated = normalizeContactRequest(result.data);
    setContactRequests(prev => prev.map(req => (req.id === id ? updated : req)));
    return updated;
  };

  // --- Successful-recovery workflow (server enforces all permissions) ---
  const recoveryAction = async (path: string, body: Record<string, unknown>) => {
    const result = await apiRequest<any>(path, { method: 'POST', body: JSON.stringify(body) });
    if (!result.ok || !result.data) return null;
    const updated = normalizeContactRequest(result.data);
    setContactRequests(prev => prev.map(req => (req.id === updated.id ? updated : req)));
    return updated;
  };
  // Step 1: finder confirms delivery (found-report owner only — enforced server-side).
  const confirmDelivery = (requestId: string) =>
    recoveryAction(`/api/contact-requests/${requestId}/recovery/deliver`, {});
  // Step 2: owner confirms receipt (lost-report owner only — enforced server-side).
  const confirmReceipt = (requestId: string, answer: 'yes' | 'no') =>
    recoveryAction(`/api/contact-requests/${requestId}/recovery/receive`, { answer });
  // Step 4: admin approves/rejects the reward (admin only — enforced server-side).
  const reviewRecoveryReward = (requestId: string, action: 'approve' | 'reject', reason?: string) =>
    recoveryAction(`/api/contact-requests/${requestId}/recovery/admin-review`, { action, reason });

  // Admin / report owner: remove an abusive or invalid contact request.
  const deleteContactRequest = async (id: string): Promise<boolean> => {
    const result = await apiRequest(`/api/contact-requests/${id}`, { method: 'DELETE' });
    if (!result.ok) return false;
    setContactRequests(prev => prev.filter(req => req.id !== id));
    return true;
  };

  const signIn = async (identifier: string, password: string): Promise<AuthResult> => {
    const result = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (!result.ok || !result.data) {
      return { success: false, message: result.message || 'Invalid credentials' };
    }
    setToken(result.data.token);
    setCurrentUser(result.data.user);
    return { success: true };
  };

  const signUp = async (data: SignUpData): Promise<AuthResult> => {
    const result = await apiRequest<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!result.ok || !result.data) {
      return { success: false, message: result.message || 'Registration failed' };
    }
    setToken(result.data.token);
    setCurrentUser(result.data.user);
    return { success: true };
  };

  const signOut = () => {
    setToken(null);
    setCurrentUser(null);
    setServerNotifications([]);
  };

  // Persist editable profile fields to the backend and sync local state from the
  // server's response (localStorage is kept in sync by the currentUser effect).
  const updateProfile = async (
    updates: Partial<Pick<User, 'name' | 'governorate' | 'city' | 'bio' | 'avatarUrl' | 'location'>>
  ): Promise<{ success: boolean; message?: string }> => {
    const result = await apiRequest<{ user: User }>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!result.ok || !result.data?.user) {
      return { success: false, message: result.message || 'Profile update failed.' };
    }
    setCurrentUser(result.data.user);
    return { success: true };
  };

  const getUserReports = (userId: string): Report[] => reports.filter(report => report.ownerId === userId);

  const getReportContactRequests = (reportId: string): ContactRequest[] =>
    contactRequests.filter(req => req.reportId === reportId);

  // Surface "possible matches" from 50% up — the realistic scorer reserves 70%+
  // for genuinely strong matches, so a lower floor keeps moderate (but useful)
  // candidates visible. The card's tier colours convey the confidence.
  const getAIMatches = async (report: Report): Promise<MatchResult[]> =>
    fetchAIMatches(report.id, report, reports, 0.5);

  // ----- Rewards -----
  const requestPayout = async (points: number, method: string, account: string) => {
    const result = await apiRequest<Payout>('/api/rewards/payouts', {
      method: 'POST',
      body: JSON.stringify({ points, method, account }),
    });
    if (!result.ok) return { success: false, message: result.message || 'Payout request failed' };
    void refreshMe();
    return { success: true };
  };

  const getMyPayouts = async (): Promise<Payout[]> => {
    const result = await apiRequest<Payout[]>('/api/rewards/payouts/mine');
    return result.ok && Array.isArray(result.data) ? result.data : [];
  };

  // ----- Admin -----
  const fetchUsers = async (): Promise<User[]> => {
    const result = await apiRequest<User[]>('/api/users');
    return result.ok && Array.isArray(result.data) ? result.data : [];
  };

  const updateUser = async (id: string, updates: any): Promise<User | null> => {
    const result = await apiRequest<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return result.ok ? result.data : null;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    const result = await apiRequest(`/api/users/${id}`, { method: 'DELETE' });
    return result.ok;
  };

  const fetchPayouts = async (): Promise<Payout[]> => {
    const result = await apiRequest<Payout[]>('/api/rewards/payouts');
    return result.ok && Array.isArray(result.data) ? result.data : [];
  };

  const updatePayout = async (id: string, status: 'approved' | 'rejected'): Promise<Payout | null> => {
    const result = await apiRequest<Payout>(`/api/rewards/payouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return result.ok ? result.data : null;
  };

  return (
    <AppContext.Provider
      value={{
        reports,
        contactRequests,
        notifications,
        currentUser,
        rewardConfig,
        isLoading,
        apiError,
        refreshData,
        refreshMe,
        setCurrentUser,
        addReport,
        updateReport,
        deleteReport,
        addContactRequest,
        updateContactRequest,
        confirmDelivery,
        confirmReceipt,
        reviewRecoveryReward,
        deleteContactRequest,
        refreshContactRequest,
        addContactMessage,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        refreshNotifications,
        getUserNotifications,
        signIn,
        signUp,
        signOut,
        updateProfile,
        getUserReports,
        getReportContactRequests,
        getAIMatches,
        requestPayout,
        getMyPayouts,
        fetchUsers,
        updateUser,
        deleteUser,
        fetchPayouts,
        updatePayout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
