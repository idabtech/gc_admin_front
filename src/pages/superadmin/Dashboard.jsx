import React, { useState, useEffect } from 'react';
import { C } from '../../components/constants/data';
import { dashboardService } from '../../service/dashboard.service';
import { toast } from 'sonner';

export default function Dashboard() {
  const [hoveredStat, setHoveredStat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalHospitals: { value: 0, trend: "+0%" },
      activeDoctors: { value: 0, trend: "+0%" },
      totalPatients: { value: 0, trend: "+0%" },
      appointmentsToday: { value: 0, trend: "+0%" }
    },
    appointmentsChart: [0, 0, 0, 0, 0, 0, 0],
    topHospitals: [],
    activities: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getAdminDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Total Hospitals", value: dashboardData.stats.totalHospitals.value, icon: "🏥", color: C.teal, trend: dashboardData.stats.totalHospitals.trend, bgColor: C.tealTransparent },
    { label: "Active Doctors", value: dashboardData.stats.activeDoctors.value, icon: "👨‍⚕️", color: C.tealL, trend: dashboardData.stats.activeDoctors.trend, bgColor: "rgba(20,212,188,0.12)" },
    { label: "Total Patients", value: dashboardData.stats.totalPatients.value, icon: "👥", color: C.goldL, trend: dashboardData.stats.totalPatients.trend, bgColor: "rgba(240,201,107,0.12)" },
    { label: "Appointments Today", value: dashboardData.stats.appointmentsToday.value, icon: "📅", color: C.blue, trend: dashboardData.stats.appointmentsToday.trend, bgColor: "rgba(59,130,246,0.12)" }
  ];

  const topHospitals = dashboardData.topHospitals || [];

  const activities = dashboardData.activities || [];

  if (loading) {
    return (
      <div style={{ backgroundColor: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "18px", color: C.slateL }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ 
          fontSize: "28px", 
          fontWeight: "600", 
          color: C.black, 
          margin: "0 0 8px 0",
          letterSpacing: "-0.5px"
        }}>
          Dashboard Overview
        </h1>
        <p style={{ 
          color: C.slateL, 
          margin: "0",
          fontSize: "14px"
        }}>
          Monitor your healthcare network in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "32px"
      }}>
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredStat(idx)}
            onMouseLeave={() => setHoveredStat(null)}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              padding: "20px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: hoveredStat === idx ? "translateY(-4px)" : "translateY(0)",
              boxShadow: hoveredStat === idx 
                ? `0 12px 24px rgba(0,0,0,0.08)` 
                : `0 1px 3px rgba(0,0,0,0.05)`,
              cursor: "pointer"
            }}
          >
            {/* Background accent */}
            {/* <div style={{
              position: "absolute",
              top: "0",
              right: "0",
              width: "80px",
              height: "80px",
              background: stat.bgColor,
              borderRadius: "12px",
              opacity: "0.5",
              zIndex: "0",
              marginTop: "-20px",
              marginRight: "-20px"
            }} /> */}

            {/* Content */}
            <div style={{ position: "relative", zIndex: "1" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px"
              }}>
                <div style={{
                  fontSize: "32px",
                  background: stat.bgColor,
                  width: "52px",
                  height: "52px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {stat.icon}
                </div>
                <div style={{
                  background: stat.color + "15",
                  color: stat.color,
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  <span>↑</span> {stat.trend}
                </div>
              </div>

              <p style={{
                fontSize: "13px",
                color: C.slateL,
                margin: "0 0 8px 0",
                fontWeight: "500"
              }}>
                {stat.label}
              </p>

              <p style={{
                fontSize: "28px",
                fontWeight: "600",
                color: C.black,
                margin: "0"
              }}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "20px",
        marginBottom: "32px"
      }}>
        {/* Main Chart */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            padding: "24px"
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{
              fontSize: "16px",
              fontWeight: "600",
              color: C.black,
              margin: "0"
            }}>
              Appointments This Month
            </h3>
            <div style={{
              background: C.teal + "15",
              color: C.teal,
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "500"
            }}>
              Last 30 days
            </div>
          </div>

          {/* Chart placeholder with gradient background */}
          <div
            style={{
              height: "280px",
              borderRadius: "10px",
              background: `linear-gradient(135deg, ${C.tealTransparent} 0%, ${C.card} 100%)`,
              border: `1px dashed ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Placeholder bars visualization */}
            <div style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: "8px",
              height: "100%",
              padding: "20px",
              width: "100%"
            }}>
              {dashboardData.appointmentsChart.map((count, idx) => {
                const height = count > 0 ? Math.max((count / Math.max(...dashboardData.appointmentsChart)) * 100, 10) : 5;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      background: idx % 2 === 0 ? C.teal : C.tealL,
                      borderRadius: "6px 6px 0 0",
                      opacity: 0.7,
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = "1";
                      e.target.style.transform = "scaleY(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = "0.7";
                      e.target.style.transform = "scaleY(1)";
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Hospitals */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            padding: "24px"
          }}
        >
          <h3 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: C.black,
            margin: "0 0 20px 0"
          }}>
            Top Hospitals
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topHospitals.map((hospital, idx) => (
              <div
                key={idx}
                style={{
                  background: C.navy,
                  padding: "16px",
                  borderRadius: "10px",
                  border: `1px solid ${C.border}`,
                  transition: "all 0.2s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.transparentHover;
                  e.currentTarget.style.borderColor = C.teal;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.navy;
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "8px"
                }}>
                  <p style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: C.black,
                    margin: "0"
                  }}>
                    {hospital.name}
                  </p>
                  <span style={{
                    background: C.green + "20",
                    color: C.green,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "600"
                  }}>
                    {hospital.growth}
                  </span>
                </div>
                <p style={{
                  fontSize: "12px",
                  color: C.slateL,
                  margin: "0"
                }}>
                  {hospital.appointments} appointments
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          padding: "24px"
        }}
      >
        <h3 style={{
          fontSize: "16px",
          fontWeight: "600",
          color: C.black,
          margin: "0 0 20px 0"
        }}>
          Recent Activity
        </h3>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          {activities.map((activity, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "14px",
                background: C.navy,
                borderRadius: "10px",
                borderLeft: `3px solid ${C.teal}`,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.transparentHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.navy;
              }}
            >
              <span style={{
                fontSize: "18px",
                minWidth: "24px",
                display: "flex",
                alignItems: "center"
              }}>
                📌
              </span>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: "14px",
                  color: C.black,
                  margin: "0",
                  fontWeight: "500"
                }}>
                  {activity.action}
                </p>
                <p
  style={{
    fontSize: "13px",
    color: C.slate,
    margin: "4px 0 0 0"
  }}
>
  {(() => {
    try {
      const details =
        typeof activity.details === "string"
          ? JSON.parse(activity.details)
          : activity.details;
      // USER_LOGIN log
      if (details.email || details.name) {
        return (details.email) ? `Email: ${details.email}` : `Name: ${details.name}`;
      }

      // POST /login log
      if (details.body?.email) {
        return `Email: ${details.body.email}`;
      }

      // Generic request log
      if (details.method && details.path) {
        return `${details.method} ${details.path}`;
      }

      return "Activity recorded";
    } catch {
      return "";
    }
  })()}
</p>
                </div>
              <span style={{
                fontSize: "12px",
                color: C.slateL,
                whiteSpace: "nowrap",
                marginLeft: "12px"
              }}>
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div style={{
        marginTop: "32px",
        padding: "20px 24px",
        background: C.navy,
        borderRadius: "12px",
        border: `1px solid ${C.border}`,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "20px",
        textAlign: "center"
      }}>
        <div>
          <p style={{
            fontSize: "12px",
            color: C.slateL,
            margin: "0 0 8px 0",
            fontWeight: "500"
          }}>
            System Uptime
          </p>
          <p style={{
            fontSize: "20px",
            fontWeight: "600",
            color: C.green,
            margin: "0"
          }}>
            99.9%
          </p>
        </div>
        <div>
          <p style={{
            fontSize: "12px",
            color: C.slateL,
            margin: "0 0 8px 0",
            fontWeight: "500"
          }}>
            Avg Response
          </p>
          <p style={{
            fontSize: "20px",
            fontWeight: "600",
            color: C.blue,
            margin: "0"
          }}>
            120ms
          </p>
        </div>
        <div>
          <p style={{
            fontSize: "12px",
            color: C.slateL,
            margin: "0 0 8px 0",
            fontWeight: "500"
          }}>
            Active Sessions
          </p>
          <p style={{
            fontSize: "20px",
            fontWeight: "600",
            color: C.purple,
            margin: "0"
          }}>
            342
          </p>
        </div>
      </div>
    </div>
  );
}