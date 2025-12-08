// src/components/forms/ExpenseForm.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function ExpenseForm() {
  const emptyForm = {
    ship: "",
    amount: "",
    date: "",
    description: "",
    category: "",
    is_active: true,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchShips();
    fetchExpenses();
  }, []);

  const fetchShips = async () => {
    try {
      const res = await api.get("ships/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setShips(data);
    } catch (err) {
      console.error("Error fetching ships", err);
    }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get("expenses/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setFormData({
      ship: item.ship || "",
      amount: item.amount,
      date: item.date,
      description: item.description || "",
      category: item.category || "",
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`expenses/${id}/`);
      alert("Expense deleted!");
      fetchExpenses();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let rawAmount = String(formData.amount).replace(/,/g, "");
      let amount = rawAmount ? parseFloat(rawAmount) : null;
      if (!amount || amount <= 0) {
        alert("Amount must be a positive number.");
        setSubmitting(false);
        return;
      }
      amount = Math.round(amount * 100) / 100;

      const payload = { ...formData, amount };

      if (editingId) {
        await api.put(`expenses/${editingId}/`, payload);
        alert("Expense updated!");
      } else {
        await api.post("expenses/", payload);
        alert("Expense created!");
      }

      resetForm();
      fetchExpenses();
      setShowForm(false);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getShipName = (id) => ships.find((s) => s.id === id)?.name || "N/A";

  return (
    <div
      style={{
        backgroundImage: `url(/titanic-iceberg.jpg)`,
      }}
      className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative"
    >
      <div className="absolute inset-0 bg-black/30"></div>

      {showForm ? (
        <form
          onSubmit={submit}
          className="relative glass-card max-w-lg mx-auto p-6 space-y-4 text-white"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">
              {editingId ? "Edit Expense" : "Add Expense"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="md:hidden underline text-sm"
            >
              Back
            </button>
          </div>

          {/* Ship */}
          <select
            name="ship"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.ship}
            onChange={handleChange}
            required
          >
            <option value="">Select Ship</option>
            {ships.map((ship) => (
              <option key={ship.id} value={ship.id}>
                {ship.name}
              </option>
            ))}
          </select>

          {/* Amount */}
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount (Tk)"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          {/* Date */}
          <input
            type="date"
            name="date"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.date}
            onChange={handleChange}
            required
          />

          {/* Category */}
          <input
            name="category"
            placeholder="Category (optional)"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.category}
            onChange={handleChange}
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Description"
            className="w-full p-2 rounded bg-white/70 text-black"
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />

          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Active
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
            >
              {submitting ? "Saving..." : editingId ? "Update" : "Submit"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="relative glass-card max-w-5xl mx-auto p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Expenses List</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              + Add Expense
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : expenses.length === 0 ? (
            <p>No expenses found.</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-white min-w-[800px]">
                  <thead className="bg-white/20">
                    <tr>
                      <th className="p-2 text-left">Ship</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-white/10">
                        <td className="p-2">{getShipName(exp.ship)}</td>
                        <td className="p-2">
                          Tk {parseFloat(exp.amount || 0).toFixed(2)}
                        </td>
                        <td className="p-2">{exp.date}</td>
                        <td className="p-2">{exp.category || "-"}</td>
                        <td className="p-2">
                          {exp.is_active ? "Active" : "Inactive"}
                        </td>
                        <td className="p-2 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(exp)}
                            className="px-3 py-1 bg-blue-500 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="px-3 py-1 bg-red-500 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="glass-card p-4 text-white rounded-lg shadow-md"
                  >
                    <h3 className="text-lg font-semibold mb-1">
                      {getShipName(exp.ship)}
                    </h3>
                    <p>
                      <span className="font-semibold">Amount:</span> Tk{" "}
                      {parseFloat(exp.amount || 0).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-semibold">Date:</span> {exp.date}
                    </p>
                    <p>
                      <span className="font-semibold">Category:</span>{" "}
                      {exp.category || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {exp.is_active ? "Active" : "Inactive"}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="flex-1 bg-blue-500 text-white py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="flex-1 bg-red-500 text-white py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
