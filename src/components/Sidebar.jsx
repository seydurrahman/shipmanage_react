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
        className={`fixed md:static z-50 top-0 left-0 h-full w-72 bg-white border-r shadow-lg 
                    transform transition-transform duration-300
                    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Ship Management</h2>

          {/* CLOSE BUTTON for mobile */}
          <button
            className="md:hidden text-xl"
            onClick={closeSidebar}
          >
            ✖
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {/* Dashboard */}
          <Link
            to="/"
            onClick={closeSidebar}
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
              className="w-full text-left px-3 py-2 rounded hover:bg-blue-500 transition font-semibold"
            >
              📊 Data Entry
            </button>

            {openData && (
              <div className="pl-4 mt-2 space-y-1 text-left">
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
                        : ""
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Reports */}
          <div>
            <button
              type="button"
              onClick={() => setOpenReports((s) => !s)}
              className="w-full text-left px-3 py-2 rounded hover:bg-blue-500 transition font-semibold"
            >
              📈 Reports
            </button>

            {openReports && (
              <div className="pl-4 mt-2 space-y-1 text-left">
                <Link
                  to="/partner-report"
                  onClick={closeSidebar}
                  className={`block px-2 py-1 rounded hover:bg-gray-100 transition ${
                    location.pathname === "/partner-report"
                      ? "bg-blue-100 font-semibold text-blue-700"
                      : ""
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
                      : ""
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
