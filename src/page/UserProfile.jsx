import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../page/styles/UserProfile.module.css';
import { formatCOP } from '../utils/formatCOP';
import { loadOrdersByUserId } from '../utils/ordersStorage';

function UserProfile({ user, onSignOut }) {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(user);

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <div className={styles.avatar}>👤</div>
        <h1 className={styles.title}>Mi perfil</h1>

        {isLoggedIn ? (
          <>
            <p className={styles.name}>{user.name}</p>
            <p className={styles.email}>{user.email}</p>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => navigate('/user/orders')}
              >
                Ver mis órdenes
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={onSignOut}
              >
                Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.subtitle}>Inicia sesión para ver tu perfil y órdenes.</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => navigate('/register')}
            >
              Iniciar sesión
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default UserProfile;