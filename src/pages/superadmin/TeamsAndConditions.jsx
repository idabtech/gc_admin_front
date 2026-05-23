import React, { useEffect, useState } from "react";
import { C } from "../../components/constants/data";
import { teamService } from "../../service/team.service";
import { conditionService } from "../../service/condition.service";

const TeamsAndConditions = () => {
  const [activeTab, setActiveTab] = useState("teams");
  const [teams, setTeams] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const fetchTeams = async () => {
    try {
      const data = await teamService.getTeams();
      setTeams(data.teams || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConditions = async () => {
    try {
      const data = await conditionService.getConditions();
      setConditions(data.conditions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const searchAndFilterTeams = async () => {
    try {
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      
      const data = await teamService.searchTeams(searchQuery, filters);
      setTeams(data.teams || []);
    } catch (err) {
      console.error(err);
    }
  };

  const searchAndFilterConditions = async () => {
    try {
      const filters = {};
      if (categoryFilter !== "all") filters.category = categoryFilter;
      if (severityFilter !== "all") filters.severity = severityFilter;
      
      const data = await conditionService.searchConditions(searchQuery, filters);
      setConditions(data.conditions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTeams(), fetchConditions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "teams") {
      if (searchQuery || statusFilter !== "all") {
        searchAndFilterTeams();
      } else {
        fetchTeams();
      }
    } else {
      if (searchQuery || categoryFilter !== "all" || severityFilter !== "all") {
        searchAndFilterConditions();
      } else {
        fetchConditions();
      }
    }
  }, [searchQuery, statusFilter, categoryFilter, severityFilter, activeTab]);

  const openModal = (item, mode = 'view') => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleActionComplete = () => {
    if (activeTab === "teams") {
      fetchTeams();
    } else {
      fetchConditions();
    }
  };

  const toggleDropdown = (e, itemId) => {
    e.stopPropagation();
    
    if (activeDropdown === itemId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(itemId);
    }
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const handleDropdownAction = (action, item, e) => {
    e.stopPropagation();
    closeDropdown();
    
    if (activeTab === "teams") {
      handleTeamAction(action, item);
    } else {
      handleConditionAction(action, item);
    }
  };

  const handleTeamAction = async (action, team) => {
    switch (action) {
      case 'edit':
        openModal(team, 'edit');
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${team.name}?`)) {
          await teamService.deleteTeam(team.id);
          fetchTeams();
        }
        break;
      case 'activate':
        await teamService.updateTeamStatus(team.id, 'active');
        fetchTeams();
        break;
      case 'deactivate':
        await teamService.updateTeamStatus(team.id, 'inactive');
        fetchTeams();
        break;
    }
  };

  const handleConditionAction = async (action, condition) => {
    switch (action) {
      case 'edit':
        openModal(condition, 'edit');
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${condition.name}?`)) {
          await conditionService.deleteCondition(condition.id);
          fetchConditions();
        }
        break;
      case 'activate':
        await conditionService.updateConditionStatus(condition.id, 'active');
        fetchConditions();
        break;
      case 'deactivate':
        await conditionService.updateConditionStatus(condition.id, 'inactive');
        fetchConditions();
        break;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return { bg: C.red + '20', color: C.red };
      case 'high': return { bg: C.orange + '20', color: C.orange };
      case 'medium': return { bg: C.gold + '20', color: C.gold };
      case 'low': return { bg: C.green + '20', color: C.green };
      default: return { bg: C.slate + '20', color: C.slate };
    }
  };

  const renderTeamsTable = () => (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: C.navy, borderBottom: `1px solid ${C.border}` }}>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>Team Name</th>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>Hospital</th>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>Members</th>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>Specialization</th>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>Status</th>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>Created</th>
          <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: C.slate }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {teams.length === 0 ? (
          <tr>
            <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: C.slate }}>
              No teams found
            </td>
          </tr>
        ) : (
          teams.map((team) => (
            <tr
              key={team.id}
              style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}
              onClick={() => openModal(team, 'view')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td style={{ padding: '12px 16px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: C.black, marginBottom: '2px' }}>
                    {team.name}
                  </div>
                  <div style={{ fontSize: '12px', color: C.slate }}>
                    {team.lead_name}
                  </div>
                </div>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: '14px', color: C.black }}>
                  {team.hospital_name}
                </div>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: '14px', color: C.black }}>
                  {team.member_count} members
                </div>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: '14px', color: C.black }}>
                  {team.specialization}
                </div>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: team.status === 'active' ? C.green + '20' : C.slate + '20',
                    color: team.status === 'active' ? C.green : C.slate
                  }}
                >
                  {team.status}
                </span>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: '14px', color: C.slate }}>
                  {new Date(team.created_at).toLocaleDateString()}
                </div>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={(e) => toggleDropdown(e, team.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    ⋮
                  </button>

                  {activeDropdown === team.id && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '30px',
                        right: '0',
                        background: C.card,
                        border: `1px solid ${C.border}`,
                        borderRadius: '8px',
                        boxShadow: `0 4px 12px ${C.shadow}`,
                        overflow: 'hidden',
                        zIndex: 1000,
                        minWidth: '150px'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        onClick={(e) => handleDropdownAction('edit', team, e)}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: C.black
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        ✏️ Edit
                      </div>
                      {team.status === 'active' ? (
                        <div
                          onClick={(e) => handleDropdownAction('deactivate', team, e)}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: C.orange
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          ⏸️ Deactivate
                        </div>
                      ) : (
                        <div
                          onClick={(e) => handleDropdownAction('activate', team, e)}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: C.green
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          ▶️ Activate
                        </div>
                      )}
                      <div
                        onClick={(e) => handleDropdownAction('delete', team, e)}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: C.red
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        🗑️ Delete
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const renderConditionsTable = () => (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: C.navy, borderBottom: `1px solid ${C.border}` }}>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>Condition Name</th>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>Category</th>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>ICD-10 Code</th>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>Severity</th>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>Status</th>
          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: C.slate }}>Updated</th>
          <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: C.slate }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {conditions.length === 0 ? (
          <tr>
            <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: C.slate }}>
              No conditions found
            </td>
          </tr>
        ) : (
          conditions.map((condition) => {
            const severityColors = getSeverityColor(condition.severity);
            return (
              <tr
                key={condition.id}
                style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}
                onClick={() => openModal(condition, 'view')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: C.black, marginBottom: '2px' }}>
                      {condition.name}
                    </div>
                    <div style={{ fontSize: '12px', color: C.slate }}>
                      {condition.description?.substring(0, 50)}...
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '14px', color: C.black }}>
                    {condition.category}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '14px', color: C.black, fontFamily: 'monospace' }}>
                    {condition.icd_code}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: severityColors.bg,
                      color: severityColors.color
                    }}
                  >
                    {condition.severity}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: condition.status === 'active' ? C.green + '20' : C.slate + '20',
                      color: condition.status === 'active' ? C.green : C.slate
                    }}
                  >
                    {condition.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '14px', color: C.slate }}>
                    {new Date(condition.updated_at).toLocaleDateString()}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <button
                      onClick={(e) => toggleDropdown(e, condition.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      ⋮
                    </button>

                    {activeDropdown === condition.id && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '30px',
                          right: '0',
                          background: C.card,
                          border: `1px solid ${C.border}`,
                          borderRadius: '8px',
                          boxShadow: `0 4px 12px ${C.shadow}`,
                          overflow: 'hidden',
                          zIndex: 1000,
                          minWidth: '150px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          onClick={(e) => handleDropdownAction('edit', condition, e)}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: C.black
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          ✏️ Edit
                        </div>
                        {condition.status === 'active' ? (
                          <div
                            onClick={(e) => handleDropdownAction('deactivate', condition, e)}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              color: C.orange
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            ⏸️ Deactivate
                          </div>
                        ) : (
                          <div
                            onClick={(e) => handleDropdownAction('activate', condition, e)}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              color: C.green
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            ▶️ Activate
                          </div>
                        )}
                        <div
                          onClick={(e) => handleDropdownAction('delete', condition, e)}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: C.red
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.navy}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          🗑️ Delete
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ color: C.slate }}>Loading data...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: C.bg}}>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.black }}>
          Teams & Conditions Management
        </h2>
        <p style={{ color: C.gray }}>
          Manage healthcare teams and medical conditions
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
          <button
            onClick={() => setActiveTab("teams")}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === "teams" ? `2px solid ${C.teal}` : 'none',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === "teams" ? C.teal : C.slate,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab("conditions")}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === "conditions" ? `2px solid ${C.teal}` : 'none',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === "conditions" ? C.teal : C.slate,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Conditions
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1px solid ${C.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: C.white,
              color: C.black
            }}
          />
        </div>
        
        <div className="flex gap-3">
          {activeTab === "teams" ? (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: C.white,
                  color: C.black
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </>
          ) : (
            <>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: C.white,
                  color: C.black
                }}
              >
                <option value="all">All Categories</option>
                <option value="cardiovascular">Cardiovascular</option>
                <option value="respiratory">Respiratory</option>
                <option value="neurological">Neurological</option>
                <option value="gastrointestinal">Gastrointestinal</option>
                <option value="musculoskeletal">Musculoskeletal</option>
                <option value="endocrine">Endocrine</option>
                <option value="infectious">Infectious</option>
                <option value="oncology">Oncology</option>
                <option value="pediatric">Pediatric</option>
                <option value="mental_health">Mental Health</option>
              </select>
              
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: C.white,
                  color: C.black
                }}
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </>
          )}
          
          <button
            onClick={() => openModal(null, 'create')}
            style={{
              padding: '10px 20px',
              backgroundColor: C.teal,
              color: C.white,
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.tealL}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.teal}
          >
            + Add {activeTab === "teams" ? "Team" : "Condition"}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          {activeTab === "teams" ? renderTeamsTable() : renderConditionsTable()}
        </div>
      </div>

      {/* Modal placeholder - would need to create actual modal components */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: C.card,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: C.black, marginBottom: '16px' }}>
              {selectedItem ? `Edit ${activeTab === "teams" ? "Team" : "Condition"}` : `Create ${activeTab === "teams" ? "Team" : "Condition"}`}
            </h3>
            <p style={{ color: C.slate, marginBottom: '16px' }}>
              Modal component would be implemented here for {activeTab} management.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${C.border}`,
                  borderRadius: '6px',
                  background: C.white,
                  color: C.black,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  closeModal();
                  handleActionComplete();
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: C.teal,
                  color: C.white,
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsAndConditions;
