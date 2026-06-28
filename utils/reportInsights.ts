import { Report } from '../types';
import { findMatches } from './matchingAlgorithm';

export function getReportStats(reports: Report[]) {
  const total = reports.length;
  const lost = reports.filter(report => report.type === 'lost').length;
  const found = reports.filter(report => report.type === 'found').length;
  const resolved = reports.filter(report => report.status === 'resolved').length;
  const pending = reports.filter(report => report.status === 'pending').length;
  const activeUsers = new Set(reports.map(report => report.ownerId)).size;
  const resolveRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return { total, lost, found, resolved, pending, activeUsers, resolveRate };
}

export function getHotspots(reports: Report[], limit = 5) {
  const counts = reports.reduce<Record<string, number>>((acc, report) => {
    const key = report.location.split(',')[0]?.trim() || report.location.trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([location, count]) => ({ location, count }));
}

export function getReportsNeedingAttention(reports: Report[], limit = 4) {
  return [...reports]
    .filter(report => report.status !== 'resolved')
    .sort((a, b) => {
      const aAge = Date.now() - new Date(a.createdAt).getTime();
      const bAge = Date.now() - new Date(b.createdAt).getTime();
      return bAge - aAge;
    })
    .slice(0, limit);
}

export function getTopPotentialMatches(reports: Report[], limit = 3) {
  return reports
    .flatMap(report =>
      findMatches(report, reports, 0.65).map(match => ({
        source: report,
        match: match.report,
        score: match.score,
      }))
    )
    .filter((item, index, all) => {
      const pair = [item.source.id, item.match.id].sort().join(':');
      return all.findIndex(other => [other.source.id, other.match.id].sort().join(':') === pair) === index;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
