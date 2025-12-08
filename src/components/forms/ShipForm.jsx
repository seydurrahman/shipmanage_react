import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function ShipForm() {
  const emptyForm = {
    name: "",
    purchase_cost: "",
    purchase_date: "",
    is_active: true,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchShips();
  }, []);

  const fetchShips = async () => {
    setLoading(true);
    try {
      const res = await api.get("ships/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setShips(data);
    } catch (err) {
      console.error("Error fetching ships", err);
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

  const handleEdit = (ship) => {
    setFormData({
      name: ship.name,
      purchase_cost: ship.purchase_cost,
      purchase_date: ship.purchase_date,
      is_active: ship.is_active,
    });
    setEditingId(ship.id);
    setShowForm(true);
  };

  const handleDelete = async (shipId) => {
    if (!window.confirm("Delete this ship?")) return;

    try {
      await api.delete(`ships/${shipId}/`);
      alert("Ship deleted successfully!");
      fetchShips();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let rawCost = String(formData.purchase_cost).replace(/,/g, "");
      let cost = rawCost ? parseFloat(rawCost) : null;

      if (!cost || cost <= 0) {
        alert("Cost must be a positive number.");
        setSubmitting(false);
        return;
      }

      cost = Math.round(cost * 100) / 100;

      const payload = { ...formData, purchase_cost: cost };

      if (editingId) {
        await api.put(`ships/${editingId}/`, payload);
        alert("Ship updated!");
      } else {
        await api.post("ships/", payload);
        alert("Ship created!");
      }

      resetForm();
      fetchShips();
      setShowForm(false);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen p-6 bg-cover bg-center relative"
      style={{
        backgroundImage: `url(/titanic-iceberg.jpg)`,
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      {/* CONTENT */}
      {showForm ? (
        <form
          onSubmit={submit}
          className="relative glass-card max-w-lg mx-auto p-6 space-y-4 text-white"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {editingId ? "Edit Ship" : "Add Ship"}
            </h2>

            {/* Mobile Back */}
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
            placeholder="Ship Name"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            name="purchase_cost"
            placeholder="Purchase Cost (Tk)"
            type="number"
            step="0.01"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.purchase_cost}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="purchase_date"
            className="w-full p-2 rounded bg-white/70 text-black"
            value={formData.purchase_date}
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
        <div className="relative glass-card max-w-4xl mx-auto p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Ships List</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
            >
              + Add New Ship
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : ships.length === 0 ? (
            <p>No ships found.</p>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-white min-w-[700px]">
                  <thead className="bg-white/20">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Cost</th>
                      <th className="p-2 text-left">Purchase Date</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ships.map((ship) => (
                      <tr key={ship.id} className="hover:bg-white/10">
                        <td className="p-2">{ship.name}</td>
                        <td className="p-2">
                          Tk {parseFloat(ship.purchase_cost).toFixed(2)}
                        </td>
                        <td className="p-2">{ship.purchase_date}</td>
                        <td className="p-2">
                          {ship.is_active ? "Active" : "Inactive"}
                        </td>
                        <td className="p-2 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(ship)}
                            className="px-3 py-1 bg-blue-500 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(ship.id)}
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

              {/* MOBILE CARDS */}
              <div className="md:hidden space-y-4">
                {ships.map((ship) => (
                  <div
                    key={ship.id}
                    className="glass-card p-4 text-white rounded-lg shadow-md"
                  >
                    <h3 className="text-lg font-semibold mb-2">{ship.name}</h3>

                    <p>
                      <span className="font-semibold">Cost:</span> Tk{" "}
                      {parseFloat(ship.purchase_cost).toFixed(2)}
                    </p>

                    <p>
                      <span className="font-semibold">Purchase Date:</span>{" "}
                      {ship.purchase_date}
                    </p>

                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {ship.is_active ? "Active" : "Inactive"}
                    </p>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(ship)}
                        className="flex-1 bg-blue-500 text-white py-1 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(ship.id)}
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
