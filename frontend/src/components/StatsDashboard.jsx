import { useState, useEffect } from "react";

function StatsDashboard({ apiUrl, refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line
  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tickets/stats/`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ color: "#6b6b6b" }}>Loading stats...</p>;
  if (!stats) return null;

  const card = { background: "#fff", border: "1px solid #e5e5e0", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };

  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Overview</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "12px" }}>
        <div style={card}>
          <p style={{ fontSize: "13px", color: "#6b6b6b" }}>Total Tickets</p>
          <p style={{ fontSize: "28px", fontWeight: "600", marginTop: "4px" }}>{stats.total_tickets}</p>
        </div>
        <div style={card}>
          <p style={{ fontSize: "13px", color: "#6b6b6b" }}>Open</p>
          <p style={{ fontSize: "28px", fontWeight: "600", marginTop: "4px", color: "#2563eb" }}>{stats.open_tickets}</p>
        </div>
        <div style={card}>
          <p style={{ fontSize: "13px", color: "#6b6b6b" }}>Avg / Day</p>
          <p style={{ fontSize: "28px", fontWeight: "600", marginTop: "4px" }}>{stats.avg_tickets_per_day}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={card}>
          <p style={{ fontSize: "13px", color: "#6b6b6b", marginBottom: "12px", fontWeight: "500" }}>By Priority</p>
          {Object.entries(stats.priority_breakdown).map(([key, val]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
              <span style={{ textTransform: "capitalize" }}>{key}</span>
              <span style={{ fontWeight: "600" }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={card}>
          <p style={{ fontSize: "13px", color: "#6b6b6b", marginBottom: "12px", fontWeight: "500" }}>By Category</p>
          {Object.entries(stats.category_breakdown).map(([key, val]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}>
              <span style={{ textTransform: "capitalize" }}>{key}</span>
              <span style={{ fontWeight: "600" }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;