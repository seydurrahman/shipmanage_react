import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
// ===============================================
// Profit History

// ==============================================
/* ============================================================
   RESPONSIVE BAR CHART (Scrolls on Mobile)
   ============================================================ */
const BarChartComponent = React.memo(
  ({ ships, dailyIncomes, selectedDate }) => {
    const [selectedShip, setSelectedShip] = useState(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const daysPerView = 7;
    const displayedDays = daysInMonth.slice(
      scrollPosition,
      scrollPosition + daysPerView
    );

    const chartData = ships.map((ship) => {
      const values = displayedDays.map((day) => {
        const dayStr = format(day, "yyyy-MM-dd");
        const incomes = dailyIncomes.filter(
          (i) => i.ship === ship.id && i.date === dayStr
        );
        return incomes.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
      });
      return { ship: ship.name, shipId: ship.id, data: values };
    });

    const filteredChart = selectedShip
      ? chartData.filter((d) => d.shipId === selectedShip)
      : chartData;

    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

    const scrollLeft = () => setScrollPosition(Math.max(0, scrollPosition - 1));

    const scrollRight = () =>
      setScrollPosition(
        Math.min(daysInMonth.length - daysPerView, scrollPosition + 1)
      );

    return (
      <div className="space-y-4">
        {/* FILTER BUTTONS */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedShip(null)}
            className={`px-3 py-1 rounded ${
              selectedShip === null ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            All Ships
          </button>

          {ships.map((ship) => (
            <button
              key={ship.id}
              onClick={() => setSelectedShip(ship.id)}
              className={`px-3 py-1 rounded ${
                selectedShip === ship.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {ship.name}
            </button>
          ))}
        </div>

        {/* CHART */}
        <div className="flex items-center gap-3">
          <button
            onClick={scrollLeft}
            disabled={scrollPosition === 0}
            className="px-3 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            ←
          </button>

          {/* ⭐ The wrapper that makes mobile scrolling work */}
          <div className="overflow-x-auto w-full">
            <div className="min-w-[700px]">
              <svg
                width="100%"
                height="350"
                viewBox={`0 0 ${daysPerView * 80 + 100} 350`}
              >
                {/* X & Y AXIS */}
                <line
                  x1="60"
                  y1="20"
                  x2="60"
                  y2="300"
                  stroke="#666"
                  strokeWidth="2"
                />
                <line
                  x1="60"
                  y1="300"
                  x2={daysPerView * 80 + 80}
                  y2="300"
                  stroke="#666"
                  strokeWidth="2"
                />

                {/* BARS */}
                {displayedDays.map((day, dayIdx) => {
                  const x = 80 + dayIdx * 80;
                  let barX = x;

                  return (
                    <g key={dayIdx}>
                      {filteredChart.map((item, index) => {
                        const val = item.data[dayIdx];
                        const barHeight = (val / 25000) * 250;
                        const barWidth = 15;

                        const currentX = barX;
                        barX += barWidth + 4;

                        return (
                          <g key={index}>
                            <rect
                              x={currentX}
                              y={300 - barHeight}
                              width={barWidth}
                              height={barHeight}
                              fill={colors[index % colors.length]}
                              opacity="0.8"
                            />

                            {val > 0 && (
                              <text
                                x={currentX + barWidth / 2}
                                y={300 - barHeight - 5}
                                textAnchor="middle"
                                fontSize="10"
                              >
                                {(val / 1000).toFixed(0)}K
                              </text>
                            )}
                          </g>
                        );
                      })}

                      <text
                        x={x + 20}
                        y="330"
                        transform={`rotate(45, ${x + 20}, 330)`}
                        fontSize="10"
                        fill="#666"
                      >
                        {format(day, "d-MMM")}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <button
            onClick={scrollRight}
            disabled={scrollPosition >= daysInMonth.length - daysPerView}
            className="px-3 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            →
          </button>
        </div>
      </div>
    );
  }
);

/* ============================================================
   MAIN DASHBOARD
   ============================================================ */

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [ships, setShips] = useState([]);
  const [dailyIncomes, setDailyIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [profitList, setProfitList] = useState([]);
  const [loading, setLoading] = useState(false);

  /* FETCH DATA */
  const fetchShips = useCallback(async () => {
    const res = await api.get("ships/");
    setShips(Array.isArray(res.data) ? res.data : res.data.results || []);
  }, []);

  const fetchDailyIncomes = useCallback(async () => {
    const res = await api.get("incomes/");
    setDailyIncomes(
      Array.isArray(res.data) ? res.data : res.data.results || []
    );
  }, []);

  const fetchExpenses = useCallback(async () => {
    const res = await api.get("expenses/");
    setExpenses(Array.isArray(res.data) ? res.data : res.data.results || []);
  }, []);

  const fetchProfits = useCallback(async () => {
    const res = await api.get("profits/");
    setProfitList(Array.isArray(res.data) ? res.data : res.data.results || []);
  }, []);

  useEffect(() => {
    fetchShips();
    fetchDailyIncomes();
    fetchExpenses();
    fetchProfits();
  }, [fetchShips, fetchDailyIncomes, fetchExpenses, fetchProfits]);

  /* DATE BASED COMPUTATION */
  const todayStr = format(selectedDate, "yyyy-MM-dd");
  const monthStr = format(selectedDate, "yyyy-MM");

  const todayTotal = dailyIncomes
    .filter((i) => i.date === todayStr)
    .reduce((s, x) => s + parseFloat(x.amount || 0), 0);

  const monthIncome = dailyIncomes
    .filter((i) => i.date?.startsWith(monthStr))
    .reduce((s, x) => s + parseFloat(x.amount || 0), 0);

  const monthExpense = expenses
    .filter((e) => e.date?.startsWith(monthStr))
    .reduce((s, x) => s + parseFloat(x.amount || 0), 0);

  const shipCards = ships.map((ship) => {
    const dayIncome = dailyIncomes
      .filter((i) => i.ship === ship.id && i.date === todayStr)
      .reduce((s, x) => s + parseFloat(x.amount || 0), 0);

    const thisMonth = dailyIncomes
      .filter((i) => i.ship === ship.id && i.date?.startsWith(monthStr))
      .reduce((s, x) => s + parseFloat(x.amount || 0), 0);

    const lastMonth = dailyIncomes
      .filter((i) =>
        i.date?.startsWith(format(subMonths(selectedDate, 1), "yyyy-MM"))
      )
      .filter((i) => i.ship === ship.id)
      .reduce((s, x) => s + parseFloat(x.amount || 0), 0);

    const trend = lastMonth ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return { ship, dayIncome, thisMonth, lastMonth, trend };
  });

  /* VIEW */
  return (
    <div className="p-2 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <h1 className="text-3xl md:text-3xl font-bold mb-6">Dashboard</h1>

        {/* DATE SELECTOR */}
        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="border px-3 py-2 rounded mb-6"
        />

        {/* ========== SHIP CARDS ========== */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6 w-[calc(100vw-4rem)] sm:w-full sm:ml-0">
          <h2 className="text-xl font-semibold mb-4">Ship-wise Income</h2>

          {/* Fixed container with proper constraints */}
          <div className="w-full overflow-x-auto">
            <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
              {shipCards.map(
                ({ ship, dayIncome, thisMonth, lastMonth, trend }) => (
                  <div
                    key={ship.id}
                    className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm min-w-0 flex-shrink-0"
                  >
                    <h3 className="font-semibold truncate">{ship.name}</h3>

                    <div className="mt-2 border-b pb-2">
                      <p className="text-xs text-gray-500">Today</p>
                      <p className="text-lg font-bold text-blue-600 truncate">
                        Tk {dayIncome.toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-2 border-b pb-2">
                      <p className="text-xs text-gray-500">This Month</p>
                      <p className="text-lg font-bold text-green-600 truncate">
                        Tk {thisMonth.toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-sm font-bold truncate">
                        Tk {lastMonth.toFixed(2)}
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${
                          trend >= 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ========== BAR CHART ========== */}
        <div className="bg-white hidden md:block shadow-md rounded-lg p-4 mb-6 w-[calc(100vw-4rem)] sm:w-full sm:ml-0">
          <h2 className="text-xl font-semibold mb-4">Daily Income Chart</h2>

          <BarChartComponent
            ships={ships}
            dailyIncomes={dailyIncomes}
            selectedDate={selectedDate}
          />
        </div>

        {/* ========== MONTHLY SUMMARY ========== */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6 w-[calc(100vw-4rem)] sm:w-full sm:ml-0">
          <h2 className="text-xl font-semibold mb-4">
            Monthly Summary – {format(selectedDate, "MMMM yyyy")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                Tk {monthIncome.toFixed(2)}
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                Tk {monthExpense.toFixed(2)}
              </p>
            </div>

            <div
              className={`border-l-4 pl-4 ${
                monthIncome - monthExpense >= 0
                  ? "border-green-500"
                  : "border-red-500"
              }`}
            >
              <p className="text-gray-600">Net Profit</p>
              <p
                className={`text-2xl font-bold ${
                  monthIncome - monthExpense >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Tk {(monthIncome - monthExpense).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* ========== MONTHLY PROFIT TABLE ========== */}
        <div className="bg-white hidden md:block shadow-md rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Monthly Profit History</h2>
            <button
              onClick={() => calculateProfit(selectedDate)}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm md:text-base"
            >
              Calculate
            </button>
          </div>

          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Ship</th>
                  <th className="px-3 py-2 text-left">Month</th>
                  <th className="px-3 py-2 text-right">Income</th>
                  <th className="px-3 py-2 text-right">Expenses</th>
                  <th className="px-3 py-2 text-right">Net Profit</th>
                  <th className="px-3 py-2 text-center">Trend</th>
                </tr>
              </thead>
              <tbody>{/* Your table rows here */}</tbody>
            </table>
          </div>

          {/* Mobile Cards (visible only on mobile) */}
          <div className="md:hidden space-y-4">
            {profitList.length === 0 ? (
              <div className="text-gray-600 text-center py-4">
                No records found
              </div>
            ) : (
              profitList.map((p, index) => {
                const prevProfit =
                  index > 0 ? profitList[index - 1].net_profit : p.net_profit;
                const trend = p.net_profit - prevProfit;

                return (
                  <div key={p.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{p.ship_name}</span>
                      <span className="text-sm text-gray-600">
                        {format(new Date(p.month), "MMM yyyy")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Income:</span>
                        <span className="ml-2">
                          Tk {parseFloat(p.total_income).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Expenses:</span>
                        <span className="ml-2">
                          Tk {parseFloat(p.total_expenses).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Net Profit:</span>
                        <span
                          className={`ml-2 ${
                            p.net_profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Tk {parseFloat(p.net_profit).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Trend:</span>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs ${
                            trend >= 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
