import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Shield, Lock, User } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await adminApi.login({
        username,
        password
      });

      if (response.success) {
        // Login successful - redirect to admin dashboard
        console.log('Login successful:', response.data);
        
        // Navigate to admin dashboard
        navigate('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // CSS Styles
  const styles: { [key: string]: CSSProperties } = {
    adminLoginPage: {
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflow: 'hidden',
    },
    adminLoginBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      zIndex: -1,
    },
    gradientBlob: {
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(40px)',
      animation: 'blob 7s infinite',
    },
    blob1: {
      width: '300px',
      height: '300px',
      background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
      top: '10%',
      left: '10%',
      animationDelay: '0s',
    },
    blob2: {
      width: '200px',
      height: '200px',
      background: 'linear-gradient(45deg, #a55eea, #3742fa)',
      top: '60%',
      right: '10%',
      animationDelay: '2s',
    },
    blob3: {
      width: '250px',
      height: '250px',
      background: 'linear-gradient(45deg, #26de81, #20bf6b)',
      bottom: '20%',
      left: '20%',
      animationDelay: '4s',
    },
    adminLoginContainer: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '3rem',
      width: '100%',
      maxWidth: '420px',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
      animation: 'fadeInScale 0.6s ease-out',
    },
    adminLoginHeader: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    adminIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '50%',
      marginBottom: '1rem',
      color: 'white',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
      animation: 'float 3s ease-in-out infinite',
    },
    adminHeaderH1: {
      color: 'white',
      fontSize: '2rem',
      fontWeight: 700,
      margin: '0 0 0.5rem 0',
      textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    },
    adminHeaderP: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.95rem',
      margin: 0,
    },
    adminLoginForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    formLabel: {
      color: 'white',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
    },
    adminInput: {
      padding: '0.875rem 1rem',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
    },
    spinner: {
      width: '18px',
      height: '18px',
      border: '2px solid transparent',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    errorMessage: {
      padding: '0.75rem 1rem',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '8px',
      color: '#fca5a5',
      fontSize: '0.9rem',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      animation: 'slideInFromBottom 0.3s ease-out',
    },
  };

  const buttonStyle: CSSProperties = {
    padding: '1rem',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    opacity: isLoading ? 0.8 : 1,
    pointerEvents: isLoading ? 'none' : 'auto',
  };

  // Keyframes for animations
  const keyframes = `
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes slideInFromBottom {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    input::placeholder {
      color: rgba(255, 255, 255, 0.6) !important;
    }
    
    input:focus::placeholder {
      color: rgba(255, 255, 255, 0.4) !important;
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.adminLoginPage}>
        {/* Background with gradient */}
        <div style={styles.adminLoginBackground}>
          <div style={{...styles.gradientBlob, ...styles.blob1}}></div>
          <div style={{...styles.gradientBlob, ...styles.blob2}}></div>
          <div style={{...styles.gradientBlob, ...styles.blob3}}></div>
        </div>
        
        <div style={styles.adminLoginContainer}>
          {/* Header */}
          <div style={styles.adminLoginHeader}>
            <div style={styles.adminIcon}>
              <Shield size={32} />
            </div>
            <h1 style={styles.adminHeaderH1}>Admin Portal</h1>
            <p style={styles.adminHeaderP}>Secure access to administrative functions</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} style={styles.adminLoginForm}>
            <div style={styles.formGroup}>
              <label htmlFor="username" style={styles.formLabel}>
                <User size={18} />
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  ...styles.adminInput,
                  opacity: isLoading ? 0.7 : 1,
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.formLabel}>
                <Lock size={18} />
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  ...styles.adminInput,
                  opacity: isLoading ? 0.7 : 1,
                }}
              />
            </div>

            {error && (
              <div style={styles.errorMessage}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              style={buttonStyle}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div style={styles.spinner}></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
