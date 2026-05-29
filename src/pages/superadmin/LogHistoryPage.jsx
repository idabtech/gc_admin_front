import React, { useEffect, useState } from "react";
import { authService } from "../../service/auth.service";

const C = {
  white: "#FFFFFF",
  black: "#111827",
  slate: "#64748B",
  border: "#E2E8F0",
  card: "#F8FAFC",
  green: "#10B981",
  blue: "#3B82F6",
  orange: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",
};

const LogHistoryPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    getLogs(page);
  }, [page]);

  const getLogs = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getUserLoginHistory(page, 10);
      setLogs(response.auditLog || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 1000
    );

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getActionConfig = (action) => {
    if (action.includes("LOGIN")) {
      return {
        icon: "🔐",
        color: C.green,
        label: "User Login",
      };
    }

    if (action.includes("UPDATE")) {
      return {
        icon: "✏️",
        color: C.orange,
        label: "Data Updated",
      };
    }

    if (action.includes("POST")) {
      return {
        icon: "📨",
        color: C.blue,
        label: "API Request",
      };
    }

    if (action.includes("DELETE")) {
      return {
        icon: "🗑️",
        color: C.red,
        label: "Deleted",
      };
    }

    return {
      icon: "📌",
      color: C.purple,
      label: action,
    };
  };

  const getDescription = (log) => {
    try {
      const details =
        typeof log.details === "string"
          ? JSON.parse(log.details)
          : log.details;

      // USER LOGIN
      if (details?.email) {
        return `Email: ${details.email}`;
      }

      // REQUEST BODY EMAIL
      if (details?.body?.email) {
        return `Email: ${details.body.email}`;
      }

      // DOCTOR UPDATE
      if (details?.body?.name) {
        return `Doctor: ${details.body.name}`;
      }

      // METHOD + PATH
      if (details?.method && details?.path) {
        return `${details.method} ${details.path}`;
      }

      return "Activity recorded";
    } catch {
      return "Activity recorded";
    }
  };

  return (
    <div
      style={{
        background: C.white,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            margin: 0,
            color: C.black,
          }}
        >
          Audit Logs
        </h1>

        <p
          style={{
            color: C.slate,
            marginTop: "8px",
            fontSize: "14px",
          }}
        >
          Track all system activities and user actions
        </p>
      </div>

      {isLoading ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            color: C.slate,
          }}
        >
          Loading logs...
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {logs.map((log) => {
            const config = getActionConfig(log.action);

            return (
              <div
                key={log.id}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: "16px",
                  padding: "18px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  transition: "0.2s",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: config.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    flexShrink: 0,
                  }}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "6px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "600",
                        color: C.black,
                      }}
                    >
                      {config.label}
                    </h3>

                    <span
                      style={{
                        fontSize: "12px",
                        background: "#E2E8F0",
                        padding: "4px 8px",
                        borderRadius: "20px",
                        color: C.slate,
                      }}
                    >
                      {log.action}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "14px",
                      color: C.slate,
                      lineHeight: "20px",
                    }}
                  >
                    {getDescription(log)}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "18px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: C.slate,
                      }}
                    >
                      👤 User ID: {log.user_id || "Guest"}
                    </span>

                    <span
                      style={{
                        fontSize: "12px",
                        color: C.slate,
                      }}
                    >
                      🌐 IP: {log.ip_address}
                    </span>

                    <span
                      style={{
                        fontSize: "12px",
                        color: C.slate,
                      }}
                    >
                      🕒 {formatTimeAgo(log.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    marginTop: "30px",
  }}
>
  <button
    disabled={page === 1}
    onClick={() => setPage((prev) => prev - 1)}
    style={{
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #E2E8F0",
      background: page === 1 ? "#F1F5F9" : "#FFFFFF",
      cursor: page === 1 ? "not-allowed" : "pointer",
    }}
  >
    Previous
  </button>

  <span
    style={{
      fontSize: "14px",
      color: C.black,
      fontWeight: "600",
    }}
  >
    Page {pagination.page || 1} of{" "}
    {pagination.totalPages || 1}
  </span>

  <button
    disabled={page === pagination.totalPages}
    onClick={() => setPage((prev) => prev + 1)}
    style={{
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #E2E8F0",
      background:
        page === pagination.totalPages
          ? "#F1F5F9"
          : "#FFFFFF",
      cursor:
        page === pagination.totalPages
          ? "not-allowed"
          : "pointer",
    }}
  >
    Next
  </button>
</div>
    </div>
  );
};

export default LogHistoryPage;