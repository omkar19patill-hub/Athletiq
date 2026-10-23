import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/Landing/LandingPage';
import { CustomerLogin } from '../features/auth/CustomerLogin';
import { CustomerRegister } from '../features/auth/CustomerRegister';
import { AdminLogin } from '../features/auth/AdminLogin';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { VenueList } from '../features/venue/VenueList';
import { VenueDetail } from '../features/venue/VenueDetail';
import { BookingReceipt } from '../features/booking/BookingReceipt';
import { CustomerDashboard } from '../features/dashboard/customer/CustomerDashboard';
import { AdminDashboard } from '../features/dashboard/admin/AdminDashboard';
import { ManageVenues } from '../features/dashboard/admin/ManageVenues';
import { ManageSlots } from '../features/dashboard/admin/ManageSlots';
import { ManageUsers } from '../features/dashboard/admin/ManageUsers';
import { Profile } from '../pages/Profile/Profile';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/register" element={<CustomerRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/venues" element={<VenueList />} />
      <Route path="/venues/:id" element={<VenueDetail />} />

      {/* Authenticated Customer Routes */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute roles={['CUSTOMER']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/bookings"
        element={
          <ProtectedRoute roles={['CUSTOMER']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/favourites"
        element={
          <ProtectedRoute roles={['CUSTOMER']}>
            <VenueList />
          </ProtectedRoute>
        }
      />

      {/* Booking Confirmation / Receipt */}
      <Route
        path="/booking/confirmation/:id"
        element={
          <ProtectedRoute>
            <BookingReceipt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/receipt/:id"
        element={
          <ProtectedRoute>
            <BookingReceipt />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/venues"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <ManageVenues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/venues/new"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <ManageVenues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/slots"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <ManageSlots />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <ManageUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* General Authenticated Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
