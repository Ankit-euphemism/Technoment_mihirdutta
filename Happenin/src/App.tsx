import { Suspense, lazy, useMemo, useState, type ReactNode } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import type { Event } from './types';
import { useEvents } from './hooks/useEvent';
import './App.css';

const RealTimeMap = lazy(() => import('./components/features/events/RealTimeMap'));
const AddEventForm = lazy(() => import('./components/features/events/AddEventForm'));
const EventDetail = lazy(() => import('./components/features/ticketing/EventDetail'));
const MyTickets = lazy(() => import('./components/features/ticketing/MyTickets'));

interface EventsPageProps {
  events: Event[];
  loadingEvents: boolean;
  eventsError: string | null;
  onOpenEvent: (eventId: string) => void;
  onCreatedEvent: (eventId: string) => void;
}

interface EventDetailPageProps {
  events: Event[];
  loadingEvents: boolean;
  eventsError: string | null;
  userId: string;
}

const PageCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="page-card">
    <h2 className="page-card-title">{title}</h2>
    {children}
  </section>
);

const EventsPage = ({ events, loadingEvents, eventsError, onOpenEvent, onCreatedEvent }: EventsPageProps) => (
  <div className="page-stack">
    <PageCard title="Create Event">
      <Suspense fallback={<p className="status-text">Loading form...</p>}>
        <AddEventForm onCreated={onCreatedEvent} />
      </Suspense>
    </PageCard>

    <PageCard title="Events">
      {loadingEvents && <p className="status-text">Loading events...</p>}
      {!loadingEvents && eventsError && <p className="status-text error-text">{eventsError}</p>}
      {!loadingEvents && !eventsError && events.length === 0 && (
        <p className="status-text">No events found. Add your first event above.</p>
      )}

      {!loadingEvents && !eventsError && events.length > 0 && (
        <div className="event-list">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => onOpenEvent(event.id)}
              className="event-list-item"
            >
              <p className="event-title">{event.title}</p>
              <p className="event-location">{event.location}</p>
              <p className="event-capacity">Capacity: {event.max_capacity}</p>
            </button>
          ))}
        </div>
      )}
    </PageCard>
  </div>
);

const EventDetailPage = ({ events, loadingEvents, eventsError, userId }: EventDetailPageProps) => {
  const params = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === params.eventId) ?? null,
    [events, params.eventId]
  );

  if (loadingEvents) {
    return <PageCard title="Event Details"><p className="status-text">Loading event...</p></PageCard>;
  }

  if (eventsError) {
    return <PageCard title="Event Details"><p className="status-text error-text">{eventsError}</p></PageCard>;
  }

  if (!selectedEvent) {
    return (
      <PageCard title="Event Details">
        <p className="status-text">Event not found.</p>
        <button className="inline-action" onClick={() => navigate('/events')}>Back to Events</button>
      </PageCard>
    );
  }

  return (
    <section className="page-card">
      <Suspense fallback={<p className="status-text">Loading event details...</p>}>
        <EventDetail event={selectedEvent} userId={userId} onClose={() => navigate('/events')} />
      </Suspense>
    </section>
  );
};

function App() {
  const navigate = useNavigate();
  const { events, loading: loadingEvents, error: eventsError } = useEvents();
  const [userId, setUserId] = useState<string>('demo-user-id');

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Happenin - Real Time Events</h1>
        <p className="app-subtitle">Supabase-integrated events, ticketing, and live crowd metrics</p>

        <section className="user-card">
          <h2 className="user-card-title">Demo User (for tickets section)</h2>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Supabase user id"
            className="user-input"
          />
        </section>

        <nav className="main-nav" aria-label="Primary">
          <NavLink to="/map" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Live Map
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Events & Create
          </NavLink>
          <NavLink to="/tickets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            My Tickets
          </NavLink>
        </nav>
      </header>

      <main>
        <Suspense fallback={<p className="status-text">Loading page...</p>}>
          <Routes>
            <Route path="/" element={<Navigate to="/map" replace />} />
            <Route
              path="/map"
              element={
                <PageCard title="Live Event Map">
                  <RealTimeMap events={events} loading={loadingEvents} error={eventsError} />
                </PageCard>
              }
            />
            <Route
              path="/events"
              element={
                <EventsPage
                  events={events}
                  loadingEvents={loadingEvents}
                  eventsError={eventsError}
                  onOpenEvent={(eventId) => navigate(`/events/${eventId}`)}
                  onCreatedEvent={(eventId) => navigate(`/events/${eventId}`)}
                />
              }
            />
            <Route
              path="/events/:eventId"
              element={
                <EventDetailPage
                  events={events}
                  loadingEvents={loadingEvents}
                  eventsError={eventsError}
                  userId={userId}
                />
              }
            />
            <Route
              path="/tickets"
              element={
                <PageCard title="My Tickets">
                  <MyTickets userId={userId || null} />
                </PageCard>
              }
            />
            <Route path="*" element={<Navigate to="/map" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
