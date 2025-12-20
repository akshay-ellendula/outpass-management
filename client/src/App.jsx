import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

//Login pages
import LandingPage from './pages/homePage/HomePage.jsx';
import StudentLoginPage from './pages/authPages/StudentLoginPage.jsx';
import WardenLoginPage from './pages/authPages/WardenLoginPage.jsx';
import SecurityLoginPage from './pages/authPages/SecurityLoginPage.jsx';
import AdminLoginPage from './pages/authPages/AdminLoginPage.jsx';

//admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminWardenPage from './pages/admin/AdminWardenPage.jsx';
// ... etc
function App() {
  return (
    <AuthProvider>
        <Routes>
          
          {/* === PUBLIC ROUTES === */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/student" element={<StudentLoginPage />} />
          <Route path="/login/warden" element={<WardenLoginPage />} />
          <Route path="/login/security" element={<SecurityLoginPage />} />
          <Route path="/login/admin" element={<AdminLoginPage />} />
          {/* Add Security & Admin Login routes here */}

          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/wardens" element={<AdminWardenPage />} />

          {/* === STUDENT PROTECTED ROUTES === */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            {/* <Route path="/student/dashboard" element={<StudentDashboard />} /> */}
            {/* <Route path="/student/apply" element={<ApplyPage />} /> */}
            {/* <Route path="/student/dashboard" element={<h1>Student Dashboard</h1>} />  */}
          </Route>

          {/* === WARDEN PROTECTED ROUTES === */}
          <Route element={<ProtectedRoute allowedRoles={['warden']} />}>
             {/* <Route path="/warden/dashboard" element={<WardenDashboard />} /> */}
             {/* <Route path="/warden/dashboard" element={<h1>Warden Dashboard</h1>} /> */}
          </Route>

          {/* === SECURITY PROTECTED ROUTES === */}
          <Route element={<ProtectedRoute allowedRoles={['security']} />}>
             {/* <Route path="/security/dashboard" element={<h1>Security Dashboard</h1>} /> */}
          </Route>

          {/* === ADMIN PROTECTED ROUTES === */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
             {/* <Route path="/admin/dashboard" element={<h1>Admin Dashboard</h1>} /> */}
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<div>Page Not Found</div>} />

        </Routes>
    </AuthProvider>
  );
}

export default App;