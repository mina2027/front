// ============================================================
// Rewards Center API client. Thin wrappers over the existing apiRequest helper;
// all reward logic/validation lives on the backend (this only transports data).
// ============================================================

import { apiRequest } from './api';
import { Reward, Redemption, RewardStats, LeaderboardEntry } from '../types';

// ---- user ----
export async function getRewardStats(): Promise<RewardStats | null> {
  const r = await apiRequest<RewardStats>('/api/rewards/stats');
  return r.ok ? r.data : null;
}
export async function getRewardStore(): Promise<Reward[]> {
  const r = await apiRequest<Reward[]>('/api/rewards/store');
  return r.ok && Array.isArray(r.data) ? r.data : [];
}
export async function getRecommendedReward(): Promise<Reward | null> {
  const r = await apiRequest<Reward | null>('/api/rewards/recommended');
  return r.ok ? (r.data as Reward | null) : null;
}
export async function getMyRedemptions(): Promise<Redemption[]> {
  const r = await apiRequest<Redemption[]>('/api/rewards/redemptions/mine');
  return r.ok && Array.isArray(r.data) ? r.data : [];
}
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const r = await apiRequest<LeaderboardEntry[]>('/api/rewards/leaderboard');
  return r.ok && Array.isArray(r.data) ? r.data : [];
}
export async function getRewardRules(): Promise<any> {
  const r = await apiRequest<any>('/api/rewards/rules');
  return r.ok ? r.data : null;
}
export async function redeemReward(
  rewardId: string
): Promise<{ ok: boolean; message?: string; redemption?: Redemption; balance?: number }> {
  const r = await apiRequest<{ redemption: Redemption; balance: number }>('/api/rewards/redeem', {
    method: 'POST',
    body: JSON.stringify({ rewardId }),
  });
  if (r.ok && r.data) return { ok: true, redemption: r.data.redemption, balance: r.data.balance };
  return { ok: false, message: r.message || 'Could not redeem this reward.' };
}

// ---- admin ----
export async function adminGetRewards(): Promise<Reward[]> {
  const r = await apiRequest<Reward[]>('/api/rewards/admin/rewards');
  return r.ok && Array.isArray(r.data) ? r.data : [];
}
export async function adminCreateReward(data: Partial<Reward>) {
  return apiRequest<Reward>('/api/rewards/admin/rewards', { method: 'POST', body: JSON.stringify(data) });
}
export async function adminUpdateReward(id: string, data: Partial<Reward>) {
  return apiRequest<Reward>(`/api/rewards/admin/rewards/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function adminDeleteReward(id: string) {
  return apiRequest(`/api/rewards/admin/rewards/${id}`, { method: 'DELETE' });
}
export async function adminGetVouchers(rewardId: string): Promise<{ total: number; available: number; used: number; codes: any[] }> {
  const r = await apiRequest<{ total: number; available: number; used: number; codes: any[] }>(`/api/rewards/admin/rewards/${rewardId}/vouchers`);
  return r.ok && r.data ? r.data : { total: 0, available: 0, used: 0, codes: [] };
}
export async function adminAddVouchers(rewardId: string, text: string) {
  return apiRequest<{ added: number; skipped: number }>(`/api/rewards/admin/rewards/${rewardId}/vouchers`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
export async function adminGetCategoryPoints(): Promise<Record<string, number>> {
  const r = await apiRequest<Record<string, number>>('/api/rewards/admin/category-points');
  return r.ok && r.data ? r.data : {};
}
export async function adminSetCategoryPoints(updates: Record<string, number>): Promise<Record<string, number>> {
  const r = await apiRequest<Record<string, number>>('/api/rewards/admin/category-points', { method: 'PUT', body: JSON.stringify(updates) });
  return r.ok && r.data ? r.data : {};
}
export async function adminGetRedemptions(): Promise<Redemption[]> {
  const r = await apiRequest<Redemption[]>('/api/rewards/admin/redemptions');
  return r.ok && Array.isArray(r.data) ? r.data : [];
}
export async function adminGetAnalytics(): Promise<any> {
  const r = await apiRequest<any>('/api/rewards/admin/analytics');
  return r.ok ? r.data : null;
}
