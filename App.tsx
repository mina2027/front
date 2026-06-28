import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from './contexts/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const BrowseReports = React.lazy(() => import('./pages/BrowseReports').then(module => ({ default: module.BrowseReports })));
const AddReport = React.lazy(() => import('./pages/AddReport').then(module => ({ default: module.AddReport })));
const ReportDetails = React.lazy(() => import('./pages/ReportDetails').then(module => ({ default: module.ReportDetails })));
const MyReports = React.lazy(() => import('./pages/MyReports').then(module => ({ default: module.MyReports })));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel').then(module => ({ default: module.AdminPanel })));
const SignIn = React.lazy(() => import('./pages/SignIn').then(module => ({ default: module.SignIn })));
const SignUp = React.lazy(() => import('./pages/SignUp').then(module => ({ default: module.SignUp })));
const Profile = React.lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Rewards = React.lazy(() => import('./pages/Rewards').then(module => ({ default: module.Rewards })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-luxury-app">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<BrowseReports />} />
                <Route path="/add-report" element={<AddReport />} />
                <Route path="/edit-report/:id" element={<AddReport />} />
                <Route path="/report/:id" element={<ReportDetails />} />
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" richColors />
      </Router>
    </AppProvider>
  );
}

