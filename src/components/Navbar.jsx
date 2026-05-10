import { NavLink,useLocation, useNavigate } from 'react-router-dom';
import styles from './styles/Navbar.module.css';
import useAuth from '../hooks/useAuth';
import logo from '../assets/react.svg';

function Navbar({ user, onSignOut, cartItemCount = 0 }) {
  const userLabel = user?.firstName ?? user?.name ?? 'Invitado';
  const isLoggedIn = Boolean(user);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isHomeActive = location.pathname === '/' || location.pathname.startsWith('/category/');
  const isCartActive =
    location.pathname === '/cart' ||
    location.pathname === '/checkout' ||
    location.pathname === '/order-confirmation';
  const isAccountActive =
    location.pathname.startsWith('/user/') ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  const handleAccountNavigation = () => {
    navigate(isLoggedIn ? '/user/profile' : '/login');
  };

  const handleSignOut = () => {
    logout();
    onSignOut?.();
    navigate('/', { replace: true });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <img className={styles.logo} src={logo} alt="Logo" />
        <span className={styles.brandName}>Sistema Ventas</span>
      </div>

      <div className={styles.links}>
        <NavLink to="/" end className={() => `${styles.link} ${isHomeActive ? styles.active : ''}`}>
          Inicio
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Productos
        </NavLink>
        <NavLink to="/cart" className={() => `${styles.link} ${isCartActive ? styles.active : ''}`}>
          Carrito
          {cartItemCount > 0 ? <span className={styles.cartBadge}>{cartItemCount}</span> : null}
        </NavLink>
        <button
          type="button"
          className={`${styles.link} ${isAccountActive ? styles.active : ''}`}
          onClick={handleAccountNavigation}
        >
          Mi cuenta
        </button>
      </div>

      <div className={styles.auth}>
        <span className={styles.userName}>{userLabel}</span>

        {isLoggedIn ? (
          <button type="button" className={styles.authBtn} onClick={handleSignOut}>
            Salir
          </button>
        ) : (
          <div className={styles.guestActions}>
            <button type="button" className={styles.authBtn} onClick={() => navigate('/login')}>
              Ingresar
            </button>
            <button
              type="button"
              className={styles.secondaryAuthBtn}
              onClick={() => navigate('/register')}
            >
              Registrarse
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;