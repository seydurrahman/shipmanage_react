import React, { useState } from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* SIDEBAR */}
      <Sidebar isOpen={isOpen} closeSidebar={() => setIsOpen(false)} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* MOBILE TOP BAR */}
        <div className="p-4 bg-white border-b md:hidden flex justify-between items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="text-2xl"
          >
            ☰
          </button>

          <h2 className="text-lg font-semibold">Ship Management</h2>
        </div>

        {/* CONTENT AREA */}
        <div className="p-4 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
