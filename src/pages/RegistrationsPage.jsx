import { useEffect, useState } from "react";

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
  const [updatingRegistrationId, setUpdatingRegistrationId] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [deletingRegistrationId, setDeletingRegistrationId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [sortOrder, setSortOrder] = useState("date-desc");
  const [retryAttempt, setRetryAttempt] = useState(0);

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
  }, [retryAttempt]);

  function retryRegistrations() {
    setErrorMessage("");
    setIsLoading(true);
    setRetryAttempt((currentAttempt) => currentAttempt + 1);
  }

  async function updateStatus(registrationId, status) {
    setUpdatingRegistrationId(registrationId);
    setStatusError("");

    try {
      const response = await fetch(`${SUPABASE_URL}/registrations?id=eq.${registrationId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error("Status kunne ikke opdateres");
      }

      setRegistrations((currentRegistrations) =>
        currentRegistrations.map((registration) =>
          registration.id === registrationId ? { ...registration, status } : registration
        )
      );
    } catch {
      setStatusError("Der opstod en fejl. Status kunne ikke opdateres.");
    } finally {
      setUpdatingRegistrationId(null);
    }
  }

  async function deleteRegistration(registrationId) {
    const shouldDelete = window.confirm("Er du sikker på, at du vil slette denne tilmelding?");

    if (!shouldDelete) {
      return;
    }

    setDeletingRegistrationId(registrationId);
    setDeleteError("");

    try {
      const response = await fetch(`${SUPABASE_URL}/registrations?id=eq.${registrationId}`, {
        method: "DELETE",
        headers
      });

      if (!response.ok) {
        throw new Error("Tilmeldingen kunne ikke slettes");
      }

      setRegistrations((currentRegistrations) =>
        currentRegistrations.filter((registration) => registration.id !== registrationId)
      );
      setRegistrationCount((currentCount) => currentCount - 1);
    } catch {
      setDeleteError("Der opstod en fejl. Tilmeldingen kunne ikke slettes.");
    } finally {
      setDeletingRegistrationId(null);
    }
  }

  const sortedRegistrations = [...registrations].sort((registrationA, registrationB) => {
    if (sortOrder === "name-asc" || sortOrder === "name-desc") {
      const comparison = (registrationA.name ?? "").localeCompare(registrationB.name ?? "", "da");
      return sortOrder === "name-asc" ? comparison : -comparison;
    }

    if (sortOrder === "event-asc" || sortOrder === "event-desc") {
      const eventA = registrationA.events?.title ?? "";
      const eventB = registrationB.events?.title ?? "";
      const comparison = eventA.localeCompare(eventB, "da");
      return sortOrder === "event-asc" ? comparison : -comparison;
    }

    const dateA = Date.parse(registrationA.events?.date ?? "");
    const dateB = Date.parse(registrationB.events?.date ?? "");

    if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0;
    if (Number.isNaN(dateA)) return 1;
    if (Number.isNaN(dateB)) return -1;

    return sortOrder === "date-asc" ? dateA - dateB : dateB - dateA;
  });

  function changeSort(field) {
    setSortOrder((currentSortOrder) => {
      if (currentSortOrder === `${field}-asc`) return `${field}-desc`;
      if (currentSortOrder === `${field}-desc`) return `${field}-asc`;
      return field === "date" ? "date-desc" : `${field}-asc`;
    });
  }

  function sortIndicator(field) {
    if (sortOrder === `${field}-asc`) return " ↑";
    if (sortOrder === `${field}-desc`) return " ↓";
    return "";
  }

  return (
    <>
      <header className="admin-header">
        <p className="eyebrow">Internt overblik</p>
        <h1>Tilmeldinger</h1>
        <p>{registrationCount} tilmeldinger i alt</p>
      </header>
      <main id="main-content" tabIndex={-1}>
        <div className="registration-list">
          {isLoading ? (
            <p role="status">Henter tilmeldinger...</p>
          ) : errorMessage ? (
            <div role="alert">
              <p>{errorMessage}</p>
              <button className="retry-button" type="button" onClick={retryRegistrations}>
                Prøv igen
              </button>
            </div>
          ) : registrations.length === 0 ? (
            <p>Der er ingen tilmeldinger endnu.</p>
          ) : (
            <>
              {statusError && <p role="alert">{statusError}</p>}
              {deleteError && <p role="alert">{deleteError}</p>}
              <div className="registration-row registration-labels">
                <span>
                  <button className="registration-sort-button" type="button" onClick={() => changeSort("name")}>
                    Navn{sortIndicator("name")}
                  </button>
                </span>
                <span>
                  <button className="registration-sort-button" type="button" onClick={() => changeSort("event")}>
                    Event{sortIndicator("event")}
                  </button>
                </span>
                <span>
                  <button className="registration-sort-button" type="button" onClick={() => changeSort("date")}>
                    Dato{sortIndicator("date")}
                  </button>
                </span>
                <span>Status</span>
              </div>
              {sortedRegistrations.map((registration) => (
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
                  <div className="registration-actions">
                    <select
                      className="status"
                      value={registration.status}
                      disabled={updatingRegistrationId !== null}
                      onChange={(inputEvent) => updateStatus(registration.id, inputEvent.target.value)}
                      aria-label={`Status for ${registration.name}`}
                    >
                      {!['pending', 'confirmed', 'cancelled'].includes(registration.status) && (
                        <option value={registration.status} disabled>
                          {registration.status}
                        </option>
                      )}
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                    {updatingRegistrationId === registration.id && <small role="status">Gemmer...</small>}
                    <button
                      className="delete-registration-button"
                      type="button"
                      disabled={deletingRegistrationId === registration.id}
                      onClick={() => deleteRegistration(registration.id)}
                    >
                      {deletingRegistrationId === registration.id ? "Sletter..." : "Slet"}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    </>
  );
}
