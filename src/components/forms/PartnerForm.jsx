// src/components/forms/PartnerForm.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function PartnerForm() {
  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    share_percentage: "",
    ship: "",
    is_active: true,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [partners, setPartners] = useState([]);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchShips();
    fetchPartners();
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

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await api.get("partners/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setPartners(data);
    } catch (err) {
      console.error("Error fetching partners", err);
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
      email: p.email,
      phone: p.phone,
      share_percentage: p.share_percentage,
      ship: p.ship || "",
      is_active: p.is_active,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this partner?")) return;
    try {
      await api.delete(`partners/${id}/`);
      alert("Partner deleted!");
      fetchPartners();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let rawShare = String(formData.share_percentage).replace(/,/g, "");
      let share = rawShare ? parseFloat(rawShare) : null;
      if (!share || share <= 0 || share > 100) {
        alert("Share % must be between 0 and 100.");
        setSubmitting(false);
        return;
      }
      share = Math.round(share * 100) / 100;

      const payload = { ...formData, share_percentage: share };

      if (editingId) {
        await api.put(`partners/${editingId}/`, payload);
        alert("Partner updated!");
      } else {
        await api.post("partners/", payload);
        alert("Partner created!");
      }

      resetForm();
      fetchPartners();
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
              {editingId ? "Edit Partner" : "Add Partner"}
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

          <input
            name="name"
            placeholder="Partner Name"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            name="share_percentage"
            type="number"
            step="0.01"
            placeholder="Share %"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.share_percentage}
            onChange={handleChange}
            required
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
            <h2 className="text-xl font-bold">Partners List</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              + Add Partner
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : partners.length === 0 ? (
            <p>No partners found.</p>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-white min-w-[800px]">
                  <thead className="bg-white/20">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Phone</th>
                      <th className="p-2 text-left">Ship</th>
                      <th className="p-2 text-left">Share %</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((p) => (
                      <tr key={p.id} className="hover:bg-white/10">
                        <td className="p-2">{p.name}</td>
                        <td className="p-2">{p.email}</td>
                        <td className="p-2">{p.phone}</td>
                        <td className="p-2">{getShipName(p.ship)}</td>
                        <td className="p-2">
                          {parseFloat(p.share_percentage || 0).toFixed(2)}%
                        </td>
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
                {partners.map((p) => (
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
                      <span className="font-semibold">Email:</span> {p.email}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> {p.phone}
                    </p>
                    <p>
                      <span className="font-semibold">Share:</span>{" "}
                      {parseFloat(p.share_percentage || 0).toFixed(2)}%
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {p.is_active ? "Active" : "Inactive"}
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
