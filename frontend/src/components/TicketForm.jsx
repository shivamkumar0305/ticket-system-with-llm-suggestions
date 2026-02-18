import { useState, useRef } from "react";

function TicketForm({ apiUrl, onTicketCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Track if user manually overrides AI suggestions
  const userModifiedCategory = useRef(false);
  const userModifiedPriority = useRef(false);

  // Called when user leaves the description field
  const handleDescriptionBlur = async () => {
    if (!description.trim()) return;

    setClassifying(true);

    try {
      const response = await fetch(`${apiUrl}/api/tickets/classify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) return;

      const data = await response.json();

      // Only apply AI suggestions if user has not overridden them
      if (!userModifiedCategory.current && data.suggested_category) {
        setCategory(data.suggested_category);
      }

      if (!userModifiedPriority.current && data.suggested_priority) {
        setPriority(data.suggested_priority);
      }

    } catch (err) {
      // LLM failure should not block submission
      console.error("AI classification failed:", err);
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/api/tickets/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(JSON.stringify(errData));
        return;
      }

      const newTicket = await response.json();
      onTicketCreated(newTicket);

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("general");
      setPriority("medium");

      userModifiedCategory.current = false;
      userModifiedPriority.current = false;

    } catch (err) {
      setError("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "16px",
        marginBottom: "24px",
        borderRadius: "8px",
      }}
    >
      <h2>Submit a Ticket</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "12px" }}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            required
            rows={4}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "4px",
            }}
          />
          {classifying && (
            <p style={{ color: "gray" }}>Getting AI suggestions...</p>
          )}
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Category {classifying && "(AI analyzing...)"}</label>
          <select
            value={category}
            onChange={(e) => {
              userModifiedCategory.current = true;
              setCategory(e.target.value);
            }}
            style={{
              display: "block",
              padding: "8px",
              marginTop: "4px",
            }}
          >
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="general">General</option>
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Priority {classifying && "(AI analyzing...)"}</label>
          <select
            value={priority}
            onChange={(e) => {
              userModifiedPriority.current = true;
              setPriority(e.target.value);
            }}
            style={{
              display: "block",
              padding: "8px",
              marginTop: "4px",
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          {submitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}

export default TicketForm;
