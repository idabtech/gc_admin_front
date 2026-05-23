import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/superadmin/Sidebar';
import Header from '../components/superadmin/Header';
import { C } from '../components/constants/data';

const SuperAdminLayout = () => {
  return (
    <div
      className="min-h-screen flex"
      style={{
        minHeight: '100vh',
        background: C.bg,
        color: C.black
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="w-full ml-58">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            padding: "32px 28px",
            background: C.bg
          }}
        >
          <Outlet />
        </main>

        {/* Optional Footer */}
        {/* <footer
          className="border-t mt-auto"
          style={{
            borderColor: "rgba(255,255,255,0.07)",
            padding: "20px 28px",
            textAlign: "center",
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)"
          }}
        >
          Global Care Admin Platform © 2024 • All rights reserved
        </footer> */}
      </div>
    </div>
  );
};

export default SuperAdminLayout;