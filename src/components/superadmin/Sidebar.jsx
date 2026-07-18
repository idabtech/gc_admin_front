import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { C } from "../constants/data";
import logo from '../../assets/1PAss Name .svg'

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Hospitals", path: "/hospitals", icon: "🏥" },
  // { name: "Teams & Conditions", path: "/teams-conditions", icon: "👥" },
  { name: "Doctors", path: "/doctors", icon: "👨‍⚕️" },
  { name: "Patients", path: "/patients", icon: "👥" },
  // { name: "Appointments", path: "/appointments", icon: "📅" },
  { name: "Packages", path: "/packages", icon: "📦" },
  { name: "Payments", path: "/payments", icon: "💳" },
  { name: "Email Templates", path: "/email-templates", icon: "📨" },
  { name: "Bulk Mailer", path: "/bulk-mailer", icon: "✉️" },
  // { name: "Coordinators", path: "/coordinators", icon: "🧑‍💼" },
  { name: "Role Management", path: "/role-management", icon: "🛡️" },
  { name: "Team Register", path: "/team-register", icon: "👥" },
  // { name: "Reports", path: "/reports", icon: "📈" },
  { name: "Settings", path: "/settings", icon: "⚙️" }
];

export default function Sidebar() {
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };
  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0,
      width: 230, height: '100vh',
      background: C.navy,
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 10px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div>
          <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginRight: 16 }}>
            <div style={{
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              // borderBottom: `1px solid ${C.border}`,
              boxSizing: 'border-box',
              width: '100%',
              height: "40px",
            }}>
              <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", justifyContent: 'center', cursor: "pointer", width: "100%" }}>
                <img src={logo} alt="1Pass" style={{ width: "auto", objectFit: "contain" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '5px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {menuItems.map(({ path, name, icon: Icon }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 13px', borderRadius: 9,
                fontSize: 14, textDecoration: 'none',
                background: isActive ? C.tealTransparent : 'transparent',
                color: isActive ? C.tealL : C.slateL,
                border: isActive ? `1px solid ${C.tealBorder}` : '1px solid transparent',
                transition: 'all 0.18s',
                fontWeight: isActive ? 700 : 400,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = C.transparentHover;
                  e.currentTarget.style.color = C.black;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = C.slateL;
                }
              }}
            >
              {Icon}
              {/* <Icon style={{ width: 16, height: 16, flexShrink: 0 }} /> */}
              {name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '14px', borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '10px 13px', borderRadius: 9,
            fontSize: 13, cursor: 'pointer', textAlign: 'left',
            background: C.redTransparent,
            color: C.red,
            border: '1px solid transparent',
          }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}