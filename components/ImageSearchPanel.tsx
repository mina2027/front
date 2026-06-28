import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  UploadCloud, Camera, X, ImageIcon, Loader2, AlertCircle, RefreshCw, ScanSearch, SlidersHorizontal,
} from 'lucide-react';
import { ImageMatchCard } from './ImageMatchCard';
import { FilterState } from './FilterSidebar';
import { ImageSearchResult } from '../types';
import {
  searchByImage, validateImageFile, readFileAsDataURL, ALLOWED_IMAGE_TYPES,
} from '../utils/imageSearch';

interface ImageSearchPanelProps {
  query: string;
  filters: FilterState;
}

type Status = 'idle' | 'analyzing' | 'done' | 'error';

export function ImageSearchPanel({ query, filters }: ImageSearchPanelProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const progressTimer = useRef<number | null>(null);

  const [imageData, setImageData] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [corpus, setCorpus] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [threshold, setThreshold] = useState(60);

  useEffect(() => () => { if (progressTimer.current) window.clearInterval(progressTimer.current); }, []);

  const stopProgress = (finalValue: number) => {
    if (progressTimer.current) { window.clearInterval(progressTimer.current); progressTimer.current = null; }
    setProgress(finalValue);
  };

  const runSearch = useCallback(async (dataUrl: string) => {
    setStatus('analyzing');
    setError(null);
    setProgress(8);
    // Simulated progress for feedback (the backend call is a single request).
    progressTimer.current = window.setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(2, Math.round((90 - p) / 6)) : p));
    }, 200);

    const response = await searchByImage({
      image: dataUrl,
      query: query.trim() || undefined,
      category: filters.category !== 'all' ? filters.category : undefined,
      type: filters.type !== 'all' ? filters.type : undefined,
      governorate: filters.governorate || undefined,
      threshold: 0.4,
    });

    if (response.ok) {
      stopProgress(100);
      setResults(response.results);
      setCorpus(response.corpus);
      setStatus('done');
    } else {
      stopProgress(0);
      setError(
        response.status === 503
          ? 'The image analysis service is busy right now. Please retry in a moment.'
          : response.message
      );
      setStatus('error');
    }
  }, [query, filters.category, filters.type, filters.governorate]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) { setError(validationError); setStatus('error'); return; }
    try {
      const dataUrl = await readFileAsDataURL(file);
      setImageData(dataUrl);
      await runSearch(dataUrl);
    } catch {
      setError('Could not read the image file.');
      setStatus('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const reset = () => {
    setImageData(null);
    setResults([]);
    setError(null);
    setStatus('idle');
    setProgress(0);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Smart filtering applied to the ranked results (instant, client-side).
  const displayed = useMemo(() => {
    return results.filter((r) => {
      const rep = r.report;
      if (Math.round(r.imageSimilarity * 100) < threshold) return false;
      if (filters.type !== 'all' && rep.type !== filters.type) return false;
      if (filters.category !== 'all' && rep.category !== filters.category) return false;
      if (filters.status !== 'all' && rep.status !== filters.status) return false;
      if (filters.governorate && rep.governorate !== filters.governorate) return false;
      if (filters.location && !rep.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.dateFrom && new Date(rep.dateLostFound) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(rep.dateLostFound) > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [results, threshold, filters]);

  return (
    <div>
      {/* Upload zone */}
      {!imageData ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
          }`}
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-4">
            <ScanSearch className="w-7 h-7 text-blue-600" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Search by Image</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
            Upload a photo of the item and our AI finds visually-similar lost &amp; found reports. Drag &amp; drop, choose a file, or take a photo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => galleryInputRef.current?.click()} className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              <UploadCloud className="w-5 h-5" /> Upload Image
            </button>
            <button onClick={() => cameraInputRef.current?.click()} className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium sm:hidden">
              <Camera className="w-5 h-5" /> Take Photo
            </button>
            <button onClick={() => cameraInputRef.current?.click()} className="hidden sm:inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium">
              <Camera className="w-5 h-5" /> Use Camera
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-400">JPG, PNG or WEBP · up to 10&nbsp;MB</p>

          {error && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-red-600" role="alert">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5">
          <div className="flex items-start gap-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 flex-none">
              <img src={imageData} alt="Query" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ScanSearch className="w-4 h-4 text-blue-600" /> Image search
                </h3>
                <button onClick={reset} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600">
                  <X className="w-4 h-4" /> New image
                </button>
              </div>

              {/* Analyzing state */}
              {status === 'analyzing' && (
                <div className="mt-3" aria-live="polite">
                  <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing image…
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-200" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-sm text-red-600" role="alert">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                  <button onClick={() => imageData && runSearch(imageData)} className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    <RefreshCw className="w-4 h-4" /> Retry
                  </button>
                </div>
              )}

              {status === 'done' && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Matched against <span className="font-semibold">{corpus}</span> items with photos · showing{' '}
                  <span className="font-semibold">{displayed.length}</span> result{displayed.length !== 1 ? 's' : ''}.
                </p>
              )}
            </div>
          </div>

          {/* Similarity threshold slider */}
          {status === 'done' && results.length > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-700/40 px-4 py-3">
              <SlidersHorizontal className="w-4 h-4 text-gray-500 flex-none" />
              <label htmlFor="sim-threshold" className="text-sm text-gray-600 dark:text-gray-300 flex-none">
                Min similarity
              </label>
              <input
                id="sim-threshold" type="range" min={40} max={95} step={5}
                value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}
                className="flex-1 accent-blue-600"
              />
              <span className="text-sm font-semibold text-gray-900 dark:text-white w-10 text-right">{threshold}%</span>
            </div>
          )}
        </div>
      )}

      <input ref={galleryInputRef} type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

      {/* Results */}
      {status === 'done' && (
        <div className="mt-6">
          {displayed.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No similar items found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {results.length > 0
                  ? 'No matches meet your current filters or similarity threshold. Try lowering the threshold or clearing filters.'
                  : 'We couldn’t find visually-similar reports. Try a clearer photo or a different angle.'}
              </p>
              <button onClick={() => imageData && runSearch(imageData)} className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                <RefreshCw className="w-4 h-4" /> Search again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayed.map((r) => (
                <ImageMatchCard key={r.report.id} result={r} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
