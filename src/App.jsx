import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import PartnerReport from "./components/PartnerReport";
import PartnerSlip from "./components/PartnerSlip";
import ShipForm from "./components/forms/ShipForm";
import ExpenseForm from "./components/forms/ExpenseForm";
import ProjectForm from "./components/forms/ProjectForm";
import PartnerForm from "./components/forms/PartnerForm";
import DailyIncomeForm from "./components/forms/DailyIncomeForm";

import "./App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-0" : "ml-0"
          }`}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ships" element={<ShipForm />} />
            <Route path="/expenses" element={<ExpenseForm />} />
            <Route path="/projects" element={<ProjectForm />} />
            <Route path="/partners" element={<PartnerForm />} />
            <Route path="/daily-income" element={<DailyIncomeForm />} />
            <Route path="/partner-report" element={<PartnerReport />} />
            <Route path="/partner-slip" element={<PartnerSlip />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
