import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/index.js';
import { adminAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { UserPlus, Edit2, Trash2, Power, PowerOff, Users, Briefcase } from 'lucide-react';

/**
 * Admin User Management Page
 * Create and manage Employer and Employee accounts
 * Features:
 * - Create new users with role assignment
 * - Assign employees to employers
 * - Activate/deactivate accounts
 * - Edit user details
 * - Delete users
 */
export const AdminUserManagement = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [users, setUsers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterRole, setFilterRole] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    employerId: '',
    designation: '',
    department: '',
    endClient: '',
    endClientReportingMail: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchEmployers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      const params = filterRole ? { role: filterRole } : {};
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchEmployers = async () => {
    try {
      const response = await adminAPI.getEmployers();
      setEmployers(response.data.employers);
    } catch (error) {
      console.error('Failed to fetch employers');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload - only include employerId for employees
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        designation: formData.designation || undefined,
        department: formData.department || undefined
      };

      // Only add employerId if role is employee
      if (formData.role === 'employee' && formData.employerId) {
        payload.employerId = formData.employerId;
      }

      await adminAPI.createUser(payload);
      toast.success(`${formData.role} account created successfully!`);
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
      if (formData.role === 'employer') {
        fetchEmployers(); // Refresh employers list
      }
    } catch (error) {
      console.error('Create user error:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        End Client
                      </label>
                      <input
                        type="text"
                        value={formData.endClient}
                        onChange={(e) => setFormData({...formData, endClient: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        End Client Reporting Mail
                      </label>
                      <input
                        type="email"
                        value={formData.endClientReportingMail}
                        onChange={(e) => setFormData({...formData, endClientReportingMail: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      />
                    </div>
                  </>
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
      // ...existing code...
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
      if (formData.role === 'employer') {
        fetchEmployers();
      }
    } catch (error) {

      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };
  // ...existing code...

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      employerId: '',
      designation: '',
      department: '',
      endClient: '',
      endClientReportingMail: ''
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-600';
      case 'employer': return 'bg-indigo-600';
      case 'employee': return 'bg-blue-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              User Management
            </h1>
            <p className="text-slate-300">
              Create and manage employer and employee accounts
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <UserPlus size={20} />
            Create User
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-lg mb-6">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFilterRole('')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                filterRole === '' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilterRole('employer')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                filterRole === 'employer' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Employers
            </button>
            <button
              onClick={() => setFilterRole('employee')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                filterRole === 'employee' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Employees
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-white">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-white">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-white">Employer</th>
                  <th className="px-6 py-4 text-center font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-center font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 text-white">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-slate-300">{user.email}</div>
                      {user.designation && (
                        <div className="text-xs text-slate-400">{user.designation}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${getRoleBadgeColor(user.role)} text-white px-3 py-1 rounded-full text-sm font-semibold capitalize`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {user.employerId?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.isActive ? (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'} transition-colors`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <PowerOff size={18} className="text-red-500" />
                          ) : (
                            <Power size={18} className="text-green-500" />
                          )}
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'} transition-colors`}
                            title="Delete user"
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              No users found
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 max-w-2xl w-full my-8`}>
            <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Create New User
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    minLength="6"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value, employerId: ''})}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="employer">Employer</option>
                  </select>
                </div>

                {formData.role === 'employee' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                      Assign to Employer *
                    </label>
                    <select
                      value={formData.employerId}
                      onChange={(e) => setFormData({...formData, employerId: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                      required
                    >
                      <option value="">Select Employer</option>
                      {employers.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
