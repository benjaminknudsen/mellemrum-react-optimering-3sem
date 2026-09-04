import { NavLink, useLocation } from "react-router";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { pathname } = useLocation();

  function handleBrandClick() {
    if (pathname === "/") {
      window.scrollTo(0, 0);
    }
  }

  return (
    <nav className={styles.siteNav}>
      <NavLink className={styles.brand} to="/" onClick={handleBrandClick}>
        mellemrum<span>.</span>
      </NavLink>
      <div className={styles.navLinks}>
        <NavLink className={({ isActive }) => (isActive ? styles.active : undefined)} to="/">
          Events
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? styles.active : undefined)} to="/om">
          Om Mellemrum
        </NavLink>
      </div>
    </nav>
  );
}
