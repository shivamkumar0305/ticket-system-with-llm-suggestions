import { useState } from "react";

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
      ...newFilters, // override whichever filter just changed
    };

    // remove empty filters so URL doesn't have ?category=&priority=
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
      onTicketUpdated(updated); // tell App.js to update this ticket in the list
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div>
      <h2>All Tickets</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleFilterChange({ search: e.target.value });
          }}
          style={{ padding: "8px" }}
        />

        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            handleFilterChange({ category: e.target.value });
          }}
          style={{ padding: "8px" }}
        >
          <option value="">All Categories</option>
          <option value="billing">Billing</option>
          <option value="technical">Technical</option>
          <option value="account">Account</option>
          <option value="general">General</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => {
            setFilterPriority(e.target.value);
            handleFilterChange({ priority: e.target.value });
          }}
          style={{ padding: "8px" }}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            handleFilterChange({ status: e.target.value });
          }}
          style={{ padding: "8px" }}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Ticket Cards */}
      {tickets.length === 0 && <p>No tickets found.</p>}

      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0 }}>{ticket.title}</h3>
            <small style={{ color: "gray" }}>
              {new Date(ticket.created_at).toLocaleString()}
            </small>
          </div>

          <p style={{ color: "#555", marginTop: "8px" }}>
            {ticket.description.length > 150
              ? ticket.description.slice(0, 150) + "..."
              : ticket.description}
          </p>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <span>Category: <strong>{ticket.category}</strong></span>
            <span>Priority: <strong>{ticket.priority}</strong></span>
            <span>Status: </span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(ticket, e.target.value)}
              style={{ padding: "4px 8px" }}
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