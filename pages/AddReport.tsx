import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { MatchCard } from '../components/MatchCard';
import { MapPicker } from '../components/MapPicker';
import { GOVERNORATES } from '../constants/egypt';
import { MatchResult, ReportType, ReportCategory, Report, VerificationMethod } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

export function AddReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { currentUser, reports, addReport, updateReport, getAIMatches } = useApp();

  const [createdReport, setCreatedReport] = useState<Report | null>(null);
  const [matchingResults, setMatchingResults] = useState<MatchResult[]>([]);
  const prefilledRef = useRef(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
    }
  }, [currentUser, navigate]);

  const [formData, setFormData] = useState({
    type: (searchParams.get('type') as ReportType) || 'lost',
    title: '',
    description: '',
    category: 'other' as ReportCategory,
    location: '',
    governorate: '',
    lat: null as number | null,
    lng: null as number | null,
    dateLostFound: new Date().toISOString().split('T')[0],
    contactMethod: currentUser?.email || '',
    imageUrl: '',
    // Ownership verification (FOUND reports only). Defaults to the recommended mode.
    verificationMethod: 'question_and_manual' as VerificationMethod,
    verificationQuestion: '',
    verificationAnswer: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageError, setImageError] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);

  // In edit mode, pre-fill the form once from the existing report. Ownership is
  // guarded on the client here (and enforced authoritatively by the backend).
  useEffect(() => {
    if (!isEditMode || prefilledRef.current || !currentUser) return;
    const existing = reports.find(r => r.id === id);
    if (!existing) return;
    if (existing.ownerId !== currentUser.id && currentUser.role !== 'admin') {
      navigate(`/report/${id}`);
      return;
    }
    prefilledRef.current = true;
    setFormData({
      type: existing.type,
      title: existing.title,
      description: existing.description,
      category: existing.category,
      location: existing.location,
      governorate: existing.governorate || '',
      lat: existing.lat ?? null,
      lng: existing.lng ?? null,
      dateLostFound: existing.dateLostFound
        ? new Date(existing.dateLostFound).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      contactMethod: existing.contactMethod || '',
      imageUrl: existing.imageUrl || '',
      verificationMethod: (existing.verificationMethod || 'manual') as VerificationMethod,
      verificationQuestion: existing.verificationQuestion || '',
      // The stored answer is secret and never returned — leave blank; only re-hashed
      // if the owner types a new one.
      verificationAnswer: '',
    });
    if (existing.imageUrl) setImagePreview(existing.imageUrl);
  }, [isEditMode, id, reports, currentUser, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageError('');
      if (!file.type.startsWith('image/')) {
        setImageError('Please upload a valid image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size must be 5MB or less.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentUser) {
      setIsSubmitting(false);
      return;
    }

    // Edit mode: update the existing report. `status` is intentionally NOT sent —
    // it is admin-only, and the backend ignores it for non-admins regardless.
    if (isEditMode && id) {
      const updated = await updateReport(id, {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        governorate: formData.governorate,
        lat: formData.lat,
        lng: formData.lng,
        dateLostFound: formData.dateLostFound,
        contactMethod: formData.contactMethod,
        imageUrl: formData.imageUrl,
        verificationMethod: formData.verificationMethod,
        verificationQuestion: formData.verificationQuestion,
        verificationAnswer: formData.verificationAnswer,
      } as Partial<Report> & { verificationAnswer?: string });
      setIsSubmitting(false);
      if (updated) {
        toast.success('Report updated successfully.');
        navigate('/my-reports');
      } else {
        toast.error('Could not update the report. Please try again.');
      }
      return;
    }

    const created = await addReport({
      ...formData,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      status: 'new',
    });

    if (created && 'id' in created) {
      const oppositeMatches = await getAIMatches(created as Report);
      setCreatedReport(created as Report);
      setMatchingResults(oppositeMatches);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/my-reports');
      }, 5000);
    } else {
      setIsSubmitting(false);
      if (created && 'error' in created && created.error === 'MONTHLY_REPORT_LIMIT_REACHED') {
        setShowLimitModal(true);
      }
    }
  };

  const limitModal = (
    <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Monthly Report Limit Reached</DialogTitle>
          <DialogDescription>
            You have reached the maximum report limit for this month.
            <br /><br />
            Deleting reports does not restore your monthly report quota.
            <br /><br />
            Only two reports are allowed per calendar month.
            <br /><br />
            Please wait until next month before creating another report.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={() => setShowLimitModal(false)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            OK
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-3xl w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Report Submitted Successfully!</h2>
              <p className="text-sm text-gray-600">Your report has been posted, and we found potential opposite-type matches.</p>
            </div>
          </div>

          {createdReport ? (
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3 border border-blue-200 text-blue-700">
                <p className="text-sm">
                  Your {createdReport.type === 'lost' ? 'lost' : 'found'} report was added successfully. Below are the top {createdReport.type === 'lost' ? 'found' : 'lost'} matches.
                </p>
              </div>

              {matchingResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Potential matches</h3>
                      <p className="text-sm text-gray-500">Sorted by highest match score first.</p>
                    </div>
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">{matchingResults.length} results</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {matchingResults.map((match) => (
                      <MatchCard key={match.report.id} match={match} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-yellow-800">
                  No strong matches right now, but results will update automatically as new reports are added.
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => navigate('/my-reports')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Open my reports
                </button>
              </div>

              <p className="text-xs text-gray-500 text-right">Redirecting to My Reports in 5 seconds...</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-700">Report submitted, redirecting...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Identity gate: only verified users (or admins) may CREATE a report. Editing an
  // existing report is allowed. The backend enforces this too (requireVerified).
  const needsVerification = !isEditMode && !!currentUser && !currentUser.idVerified && currentUser.role !== 'admin';
  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your identity first</h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              To post a report, you need a verified identity. Verify your Egyptian National ID with a quick
              selfie — it only takes a minute.
            </p>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Go to Identity Verification
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    {limitModal}
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{isEditMode ? 'Edit Report' : 'Add New Report'}</h1>
          <p className="text-gray-600 mb-6">
            Fill in the details below to {isEditMode ? 'update your' : 'create a'} {formData.type} item report.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
                  className={`p-4 border-2 rounded-lg text-center font-medium transition ${
                    formData.type === 'lost'
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  Lost Item
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'found' }))}
                  className={`p-4 border-2 rounded-lg text-center font-medium transition ${
                    formData.type === 'found'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  Found Item
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="phone">Phone</option>
                <option value="wallet">Wallet</option>
                <option value="keys">Keys</option>
                <option value="pet">Pet</option>
                <option value="document">Document</option>
                <option value="bag">Bag</option>
                <option value="jewelry">Jewelry</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title (Short Description) *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Black iPhone 14 Pro"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Provide as many details as possible (color, brand, distinctive features, circumstances of loss/finding, etc.)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-gray-500">
                <span>Tip: include brand, color, unique marks, and the nearest landmark.</span>
                <span>{formData.description.length} characters</span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location ({formData.type === 'lost' ? 'Where Lost' : 'Where Found'}) *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g., Nasr City, City Stars"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Governorate */}
            <div>
              <label htmlFor="governorate" className="block text-sm font-medium text-gray-700 mb-2">
                Governorate *
              </label>
              <select
                id="governorate"
                name="governorate"
                value={formData.governorate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">— Select governorate —</option>
                {GOVERNORATES.map(gov => (
                  <option key={gov.name} value={gov.name}>
                    {gov.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Map Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pin the location on the map ({formData.type === 'lost' ? 'where it was lost' : 'where it was found'})
              </label>
              <MapPicker
                lat={formData.lat}
                lng={formData.lng}
                onChange={(lat, lng, governorate) =>
                  setFormData(prev => ({
                    ...prev,
                    lat,
                    lng,
                    governorate: prev.governorate || governorate,
                  }))
                }
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="dateLostFound" className="block text-sm font-medium text-gray-700 mb-2">
                Date ({formData.type === 'lost' ? 'When Lost' : 'When Found'}) *
              </label>
              <input
                type="date"
                id="dateLostFound"
                name="dateLostFound"
                value={formData.dateLostFound}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo (Optional)
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-contain rounded-lg bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
              {imageError && <p className="mt-2 text-sm text-red-600">{imageError}</p>}
            </div>

            {/* Contact Method */}
            <div>
              <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Method *
              </label>
              <input
                type="text"
                id="contactMethod"
                name="contactMethod"
                value={formData.contactMethod}
                onChange={handleInputChange}
                required
                placeholder="Email or phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Privacy Notice:</span> Your contact information will
                    only be shared with users whose contact request you approve.
                  </p>
                </div>
              </div>
            </div>

            {/* Ownership Verification Method — FOUND reports only */}
            {formData.type === 'found' && (
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ownership Verification Method *
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Choose how people claiming this item must prove ownership before they can contact you.
                </p>
                <div className="space-y-3">
                  {([
                    {
                      value: 'manual',
                      title: 'Manual Review Only',
                      desc: 'You personally review and approve or reject every contact request.',
                    },
                    {
                      value: 'question',
                      title: 'Verification Question Only',
                      desc: 'A correct answer automatically approves the request — no manual review.',
                    },
                    {
                      value: 'question_and_manual',
                      title: 'Verification Question + Manual Review (Recommended)',
                      desc: 'A correct answer is required, but you still decide whether to approve.',
                    },
                  ] as { value: VerificationMethod; title: string; desc: string }[]).map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                        formData.verificationMethod === opt.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="verificationMethod"
                        value={opt.value}
                        checked={formData.verificationMethod === opt.value}
                        onChange={() =>
                          setFormData(prev => ({ ...prev, verificationMethod: opt.value }))
                        }
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-medium text-gray-900">{opt.title}</span>
                        <span className="block text-xs text-gray-500">{opt.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>

                {/* Question + Answer — only for the two question-based methods */}
                {(formData.verificationMethod === 'question' ||
                  formData.verificationMethod === 'question_and_manual') && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="verificationQuestion" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Question *
                      </label>
                      <input
                        type="text"
                        id="verificationQuestion"
                        name="verificationQuestion"
                        value={formData.verificationQuestion}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., What is the lock screen wallpaper? What is engraved on the ring?"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="verificationAnswer" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Answer {isEditMode ? '' : '*'}
                      </label>
                      <input
                        type="text"
                        id="verificationAnswer"
                        name="verificationAnswer"
                        value={formData.verificationAnswer}
                        onChange={handleInputChange}
                        required={!isEditMode}
                        placeholder={isEditMode ? 'Leave blank to keep the current answer' : 'The correct answer only the true owner would know'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Stored securely (hashed). It is never shown to anyone or returned by the app.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>{isEditMode ? 'Save Changes' : 'Submit Report'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
