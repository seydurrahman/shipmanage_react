import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const [openData, setOpenData] = useState(false);
  const [openReports, setOpenReports] = useState(false);

  return (
    <aside className="w-80 bg-white border-r min-h-screen overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Ship Management</h2>
      </div>
      <nav className="p-4 space-y-2">
        {/* Dashboard */}
        <Link
          to="/"
          className={`block px-3 py-2 rounded hover:bg-blue-500 transition text-left ${
            location.pathname === "/" || location.pathname === "/dashboard"
              ? "font-semibold text-black"
              : ""
          }`}
        >
          🧮 Dashboard
        </Link>

        {/* Data Entry */}
        <div>
          <button
            type="button"
            onClick={() => setOpenData((s) => !s)}
            className={`w-full text-left px-3 py-2 rounded hover:bg-blue-500 transition font-semibold ${
              openData ? "bg-gray-100" : ""
            }`}
          >
            📊 Data Entry
          </button>

          {openData && (
            <div className="pl-4 mt-2 space-y-1 text-left">
              <Link
                to="/ships"
                className={`block px-2 py-1 rounded hover:bg-gray-100 hover:text-blue-700 transition ${
                  location.pathname === "/ships"
                    ? "bg-blue-100 font-semibold text-blue-700"
                    : ""
                }`}
              >
                Ship Entry
              </Link>
              <Link
                to="/expenses"
                className={`block px-2 py-1 rounded hover:bg-gray-100 transition ${
                  location.pathname === "/expenses"
                    ? "bg-blue-100 font-semibold text-blue-700"
                    : ""
                }`}
              >
                Expense Entry
              </Link>
              <Link
                to="/daily-income"
                className={`block px-2 py-1 rounded hover:bg-gray-100 transition ${
                  location.pathname === "/daily-income"
                    ? "bg-blue-100 font-semibold text-blue-700"
                    : ""
                }`}
              >
                Daily Income Entry
              </Link>
              <Link
                to="/projects"
                className={`block px-2 py-1 rounded hover:bg-gray-100 transition ${
                  location.pathname === "/projects"
                    ? "bg-blue-100 font-semibold text-blue-700"
                    : ""
                }`}
              >
                Project Entry
              </Link>
              <Link
                to="/partners"
                className={`block px-2 py-1 rounded hover:bg-gray-100 transition ${
                  location.pathname === "/partners"
                    ? "bg-blue-100 font-semibold text-blue-700"
                    : ""
                }`}
              >
                Partner Entry
              </Link>
            </div>
          )}
        </div>

        {/* Reports */}
        <div >
          <button
            type="button"
            onClick={() => setOpenReports((s) => !s)}
            className={`w-full text-left px-3 py-2 rounded hover:bg-blue-500 transition font-semibold ${
              openReports ? "bg-gray-100" : ""
            }`}
          >
            📈 Reports
          </button>

          {openReports && (
            <div>
              <div className="pl-4 mt-2 space-y-1 text-left">
              <Link
                to="/partner-report"
                className={`block px-2 py-1 rounded hover:bg-gray-100 transition ${
                  location.pathname === "/partner-report"
                    ? "bg-blue-100 font-semibold text-blue-700"
                    : ""
                }`}
              >
                Partner Share Report
              </Link>
            </div>
            <div className="pl-4 mt-2 space-y-1 text-left">
              <Link
                to="/partner-slip"
                className={`block px-2 py-1 rounded hover:bg-gray-100 transition ${
                  location.pathname === "/partner-slip"
                    ? "bg-blue-100 font-semibold text-blue-700"
                    : ""
                }`}
              >
                Partner Slip
              </Link>
            </div>
            </div>
            
          )}
          
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
