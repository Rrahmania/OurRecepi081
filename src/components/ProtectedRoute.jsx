// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // 1. Ambil status login dari Local Storage
  const user = JSON.parse(localStorage.getItem('user'));

  // 2. Cek apakah pengguna ada
  if (!user) {
    // Jika user tidak ada (belum login), redirect ke halaman /login
    // 'replace: true' memastikan halaman yang di-redirect tidak disimpan di histori
    return <Navigate to="/login" replace={true} />;
  }

  // 3. Jika user ada (sudah login), tampilkan children (halaman tujuan)
  return children;
};

export default ProtectedRoute;