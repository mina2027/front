import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ImageIcon, Tag, Sparkles } from 'lucide-react';
import { ImageSearchResult } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatRelativeTime } from '../utils/dateUtils';
import { similarityTier } from '../utils/imageSearch';

const TONE: Record<string, string> = {
  strong: 'bg-emerald-600 text-white',
  good: 'bg-amber-500 text-white',
  related: 'bg-blue-600 text-white',
};
const RING: Record<string, string> = {
  strong: 'text-emerald-600',
  good: 'text-amber-500',
  related: 'text-blue-600',
};

export function ImageMatchCard({ result }: { result: ImageSearchResult }) {
  const { report } = result;
  const percent = Math.round(result.imageSimilarity * 100);
  const tier = similarityTier(percent);
  const isLost = report.type === 'lost';
  const typeChip = isLost ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100';
  // Conic ring for the similarity percentage.
  const ringStyle = { background: `conic-gradient(currentColor ${percent * 3.6}deg, rgba(148,163,184,0.25) 0deg)` };

  return (
    <Link to={`/report/${report.id}`} className="group block focus:outline-none">
      <div className="card-glass card-lift overflow-hidden h-full flex flex-col">
        {/* Image + similarity overlay */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50">
          {report.imageUrl ? (
            <img src={report.imageUrl} alt={report.title} loading="lazy" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-violet-300">
              <ImageIcon className="w-10 h-10 mb-2" />
              <span className="text-sm font-medium">No photo</span>
            </div>
          )}

          {/* Type ribbon */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest shadow-md backdrop-blur-md ${isLost ? 'bg-white/95 text-rose-700' : 'bg-white/95 text-emerald-700'}`}>
              {isLost ? 'LOST' : 'FOUND'}
            </span>
          </div>

          {/* Similarity ring badge */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className={`relative w-12 h-12 rounded-full ${RING[tier.tone]}`} style={ringStyle} aria-hidden="true">
              <div className="absolute inset-[3px] rounded-full bg-white/95 flex items-center justify-center">
                <span className="text-[11px] font-extrabold text-gray-900">{percent}%</span>
              </div>
            </div>
          </div>

          {/* Tier label */}
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md ${TONE[tier.tone]}`}>
              <Sparkles className="w-3 h-3" /> {tier.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-display font-semibold text-lg text-luxury-navy line-clamp-1">{report.title}</h3>
            <span className={`inline-flex items-center gap-1 shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${typeChip}`}>
              <Tag className="w-3 h-3" />
              {report.category}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{report.description}</p>

          <div className="space-y-1.5">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-cyan-600" />
              <span className="line-clamp-1">{report.location}{report.governorate ? `, ${report.governorate}` : ''}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0 text-violet-500" />
                {formatRelativeTime(report.createdAt)}
              </span>
              <StatusBadge status={report.status} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
