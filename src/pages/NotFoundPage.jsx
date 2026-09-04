import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <>
      <header>
        <h1 className="not-found-title">404</h1>
      </header>
      <main id="main-content" className="not-found" tabIndex={-1}>
        <p>Siden, du leder efter, findes ikke.</p>
        <Link to="/" className="not-found-link">
          Gå til forsiden
        </Link>
      </main>
    </>
  );
}
