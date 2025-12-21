import React, { useState } from 'react';
import { Link } from 'react-router'; // Import Link for SPA navigation
import { 
  ShieldCheck, 
  Menu, 
  X, 
  ArrowRight, 
  AlertTriangle, 
  UserCheck, 
  QrCode, 
  Ban, 
  Mail, 
  ClipboardList,
  CheckCircle2
} from 'lucide-react';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/85 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">Smart Outpass</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition font-medium">Features</a>
              <a href="#workflow" className="text-slate-600 hover:text-blue-600 transition font-medium">How it Works</a>
              
              {/* Linked Login Button */}
              <Link to="/login/student">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition shadow-lg shadow-blue-600/20">
                  Login Portal
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-slate-600 focus:outline-none">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-xl">
              <a href="#features" onClick={toggleMenu} className="block text-slate-600 font-medium">Features</a>
              <a href="#workflow" onClick={toggleMenu} className="block text-slate-600 font-medium">How it Works</a>
              <Link to="/login/student" onClick={toggleMenu} className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                Login Portal
              </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-700 font-medium text-sm mb-6">
              Automated Defaulter Detection Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Campus Mobility, <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">
                Secure & Paperless.
              </span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              The complete digital solution for hostel pass management. Streamlining requests for students, approvals for wardens, and gate security with instant QR verification.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Student Login Link */}
              <Link to="/login/student">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-200">
                    Student Login 
                    <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              
              {/* Warden Login Link */}
              <Link to="/login/warden">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition">
                    Warden Dashboard
                </button>
              </Link>
          </div>
        </div>

        {/* Dashboard Preview UI (Static Visuals) */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-transparent rounded-3xl transform -skew-y-2"></div>
          
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-4 md:p-8 max-w-5xl mx-auto">
               <div className="grid md:grid-cols-3 gap-8 items-center">
                  
                  {/* Card 1: Approved */}
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 shadow-sm">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                           <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-slate-800">Day Pass Approved</div>
                           <div className="text-xs text-slate-500">Valid until 9:00 PM</div>
                        </div>
                     </div>
                     <div className="h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                         <QrCode className="w-16 h-16 text-slate-400" />
                     </div>
                  </div>

                  {/* Card 2: Blocked */}
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                           <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-slate-800">Pass Creation Blocked</div>
                           <div className="text-xs text-red-500 font-semibold">Defaulter Status Active</div>
                        </div>
                     </div>
                     <div className="space-y-3 pt-2">
                        <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                        <div className="mt-4 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">
                           Please contact Warden to clear status.
                        </div>
                     </div>
                  </div>

                  {/* Card 3: Guardian */}
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 shadow-sm">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                           <UserCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-slate-800">Guardian Approval</div>
                           <div className="text-xs text-slate-500">Home Pass Request</div>
                        </div>
                     </div>
                     <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded transition">
                         View Email Request
                     </button>
                  </div>
               </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900">Intelligent Campus Security</h2>
                <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Built for speed, compliance, and transparency. The system handles the logic so you can handle the campus.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Feature 1 */}
                <div className="p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition duration-300 border border-transparent hover:border-slate-100 group">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition">
                        <QrCode className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Secure QR Entry</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Unique, time-sensitive QR codes for every pass. Instant scanning at the gate prevents unauthorized exits.</p>
                </div>

                {/* Feature 2 */}
                <div className="p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition duration-300 border border-transparent hover:border-slate-100 group">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 border border-slate-100 group-hover:border-red-100 group-hover:bg-red-50 transition">
                        <Ban className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Auto-Defaulter Logic</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Late returns automatically flag students as defaulters, blocking future pass creation until cleared by a Warden.</p>
                </div>

                {/* Feature 3 */}
                <div className="p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition duration-300 border border-transparent hover:border-slate-100 group">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50 transition">
                        <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Parent Loop</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Home passes require explicit email approval from guardians before the warden even sees the request.</p>
                </div>

                {/* Feature 4 */}
                <div className="p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition duration-300 border border-transparent hover:border-slate-100 group">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 border border-slate-100 group-hover:border-orange-100 group-hover:bg-orange-50 transition">
                        <ClipboardList className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Real-time Logs</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Live tracking of who is out, who is late, and accurate timestamping for entry and exit movements.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">A Seamless Workflow</h2>
                    <div className="space-y-8">
                        {/* Step 1 */}
                        <div className="flex gap-4">
                            <div className="shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/30">
                                01
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Request & Verify</h3>
                                <p className="text-slate-600">Student requests a pass. System checks for Defaulter status instantly. If clear, request proceeds to Warden or Parent.</p>
                            </div>
                        </div>
                        {/* Step 2 */}
                        <div className="flex gap-4">
                            <div className="shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/30">
                                02
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Digital Approval</h3>
                                <p className="text-slate-600">Warden approves Day Passes. Parents verify Home Passes via secure email links.</p>
                            </div>
                        </div>
                        {/* Step 3 */}
                        <div className="flex gap-4">
                            <div className="shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/30">
                                03
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Scan & Go</h3>
                                <p className="text-slate-600">Approved pass generates a QR code. Security scans it at the gate. Return time is logged automatically.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck className="w-6 h-6 text-blue-500" />
                        <span className="font-bold text-xl text-white">Smart Outpass</span>
                    </div>
                    <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
                        Digitizing campus security with role-based access control and automated compliance tracking.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">Platform</h4>
                    <ul className="space-y-2 text-sm">
                        {/* Updated to use Link components pointing to actual routes */}
                        <li><Link to="/login/student" className="hover:text-blue-400 transition">Student Login</Link></li>
                        <li><Link to="/login/warden" className="hover:text-blue-400 transition">Warden Portal</Link></li>
                        <li><Link to="/login/security" className="hover:text-blue-400 transition">Security Gate</Link></li>
                        {/* Added Admin Login Link */}
                        <li><Link to="/login/admin" className="hover:text-blue-400 transition text-blue-300">Admin Login</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">Support</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-blue-400 transition">System Status</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">Report Bug</a></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                &copy; 2025 Smart Outpass Management System. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;