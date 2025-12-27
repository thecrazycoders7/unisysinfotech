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
    // founded, headquarters, trustSignal removed
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
      alert('Failed to save client logo');
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
    <div className={`min-h-screen p-6 ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Client Logo Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
            {showAddForm ? 'Cancel' : 'Add New Logo'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className={`p-6 rounded-lg mb-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Client Logo' : 'Add New Client Logo'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Industry *</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Logo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData((prev) => ({ ...prev, logoUrl: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className={`w-full px-3 py-2 rounded border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
                />
                {formData.logoUrl && (
                  <img src={formData.logoUrl} alt="Preview" className="mt-2 h-16 object-contain" />
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className={`w-full px-3 py-2 rounded border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
                />
              </div>

              {/* founded, headquarters, trustSignal fields removed */}

              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
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
                <label className="text-sm font-medium">Active (shown on homepage)</label>
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save size={20} />
                  {editingId ? 'Update' : 'Create'} Logo
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary flex items-center gap-2">
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
              className={`p-6 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-all`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {logo.isActive ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <XCircle size={20} className="text-red-500" />
                  )}
                  <span className="text-xs font-semibold">
                    {logo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(logo)}
                    className="p-2 rounded hover:bg-slate-700 transition-colors"
                  >
                    <Edit2 size={18} className="text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(logo._id)}
                    className="p-2 rounded hover:bg-slate-700 transition-colors"
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-center h-20 bg-slate-700/30 rounded-lg p-2">
                <img
                  src={logo.logoUrl}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/150x60/1e293b/00BCD4?text=${encodeURIComponent(logo.name)}`;
                  }}
                />
              </div>

              <h3 className="text-xl font-bold mb-2">{logo.name}</h3>
              <p className="text-sm text-accent mb-2">{logo.industry}</p>
              {logo.description && (
                <p className={`text-sm mb-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  {logo.description}
                </p>
              )}
              {/* founded, headquarters, trustSignal display removed */}
              <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Display Order: {logo.displayOrder}
              </p>
            </div>
          ))}
        </div>

        {logos.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            <p className="text-xl mb-4">No client logos found</p>
            <p>Click "Add New Logo" to create your first client logo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientLogoManagement;
