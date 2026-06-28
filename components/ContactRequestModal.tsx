import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertCircle, Send, ShieldCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ContactRequest, ReportType, VerificationMethod } from '../types';

interface ContactRequestModalProps {
  reportId: string;
  reportTitle: string;
  reportType: ReportType;
  verificationMethod?: VerificationMethod;
  verificationQuestion?: string;
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated?: (request: ContactRequest) => void;
}

export function ContactRequestModal({
  reportId,
  reportTitle,
  reportType,
  verificationMethod,
  verificationQuestion,
  isOpen,
  onClose,
  onRequestCreated,
}: ContactRequestModalProps) {
  const { currentUser, addContactRequest } = useApp();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Proof of ownership is only relevant when claiming an item someone else FOUND.
  const requiresProofOfOwnership = reportType === 'found';
  // A verification answer is required when the FOUND report uses a question-based
  // method. The backend re-validates this regardless of what the client sends.
  const requiresVerificationAnswer =
    reportType === 'found' &&
    (verificationMethod === 'question' || verificationMethod === 'question_and_manual');

  if (!isOpen || !currentUser) return null;

  // Identity gate: only verified users (or admins) may send a contact request.
  // The backend enforces this too (requireVerified on POST /api/contact-requests).
  if (!currentUser.idVerified && currentUser.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button type="button" aria-label="Close" className="absolute inset-0 bg-gray-700/75" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md rounded-lg bg-white text-left shadow-xl">
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Verify your identity</h3>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition"><X className="w-6 h-6" /></button>
          </div>
          <div className="px-6 py-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-amber-600" />
            </div>
            <p className="text-gray-700 mb-5">
              You need a verified identity to send a contact request. Verify your Egyptian National ID
              with a quick selfie first — it only takes a minute.
            </p>
            <button
              type="button"
              onClick={() => { onClose(); navigate('/profile'); }}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Go to Identity Verification
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (!currentUser) return;
    e.preventDefault();
    setIsSubmitting(true);

    const created = await addContactRequest({
      reportId,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterEmail: currentUser.email,
      reason,
      ...(requiresProofOfOwnership ? { additionalDetails } : {}),
      ...(requiresVerificationAnswer ? { verificationAnswer } : {}),
      messages: [
        {
          senderId: currentUser.id,
          senderName: currentUser.name,
          body: reason,
          createdAt: new Date().toISOString(),
        },
      ],
      status: 'pending',
    } as Omit<ContactRequest, 'id' | 'createdAt'> & { verificationAnswer?: string });

    if (!created) {
      // On failure (e.g. incorrect answer) the context shows a toast; keep the
      // modal open so the requester can correct and retry.
      setIsSubmitting(false);
      return;
    }

    setReason('');
    setAdditionalDetails('');
    setVerificationAnswer('');
    setIsSubmitting(false);
    onRequestCreated?.(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <button
        type="button"
        aria-label="Close contact request form"
        className="absolute inset-0 bg-gray-700/75"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white text-left shadow-xl">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Request Contact Information
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Privacy Notice</p>
                    <p>
                      Your contact information will only be shared if the report owner
                      approves your request. Please provide details to help verify your claim.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Requesting contact for: <span className="font-medium">{reportTitle}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conversation starter *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={
                    requiresProofOfOwnership
                      ? 'Write the first message to the finder...'
                      : 'Write the first message for the owner...'
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message becomes the first chat message in your conversation.
                </p>
              </div>

              {requiresVerificationAnswer && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-800">
                    <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Ownership verification required</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Question
                    </label>
                    <p className="text-sm text-gray-900 bg-white border border-gray-200 rounded-md px-3 py-2">
                      {verificationQuestion || 'The finder will verify your answer.'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Answer *
                    </label>
                    <input
                      type="text"
                      value={verificationAnswer}
                      onChange={(e) => setVerificationAnswer(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Answer the verification question"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {verificationMethod === 'question'
                        ? 'A correct answer grants you contact access automatically.'
                        : 'A correct answer is required; the finder will then review your request.'}
                    </p>
                  </div>
                </div>
              )}

              {requiresProofOfOwnership && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proof of Ownership *
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Provide details that only the true owner would know. This information
                    helps the finder verify that you are the rightful owner before
                    returning the item.
                  </p>
                  <textarea
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Example: unique scratches, serial number, items inside the bag, lock code hint, unique stickers, or any information only the real owner would know."
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Request & Open Chat</span>
                  </>
                )}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
