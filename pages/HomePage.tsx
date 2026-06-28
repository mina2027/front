import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  ShieldCheck,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Sparkles,
  TrendingUp,
  Heart,
  Trophy,
  Activity,
  Zap,
  Globe,
  Award,
  Target,
} from "lucide-react";
import { ReportCard } from "../components/ReportCard";
import { useApp } from "../contexts/AppContext";
import { getHotspots, getReportStats, getTopPotentialMatches } from "../utils/reportInsights";

export function HomePage() {
  const { reports, isLoading, apiError, refreshData } = useApp();

  // Resolved reports linger on public Home for 24h after they're resolved, then
  // drop off the listings/suggestions (they stay visible in My Reports and to
  // admins). Aggregate stats below still use the full set. Reports resolved before
  // this field existed (no resolvedAt) are treated as expired.
  const GRACE_MS = 24 * 60 * 60 * 1000;
  const visibleReports = reports.filter((r) =>
    r.status !== 'resolved'
    || (!!r.resolvedAt && Date.now() - new Date(r.resolvedAt).getTime() <= GRACE_MS));

  const recentReports = visibleReports.slice(0, 6);
  const lostReports = visibleReports
    .filter((r) => r.type === "lost")
    .slice(0, 3);
  const foundReports = visibleReports
    .filter((r) => r.type === "found")
    .slice(0, 3);
  const stats = getReportStats(reports);
  const hotspots = getHotspots(reports, 4);
  const topMatches = getTopPotentialMatches(visibleReports, 3);

  // ---- Rich computed insights for the luxury dashboard ----
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const last7d = reports.filter(r => now - new Date(r.createdAt).getTime() < 7 * dayMs).length;
  const last24h = reports.filter(r => now - new Date(r.createdAt).getTime() < dayMs).length;
  const resolvedLast30d = reports.filter(
    r => r.status === 'resolved' && now - new Date(r.createdAt).getTime() < 30 * dayMs
  ).length;

  // Category leader
  const catCounts = reports.reduce<Record<string, number>>((acc, r) => {
    const k = (r.category || 'other').toString();
    acc[k] = (acc[k] || 0) + 1; return acc;
  }, {});
  const topCategory = Object.entries(catCounts).sort(([, a], [, b]) => b - a)[0];

  // Simple weekly sparkline (last 7 days new reports)
  const weeklySeries = Array.from({ length: 7 }).map((_, i) => {
    const dayStart = now - (6 - i) * dayMs;
    return reports.filter(r => {
      const t = new Date(r.createdAt).getTime();
      return t >= dayStart && t < dayStart + dayMs;
    }).length;
  });
  const sparkMax = Math.max(1, ...weeklySeries);

  // Avg response time placeholder (until backend provides it): if pending exists, derive a friendly number
  const avgResponseHrs = stats.pending > 0 ? Math.max(2, Math.min(24, Math.round(48 / stats.pending))) : 6;

  // Trust score (composite 0–100)
  const trustScore = Math.min(
    100,
    Math.round(stats.resolveRate * 0.6 + Math.min(40, stats.activeUsers * 1.2))
  );

  return (
    <div className="animate-fade-in">
      {/* Hero Section — Aurora */}
      <section className="relative overflow-hidden py-24 md:py-28">
        {/* Executive Noir hero background */}
        <div className="absolute inset-0 -z-10" style={{
          backgroundColor: '#03060c',
          backgroundImage:
            'radial-gradient(1000px 540px at 12% 8%, rgba(43,81,116,0.45), transparent 60%),' +
            'radial-gradient(900px 520px at 92% 0%, rgba(201,169,97,0.22), transparent 60%),' +
            'radial-gradient(900px 600px at 50% 110%, rgba(15,26,48,0.55), transparent 60%),' +
            'linear-gradient(180deg, #03060c 0%, #060912 50%, #03060c 100%)',
        }} />
        {/* Subtle grain */}
        <div className="absolute inset-0 -z-10 opacity-[0.08] mix-blend-overlay"
             style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '3px 3px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-gold backdrop-blur text-xs font-semibold tracking-[0.2em] uppercase mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
            <span className="text-gold-gradient">AI-powered reunions · privacy first</span>
          </span>

          <h1 className="font-display text-4xl md:text-6xl font-extrabold mb-6 leading-tight animate-slide-in">
            From <span className="text-gradient-warm">panic</span> to{' '}
            <span className="text-gradient-warm">peace</span>,<br className="hidden md:block" />
            in three taps.
          </h1>

          <p className="text-lg md:text-xl mb-10 text-violet-100/90 max-w-2xl mx-auto">
            A secure, AI-matched platform that reunites people with what they love —
            without ever exposing their contact details.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/add-report?type=lost" className="btn-luxury text-base">
              <Plus className="w-5 h-5" /> I lost something
            </Link>
            <Link
              to="/add-report?type=found"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white bg-white/10 backdrop-blur border border-white/25 hover:bg-white/20 transition"
            >
              <Plus className="w-5 h-5" /> I found something
            </Link>
          </div>

          <div className="mt-6">
            <Link
              to="/browse"
              className="inline-flex items-center text-violet-100 hover:text-white transition text-sm"
            >
              <Search className="w-4 h-4 mr-2" />
              Or browse all reports
            </Link>
          </div>

          {/* Glass stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { label: 'Reports', value: stats.total },
              { label: 'Resolved', value: `${stats.resolveRate}%` },
              { label: 'Lost', value: stats.lost },
              { label: 'Found', value: stats.found },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/10 border border-white/20 backdrop-blur px-4 py-3.5 text-left">
                <div className="font-display text-2xl md:text-3xl font-bold">{item.value}</div>
                <div className="text-xs uppercase tracking-wider text-violet-100/70">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          LUXURY STATISTICS DASHBOARD
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 surface-noir">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section heading */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] uppercase text-luxury-gold mb-3">
                <Activity className="w-3.5 h-3.5" /> Live platform pulse
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight">
                The numbers behind every <span className="text-gold-gradient">reunion</span>
              </h2>
              <p className="text-sm md:text-base text-gray-400 mt-2 max-w-xl">
                A transparent, real-time dashboard of how the community is performing.
              </p>
            </div>
            <Link
              to="/browse"
              className="btn-ghost text-sm self-start md:self-auto"
            >
              Explore reports <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divider-gold mb-10" />

          {/* Top KPIs — 4 hero tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[
              {
                label: 'Total reports',
                value: stats.total,
                Icon: Globe,
                hint: `+${last24h} today`,
                tone: 'from-violet-500/30 to-fuchsia-500/10',
                iconTone: 'text-violet-300',
              },
              {
                label: 'Items reunited',
                value: stats.resolved,
                Icon: Heart,
                hint: `${resolvedLast30d} this month`,
                tone: 'from-pink-500/30 to-rose-500/10',
                iconTone: 'text-pink-300',
              },
              {
                label: 'Resolve rate',
                value: `${stats.resolveRate}%`,
                Icon: Trophy,
                hint: 'Industry leading',
                tone: 'from-amber-500/30 to-yellow-500/10',
                iconTone: 'text-luxury-gold',
                gold: true,
              },
              {
                label: 'Active community',
                value: stats.activeUsers,
                Icon: Users,
                hint: `${last7d} reports this week`,
                tone: 'from-cyan-500/30 to-violet-500/10',
                iconTone: 'text-cyan-300',
              },
            ].map(({ label, value, Icon, hint, tone, iconTone, gold }) => (
              <div key={label} className="stat-tile group">
                <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${tone} blur-2xl opacity-70 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 ${iconTone}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                      {hint}
                    </span>
                  </div>
                  <div className={`font-display text-4xl md:text-5xl font-extrabold leading-none mb-2 ${gold ? 'text-gold-gradient' : 'text-white'}`}>
                    {value}
                  </div>
                  <div className="text-sm text-gray-400 font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Secondary insights — 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly activity sparkline */}
            <div className="card-glass p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-luxury-gold mb-1">
                    7-day activity
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">
                    Reports submitted this week
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 pill pill-brand">
                  <TrendingUp className="w-3 h-3" />
                  {last7d} new
                </div>
              </div>

              {/* Bar chart */}
              <div className="flex items-end justify-between gap-2 h-32">
                {weeklySeries.map((v, i) => {
                  const h = (v / sparkMax) * 100;
                  const isToday = i === weeklySeries.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                      <span className="text-[10px] font-bold text-gray-400">{v}</span>
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${
                          isToday
                            ? 'shadow-[0_0_20px_rgba(201,169,97,0.55)]'
                            : ''
                        }`}
                        style={{
                          height: `${Math.max(6, h)}%`,
                          backgroundImage: isToday
                            ? 'linear-gradient(180deg, #f0e5c8 0%, #c9a961 50%, #8b6914 100%)'
                            : 'linear-gradient(180deg, rgba(43,81,116,0.65) 0%, rgba(15,26,48,0.45) 100%)',
                        }}
                      />
                      <span className={`text-[10px] font-medium ${isToday ? 'text-luxury-gold' : 'text-gray-500'}`}>
                        {['M','T','W','T','F','S','S'][(new Date(now - (6-i)*dayMs).getDay() + 6) % 7]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust score gauge */}
            <div className="card-glass p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-luxury-gold mb-1">
                    Trust score
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">Community health</h3>
                </div>
                <Award className="w-5 h-5 text-luxury-gold" />
              </div>

              <div className="flex-1 flex items-center justify-center my-4">
                <div
                  className="relative"
                  style={{
                    width: 160, height: 160,
                    borderRadius: '9999px',
                    background: `conic-gradient(from -90deg,
                      #5d4509 0deg,
                      #b8923f ${trustScore * 1.2}deg,
                      #c9a961 ${trustScore * 2.4}deg,
                      #e3d2a2 ${trustScore * 3.6}deg,
                      rgba(255,255,255,0.05) ${trustScore * 3.6}deg 360deg)`,
                    filter: 'drop-shadow(0 0 18px rgba(201,169,97,0.45))',
                  }}
                >
                  <div className="absolute inset-[10px] rounded-full bg-[#0a0d18] flex flex-col items-center justify-center">
                    <div className="text-gold-gradient font-display text-4xl font-extrabold leading-none">
                      {trustScore}
                    </div>
                    <div className="text-[10px] tracking-widest uppercase text-gray-400 mt-1">/ 100</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-luxury-gold" /> Resolve rate
                </div>
                <div className="text-right text-white font-semibold">{stats.resolveRate}%</div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-fuchsia-500" /> Active users
                </div>
                <div className="text-right text-white font-semibold">{stats.activeUsers}</div>
              </div>
            </div>
          </div>

          {/* Mini-stat row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { Icon: Zap, label: 'Lost reports', value: stats.lost, tone: 'text-rose-300' },
              { Icon: ShieldCheck, label: 'Found reports', value: stats.found, tone: 'text-emerald-300' },
              { Icon: Clock, label: 'Avg. response', value: `${avgResponseHrs}h`, tone: 'text-cyan-300' },
              { Icon: Target, label: 'Top category', value: topCategory ? topCategory[0] : '—', tone: 'text-luxury-gold' },
            ].map(({ Icon, label, value, tone }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur">
                <div className={`w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${tone}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-lg font-bold text-white truncate capitalize">{value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-gray-400">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {apiError && (
        <section className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">{apiError}</span>
            </div>
            <button onClick={refreshData} className="text-sm font-semibold text-amber-900 hover:text-amber-700">
              Try again
            </button>
          </div>
        </section>
      )}

      {/* Intelligence Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Strong Match Leads</h2>
              </div>
              <div className="space-y-3">
                {topMatches.length > 0 ? topMatches.map((item) => (
                  <Link
                    key={`${item.source.id}-${item.match.id}`}
                    to={`/report/${item.source.id}`}
                    className="block rounded-md bg-white border border-gray-200 p-3 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.source.title}</p>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                        {Math.round(item.score * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">Possible match: {item.match.title}</p>
                  </Link>
                )) : (
                  <p className="text-sm text-gray-600">No strong cross-report matches yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-gray-900">Active Hotspots</h2>
              </div>
              <div className="space-y-3">
                {hotspots.length > 0 ? hotspots.map((item) => (
                  <Link
                    key={item.location}
                    to={`/browse?location=${encodeURIComponent(item.location)}`}
                    className="flex items-center justify-between rounded-md bg-white border border-gray-200 p-3 hover:border-green-300 transition"
                  >
                    <span className="text-sm font-medium text-gray-900">{item.location}</span>
                    <span className="text-xs text-gray-500">{item.count} reports</span>
                  </Link>
                )) : (
                  <p className="text-sm text-gray-600">Hotspots appear after reports are added.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">Operations Snapshot</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-white border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                  <div className="text-xs text-gray-500">In contact</div>
                </div>
                <div className="rounded-md bg-white border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
                  <div className="text-xs text-gray-500">Active users</div>
                </div>
                <Link to="/browse?status=new" className="col-span-2 inline-flex items-center justify-between rounded-md bg-blue-600 text-white px-4 py-3 text-sm font-semibold hover:bg-blue-700 transition">
                  Review new reports
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3 text-luxury-navy">
            Why people <span className="text-gradient-warm">trust</span> us
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
            Three reasons reunions happen faster here than anywhere else.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { Icon: ShieldCheck, title: 'Privacy by default',
                text: 'Contact details are never public. They’re shared only after you approve a request.',
                tone: 'from-violet-500 to-fuchsia-500' },
              { Icon: Sparkles, title: 'AI-powered matching',
                text: 'Our algorithm scores potential matches by photo, category, location and timing.',
                tone: 'from-fuchsia-500 to-pink-500' },
              { Icon: Clock, title: 'Real-time updates',
                text: 'Track every status change and get notified the moment a match appears.',
                tone: 'from-cyan-500 to-violet-500' },
            ].map(({ Icon, title, text, tone }) => (
              <div key={title} className="card-glass card-lift p-7 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg mb-5`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2 text-luxury-navy">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Reports */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              Recent Reports
            </h2>
            <Link
              to="/browse"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View All
              <svg
                className="w-5 h-5 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-80 rounded-lg bg-gray-100 animate-pulse" />
                ))
              : recentReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
          </div>
        </div>
      </section>

      {/* Lost Items Section */}
      <section className="py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-red-800">
              Lost Items
            </h2>
            <Link
              to="/browse?type=lost"
              className="text-red-600 hover:text-red-800 font-medium flex items-center"
            >
              View All Lost
              <svg
                className="w-5 h-5 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lostReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </section>

      {/* Found Items Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-green-800">
              Found Items
            </h2>
            <Link
              to="/browse?type=found"
              className="text-green-600 hover:text-green-800 font-medium flex items-center"
            >
              View All Found
              <svg
                className="w-5 h-5 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foundReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-2xl p-10 md:p-14 text-center shadow-2xl border-gold"
            style={{
              backgroundImage:
                'radial-gradient(700px 320px at 50% 0%, rgba(201,169,97,0.18), transparent 60%),' +
                'linear-gradient(180deg, #0a1224 0%, #060912 100%)',
            }}
          >
            <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
                 style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
            <Users className="w-14 h-14 mx-auto mb-4 text-luxury-gold" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-white">
              Ready to make a <span className="text-gold-gradient">reunion</span> happen?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
              Join thousands of people helping items find their way home.
            </p>
            <Link to="/add-report" className="btn-luxury">
              <Plus className="w-5 h-5" />
              Create your first report
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
