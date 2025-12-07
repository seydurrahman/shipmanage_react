import React, { useState } from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      {/* SIDEBAR */}
      <Sidebar isOpen={isOpen} closeSidebar={() => setIsOpen(false)} />

      {/* MAIN CONTENT */}
      <div className="flex-1">
        {/* TOP BAR WITH HAMBURGER */}
        <div className="p-4 bg-white border-b flex md:hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="text-2xl"
          >
            ☰
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
