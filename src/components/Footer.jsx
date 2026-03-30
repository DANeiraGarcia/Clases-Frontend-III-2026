import styles from "./styles/Footer.module.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p className={styles.text}>© {year} Sistema Ventas</p>
    </footer>
  );
}

export default Footer
