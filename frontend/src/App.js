import { useState, useEffect } from "react";
import TicketForm from "./components/TicketForm";
import TicketList from "./components/TicketList";
import StatsDashboard from "./components/StatsDashboard";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function App() {
  const [tickets, setTickets] = useState([]);
  const [refreshStats, setRefreshStats] = useState(0);

  // fetch all tickets when app loads
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/api/tickets/?${params}`);
    const data = await response.json();
    setTickets(data);
  };

  const onTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setRefreshStats((prev) => prev + 1); // trigger stats refresh
  };

  const onTicketUpdated = (updatedTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#1a1a1a" }}>
          Support Tickets
        </h1>
        <p style={{ color: "#6b6b6b", marginTop: "4px" }}>
          Manage and track support requests
        </p>
      </div>
      <StatsDashboard apiUrl={API_URL} refreshTrigger={refreshStats} />
      <TicketForm apiUrl={API_URL} onTicketCreated={onTicketCreated} />
      <TicketList
        apiUrl={API_URL}
        tickets={tickets}
        fetchTickets={fetchTickets}
        onTicketUpdated={onTicketUpdated}
      />
    </div>
  );
}

export default App;