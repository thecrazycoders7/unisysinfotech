import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/index.js';
import { clientLogosApi } from '../../api/endpoints';
import { Plus, Edit2, Trash2, Save, X, CheckCircle, XCircle } from 'lucide-react';

export const ClientLogoManagement = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    logoUrl: '',
    description: '',
    displayOrder: 0,
    isActive: true
  });

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const response = await clientLogosApi.getAllAdmin();
      setLogos(response.data);
    } catch (error) {
      console.error('Error fetching logos:', error);
      alert('Failed to fetch client logos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.industry || !formData.logoUrl) {
      alert('Please fill in all required fields and upload a logo');
      return;
    }
    
    try {
      if (editingId) {
        await clientLogosApi.update(editingId, formData);
        alert('Client logo updated successfully');
      } else {
        await clientLogosApi.create(formData);
        alert('Client logo created successfully');
      }
      resetForm();
      fetchLogos();
    } catch (error) {
      console.error('Error saving logo:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save client logo';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (logo) => {
    setFormData(logo);
    setEditingId(logo._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client logo?')) {
      return;
    }
    try {
      await clientLogosApi.delete(id);
      alert('Client logo deleted successfully');
      fetchLogos();
    } catch (error) {
      console.error('Error deleting logo:', error);
      alert('Failed to delete client logo');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      logoUrl: '',
      description: '',
      // founded, headquarters, trustSignal removed
      displayOrder: 0,
      isActive: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Client Logo Management</h1>
            <p className="text-slate-300">Manage client logos displayed on the website</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
            {showAddForm ? 'Cancel' : 'Add New Logo'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              {editingId ? 'Edit Client Logo' : 'Add New Client Logo'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Industry *</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-slate-200">Logo File (PNG/WEBP) *</label>
                <input
                  type="file"
                  accept="image/png,image/webp,image/jpeg,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Check file size (max 2MB)
                      if (file.size > 2 * 1024 * 1024) {
                        alert('File size must be less than 2MB');
                        e.target.value = '';
                        return;
                      }
                      
                      // Convert to base64
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, logoUrl: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">Accepted formats: PNG, WEBP, JPG (Max 2MB)</p>
                {formData.logoUrl && (
                  <div className="mt-3">
                    <p className="text-sm text-slate-300 mb-2">Preview:</p>
                    <img src={formData.logoUrl} alt="Preview" className="h-20 object-contain bg-white/5 p-3 rounded-lg border border-white/10" />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-slate-200">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-slate-200">Active (shown on homepage)</label>
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 flex items-center gap-2">
                  <Save size={20} />
                  {editingId ? 'Update' : 'Create'} Logo
                </button>
                <button type="button" onClick={resetForm} className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2">
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Logos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <div
              key={logo._id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {logo.isActive ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : (
                    <XCircle size={20} className="text-red-400" />
                  )}
                  <span className="text-xs font-semibold text-white">
                    {logo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(logo)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    title="Edit Logo"
                  >
                    <Edit2 size={18} className="text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(logo._id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    title="Delete Logo"
                  >
                    <Trash2 size={18} className="text-white" />
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-center h-20 bg-white/5 rounded-lg p-2">
                <img
                  src={logo.logoUrl}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/150x60/1e293b/00BCD4?text=${encodeURIComponent(logo.name)}`;
                  }}
                />
              </div>

              <h3 className="text-xl font-bold mb-2 text-white">{logo.name}</h3>
              <p className="text-sm text-blue-400 mb-2">{logo.industry}</p>
              {logo.description && (
                <p className="text-sm mb-2 text-slate-200">
                  {logo.description}
                </p>
              )}
              <p className="text-xs mt-2 text-slate-400">
                Display Order: {logo.displayOrder}
              </p>
            </div>
          ))}
        </div>

        {logos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl mb-4 text-white">No client logos found</p>
            <p className="text-slate-300">Click "Add New Logo" to create your first client logo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientLogoManagement;
