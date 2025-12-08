// src/components/PartnerReport.jsx
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
  // const [monthlyProfits, setMonthlyProfits] = useState([]);

  // Fetch ships, partners, and monthly profits whenever selectedMonth changes
  useEffect(() => {
    fetchShips();
    fetchPartners();
    fetchIncomes();
    fetchExpenses();
    // fetchMonthlyProfits();
  }, [selectedMonth]);

  const fetchShips = async () => {
    try {
      const response = await api.get("ships/");
      const shipData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setShips(shipData);
    } catch (error) {
      console.error("Error fetching ships:", error);
      setShips([]);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await api.get("partners/");
      const data = res.data;
      const partnerData = Array.isArray(data) ? data : data.results || [];
      setPartners(partnerData);
    } catch (error) {
      console.error("Error fetching partners:", error);
      setPartners([]);
    }
  };


  // const fetchMonthlyProfits = async () => {
  //   try {
  //     const res = await api.get("profits/");
  //     const data = res.data;
  //     const profitData = Array.isArray(data) ? data : data.results || [];
  //     setMonthlyProfits(profitData);
  //   } catch (error) {
  //     console.error("Error fetching monthly profits:", error);
  //     setMonthlyProfits([]);
  //   }
  // };

  // Filter partners and profits by selected month
  // const filteredProfits = Array.isArray(monthlyProfits)
  //   ? monthlyProfits.filter((profit) => profit.month?.startsWith(selectedMonth))
  //   : [];

   const fetchIncomes = async () => {
    try {
      const response = await api.get("incomes/");
      const incomeData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setIncomes(incomeData);
    } catch (error) {
      console.error("Error fetching incomes:", error);
      setIncomes([]);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get("expenses/");
      const expenseData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setExpenses(expenseData);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setExpenses([]);
    }
  };

  // Calculate net profit like Dashboard
  const calculateNetProfit = (shipId) => {
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
    
    // Calculate totals
    const totalIncome = shipIncomes.reduce((sum, income) => 
      sum + parseFloat(income.amount || 0), 0);
    
    const totalExpense = shipExpenses.reduce((sum, expense) => 
      sum + parseFloat(expense.amount || 0), 0);
    
    return totalIncome - totalExpense;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-8xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none">
          {/* Header remains same */}
          
          <div className="space-y-6">
            {Array.isArray(ships) &&
              ships.map((ship) => {
                const shipPartners = partners.filter((p) => p.ship === ship.id);
                
                // Calculate net profit directly
                const netProfit = calculateNetProfit(ship.id);
                const purchaseCost = parseFloat(ship.purchase_cost || 0);

                if (!shipPartners.length) return null;
                return (
                  <div key={ship.id} className="border rounded-lg p-4 page-break">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                      {ship.name} - {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
                    </h2>

                    <table className="min-w-full mb-4 border-collapse border">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border px-4 py-2 text-left">Partner Name</th>
                          <th className="border px-4 py-2 text-right">Share Amount</th>
                          <th className="border px-4 py-2 text-center">Share %</th>
                          <th className="border px-4 py-2 text-right">Payable Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipPartners.map((partner) => {
                          // Calculate partner's payable amount
                          const payableAmount = (netProfit * parseFloat(partner.share_percentage || 0)) / 100;
                          
                          return (
                            <tr key={partner.id} className="border-b hover:bg-gray-50">
                              <td className="border px-4 py-2">{partner.name}</td>
                              <td className="border px-4 py-2 text-right">
                                Tk {purchaseCost.toFixed(2)}
                              </td>
                              <td className="border px-4 py-2 text-center">
                                {parseFloat(partner.share_percentage || 0).toFixed(2)}%
                              </td>
                              <td className="border px-4 py-2 text-right">
                                Tk {payableAmount.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 font-semibold">
                          <td colSpan="3" className="border px-4 py-2 text-right">Total Payable:</td>
                          <td className="border px-4 py-2 text-right">
                            Tk {shipPartners.reduce((sum, partner) => 
                              sum + (netProfit * parseFloat(partner.share_percentage || 0)) / 100, 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    <div className="mt-6 text-sm text-gray-600">
                      <p>Generated on: {format(new Date(), "MMMM dd, yyyy")}</p>
                      <p>Ship Cost: Tk {purchaseCost.toFixed(2)}</p>
                      <p>Net Profit (Month): Tk {netProfit.toFixed(2)}</p>
                      <p>Number of Partners: {shipPartners.length}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerReport;
