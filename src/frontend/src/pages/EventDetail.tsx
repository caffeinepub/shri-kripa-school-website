import type { SchoolEvent } from "@/utils/storage";
import { ArrowLeft, X } from "lucide-react";
import { useState } from "react";

interface Props {
  event: SchoolEvent | undefined;
  navigate: (p: string) => void;
}

export function EventDetailPage({ event, navigate }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!event) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 text-xl">Event not found.</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-4 text-gold hover:underline"
        >
          Back to Home
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <button
        type="button"
        data-ocid="event_detail.back.button"
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gold hover:text-amber-600 mb-6 font-medium"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="mb-8">
        <span className="text-gold font-semibold uppercase text-xs tracking-wider">
          School Event
        </span>
        <h1 className="text-4xl font-display font-bold text-navy mt-1">
          {event.title}
        </h1>
        <p className="text-gray-500 mt-1">
          {event.images.length} photo{event.images.length !== 1 ? "s" : ""}
        </p>
      </div>

      {event.images.length === 0 ? (
        <div
          data-ocid="event_detail.empty_state"
          className="text-center py-20 text-gray-400"
        >
          <p className="text-5xl mb-4">📷</p>
          <p>No photos for this event yet.</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          data-ocid="event_detail.list"
        >
          {event.images.map((img, i) => (
            <button
              type="button"
              key={`${event.id}-${i}`}
              data-ocid={`event_detail.item.${i + 1}`}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setLightbox(img)}
            >
              <img
                src={img}
                alt={`${event.title} ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          data-ocid="event_detail.modal"
        >
          <button
            type="button"
            data-ocid="event_detail.close_button"
            className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30"
            onClick={() => setLightbox(null)}
          >
            <X size={24} />
          </button>
          <button
            type="button"
            className="absolute inset-0 w-full h-full"
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
          />
          <img
            src={lightbox}
            alt="Full view"
            className="relative max-w-full max-h-full rounded-lg object-contain z-10 pointer-events-none"
          />
        </div>
      )}
    </main>
  );
}
