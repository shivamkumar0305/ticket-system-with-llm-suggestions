import { useState } from "react";

const priorityColors = {
  low: "#16a34a",
  medium: "#d97706",
  high: "#ea580c",
  critical: "#dc2626",
};

const statusColors = {
  open: "#2563eb",
  in_progress: "#d97706",
  resolved: "#16a34a",
  closed: "#6b6b6b",
};

function TicketList({ apiUrl, tickets, fetchTickets, onTicketUpdated }) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const handleFilterChange = (newFilters) => {
    const filters = {
      search,
      category: filterCategory,
      priority: filterPriority,
      status: filterStatus,
      ...newFilters,
    };
    Object.keys(filters).forEach((key) => {
      if (!filters[key]) delete filters[key];
    });
    fetchTickets(filters);
  };

  const handleStatusChange = async (ticket, newStatus) => {
    try {
      const response = await fetch(`${apiUrl}/api/tickets/${ticket.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await response.json();
      onTicketUpdated(updated);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const selectStyle = {
    padding: "8px 12px", border: "1px solid #e5e5e0",
    borderRadius: "8px", fontSize: "13px", background: "#fff",
    color: "#1a1a1a", outline: "none", cursor: "pointer"
  };

  return (
    <div>
      <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Tickets
      </h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); handleFilterChange({ search: e.target.value }); }}
          style={{ ...selectStyle, flex: "1", minWidth: "180px" }}
        />
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); handleFilterChange({ category: e.target.value }); }} style={selectStyle}>
          <option value="">All Categories</option>
          <option value="billing">Billing</option>
          <option value="technical">Technical</option>
          <option value="account">Account</option>
          <option value="general">General</option>
        </select>
        <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); handleFilterChange({ priority: e.target.value }); }} style={selectStyle}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange({ status: e.target.value }); }} style={selectStyle}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {tickets.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px", color: "#6b6b6b", background: "#fff", borderRadius: "10px", border: "1px solid #e5e5e0" }}>
          No tickets found.
        </div>
      )}

      {tickets.map((ticket) => (
        <div key={ticket.id} style={{ background: "#fff", border: "1px solid #e5e5e0", borderRadius: "10px", padding: "20px", marginBottom: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "600" }}>{ticket.title}</h3>
            <small style={{ color: "#6b6b6b", fontSize: "12px", whiteSpace: "nowrap", marginLeft: "12px" }}>
              {new Date(ticket.created_at).toLocaleDateString()}
            </small>
          </div>

          <p style={{ fontSize: "13px", color: "#6b6b6b", marginBottom: "12px" }}>
            {ticket.description.length > 150 ? ticket.description.slice(0, 150) + "..." : ticket.description}
          </p>

          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "20px", background: "#f0f0f0", color: "#1a1a1a", textTransform: "capitalize" }}>
              {ticket.category}
            </span>
            <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "20px", background: priorityColors[ticket.priority] + "15", color: priorityColors[ticket.priority], fontWeight: "500", textTransform: "capitalize" }}>
              {ticket.priority}
            </span>
            <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "20px", background: statusColors[ticket.status] + "15", color: statusColors[ticket.status], fontWeight: "500" }}>
              {ticket.status.replace("_", " ")}
            </span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(ticket, e.target.value)}
              style={{ ...selectStyle, fontSize: "12px", padding: "3px 8px", marginLeft: "auto" }}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TicketList;