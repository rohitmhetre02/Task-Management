import React, { useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [msg, setMsg] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      // Redirect admins to admin dashboard
      if (res.data.user?.role === 'admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
    },
    formContainer: {
      padding: '2rem',
      boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
      borderRadius: '10px',
      backgroundColor: 'white',
      width: '300px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    input: {
      margin: '0.5rem 0',
      padding: '0.75rem',
      border: '1px solid #ccc',
      borderRadius: '5px',
    },
    button: {
      padding: '0.75rem',
      border: 'none',
      borderRadius: '5px',
      backgroundColor: '#007bff',
      color: 'white',
      cursor: 'pointer',
      marginTop: '1rem',
    },
    signUpLink: {
        marginTop: '1rem',
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#666',
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        textDecoration: 'underline',
        fontSize: '0.9rem',
        padding: 0,
        marginLeft: '0.25rem',
    },
    title: {
      textAlign: 'center',
      marginBottom: '1rem',
    },
    message: {
      color: 'red',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Login</h2>
        {msg && <p style={styles.message}>{msg}</p>}
        <form onSubmit={submit} style={styles.form}>
          <input name="email" placeholder="Email" value={form.email} onChange={handle} required style={styles.input} />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle} required style={styles.input} />
          <button style={styles.button}>Login</button>
        </form>
        <div style={styles.signUpLink}>
          Don't have an account? <button onClick={() => navigate('/register')} style={styles.linkButton}>Sign up</button>
        </div>
      </div>
    </div>
  );
}
