import type { GalleryImage } from "@/utils/storage";
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  gallery: GalleryImage[];
}

export function GalleryPage({ gallery }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <span className="text-gold font-semibold uppercase text-xs tracking-wider">
          Photos
        </span>
        <h1 className="text-4xl font-display font-bold text-navy mt-1">
          Photo Gallery
        </h1>
      </div>

      {gallery.length === 0 ? (
        <div
          data-ocid="gallery.empty_state"
          className="text-center py-20 text-gray-400"
        >
          <p className="text-5xl mb-4">📷</p>
          <p className="text-lg">No photos yet.</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-3"
          data-ocid="gallery.list"
        >
          {gallery.map((img, i) => (
            <button
              type="button"
              key={img.id}
              data-ocid={`gallery.item.${i + 1}`}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setLightbox(img.imageUrl)}
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
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          data-ocid="gallery.modal"
        >
          <button
            type="button"
            data-ocid="gallery.close_button"
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
