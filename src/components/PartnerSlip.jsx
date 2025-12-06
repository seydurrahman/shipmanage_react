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

  useEffect(() => {
    fetchShips();
    fetchPartners();
    fetchMonthlyProfits();
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

  const fetchMonthlyProfits = async () => {
    try {
      const res = await api.get("profits/");
      const data = res.data;

      // Handle array OR paginated "results" format
      const profitData = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];

      setMonthlyProfits(profitData);
    } catch (error) {
      console.error("Error fetching monthly profits:", error);
      setMonthlyProfits([]);
    }
  };

  const filteredProfits = Array.isArray(monthlyProfits)
    ? monthlyProfits.filter((p) => p.month?.startsWith(selectedMonth))
    : [];

  const slips = [];

  ships.forEach((ship) => {
    const shipProfit = filteredProfits.find((p) => p.ship === ship.id);
    const income = shipProfit ? shipProfit.net_profit : 0;
    const benefit = (income / ship.purchase_cost) * 100000;

    const shipPartners = partners.filter((p) => p.ship === ship.id);

    shipPartners.forEach((p) => {
      const shareAmount =
        (ship.purchase_cost * (p.share_percentage || 0)) / 100;

      const payable = ship.purchase_cost
        ? (income / ship.purchase_cost) * shareAmount
        : 0;

      slips.push({
        shipName: ship.name,
        purchaseCost: ship.purchase_cost,
        partnerName: p.name,
        shareAmount,
        income,
        benefit,
        payable,
      });
    });
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow print:shadow-none">
        {/* Header */}
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

        {/* Slip Grid */}
        <div className="grid grid-cols-2 gap-4 print:grid-cols-2">
          {slips.map((slip, index) => (
            <div
              key={index}
              className="border p-3 rounded shadow-sm text-sm h-48 flex flex-col justify-between page-break-slip"
            >
              <div>
                <p>
                  <strong>Ship Name:</strong> {slip.shipName}
                </p>
                <p>
                  <strong>Purchase Cost:</strong> {slip.purchaseCost}
                </p>

                <p>
                  <strong>Partner Name:</strong> {slip.partnerName}
                </p>
                <p>
                  <strong>Share Amount:</strong> {slip.shareAmount.toFixed(2)}
                </p>

                <p>
                  <strong>Income:</strong> {slip.income}
                </p>
                <p>
                  <strong>Benefit/1 Lac:</strong> {slip.benefit.toFixed(2)}
                </p>
              </div>

              <p className="font-bold text-right">
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
