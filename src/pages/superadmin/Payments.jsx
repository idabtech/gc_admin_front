import React, { useState, useEffect } from "react";
import { paymentService } from "../../service/payment.service";
import { C } from "../../components/constants/data";
import {
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  TrendingUp,
  X,
  ArrowRight,
  Shield,
  Activity
} from "lucide-react";
import { toast } from "sonner";

const Payments = () => {
  const [activeTab, setActiveTab] = useState("packages"); // "packages" or "transactions"
  const [packagesData, setPackagesData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null); // for detail modal
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "packages") {
        const response = await paymentService.getAdminPaymentOverview();
        if (response.success) {
          setPackagesData(response.cases || []);
        }
      } else {
        const response = await paymentService.getAdminTransactions();
        if (response.success) {
          setTransactionsData(response.transactions || []);
        }
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      toast.error("Failed to load payment records");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPaymentReminder = async (item) => {
    if (!item || !item.case_id) return;
    try {
      setSendingEmail(true);
      const response = await paymentService.sendPaymentReminder(item.case_id);
      if (response.success) {
        toast.success(response.message || "Payment reminder email sent successfully!");
        setSelectedItem(null); // Close modal on success
      } else {
        toast.error(response.error || "Failed to send payment reminder");
      }
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      toast.error(error.response?.data?.error || error.message || "An error occurred");
    } finally {
      setSendingEmail(false);
    }
  };

  // Helper calculation for package summaries
  const totalCost = packagesData.reduce((sum, item) => sum + parseFloat(item.estimated_cost || 0), 0);
  const totalPaid = packagesData.reduce((sum, item) => sum + parseFloat(item.paid_amount || 0), 0);
  const totalPending = packagesData.reduce((sum, item) => sum + parseFloat(item.pending_amount || 0), 0);
  const completedPaymentsCount = transactionsData.filter(t => t.status === "completed").length;

  // Filter package data
  const filteredPackages = packagesData.filter(item => {
    const searchStr = `${item.patient_name} ${item.hospital_name} ${item.doctor_name} ${item.treatment_name}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    const paid = parseFloat(item.paid_amount || 0);
    const cost = parseFloat(item.estimated_cost || 0);
    const pending = parseFloat(item.pending_amount || 0);
    
    if (statusFilter === "paid") {
      matchesStatus = pending <= 0 && cost > 0;
    } else if (statusFilter === "partial") {
      matchesStatus = paid > 0 && pending > 0;
    } else if (statusFilter === "unpaid") {
      matchesStatus = paid === 0 && cost > 0;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Filter transactions data
  const filteredTransactions = transactionsData.filter(item => {
    const searchStr = `${item.patient_name || item.user_name || ""} ${item.hospital_name || ""} ${item.doctor_name || ""} ${item.order_id || ""} ${item.transaction_id || ""} ${item.payment_type || ""}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = item.status === statusFilter;
    }

    let matchesGateway = true;
    if (gatewayFilter !== "all") {
      matchesGateway = item.gateway === gatewayFilter;
    }
    
    return matchesSearch && matchesStatus && matchesGateway;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getPackageStatusBadge = (item) => {
    const paid = parseFloat(item.paid_amount || 0);
    const cost = parseFloat(item.estimated_cost || 0);
    const pending = parseFloat(item.pending_amount || 0);

    if (cost === 0) return { text: "No Cost", color: C.slate, bg: "#F3F4F6" };
    if (pending <= 0) return { text: "Fully Paid", color: C.green, bg: "rgba(46,204,138,0.15)" };
    if (paid > 0) return { text: "Partially Paid", color: C.orange, bg: "rgba(249,115,22,0.15)" };
    return { text: "Unpaid", color: C.red, bg: "rgba(224,82,82,0.15)" };
  };

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: "40px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: C.black, margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>
            Payment & Package Operations
          </h1>
          <p style={{ color: C.slateL, margin: "0", fontSize: "14px" }}>
            Manage treatment packages, hospital-doctor choices, and calculate outstanding pending balances.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "32px"
      }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: C.slateL, fontWeight: "500" }}>Total Value</span>
            <div style={{ background: "rgba(11,181,160,0.12)", color: C.teal, width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: "26px", fontWeight: "700", color: C.black, margin: "0 0 4px 0" }}>
            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span style={{ fontSize: "11px", color: C.slateL }}>Accumulated across all proposed packages</span>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: C.slateL, fontWeight: "500" }}>Total Received</span>
            <div style={{ background: "rgba(46,204,138,0.12)", color: C.green, width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: "26px", fontWeight: "700", color: C.black, margin: "0 0 4px 0" }}>
            ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span style={{ fontSize: "11px", color: C.green, fontWeight: "600" }}>
            {totalCost > 0 ? `${Math.round((totalPaid / totalCost) * 100)}%` : "0%"} collection rate
          </span>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: C.slateL, fontWeight: "500" }}>Total Pending</span>
            <div style={{ background: "rgba(224,82,82,0.12)", color: C.red, width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: "26px", fontWeight: "700", color: C.black, margin: "0 0 4px 0" }}>
            ${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span style={{ fontSize: "11px", color: C.red, fontWeight: "600" }}>
            {totalCost > 0 ? `${Math.round((totalPending / totalCost) * 100)}%` : "0%"} outstanding
          </span>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", color: C.slateL, fontWeight: "500" }}>Transactions</span>
            <div style={{ background: "rgba(139,92,246,0.12)", color: C.purple, width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: "26px", fontWeight: "700", color: C.black, margin: "0 0 4px 0" }}>
            {activeTab === "packages" ? packagesData.length : transactionsData.length}
          </h3>
          <span style={{ fontSize: "11px", color: C.slateL }}>Total active records listed</span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: "24px", gap: "24px" }}>
        <button
          onClick={() => { setActiveTab("packages"); setStatusFilter("all"); setSearchQuery(""); }}
          style={{
            padding: "12px 4px",
            fontSize: "15px",
            fontWeight: "600",
            color: activeTab === "packages" ? C.teal : C.slateL,
            background: "none",
            border: "none",
            borderBottom: activeTab === "packages" ? `2px solid ${C.teal}` : "2px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          📦 Treatment Packages & Balances
        </button>
        <button
          onClick={() => { setActiveTab("transactions"); setStatusFilter("all"); setSearchQuery(""); }}
          style={{
            padding: "12px 4px",
            fontSize: "15px",
            fontWeight: "600",
            color: activeTab === "transactions" ? C.teal : C.slateL,
            background: "none",
            border: "none",
            borderBottom: activeTab === "transactions" ? `2px solid ${C.teal}` : "2px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          💳 Transaction Logs
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        marginBottom: "24px",
        background: C.navy,
        padding: "16px",
        borderRadius: "12px",
        border: `1px solid ${C.border}`
      }}>
        {/* Search Input */}
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.slateL }} />
          <input
            type="text"
            placeholder={activeTab === "packages" ? "Search patient, hospital, doctor or package..." : "Search Txn ID, Order ID, User..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              borderRadius: "8px",
              border: `1px solid ${C.border}`,
              fontSize: "14px",
              backgroundColor: C.white,
              color: C.black,
              outline: "none"
            }}
          />
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Filter size={16} style={{ color: C.slateL }} />
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: "8px",
              border: `1px solid ${C.border}`,
              fontSize: "13px",
              backgroundColor: C.white,
              color: C.black,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="all">All Statuses</option>
            {activeTab === "packages" ? (
              <>
                <option value="paid">Fully Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
              </>
            ) : (
              <>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </>
            )}
          </select>

          {/* Gateway Filter (Only for Transactions) */}
          {activeTab === "transactions" && (
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: `1px solid ${C.border}`,
                fontSize: "13px",
                backgroundColor: C.white,
                color: C.black,
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="all">All Gateways</option>
              <option value="stripe">Stripe</option>
              <option value="razorpay">Razorpay</option>
              <option value="paypal">PayPal</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
            <div style={{ border: `3px solid ${C.border}`, borderTopColor: C.teal, borderRadius: "50%", width: "36px", height: "36px", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : activeTab === "packages" ? (
          /* Packages Table */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: C.navy, borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase" }}>Package/Case</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase" }}>Patient</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase" }}>Hospital</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase" }}>Doctor</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase", textAlign: "right" }}>Cost</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase", textAlign: "right" }}>Paid</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase", textAlign: "right" }}>Pending</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: "40px", textAlign: "center", color: C.slateL }}>No package billing records found.</td>
                  </tr>
                ) : (
                  filteredPackages.map((item, index) => {
                    const badge = getPackageStatusBadge(item);
                    return (
                      <tr key={index} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.01)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontWeight: "600", color: C.black }}>{item.treatment_name}</div>
                          <div style={{ fontSize: "11px", color: C.slateL }}>Case ID: #{item.case_id} • {formatDate(item.case_created_at)}</div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ color: C.black, fontWeight: "500" }}>{item.patient_name}</div>
                          <div style={{ fontSize: "12px", color: C.slateL }}>{item.patient_email}</div>
                        </td>
                        <td style={{ padding: "16px", color: C.black, fontSize: "14px" }}>
                          🏥 {item.hospital_name}
                        </td>
                        <td style={{ padding: "16px", color: C.black, fontSize: "14px" }}>
                          👨‍⚕️ {item.doctor_name}
                        </td>
                        <td style={{ padding: "16px", textAlign: "right", color: C.black, fontWeight: "600" }}>
                          ${parseFloat(item.estimated_cost).toLocaleString()}
                        </td>
                        <td style={{ padding: "16px", textAlign: "right", color: C.green, fontWeight: "600" }}>
                          ${parseFloat(item.paid_amount).toLocaleString()}
                        </td>
                        <td style={{ padding: "16px", textAlign: "right", color: parseFloat(item.pending_amount) > 0 ? C.red : C.green, fontWeight: "600" }}>
                          ${parseFloat(item.pending_amount).toLocaleString()}
                        </td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            color: badge.color,
                            backgroundColor: badge.bg,
                            display: "inline-block"
                          }}>
                            {badge.text}
                          </span>
                        </td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <button
                            onClick={() => setSelectedItem(item)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: `1px solid ${C.border}`,
                              background: C.white,
                              color: C.teal,
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.tealTransparent; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.white; }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Transactions Table */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: C.navy, borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase" }}>Transaction Info</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase" }}>Initiated By</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase" }}>Details</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase" }}>Gateway</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase", textAlign: "right" }}>Amount</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "16px", fontSize: "12px", fontWeight: "600", color: C.slateL, textTransform: "uppercase" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: C.slateL }}>No transactions matches the criteria.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((item, index) => {
                    let statusColor = C.slate;
                    let statusBg = "#F3F4F6";
                    if (item.status === "completed") { statusColor = C.green; statusBg = "rgba(46,204,138,0.15)"; }
                    else if (item.status === "pending") { statusColor = C.orange; statusBg = "rgba(249,115,22,0.15)"; }
                    else if (item.status === "failed" || item.status === "refunded") { statusColor = C.red; statusBg = "rgba(224,82,82,0.15)"; }

                    return (
                      <tr key={index} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.01)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontWeight: "600", color: C.black }}>{item.transaction_id || `DB-ID: #${item.payment_db_id}`}</div>
                          {item.order_id && <div style={{ fontSize: "11px", color: C.slateL }}>Order: {item.order_id}</div>}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ color: C.black, fontWeight: "500" }}>{item.patient_name || item.user_name}</div>
                          <div style={{ fontSize: "12px", color: C.slateL }}>{item.user_email}</div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ color: C.black, fontSize: "13px", fontWeight: "500" }}>{item.payment_type || "Direct Transfer"}</div>
                          <div style={{ fontSize: "11px", color: C.slateL }}>Purpose: {item.payment_purpose}</div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{
                            padding: "3px 6px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backgroundColor: "rgba(59,130,246,0.1)",
                            color: C.blue,
                            textTransform: "uppercase"
                          }}>
                            {item.gateway}
                          </span>
                        </td>
                        <td style={{ padding: "16px", textAlign: "right", color: C.black, fontWeight: "700" }}>
                          {item.currency?.toUpperCase() || "USD"} {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            color: statusColor,
                            backgroundColor: statusBg,
                            display: "inline-block",
                            textTransform: "capitalize"
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: "16px", color: C.slate, fontSize: "13px" }}>
                          {formatDate(item.completed_at || item.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: C.white,
            borderRadius: "16px",
            maxWidth: "600px",
            width: "100%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: `1px solid ${C.border}`,
            overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: C.navy
            }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: C.black, margin: "0 0 4px 0" }}>
                  Case Billing Details
                </h3>
                <span style={{ fontSize: "12px", color: C.slateL }}>Case Reference ID: #{selectedItem.case_id}</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: "none", border: "none", color: C.slate, cursor: "pointer", display: "flex", padding: "4px", borderRadius: "50%", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Package Detail info */}
              <div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", color: C.slateL, fontWeight: "600", letterSpacing: "0.5px", marginBottom: "6px" }}>Chosen Treatment Package</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: C.black }}>{selectedItem.treatment_name}</div>
              </div>

              {/* Grid 2-column info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", color: C.slateL, fontWeight: "600", letterSpacing: "0.5px", marginBottom: "4px" }}>Assigned Hospital</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: C.black }}>🏥 {selectedItem.hospital_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", color: C.slateL, fontWeight: "600", letterSpacing: "0.5px", marginBottom: "4px" }}>Assigned Doctor</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: C.black }}>👨‍⚕️ {selectedItem.doctor_name}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", color: C.slateL, fontWeight: "600", letterSpacing: "0.5px", marginBottom: "4px" }}>Patient Details</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: C.black }}>{selectedItem.patient_name}</div>
                  <div style={{ fontSize: "12px", color: C.slateL }}>{selectedItem.patient_email}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", color: C.slateL, fontWeight: "600", letterSpacing: "0.5px", marginBottom: "4px" }}>Case Status</div>
                  <div style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: "rgba(59,130,246,0.1)",
                    color: C.blue,
                    display: "inline-block",
                    marginTop: "2px"
                  }}>
                    {selectedItem.case_status}
                  </div>
                </div>
              </div>

              {/* Financial Calculation Progress Card */}
              <div style={{
                background: C.navy,
                borderRadius: "12px",
                border: `1px solid ${C.border}`,
                padding: "16px",
                marginTop: "8px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: C.slateL }}>Total Estimated Cost</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: C.black }}>${parseFloat(selectedItem.estimated_cost).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: C.slateL }}>Total Paid</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: C.green }}>${parseFloat(selectedItem.paid_amount).toLocaleString()}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: "8px", borderRadius: "4px", backgroundColor: "#E5E7EB", overflow: "hidden", marginBottom: "12px" }}>
                  <div style={{
                    width: `${Math.min(100, (parseFloat(selectedItem.paid_amount) / Math.max(1, parseFloat(selectedItem.estimated_cost))) * 100)}%`,
                    height: "100%",
                    backgroundColor: C.green,
                    borderRadius: "4px"
                  }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: C.slateL }}>Pending Outstanding:</span>
                  <span style={{ fontSize: "16px", fontWeight: "700", color: parseFloat(selectedItem.pending_amount) > 0 ? C.red : C.green }}>
                    ${parseFloat(selectedItem.pending_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "16px 24px",
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "flex-end",
              background: C.navy,
              gap: "12px"
            }}>
              {parseFloat(selectedItem.pending_amount) > 0 && (
                <button
                  onClick={() => handleSendPaymentReminder(selectedItem)}
                  disabled={sendingEmail}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: C.teal,
                    color: C.white,
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    opacity: sendingEmail ? 0.7 : 1
                  }}
                >
                  {sendingEmail ? "Sending..." : "Send Reminder Email"}
                </button>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  color: C.black,
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
