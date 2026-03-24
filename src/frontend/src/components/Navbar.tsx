import type { SchoolSettings } from "@/utils/storage";
import { GraduationCap, Menu, Shield, X } from "lucide-react";
import { useState } from "react";

interface Props {
  settings: SchoolSettings;
  currentPath: string;
  navigate: (p: string) => void;
}

const links = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Admissions", path: "/admissions" },
  { label: "Gallery", path: "/gallery" },
  { label: "Teachers", path: "/teachers" },
  { label: "Contact", path: "/contact" },
];

export function Navbar({ settings, currentPath, navigate }: Props) {
  const [open, setOpen] = useState(false);
  const isAdminLoggedIn = sessionStorage.getItem("adminLoggedIn") === "true";

  function go(path: string) {
    navigate(path);
    setOpen(false);
  }

  return (
    <header className="bg-navy sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Name */}
          <button
            type="button"
            onClick={() => go("/")}
            className="flex items-center gap-3 group"
          >
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
            <div className="text-left hidden sm:block">
              <p className="text-white font-display font-bold text-sm leading-tight group-hover:text-gold transition-colors">
                {settings.name}
              </p>
              <p className="text-gold text-xs">Haldwani, Uttarakhand</p>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <button
                type="button"
                key={l.path}
                data-ocid={`nav.${l.label.toLowerCase()}.link`}
                onClick={() => go(l.path)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  currentPath === l.path
                    ? "text-gold border-b-2 border-gold"
                    : "text-white/80 hover:text-gold"
                }`}
              >
                {l.label}
              </button>
            ))}
            <button
              type="button"
              data-ocid="nav.admissions.primary_button"
              onClick={() => go("/admissions")}
              className="ml-2 px-4 py-2 bg-gold text-white rounded font-semibold text-sm hover:bg-amber-600 transition-colors"
            >
              Apply Now
            </button>
            {/* Admin Link */}
            <button
              type="button"
              data-ocid="nav.admin.link"
              onClick={() => go("/admin")}
              title={isAdminLoggedIn ? "Go to Admin Panel" : "Admin Login"}
              className={`ml-1 p-2 rounded transition-colors ${
                currentPath === "/admin"
                  ? "text-gold"
                  : "text-white/50 hover:text-gold"
              }`}
            >
              <Shield size={16} />
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            data-ocid="nav.menu.toggle"
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-navy border-t border-white/10 px-4 pb-4">
          {links.map((l) => (
            <button
              type="button"
              key={l.path}
              data-ocid={`nav.mobile.${l.label.toLowerCase()}.link`}
              onClick={() => go(l.path)}
              className={`block w-full text-left px-3 py-3 text-sm font-medium border-b border-white/10 transition-colors ${
                currentPath === l.path
                  ? "text-gold"
                  : "text-white/80 hover:text-gold"
              }`}
            >
              {l.label}
            </button>
          ))}
          {/* Admin link in mobile menu */}
          <button
            type="button"
            data-ocid="nav.mobile.admin.link"
            onClick={() => go("/admin")}
            className={`flex items-center gap-2 w-full text-left px-3 py-3 text-sm font-medium border-b border-white/10 transition-colors ${
              currentPath === "/admin"
                ? "text-gold"
                : "text-white/50 hover:text-gold"
            }`}
          >
            <Shield size={14} />
            {isAdminLoggedIn ? "Admin Panel" : "Admin Login"}
          </button>
          <button
            type="button"
            onClick={() => go("/admissions")}
            className="mt-3 w-full px-4 py-2 bg-gold text-white rounded font-semibold text-sm hover:bg-amber-600 transition-colors"
          >
            Apply Now — {settings.admissionsYear}
          </button>
        </div>
      )}
    </header>
  );
}
