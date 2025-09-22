'use client';

import { useState } from 'react';
import { Waves, MapPin, Calendar, Activity, Search, Filter } from 'lucide-react';

export default function FloatList({ floats, loading, onFloatSelect, selectedFloat }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');

  // Get unique regions for filter
  const regions = [...new Set(floats.map(f => f.ocean_region).filter(r => r))];

  // Filter floats based on search and filters
  const filteredFloats = floats.filter(float => {
    const matchesSearch = float.float_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         float.ocean_region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         float.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || float.status === filterStatus;
    const matchesRegion = filterRegion === 'all' || float.ocean_region === filterRegion;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCoord = (value, suffix) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(num)) return 'N/A';
    return `${num.toFixed(4)}°${suffix}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Waves className="h-5 w-5 text-ocean-600" />
            <span>ARGO Float List</span>
          </h3>
          <div className="text-sm text-gray-500">
            {filteredFloats.length} of {floats.length} floats
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search floats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lost">Lost</option>
          </select>

          {/* Region Filter */}
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          >
            <option value="all">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Float Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFloats.map((float) => (
          <div
            key={float.float_id}
            onClick={() => onFloatSelect && onFloatSelect(float)}
            className={`bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-xl ${
              selectedFloat?.float_id === float.float_id
                ? 'ring-2 ring-ocean-500 bg-ocean-50'
                : 'hover:bg-gray-50'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">
                Float {float.float_id}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(float.status)}`}>
                {float.status}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-ocean-600" />
              <span className="text-sm text-gray-600">
                {formatCoord(float.latitude, 'N')}, {formatCoord(float.longitude, 'E')}
              </span>
            </div>

            {/* Region */}
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Region:</span> {float.ocean_region || 'N/A'}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-ocean-600">{float.total_profiles}</div>
                <div className="text-xs text-gray-500">Profiles</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-argo-600">{float.wmo_id}</div>
                <div className="text-xs text-gray-500">WMO ID</div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3" />
                <span>Deployed: {formatDate(float.deployment_date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-3 w-3" />
                <span>Last Profile: {formatDate(float.last_profile_date)}</span>
              </div>
            </div>

            {/* Institution */}
            {float.institution && (
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium">Institution:</span> {float.institution}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredFloats.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Waves className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No floats found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters to find the floats you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}
