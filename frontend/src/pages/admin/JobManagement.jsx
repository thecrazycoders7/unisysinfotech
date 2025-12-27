import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/index.js';
import { jobsApi } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Eye, Users, X } from 'lucide-react';

export const JobManagement = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJobApplications, setSelectedJobApplications] = useState([]);
  
  const [formData, setFormData] = useState({
    jobCode: '',
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    description: '',
    responsibilities: [''],
    expectedSkills: [''],
    qualifications: [''],
    technicalStack: [''],
    skills: [''],
    yearsOfExperience: '',
    experience: '',
    salary: '',
    additionalInfo: '',
    isActive: true,
    displayOrder: 0
  });

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAllAdmin();
      setJobs(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await jobsApi.getAllApplications();
      setApplications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch applications');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty strings from arrays
    const cleanedData = {
      ...formData,
      responsibilities: formData.responsibilities.filter(item => item.trim()),
      expectedSkills: formData.expectedSkills.filter(item => item.trim()),
      qualifications: formData.qualifications.filter(item => item.trim()),
      technicalStack: formData.technicalStack.filter(item => item.trim()),
      skills: formData.skills.filter(item => item.trim())
    };

    try {
      if (editingJob) {
        await jobsApi.update(editingJob._id, cleanedData);
        toast.success('Job updated successfully');
      } else {
        await jobsApi.create(cleanedData);
        toast.success('Job created successfully');
      }
      fetchJobs();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      jobCode: job.jobCode || '',
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      responsibilities: job.responsibilities,
      expectedSkills: job.expectedSkills || [],
      qualifications: job.qualifications,
      technicalStack: job.technicalStack || [],
      skills: job.skills,
      yearsOfExperience: job.yearsOfExperience || '',
      experience: job.experience || '',
      salary: job.salary || '',
      additionalInfo: job.additionalInfo || '',
      isActive: job.isActive,
      displayOrder: job.displayOrder
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsApi.delete(id);
        toast.success('Job deleted successfully');
        fetchJobs();
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  const viewApplications = async (job) => {
    try {
      const response = await jobsApi.getApplications(job._id);
      setSelectedJobApplications(response.data.data);
      setShowApplicationsModal(true);
    } catch (error) {
      toast.error('Failed to fetch applications');
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await jobsApi.updateApplicationStatus(applicationId, newStatus);
      toast.success('Application status updated');
      // Refresh the applications for this job
      const job = jobs.find(j => j._id === selectedJobApplications[0]?.jobId);
      if (job) {
        viewApplications(job);
      }
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingJob(null);
    setFormData({
      jobCode: '',
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      description: '',
      responsibilities: [''],
      expectedSkills: [''],
      qualifications: [''],
      technicalStack: [''],
      skills: [''],
      yearsOfExperience: '',
      experience: '',
      salary: '',
      additionalInfo: '',
      isActive: true,
      displayOrder: 0
    });
  };

  const getApplicationCount = (jobId) => {
    return applications.filter(app => app.jobId?._id === jobId).length;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'} flex items-center justify-center`}>
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Job Management</h1>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Manage job postings and view applications
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg"
          >
            <Plus size={20} />
            Add New Job
          </button>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{job.title}</h3>
                    {job.jobCode && (
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {job.jobCode}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      job.isActive 
                        ? 'bg-green-500/20 text-green-600' 
                        : 'bg-red-500/20 text-red-600'
                    }`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className={`flex flex-wrap gap-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span>📍 {job.location}</span>
                    <span>💼 {job.department}</span>
                    <span>⏰ {job.type}</span>
                    <span>📊 {job.yearsOfExperience ? `${job.yearsOfExperience} years` : job.experience}</span>
                    <span>📅 Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => viewApplications(job)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white relative`}
                    title="View Applications"
                  >
                    <Users size={18} />
                    {getApplicationCount(job._id) > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getApplicationCount(job._id)}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(job)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-slate-700 hover:bg-slate-600' 
                        : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {job.description.substring(0, 200)}...
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.slice(0, 5).map((skill, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isDark 
                        ? 'bg-slate-700 text-slate-300' 
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 5 && (
                  <span className={`px-3 py-1 rounded-full text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    +{job.skills.length - 5} more
                  </span>
                )}
              </div>

              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Experience: {job.experience} | {job.salary && `Salary: ${job.salary}`}
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <p className="text-xl">No jobs posted yet. Click "Add New Job" to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingJob ? 'Edit Job' : 'Add New Job'}</h2>
              <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingJob && formData.jobCode && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Job Code</label>
                      <input
                        type="text"
                        value={formData.jobCode}
                        disabled
                        className={`w-full px-4 py-2 rounded-lg border font-mono ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-slate-400' 
                            : 'bg-slate-100 border-slate-300 text-slate-500'
                        } cursor-not-allowed`}
                      />
                    </div>
                  )}
                  
                  <div className={editingJob && formData.jobCode ? '' : 'md:col-span-2'}>
                    <label className="block text-sm font-medium mb-2">Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Senior Full Stack Developer"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Engineering"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Remote, New York, Hybrid"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Job Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Posting Date *</label>
                    <input
                      type="date"
                      name="postedDate"
                      value={formData.postedDate ? formData.postedDate.substring(0, 10) : ''}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate ? formData.endDate.substring(0, 10) : ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Years of Experience {formData.type !== 'Internship' && '*'}
                    </label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      required={formData.type !== 'Internship'}
                      min="0"
                      step="0.5"
                      placeholder="e.g., 3"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formData.type === 'Internship' ? 'Optional for internships' : 'Enter total years of experience'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Salary Range</label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="e.g., $80,000 - $120,000"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Display Order</label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-indigo-600"
                      />
                      <span className="text-sm font-medium">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Job Description</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Overview *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    placeholder="Brief overview of the position..."
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                  />
                </div>
              </div>

              {/* Responsibilities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Responsibilities *</h3>
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                      placeholder="Describe a key responsibility..."
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    />
                    {formData.responsibilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('responsibilities', index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('responsibilities')}
                  className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
                >
                  + Add Responsibility
                </button>
              </div>

              {/* Expected Skills / Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Expected Skills / Experience *</h3>
                {formData.expectedSkills.map((skill, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('expectedSkills', index, e.target.value)}
                      placeholder="e.g., 3+ years of React development"
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    />
                    {formData.expectedSkills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('expectedSkills', index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('expectedSkills')}
                  className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
                >
                  + Add Expected Skill
                </button>
              </div>

              {/* Qualifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Qualifications *</h3>
                {formData.qualifications.map((qual, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={qual}
                      onChange={(e) => handleArrayChange('qualifications', index, e.target.value)}
                      placeholder="e.g., Bachelor's degree in Computer Science or equivalent"
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    />
                    {formData.qualifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('qualifications', index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('qualifications')}
                  className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
                >
                  + Add Qualification
                </button>
              </div>

              {/* Technical Stack */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Technical Stack / Tools *</h3>
                {formData.technicalStack.map((tech, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) => handleArrayChange('technicalStack', index, e.target.value)}
                      placeholder="e.g., React, Node.js, PostgreSQL"
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    />
                    {formData.technicalStack.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('technicalStack', index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('technicalStack')}
                  className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
                >
                  + Add Technology/Tool
                </button>
              </div>

              {/* Skills (for display/filtering) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Key Skills (Tags) *</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Short skill tags for filtering and display
                </p>
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                      placeholder="e.g., React, JavaScript, AWS"
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300'
                      } focus:outline-none focus:border-indigo-600`}
                    />
                    {formData.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('skills', index)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('skills')}
                  className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
                >
                  + Add Skill
                </button>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Info / Notes</label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any additional information about the role, benefits, work environment, etc..."
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300'
                    } focus:outline-none focus:border-indigo-600`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Predicted Feedback</label>
                  <textarea
                    name="predictedFeedback"
                    value={formData.predictedFeedback || ''}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Predicted feedback for this job posting..."
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  {editingJob ? 'Update Job' : 'Create Job'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    isDark 
                      ? 'bg-slate-700 hover:bg-slate-600' 
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Applications ({selectedJobApplications.length})</h2>
              <button onClick={() => setShowApplicationsModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}>
                <X size={24} />
              </button>
            </div>

            {selectedJobApplications.length === 0 ? (
              <div className="text-center py-12">
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>No applications received yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedJobApplications.map((app) => (
                  <div key={app._id} className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'} rounded-lg p-4`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold">{app.fullName}</h3>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{app.email} | {app.phone}</p>
                      </div>
                      <select
                        value={app.status}
                        onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                        className={`px-3 py-1 rounded-lg border text-sm font-semibold ${
                          isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="offered">Offered</option>
                        <option value="rejected">Rejected</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    </div>
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <div><strong>Location:</strong> {app.currentLocation}</div>
                      <div><strong>Experience:</strong> {app.experience}</div>
                      <div><strong>Notice:</strong> {app.noticePeriod}</div>
                      <div><strong>Applied:</strong> {new Date(app.appliedDate).toLocaleDateString()}</div>
                    </div>
                    {app.currentCompany && (
                      <div className={`text-sm mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        <strong>Current:</strong> {app.currentRole} at {app.currentCompany}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
