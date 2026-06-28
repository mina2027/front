import React from 'react';
import { ReportType, ReportCategory, ReportStatus } from '../types';
import { Filter } from 'lucide-react';
import { GOVERNORATES } from '../constants/egypt';

export interface FilterState {
  type: ReportType | 'all';
  category: ReportCategory | 'all';
  status: ReportStatus | 'all';
  governorate: string;
  location: string;
  dateFrom: string;
  dateTo: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function FilterSidebar({ filters, onFilterChange, onReset }: FilterSidebarProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-700" />
          <h2 className="font-semibold text-lg">Filters</h2>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="lost">Lost Items</option>
            <option value="found">Found Items</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
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

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="pending">In Communication</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Governorate Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Governorate
          </label>
          <select
            value={filters.governorate}
            onChange={(e) => updateFilter('governorate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Governorates</option>
            {GOVERNORATES.map(gov => (
              <option key={gov.name} value={gov.name}>
                {gov.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            placeholder="e.g., Cairo, Giza..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="From"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="To"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
