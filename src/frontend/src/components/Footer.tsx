import type { SchoolSettings } from "@/utils/storage";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

interface Props {
  settings: SchoolSettings;
  navigate: (p: string) => void;
}

export function Footer({ settings, navigate }: Props) {
  const year = new Date().getFullYear();
  const utm = encodeURIComponent(window.location.hostname);
  const c = settings.contact;

  return (
    <footer className="bg-navy text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="logo"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gold"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                  <GraduationCap size={22} className="text-white" />
                </div>
              )}
              <p className="font-display font-bold text-base text-gold">
                {settings.name}
              </p>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {settings.tagline}
            </p>
            <p className="text-white/50 text-xs mt-3">
              Classes: {settings.classes.join(", ")}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold font-semibold mb-3 uppercase text-xs tracking-wider">
              Contact Us
            </h4>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex gap-2">
                <MapPin size={14} className="text-gold mt-0.5 shrink-0" />
                <span>{c.address}</span>
              </div>
              <div className="flex gap-2">
                <Phone size={14} className="text-gold mt-0.5 shrink-0" />
                <span>{c.phone}</span>
              </div>
              <div className="flex gap-2">
                <Mail size={14} className="text-gold mt-0.5 shrink-0" />
                <span>{c.email}</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-gold font-semibold mb-3 uppercase text-xs tracking-wider">
              Quick Links
            </h4>
            <div className="space-y-1">
              {[
                ["Home", "/"],
                ["About Us", "/about"],
                ["Admissions", "/admissions"],
                ["Gallery", "/gallery"],
                ["Teachers", "/teachers"],
                ["Contact", "/contact"],
              ].map(([label, path]) => (
                <button
                  type="button"
                  key={path}
                  onClick={() => navigate(path)}
                  className="block text-sm text-white/60 hover:text-gold transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>
            © {year} {settings.name}. All rights reserved.
          </p>
          <p>
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${utm}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
