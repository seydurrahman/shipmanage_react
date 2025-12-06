import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function ProjectForm() {
  const [formData, setFormData] = useState({
    name: "",
    ship: "",
    daily_rate: "",
    start_date: "",
    end_date: "",
  });
  const [ships, setShips] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [projects, setProjects] = useState([]);
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

  const resetForm = () => {
    setFormData({
      name: "",
      ship: "",
      daily_rate: "",
      start_date: "",
      end_date: "",
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (project) => {
    setFormData(project);
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await api.delete(`projects/${projectId}/`);
      alert("Project deleted successfully!");
      fetchProjects();
    } catch (err) {
      console.error("Delete error:", err);
      alert(
        "Error deleting project: " + (err.response?.data?.detail || err.message)
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`projects/${editingId}/`, formData);
        alert("Project updated!");
      } else {
        await api.post("projects/", formData);
        alert("Project created");
      }
      resetForm();
      fetchProjects();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.detail || err.message));
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
            {editingId ? "Edit Project" : "Add Project"}
          </h2>

          <select
            name="ship"
            value={formData.ship}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Ship</option>
            {ships.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            name="name"
            placeholder="Project Name"
            className="w-full border p-2 rounded"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            name="daily_rate"
            placeholder="Daily Rate"
            type="number"
            className="w-full border p-2 rounded"
            value={formData.daily_rate}
            onChange={handleChange}
            required
          />

          <input
            name="start_date"
            type="date"
            className="w-full border p-2 rounded"
            value={formData.start_date}
            onChange={handleChange}
            required
          />

          <input
            name="end_date"
            type="date"
            className="w-full border p-2 rounded"
            value={formData.end_date}
            onChange={handleChange}
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
        <div className="relative max-w-4xl mx-auto p-6 bg-white shadow-lg rounded">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Projects List</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add New Project
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Ship</th>
                  <th className="border border-gray-300 p-2">Daily Rate</th>
                  <th className="border border-gray-300 p-2">Start Date</th>
                  <th className="border border-gray-300 p-2">End Date</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const ship = ships.find((s) => s.id === project.ship);
                  return (
                    <tr key={project.id}>
                      <td className="border border-gray-300 p-2">
                        {project.name}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {ship?.name || "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        Tk {project.daily_rate}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {project.start_date}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {project.end_date || "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
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
