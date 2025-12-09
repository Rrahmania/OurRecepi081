import React, { useState } from 'react';
import './LoginRegister.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const LoginRegister = () => {
  const [isActive, setIsActive] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpMessage, setSignUpMessage] = useState('');
  const [signUpMessageType, setSignUpMessageType] = useState(''); // 'success' atau 'error'
  const [signInMessage, setSignInMessage] = useState('');
  const [signInMessageType, setSignInMessageType] = useState(''); // 'success' atau 'error'
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegisterClick = () => setIsActive(true);
  const handleLoginClick = () => setIsActive(false);

  // Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpMessage('');
    setIsLoading(true);
    
    if (!name || !email || !password) {
      setSignUpMessage('Lengkapi semua field!');
      setSignUpMessageType('error');
      setIsLoading(false);
      return;
    }

    try {
      await authService.register(name, email, password);
      
      setSignUpMessage('Registrasi berhasil! Silakan login dengan akun Anda.');
      setSignUpMessageType('success');
      
      // Reset form dan kembali ke login form
      setName('');
      setEmail('');
      setPassword('');
      setTimeout(() => setIsActive(false), 1500); // kembali ke form login setelah 1.5 detik
    } catch (error) {
      setSignUpMessage(error.message || 'Registrasi gagal');
      setSignUpMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInMessage('');
    setIsLoading(true);
    
    if (!name || !password) {
      setSignInMessage('Lengkapi semua field!');
      setSignInMessageType('error');
      setIsLoading(false);
      return;
    }

    try {
      await authService.login(name, password);
      
      setSignInMessage('Login berhasil!');
      setSignInMessageType('success');
      
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1000);
    } catch (error) {
      setSignInMessage(error.message || 'Login gagal');
      setSignInMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className={`container ${isActive ? 'active' : ''}`} id="container">
        {/* Sign Up Form */}
        <div className="form-container sign-up">
          <form onSubmit={handleSignUp}>
            <img height="100px" src={logo} alt="Recipe Logo" />
            <h2>Buat Akun</h2>
            <span>Daftar dengan Nama Pengguna, Email & Kata Sandi</span>
            {signUpMessage && (
              <div className={`message ${signUpMessageType}`}>
                {signUpMessage}
              </div>
            )}
            <input type="text" placeholder="Nama Pengguna" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
            <input type="email" placeholder="Masukkan Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
            <input type="password" placeholder="Masukkan Kata Sandi" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
            <button type="submit" disabled={isLoading}>{isLoading ? 'Loading...' : 'Sign Up'}</button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in">
          <form onSubmit={handleSignIn}>
            <img height="100px" src={logo} alt="Recipe Logo" />
            <h2>Sign In</h2>
            <span>Masuk Dengan Nama Pengguna & Kata Sandi</span>
            {signInMessage && (
              <div className={`message ${signInMessageType}`}>
                {signInMessage}
              </div>
            )}
            <input type="text" placeholder="Nama Pengguna" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
            <input type="password" placeholder="Masukkan Kata Sandi" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
            <button type="submit" disabled={isLoading}>{isLoading ? 'Loading...' : 'Sign In'}</button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Selamat Datang</h1>
              <p>Masuk Dengan Nama Pengguna & Kata Sandi</p>
              <button className="hidden" onClick={handleLoginClick}>Sign In</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>SIGN UP</h1>
              <p>Jika Kamu Belum Punya Akun Silakan Daftar Disini</p>
              <button className="hidden" onClick={handleRegisterClick}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;