import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // <-- Add
import Dashboard from "./components/Dashboard";
import PartnerReport from "./components/PartnerReport";
import PartnerSlip from "./components/PartnerSlip";
import ShipForm from "./components/forms/ShipForm";
import ExpenseForm from "./components/forms/ExpenseForm";
import ProjectForm from "./components/forms/ProjectForm";
import PartnerForm from "./components/forms/PartnerForm";
import DailyIncomeForm from "./components/forms/DailyIncomeForm";

function App() {
  return (
    <Router>
      <Layout>
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
      </Layout>
    </Router>
  );
}

export default App;
