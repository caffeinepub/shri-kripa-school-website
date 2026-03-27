import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { AboutPage } from "@/pages/About";
import { AdminPage } from "@/pages/AdminPage";
import { AdmissionsPage } from "@/pages/Admissions";
import { ContactPage } from "@/pages/Contact";
import { EventDetailPage } from "@/pages/EventDetail";
import { GalleryPage } from "@/pages/GalleryPage";
import { HomePage } from "@/pages/Home";
import { TeachersPage } from "@/pages/TeachersPage";
import {
  getEvents,
  getGallery,
  getLeadership,
  getSettings,
  getTeachers,
} from "@/utils/firebaseService";
import type {
  GalleryImage,
  LeadershipMember,
  SchoolEvent,
  SchoolSettings,
  Teacher,
} from "@/utils/storage";
import { DEFAULT_SETTINGS } from "@/utils/storage";
import { useCallback, useEffect, useState } from "react";

// ─── WhatsApp Floating Button ──────────────────────────────────────────────────
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/918449561111"
      target="_blank"
      rel="noopener noreferrer"
      data-ocid="whatsapp.button"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center transition-transform hover:scale-110"
      title="Chat on WhatsApp"
    >
      <svg
        viewBox="0 0 24 24"
        fill="white"
        className="w-7 h-7"
        aria-label="WhatsApp"
        role="img"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

// ─── Hash Router ────────────────────────────────────────────────────────────────
function getPath(): string {
  const hash = window.location.hash.slice(1);
  return hash || "/";
}

export default function App() {
  const [path, setPath] = useState(getPath);
  const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SETTINGS);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handler = () => setPath(getPath());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  // Load data from Firebase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [s, t, g, e, l] = await Promise.all([
          getSettings(),
          getTeachers(),
          getGallery(),
          getEvents(),
          getLeadership(),
        ]);
        setSettings(s);
        setTeachers(t);
        setGallery(g);
        setEvents(e);
        setLeadership(l);
      } catch (err) {
        console.error("Failed to load data from Firebase", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Refresh data when returning from admin panel
  const refreshData = useCallback(async () => {
    try {
      const [s, t, g, e, l] = await Promise.all([
        getSettings(),
        getTeachers(),
        getGallery(),
        getEvents(),
        getLeadership(),
      ]);
      setSettings(s);
      setTeachers(t);
      setGallery(g);
      setEvents(e);
      setLeadership(l);
    } catch (err) {
      console.error("Failed to refresh data", err);
    }
  }, []);

  // Parse event id from path like /events/abc123
  const eventMatch = path.match(/^\/events\/(.+)$/);
  const eventId = eventMatch?.[1];
  const currentEvent = eventId
    ? events.find((e) => e.id === eventId)
    : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy font-semibold">
            Loading Shri Kripa School...
          </p>
        </div>
      </div>
    );
  }

  function renderPage() {
    if (path === "/")
      return (
        <HomePage
          settings={settings}
          teachers={teachers}
          gallery={gallery}
          events={events}
          leadership={leadership}
          navigate={navigate}
        />
      );
    if (path === "/about") return <AboutPage settings={settings} />;
    if (path === "/admissions") return <AdmissionsPage settings={settings} />;
    if (path === "/gallery") return <GalleryPage gallery={gallery} />;
    if (path === "/teachers") return <TeachersPage teachers={teachers} />;
    if (path === "/contact") return <ContactPage settings={settings} />;
    if (path === "/admin")
      return <AdminPage navigate={navigate} onDataChange={refreshData} />;
    if (eventId)
      return <EventDetailPage event={currentEvent} navigate={navigate} />;
    return (
      <main className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-4">🏫</p>
        <h1 className="text-3xl font-display font-bold text-navy mb-3">
          Page Not Found
        </h1>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-gold text-white rounded-lg font-semibold hover:bg-amber-600"
        >
          Go Home
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar settings={settings} currentPath={path} navigate={navigate} />
      <div className="flex-1">{renderPage()}</div>
      <Footer settings={settings} navigate={navigate} />
      <WhatsAppButton />
    </div>
  );
}
