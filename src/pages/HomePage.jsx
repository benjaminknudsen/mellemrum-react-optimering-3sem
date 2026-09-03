import { useEffect, useState } from "react";
import { Link } from "react-router";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_APIKEY,
  "Content-Type": "application/json"
};

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    async function getEvents() {
      try {
        const response = await fetch(`${SUPABASE_URL}/events?select=*,venues(*)&order=date.asc`, { headers });

        if (!response.ok) {
          throw new Error("Events kunne ikke hentes");
        }

        const data = await response.json();
        setEvents(data);
      } catch {
        setErrorMessage("Der opstod en fejl. Events kunne ikke hentes.");
      } finally {
        setIsLoading(false);
      }
    }

    getEvents();
  }, [retryAttempt]);

  function retryEvents() {
    setErrorMessage("");
    setIsLoading(true);
    setRetryAttempt((currentAttempt) => currentAttempt + 1);
  }

  const categories = ["Alle", ...new Set(events.map((event) => event.category))];

  const filteredEvents = events.filter((event) => {
    const tagsText = Array.isArray(event.tags) ? event.tags.join(" ") : (event.tags ?? "");
    const searchText = `${event.title} ${event.summary} ${event.category ?? ""} ${event.venues?.name ?? ""} ${tagsText}`.toLowerCase();
    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesCategory = category === "Alle" || event.category === category;

    return matchesSearch && matchesCategory;
  });

  function formatEventDate(eventDate) {
    const date = new Date(eventDate);
    const formattedDate = date.toLocaleDateString("da-DK", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  return (
    <>
      <header className="hero">
        <p className="eyebrow">Kultur i Aarhus</p>
        <h1>Find plads til noget nyt.</h1>
        <p className="hero-copy">
          Koncerter, talks og workshops samlet ét sted. Find dit næste event, og tilmeld dig på få minutter.
        </p>
        <a className="hero-link" href="#events">
          Se kommende events ↓
        </a>
      </header>

      <main id="events">
        <section className="section-heading">
          <div>
            <p className="eyebrow dark">Det sker</p>
            <h2>Kommende events</h2>
          </div>
          <p>Kuraterede oplevelser i byen – fra små scener til store idéer.</p>
        </section>

        <section className="filters">
          <label>
            Søg
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Søg efter titel eller sted"
            />
          </label>
          <label>
            Kategori
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="event-grid">
          {isLoading ? (
            <p role="status">Henter events...</p>
          ) : errorMessage ? (
            <div role="alert">
              <p>{errorMessage}</p>
              <button className="retry-button" type="button" onClick={retryEvents}>
                Prøv igen
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <p>{events.length === 0 ? "Der er ingen kommende events." : "Ingen events matcher din søgning."}</p>
          ) : (
            filteredEvents.map((event) => (
              <article className="event-card" key={event.id}>
                <Link className="event-card-link" to={`/events/${event.slug}`}>
                  <img src={event.image} alt="" />
                  <div className="event-card-content">
                    <p className="event-category">{event.category}</p>
                    <h3>{event.title}</h3>
                    <p>{event.summary}</p>
                    <div className="event-meta">
                      <span>{formatEventDate(event.date)}</span>
                      <span>{event.venues?.name ?? "Sted ikke angivet"}</span>
                    </div>
                    <span className="card-link">Læs mere</span>
                  </div>
                </Link>
              </article>
            ))
          )}
        </section>
      </main>
    </>
  );
}
