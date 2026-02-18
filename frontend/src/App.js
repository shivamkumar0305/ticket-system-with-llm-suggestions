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
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h1>Support Ticket System</h1>
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