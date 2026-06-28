import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Ticket, Save, X, BarChart3, Coins, RefreshCw } from 'lucide-react';
import { Reward, Redemption } from '../../types';
import {
  adminGetRewards, adminCreateReward, adminUpdateReward, adminDeleteReward,
  adminGetVouchers, adminAddVouchers, adminGetCategoryPoints, adminSetCategoryPoints,
  adminGetRedemptions, adminGetAnalytics,
} from '../../utils/rewardsApi';

const CATEGORY_ORDER = ['phone', 'wallet', 'keys', 'pet', 'document', 'bag', 'jewelry', 'electronics', 'clothing', 'other'];

const emptyForm = (): Partial<Reward> => ({
  title: '', description: '', image: '', category: 'Voucher', requiredPoints: 500, stock: 0, usesVouchers: false, active: true, displayOrder: 0,
});

export function RewardManagement() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [catPoints, setCatPoints] = useState<Record<string, number>>({});
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [form, setForm] = useState<Partial<Reward> | null>(null);
  const [savingForm, setSavingForm] = useState(false);
  const [voucherFor, setVoucherFor] = useState<string | null>(null);
  const [voucherInfo, setVoucherInfo] = useState<{ total: number; available: number; used: number } | null>(null);
  const [voucherText, setVoucherText] = useState('');

  const reload = useCallback(async () => {
    const [rw, an, cp, rd] = await Promise.all([adminGetRewards(), adminGetAnalytics(), adminGetCategoryPoints(), adminGetRedemptions()]);
    setRewards(rw); setAnalytics(an); setCatPoints(cp); setRedemptions(rd);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const setField = (key: keyof Reward, value: any) => setForm((f) => ({ ...(f || {}), [key]: value }));

  const saveForm = async () => {
    if (!form || !form.title) { toast.error('Title is required.'); return; }
    setSavingForm(true);
    const res = form.id ? await adminUpdateReward(form.id, form) : await adminCreateReward(form);
    setSavingForm(false);
    if (!res.ok) { toast.error(res.message || 'Could not save reward.'); return; }
    toast.success(form.id ? 'Reward updated.' : 'Reward created.');
    setForm(null);
    reload();
  };

  const removeReward = async (r: Reward) => {
    if (!window.confirm(`Delete "${r.title}"? This also removes its voucher codes.`)) return;
    const res = await adminDeleteReward(r.id);
    if (res.ok) { toast.success('Reward deleted.'); reload(); } else toast.error('Could not delete reward.');
  };

  const toggleActive = async (r: Reward) => {
    const res = await adminUpdateReward(r.id, { active: !r.active });
    if (res.ok) reload(); else toast.error('Could not update reward.');
  };

  const openVouchers = async (rewardId: string) => {
    setVoucherFor(rewardId); setVoucherText('');
    const info = await adminGetVouchers(rewardId);
    setVoucherInfo({ total: info.total, available: info.available, used: info.used });
  };

  const addVouchers = async () => {
    if (!voucherFor || !voucherText.trim()) return;
    const res = await adminAddVouchers(voucherFor, voucherText);
    if (res.ok && res.data) {
      toast.success(`Added ${res.data.added} code(s)${res.data.skipped ? `, ${res.data.skipped} duplicate(s) skipped` : ''}.`);
      setVoucherText('');
      const info = await adminGetVouchers(voucherFor);
      setVoucherInfo({ total: info.total, available: info.available, used: info.used });
      reload(); // stock changed
    } else toast.error('Could not add codes.');
  };

  const saveCatPoints = async () => {
    const updated = await adminSetCategoryPoints(catPoints);
    setCatPoints(updated);
    toast.success('Category points saved.');
  };

  return (
    <div className="space-y-8">
      {/* Analytics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-600" /> Analytics</h3>
        {analytics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Rewards Redeemed', analytics.totalRewardsRedeemed],
              ['Points Awarded', analytics.totalPointsAwarded],
              ['Points Redeemed', analytics.totalPointsRedeemed],
              ['Available Stock', analytics.availableStock],
              ['Active Rewards', analytics.activeRewards],
              ['Inactive Rewards', analytics.inactiveRewards],
              ['Voucher Codes Used', analytics.usedVoucherCodes],
              ['Voucher Codes Left', analytics.availableVoucherCodes],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value as number}</p>
              </div>
            ))}
            {analytics.mostRedeemedReward && (
              <div className="rounded-lg border border-gray-200 p-4 col-span-2">
                <p className="text-xs text-gray-500">Most Redeemed</p>
                <p className="text-sm font-bold text-gray-900">{analytics.mostRedeemedReward.title} ({analytics.mostRedeemedReward.count})</p>
              </div>
            )}
          </div>
        ) : <p className="text-sm text-gray-500">Loading…</p>}
      </div>

      {/* Category points */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><Coins className="w-5 h-5 text-purple-600" /> Category Reward Points</h3>
        <p className="text-sm text-gray-500 mb-3">Points awarded to the finder when a recovery of each category is approved.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORY_ORDER.map((cat) => (
            <div key={cat}>
              <label className="block text-xs font-medium text-gray-600 capitalize mb-1">{cat}</label>
              <input type="number" min={0} value={catPoints[cat] ?? 0}
                onChange={(e) => setCatPoints((p) => ({ ...p, [cat]: Math.max(0, Math.floor(Number(e.target.value)) || 0) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          ))}
        </div>
        <button onClick={saveCatPoints} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"><Save className="w-4 h-4" /> Save points</button>
      </div>

      {/* Rewards CRUD */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Ticket className="w-5 h-5 text-purple-600" /> Rewards Store</h3>
          <button onClick={() => setForm(emptyForm())} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"><Plus className="w-4 h-4" /> New reward</button>
        </div>

        {/* Create / edit form */}
        {form && (
          <div className="border border-purple-200 bg-purple-50/40 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{form.id ? 'Edit reward' : 'New reward'}</h4>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={form.title || ''} onChange={(e) => setField('title', e.target.value)} placeholder="Title" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <input value={form.category || ''} onChange={(e) => setField('category', e.target.value)} placeholder="Category (Recharge / Voucher / Gift Card)" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <input value={form.image || ''} onChange={(e) => setField('image', e.target.value)} placeholder="Image URL" className="px-3 py-2 border border-gray-300 rounded-md text-sm sm:col-span-2" />
              <textarea value={form.description || ''} onChange={(e) => setField('description', e.target.value)} placeholder="Description" rows={2} className="px-3 py-2 border border-gray-300 rounded-md text-sm sm:col-span-2 resize-none" />
              <label className="text-sm text-gray-600">Required points
                <input type="number" min={0} value={form.requiredPoints ?? 0} onChange={(e) => setField('requiredPoints', Math.max(0, Math.floor(Number(e.target.value)) || 0))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </label>
              <label className="text-sm text-gray-600">Stock
                <input type="number" min={0} value={form.stock ?? 0} onChange={(e) => setField('stock', Math.max(0, Math.floor(Number(e.target.value)) || 0))} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </label>
              <label className="text-sm text-gray-600">Display order
                <input type="number" value={form.displayOrder ?? 0} onChange={(e) => setField('displayOrder', Math.floor(Number(e.target.value)) || 0)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </label>
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!form.usesVouchers} onChange={(e) => setField('usesVouchers', e.target.checked)} /> Uses voucher codes</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.active !== false} onChange={(e) => setField('active', e.target.checked)} /> Active</label>
              </div>
            </div>
            <button onClick={saveForm} disabled={savingForm} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"><Save className="w-4 h-4" /> {savingForm ? 'Saving…' : 'Save reward'}</button>
          </div>
        )}

        <div className="space-y-2">
          {rewards.length === 0 && <p className="text-sm text-gray-500">No rewards yet.</p>}
          {rewards.map((r) => (
            <div key={r.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{r.title} <span className="text-xs text-gray-400">· {r.category}</span></p>
                  <p className="text-xs text-gray-500">{r.requiredPoints} pts · stock {r.stock} · order {r.displayOrder}{r.usesVouchers ? ' · voucher' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(r)} className={`px-2 py-1 text-xs rounded-full ${r.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{r.active ? 'Active' : 'Inactive'}</button>
                  {r.usesVouchers && <button onClick={() => openVouchers(r.id)} className="text-purple-600 hover:text-purple-800" title="Vouchers"><Ticket className="w-4 h-4" /></button>}
                  <button onClick={() => setForm({ ...r })} className="text-blue-600 hover:text-blue-800" title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => removeReward(r)} className="text-red-600 hover:text-red-800" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {voucherFor === r.id && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Vouchers — total <b>{voucherInfo?.total ?? 0}</b>, available <b className="text-green-700">{voucherInfo?.available ?? 0}</b>, used <b className="text-gray-700">{voucherInfo?.used ?? 0}</b>
                    <button onClick={() => openVouchers(r.id)} className="ml-2 text-purple-600 inline-flex items-center gap-1 text-xs"><RefreshCw className="w-3 h-3" /> refresh</button>
                  </p>
                  <textarea value={voucherText} onChange={(e) => setVoucherText(e.target.value)} rows={3} placeholder="Paste codes (one per line or comma-separated)…" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={addVouchers} className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">Add codes</button>
                    <button onClick={() => setVoucherFor(null)} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">Close</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Redemptions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Redemption History</h3>
        {redemptions.length === 0 ? <p className="text-sm text-gray-500">No redemptions yet.</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="text-gray-500 text-left border-b"><th className="py-2 px-3">Date</th><th className="py-2 px-3">User</th><th className="py-2 px-3">Reward</th><th className="py-2 px-3">Points</th><th className="py-2 px-3">Voucher</th><th className="py-2 px-3">Status</th></tr></thead>
              <tbody>
                {redemptions.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 px-3 text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-3">{r.userName || r.userId}</td>
                    <td className="py-2 px-3">{r.rewardTitle}</td>
                    <td className="py-2 px-3 font-medium">{r.points}</td>
                    <td className="py-2 px-3 font-mono text-xs">{r.voucherCode || '—'}</td>
                    <td className="py-2 px-3 capitalize">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
