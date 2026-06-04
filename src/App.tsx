import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SchoolDashboard from './pages/school/SchoolDashboard';
import ViewQuotations from './pages/school/ViewQuotations';
import VendorDashboard from './pages/vendor/VendorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SchoolProfile from './pages/school/SchoolProfile';
import VendorProfile from './pages/vendor/VendorProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/school/dashboard" element={<SchoolDashboard />} />
        <Route path="/school/profile" element={<SchoolProfile />} />
        <Route path="/school/rfq/:rfqId/quotations" element={<ViewQuotations />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/vendor/profile" element={<VendorProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;