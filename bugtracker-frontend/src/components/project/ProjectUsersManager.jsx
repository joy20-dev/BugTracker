import React, { useState, useEffect } from 'react';
import { usersApi, projectsApi } from '../../api';

const ProjectUsersManager = ({ projectId, isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadProjectUsers();
    }
  }, [isOpen, projectId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await usersApi.getAll();
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectUsers = async () => {
    try {
      const projectData = await projectsApi.getById(projectId);
      setProjectUsers(projectData.users || []);
    } catch (err) {
      console.error('Error loading project users:', err);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await projectsApi.assignUser(projectId, parseInt(selectedUserId));
      setSuccess('User assigned to project successfully');
      setSelectedUserId('');
      await loadProjectUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign user to project');
      console.error('Error assigning user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get available users (not already in project)
  const availableUsers = users.filter(
    user => !projectUsers.some(pu => pu.id === user.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Manage Project Users</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Current Project Users */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Users</h3>
          <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
            {projectUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No users assigned to this project</p>
            ) : (
              <ul className="space-y-1">
                {projectUsers.map(user => (
                  <li key={user.id} className="text-sm text-gray-700">
                    • {user.username || user.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Add User Section */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Add User
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a user --</option>
            {availableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.username || user.email}
              </option>
            ))}
          </select>
          {availableUsers.length === 0 && users.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">All users are already assigned</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddUser}
            disabled={loading || !selectedUserId}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Adding...' : 'Add User'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectUsersManager;
