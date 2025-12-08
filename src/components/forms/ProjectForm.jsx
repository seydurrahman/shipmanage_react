// src/components/forms/ProjectForm.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function ProjectForm() {
  const emptyForm = {
    name: "",
    ship: "",
    budget: "",
    start_date: "",
    end_date: "",
    status: "",
    is_active: true,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [projects, setProjects] = useState([]);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchShips();
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

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("projects/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects", err);
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

  const handleEdit = (p) => {
    setFormData({
      name: p.name,
      ship: p.ship || "",
      budget: p.budget,
      start_date: p.start_date,
      end_date: p.end_date || "",
      status: p.status || "",
      is_active: p.is_active,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`projects/${id}/`);
      alert("Project deleted!");
      fetchProjects();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let rawBudget = String(formData.budget).replace(/,/g, "");
      let budget = rawBudget ? parseFloat(rawBudget) : null;
      if (budget && budget < 0) {
        alert("Budget cannot be negative.");
        setSubmitting(false);
        return;
      }
      if (budget) {
        budget = Math.round(budget * 100) / 100;
      }

      const payload = {
  name: formData.name,
  ship: formData.ship || null,
  budget: budget ?? null,
  start_date: formData.start_date,
  end_date: formData.end_date || null,
  status: formData.status || null,
  is_active: formData.is_active,
  daily_rate: formData.daily_rate || 0,   // ← ADD THIS LINE
};


      if (editingId) {
        await api.put(`projects/${editingId}/`, payload);
        alert("Project updated!");
      } else {
        await api.post("projects/", payload);
        alert("Project created!");
      }

      resetForm();
      fetchProjects();
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
              {editingId ? "Edit Project" : "Add Project"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="md:hidden underline text-sm"
            >
              Back
            </button>
          </div>

          <input
            name="name"
            placeholder="Project Name"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <select
            name="ship"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.ship}
            onChange={handleChange}
          >
            <option value="">Select Ship (optional)</option>
            {ships.map((ship) => (
              <option key={ship.id} value={ship.id}>
                {ship.name}
              </option>
            ))}
          </select>

          <input
            name="budget"
            type="number"
            step="0.01"
            placeholder="Budget (Tk)"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.budget}
            onChange={handleChange}
          />
<input
  name="daily_rate"
  type="number"
  step="0.01"
  placeholder="Daily Rate (Tk)"
  className="w-full p-2 rounded bg-white/70 text-black"
  value={formData.daily_rate || ""}
  onChange={handleChange}
  required
/>
          <input
            type="date"
            name="start_date"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.start_date}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="end_date"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.end_date}
            onChange={handleChange}
          />

          <input
            name="status"
            placeholder="Status (e.g. Ongoing, Completed)"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.status}
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
            <h2 className="text-xl font-bold">Projects List</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              + Add Project
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-white min-w-[900px]">
                  <thead className="bg-white/20">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Ship</th>
                      <th className="p-2 text-left">Budget</th>
                      <th className="p-2 text-left">Start</th>
                      <th className="p-2 text-left">End</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Active</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-white/10">
                        <td className="p-2">{p.name}</td>
                        <td className="p-2">{getShipName(p.ship)}</td>
                        <td className="p-2">
                          {p.budget
                            ? `Tk ${parseFloat(p.budget).toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="p-2">{p.start_date}</td>
                        <td className="p-2">{p.end_date || "-"}</td>
                        <td className="p-2">{p.status || "-"}</td>
                        <td className="p-2">
                          {p.is_active ? "Active" : "Inactive"}
                        </td>
                        <td className="p-2 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="px-3 py-1 bg-blue-500 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
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
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="glass-card p-4 text-white rounded-lg shadow-md"
                  >
                    <h3 className="text-lg font-semibold mb-1">{p.name}</h3>
                    <p>
                      <span className="font-semibold">Ship:</span>{" "}
                      {getShipName(p.ship)}
                    </p>
                    <p>
                      <span className="font-semibold">Budget:</span>{" "}
                      {p.budget ? `Tk ${parseFloat(p.budget).toFixed(2)}` : "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Start:</span>{" "}
                      {p.start_date}
                    </p>
                    <p>
                      <span className="font-semibold">End:</span>{" "}
                      {p.end_date || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {p.status || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Active:</span>{" "}
                      {p.is_active ? "Yes" : "No"}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(p)}
                        className="flex-1 bg-blue-500 text-white py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
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
