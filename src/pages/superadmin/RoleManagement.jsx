import React, { useEffect, useState } from "react";
import { roleService } from "../../service/role.service";
import { permissionService } from "../../service/permission.service";
import { C } from "../../components/constants/data";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const RoleManagement = () => {
  const { isAuthenticated, user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_name: '',
    hospital_id: ''
  });

  // Fetch all roles
  const fetchRoles = async () => {

    try {
      const data = await roleService.getRoles();
      setRoles(data.data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all permissions
  const fetchPermissions = async () => {

    try {
      const data = await permissionService.getPermissions();
      setPermissions(data.data || []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  // Fetch permission categories
  const fetchCategories = async () => {

    try {
      const data = await permissionService.getPermissionCategories();
      setCategories(data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch permissions for a specific role
  const fetchRolePermissions = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (role && role.name === 'superadmin') {
      setRolePermissions(permissions);
      return;
    }

    try {
      const data = await roleService.getRolePermissions(roleId);
      setRolePermissions(data.data || []);
    } catch (err) {
      console.error('Error fetching role permissions:', err);
    }
  };

  // Create new role
  const handleCreateRole = async (e) => {
    e.preventDefault();

    try {
      await roleService.createRole(formData);
      toast.success('Role created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', display_name: '', hospital_id: '' });
      fetchRoles();
    } catch (err) {
      console.error('Error creating role:', err);
      toast.error('Failed to create role');
    }
  };

  // Update role permissions
  const handleUpdatePermissions = async (permissionIds) => {
    if (selectedRole && selectedRole.name === 'superadmin') {
      toast.error('Cannot modify superadmin permissions');
      return;
    }

    try {
      await roleService.updateRolePermissions(selectedRole.id, permissionIds);
      toast.success('Permissions updated successfully');
      setShowPermissionModal(false);
      fetchRolePermissions(selectedRole.id);
    } catch (err) {
      console.error('Error updating permissions:', err);
      toast.error('Failed to update permissions');
    }
  };

  // Delete role
  const handleDeleteRole = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (role && role.name === 'superadmin') {
      toast.error('Cannot delete superadmin role');
      return;
    }

    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleService.deleteRole(roleId);
        toast.success('Role deleted successfully');
        fetchRoles();
      } catch (err) {
        console.error('Error deleting role:', err);
        toast.error('Failed to delete role');
      }
    }
  };

  // View role permissions
  const handleViewPermissions = (role) => {
    setSelectedRole(role);
    if (role.name === 'superadmin') {
      setRolePermissions(permissions);
    } else {
      fetchRolePermissions(role.id);
    }
    setShowPermissionModal(true);
  };

  useEffect(() => {
    if (user && user.roles && user.roles.some(role => role.name === 'superadmin')) {
      fetchRoles();
      fetchPermissions();
      fetchCategories();
    }
  }, [user]);

  // Check if user is superadmin
  // console.log('user.roles.some(role => role.name === superadmin)', user.roles[0].name === 'superadmin');
  if (!user || !user.roles || !user.roles.some(role => role.name === 'superadmin')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Access Denied: Superadmin only</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          // className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
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
          Create Role
        </button>
      </div>


      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {[
          { label: 'Total Roles', value: roles.length, color: '#3b82f6', icon: '🛡️' },
          { label: 'Total Permissions', value: permissions.length, color: '#10b981', icon: '🔐' },
          { label: 'Permission Categories', value: categories.length, color: '#f59e0b', icon: '📁' },
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

      {/* Roles Table */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: `${C.border}` }}>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: `${C.border}` }}>
              <th className="text-left p-4">Role Name</th>
              <th className="text-left p-4">Display Name</th>
              <th className="text-left p-4">Description</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b" style={{ borderColor: `${C.border}` }}>
                <td className="p-4 font-medium">{role.name}</td>
                <td className="p-4 opacity-70">{role.display_name || '-'}</td>
                <td className="p-4 opacity-70">{role.description || '-'}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: role.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: role.is_active ? '#22c55e' : '#ef4444'
                    }}
                  >
                    {role.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewPermissions(role)}
                      className="px-3 py-1 text-sm rounded cursor-pointer"
                      style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}
                    >
                      Permissions
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      disabled={role.name === 'superadmin'}
                      className="px-3 py-1 text-sm rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: role.name === 'superadmin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.2)',
                        color: role.name === 'superadmin' ? '#ef444480' : '#ef4444',
                        cursor: role.name === 'superadmin' ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permission Categories */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Permission Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, key) => (
            <div key={key} className="p-4 rounded-lg border" style={{ borderColor: `${C.border}` }}>
              <div className="font-medium mb-2">{category}</div>
              {/* <div className="text-sm opacity-70">{category.description || '-'}</div> */}
            </div>
          ))}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="p-6 rounded-lg w-full max-w-md" style={{ backgroundColor: C.bg }}>
            <h2 className="text-xl font-bold mb-4">Create New Role</h2>
            <form onSubmit={handleCreateRole}>
              <div className="mb-4">
                <label className="block mb-2 text-sm">Role Name</label>
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
                <label className="block mb-2 text-sm">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 rounded border"
                  style={{ borderColor: `${C.border}`, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm">Display Name</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full p-2 rounded border"
                  style={{ borderColor: `${C.border}`, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm">Hospital ID (optional)</label>
                <input
                  type="text"
                  value={formData.hospital_id}
                  onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                  className="w-full p-2 rounded border"
                  style={{ borderColor: `${C.border}`, backgroundColor: 'rgba(255,255,255,0.05)' }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded cursor-pointer"
                  style={{ backgroundColor: C.border }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && selectedRole && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: C.bg }}>
            <h2 className="text-xl font-bold mb-4">Manage Permissions - {selectedRole.name}</h2>

            <div className="mb-6">
              <h3 className="font-medium mb-3">Available Permissions</h3>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {permissions.map((permission) => (
                  <label key={permission.id} className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-opacity-10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <input
                      type="checkbox"
                      checked={rolePermissions.some(rp => rp.id === permission.id)}
                      disabled={selectedRole.name === 'superadmin'}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRolePermissions([...rolePermissions, permission]);
                        } else {
                          setRolePermissions(rolePermissions.filter(rp => rp.id !== permission.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium">{permission.name}</div>
                      <div className="text-xs opacity-70">{permission.code}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 rounded cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdatePermissions(rolePermissions.map(p => p.id))}
                disabled={selectedRole.name === 'superadmin'}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: selectedRole.name === 'superadmin' ? 'rgba(59, 130, 246, 0.4)' : '#2563eb'
                }}
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
