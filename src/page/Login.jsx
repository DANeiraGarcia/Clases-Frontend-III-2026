import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import axiosClient from '../lib/axiosClient';
import useAuth from '../hooks/useAuth';
import styles from '../page/styles/AuthPage.module.css';

function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Con Axios: lanza excepción si el servidor responde con error (4xx, 5xx)
      // La respuesta exitosa llega directamente en res.data
      const res = await axiosClient.post('/auth/login', {
        email: values.email.trim(),
        password: values.password,
      });
      login(res.data);

      const nextPath = location.state?.from || '/user/profile';
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Credenciales inválidas.');
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Semana 11</p>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>
          Accede a tu cuenta para proteger el checkout y consultar un historial propio de órdenes.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Correo electrónico</span>
            <input
              className={styles.input}
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="correo@dominio.com"
              type="email"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Contraseña</span>
            <input
              className={styles.input}
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              type="password"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.primaryButton}>
            Ingresar
          </button>
        </form>

        <p className={styles.helperText}>
          ¿Todavía no tienes cuenta? <Link to="/register">Regístrate aquí</Link>.
        </p>
      </div>
    </section>
  );
}

export default Login;