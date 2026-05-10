import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import axiosClient from '../lib/axiosClient';
import useAuth from '../hooks/useAuth';
import styles from '../page/styles/AuthPage.module.css';

function Register() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (values.password !== values.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const res = await axiosClient.post('/auth/register', {
        email: values.email.trim(),
        password: values.password,
        firstName: values.name.trim(),
        lastName: '',
      });
      register(res.data);
      navigate('/user/profile', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo crear la cuenta.');
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}></p>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>
          Registra un usuario para iniciar sesión, y asociar compras a tu
          perfil.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Nombre</span>
            <input
              className={styles.input}
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="Ejemplo: Ana Gómez"
            />
          </label>

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

          <label className={styles.field}>
            <span className={styles.label}>Confirmar contraseña</span>
            <input
              className={styles.input}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              type="password"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.primaryButton}>
            Crear cuenta
          </button>
        </form>

        <p className={styles.helperText}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>.
        </p>
      </div>
    </section>
  );
}

export default Register;