import React, { useState } from 'react';
import { C } from '../constants/data';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../service/auth.service';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  const currentUser = getCurrentUser();
    const { user } = useAuth();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      background: C.navy,
      borderBottom: `1px solid ${C.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="flex items-center justify-between px-8 py-4 gap-6">

        {/* <button style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: C.slateL,
          fontSize: 18,
          position: 'relative'
        }}>
          🔔
        </button> */}

        <div style={{ width: 1, height: 28, background: C.border }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: "relative" }}>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.black }}>
              {user?.name || user?.email}
            </div>
            <div style={{ fontSize: 10, color: C.slate }}>
              {user?.role}
            </div>
          </div>

          {/* Avatar */}
          <div
            onClick={() => setOpenMenu(!openMenu)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${C.teal}, #0773cc)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            {user?.avatar_url ? (
              <img src={user?.avatar_url} alt="Avatar" style={{ width: 38, height: 38, borderRadius: 10 }} />
            ) : (
              <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>

          {/* Dropdown */}
          {openMenu && (
            <div style={{
              position: "absolute",
              top: 45,
              right: 0,
              width: 160,
              background: C.navy,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              boxShadow: `0 8px 20px ${C.shadow}`,
              overflow: "hidden"
            }}>
              <div
                onClick={() => {
                  navigate("/profile");
                  setOpenMenu(false);
                }}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: C.slateL
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = C.transparentHoverLight}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                👤 Profile
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}