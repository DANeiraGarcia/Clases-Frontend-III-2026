import styles from "./Header.module.css";
import Navbar from "./Navbar";

function Header({ activePage, onNavigate, user, onSignIn, onSignOut }) {
  return (
    <header className={styles.header}>
      <Navbar
        activePage={activePage}
        onNavigate={onNavigate}
        user={user}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
      />
    </header>
  );
}

export default Header;


