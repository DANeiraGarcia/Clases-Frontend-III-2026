import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, loginUser } from '../utils/userStorage';
import styles from '../page/Register.module.css';

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!isLogin && !values.name.trim()) nextErrors.name = 'Ingresa tu nombre.';
    if (!values.email.trim()) nextErrors.email = 'Ingresa tu correo.';
    if (!values.password.trim()) nextErrors.password = 'Ingresa tu contraseña.';
    if (values.password && values.password.length < 6)
      nextErrors.password = 'Mínimo 6 caracteres.';
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (isLogin) {
      const result = loginUser({ email: values.email, password: values.password });
      if (!result.success) {
        setServerError(result.message);
        return;
      }
      onLogin(result.user);
      navigate('/');
    } else {
      const result = saveUser(values);
      if (!result.success) {
        setServerError(result.message);
        return;
      }
      onLogin(result.user);
      navigate('/');
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
        <p className={styles.subtitle}>
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setServerError('');
              setValues({ name: '', email: '', password: '' });
            }}
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>

        {serverError ? <p className={styles.serverError}>{serverError}</p> : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          {!isLogin ? (
            <label className={styles.field}>
              <span className={styles.label}>Nombre</span>
              <input
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
              />
              {errors.name ? <span className={styles.error}>{errors.name}</span> : null}
            </label>
          ) : null}

          <label className={styles.field}>
            <span className={styles.label}>Correo electrónico</span>
            <input
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="Ej: juan@correo.com"
            />
            {errors.email ? <span className={styles.error}>{errors.email}</span> : null}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Contraseña</span>
            <input
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password ? <span className={styles.error}>{errors.password}</span> : null}
          </label>

          <button type="submit" className={styles.primaryButton}>
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Register;