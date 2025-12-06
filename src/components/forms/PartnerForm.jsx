import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function PartnerForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    share_amount: "",
    share_percentage: "",
    ship: "",
  });
  const [ships, setShips] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingShips, setLoadingShips] = useState(false);
  const [selectedShipCost, setSelectedShipCost] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchShips();
    fetchPartners();
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
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    if (name === "ship") {
      const selected = ships.find((s) => s.id === parseInt(value));
      const cost = selected ? parseFloat(selected.purchase_cost) : null;
      setSelectedShipCost(cost);

      if (updatedFormData.share_amount && cost) {
        const shareAmount = parseFloat(updatedFormData.share_amount);
        const percentage = (shareAmount / cost) * 100;
        updatedFormData.share_percentage = percentage.toFixed(2);
      } else {
        updatedFormData.share_percentage = "";
      }
    }

    if (name === "share_amount") {
      if (selectedShipCost && value) {
        const shareAmount = parseFloat(value);
        const percentage = (shareAmount / selectedShipCost) * 100;
        updatedFormData.share_percentage = percentage.toFixed(2);
      } else {
        updatedFormData.share_percentage = "";
      }
    }

    setFormData(updatedFormData);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      share_amount: "",
      share_percentage: "",
      ship: "",
    });
    setSelectedShipCost(null);
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (partner) => {
    const selected = ships.find((s) => s.id === partner.ship);
    const cost = selected ? parseFloat(selected.purchase_cost) : null;
    setFormData(partner);
    setSelectedShipCost(cost);
    setEditingId(partner.id);
    setShowForm(true);
  };

  const handleDelete = async (partnerId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this partner? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await api.delete(`partners/${partnerId}/`);
      alert("Partner deleted successfully!");
      fetchPartners();
    } catch (err) {
      console.error("Delete error:", err);
      alert(
        "Error deleting partner: " + (err.response?.data?.detail || err.message)
      );
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`partners/${editingId}/`, formData);
        alert("Partner updated!");
      } else {
        await api.post("/partners/", formData);
        await api.post("partners/", formData);
        alert("Partner saved");
      }
      resetForm();
      fetchPartners();
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
            {editingId ? "Edit Partner" : "Add Partner"}
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

          <input
            name="name"
            placeholder="Partner Name"
            className="w-full border p-2 rounded"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            className="w-full border p-2 rounded"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Contact Number"
            className="w-full border p-2 rounded"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            name="share_amount"
            placeholder="Share Amount"
            type="number"
            step="0.01"
            className="w-full border p-2 rounded"
            value={formData.share_amount}
            onChange={handleChange}
            required
          />

          <input
            name="share_percentage"
            placeholder="Share Percentage (Auto-calculated)"
            type="number"
            step="0.01"
            className="w-full border p-2 rounded bg-gray-100"
            value={formData.share_percentage}
            readOnly
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
            <h2 className="text-xl font-semibold">Partners List</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add New Partner
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : partners.length === 0 ? (
            <p>No partners found.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Email</th>
                  <th className="border border-gray-300 p-2">Phone</th>
                  <th className="border border-gray-300 p-2">Ship</th>
                  <th className="border border-gray-300 p-2">Share Amount</th>
                  <th className="border border-gray-300 p-2">Share %</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => {
                  const ship = ships.find((s) => s.id === partner.ship);
                  return (
                    <tr key={partner.id}>
                      <td className="border border-gray-300 p-2">
                        {partner.name}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {partner.email}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {partner.phone}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {ship?.name || "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        Tk {parseFloat(partner.share_amount).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {parseFloat(partner.share_percentage).toFixed(2)}%
                      </td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => handleEdit(partner)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
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
