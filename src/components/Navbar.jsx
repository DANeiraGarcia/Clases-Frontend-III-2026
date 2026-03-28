import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../assets/react.svg';

function Navbar({ user, onSignOut, cartItemCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = Boolean(user);

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <button type="button" className={styles.brandBtn} onClick={() => navigate('/')}>
          <img className={styles.logo} src={logo} alt="Logo" />
          <span className={styles.brandName}>Sistema Ventas</span>
        </button>
      </div>

      <div className={styles.links}>
        <button
          type="button"
          className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}
          onClick={() => navigate('/')}
        >
          Inicio
        </button>
        <button
          type="button"
          className={`${styles.link} ${location.pathname === '/products' ? styles.active : ''}`}
          onClick={() => navigate('/products')}
        >
          Productos
        </button>
        <button
          type="button"
          className={`${styles.link} ${location.pathname === '/cart' ? styles.active : ''}`}
          onClick={() => navigate('/cart')}
        >
          Carrito
          {cartItemCount > 0 ? <span className={styles.cartBadge}>{cartItemCount}</span> : null}
        </button>
      </div>

      <div className={styles.auth}>
        <button
          type="button"
          className={`${styles.link} ${location.pathname.startsWith('/user') ? styles.active : ''}`}
          onClick={() => navigate(isLoggedIn ? '/user/profile' : '/register')}
        >
          {isLoggedIn ? user.name : 'Invitado'}
        </button>

        {isLoggedIn ? (
          <button type="button" className={styles.authBtn} onClick={() => { onSignOut(); navigate('/'); }}>
            Sign out
          </button>
        ) : (
          <button type="button" className={styles.authBtn} onClick={() => navigate('/register')}>
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;