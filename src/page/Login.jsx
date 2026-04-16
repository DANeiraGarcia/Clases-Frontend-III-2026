import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = login({
      email: values.email.trim(),
      password: values.password,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const nextPath = location.state?.from || '/user/profile';
    navigate(nextPath, { replace: true });
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