import { useState } from "react";

function TicketForm({ apiUrl, onTicketCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleDescriptionBlur = async () => {
    if (!description.trim()) return;
    setClassifying(true);
    try {
      const response = await fetch(`${apiUrl}/api/tickets/classify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await response.json();
      setCategory(data.suggested_category);
      setPriority(data.suggested_priority);
    } catch (err) {
      console.error("Classify failed:", err);
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);
    try {
      const response = await fetch(`${apiUrl}/api/tickets/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, priority }),
      });
      if (!response.ok) {
        const errData = await response.json();
        setError(JSON.stringify(errData));
        return;
      }
      const newTicket = await response.json();
      onTicketCreated(newTicket);
      setTitle("");
      setDescription("");
      setCategory("general");
      setPriority("medium");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    display: "block", width: "100%", padding: "10px 12px",
    border: "1px solid #e5e5e0", borderRadius: "8px",
    fontSize: "14px", marginTop: "6px", background: "#fff",
    outline: "none", transition: "border-color 0.2s"
  };

  const labelStyle = {
    fontSize: "13px", fontWeight: "500", color: "#6b6b6b"
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e0", borderRadius: "10px", padding: "24px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Submit a Ticket</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            placeholder="Brief summary of the issue"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            required
            rows={4}
            placeholder="Describe your issue in detail..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
          {classifying && (
            <p style={{ fontSize: "12px", color: "#2563eb", marginTop: "6px" }}>
              ✦ Getting AI suggestions...
            </p>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div>
            <label style={labelStyle}>
              Category {classifying && <span style={{ color: "#2563eb" }}>•</span>}
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>
              Priority {classifying && <span style={{ color: "#2563eb" }}>•</span>}
            </label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: "13px", color: "#dc2626", marginBottom: "12px" }}>{error}</p>
        )}
        {success && (
          <p style={{ fontSize: "13px", color: "#16a34a", marginBottom: "12px" }}>✓ Ticket submitted successfully</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 20px", background: submitting ? "#93c5fd" : "#2563eb",
            color: "#fff", border: "none", borderRadius: "8px",
            fontSize: "14px", fontWeight: "500", cursor: submitting ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}

export default TicketForm;