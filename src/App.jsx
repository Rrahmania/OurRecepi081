import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home.jsx';
import Kategori from './pages/Kategori';
import DetailResep from './pages/DetailResep'; 
import Favorite from './pages/Favorite'; 
import RecipeForm from './components/ResepiForm';
import RecipeList from './components/ResepiList';
import LoginRegister from './pages/LoginRegister'; // Komponen LoginRegister
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext';

// Placeholder yang tidak perlu diubah
const HomePage = () => <div style={{padding: '50px', textAlign: 'center'}}>
    <h1 style={{color: '#DB944B'}}>Selamat Datang di Resep App!</h1>
    <p>Silakan jelajahi resep melalui menu Kategori.</p>
</div>;


function App() {
  return (
    <AuthProvider>
      <Router>
        {/* NAVBAR DITEMPATKAN DI SINI */}
        <Navbar /> 
        
        <main>
          <Routes>
            {/* Rute Umum (Tidak Perlu Login) */}
            <Route path="/" element={<Home />} />
            <Route path="/kategori" element={<Kategori />} /> 
            <Route path="/resep/:id" element={<DetailResep />} /> 
            <Route path="/daftar-resep" element={<RecipeList />} />
            
            {/* Rute Login/Register yang DITINGKATKAN */}
            {/* Mengganti placeholder LoginPage dengan komponen LoginRegister yang sebenarnya */}
            <Route path="/login" element={<LoginRegister />} />
            
            {/* ======================================== */}
            {/* Rute yang DILINDUNGI (Protected Routes) */}
            {/* ======================================== */}
            
            {/* 🔒 Melindungi Halaman Favorite */}
            <Route 
              path="/favorite" 
              element={
                <ProtectedRoute>
                  <Favorite />
                </ProtectedRoute>
              } 
            />
            
            {/* 🔒 Melindungi Halaman Tambah Resep */}
            <Route 
              path="/tambah-resep" 
              element={
                <ProtectedRoute>
                  {/* Menggunakan komponen RecipeForm yang sudah Anda impor */}
                  <RecipeForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Route Fallback */}
            <Route path="*" element={
                <div style={{padding: '50px', textAlign: 'center'}}>
                    <h1 style={{color: 'red'}}>404 - Halaman Tidak Ditemukan</h1>
                </div>
            } />
          </Routes>
        </main>
        
        {/* Anda bisa menambahkan Footer di sini */}
      </Router>
    </AuthProvider>
  );
}

export default App;