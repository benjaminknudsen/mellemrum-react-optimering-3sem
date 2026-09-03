import { NavLink } from "react-router";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.siteNav}>
      <NavLink className={styles.brand} to="/">
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
