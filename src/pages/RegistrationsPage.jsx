import { useEffect, useState } from "react";
import { Link } from "react-router";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_APIKEY,
  "Content-Type": "application/json"
};

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function getRegistrations() {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/registrations?select=*,events(*,venues(*))&order=createdAt.desc`,
          { headers }
        );

        if (!response.ok) {
          throw new Error("Tilmeldingerne kunne ikke hentes");
        }

        const data = await response.json();
        setRegistrations(data);
        setRegistrationCount(data.length);
      } catch {
        setErrorMessage("Der opstod en fejl. Tilmeldingerne kunne ikke hentes.");
      } finally {
        setIsLoading(false);
      }
    }

    getRegistrations();
  }, []);

  return (
    <>
      <header className="admin-header">
        <p className="eyebrow">Internt overblik</p>
        <h1>Tilmeldinger</h1>
        <p>{registrationCount} tilmeldinger i alt</p>
      </header>
      <main>
        <div className="registration-list">
          {isLoading ? (
            <p role="status">Henter tilmeldinger...</p>
          ) : errorMessage ? (
            <p role="alert">{errorMessage}</p>
          ) : registrations.length === 0 ? (
            <p>Der er ingen tilmeldinger endnu.</p>
          ) : (
            <>
              <div className="registration-row registration-labels">
                <span>Navn</span>
                <span>Event</span>
                <span>Dato</span>
                <span>Status</span>
              </div>
              {registrations.map((registration) => (
                <div className="registration-row" key={registration.id}>
                  <div>
                    <strong>{registration.name}</strong>
                    <small>{registration.email}</small>
                  </div>
                  <div>
                    <strong>{registration.events?.title ?? "Event ikke angivet"}</strong>
                    <small>{registration.events?.venues?.name ?? "Sted ikke angivet"}</small>
                  </div>
                  <span>
                    {registration.events?.date
                      ? new Date(registration.events.date).toLocaleDateString("da-DK")
                      : "Dato ikke angivet"}
                  </span>
                  <span className="status">{registration.status}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-intro">
            <p className="footer-brand">
              mellemrum<span>.</span>
            </p>
            <p>Udvalgte kulturoplevelser og nye perspektiver på Aarhus.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <div className="footer-link-group">
              <p className="footer-heading">Udforsk</p>
              <Link to="/">Events</Link>
              <Link to="/om">Om Mellemrum</Link>
            </div>
            <div className="footer-link-group">
              <p className="footer-heading">For arrangører</p>
              <Link to="/tilmeldinger">Se tilmeldinger</Link>
              <a href="mailto:hej@mellemrum.dk">Kontakt os</a>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="footer-meta">© 2025 Mellemrum</p>
          <p>Aarhus, Danmark</p>
        </div>
      </footer>
    </>
  );
}
