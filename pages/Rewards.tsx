import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Gift, Coins, Trophy, Award, ArrowLeft, CheckCircle, Clock, XCircle, Wallet, Crown, Star,
  Smartphone, KeyRound, PawPrint, FileText, ShoppingBag, Gem, Laptop, Shirt, Package, Sparkles, Ticket, ChevronRight,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Reward, Redemption, RewardStats, LeaderboardEntry } from '../types';
import {
  getRewardStats, getRewardStore, getRecommendedReward, getMyRedemptions, getLeaderboard, getRewardRules, redeemReward,
} from '../utils/rewardsApi';

const CATEGORY_META: Record<string, { label: string; icon: any }> = {
  phone: { label: 'Phone', icon: Smartphone },
  wallet: { label: 'Wallet', icon: Wallet },
  keys: { label: 'Keys', icon: KeyRound },
  pet: { label: 'Pet', icon: PawPrint },
  document: { label: 'Document', icon: FileText },
  bag: { label: 'Bag', icon: ShoppingBag },
  jewelry: { label: 'Jewelry', icon: Gem },
  electronics: { label: 'Electronics', icon: Laptop },
  clothing: { label: 'Clothing', icon: Shirt },
  other: { label: 'Other', icon: Package },
};
const CATEGORY_ORDER = ['phone', 'wallet', 'keys', 'pet', 'document', 'bag', 'jewelry', 'electronics', 'clothing', 'other'];

export function Rewards() {
  const { currentUser, refreshMe } = useApp();
  const navigate = useNavigate();

  const [stats, setStats] = useState<RewardStats | null>(null);
  const [store, setStore] = useState<Reward[]>([]);
  const [recommended, setRecommended] = useState<Reward | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categoryPoints, setCategoryPoints] = useState<Record<string, number>>({});
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [s, st, rec, red, lb, rules] = await Promise.all([
      getRewardStats(), getRewardStore(), getRecommendedReward(), getMyRedemptions(), getLeaderboard(), getRewardRules(),
    ]);
    setStats(s); setStore(st); setRecommended(rec); setRedemptions(red); setLeaderboard(lb);
    if (rules && rules.categoryPoints) setCategoryPoints(rules.categoryPoints);
  }, []);

  useEffect(() => {
    if (!currentUser) { navigate('/signin'); return; }
    refreshMe();
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentUser) return null;

  const balance = stats?.pointsBalance ?? currentUser.points ?? 0;

  const handleRedeem = async (reward: Reward) => {
    setRedeemingId(reward.id);
    const result = await redeemReward(reward.id);
    setRedeemingId(null);
    if (!result.ok) { toast.error(result.message || 'Could not redeem this reward.'); return; }
    toast.success(
      result.redemption?.voucherCode
        ? `Redeemed! Your code: ${result.redemption.voucherCode}`
        : 'Reward redeemed successfully.'
    );
    await Promise.all([loadAll(), refreshMe()]);
  };

  const statusBadge = (status: Redemption['status']) => {
    if (status === 'fulfilled') return <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full text-xs"><CheckCircle className="w-3 h-3" /> Fulfilled</span>;
    if (status === 'cancelled') return <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-full text-xs"><XCircle className="w-3 h-3" /> Cancelled</span>;
    return <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-full text-xs"><Clock className="w-3 h-3" /> Pending</span>;
  };

  return (
    <div className="min-h-screen bg-luxury-app py-10 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>

        {/* Header */}
        <div className="rounded-3xl overflow-hidden shadow-luxury bg-luxury-navy text-white p-8 mb-8 relative">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-8 h-8 text-luxury-gold" />
            <h1 className="text-3xl font-bold">Rewards Center</h1>
          </div>
          <p className="text-white/70 mb-6">Earn points by reuniting people with their belongings, then redeem them for real rewards.</p>

          {/* Statistics cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Coins, label: 'Points Balance', value: balance },
              { icon: Trophy, label: 'Total Recoveries', value: stats?.totalRecoveries ?? 0 },
              { icon: Award, label: 'Rewards Redeemed', value: stats?.totalRewardsRedeemed ?? 0 },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl bg-white/10 p-5 border border-white/10 card-lift">
                <div className="flex items-center gap-2 text-luxury-gold mb-1"><c.icon className="w-5 h-5" /><span className="text-sm">{c.label}</span></div>
                <p className="text-3xl font-bold">{c.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement progress */}
        {stats && (
          <div className="rounded-3xl bg-white border border-luxury-border p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-luxury-gold" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Current level</p>
                  <p className="text-lg font-bold text-luxury-navy">{stats.level}</p>
                </div>
              </div>
              {stats.nextLevel ? (
                <p className="text-sm text-gray-600"><span className="font-semibold text-luxury-navy">{stats.remainingToNext}</span> points to <span className="font-semibold">{stats.nextLevel}</span></p>
              ) : (
                <span className="inline-flex items-center gap-1 text-luxury-gold text-sm font-semibold"><Star className="w-4 h-4" /> Max level reached</span>
              )}
            </div>
            <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full aurora-gradient transition-all duration-700" style={{ width: `${stats.progressPercent}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Lifetime earned: {stats.lifetimeEarnedPoints} pts · Redeemed: {stats.lifetimeRedeemedPoints} pts</p>
          </div>
        )}

        {/* Recommended reward */}
        {recommended && (
          <div className="rounded-3xl border border-luxury-gold/40 bg-gradient-to-br from-yellow-50 to-white p-6 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-luxury-gold/10 flex items-center justify-center flex-none overflow-hidden">
              {recommended.image ? <img src={recommended.image} alt="" className="w-full h-full object-cover" /> : <Sparkles className="w-8 h-8 text-luxury-gold" />}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-luxury-gold font-semibold mb-1">Recommended for you</p>
              <h3 className="text-lg font-bold text-luxury-navy">{recommended.title}</h3>
              <p className="text-sm text-gray-600">{recommended.requiredPoints} points · {recommended.category}</p>
            </div>
            <button onClick={() => handleRedeem(recommended)} disabled={redeemingId === recommended.id} className="btn-luxury flex-none disabled:opacity-60">
              {redeemingId === recommended.id ? 'Redeeming…' : 'Redeem now'}
            </button>
          </div>
        )}

        {/* How to earn points */}
        <h2 className="text-xl font-bold text-luxury-navy mb-4">How to earn points</h2>
        <p className="text-sm text-gray-600 mb-4">Successfully return a found item to its owner and earn points based on the item category:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {CATEGORY_ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            return (
              <div key={cat} className="rounded-2xl bg-white border border-luxury-border p-4 text-center card-lift">
                <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5 text-luxury-gold" />
                </div>
                <p className="text-sm font-medium text-luxury-navy">{meta.label}</p>
                <p className="text-lg font-bold text-luxury-gold">+{categoryPoints[cat] ?? '—'}</p>
              </div>
            );
          })}
        </div>

        {/* Rewards store */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-luxury-navy">Rewards Store</h2>
          <span className="text-sm text-gray-500">{store.length} reward{store.length !== 1 ? 's' : ''}</span>
        </div>
        {store.length === 0 ? (
          <div className="rounded-2xl bg-white border border-luxury-border p-8 text-center text-gray-500 mb-10">No rewards available yet. Check back soon.</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 mb-10 snap-x">
            {store.map((reward) => {
              const affordable = balance >= reward.requiredPoints;
              const inStock = reward.stock > 0;
              return (
                <div key={reward.id} className="snap-start flex-none w-64 rounded-2xl bg-white border border-luxury-border overflow-hidden shadow-sm card-lift flex flex-col">
                  <div className="h-32 bg-gradient-to-br from-violet-50 to-fuchsia-50 flex items-center justify-center overflow-hidden">
                    {reward.image ? <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" /> : <Ticket className="w-10 h-10 text-luxury-gold/60" />}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-[10px] uppercase tracking-wide text-gray-400">{reward.category}</span>
                    <h3 className="font-semibold text-luxury-navy text-sm line-clamp-1">{reward.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 flex-1 mt-1">{reward.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-luxury-gold font-bold flex items-center gap-1"><Coins className="w-4 h-4" /> {reward.requiredPoints}</span>
                      <span className={`text-xs ${inStock ? 'text-gray-500' : 'text-red-500'}`}>{inStock ? `${reward.stock} left` : 'Out of stock'}</span>
                    </div>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!affordable || !inStock || redeemingId === reward.id}
                      className="mt-3 w-full btn-luxury !py-2 text-sm disabled:opacity-50"
                    >
                      {redeemingId === reward.id ? 'Redeeming…' : !inStock ? 'Out of stock' : !affordable ? 'Not enough points' : 'Redeem'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2 mb-8">
          {/* Leaderboard */}
          <div className="rounded-3xl bg-white border border-luxury-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-luxury-navy mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-luxury-gold" /> Top Helpers This Month</h2>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-gray-500">No recoveries yet this month. Be the first!</p>
            ) : (
              <ul className="space-y-2">
                {leaderboard.map((row) => (
                  <li key={row.userId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${row.rank <= 3 ? 'aurora-gradient text-[#0a0d18]' : 'bg-gray-100 text-gray-600'}`}>{row.rank}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-luxury-navy truncate">{row.name} {currentUser.id === row.userId && <span className="text-xs text-luxury-gold">(you)</span>}</p>
                      <p className="text-xs text-gray-500">{row.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-luxury-navy">{row.recoveries}</p>
                      <p className="text-[10px] text-gray-400">recoveries</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Redemption history */}
          <div className="rounded-3xl bg-white border border-luxury-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-luxury-navy mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-luxury-gold" /> Redemption History</h2>
            {redemptions.length === 0 ? (
              <p className="text-sm text-gray-500">You haven't redeemed any rewards yet.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {redemptions.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-luxury-navy truncate">{r.rewardTitle}</p>
                      <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()} · {r.points} pts{r.voucherCode ? ` · ${r.voucherCode}` : ''}</p>
                    </div>
                    {statusBadge(r.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
