import React, { useEffect, useState } from "react";
import { teamService } from "../../service/team.service";
import { roleService } from "../../service/role.service";
import { hospitalService } from "../../service/hospital.service";
import { C } from "../../components/constants/data";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { Plus, Eye, EyeOff } from "lucide-react";

const TeamRegister = () => {
  const { isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!showModal) {
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [showModal]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    name: '',
    phone: '',
    role: '',
    hospital_id: '',
    expires_at: ''
  });

  // Fetch users
  const fetchUsers = async (pageVal = 1, limitVal = 20, activeFilters = {}) => {
    try {
      setLoading(true);
      const data = await teamService.getUsers(pageVal, limitVal, activeFilters);
      console.log('data', data)
      setUsers(data.users || []);
      setPagination(data.pagination || { total: 0, page: pageVal, limit: limitVal, pages: data.pagination?.pages || 1 });
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const data = await roleService.getRoles();
      setRoles(data.data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
      toast.error('Failed to fetch roles');
    }
  };

  // Fetch hospitals
  const fetchHospitals = async () => {
    try {
      const data = await hospitalService.getHospitals();
      setHospitals(data.data || []);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      toast.error('Failed to fetch hospitals');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.password_confirmation || !formData.name || !formData.phone || !formData.role) {
      toast.error('Email, Password, Password Confirmation, Name, Phone and Role are required');
      return;
    }

    try {
      await teamService.assignRole(formData);
      toast.success('Role assigned to user successfully');
      setShowModal(false);
      setFormData({ email: '', password: '', password_confirmation: '', name: '', phone: '', role: '', hospital_id: '', expires_at: '' });
      setPage(1);
      setRefreshTrigger(prev => prev + 1); // Refresh users to show updated roles
    } catch (err) {
      console.error('Error assigning role:', err);
      toast.error('Failed to assign role');
    }
  };

  // Handle toggle user active status
  const handleToggleActive = async (userId, isActive) => {
    try {
      if (isActive) {
        await teamService.activateUser(userId);
        toast.success('User activated successfully');
      } else {
        await teamService.deactivateUser(userId);
        toast.success('User deactivated successfully');
      }
      setRefreshTrigger(prev => prev + 1); // Refresh users to show updated status
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status');
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when filters or page changes
  useEffect(() => {
    fetchUsers(page, 20, {
      search: debouncedSearch,
      role: selectedRole,
      is_active: selectedStatus
    });
  }, [page, debouncedSearch, selectedRole, selectedStatus, refreshTrigger]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleRoleChange = (val) => {
    setSelectedRole(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    setPage(1);
  };

  useEffect(() => {
    fetchRoles();
    fetchHospitals();
  }, []);
  // Check if user is superadmin
  if (!user || !user.roles || !user.roles.some(role => role.name === 'superadmin')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Access Denied: Superadmin only</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Register</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.5rem',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)'
          }}
        >
          <Plus size={18} />
          Assign Role
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {[
          { label: 'Total Users', value: pagination.total, color: '#3b82f6', icon: '👥' },
          { label: 'Total Roles', value: roles.length, color: '#10b981', icon: '🛡️' },
          { label: 'Total Hospitals', value: hospitals.length, color: '#f59e0b', icon: '🏥' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{
              background: `${stat.color}08`,
              borderColor: `${stat.color}30`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p style={{ color: C.slate }} className="text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div
              className="mt-4 h-1 rounded-full opacity-20"
              style={{ background: stat.color }}
            />
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex flex-1 flex-col md:flex-row gap-3 w-full">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full p-2.5 rounded-lg border text-sm"
              style={{
                borderColor: C.border,
                backgroundColor: C.bg,
                color: C.black
              }}
            />
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full p-2.5 rounded-lg border text-sm"
              style={{
                borderColor: C.border,
                backgroundColor: C.bg,
                color: C.black
              }}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.display_name || role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full p-2.5 rounded-lg border text-sm"
              style={{
                borderColor: C.border,
                backgroundColor: C.bg,
                color: C.black
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: `${C.border}` }}>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: `${C.border}` }}>
              <th className="text-left p-4">User ID</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              {/* <th className="text-left p-4">Hospital</th> */}
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b" style={{ borderColor: `${C.border}` }}>
                  <td className="p-4 font-medium">{user.id}</td>
                  <td className="p-4 opacity-70">{user.name || '-'}</td>
                  <td className="p-4 opacity-70">{user.email || '-'}</td>
                  <td className="p-4 opacity-70">{user.roles || '-'}</td>
                  {/* <td className="p-4 opacity-70">{user.hospital_name || '-'}</td> */}
                  <td className="p-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.is_active}
                        onChange={() => handleToggleActive(user.id, !user.is_active)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm opacity-70">
            Page {page} of {pagination.pages} (Total: {pagination.total})
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: C.border }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="p-6 rounded-lg w-full max-w-md" style={{ backgroundColor: C.bg }}>
            <h2 className="text-xl font-bold mb-4">Assign Role to User</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 rounded border"
                  style={{ borderColor: `${C.border}`, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 rounded border"
                  style={{ borderColor: `${C.border}`, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 rounded border"
                  style={{ borderColor: `${C.border}`, backgroundColor: 'rgba(255,255,255,0.05)' }}
                // required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2 pr-10 rounded border"
                    style={{ borderColor: `${C.border}`, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm">Password Confirmation *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                    className="w-full p-2 pr-10 rounded border"
                    style={{ borderColor: `${C.border}`, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 rounded border"
                  style={{ borderColor: `${C.border}`, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.display_name || role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded cursor-pointer"
                  style={{ backgroundColor: C.border }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRegister;
