import React from 'react';
import { useThemeStore } from '../../store/index.js';
import { clientAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export const ClientManagement = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [clients, setClients] = React.useState([]);
  const [activeClients, setActiveClients] = React.useState([]);
  const [inactiveClients, setInactiveClients] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    industry: '',
    contactPerson: '',
    phone: '',
    address: '',
    technology: '',
    onboardingDate: '',
    offboardingDate: '',
    status: 'active'
  });

  React.useEffect(() => {
    fetchClients();
  }, [search, page]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await clientAPI.getAll({ search, page, limit: 10 });
      setClients(response.data.clients);
      setActiveClients(response.data.clients.filter(c => c.status === 'active'));
      setInactiveClients(response.data.clients.filter(c => c.status === 'inactive'));
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await clientAPI.update(editingId, formData);
        toast.success('Client updated successfully');
      } else {
        await clientAPI.create(formData);
        toast.success('Client created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', email: '', industry: '', contactPerson: '', phone: '', address: '', technology: '', onboardingDate: '', offboardingDate: '', status: 'active' });
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setFormData(client);
    setEditingId(client._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientAPI.delete(id);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  return (
    <div className={isDark ? 'bg-gray-950' : 'bg-gray-50'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Client Management</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', email: '', industry: '', contactPerson: '', phone: '', address: '', technology: '', onboardingDate: '', offboardingDate: '', status: 'active' });
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> Add Client
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search clients..."
              className={isDark ? 'input-field-dark pl-10' : 'input-field pl-10'}
            />
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className={`${isDark ? 'card-dark' : 'card'} p-6 mb-8`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Client Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={isDark ? 'input-field-dark' : 'input-field'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={isDark ? 'input-field-dark' : 'input-field'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Industry *</label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className={isDark ? 'input-field-dark' : 'input-field'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Person *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className={isDark ? 'input-field-dark' : 'input-field'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={isDark ? 'input-field-dark' : 'input-field'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={isDark ? 'input-field-dark' : 'input-field'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Technology</label>
                  <input
                    type="text"
                    name="technology"
                    value={formData.technology}
                    onChange={handleChange}
                    className={isDark ? 'input-field-dark' : 'input-field'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Onboarding Date</label>
                  <input
                    type="date"
                    name="onboardingDate"
                    value={formData.onboardingDate ? formData.onboardingDate.substring(0, 10) : ''}
                    onChange={handleChange}
                    className={isDark ? 'input-field-dark' : 'input-field'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Offboarding Date</label>
                  <input
                    type="date"
                    name="offboardingDate"
                    value={formData.offboardingDate ? formData.offboardingDate.substring(0, 10) : ''}
                    onChange={handleChange}
                    className={isDark ? 'input-field-dark' : 'input-field'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={isDark ? 'input-field-dark' : 'input-field'}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  {editingId ? 'Update Client' : 'Create Client'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clients Table */}
        <div className={`${isDark ? 'card-dark' : 'card'} p-6`}>
          {loading ? (
            <p className="text-center py-8">Loading...</p>
          ) : clients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Industry</th>
                    <th className="text-left p-4 font-semibold">Contact Person</th>
                    <th className="text-left p-4 font-semibold">Technology</th>
                    <th className="text-left p-4 font-semibold">Onboarding</th>
                    <th className="text-left p-4 font-semibold">Offboarding</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client._id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <td className="p-4 font-medium">{client.name}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{client.email}</td>
                      <td className="p-4">{client.industry}</td>
                      <td className="p-4">{client.contactPerson}</td>
                      <td className="p-4">{client.technology || '-'}</td>
                      <td className="p-4">{client.onboardingDate ? new Date(client.onboardingDate).toLocaleDateString() : '-'}</td>
                      <td className="p-4">{client.offboardingDate ? new Date(client.offboardingDate).toLocaleDateString() : '-'}</td>
                      <td className="p-4">
                        <button
                          onClick={async () => {
                            await clientAPI.update(client._id, { status: client.status === 'active' ? 'inactive' : 'active' });
                            fetchClients();
                          }}
                          className={`px-3 py-1 rounded text-xs font-semibold ${client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {client.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client._id)}
                          className="p-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No clients found</p>
          )}
        </div>

        {/* Active Clients Table */}
        <div className={`${isDark ? 'card-dark' : 'card'} p-6 mt-10`}>
          <h2 className="text-2xl font-bold mb-4 text-green-700">Active Clients</h2>
          {activeClients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Industry</th>
                    <th className="text-left p-4 font-semibold">Contact Person</th>
                    <th className="text-left p-4 font-semibold">Technology</th>
                    <th className="text-left p-4 font-semibold">Onboarding</th>
                    <th className="text-left p-4 font-semibold">Offboarding</th>
                  </tr>
                </thead>
                <tbody>
                  {activeClients.map((client) => (
                    <tr key={client._id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <td className="p-4 font-medium">{client.name}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{client.email}</td>
                      <td className="p-4">{client.industry}</td>
                      <td className="p-4">{client.contactPerson}</td>
                      <td className="p-4">{client.technology || '-'}</td>
                      <td className="p-4">{client.onboardingDate ? new Date(client.onboardingDate).toLocaleDateString() : '-'}</td>
                      <td className="p-4">{client.offboardingDate ? new Date(client.offboardingDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">No active clients</p>
          )}
        </div>

        {/* Inactive Clients Table */}
        <div className={`${isDark ? 'card-dark' : 'card'} p-6 mt-6`}>
          <h2 className="text-2xl font-bold mb-4 text-red-700">Inactive Clients</h2>
          {inactiveClients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Industry</th>
                    <th className="text-left p-4 font-semibold">Contact Person</th>
                    <th className="text-left p-4 font-semibold">Technology</th>
                    <th className="text-left p-4 font-semibold">Onboarding</th>
                    <th className="text-left p-4 font-semibold">Offboarding</th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveClients.map((client) => (
                    <tr key={client._id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <td className="p-4 font-medium">{client.name}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{client.email}</td>
                      <td className="p-4">{client.industry}</td>
                      <td className="p-4">{client.contactPerson}</td>
                      <td className="p-4">{client.technology || '-'}</td>
                      <td className="p-4">{client.onboardingDate ? new Date(client.onboardingDate).toLocaleDateString() : '-'}</td>
                      <td className="p-4">{client.offboardingDate ? new Date(client.offboardingDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">No inactive clients</p>
          )}
        </div>
      </div>
    </div>
  );
};
