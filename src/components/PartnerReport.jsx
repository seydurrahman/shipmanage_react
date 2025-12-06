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
  const [monthlyProfits, setMonthlyProfits] = useState([]);

  // Fetch ships, partners, and monthly profits whenever selectedMonth changes
  useEffect(() => {
    fetchShips();
    fetchPartners();
    fetchMonthlyProfits();
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

  const fetchMonthlyProfits = async () => {
    try {
      const res = await api.get("profits/");
      const data = res.data;
      const profitData = Array.isArray(data) ? data : data.results || [];
      setMonthlyProfits(profitData);
    } catch (error) {
      console.error("Error fetching monthly profits:", error);
      setMonthlyProfits([]);
    }
  };

  // Filter partners and profits by selected month
  const filteredProfits = Array.isArray(monthlyProfits)
    ? monthlyProfits.filter((profit) => profit.month?.startsWith(selectedMonth))
    : [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-8xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 print:mb-4">
            <h1 className="text-2xl font-bold">Partner Share Report</h1>
            <div className="flex space-x-4 no-print">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border rounded px-3 py-2"
              />
              <button
                onClick={() => window.print()}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Print Report
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="space-y-6">
            {Array.isArray(ships) &&
              ships.map((ship) => {
                const shipPartners = partners.filter((p) => p.ship === ship.id);
                const shipProfit = filteredProfits.find(
                  (profit) => profit.ship === ship.id
                );
                const netProfit = shipProfit
                  ? parseFloat(shipProfit.net_profit || 0)
                  : 0;
                const purchaseCost = parseFloat(ship.purchase_cost || 0);

                if (!shipPartners.length) return null;

                return (
                  <div
                    key={ship.id}
                    className="border rounded-lg p-4 page-break"
                  >
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                      {ship.name} -{" "}
                      {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
                    </h2>

                    <table className="min-w-full mb-4 border-collapse border">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border px-4 py-2 text-left">
                            Partner Name
                          </th>
                          <th className="border px-4 py-2 text-right">
                            Share Amount
                          </th>
                          <th className="border px-4 py-2 text-center">
                            Share %
                          </th>
                          <th className="border px-4 py-2 text-right">
                            Payable Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipPartners.map((partner) => {
                          // Share Amount = Purchase Cost × Share % / 100
                          const shareAmount =
                            (parseFloat(partner.share_percentage || 0) / 100) *
                            purchaseCost;
                          // Payable Amount = Net Profit / Purchase Cost × Share Amount
                          const payableAmount =
                            purchaseCost > 0
                              ? (netProfit / purchaseCost) * shareAmount
                              : 0;

                          return (
                            <tr
                              key={partner.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="border px-4 py-2">
                                {partner.name}
                              </td>
                              <td className="border px-4 py-2 text-right">
                                Tk {shareAmount.toFixed(2)}
                              </td>
                              <td className="border px-4 py-2 text-center">
                                {parseFloat(
                                  partner.share_percentage || 0
                                ).toFixed(2)}
                                %
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
                          <td
                            colSpan="3"
                            className="border px-4 py-2 text-right"
                          >
                            Total Payable:
                          </td>
                          <td className="border px-4 py-2 text-right">
                            Tk{" "}
                            {shipPartners
                              .reduce((sum, partner) => {
                                const shareAmount =
                                  (purchaseCost *
                                    parseFloat(partner.share_percentage || 0)) /
                                  100;
                                const payableAmount =
                                  purchaseCost > 0
                                    ? (netProfit / purchaseCost) * shareAmount
                                    : 0;
                                return sum + payableAmount;
                              }, 0)
                              .toFixed(2)}
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
            {(!ships.length || !partners.length) && (
              <div className="text-center text-gray-500 py-8">
                <p>No data available for the selected period.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerReport;
