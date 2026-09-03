import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getOptimizedUnsplashImage } from "../imageUtils";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_APIKEY,
  "Content-Type": "application/json"
};

export default function EventPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    async function getEvent() {
      setIsLoading(true);
      setFetchError("");
      setEvent(null);

      try {
        const response = await fetch(
          `${SUPABASE_URL}/events?select=*,venues(*)&slug=eq.${encodeURIComponent(slug)}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error("Eventet kunne ikke hentes");
        }

        const data = await response.json();
        setEvent(data[0] ?? null);
      } catch {
        setFetchError("Der opstod en fejl. Eventet kunne ikke hentes.");
      } finally {
        setIsLoading(false);
      }
    }

    getEvent();
  }, [slug]);

  async function handleSubmit(eventSubmit) {
    eventSubmit.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`${SUPABASE_URL}/registrations`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, email, eventId: event.id, status: "Ny" })
      });

      if (!response.ok) {
        throw new Error("Tilmeldingen kunne ikke gemmes");
      }

      setName("");
      setEmail("");
      setSuccessMessage("Din tilmelding er gemt.");
    } catch {
      setErrorMessage("Der opstod en fejl. Prøv igen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <main className="event-page"><p role="status">Henter event...</p></main>;
  }

  if (fetchError) {
    return <main className="event-page"><p role="alert">{fetchError}</p></main>;
  }

  if (!event) {
    return <main className="event-page"><p>Eventet findes ikke.</p></main>;
  }

  const date = new Date(event.date);

  return (
    <>
      <main className="event-page">
        <Link className="back-link" to="/">
          ← Alle events
        </Link>

        <section className="event-detail">
          <img
            src={getOptimizedUnsplashImage(event.image, 1400, 1200, 80)}
            alt=""
          />
          <div className="event-detail-content">
            <p className="event-category">{event.category}</p>
            <h1>{event.title}</h1>
            <p className="lead">{event.summary}</p>
            <div className="detail-list">
              <p>
                <strong>Dato</strong>
                {date.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" })} kl.{" "}
                {date.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p>
                <strong>Sted</strong>
                <span>
                  {event.venues ? (
                    <>
                      {event.venues.name}
                      <br />
                      {event.venues.address}, {event.venues.postalCode} {event.venues.city}
                      {event.venues.website && (
                        <>
                          <br />
                          <a href={event.venues.website}>Besøg venue</a>
                        </>
                      )}
                    </>
                  ) : (
                    "Sted ikke angivet"
                  )}
                </span>
              </p>
              <p>
                <strong>Pris</strong>
                {event.price === 0 ? "Gratis" : `${event.price} kr.`}
              </p>
            </div>
            <p>{event.description}</p>
          </div>
        </section>

        <section className="signup-panel">
          <div>
            <p className="eyebrow dark">Tilmelding</p>
            <h2>Reserver din plads</h2>
            <p>Udfyld formularen, så sender vi din tilmelding til arrangøren.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Navn
              <input required value={name} onChange={(inputEvent) => setName(inputEvent.target.value)} />
            </label>
            <label className="email-label" htmlFor="registration-email">E-mail</label>
            <input
              id="registration-email"
              required
              type="email"
              value={email}
              onChange={(inputEvent) => setEmail(inputEvent.target.value)}
              placeholder="dig@example.com"
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sender..." : "Tilmeld mig"}
            </button>
            {successMessage && <p role="status">{successMessage}</p>}
            {errorMessage && <p role="alert">{errorMessage}</p>}
          </form>
        </section>
      </main>
    </>
  );
}
