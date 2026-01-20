import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Satellite, Wind, Waves, AlertCircle, Calendar, MapPin, Tag, FileText, Image } from 'lucide-react';
import { OilSpillDetection, CopernicusProduct } from '../../types/oilSpill';
import { findSatelliteImagery } from '../../services/copernicus/copernicusAPI';

interface DetectionDetailsModalProps {
  detection: OilSpillDetection | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<OilSpillDetection>) => void;
}

const DetectionDetailsModal: React.FC<DetectionDetailsModalProps> = ({ detection, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<OilSpillDetection>>({});
  const [satelliteImages, setSatelliteImages] = useState<{sar: CopernicusProduct[], optical: CopernicusProduct[]}>({ sar: [], optical: [] });
  const [loadingImages, setLoadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'satellite' | 'news'>('overview');

  useEffect(() => {
    if (detection) {
      setEditedData(detection);
      loadSatelliteImagery();
    }
  }, [detection]);

  const loadSatelliteImagery = async () => {
    if (!detection) return;
    
    setLoadingImages(true);
    try {
      const imagery = await findSatelliteImagery(
        detection.latitude,
        detection.longitude,
        new Date(detection.detected_at)
      );
      setSatelliteImages(imagery);
    } catch (error) {
      console.error('Error loading satellite imagery:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleSave = () => {
    if (detection) {
      onUpdate(detection.id, editedData);
      setIsEditing(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'Low': return 'text-yellow-600 bg-yellow-100';
      case 'Medium': return 'text-orange-600 bg-orange-100';
      case 'High': return 'text-red-600 bg-red-100';
      case 'Critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getResponseStatusColor = (status?: string) => {
    switch (status) {
      case 'Pending': return 'text-gray-600 bg-gray-100';
      case 'Investigating': return 'text-blue-600 bg-blue-100';
      case 'Responding': return 'text-purple-600 bg-purple-100';
      case 'Contained': return 'text-yellow-600 bg-yellow-100';
      case 'Cleaned': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!detection) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[2000]">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Detection Details</h2>
              <p className="text-blue-100">ID: {detection.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('satellite')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'satellite' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Satellite Imagery
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'news' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            News Correlation
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  detection.status === 'Oil spill' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {detection.status}
                </span>
                {editedData.severity && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(editedData.severity)}`}>
                    {editedData.severity} Severity
                  </span>
                )}
                {editedData.response_status && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getResponseStatusColor(editedData.response_status)}`}>
                    {editedData.response_status}
                  </span>
                )}
                {editedData.validation_status && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    editedData.validation_status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {editedData.validation_status}
                  </span>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Latitude:</span> {detection.latitude.toFixed(6)}
                    </div>
                    <div>
                      <span className="text-gray-600">Longitude:</span> {detection.longitude.toFixed(6)}
                    </div>
                    <a
                      href={`https://www.google.com/maps/@${detection.latitude},${detection.longitude},12z`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      View on Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Timing
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Detected:</span> {new Date(detection.detected_at).toLocaleString()}
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span> {new Date(detection.created_at).toLocaleString()}
                    </div>
                    {editedData.updated_at && (
                      <div>
                        <span className="text-gray-600">Updated:</span> {new Date(editedData.updated_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Environmental Conditions */}
              {(editedData.wind_speed_ms || editedData.sea_state) && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    Environmental Conditions
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {editedData.wind_speed_ms && (
                      <div>
                        <span className="text-gray-600">Wind Speed:</span> {editedData.wind_speed_ms} m/s
                      </div>
                    )}
                    {editedData.sea_state && (
                      <div>
                        <span className="text-gray-600">Sea State:</span> {editedData.sea_state}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Editable Fields */}
              {isEditing ? (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select
                      value={editedData.severity || ''}
                      onChange={(e) => setEditedData({...editedData, severity: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Not set</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Response Status</label>
                    <select
                      value={editedData.response_status || ''}
                      onChange={(e) => setEditedData({...editedData, response_status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Responding">Responding</option>
                      <option value="Contained">Contained</option>
                      <option value="Cleaned">Cleaned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validation Status</label>
                    <select
                      value={editedData.validation_status || ''}
                      onChange={(e) => setEditedData({...editedData, validation_status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Unverified">Unverified</option>
                      <option value="Verified">Verified</option>
                      <option value="False Positive">False Positive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area Affected (km²)</label>
                    <input
                      type="number"
                      value={editedData.area_affected_km2 || ''}
                      onChange={(e) => setEditedData({...editedData, area_affected_km2: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={editedData.notes || ''}
                      onChange={(e) => setEditedData({...editedData, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {editedData.area_affected_km2 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Waves className="w-4 h-4" />
                        Impact
                      </h3>
                      <div className="text-sm">
                        <span className="text-gray-600">Area Affected:</span> {editedData.area_affected_km2} km²
                      </div>
                    </div>
                  )}

                  {editedData.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Notes
                      </h3>
                      <p className="text-sm text-gray-700">{editedData.notes}</p>
                    </div>
                  )}
                </>
              )}

              {/* Tags */}
              {editedData.tags && editedData.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {editedData.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'satellite' && (
            <div className="space-y-6">
              {loadingImages ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading satellite imagery...</p>
                </div>
              ) : (
                <>
                  {/* SAR Images */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Satellite className="w-4 h-4" />
                      Sentinel-1 SAR Images
                    </h3>
                    {satelliteImages.sar.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {satelliteImages.sar.map((product) => (
                          <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                              {product.preview_url ? (
                                <img
                                  src={product.preview_url}
                                  alt={product.title}
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    e.currentTarget.src = '';
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Image className="w-12 h-12 text-gray-400" />
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="font-medium truncate">{product.title}</p>
                              <p className="text-gray-600">
                                {new Date(product.acquisition_date).toLocaleDateString()}
                              </p>
                              <div className="flex gap-2">
                                {product.preview_url && (
                                  <a
                                    href={product.preview_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  >
                                    Preview <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                <button
                                  onClick={() => setEditedData({
                                    ...editedData,
                                    sar_image_url: product.preview_url,
                                    copernicus_product_id: product.id
                                  })}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  Use This
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No SAR images found for this location and time period.</p>
                    )}
                  </div>

                  {/* Optical Images */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Sentinel-2 Optical Images
                    </h3>
                    {satelliteImages.optical.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {satelliteImages.optical.map((product) => (
                          <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                              {product.preview_url ? (
                                <img
                                  src={product.preview_url}
                                  alt={product.title}
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    e.currentTarget.src = '';
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Image className="w-12 h-12 text-gray-400" />
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="font-medium truncate">{product.title}</p>
                              <p className="text-gray-600">
                                {new Date(product.acquisition_date).toLocaleDateString()}
                              </p>
                              {product.cloud_coverage !== undefined && (
                                <p className="text-gray-600">
                                  Cloud: {product.cloud_coverage.toFixed(1)}%
                                </p>
                              )}
                              <div className="flex gap-2">
                                {product.preview_url && (
                                  <a
                                    href={product.preview_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  >
                                    Preview <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                <button
                                  onClick={() => setEditedData({
                                    ...editedData,
                                    optical_image_url: product.preview_url
                                  })}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  Use This
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No optical images found for this location and time period.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-4">
              {editedData.news_correlation && editedData.news_correlation.length > 0 ? (
                editedData.news_correlation.map((article, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">{article.title}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Source: {article.source}</p>
                      <p>Published: {new Date(article.published_date).toLocaleDateString()}</p>
                      {article.relevance_score && (
                        <p>Relevance: {(article.relevance_score * 100).toFixed(0)}%</p>
                      )}
                    </div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Read Article <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No related news articles found.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    The NLP system will automatically correlate news articles when available.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between">
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Details
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedData(detection);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionDetailsModal;
