import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { format } from "date-fns";

const PartnerReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [partners, setPartners] = useState([]);
  const [ships, setShips] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Fetch all data
  useEffect(() => {
    fetchShips();
    fetchPartners();
    fetchIncomes();
    fetchExpenses();
  }, [selectedMonth]);

  const fetchShips = async () => {
    try {
      const response = await api.get("ships/");
      const data = response.data;
      const shipList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];
      setShips(shipList);
    } catch (error) {
      console.error("Error fetching ships:", error);
      setShips([]);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await api.get("partners/");
      const data = res.data;
      const partnerList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];
      setPartners(partnerList);
    } catch (error) {
      console.error("Error fetching partners:", error);
      setPartners([]);
    }
  };

  const fetchIncomes = async () => {
    try {
      const res = await api.get("incomes/");
      const data = res.data;
      const incomeList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];
      setIncomes(incomeList);
    } catch (error) {
      console.error("Error fetching incomes:", error);
      setIncomes([]);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await api.get("expenses/");
      const data = res.data;
      const expenseList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];
      setExpenses(expenseList);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setExpenses([]);
    }
  };

  // Calculate net income for a specific ship and month
  const calculateShipIncome = (shipId) => {
    // Create date range for the selected month
    const startDate = new Date(selectedMonth + "-01");
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    
    // Filter incomes for this ship and month
    const shipIncomes = incomes.filter(income => {
      if (income.ship !== shipId) return false;
      const incomeDate = new Date(income.date);
      return incomeDate >= startDate && incomeDate <= endDate;
    });
    
    // Filter expenses for this ship and month
    const shipExpenses = expenses.filter(expense => {
      if (expense.ship !== shipId) return false;
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    // Calculate total income
    const totalIncome = shipIncomes.reduce((sum, income) => 
      sum + parseFloat(income.amount || 0), 0);
    
    // Calculate total expenses
    const totalExpenses = shipExpenses.reduce((sum, expense) => 
      sum + parseFloat(expense.amount || 0), 0);
    
    // Net income = total income - total expenses
    return totalIncome - totalExpenses;
  };

  const slips = [];

  ships.forEach((ship) => {
    // Calculate income directly
    const income = calculateShipIncome(ship.id);
    const purchaseCost = parseFloat(ship.purchase_cost || 0);
    
    // Benefit per 1 lac (100,000)
    const benefit = purchaseCost ? (income / purchaseCost) * 100000 : 0;

    const shipPartners = partners.filter((p) => p.ship === ship.id);

    shipPartners.forEach((p) => {
      const shareAmount = purchaseCost 
        ? (purchaseCost * (parseFloat(p.share_percentage || 0))) / 100 
        : 0;

      // Payable amount = partner's share percentage of net income
      const payable = (income * (parseFloat(p.share_percentage || 0))) / 100;

      slips.push({
        shipName: ship.name,
        purchaseCost: purchaseCost,
        partnerName: p.name,
        shareAmount: shareAmount,
        income: income,
        benefit: benefit,
        payable: payable,
      });
    });
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow print:shadow-none">
        {/* Header - EXACTLY as you had it */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Partner Slips</h1>

          <div className="flex gap-3 no-print">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <button
              onClick={() => window.print()}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Print
            </button>
          </div>
        </div>

        {/* Slip Grid - EXACTLY as you had it, just fixed the data */}
        <div id="print-area" className="grid grid-cols-3 gap-4">
          {slips.map((slip, index) => (
            <div
              key={index}
              className="border p-3 rounded shadow-sm text-sm h-52 flex flex-col justify-between print-slip"
            >
              <div>
                 <p className="text-start text-xl text-gray-600 mb-2">
                  {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
                </p>
                <p>
                  <strong>Ship Name:</strong> {slip.shipName}
                </p>
                <p>
                  <strong>Purchase Cost:</strong> {slip.purchaseCost.toFixed(2)}
                </p>

                <p className="bg-purple-500 text-black">
                  <strong>Partner Name:</strong> {slip.partnerName}
                </p>
                <p>
                  <strong>Share Amount:</strong> {slip.shareAmount.toFixed(2)}
                </p>

                <p>
                  <strong>Income:</strong> {slip.income.toFixed(2)}
                </p>
                <p>
                  <strong>Benefit/1 Lac:</strong> {slip.benefit.toFixed(2)}
                </p>
              </div>

              <p className="font-bold text-center text-gray-800 bg-gray-300 mt-2">
                Payable: Tk {slip.payable.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerReport;