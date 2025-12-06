// src/components/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

// Bar Chart Component
const BarChartComponent = React.memo(
  ({ ships, dailyIncomes, selectedDate }) => {
    const [selectedShip, setSelectedShip] = useState(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    // Get all days in the month
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Show only 7 days at a time (based on scroll position)
    const daysPerView = 7;
    const displayedDays = daysInMonth.slice(
      scrollPosition,
      scrollPosition + daysPerView
    );

    // Group incomes by ship and date
    const chartData = ships.map((ship) => {
      const shipIncomes = displayedDays.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayIncomes = dailyIncomes.filter(
          (inc) => inc.ship === ship.id && inc.date === dateStr
        );
        return dayIncomes.reduce(
          (sum, inc) => sum + parseFloat(inc.amount || 0),
          0
        );
      });
      return { ship: ship.name, shipId: ship.id, data: shipIncomes };
    });

    // Filter by selected ship if any
    const filteredChartData = selectedShip
      ? chartData.filter((d) => d.shipId === selectedShip)
      : chartData;

    // Colors for each ship
    const colors = [
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#06b6d4",
    ];

    // Scroll handlers
    const handleScrollLeft = () => {
      setScrollPosition(Math.max(0, scrollPosition - 1));
    };

    const handleScrollRight = () => {
      setScrollPosition(
        Math.min(daysInMonth.length - daysPerView, scrollPosition + 1)
      );
    };

    return (
      <div>
        {/* Ship Filter Buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedShip(null)}
            className={`px-4 py-2 rounded font-semibold transition ${
              selectedShip === null
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Ships
          </button>
          {ships.map((ship) => (
            <button
              key={ship.id}
              onClick={() => setSelectedShip(ship.id)}
              className={`px-4 py-2 rounded font-semibold transition ${
                selectedShip === ship.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {ship.name}
            </button>
          ))}
        </div>

        {/* Chart with Navigation */}
        <div className="flex items-center gap-4">
          {/* Left Scroll Button */}
          <button
            onClick={handleScrollLeft}
            disabled={scrollPosition === 0}
            className="px-3 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition"
          >
            ←
          </button>

          {/* Chart */}
          <div
            className="flex-1 overflow-hidden"
            style={{ minHeight: "400px" }}
          >
            <svg
              width="100%"
              height="400"
              viewBox={`0 0 ${daysPerView * 80 + 100} 400`}
            >
              {/* Y-axis */}
              <line
                x1="60"
                y1="30"
                x2="60"
                y2="350"
                stroke="#333"
                strokeWidth="2"
              />

              {/* X-axis */}
              <line
                x1="60"
                y1="350"
                x2={daysPerView * 80 + 80}
                y2="350"
                stroke="#333"
                strokeWidth="2"
              />

              {/* Y-axis labels */}
              {[0, 5000, 10000, 15000, 20000, 25000].map((val, idx) => (
                <g key={idx}>
                  <line
                    x1="55"
                    y1={350 - (val / 25000) * 300}
                    x2="60"
                    y2={350 - (val / 25000) * 300}
                    stroke="#333"
                    strokeWidth="1"
                  />
                  <text
                    x="10"
                    y={350 - (val / 25000) * 300 + 5}
                    fontSize="12"
                    fill="#666"
                  >
                    {val / 1000}K
                  </text>
                </g>
              ))}

              {/* Grid lines */}
              {[0, 5000, 10000, 15000, 20000, 25000].map((val, idx) => (
                <line
                  key={idx}
                  x1="60"
                  y1={350 - (val / 25000) * 300}
                  x2={daysPerView * 80 + 80}
                  y2={350 - (val / 25000) * 300}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
              ))}

              {/* Bars */}
              {displayedDays.map((day, dayIdx) => {
                const x = 80 + dayIdx * 80;
                let barX = x;

                return (
                  <g key={dayIdx}>
                    {filteredChartData.map((shipData, shipIdx) => {
                      const value = shipData.data[dayIdx];
                      const barWidth = 15;
                      const barHeight = (value / 25000) * 300;
                      const currentBarX = barX;
                      barX += barWidth + 2;

                      return (
                        <g key={shipIdx}>
                          <rect
                            x={currentBarX}
                            y={350 - barHeight}
                            width={barWidth}
                            height={barHeight}
                            fill={colors[shipData.shipId % colors.length]}
                            opacity="0.8"
                          />
                          {value > 0 && (
                            <text
                              x={currentBarX + barWidth / 2}
                              y={350 - barHeight - 5}
                              fontSize="10"
                              textAnchor="middle"
                              fill="#333"
                            >
                              {(value / 1000).toFixed(0)}K
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Date label */}
                    <text
                      x={x + 30}
                      y="375"
                      fontSize="11"
                      textAnchor="middle"
                      fill="#666"
                      transform={`rotate(45, ${x + 30}, 375)`}
                    >
                      {format(day, "d-MMM")}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={handleScrollRight}
            disabled={scrollPosition >= daysInMonth.length - daysPerView}
            className="px-3 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition"
          >
            →
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {filteredChartData.map((shipData, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{
                  backgroundColor: colors[shipData.shipId % colors.length],
                }}
              ></div>
              <span className="text-sm font-semibold">{shipData.ship}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

BarChartComponent.displayName = "BarChartComponent";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyIncomes, setDailyIncomes] = useState([]);
  const [monthlyProfits, setMonthlyProfits] = useState([]);
  const [ships, setShips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch ships
  const fetchShips = useCallback(async () => {
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
  }, []);

  // Fetch all daily incomes
  const fetchDailyIncomes = useCallback(async () => {
    try {
      const response = await api.get("incomes/");
      const incomeData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setDailyIncomes(incomeData);
    } catch (error) {
      console.error("Error fetching daily incomes:", error);
      setDailyIncomes([]);
    }
  }, []);

  // Fetch all expenses
  const fetchExpenses = useCallback(async () => {
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
  }, []);

  // Fetch monthly profits
  const fetchMonthlyProfits = useCallback(async () => {
    try {
      const response = await api.get("profits/");
      const profitData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setMonthlyProfits(profitData);
    } catch (error) {
      console.error("Error fetching monthly profits:", error);
      setMonthlyProfits([]);
    }
  }, []);

  useEffect(() => {
    fetchShips();
    fetchDailyIncomes();
    fetchExpenses();
    fetchMonthlyProfits();
  }, [fetchShips, fetchDailyIncomes, fetchExpenses, fetchMonthlyProfits]);

  const calculateProfit = async () => {
    setLoading(true);
    try {
      const monthStr = format(selectedDate, "yyyy-MM");
      // Calculate profit for all ships
      const promises = ships.map((ship) =>
        api.post("profits/calculate_profit/", {
          ship_id: ship.id,
          month: monthStr,
        })
      );
      await Promise.all(promises);
      fetchMonthlyProfits();
      alert("Profit calculated successfully for all ships!");
    } catch (error) {
      alert(
        "Error calculating profit: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily income for selected date
  const todayIncomes = dailyIncomes.filter(
    (inc) => inc.date === format(selectedDate, "yyyy-MM-dd")
  );
  const todayTotal = todayIncomes.reduce(
    (sum, inc) => sum + parseFloat(inc.amount || 0),
    0
  );

  // Calculate monthly income and expenses for selected month
  const monthStr = format(selectedDate, "yyyy-MM");
  const monthIncomes = dailyIncomes.filter((inc) =>
    inc.date?.startsWith(monthStr)
  );
  const monthlyTotal = monthIncomes.reduce(
    (sum, inc) => sum + parseFloat(inc.amount || 0),
    0
  );

  const monthExpenses = expenses.filter((exp) =>
    exp.date?.startsWith(monthStr)
  );
  const monthlyExpenseTotal = monthExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount || 0),
    0
  );

  // Calculate trend (today vs average daily for month)
  const avgDailyForMonth =
    monthIncomes.length > 0 ? monthlyTotal / monthIncomes.length : 0;
  const trend = todayTotal - avgDailyForMonth;
  const trendPercent =
    avgDailyForMonth > 0 ? ((trend / avgDailyForMonth) * 100).toFixed(1) : 0;

  // Ship-wise daily income for selected date
  const shipWiseIncome = ships.map((ship) => ({
    ship,
    dayIncome: todayIncomes
      .filter((inc) => inc.ship === ship.id)
      .reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0),
    thisMonthIncome: monthIncomes
      .filter((inc) => inc.ship === ship.id)
      .reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0),
    lastMonthIncome: dailyIncomes
      .filter(
        (inc) =>
          inc.ship === ship.id &&
          inc.date?.startsWith(format(subMonths(selectedDate, 1), "yyyy-MM"))
      )
      .reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0),
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Ship Management Dashboard
        </h1>

        {/* Date Selector */}
        <div className="mb-6 flex text-start">
          <input
            type="date"
            value={format(selectedDate, "yyyy-MM-dd")}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="border rounded px-4 py-2 text-lg"
          />
        </div>

        {/* Ship-wise Daily Income */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ship-wise Income</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {shipWiseIncome.map(
              ({ ship, dayIncome, thisMonthIncome, lastMonthIncome }) => {
                const trend = thisMonthIncome - lastMonthIncome;
                const trendPercent =
                  lastMonthIncome > 0
                    ? ((trend / lastMonthIncome) * 100).toFixed(1)
                    : 0;

                return (
                  <div
                    key={ship.id}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                      {ship.name}
                    </h3>

                    {/* Day Income */}
                    <div className="mb-3 pb-3 border-b">
                      <p className="text-xs text-gray-500">Day Income</p>
                      <p className="text-xl font-bold text-blue-600">
                        Tk {dayIncome.toFixed(2)}
                      </p>
                    </div>

                    {/* This Month Income */}
                    <div className="mb-3 pb-3 border-b">
                      <p className="text-xs text-gray-500">This Month Income</p>
                      <p className="text-xl font-bold text-green-600">
                        Tk {thisMonthIncome.toFixed(2)}
                      </p>
                    </div>

                    {/* Last Month Income + Trend */}
                    <div>
                      <p className="text-xs text-gray-500">Last Month Income</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-gray-700">
                          Tk {lastMonthIncome.toFixed(2)}
                        </p>
                        <span
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                            trend >= 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {trend >= 0 ? "↑" : "↓"} {Math.abs(trendPercent)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Ship-wise Daily Income Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Ship-wise Daily Income Chart
          </h2>
          <BarChartComponent
            ships={ships}
            dailyIncomes={dailyIncomes}
            selectedDate={selectedDate}
          />
        </div>

        {/* Income vs Expenses Comparison */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Monthly Summary - {format(selectedDate, "MMMM yyyy")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Income */}
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-gray-600 text-sm">Total Income</p>
              <p className="text-3xl font-bold text-green-600">
                Tk {monthlyTotal.toFixed(2)}
              </p>
            </div>

            {/* Expenses */}
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-gray-600 text-sm">Total Expenses</p>
              <p className="text-3xl font-bold text-red-600">
                Tk {monthlyExpenseTotal.toFixed(2)}
              </p>
            </div>

            {/* Net Profit */}
            <div
              className={`border-l-4 ${
                monthlyTotal - monthlyExpenseTotal >= 0
                  ? "border-green-500"
                  : "border-red-500"
              } pl-4`}
            >
              <p className="text-gray-600 text-sm">Net Profit</p>
              <p
                className={`text-3xl font-bold ${
                  monthlyTotal - monthlyExpenseTotal >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Tk {(monthlyTotal - monthlyExpenseTotal).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Profits Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Monthly Profits History</h2>
            <button
              onClick={() => calculateProfit()}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading
                ? "Calculating..."
                : `Calculate Profit - ${format(selectedDate, "MMM yyyy")}`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left font-semibold">Ship</th>
                  <th className="px-4 py-3 text-left font-semibold">Month</th>
                  <th className="px-4 py-3 text-right font-semibold">Income</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Expenses
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Net Profit
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(monthlyProfits) && monthlyProfits.length > 0 ? (
                  monthlyProfits.map((profit, idx) => {
                    const prevProfit =
                      idx > 0
                        ? monthlyProfits[idx - 1]?.net_profit
                        : profit.net_profit;
                    const profitTrend = profit.net_profit - prevProfit;
                    return (
                      <tr key={profit.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{profit.ship_name}</td>
                        <td className="px-4 py-3">
                          {format(new Date(profit.month), "MMM yyyy")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          Tk {parseFloat(profit.total_income || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          Tk {parseFloat(profit.total_expenses || 0).toFixed(2)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            profit.net_profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Tk {parseFloat(profit.net_profit || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold ${
                              profitTrend >= 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {profitTrend >= 0 ? "↑" : "↓"}{" "}
                            {Math.abs(profitTrend).toFixed(0)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-3 text-center text-gray-500"
                    >
                      No profit data available. Click "Calculate" to generate
                      profit reports.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
