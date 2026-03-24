import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Eager load: landing page (first paint)
import LandingPage from './pages/public/LandingPage';

// Lazy load: everything else
const BookAppointment = lazy(() => import('./pages/public/BookAppointment'));
const BookingConfirmation = lazy(() => import('./pages/public/BookingConfirmation'));
const InvoicePage = lazy(() => import('./pages/public/InvoicePage'));
const Blog = lazy(() => import('./pages/public/Blog'));
const BlogPost = lazy(() => import('./pages/public/BlogPost'));

const Login = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Appointments = lazy(() => import('./pages/admin/Appointments'));
const AppointmentDetail = lazy(() => import('./pages/admin/AppointmentDetail'));
const Services = lazy(() => import('./pages/admin/Services'));
const Invoices = lazy(() => import('./pages/admin/Invoices'));
const InvoiceView = lazy(() => import('./pages/admin/InvoiceView'));
const NotificationSettings = lazy(() => import('./pages/admin/NotificationSettings'));
const BlogAdmin = lazy(() => import('./pages/admin/BlogAdmin'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));

function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><LandingPage /></Layout>} />
            <Route path="/book" element={<Layout><BookAppointment /></Layout>} />
            <Route path="/booking/:id/confirmation" element={<Layout><BookingConfirmation /></Layout>} />
            <Route path="/invoice/:number" element={<Layout><InvoicePage /></Layout>} />
            <Route path="/blog" element={<Layout><Blog /></Layout>} />
            <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute><AdminLayout><Appointments /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/appointments/:id" element={<ProtectedRoute><AdminLayout><AppointmentDetail /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute><AdminLayout><Services /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/invoices" element={<ProtectedRoute><AdminLayout><Invoices /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/invoices/:id" element={<ProtectedRoute><AdminLayout><InvoiceView /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute><AdminLayout><Analytics /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/blog" element={<ProtectedRoute><AdminLayout><BlogAdmin /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><NotificationSettings /></AdminLayout></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
