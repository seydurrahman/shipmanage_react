import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function ExpenseForm() {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: "",
    ship: "",
    category: "",
    purchase_from: "",
  });
  const [ships, setShips] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [document, setDocument] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [expenses, setExpenses] = useState([]);
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

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      date: "",
      ship: "",
      category: "",
      purchase_from: "",
    });
    setDocument(null);
    setDocumentName("");
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (expense) => {
    setFormData({
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      ship: expense.ship,
      category: expense.category,
      purchase_from: expense.purchase_from,
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async (expenseId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this expense? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await api.delete(`expenses/${expenseId}/`);
      alert("Expense deleted successfully!");
      fetchExpenses();
    } catch (err) {
      console.error("Delete error:", err);
      alert(
        "Error deleting expense: " + (err.response?.data?.detail || err.message)
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocument(file);
      setDocumentName(file.name);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let res;
      if (editingId) {
        const uploadData = new FormData();
        uploadData.append("description", formData.description);
        uploadData.append("amount", formData.amount);
        uploadData.append("date", formData.date);
        uploadData.append("ship", formData.ship);
        uploadData.append("category", formData.category);
        uploadData.append("purchase_from", formData.purchase_from);
        if (document) uploadData.append("document", document);

        res = await api.put(`expenses/${editingId}/`, uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (document) {
        const uploadData = new FormData();
        uploadData.append("description", formData.description);
        uploadData.append("amount", formData.amount);
        uploadData.append("date", formData.date);
        uploadData.append("ship", formData.ship);
        uploadData.append("category", formData.category);
        uploadData.append("purchase_from", formData.purchase_from);
        uploadData.append("document", document);

        res = await api.post("expenses/", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("expenses/", formData);
      }

      alert(editingId ? "Expense updated!" : "Expense recorded");
      resetForm();
      fetchExpenses();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert(
        "Error saving expense: " + (err.response?.data?.detail || err.message)
      );
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
            {editingId ? "Edit Expense" : "Add Expense"}
          </h2>

          <input
            name="description"
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <input
            name="amount"
            placeholder="Amount"
            type="number"
            className="w-full border p-2 rounded"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="date"
            className="w-full border p-2 rounded"
            value={formData.date}
            onChange={handleChange}
            required
          />

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

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            <option value="FUEL">Fuel</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="CREW">Crew Salary</option>
            <option value="REPAIR">Repairs</option>
            <option value="INSURANCE">Insurance</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            name="purchase_from"
            placeholder="Purchase from (vendor/supplier name)"
            className="w-full border p-2 rounded"
            value={formData.purchase_from}
            onChange={handleChange}
          />

          <label className="block">
            <span className="text-sm text-gray-700">
              Upload Document (optional)
            </span>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border p-2 rounded mt-1"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.xls"
            />
            {documentName && (
              <p className="text-sm text-green-600 mt-1">📄 {documentName}</p>
            )}
          </label>

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
            <h2 className="text-xl font-semibold">Expenses List</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add New Expense
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : expenses.length === 0 ? (
            <p>No expenses found.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2">Description</th>
                  <th className="border border-gray-300 p-2">Amount</th>
                  <th className="border border-gray-300 p-2">Category</th>
                  <th className="border border-gray-300 p-2">Date</th>
                  <th className="border border-gray-300 p-2">Ship</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  const ship = ships.find((s) => s.id === expense.ship);
                  return (
                    <tr key={expense.id}>
                      <td className="border border-gray-300 p-2">
                        {expense.description}
                      </td>
                      <td className="border border-gray-300 p-2">
                        Tk {parseFloat(expense.amount).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {expense.category}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {expense.date}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {ship?.name || "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
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
