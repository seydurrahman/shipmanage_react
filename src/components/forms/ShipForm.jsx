import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function ShipForm() {
  const [formData, setFormData] = useState({
    name: "",
    purchase_cost: "",
    purchase_date: "",
    is_active: true,
  });

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
    setFormData({
      name: "",
      purchase_cost: "",
      purchase_date: "",
      is_active: true,
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (ship) => {
    setFormData(ship);
    setEditingId(ship.id);
    setShowForm(true);
  };

  const handleDelete = async (shipId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this ship? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await api.delete(`ships/${shipId}/`);
      alert("Ship deleted successfully!");
      fetchShips();
    } catch (err) {
      console.error("Delete error:", err);
      alert(
        "Error deleting ship: " + (err.response?.data?.detail || err.message)
      );
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Ensure purchase_cost is sent as a number (no commas) and validate integer digits
      let cost =
        formData.purchase_cost === ""
          ? null
          : parseFloat(String(formData.purchase_cost));

      if (cost !== null) {
        if (isNaN(cost) || cost <= 0) {
          alert("Purchase cost must be a positive number.");
          setSubmitting(false);
          return;
        }
        const integerDigits = Math.floor(Math.abs(cost)).toString().length;
        if (integerDigits > 8) {
          alert(
            "Purchase cost has too many digits before the decimal. Maximum 8 digits allowed (e.g. 99999999.99)."
          );
          setSubmitting(false);
          return;
        }
        // Round to two decimals to match backend DecimalField
        cost = Math.round(cost * 100) / 100;
      }

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
      console.error("Ship create error:", err.response || err);
      const serverData = err.response?.data;
      const message = serverData
        ? JSON.stringify(serverData)
        : err.response?.data?.detail || err.message;
      alert("Error creating ship: " + message);
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
            {editingId ? "Edit Ship" : "Add Ship"}
          </h2>

          <input
            name="name"
            placeholder="Ship Name"
            className="w-full border p-2 rounded"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            name="purchase_cost"
            placeholder="Purchase Cost (Tk) — max 8 digits before decimal"
            type="number"
            step="0.01"
            min="0"
            max="99999999.99"
            className="w-full border p-2 rounded"
            value={formData.purchase_cost}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="purchase_date"
            className="w-full border p-2 rounded"
            value={formData.purchase_date}
            onChange={handleChange}
            required
          />

          <label className="flex items-center gap-2">
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
              className="flex-1 bg-blue-600 text-white py-2 rounded"
            >
              {submitting ? "Saving..." : editingId ? "Update" : "Submit"}
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
            <h2 className="text-xl font-semibold">Ships List</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add New Ship
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : ships.length === 0 ? (
            <p>No ships found.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Purchase Cost</th>
                  <th className="border border-gray-300 p-2">Purchase Date</th>
                  <th className="border border-gray-300 p-2">Status</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ships.map((ship) => (
                  <tr key={ship.id}>
                    <td className="border border-gray-300 p-2">{ship.name}</td>
                    <td className="border border-gray-300 p-2">
                      Tk {parseFloat(ship.purchase_cost).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {ship.purchase_date}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {ship.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <button
                        onClick={() => handleEdit(ship)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ship.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
