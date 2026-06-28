import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Bell, LogOut, User, Wallet, Plus, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';
import { formatRelativeTime } from '../utils/dateUtils';
import { resolveNotificationTarget, withHighlight } from '../utils/notificationNav';
import { Notification } from '../types';

const NAV_ITEMS_PUBLIC = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Browse' },
];
const NAV_ITEMS_AUTH = [
  { to: '/my-reports', label: 'My Reports' },
  { to: '/profile', label: 'Profile' },
];

export function Navbar() {
  const { currentUser, signOut, getUserNotifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userNotifications = currentUser ? getUserNotifications(currentUser.id) : [];
  const unreadCount = userNotifications.filter(n => !n.isRead).length;
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleSignOut = () => {
    signOut();
    setUserMenuOpen(false);
    navigate('/signin');
  };

  // Deep-link navigation for any notification: mark read → close dropdown →
  // navigate to its target (with a highlight flag). Falls back gracefully when a
  // notification has no linked page (never a blank screen). A normal navigate()
  // pushes history, so the Back button returns to the previous page.
  const handleNotificationClick = (n: Notification) => {
    markNotificationRead(n.id);
    setNotificationsOpen(false);
    const target = resolveNotificationTarget(n);
    if (!target) {
      toast.info('This notification has no linked page.');
      return;
    }
    navigate(withHighlight(target));
  };

  // close pop-overs on outside click
  React.useEffect(() => {
    const close = () => { setUserMenuOpen(false); setNotificationsOpen(false); };
    if (userMenuOpen || notificationsOpen) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [userMenuOpen, notificationsOpen]);

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl aurora-gradient shadow-md group-hover:shadow-lg transition-shadow">
                <Search className="w-5 h-5 text-white" />
              </span>
              <span className="font-display text-xl font-extrabold text-gradient">
                Lost &amp; Found
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS_PUBLIC.map(item => (
              <Link key={item.to} to={item.to} className="nav-link" data-active={isActive(item.to)}>
                {item.label}
              </Link>
            ))}
            {currentUser && NAV_ITEMS_AUTH.map(item => (
              <Link key={item.to} to={item.to} className="nav-link" data-active={isActive(item.to)}>
                {item.label}
              </Link>
            ))}
            {currentUser?.role === 'admin' && (
              <Link to="/admin" className="nav-link" data-active={isActive('/admin')}>
                Admin
              </Link>
            )}
          </div>

          {/* Right cluster */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser && (
              <Link
                to="/add-report"
                className="btn-luxury !py-2 !px-3.5 text-sm"
                title="Add a new report"
              >
                <Plus className="w-4 h-4" /> Add Report
              </Link>
            )}

            {currentUser && (
              <Link
                to="/rewards"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-800 hover:bg-violet-100 transition"
                title="My points & wallet"
              >
                <Wallet className="w-4 h-4 text-fuchsia-600" />
                <span className="text-sm font-semibold">{currentUser.points ?? 0} pts</span>
              </Link>
            )}

            {currentUser && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setNotificationsOpen(p => !p); setUserMenuOpen(false); }}
                  className="relative p-2 rounded-lg text-luxury-navy hover:bg-violet-50 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-rose-600 rounded-full animate-pulse-glow">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-[22rem] card-glass py-2 z-50 animate-fade-in">
                    <div className="px-3 py-2 flex items-center justify-between border-b border-violet-100">
                      <span className="text-sm font-semibold text-luxury-navy">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => void markAllNotificationsRead()}
                          className="text-[11px] text-luxury-gold hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {userNotifications.length === 0 ? (
                      <div className="px-3 py-6 text-xs text-gray-500 text-center">
                        You're all caught up ✨
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {userNotifications.slice(0, 8).map(n => {
                          const title = n.title || (n.kind === 'proximity' ? 'Lost Item Report Near You' : 'New match found');
                          const line = n.data?.reportTitle || n.message || n.body || '';
                          const img = n.data?.imageUrl;
                          return (
                            <button
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`w-full text-left px-3 py-2.5 hover:bg-violet-50 transition flex gap-2.5 ${n.isRead ? 'opacity-60' : ''}`}
                            >
                              <span className="w-10 h-10 rounded-lg overflow-hidden flex-none bg-violet-100 flex items-center justify-center">
                                {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <MapPin className="w-4 h-4 text-luxury-gold" />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center justify-between gap-2">
                                  <span className={`text-xs font-semibold truncate ${n.isRead ? 'text-gray-500' : 'text-luxury-navy'}`}>{title}</span>
                                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-fuchsia-600 flex-none" aria-label="Unread" />}
                                </span>
                                {line && <span className="block text-[11px] text-gray-500 truncate">{line}</span>}
                                <span className="flex items-center gap-2 mt-1">
                                  {typeof n.distanceKm === 'number' && (
                                    <span className="pill pill-brand !text-[0.6rem] !py-0.5">{n.distanceKm} km away</span>
                                  )}
                                  <span className="text-[10px] text-gray-400">{formatRelativeTime(n.createdAt)}</span>
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!currentUser ? (
              <>
                <Link to="/signin" className="nav-link">Sign In</Link>
                <Link to="/signup" className="btn-luxury !py-2 !px-4 text-sm">Sign Up</Link>
              </>
            ) : (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setUserMenuOpen(p => !p); setNotificationsOpen(false); }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-violet-50 transition"
                >
                  <div className="w-9 h-9 rounded-full aurora-gradient text-white flex items-center justify-center font-bold shadow-md">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-luxury-navy max-w-[110px] truncate">
                    {currentUser.name}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 card-glass py-1 z-50 animate-fade-in">
                    <div className="px-4 py-3 text-sm border-b border-violet-100">
                      <div className="font-semibold text-luxury-navy truncate">{currentUser.name}</div>
                      <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
                      <div className="text-[10px] uppercase tracking-wider text-fuchsia-700 mt-1 font-bold">
                        {currentUser.role}
                      </div>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                      className="w-full text-left px-4 py-2 text-sm text-luxury-navy hover:bg-violet-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/rewards'); }}
                      className="w-full text-left px-4 py-2 text-sm text-luxury-navy hover:bg-violet-50 flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" /> Rewards & Wallet
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-rose-700 hover:bg-rose-50 flex items-center gap-2 border-t border-violet-100"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(p => !p)}
              className="p-2 rounded-lg text-luxury-navy hover:bg-violet-50 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-violet-100 animate-fade-in">
          <div className="px-3 pt-3 pb-4 space-y-1 bg-white/80 backdrop-blur-md">
            {NAV_ITEMS_PUBLIC.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-luxury-navy hover:bg-violet-50 font-medium"
              >
                {item.label}
              </Link>
            ))}
            {!currentUser && (
              <>
                <Link to="/signin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-luxury-navy hover:bg-violet-50">
                  Sign In
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-white aurora-gradient font-semibold text-center">
                  Sign Up
                </Link>
              </>
            )}
            {currentUser && (
              <>
                <Link to="/add-report" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-white aurora-gradient font-semibold text-center">
                  + Add Report
                </Link>
                <Link to="/my-reports" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-luxury-navy hover:bg-violet-50">My Reports</Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-luxury-navy hover:bg-violet-50">Profile</Link>
                <Link to="/rewards" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-luxury-navy hover:bg-violet-50">Rewards & Wallet</Link>
                {currentUser.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-fuchsia-700 hover:bg-fuchsia-50 font-medium">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
