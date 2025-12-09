import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.png';
import burgerIcon from '../assets/hamburger.png';
import closeIcon from '../assets/tutup.webp';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    window.location.reload(); // refresh supaya langsung kembali ke state tanpa user
  };

  return (
    <div className='navbar'>
      <Link to="/" className='logo-link'> 
        <img src={logo} alt="logo" className='logo'/>
      </Link>
    
      <div className="menu-icon" onClick={toggleMenu}>
        <img 
          src={menuOpen ? closeIcon : burgerIcon} 
          alt={menuOpen ? "tutup" : "menu"} 
          className='burger-img'
        />
      </div>
      
      <ul className={menuOpen ? 'open' : ''}>
        {!user ? (
          <>
            <li><Link to="/login" onClick={toggleMenu} className="login-link">Masuk</Link></li>
            <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/kategori" onClick={toggleMenu}>Kategori</Link></li>
            <li><Link to="/favorite" onClick={toggleMenu}>Favorite</Link></li>
            <li><Link to="/tambah-resep" onClick={toggleMenu}>Tambah Resep</Link></li>
          </>
        ) : (
          <>
            <li className="username">👋 Halo, {user.name}</li>
            <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/kategori" onClick={toggleMenu}>Kategori</Link></li>
            <li><Link to="/favorite" onClick={toggleMenu}>Favorite</Link></li>
            <li>
              <Link to="/tambah-resep" onClick={toggleMenu} className="add-recipe-link">
                <span className="plus-icon">+</span> Tambah Resep
              </Link>
            </li>
            <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Navbar;