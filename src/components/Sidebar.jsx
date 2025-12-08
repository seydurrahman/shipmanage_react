import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const location = useLocation();

  const [openData, setOpenData] = useState(false);
  const [openReports, setOpenReports] = useState(false);

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
        ></div>
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed md:static top-0 left-0 h-full w-72 bg-white border-r shadow-lg z-50 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Ship Management</h2>

          {/* CLOSE ON MOBILE */}
          <button
            className="md:hidden text-xl"
            onClick={closeSidebar}
          >
            ✖
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-64px)]">
          {/* Dashboard */}
          <Link
            to="/"
            onClick={closeSidebar}
            className={`block px-3 py-2 rounded hover:bg-blue-100 transition ${
              location.pathname === "/" || location.pathname === "/dashboard"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-700"
            }`}
          >
            🧮 Dashboard
          </Link>

          {/* DATA ENTRY MENU */}
          <div>
            <button
              type="button"
              onClick={() => setOpenData(!openData)}
              className="w-full flex justify-between items-center px-3 py-2 rounded hover:bg-blue-100 transition text-gray-800 font-semibold"
            >
              <span>📊 Data Entry</span>
              <span>{openData ? "▲" : "▼"}</span>
            </button>

            {openData && (
              <div className="pl-4 mt-2 space-y-1">
                {[
                  ["ships", "Ship Entry"],
                  ["expenses", "Expense Entry"],
                  ["daily-income", "Daily Income Entry"],
                  ["projects", "Project Entry"],
                  ["partners", "Partner Entry"],
                ].map(([path, label]) => (
                  <Link
                    key={path}
                    to={`/${path}`}
                    onClick={closeSidebar}
                    className={`block px-2 py-1 rounded hover:bg-gray-100 transition ${
                      location.pathname === `/${path}`
                        ? "bg-blue-100 font-semibold text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* REPORTS MENU */}
          <div className="hidden md:block">
            <button
              type="button"
              onClick={() => setOpenReports(!openReports)}
              className="w-full flex justify-between items-center px-3 py-2 rounded hover:bg-blue-100 transition text-gray-800 font-semibold"
            >
              <span>📈 Reports</span>
              <span>{openReports ? "▲" : "▼"}</span>
            </button>

            {openReports && (
              <div className="pl-4 mt-2 space-y-1">
                <Link
                  to="/partner-report"
                  onClick={closeSidebar}
                  className={`block px-2 py-1 rounded hover:bg-gray-100 transition ${
                    location.pathname === "/partner-report"
                      ? "bg-blue-100 font-semibold text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  Partner Share Report
                </Link>

                <Link
                  to="/partner-slip"
                  onClick={closeSidebar}
                  className={`block px-2 py-1 rounded hover:bg-gray-100 transition ${
                    location.pathname === "/partner-slip"
                      ? "bg-blue-100 font-semibold text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  Partner Slip
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
