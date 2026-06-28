import React, { useEffect, useRef, useState } from 'react';
import { Send, MessageSquare, PackageCheck, Clock, Award, ShieldCheck, XCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ContactRequest } from '../types';

interface ContactChatProps {
  request: ContactRequest;
  currentUserId: string;
  currentUserName: string;
}

export function ContactChat({ request, currentUserId, currentUserName }: ContactChatProps) {
  const { addContactMessage, refreshContactRequest, reports, confirmDelivery, confirmReceipt } = useApp();
  const [messageBody, setMessageBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [recBusy, setRecBusy] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Recovery workflow — roles are derived from the report type + ownership, and
  // the server re-enforces every permission. The found-side (finder) is the only
  // party ever rewarded; the lost-side is the item's owner.
  const report = reports.find((r) => r.id === request.reportId);
  const rec = request.recovery;
  const isFoundSide = report ? (report.type === 'lost' ? currentUserId === request.requesterId : currentUserId === String(report.ownerId)) : false;
  const isLostSide = report ? (report.type === 'lost' ? currentUserId === String(report.ownerId) : currentUserId === request.requesterId) : false;
  const isParty = isFoundSide || isLostSide;

  const handleDeliver = async () => { setRecBusy(true); await confirmDelivery(request.id); setRecBusy(false); };
  const handleReceive = async (answer: 'yes' | 'no') => { setRecBusy(true); await confirmReceipt(request.id, answer); setRecBusy(false); };

  const sortedMessages = [...(request.messages || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages.length]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshContactRequest(request.id);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [request.id]);

  const handleSend = async () => {
    if (!messageBody.trim()) {
      return;
    }

    setIsSending(true);
    const updated = await addContactMessage(request.id, {
      senderId: currentUserId,
      senderName: currentUserName,
      body: messageBody.trim(),
    });

    if (updated) {
      setMessageBody('');
    }
    setIsSending(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // The recovery panel renders only for the two parties of an APPROVED request.
  const renderRecoveryPanel = () => {
    if (request.status !== 'approved' || !report || !isParty) return null;
    const status = rec?.status || 'none';

    if (status === 'completed') {
      const rewarded = Boolean(rec?.rewardGranted);
      const suffix = rewarded
        ? (isFoundSide ? ' — your reward points have been granted.' : ' — the finder has been rewarded.')
        : '.';
      return (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4 mt-6 flex items-center gap-2 text-emerald-800">
          <Award className="w-5 h-5 flex-none" />
          <span className="text-sm font-medium">✓ Recovery completed{suffix}</span>
        </div>
      );
    }
    if (status === 'reward_rejected') {
      return (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 mt-6 text-sm text-red-700">
          <div className="flex items-center gap-2 font-medium"><XCircle className="w-5 h-5 flex-none" /> Reward was not approved.</div>
          {rec?.rewardRejectedReason ? <p className="mt-1 ml-7 text-xs">{rec.rewardRejectedReason}</p> : null}
        </div>
      );
    }
    if (status === 'pending_admin_reward_review') {
      return (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 mt-6 flex items-center gap-2 text-amber-800">
          <ShieldCheck className="w-5 h-5 flex-none" />
          <span className="text-sm font-medium">✓ Receipt confirmed. Submitted for admin reward review.</span>
        </div>
      );
    }

    // Not yet delivered.
    if (!rec?.finderDelivered) {
      return (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mt-6">
          <p className="text-sm font-medium text-blue-900 mb-2">Item recovery</p>
          {isFoundSide ? (
            <button
              type="button"
              onClick={handleDeliver}
              disabled={recBusy}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              <PackageCheck className="w-4 h-4" /> I Delivered The Item
            </button>
          ) : (
            <p className="text-sm text-blue-800 flex items-center gap-2"><Clock className="w-4 h-4" /> Waiting for the finder to confirm delivery.</p>
          )}
        </div>
      );
    }

    // Delivered, awaiting owner receipt.
    if (isFoundSide) {
      return (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mt-6 flex items-center gap-2 text-blue-800">
          <CheckCircle2 className="w-5 h-5 flex-none" />
          <span className="text-sm font-medium">✓ Waiting for owner confirmation.</span>
        </div>
      );
    }
    // isLostSide → answer the receipt question (re-answerable until a final decision).
    return (
      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mt-6">
        <p className="text-sm font-medium text-blue-900 mb-3">Did you receive your item?</p>
        {rec?.ownerReceived === 'no' && (
          <p className="text-xs text-amber-700 mb-2">You answered "No". You can change your answer below.</p>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={() => handleReceive('yes')} disabled={recBusy}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50">
            Yes
          </button>
          <button type="button" onClick={() => handleReceive('no')} disabled={recBusy}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50">
            No
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
    {renderRecoveryPanel()}
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden mt-6">
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center space-x-2">
        <MessageSquare className="w-5 h-5" />
        <h3 className="font-semibold">Conversation</h3>
      </div>
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {sortedMessages.length === 0 ? (
          <div className="text-sm text-gray-500">No messages yet. Start the conversation.</div>
        ) : (
          sortedMessages.map((message, index) => {
            const isMine = message.senderId === currentUserId;
            return (
              <div
                key={`${message.createdAt}-${index}`}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-3 ${
                    isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div
                    className={`flex flex-col gap-1 mb-1 text-xs sm:flex-row sm:items-center sm:justify-between ${
                      isMine ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    <span>{isMine ? 'You' : message.senderName}</span>
                    <span>{new Date(message.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <textarea
          rows={3}
          value={messageBody}
          onChange={e => setMessageBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !messageBody.trim()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
