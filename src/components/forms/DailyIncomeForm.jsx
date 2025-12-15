// src/components/forms/DailyIncomeForm.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function DailyIncomeForm() {
  const emptyForm = {
    ship: "",
    amount: "",
    project: "",
    date: "",
    description: "",
    is_active: true,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [incomes, setIncomes] = useState([]);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchShips();
    fetchIncomes();
    fetchProjects();
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

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const res = await api.get("incomes/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setIncomes(data);
    } catch (err) {
      console.error("Error fetching incomes", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
  const res = await api.get("projects/");
  setProjects(Array.isArray(res.data) ? res.data : res.data.results || []);
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
      project: item.project || "",
      amount: item.amount,
      date: item.date,
      description: item.description || "",
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this income?")) return;
    try {
      await api.delete(`incomes/${id}/`);
      alert("Income deleted!");
      fetchIncomes();
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

      const payload = { ...formData, amount, project: formData.project || null };

      if (editingId) {
        await api.put(`incomes/${editingId}/`, payload);
        alert("Income updated!");
      } else {
        await api.post("incomes/", payload);
        alert("Income created!");
      }

      resetForm();
      fetchIncomes();
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
              {editingId ? "Edit Daily Income" : "Add Daily Income"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="md:hidden underline text-sm"
            >
              Back
            </button>
          </div>

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
          <select
            name="project"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.project}
            onChange={handleChange}
            required
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

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

          <input
            type="date"
            name="date"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
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
            <h2 className="text-xl font-bold">Daily Income List</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              + Add Income
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : incomes.length === 0 ? (
            <p>No incomes found.</p>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-white min-w-[800px]">
                  <thead className="bg-white/20">
                    <tr>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Ship</th>
                      <th className="p-2 text-left">Rate</th>
                      <th className="p-2 text-left">Sands Amount</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomes.map((inc) => (
                      <tr key={inc.id} className="hover:bg-white/10">
                        <td className="p-2">{getShipName(inc.ship)}</td>
                        <td className="p-2">
                          Tk {parseFloat(inc.amount || 0).toFixed(2)}
                        </td>
                        <td className="p-2">{inc.date}</td>
                        <td className="p-2">
                          {inc.description?.slice(0, 40) || "-"}
                        </td>
                        <td className="p-2">
                          {inc.is_active ? "Active" : "Inactive"}
                        </td>
                        <td className="p-2 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(inc)}
                            className="px-3 py-1 bg-blue-500 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(inc.id)}
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

              <div className="md:hidden space-y-4">
                {incomes.map((inc) => (
                  <div
                    key={inc.id}
                    className="glass-card p-4 text-white rounded-lg shadow-md"
                  >
                    <h3 className="text-lg font-semibold mb-1">
                      {getShipName(inc.ship)}
                    </h3>
                    <p>
                      <span className="font-semibold">Amount:</span> Tk{" "}
                      {parseFloat(inc.amount || 0).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-semibold">Date:</span> {inc.date}
                    </p>
                    {inc.description && (
                      <p>
                        <span className="font-semibold">Desc:</span>{" "}
                        {inc.description}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {inc.is_active ? "Active" : "Inactive"}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(inc)}
                        className="flex-1 bg-blue-500 text-white py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(inc.id)}
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
