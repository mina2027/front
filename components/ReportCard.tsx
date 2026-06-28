import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ImageIcon, Tag } from 'lucide-react';
import { Report } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatRelativeTime } from '../utils/dateUtils';

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const isLost = report.type === 'lost';
  const typeLabel = isLost ? 'LOST' : 'FOUND';
  const typeChip = isLost
    ? 'text-rose-700 bg-rose-50 border-rose-100'
    : 'text-emerald-700 bg-emerald-50 border-emerald-100';

  return (
    <Link to={`/report/${report.id}`} className="group block focus:outline-none">
      <div className="card-glass card-lift overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50">
          {report.imageUrl ? (
            <img
              src={report.imageUrl}
              alt={report.title}
              loading="lazy"
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-violet-300">
              <ImageIcon className="w-10 h-10 mb-2" />
              <span className="text-sm font-medium">No photo yet</span>
            </div>
          )}

          {/* Type ribbon */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest shadow-md backdrop-blur-md ${
                isLost ? 'bg-white/95 text-rose-700' : 'bg-white/95 text-emerald-700'
              }`}
            >
              {typeLabel}
            </span>
          </div>

          {/* Status pill */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={report.status} />
          </div>

          {/* Bottom gradient veil for legibility */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-display font-semibold text-lg text-luxury-navy line-clamp-1">
              {report.title}
            </h3>
            <span
              className={`inline-flex items-center gap-1 shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${typeChip}`}
            >
              <Tag className="w-3 h-3" />
              {report.category}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
            {report.description}
          </p>

          <div className="space-y-1.5">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-cyan-600" />
              <span className="line-clamp-1">{report.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0 text-violet-500" />
              <span>{formatRelativeTime(report.createdAt)}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-violet-100/70">
            <p className="text-xs text-gray-500">
              Posted by{' '}
              <span className="font-medium text-luxury-navy">{report.ownerName}</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
