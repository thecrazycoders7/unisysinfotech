import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Eye, Trash2, CheckCircle, Clock } from 'lucide-react';
import { contactMessageApi } from '../../api/endpoints.js';

export const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await contactMessageApi.getAll(params);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await contactMessageApi.updateStatus(id, status);
      fetchMessages();
      if (selectedMessage?._id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
      alert('Error updating message status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await contactMessageApi.delete(id);
      fetchMessages();
      if (selectedMessage?._id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'read':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'replied':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'archived':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Contact Messages</h1>
          <p className="text-slate-300">Manage customer inquiries and contact form submissions</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'new', 'read', 'replied', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                filter === status
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-slate-400 mt-4">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg">
          <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No messages found</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                onClick={() => setSelectedMessage(message)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedMessage?._id === message._id
                    ? 'bg-blue-900/30 border-blue-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{message.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                      <Mail className="w-4 h-4" />
                      {message.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                      <Phone className="w-4 h-4" />
                      {message.phone}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(message.status)}`}>
                    {message.status}
                  </span>
                </div>
                <p className="text-slate-300 text-sm line-clamp-2 mb-2">{message.message}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  {formatDate(message.submittedAt)}
                </div>
              </div>
            ))}
          </div>

          {/* Message Detail */}
          {selectedMessage && (
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 sticky top-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Message Details</h2>
                <button
                  onClick={() => handleDelete(selectedMessage._id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Name</label>
                  <p className="text-white font-semibold">{selectedMessage.name}</p>
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-1">Email</label>
                  <a href={`mailto:${selectedMessage.email}`} className="text-blue-400 hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-1">Phone</label>
                  <a href={`tel:${selectedMessage.phone}`} className="text-blue-400 hover:underline">
                    {selectedMessage.phone}
                  </a>
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-1">Message</label>
                  <p className="text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg">
                    {selectedMessage.message}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-1">Submitted At</label>
                  <p className="text-slate-300">{formatDate(selectedMessage.submittedAt)}</p>
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-2">Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {['new', 'read', 'replied', 'archived'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedMessage._id, status)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedMessage.status === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
