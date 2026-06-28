import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, Bookmark, Trash2, Map as MapIcon, LayoutGrid, ScanSearch, Type } from 'lucide-react';
import { ReportCard } from '../components/ReportCard';
import { ReportsMap } from '../components/ReportsMap';
import { ImageSearchPanel } from '../components/ImageSearchPanel';
import { FilterSidebar, FilterState } from '../components/FilterSidebar';
import { useApp } from '../contexts/AppContext';
import { useDebounce } from '../hooks/useDebounce';
import { distanceKm } from '../constants/egypt';
import { Report, ReportSortOption } from '../types';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: FilterState;
  createdAt: string;
}

export function BrowseReports() {
  const { reports, isLoading, apiError, refreshData } = useApp();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<ReportSortOption>('newest');
  const [searchPoint, setSearchPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('lostandfound_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });
  const [filters, setFilters] = useState<FilterState>({
    type: (searchParams.get('type') as any) || 'all',
    category: 'all',
    status: (searchParams.get('status') as any) || 'all',
    governorate: searchParams.get('governorate') || '',
    location: searchParams.get('location') || '',
    dateFrom: '',
    dateTo: '',
  });

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem('lostandfound_saved_searches');
    return saved ? JSON.parse(saved) : [];
  });
  const [filteredReports, setFilteredReports] = useState<Report[]>(reports);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    // Resolved reports linger on public Browse for 24h after they're resolved, then
    // drop off (they always stay visible in My Reports and to admins). Reports
    // resolved before this field existed (no resolvedAt) are treated as expired.
    const GRACE_MS = 24 * 60 * 60 * 1000;
    let filtered = reports.filter((report) =>
      report.status !== 'resolved'
      || (!!report.resolvedAt && Date.now() - new Date(report.resolvedAt).getTime() <= GRACE_MS));

    // Apply search query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        report =>
          report.title.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query) ||
          report.location.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(report => report.type === filters.type);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(report => report.category === filters.category);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    // Apply governorate filter
    if (filters.governorate) {
      filtered = filtered.filter(report => report.governorate === filters.governorate);
    }

    // Apply location filter
    if (filters.location) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(report =>
        report.location.toLowerCase().includes(location)
      );
    }

    // Apply date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(
        report => new Date(report.dateLostFound) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        report => new Date(report.dateLostFound) <= new Date(filters.dateTo)
      );
    }

    // Apply map proximity filter (pick a point on the map to find nearby reports)
    if (searchPoint) {
      filtered = filtered.filter(
        report =>
          typeof report.lat === 'number' &&
          typeof report.lng === 'number' &&
          distanceKm(searchPoint.lat, searchPoint.lng, report.lat, report.lng) <= radiusKm
      );
    }

    if (searchPoint) {
      // Closest reports first when searching around a point.
      filtered.sort(
        (a, b) =>
          distanceKm(searchPoint.lat, searchPoint.lng, a.lat as number, a.lng as number) -
          distanceKm(searchPoint.lat, searchPoint.lng, b.lat as number, b.lng as number)
      );
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'urgent') {
      filtered.sort((a, b) => {
        const statusWeight = { new: 2, pending: 1, resolved: 0 };
        return statusWeight[b.status] - statusWeight[a.status];
      });
    } else if (sortBy === 'most-relevant' && debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered.sort((a, b) => {
        const score = (report: Report) =>
          Number(report.title.toLowerCase().includes(query)) * 3 +
          Number(report.category.toLowerCase().includes(query)) * 2 +
          Number(report.location.toLowerCase().includes(query));
        return score(b) - score(a);
      });
    }

    setFilteredReports(filtered);
  }, [reports, debouncedSearchQuery, filters, sortBy, searchPoint, radiusKm]);

  useEffect(() => {
    const query = debouncedSearchQuery.trim();
    if (query.length < 3) return;
    setRecentSearches(prev => {
      const next = [query, ...prev.filter(item => item.toLowerCase() !== query.toLowerCase())].slice(0, 5);
      localStorage.setItem('lostandfound_recent_searches', JSON.stringify(next));
      return next;
    });
  }, [debouncedSearchQuery]);

  const resetFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      status: 'all',
      governorate: '',
      location: '',
      dateFrom: '',
      dateTo: '',
    });
    setSearchQuery('');
  };

  const hasSearchCriteria = Boolean(
    debouncedSearchQuery.trim() ||
      filters.type !== 'all' ||
      filters.category !== 'all' ||
      filters.status !== 'all' ||
      filters.governorate ||
      filters.location ||
      filters.dateFrom ||
      filters.dateTo
  );

  const saveCurrentSearch = () => {
    if (!hasSearchCriteria) return;
    const name = window.prompt('Save this search with a label:', `Search ${new Date().toLocaleDateString()}`);
    if (!name) return;
    const nextSaved = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        query: searchQuery,
        filters,
        createdAt: new Date().toISOString(),
      },
      ...savedSearches.filter(item => item.name !== name),
    ].slice(0, 8);
    setSavedSearches(nextSaved);
    localStorage.setItem('lostandfound_saved_searches', JSON.stringify(nextSaved));
  };

  const applySavedSearch = (search: SavedSearch) => {
    setSearchQuery(search.query);
    setFilters(search.filters);
  };

  const deleteSavedSearch = (id: string) => {
    const nextSaved = savedSearches.filter(item => item.id !== id);
    setSavedSearches(nextSaved);
    localStorage.setItem('lostandfound_saved_searches', JSON.stringify(nextSaved));
  };

  const activeFilterCount = [
    filters.type !== 'all',
    filters.category !== 'all',
    filters.status !== 'all',
    Boolean(filters.governorate),
    Boolean(filters.location),
    Boolean(filters.dateFrom),
    Boolean(filters.dateTo),
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Browse Reports</h1>
          {apiError && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm font-medium text-amber-800">{apiError}</p>
              <button onClick={refreshData} className="text-sm font-semibold text-amber-900 hover:text-amber-700">
                Retry
              </button>
            </div>
          )}
          
          {/* Search method toggle: keep the existing text search, add AI image search */}
          <div className="mb-4 inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1">
            <button
              onClick={() => setSearchMode('text')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${searchMode === 'text' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Type className="w-4 h-4" /> Text Search
            </button>
            <button
              onClick={() => setSearchMode('image')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${searchMode === 'image' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <ScanSearch className="w-4 h-4" /> Search by Image
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchMode === 'image' ? 'Add keywords (optional) to refine image search…' : 'Search reports...'}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Filter className="w-5 h-5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-xs inline-flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {showFilters ? <X className="w-4 h-4" /> : null}
            </button>

            {searchMode === 'text' && (
              <>
                <label className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                  <SlidersHorizontal className="w-5 h-5" />
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as ReportSortOption)}
                    className="bg-transparent focus:outline-none"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="most-relevant">Most relevant</option>
                    <option value="urgent">Needs attention</option>
                  </select>
                </label>

                {/* Grid / Map toggle */}
                <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1 px-4 py-3 text-sm ${viewMode === 'grid' ? 'bg-luxury-gold text-white' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <LayoutGrid className="w-4 h-4" /> List
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-1 px-4 py-3 text-sm ${viewMode === 'map' ? 'bg-luxury-gold text-white' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <MapIcon className="w-4 h-4" /> Map
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={saveCurrentSearch}
              disabled={!hasSearchCriteria}
              className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <Bookmark className="w-5 h-5" />
              Save Search
            </button>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
              Clear All
            </button>
          </div>

          {savedSearches.length > 0 && (
            <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-blue-900">Saved Searches</p>
                  <p className="text-xs text-blue-700">Quickly reapply filters and searches you save.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map(search => (
                  <div key={search.id} className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-gray-700 border border-blue-100">
                    <button
                      onClick={() => applySavedSearch(search)}
                      className="font-medium hover:text-blue-700"
                    >
                      {search.name}
                    </button>
                    <button
                      onClick={() => deleteSavedSearch(search.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Delete saved search"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentSearches.length > 0 && !searchQuery && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Recent searches:</span>
              {recentSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => setSearchQuery(item)}
                  className="rounded-full bg-white border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:border-blue-300 hover:text-blue-700 transition"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 animate-slide-in">
              <FilterSidebar filters={filters} onFilterChange={setFilters} onReset={resetFilters} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onReset={resetFilters}
            />
          </div>

          {/* Reports Grid */}
          <div className="lg:col-span-3">
            {searchMode === 'image' ? (
              <ImageSearchPanel query={debouncedSearchQuery} filters={filters} />
            ) : (
            <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Found <span className="font-semibold">{filteredReports.length}</span> report
                {filteredReports.length !== 1 ? 's' : ''}
              </p>
            </div>

            {viewMode === 'map' ? (
              <div>
                {/* Proximity search controls */}
                <div className="mb-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-2">
                      <MapIcon className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-indigo-900">Search by location</p>
                        <p className="text-xs text-indigo-700">
                          Click anywhere on the map to find reports near that point.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-indigo-900">Radius</label>
                      <select
                        value={radiusKm}
                        onChange={(e) => setRadiusKm(Number(e.target.value))}
                        className="rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value={2}>2 km</option>
                        <option value={5}>5 km</option>
                        <option value={10}>10 km</option>
                        <option value={25}>25 km</option>
                        <option value={50}>50 km</option>
                        <option value={100}>100 km</option>
                      </select>
                      {searchPoint && (
                        <button
                          onClick={() => setSearchPoint(null)}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-100"
                        >
                          <X className="w-4 h-4" /> Clear point
                        </button>
                      )}
                    </div>
                  </div>
                  {searchPoint && (
                    <p className="mt-2 text-xs text-indigo-800">
                      Showing <span className="font-semibold">{filteredReports.length}</span> report
                      {filteredReports.length !== 1 ? 's' : ''} within {radiusKm} km of the selected point
                      ({searchPoint.lat.toFixed(4)}, {searchPoint.lng.toFixed(4)}).
                    </p>
                  )}
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> Lost</span>
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Found</span>
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> Search location</span>
                  <span className="text-gray-400">| Click a marker to view details</span>
                </div>
                <ReportsMap
                  reports={filteredReports}
                  searchPoint={searchPoint}
                  radiusKm={radiusKm}
                  onPickPoint={(lat, lng) => setSearchPoint({ lat, lng })}
                />
                {filteredReports.filter(r => typeof r.lat === 'number').length === 0 && (
                  <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    {searchPoint
                      ? 'No geolocated reports found within this radius. Try increasing the radius or clearing the point.'
                      : 'No reports with map coordinates match the current search.'}
                  </p>
                )}
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-80 rounded-lg bg-white animate-pulse" />
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No reports found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredReports.map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
