import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function DailyIncomeForm() {
  const [formData, setFormData] = useState({
    ship: "",
    project: "",
    total_sands: "",
    rate: "",
    amount: "",
    date: "",
  });
  const [ships, setShips] = useState([]);
  const [projects, setProjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingShips, setLoadingShips] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchShips();
    fetchProjects();
    fetchIncomes();
  }, []);

  const fetchShips = async () => {
    setLoadingShips(true);
    try {
      const res = await api.get("ships/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setShips(data);
    } catch (err) {
      console.error("Error fetching ships", err);
    } finally {
      setLoadingShips(false);
    }
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await api.get("projects/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoadingProjects(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    // Auto-calculate amount when total_sands or rate changes
    if (name === "total_sands" || name === "rate") {
      const sands = parseFloat(updatedFormData.total_sands);
      const rate = parseFloat(updatedFormData.rate);
      if (!isNaN(sands) && !isNaN(rate)) {
        updatedFormData.amount = (sands * rate).toFixed(2);
      } else {
        updatedFormData.amount = "";
      }
    }

    setFormData(updatedFormData);
  };

  const resetForm = () => {
    setFormData({
      ship: "",
      project: "",
      total_sands: "",
      rate: "",
      amount: "",
      date: "",
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (income) => {
    const notes = income.notes || "";
    const totalSandsMatch = notes.match(/Total Sands: ([\d.]+)/);
    const rateMatch = notes.match(/Rate: ([\d.]+)/);
    setFormData({
      ship: income.ship,
      project: income.project,
      total_sands: totalSandsMatch ? totalSandsMatch[1] : "",
      rate: rateMatch ? rateMatch[1] : "",
      amount: income.amount,
      date: income.date,
    });
    setEditingId(income.id);
    setShowForm(true);
  };

  const handleDelete = async (incomeId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this daily income? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await api.delete(`incomes/${incomeId}/`);
      alert("Daily income deleted successfully!");
      fetchIncomes();
    } catch (err) {
      console.error("Delete error:", err);
      alert(
        "Error deleting daily income: " +
          (err.response?.data?.detail || err.message)
      );
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate required fields
      if (!formData.ship) {
        alert("Please select a ship.");
        setSubmitting(false);
        return;
      }
      if (!formData.project) {
        alert("Please select a project.");
        setSubmitting(false);
        return;
      }
      if (!formData.date) {
        alert("Please select a date.");
        setSubmitting(false);
        return;
      }
      const sands = parseFloat(String(formData.total_sands));
      const rate = parseFloat(String(formData.rate));
      if (isNaN(sands) || sands <= 0) {
        alert("Please provide a valid Total Sands (positive number).");
        setSubmitting(false);
        return;
      }
      if (isNaN(rate) || rate <= 0) {
        alert("Please provide a valid Rate (positive number).");
        setSubmitting(false);
        return;
      }

      const payload = {
        ship: parseInt(formData.ship),
        project: parseInt(formData.project),
        amount: parseFloat(formData.amount),
        date: formData.date,
        notes: `Total Sands: ${sands}, Rate: ${rate}`,
      };

      if (editingId) {
        await api.put(`incomes/${editingId}/`, payload);
        alert("Daily income updated!");
      } else {
        await api.post("/incomes/", payload);
        await api.post("incomes/", payload);
        alert("Daily income recorded");
      }
      resetForm();
      fetchIncomes();
      setShowForm(false);
    } catch (err) {
      console.error("DailyIncome error:", err.response || err);
      const serverData = err.response?.data;
      const message = serverData
        ? JSON.stringify(serverData)
        : err.response?.data?.detail || err.message;
      alert("Error recording daily income: " + message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6"
      style={{
        backgroundImage: `url(/titanic-iceberg.jpg)`,
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      {showForm ? (
        <form
          onSubmit={submit}
          className="relative max-w-lg mx-auto space-y-4 p-6 bg-white shadow-lg rounded"
        >
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Daily Income" : "Add Daily Income"}
          </h2>

          <select
            name="ship"
            value={formData.ship}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            disabled={loadingShips}
            required
          >
            <option value="">Select Ship</option>
            {ships.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            name="project"
            value={formData.project}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            disabled={loadingProjects}
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
            name="total_sands"
            placeholder="Total Sands"
            type="number"
            step="0.01"
            className="w-full border p-2 rounded"
            value={formData.total_sands}
            onChange={handleChange}
            required
          />

          <input
            name="rate"
            placeholder="Rate (integer number)"
            type="number"
            step="1"
            className="w-full border p-2 rounded"
            value={formData.rate}
            onChange={handleChange}
            required
          />

          <input
            name="amount"
            placeholder="Amount (Auto-calculated)"
            type="number"
            step="0.01"
            className="w-full border p-2 rounded bg-gray-100"
            value={formData.amount}
            readOnly
          />

          <input
            name="date"
            type="date"
            className="w-full border p-2 rounded"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded"
            >
              {submitting ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-500 text-white py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="relative max-w-5xl mx-auto p-6 bg-white shadow-lg rounded">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Daily Income List</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add New Income
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : incomes.length === 0 ? (
            <p>No daily incomes found.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2">Ship</th>
                  <th className="border border-gray-300 p-2">Project</th>
                  <th className="border border-gray-300 p-2">Total Sands</th>
                  <th className="border border-gray-300 p-2">Rate</th>
                  <th className="border border-gray-300 p-2">Amount</th>
                  <th className="border border-gray-300 p-2">Date</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => {
                  const ship = ships.find((s) => s.id === income.ship);
                  const project = projects.find((p) => p.id === income.project);
                  const notes = income.notes || "";
                  const totalSandsMatch = notes.match(/Total Sands: ([\d.]+)/);
                  const rateMatch = notes.match(/Rate: ([\d.]+)/);
                  return (
                    <tr key={income.id}>
                      <td className="border border-gray-300 p-2">
                        {ship?.name || "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {project?.name || "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {totalSandsMatch ? totalSandsMatch[1] : "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {rateMatch ? rateMatch[1] : "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        Tk {parseFloat(income.amount).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {income.date}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => handleEdit(income)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
