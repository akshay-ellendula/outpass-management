import { BrowserRouter as Router, Routes, Route } from "react-router"; // or "react-router-dom"
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

//public pages
import LandingPage from "./pages/homePage/HomePage.jsx";
import GuardianApprovalPage from "./pages/public/GuardianApprovalPage.jsx";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/public/ResetPasswordPage.jsx";


// Login pages
import StudentLoginPage from "./pages/authPages/StudentLoginPage.jsx";
import WardenLoginPage from "./pages/authPages/WardenLoginPage.jsx";
import SecurityLoginPage from "./pages/authPages/SecurityLoginPage.jsx";
import AdminLoginPage from "./pages/authPages/AdminLoginPage.jsx";

// Admin pages & Components
import AdminLayout from "./pages/admin/components/AdminLayout.jsx"; // Ensure this path matches where you saved it
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminWardenPage from "./pages/admin/AdminWardenPage.jsx";
import AdminAddWardenPage from "./pages/admin/AdminAddWardenPage.jsx";
import AdminWardenDetailsPage from "./pages/admin/AdminWardenDetailsPage.jsx";
import AdminSecurityPage from "./pages/admin/AdminSecurityPage.jsx";
import AdminAddSecurityPage from "./pages/admin/AdminAddSecurityPage.jsx";
import AdminSecurityDetailsPage from "./pages/admin/AdminSecurityDetailsPage.jsx";
import AdminStudentPage from "./pages/admin/AdminStudentPage.jsx";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.jsx";

// warden pages & Components
import WardenLayout from "./pages/warden/components/WardenLayout.jsx"; // Ensure this path matches where you saved it
import WardenDashboardPage from "./pages/warden/WardenDashboardPage.jsx";
import WardenPassRequestsPage from "./pages/warden/WardenPassRequestsPage.jsx";
import WardenAddStudentPage from "./pages/warden/WardenAddStudentPage.jsx";
import WardenStudentsPage from "./pages/warden/WardenStudentPage.jsx";
import WardenStudentProfile from "./pages/warden/WardenStudentProfile.jsx";
import WardenSecurityPage from "./pages/warden/WardenSecurityPage";
import WardenAddSecurityPage from "./pages/warden/WardenAddSecurityPage";
import WardenSecurityProfile from "./pages/warden/WardenSecurityProfile";
import WaedenProfilePage from "./pages/warden/WardenProfilePage.jsx";
import WardenDefaultersPage from "./pages/warden/WardenDefaultersPage.jsx";
import WardenEditRequestsPage from "./pages/warden/WardenEditRequestsPage.jsx";

// Student pages & Components
import StudentLayout from "./pages/student/components/StudentLayout.jsx";
import StudentDashboard from "./pages/student/StudentDashboardPage.jsx";
import StudentApplyHomePass from "./pages/student/StudentApplyHomePass.jsx";
import StudentApplyDayPass from "./pages/student/StudentApplyDayPass.jsx";
import StudentPassTicket from "./pages/student/StudentPassTicket";
import StudentRequestProfileUpdate from "./pages/student/StudentRequestProfileUpdate.jsx";
import StudentProfilePage from "./pages/student/studentProfilePage.jsx";


// Security Pages & components
import SecurityLayout from "./pages/security/components/SecurityLayout.jsx";
import SecurityScanPage from "./pages/security/SecurityScanPage.jsx";
import SecurityLogsPage from "./pages/security/SecurityLogsPage.jsx";
import SecurityProfilePage from "./pages/security/SecurityProfilePage.jsx";


function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Routes>
        {/* === PUBLIC ROUTES === */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/guardian/approve/:token" element={<GuardianApprovalPage />} />
        <Route path="/login/student" element={<StudentLoginPage />} />
        <Route path="/login/warden" element={<WardenLoginPage />} />
        <Route path="/login/security" element={<SecurityLoginPage />} />
        <Route path="/login/admin" element={<AdminLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* === STUDENT PROTECTED ROUTES === */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          {/* 2. Apply Admin Layout (Sidebar + Header) */}
          <Route element={<StudentLayout />}>
            {/* 3. Render specific page inside the Layout's Outlet */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/apply/home" element={<StudentApplyHomePass />} />
            <Route path="/student/apply/day" element={<StudentApplyDayPass />} /> 
            <Route path="/student/pass/:id" element={<StudentPassTicket />} />
            <Route path="/student/profile/edit" element={<StudentRequestProfileUpdate />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
          </Route>
        </Route>

        {/* === WARDEN PROTECTED ROUTES === */}
        <Route element={<ProtectedRoute allowedRoles={["warden"]} />}>
          {/* 2. Apply Admin Layout (Sidebar + Header) */}
          <Route element={<WardenLayout />}>
            {/* 3. Render specific page inside the Layout's Outlet */}
            <Route path="/warden/dashboard" element={<WardenDashboardPage />} />
            <Route path="/warden/approvals" element={<WardenPassRequestsPage />} />
            <Route path="/warden/students" element={<WardenStudentsPage />} />
            <Route path="/warden/students/add" element={<WardenAddStudentPage />} />
            <Route path="/warden/students/:id" element={<WardenStudentProfile />} />
            <Route path="/warden/security" element={<WardenSecurityPage />} />
            <Route path="/warden/security/add" element={<WardenAddSecurityPage />} />
            <Route path="/warden/security/:id" element={<WardenSecurityProfile />} />
            <Route path="/warden/profile" element={<WaedenProfilePage />} />
            <Route path="/warden/defaulters" element={<WardenDefaultersPage />} />
            <Route path="/warden/requests" element={<WardenEditRequestsPage />} />

            {/* Add future warden routes here, e.g.: */}
            {/* <Route path="/warden/guards" element={<WardenSecurityPage />} /> */}
           
          </Route>
        </Route>

        {/* === SECURITY PROTECTED ROUTES === */}
        <Route element={<ProtectedRoute allowedRoles={["security"]} />}>
          {/* 2. Apply Security Layout (Sidebar + Header) */}
          <Route element={<SecurityLayout />}>
            {/* 3. Render specific page inside the Layout's Outlet */}
            <Route path="/security/dashboard" element={<SecurityScanPage />} />
            <Route path="/security/logs" element={<SecurityLogsPage />} />
            <Route path="/security/profile" element={<SecurityProfilePage />} />
          </Route>
        </Route>

        {/* === ADMIN PROTECTED ROUTES === */}
        {/* 1. Check if user is Admin (ProtectedRoute) */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          
          {/* 2. Apply Admin Layout (Sidebar + Header) */}
          <Route element={<AdminLayout />}>
            
            {/* 3. Render specific page inside the Layout's Outlet */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/wardens" element={<AdminWardenPage />} />
            <Route path="/admin/wardens/add" element={<AdminAddWardenPage />} />
            <Route path="/admin/wardens/:id" element={<AdminWardenDetailsPage />} />
            <Route path="/admin/guards" element={<AdminSecurityPage />} />
            <Route path="/admin/guards/add" element={<AdminAddSecurityPage />} />
            <Route path="/admin/guards/:id" element={<AdminSecurityDetailsPage />} />
            <Route path="/admin/students" element={<AdminStudentPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            
            {/* Add future admin routes here, e.g.: */}
            {/* <Route path="/admin/guards" element={<AdminSecurityPage />} /> */}
          </Route>
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;