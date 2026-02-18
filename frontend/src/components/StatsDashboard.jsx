import { useState, useEffect } from "react";

function StatsDashboard({ apiUrl, refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading stats...</p>;
  if (!stats) return null;

  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", marginBottom: "24px", borderRadius: "8px" }}>
      <h2>Dashboard</h2>

      <div style={{ display: "flex", gap: "24px", marginBottom: "16px" }}>
        <div>
          <strong>Total Tickets</strong>
          <p>{stats.total_tickets}</p>
        </div>
        <div>
          <strong>Open Tickets</strong>
          <p>{stats.open_tickets}</p>
        </div>
        <div>
          <strong>Avg Per Day</strong>
          <p>{stats.avg_tickets_per_day}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "48px" }}>
        <div>
          <strong>By Priority</strong>
          {Object.entries(stats.priority_breakdown).map(([key, val]) => (
            <p key={key}>{key}: {val}</p>
          ))}
        </div>
        <div>
          <strong>By Category</strong>
          {Object.entries(stats.category_breakdown).map(([key, val]) => (
            <p key={key}>{key}: {val}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;