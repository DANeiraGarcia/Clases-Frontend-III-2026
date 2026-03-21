import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../assets/react.svg';

// elimina activePage y onNavigate, agrega cartItemCount
function Navbar({ user, onSignIn, onSignOut, cartItemCount = 0 }) {
  // reemplaza onNavigate
  const navigate = useNavigate();
  // reemplaza activePage
  const location = useLocation();

  const userLabel = user?.name ?? 'Invitado';
  const isLoggedIn = Boolean(user);

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <img className={styles.logo} src={logo} alt="Logo" />
        <span className={styles.brandName}>Sistema Ventas</span>
      </div>

      <div className={styles.links}>
        <button
          type="button"
          // location.pathname reemplaza activePage === 'home'
          className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}
          // navigate reemplaza onNavigate('home')
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
          {/* badge del carrito, solo aparece si hay items */}
          {cartItemCount > 0 ? <span className={styles.cartBadge}>{cartItemCount}</span> : null}
        </button>
      </div>

      <div className={styles.auth}>
        <span className={styles.userName}>{userLabel}</span>

        {isLoggedIn ? (
          <button type="button" className={styles.authBtn} onClick={onSignOut}>
            Sign out
          </button>
        ) : (
          <button type="button" className={styles.authBtn} onClick={onSignIn}>
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;