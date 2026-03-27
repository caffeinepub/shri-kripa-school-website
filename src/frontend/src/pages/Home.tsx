import type {
  GalleryImage,
  LeadershipMember,
  SchoolEvent,
  SchoolSettings,
  Teacher,
} from "@/utils/storage";
import { BookOpen, ChevronRight, MapPin, Phone } from "lucide-react";

interface Props {
  settings: SchoolSettings;
  teachers: Teacher[];
  gallery: GalleryImage[];
  events: SchoolEvent[];
  leadership: LeadershipMember[];
  navigate: (p: string) => void;
}

export function HomePage({
  settings,
  teachers,
  gallery,
  events,
  leadership,
  navigate,
}: Props) {
  const previewGallery = gallery.slice(0, 6);
  const c = settings.contact;

  return (
    <main>
      {/* ── Hero ── */}
      <section
        className="relative min-h-[70vh] flex items-center"
        style={{
          background: settings.banner
            ? `linear-gradient(to right, rgba(26,39,68,0.92) 0%, rgba(26,39,68,0.65) 100%), url(${settings.banner}) center/cover no-repeat`
            : "linear-gradient(135deg, #1a2744 0%, #2a3f6f 50%, #1a2744 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-gold/20 text-gold border border-gold/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              Admissions Open — {settings.admissionsYear}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-4">
              {settings.name}
            </h1>
            <p className="text-lg text-white/75 mb-8 leading-relaxed">
              {settings.tagline}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                data-ocid="hero.admissions.primary_button"
                onClick={() => navigate("/admissions")}
                className="px-6 py-3 bg-gold text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-lg"
              >
                Apply Now
              </button>
              <button
                type="button"
                data-ocid="hero.about.secondary_button"
                onClick={() => navigate("/about")}
                className="px-6 py-3 border-2 border-white/40 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick info bar ── */}
      <div className="bg-gold text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-4 items-center justify-center sm:justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span className="font-medium">{c.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} />
            <span className="font-medium">{c.phone}</span>
          </div>
        </div>
      </div>

      {/* ── Notice Board ── */}
      {settings.noticeBoard && (
        <section className="bg-amber-50 border-l-4 border-gold">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-start gap-3">
              <span className="text-gold font-bold text-xs uppercase tracking-wider shrink-0 mt-0.5">
                📢 Notice
              </span>
              <p className="text-navy text-sm leading-relaxed">
                {settings.noticeBoard}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── About preview ── */}
      {settings.about && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-gold font-semibold uppercase text-xs tracking-wider">
                About Us
              </span>
              <h2 className="text-3xl font-display font-bold text-navy mt-2 mb-4">
                Welcome to {settings.name}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {settings.about.slice(0, 300)}
                {settings.about.length > 300 ? "..." : ""}
              </p>
              <button
                type="button"
                data-ocid="about_preview.read_more.button"
                onClick={() => navigate("/about")}
                className="inline-flex items-center gap-2 text-gold font-semibold hover:text-amber-600 transition-colors"
              >
                Read More <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                [
                  "🏫",
                  "Quality Education",
                  "Experienced faculty & modern curriculum",
                ],
                [
                  "🌟",
                  "Holistic Growth",
                  "Sports, arts, and co-curricular activities",
                ],
                ["📚", "Nursery to 8th", settings.classes.join(", ")],
                [
                  "🏆",
                  "Trusted Since 2008",
                  "15+ years of academic excellence",
                ],
              ].map(([icon, title, desc]) => (
                <div
                  key={title}
                  className="bg-white rounded-xl p-4 shadow-sm border border-amber-100"
                >
                  <span className="text-2xl">{icon}</span>
                  <p className="font-semibold text-navy text-sm mt-2">
                    {title}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Leadership Section ── */}
      {leadership.length > 0 && (
        <section className="bg-navy py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-gold font-semibold uppercase text-xs tracking-wider">
                Our Leadership
              </span>
              <h2 className="text-3xl font-display font-bold text-white mt-2">
                School Management
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {leadership.map((member, i) => (
                <div
                  key={member.id}
                  data-ocid={`leadership.item.${i + 1}`}
                  className="bg-white rounded-2xl p-6 text-center shadow-lg w-full sm:w-64 flex-shrink-0"
                >
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gold shadow-md"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4 border-4 border-gold">
                      <span className="text-4xl font-bold text-navy">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <p className="font-bold text-navy text-lg">{member.name}</p>
                  <p className="text-gold font-semibold text-sm mt-1 uppercase tracking-wide">
                    {member.post}
                  </p>
                  {member.contact && (
                    <a
                      href={`tel:${member.contact.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 mt-3 text-sm text-gray-600 hover:text-navy transition-colors"
                    >
                      <Phone size={13} />
                      {member.contact}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Events ── */}
      {events.length > 0 && (
        <section className="bg-amber-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-gold font-semibold uppercase text-xs tracking-wider">
                School Events
              </span>
              <h2 className="text-3xl font-display font-bold text-navy mt-2">
                Recent Events
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {events.map((ev) => (
                <button
                  type="button"
                  key={ev.id}
                  data-ocid="events.item.1"
                  onClick={() => navigate(`/events/${ev.id}`)}
                  className="group relative overflow-hidden rounded-xl aspect-square bg-white hover:bg-white transition-all duration-300 hover:scale-105 shadow-sm border border-amber-100"
                >
                  {ev.images[0] ? (
                    <img
                      src={ev.images[0]}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={32} className="text-gold/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent flex items-end p-3">
                    <p className="text-white text-xs font-semibold line-clamp-2">
                      {ev.title}
                    </p>
                  </div>
                  {ev.images.length > 1 && (
                    <span className="absolute top-2 right-2 bg-gold text-white text-xs px-1.5 py-0.5 rounded-full">
                      {ev.images.length} 📷
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery preview ── */}
      {previewGallery.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-gold font-semibold uppercase text-xs tracking-wider">
                Photo Gallery
              </span>
              <h2 className="text-3xl font-display font-bold text-navy mt-1">
                School Life
              </h2>
            </div>
            <button
              type="button"
              data-ocid="gallery_preview.view_all.button"
              onClick={() => navigate("/gallery")}
              className="text-gold font-semibold text-sm hover:text-amber-600 flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {previewGallery.map((img, i) => (
              <button
                type="button"
                key={img.id}
                data-ocid={`gallery_preview.item.${i + 1}`}
                className="aspect-square rounded-xl overflow-hidden group cursor-pointer"
                onClick={() => navigate("/gallery")}
              >
                <img
                  src={img.imageUrl}
                  alt={`Gallery ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Teachers ── */}
      {teachers.length > 0 && (
        <section className="bg-amber-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-gold font-semibold uppercase text-xs tracking-wider">
                Our Faculty
              </span>
              <h2 className="text-3xl font-display font-bold text-navy mt-2">
                Meet Our Teachers
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {teachers.slice(0, 8).map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow border border-amber-100 group"
                >
                  {t.photo ? (
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-gold"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-3 border-2 border-gold">
                      <span className="text-2xl font-bold text-navy">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <p className="font-semibold text-navy text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{t.speciality}</p>
                </div>
              ))}
            </div>
            {teachers.length > 8 && (
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/teachers")}
                  className="text-gold font-semibold hover:text-amber-600 flex items-center gap-1 mx-auto"
                >
                  View All Teachers <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
