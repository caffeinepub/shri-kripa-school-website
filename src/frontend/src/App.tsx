import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { db, storage } from "@/firebase.js";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Facebook,
  GraduationCap,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Phone,
  Shield,
  Star,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Teacher {
  id: string;
  name: string;
  imageUrl: string;
}
interface GalleryItem {
  id: string;
  imageUrl: string;
  createdAt: string | null;
}
interface Admission {
  id: string;
  name: string;
  fatherName: string;
  class: string;
  phone: string;
  address: string;
  createdAt: string | null;
}
interface Settings {
  logoUrl?: string;
  bannerUrl?: string;
  schoolName?: string;
  aboutText?: string;
  academicYear?: string;
}
interface Notice {
  id: string;
  title: string;
  date: string;
}
interface Principal {
  name: string;
  designation: string;
  message: string;
  imageUrl?: string;
}
interface Achievement {
  id: string;
  title: string;
  year: string;
}
interface Testimonial {
  id: string;
  parentName: string;
  childClass: string;
  review: string;
}
interface FeeItem {
  id: string;
  className: string;
  annualFee: string;
}
interface CalendarItem {
  id: string;
  event: string;
  date: string;
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
const LS = {
  ADMIN_CREDS: "skps_admin_creds",
  ADMIN_SESSION: "admin",
  SETTINGS: "skps_settings",
  TEACHERS: "skps_teachers",
  GALLERY: "skps_gallery",
  ADMISSIONS: "skps_admissions",
  NOTICES: "skps_notices",
  PRINCIPAL: "skps_principal",
  ACHIEVEMENTS: "skps_achievements",
  TESTIMONIALS: "skps_testimonials",
  FEES: "skps_fees",
  CALENDAR: "skps_calendar",
};

function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}
function getAdminCreds(): { username: string; password: string } {
  return lsGet(LS.ADMIN_CREDS, {
    username: "shristi",
    password: "shristi@123",
  });
}
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function uploadToFirebase(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
async function uploadImage(
  file: File,
  path: string,
): Promise<{ localUrl: string; firebaseUrl?: string }> {
  const localUrl = await fileToBase64(file);
  let firebaseUrl: string | undefined;
  try {
    firebaseUrl = await uploadToFirebase(file, path);
  } catch {}
  return { localUrl, firebaseUrl };
}

// ─── Default assets ───────────────────────────────────────────────────────────
const DEFAULT_BANNER = "/assets/generated/school-banner.dim_1600x600.jpg";
const DEFAULT_LOGO =
  "/assets/generated/school-logo-transparent.dim_200x200.png";

const DEFAULT_NOTICES: Notice[] = [
  { id: "1", title: "School reopens 1 April 2025", date: "2025-04-01" },
  { id: "2", title: "Annual Sports Day — 15 March", date: "2025-03-15" },
  { id: "3", title: "Half-yearly Results declared", date: "2025-02-28" },
];
const DEFAULT_PRINCIPAL: Principal = {
  name: "Mr. Rajesh Kumar",
  designation: "Principal",
  message:
    "We at Shri Kripa Public School believe in holistic education that nurtures young minds with knowledge, values, and discipline. Our dedicated faculty strives to bring out the best in every student, preparing them not just for exams but for life.",
};
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "1", title: "Best School Award", year: "2022" },
  { id: "2", title: "100% Board Results", year: "2024" },
  { id: "3", title: "State Sports Champions", year: "2023" },
  { id: "4", title: "Excellence in Education", year: "2023" },
];
const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    parentName: "Ramesh Verma",
    childClass: "Class 5",
    review:
      "My child has grown so much here. The teachers are very caring and dedicated. Best school in Haldwani!",
  },
  {
    id: "2",
    parentName: "Sunita Bisht",
    childClass: "Class 3",
    review:
      "Excellent discipline and academics. My daughter loves going to school every day. Highly recommended.",
  },
  {
    id: "3",
    parentName: "Mahesh Joshi",
    childClass: "Class 7",
    review:
      "The school provides great value education. My son's confidence and skills have improved greatly.",
  },
];
const DEFAULT_FEES: FeeItem[] = [
  { id: "1", className: "Nursery – UKG", annualFee: "₹8,000" },
  { id: "2", className: "Class 1 – 3", annualFee: "₹10,000" },
  { id: "3", className: "Class 4 – 5", annualFee: "₹12,000" },
  { id: "4", className: "Class 6 – 8", annualFee: "₹14,000" },
];
const DEFAULT_CALENDAR: CalendarItem[] = [
  { id: "1", event: "New Session Begins", date: "April 1, 2025" },
  { id: "2", event: "Summer Vacation", date: "May 15 – June 30" },
  { id: "3", event: "Term 2 Begins", date: "July 1, 2025" },
  { id: "4", event: "Half-Yearly Exams", date: "October 2025" },
  { id: "5", event: "Winter Break", date: "Dec 25 – Jan 5" },
  { id: "6", event: "Annual Exams", date: "March 2026" },
  { id: "7", event: "Result Day", date: "March 31, 2026" },
];

// ─── Color constants ───────────────────────────────────────────────────────────
const BLUE = {
  bg: "#1a3a6b",
  mid: "#1e40af",
  light: "#dbeafe",
  vlight: "#eff6ff",
};

// ─── useSettings hook ─────────────────────────────────────────────────────────
function useSettings() {
  const defaults: Settings = {
    logoUrl: DEFAULT_LOGO,
    bannerUrl: DEFAULT_BANNER,
    schoolName: "Shri Kripa Public School",
    academicYear: "2025–26",
  };
  const [settings, setSettings] = useState<Settings>(() => ({
    ...defaults,
    ...lsGet<Settings>(LS.SETTINGS, {}),
  }));
  // biome-ignore lint/correctness/useExhaustiveDependencies: stable on mount
  useEffect(() => {
    getDoc(doc(db, "settings", "main"))
      .then((snap) => {
        if (snap.exists()) {
          const fb = snap.data() as Settings;
          const merged = { ...defaults, ...fb };
          setSettings(merged);
          lsSet(LS.SETTINGS, merged);
        }
      })
      .catch(() => {});
  }, []);
  return { settings, loading: false };
}

// ─── NavLink helper ───────────────────────────────────────────────────────────
function NavLink({
  to,
  children,
  className,
  onClick,
  "data-ocid": dataOcid,
}: {
  to: string;
  children: React.ReactNode;
  className?: (opts: { isActive: boolean }) => string;
  onClick?: () => void;
  "data-ocid"?: string;
}) {
  const { location } = useRouterState();
  const isActive =
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={className ? className({ isActive }) : undefined}
      onClick={onClick}
      data-ocid={dataOcid}
    >
      {children}
    </Link>
  );
}

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/admissions", label: "Admissions" },
  { to: "/teachers", label: "Teachers" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();
  return (
    <header
      className="sticky top-0 z-50 shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${BLUE.bg} 0%, #0f2347 100%)`,
      }}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="h-11 w-11 rounded-full object-cover border-2 border-white/50 shadow"
            />
          ) : (
            <GraduationCap className="h-8 w-8 text-white" />
          )}
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-base text-white tracking-tight drop-shadow">
              Shri Kripa Public School
            </span>
            <span className="text-white/75 text-[10px] font-medium">
              {settings.academicYear || "Nursery to Class 8"}
            </span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-ocid="nav.link"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/20 text-white font-semibold"
                    : "text-white/85 hover:text-white hover:bg-white/15"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/admin/login">
            <Button
              size="sm"
              className="ml-2 bg-white text-blue-800 hover:bg-blue-50 font-semibold shadow"
              data-ocid="admin.link"
            >
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Button>
          </Link>
        </nav>
        <button
          type="button"
          className="md:hidden text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/20 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${BLUE.bg} 0%, #0f2347 100%)`,
            }}
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  data-ocid="nav.link"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded text-sm font-medium ${
                      isActive ? "bg-white/20 text-white" : "text-white/85"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link to="/admin/login" onClick={() => setOpen(false)}>
                <Button
                  size="sm"
                  className="mt-1 bg-white text-blue-800 hover:bg-blue-50 w-full font-semibold"
                >
                  Admin Panel
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="text-white/80 mt-auto"
      style={{
        background: "linear-gradient(135deg, #0f2347 0%, #0a1628 100%)",
      }}
    >
      <div className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-6 w-6 text-white" />
            <span className="font-display font-bold text-lg text-white">
              Shri Kripa Public School
            </span>
          </div>
          <p className="text-sm mb-4">
            Nurturing young minds with knowledge, values, and excellence since
            1995. Classes Nursery to 8th.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Facebook"
              className="h-9 w-9 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors"
            >
              <Facebook className="h-4 w-4 text-white" />
            </button>
            <a
              href="https://wa.me/918449561111"
              aria-label="WhatsApp"
              className="h-9 w-9 rounded-full bg-white/10 hover:bg-green-600 flex items-center justify-center transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-white" />
            </a>
            <button
              type="button"
              aria-label="YouTube"
              className="h-9 w-9 rounded-full bg-white/10 hover:bg-red-600 flex items-center justify-center transition-colors"
            >
              <Youtube className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <MapPin className="h-4 w-4 text-blue-300 shrink-0 mt-0.5" /> Ward
              55, Near TP Nagar, Manpur West, Haldwani, Nainital, Uttarakhand
            </li>
            <li className="flex gap-2">
              <Phone className="h-4 w-4 text-blue-300 shrink-0" /> +91 84495
              61111
            </li>
            <li className="flex gap-2">
              <Mail className="h-4 w-4 text-blue-300 shrink-0" />{" "}
              info@shrikripa.edu.in
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {year} Shri Kripa Public School, Haldwani. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline hover:text-white"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </div>
    </footer>
  );
}

// ─── PageWrapper ──────────────────────────────────────────────────────────────
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1"
    >
      {children}
    </motion.main>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section
      className="text-white py-14 px-4"
      style={{
        background: `linear-gradient(135deg, ${BLUE.bg} 0%, #1e40af 100%)`,
      }}
    >
      <div className="container mx-auto">
        <h1 className="font-display text-4xl font-bold mb-1">{title}</h1>
        {subtitle && <p className="text-white/75">{subtitle}</p>}
      </div>
    </section>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
function HomePage() {
  const { settings } = useSettings();
  const bannerUrl = settings.bannerUrl || DEFAULT_BANNER;
  const logoUrl = settings.logoUrl || DEFAULT_LOGO;
  const notices = lsGet<Notice[]>(LS.NOTICES, DEFAULT_NOTICES);
  const testimonials = lsGet<Testimonial[]>(
    LS.TESTIMONIALS,
    DEFAULT_TESTIMONIALS,
  );

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <section
        className="relative text-white py-24 px-4 overflow-hidden min-h-[500px] flex items-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(26,58,107,0.90) 35%, rgba(26,58,107,0.60) 70%, rgba(0,0,0,0.3)), url('${bannerUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        data-ocid="home.section"
      >
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={logoUrl}
                  alt="School Logo"
                  className="h-24 w-24 rounded-full object-cover border-4 border-white/50 shadow-xl bg-white/10"
                />
                <div>
                  <Badge className="bg-white/20 text-white border-white/40 mb-2 text-xs font-medium">
                    Est. 1995 · CBSE Affiliated
                  </Badge>
                  <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg">
                    {settings.schoolName || "Shri Kripa Public School"}
                  </h1>
                </div>
              </div>
              <p className="text-xl font-semibold text-white/95 mb-2 drop-shadow">
                Nurturing Excellence Since 1995
              </p>
              <p className="text-white/85 mb-8 max-w-xl text-base leading-relaxed">
                A centre of quality education for Nursery to Class 8, nurturing
                every child's potential through knowledge, values, and holistic
                development in the heart of Haldwani.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/admissions">
                  <Button
                    size="lg"
                    className="bg-white text-blue-800 hover:bg-blue-50 font-bold shadow-xl border-2 border-white"
                    data-ocid="home.primary_button"
                  >
                    Apply for Admission{" "}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button
                    size="lg"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-800 font-bold shadow-lg transition-colors"
                    data-ocid="home.secondary_button"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section
        className="py-8 px-4"
        style={{
          background: `linear-gradient(90deg, ${BLUE.bg} 0%, #1e40af 100%)`,
        }}
      >
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { number: "500+", label: "Students" },
            { number: "20+", label: "Teachers" },
            { number: "15+", label: "Years of Excellence" },
            { number: "8", label: "Classes (Nursery–8)" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-black">{s.number}</p>
              <p className="text-white/80 text-sm font-medium mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Notice Board */}
      {notices.length > 0 && (
        <section className="py-14 px-4" style={{ background: BLUE.vlight }}>
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-6 w-6" style={{ color: BLUE.bg }} />
              <h2
                className="font-display text-2xl font-bold"
                style={{ color: BLUE.bg }}
              >
                Notice Board
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="bg-white rounded-xl border-l-4 p-4 shadow-sm"
                  style={{ borderLeftColor: BLUE.mid }}
                >
                  <p className="font-semibold text-gray-800">{n.title}</p>
                  <p className="text-sm mt-1" style={{ color: BLUE.mid }}>
                    {n.date
                      ? new Date(n.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : n.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Classes Quick Links */}
      <section className="py-14 px-4 bg-white">
        <div className="container mx-auto">
          <h2
            className="font-display text-2xl font-bold mb-2"
            style={{ color: BLUE.bg }}
          >
            Our Classes
          </h2>
          <p className="text-muted-foreground mb-6">
            Quality education from Nursery to Class 8
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Nursery",
              "LKG",
              "UKG",
              "Class 1",
              "Class 2",
              "Class 3",
              "Class 4",
              "Class 5",
              "Class 6",
              "Class 7",
              "Class 8",
            ].map((cls) => (
              <Link key={cls} to="/courses">
                <Badge
                  className="px-4 py-2 text-sm cursor-pointer font-medium transition-colors"
                  style={{
                    background: BLUE.light,
                    color: BLUE.bg,
                    border: "1px solid #93c5fd",
                  }}
                >
                  {cls}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-14 px-4" style={{ background: BLUE.vlight }}>
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6" style={{ color: BLUE.bg }} />
              <h2
                className="font-display text-2xl font-bold"
                style={{ color: BLUE.bg }}
              >
                What Parents Say
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.id} className="shadow-sm border-0 bg-white">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 italic mb-4">
                      &ldquo;{t.review}&rdquo;
                    </p>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {t.parentName}
                      </p>
                      <p className="text-sm" style={{ color: BLUE.mid }}>
                        Parent of {t.childClass} student
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Admissions CTA */}
      <section
        className="py-14 px-4 text-center text-white"
        style={{
          background: `linear-gradient(135deg, ${BLUE.bg} 0%, #1e40af 100%)`,
        }}
      >
        <h2 className="font-display text-3xl font-bold mb-3">
          Admissions Open — {settings.academicYear || "2025–26"}
        </h2>
        <p className="text-white/85 mb-6 text-lg">
          Seats are limited — secure your child's future today.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/admissions">
            <Button
              size="lg"
              className="bg-white text-blue-800 hover:bg-blue-50 font-bold shadow-xl border-2 border-white"
              data-ocid="home.primary_button"
            >
              Enquire Now
            </Button>
          </Link>
          <Link to="/contact">
            <Button
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-800 font-bold transition-colors"
            >
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── AboutPage ────────────────────────────────────────────────────────────────
function AboutPage() {
  const { settings } = useSettings();
  const principal = lsGet<Principal>(LS.PRINCIPAL, DEFAULT_PRINCIPAL);
  const achievements = lsGet<Achievement[]>(
    LS.ACHIEVEMENTS,
    DEFAULT_ACHIEVEMENTS,
  );
  const calendar = lsGet<CalendarItem[]>(LS.CALENDAR, DEFAULT_CALENDAR);

  return (
    <PageWrapper>
      <PageHero
        title={`About ${settings.schoolName || "Shri Kripa Public School"}`}
        subtitle="Our legacy of education since 1995"
      />

      {/* Story + Vision */}
      <section className="py-14 px-4 bg-white">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2
              className="font-display text-2xl font-bold mb-4"
              style={{ color: BLUE.bg }}
            >
              Our Story
            </h2>
            <p className="text-muted-foreground mb-4">
              {settings.aboutText ||
                "Shri Kripa Public School was founded in 1995 with a vision to provide quality education that combines academic rigour with ethical values. We believe every child has unique potential that needs the right environment to flourish."}
            </p>
            <p className="text-muted-foreground mb-6">
              Located in Haldwani, Nainital, our CBSE-affiliated institution
              proudly serves students from Nursery to Class 8, guided by
              compassionate and experienced educators.
            </p>
            <ul className="space-y-2">
              {[
                "CBSE Affiliated School",
                "Classes: Nursery, LKG, UKG, Class 1–8",
                "Experienced & Dedicated Faculty",
                "Safe and Nurturing Campus Environment",
                "Located in Haldwani, Uttarakhand",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 mt-0.5"
                    style={{ color: BLUE.mid }}
                  />{" "}
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-xl p-8 border"
            style={{ background: BLUE.vlight, borderColor: "#bfdbfe" }}
          >
            <h3
              className="font-display text-xl font-bold mb-4"
              style={{ color: BLUE.bg }}
            >
              Our Vision
            </h3>
            <p className="text-muted-foreground italic mb-6">
              &ldquo;To create a learning community where knowledge, character,
              and creativity empower students to become responsible global
              citizens.&rdquo;
            </p>
            <Separator className="mb-6" />
            <h3
              className="font-display text-xl font-bold mb-4"
              style={{ color: BLUE.bg }}
            >
              Our Mission
            </h3>
            <p className="text-muted-foreground">
              To provide comprehensive education that develops intellectual
              curiosity, moral character, and social responsibility in every
              student from their earliest years.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { label: "Founded", value: "1995" },
                { label: "Affiliation", value: "CBSE" },
                { label: "Classes", value: "Nursery–8" },
                {
                  label: "Academic Year",
                  value: settings.academicYear || "2025–26",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-lg p-3 border text-center"
                  style={{ borderColor: "#bfdbfe" }}
                >
                  <p className="font-bold" style={{ color: BLUE.bg }}>
                    {item.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principal's Message */}
      <section className="py-14 px-4" style={{ background: BLUE.vlight }}>
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Users className="h-6 w-6" style={{ color: BLUE.bg }} />
            <h2
              className="font-display text-2xl font-bold"
              style={{ color: BLUE.bg }}
            >
              Principal's Message
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-md border-0 bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div
                    className="h-24 w-24 rounded-full shrink-0 flex items-center justify-center text-white text-3xl font-bold shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${BLUE.bg}, #1e40af)`,
                    }}
                  >
                    {principal.imageUrl ? (
                      <img
                        src={principal.imageUrl}
                        alt={principal.name}
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      principal.name[0]
                    )}
                  </div>
                  <div className="flex-1">
                    <blockquote className="text-gray-600 italic text-lg leading-relaxed mb-4">
                      &ldquo;{principal.message}&rdquo;
                    </blockquote>
                    <p className="font-bold text-gray-800">{principal.name}</p>
                    <p className="text-sm" style={{ color: BLUE.mid }}>
                      {principal.designation}, Shri Kripa Public School
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievements */}
      {achievements.length > 0 && (
        <section className="py-14 px-4 bg-white">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <Trophy className="h-6 w-6" style={{ color: BLUE.bg }} />
              <h2
                className="font-display text-2xl font-bold"
                style={{ color: BLUE.bg }}
              >
                Achievements & Awards
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl p-6 text-center border"
                  style={{ background: BLUE.vlight, borderColor: "#bfdbfe" }}
                >
                  <Trophy
                    className="h-8 w-8 mx-auto mb-3"
                    style={{ color: BLUE.mid }}
                  />
                  <p className="font-bold text-gray-800">{a.title}</p>
                  <p className="text-sm mt-1" style={{ color: BLUE.mid }}>
                    {a.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Academic Calendar */}
      {calendar.length > 0 && (
        <section className="py-14 px-4" style={{ background: BLUE.vlight }}>
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <Clock className="h-6 w-6" style={{ color: BLUE.bg }} />
              <h2
                className="font-display text-2xl font-bold"
                style={{ color: BLUE.bg }}
              >
                Academic Calendar 2025–26
              </h2>
            </div>
            <div className="max-w-2xl">
              <div
                className="rounded-xl overflow-hidden border"
                style={{ borderColor: "#bfdbfe" }}
              >
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: BLUE.bg }}>
                      <TableHead className="text-white font-semibold">
                        Event
                      </TableHead>
                      <TableHead className="text-white font-semibold">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calendar.map((c, i) => (
                      <TableRow
                        key={c.id}
                        className={i % 2 === 0 ? "bg-white" : ""}
                        style={{
                          background: i % 2 === 1 ? BLUE.vlight : undefined,
                        }}
                      >
                        <TableCell className="font-medium">{c.event}</TableCell>
                        <TableCell style={{ color: BLUE.mid }}>
                          {c.date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </section>
      )}
    </PageWrapper>
  );
}

// ─── CoursesPage ──────────────────────────────────────────────────────────────
const CLASSES = [
  {
    name: "Nursery",
    age: "3–4 yrs",
    subjects: ["English", "Hindi", "Math", "EVS", "Art & Craft", "Rhymes"],
  },
  {
    name: "LKG",
    age: "4–5 yrs",
    subjects: ["English", "Hindi", "Math", "EVS", "Art & Craft", "Drawing"],
  },
  {
    name: "UKG",
    age: "5–6 yrs",
    subjects: ["English", "Hindi", "Math", "EVS", "Art", "GK"],
  },
  {
    name: "Class 1",
    age: "6–7 yrs",
    subjects: ["English", "Hindi", "Math", "EVS", "Art", "GK"],
  },
  {
    name: "Class 2",
    age: "7–8 yrs",
    subjects: ["English", "Hindi", "Math", "EVS", "Computer", "Art"],
  },
  {
    name: "Class 3",
    age: "8–9 yrs",
    subjects: [
      "English",
      "Hindi",
      "Math",
      "Science",
      "Social Studies",
      "Computer",
    ],
  },
  {
    name: "Class 4",
    age: "9–10 yrs",
    subjects: [
      "English",
      "Hindi",
      "Math",
      "Science",
      "Social Studies",
      "Computer",
    ],
  },
  {
    name: "Class 5",
    age: "10–11 yrs",
    subjects: [
      "English",
      "Hindi",
      "Math",
      "Science",
      "Social Studies",
      "Sanskrit",
    ],
  },
  {
    name: "Class 6",
    age: "11–12 yrs",
    subjects: [
      "English",
      "Hindi",
      "Math",
      "Science",
      "Social Studies",
      "Sanskrit",
    ],
  },
  {
    name: "Class 7",
    age: "12–13 yrs",
    subjects: [
      "English",
      "Hindi",
      "Math",
      "Science",
      "Social Studies",
      "Sanskrit",
    ],
  },
  {
    name: "Class 8",
    age: "13–14 yrs",
    subjects: [
      "English",
      "Hindi",
      "Math",
      "Science",
      "Social Studies",
      "Sanskrit",
    ],
  },
];

function CoursesPage() {
  return (
    <PageWrapper>
      <PageHero
        title="Courses & Classes"
        subtitle="Nursery to Class 8 — complete curriculum overview"
      />
      <section className="py-14 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CLASSES.map((cls, i) => (
              <Card
                key={cls.name}
                className="shadow-sm hover:shadow-md transition-shadow border-0"
                style={{
                  background: i % 2 === 0 ? BLUE.vlight : "white",
                  border: "1px solid #bfdbfe",
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle
                      className="font-display text-lg"
                      style={{ color: BLUE.bg }}
                    >
                      {cls.name}
                    </CardTitle>
                    <Badge style={{ background: BLUE.light, color: BLUE.bg }}>
                      {cls.age}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.subjects.map((sub) => (
                      <span
                        key={sub}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: BLUE.light, color: BLUE.bg }}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── AdmissionsPage ───────────────────────────────────────────────────────────
const CLASS_OPTIONS = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
];

function AdmissionsPage() {
  const { settings } = useSettings();
  const fees = lsGet<FeeItem[]>(LS.FEES, DEFAULT_FEES);
  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    phone: "",
    class: "",
    address: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setLoading(true);
    try {
      const newAdm: Admission = {
        id: Date.now().toString(),
        ...form,
        createdAt: new Date().toISOString(),
      };
      const existing = lsGet<Admission[]>(LS.ADMISSIONS, []);
      lsSet(LS.ADMISSIONS, [newAdm, ...existing]);
      addDoc(collection(db, "admissions"), {
        ...form,
        createdAt: serverTimestamp(),
      }).catch(() => {});
      setSubmitted(true);
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper>
      <PageHero
        title="Admissions"
        subtitle={`Enquire for Academic Year ${settings.academicYear || "2025–26"}`}
      />
      <section className="py-14 px-4 bg-white">
        <div className="container mx-auto grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2
              className="font-display text-2xl font-bold mb-6"
              style={{ color: BLUE.bg }}
            >
              Admission Process
            </h2>
            <ol className="space-y-5 mb-8">
              {[
                {
                  step: "1",
                  title: "Submit Enquiry",
                  desc: "Fill the online form with student details.",
                },
                {
                  step: "2",
                  title: "School Visit",
                  desc: "Visit the school for a campus tour and interaction.",
                },
                {
                  step: "3",
                  title: "Entrance Assessment",
                  desc: "Brief age-appropriate assessment for class placement.",
                },
                {
                  step: "4",
                  title: "Confirmation",
                  desc: "Receive admission confirmation and fee payment details.",
                },
              ].map((s) => (
                <li key={s.step} className="flex gap-4">
                  <div
                    className="h-9 w-9 rounded-full text-white flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: BLUE.bg }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-muted-foreground text-sm">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div
              className="rounded-xl p-4 border mb-6"
              style={{ background: BLUE.vlight, borderColor: "#bfdbfe" }}
            >
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: BLUE.bg }}
              >
                Classes Available
              </p>
              <p className="text-sm text-gray-600">
                Nursery · LKG · UKG · Class 1 to Class 8
              </p>
            </div>

            {/* Fee Structure */}
            {fees.length > 0 && (
              <div>
                <h3
                  className="font-display text-xl font-bold mb-4"
                  style={{ color: BLUE.bg }}
                >
                  Fee Structure (Annual)
                </h3>
                <div
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: "#bfdbfe" }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow style={{ background: BLUE.bg }}>
                        <TableHead className="text-white font-semibold">
                          Class
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                          Annual Fee
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fees.map((f, i) => (
                        <TableRow
                          key={f.id}
                          style={{
                            background: i % 2 === 0 ? "white" : BLUE.vlight,
                          }}
                        >
                          <TableCell className="font-medium">
                            {f.className}
                          </TableCell>
                          <TableCell
                            className="font-semibold"
                            style={{ color: BLUE.mid }}
                          >
                            {f.annualFee}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Fees may vary. Contact school for exact details.
                </p>
              </div>
            )}
          </div>

          <Card
            className="shadow-xl border-0"
            style={{ border: "1px solid #bfdbfe" }}
          >
            <CardHeader>
              <CardTitle
                className="font-display text-xl"
                style={{ color: BLUE.bg }}
              >
                Admission Enquiry Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div
                  className="text-center py-10"
                  data-ocid="admissions.success_state"
                >
                  <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold mb-2">
                    Enquiry Submitted!
                  </h3>
                  <p className="text-muted-foreground">
                    Our team will contact you within 24 hours.
                  </p>
                  <Button
                    className="mt-6 text-white"
                    style={{ background: BLUE.bg }}
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        fatherName: "",
                        phone: "",
                        class: "",
                        address: "",
                      });
                    }}
                  >
                    Submit Another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="adm-name">Student Name *</Label>
                    <Input
                      id="adm-name"
                      required
                      placeholder="e.g. Arjun Sharma"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      data-ocid="admissions.input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adm-father">Father's Name *</Label>
                    <Input
                      id="adm-father"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={form.fatherName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, fatherName: e.target.value }))
                      }
                      data-ocid="admissions.input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adm-class">Applying for Class *</Label>
                    <Select
                      required
                      value={form.class}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, class: v }))
                      }
                    >
                      <SelectTrigger
                        id="adm-class"
                        data-ocid="admissions.select"
                      >
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="adm-phone">Phone Number *</Label>
                    <Input
                      id="adm-phone"
                      required
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      maxLength={10}
                      onChange={(e) => {
                        setPhoneError("");
                        setForm((p) => ({ ...p, phone: e.target.value }));
                      }}
                      data-ocid="admissions.input"
                    />
                    {phoneError && (
                      <p
                        className="text-destructive text-xs mt-1"
                        data-ocid="admissions.error_state"
                      >
                        {phoneError}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="adm-address">Address *</Label>
                    <Textarea
                      id="adm-address"
                      required
                      placeholder="Full residential address"
                      value={form.address}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, address: e.target.value }))
                      }
                      data-ocid="admissions.textarea"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full text-white font-semibold"
                    style={{ background: BLUE.bg }}
                    disabled={loading}
                    data-ocid="admissions.submit_button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Enquiry"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── TeachersPage ─────────────────────────────────────────────────────────────
function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const cached = lsGet<Teacher[]>(LS.TEACHERS, []);
    if (cached.length > 0) {
      setTeachers(cached);
      setLoading(false);
    }
    getDocs(collection(db, "teachers"))
      .then((snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as Teacher,
          );
          setTeachers(list);
          lsSet(LS.TEACHERS, list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return (
    <PageWrapper>
      <PageHero
        title="Our Teachers"
        subtitle="Dedicated educators shaping young futures"
      />
      <section className="py-14 px-4 bg-white">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: BLUE.bg }}
              />
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No teachers added yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {teachers.map((t) => (
                <Card
                  key={t.id}
                  className="text-center shadow-sm hover:shadow-md transition-shadow border-0"
                  style={{ border: "1px solid #bfdbfe" }}
                >
                  <CardContent className="pt-6">
                    {t.imageUrl ? (
                      <img
                        src={t.imageUrl}
                        alt={t.name}
                        className="h-20 w-20 rounded-full object-cover mx-auto mb-3 border-2"
                        style={{ borderColor: BLUE.mid }}
                      />
                    ) : (
                      <div
                        className="h-20 w-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${BLUE.bg}, #1e40af)`,
                        }}
                      >
                        {t.name[0]}
                      </div>
                    )}
                    <p className="font-semibold text-gray-800">{t.name}</p>
                    <p className="text-sm text-muted-foreground">Teacher</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── GalleryPage ──────────────────────────────────────────────────────────────
function GalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const cached = lsGet<GalleryItem[]>(LS.GALLERY, []);
    if (cached.length > 0) {
      setImages(cached);
      setLoading(false);
    }
    getDocs(query(collection(db, "gallery"), orderBy("createdAt", "desc")))
      .then((snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as GalleryItem,
          );
          setImages(list);
          lsSet(LS.GALLERY, list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return (
    <PageWrapper>
      <PageHero title="Gallery" subtitle="Moments from our school life" />
      <section className="py-14 px-4 bg-white">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: BLUE.bg }}
              />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No gallery images yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  style={{ border: "1px solid #bfdbfe" }}
                >
                  <img
                    src={img.imageUrl}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── ContactPage ──────────────────────────────────────────────────────────────
function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <PageWrapper>
      <PageHero title="Contact Us" subtitle="We'd love to hear from you" />
      <section className="py-14 px-4 bg-white">
        <div className="container mx-auto grid md:grid-cols-2 gap-10 items-start">
          <div className="space-y-5">
            {[
              {
                icon: MapPin,
                label: "Address",
                value:
                  "Ward 55, Near TP Nagar, Manpur West, Haldwani, Nainital, Uttarakhand",
              },
              { icon: Phone, label: "Phone", value: "+91 84495 61111" },
              { icon: Mail, label: "Email", value: "info@shrikripa.edu.in" },
              {
                icon: Clock,
                label: "School Hours",
                value: "Mon–Sat: 8:00 AM – 2:30 PM",
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-4">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: BLUE.light }}
                >
                  <item.icon className="h-5 w-5" style={{ color: BLUE.bg }} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-muted-foreground text-sm">{item.value}</p>
                </div>
              </div>
            ))}
            <div
              className="rounded-xl overflow-hidden border shadow-md"
              style={{ borderColor: "#bfdbfe" }}
            >
              <iframe
                title="School Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28123.96!2d79.5189!3d29.2183!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a09a8e0f7b3c1f%3A0x0!2sHaldwani%2C%20Uttarakhand!5e0!3m2!1sen!2sin!4v1710000000000"
                className="w-full h-64"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <Card
            className="shadow-xl border-0"
            style={{ border: "1px solid #bfdbfe" }}
          >
            <CardHeader>
              <CardTitle className="font-display" style={{ color: BLUE.bg }}>
                Send a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div
                  className="text-center py-8"
                  data-ocid="contact.success_state"
                >
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold">Message sent!</p>
                  <p className="text-muted-foreground text-sm">
                    We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                  className="space-y-4"
                >
                  <Input
                    required
                    placeholder="Your Name"
                    data-ocid="contact.input"
                  />
                  <Input
                    required
                    type="email"
                    placeholder="Email Address"
                    data-ocid="contact.input"
                  />
                  <Input placeholder="Phone Number" data-ocid="contact.input" />
                  <Textarea
                    required
                    placeholder="Your message..."
                    rows={4}
                    data-ocid="contact.textarea"
                  />
                  <Button
                    type="submit"
                    className="w-full text-white"
                    style={{ background: BLUE.bg }}
                    data-ocid="contact.submit_button"
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── AdminLoginPage ───────────────────────────────────────────────────────────
function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const creds = getAdminCreds();
    if (username === creds.username && password === creds.password) {
      lsSet(LS.ADMIN_SESSION, { loggedIn: true, username });
      navigate({ to: "/admin/dashboard" });
      setLoading(false);
      return;
    }
    try {
      const adminDoc = await getDoc(doc(db, "admin", username));
      if (adminDoc.exists() && adminDoc.data().password === password) {
        lsSet(LS.ADMIN_CREDS, { username, password });
        lsSet(LS.ADMIN_SESSION, { loggedIn: true, username });
        navigate({ to: "/admin/dashboard" });
        setLoading(false);
        return;
      }
    } catch {}
    setError("Invalid username or password.");
    setLoading(false);
  }

  return (
    <PageWrapper>
      <div
        className="min-h-[80vh] flex items-center justify-center px-4"
        style={{ background: BLUE.vlight }}
      >
        <Card
          className="w-full max-w-sm shadow-2xl border-0"
          style={{ border: "1px solid #bfdbfe" }}
          data-ocid="admin.dialog"
        >
          <CardHeader className="text-center">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow"
              style={{
                background: `linear-gradient(135deg, ${BLUE.bg}, #1e40af)`,
              }}
            >
              <Shield className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="font-display text-2xl">Admin Login</CardTitle>
            <p className="text-muted-foreground text-sm">
              Shri Kripa Public School
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="admin-user">Username</Label>
                <Input
                  id="admin-user"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-ocid="admin.input"
                />
              </div>
              <div>
                <Label htmlFor="admin-pass">Password</Label>
                <Input
                  id="admin-pass"
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-ocid="admin.input"
                />
              </div>
              {error && (
                <p
                  className="text-destructive text-sm bg-red-50 p-2 rounded"
                  data-ocid="admin.error_state"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full text-white font-semibold"
                style={{ background: BLUE.bg }}
                disabled={loading}
                data-ocid="admin.submit_button"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  "Login to Admin Panel"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground pt-1">
                Default:{" "}
                <span className="font-mono font-semibold">shristi</span> /{" "}
                <span className="font-mono font-semibold">shristi@123</span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const admin = lsGet<{ loggedIn: boolean; username: string } | null>(
    LS.ADMIN_SESSION,
    null,
  );
  useEffect(() => {
    if (!admin?.loggedIn) navigate({ to: "/admin/login" });
  }, [admin, navigate]);
  function logout() {
    localStorage.removeItem(LS.ADMIN_SESSION);
    navigate({ to: "/admin/login" });
  }
  if (!admin?.loggedIn) return null;
  return (
    <PageWrapper>
      <div className="min-h-screen" style={{ background: BLUE.vlight }}>
        <div
          className="text-white py-4 px-4"
          style={{ background: `linear-gradient(135deg, ${BLUE.bg}, #1e40af)` }}
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-bold">Admin Panel</span>
              <span className="text-white/60 text-sm ml-2">
                — {admin.username}
              </span>
            </div>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="settings">
            <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-white p-1 rounded-xl shadow-sm">
              {[
                { value: "settings", label: "Settings" },
                { value: "teachers", label: "Teachers" },
                { value: "gallery", label: "Gallery" },
                { value: "notices", label: "Notices" },
                { value: "principal", label: "Principal" },
                { value: "achievements", label: "Achievements" },
                { value: "testimonials", label: "Testimonials" },
                { value: "fees", label: "Fee Structure" },
                { value: "calendar", label: "Calendar" },
                { value: "admissions", label: "Admissions" },
                { value: "credentials", label: "Credentials" },
              ].map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="data-[state=active]:text-white text-xs"
                  style={{ "--tab-active-bg": BLUE.bg } as React.CSSProperties}
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <TabsContent value="settings">
                <AdminSettings />
              </TabsContent>
              <TabsContent value="teachers">
                <AdminTeachers />
              </TabsContent>
              <TabsContent value="gallery">
                <AdminGallery />
              </TabsContent>
              <TabsContent value="notices">
                <AdminNotices />
              </TabsContent>
              <TabsContent value="principal">
                <AdminPrincipal />
              </TabsContent>
              <TabsContent value="achievements">
                <AdminAchievements />
              </TabsContent>
              <TabsContent value="testimonials">
                <AdminTestimonials />
              </TabsContent>
              <TabsContent value="fees">
                <AdminFees />
              </TabsContent>
              <TabsContent value="calendar">
                <AdminCalendar />
              </TabsContent>
              <TabsContent value="admissions">
                <AdminAdmissions />
              </TabsContent>
              <TabsContent value="credentials">
                <AdminCredentials currentUsername={admin.username} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </PageWrapper>
  );
}

// ─── AdminSettings ─────────────────────────────────────────────────────────────
function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(() =>
    lsGet<Settings>(LS.SETTINGS, {}),
  );
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  async function saveSettings() {
    setSaving(true);
    try {
      const updated = { ...settings };
      if (logoFile) {
        const { localUrl, firebaseUrl } = await uploadImage(
          logoFile,
          `logo/${Date.now()}_${logoFile.name}`,
        );
        updated.logoUrl = firebaseUrl || localUrl;
      }
      if (bannerFile) {
        const { localUrl, firebaseUrl } = await uploadImage(
          bannerFile,
          `banner/${Date.now()}_${bannerFile.name}`,
        );
        updated.bannerUrl = firebaseUrl || localUrl;
      }
      lsSet(LS.SETTINGS, updated);
      setSettings(updated);
      setDoc(doc(db, "settings", "main"), updated).catch(() => {});
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold" style={{ color: BLUE.bg }}>
        School Settings
      </h2>
      <Card style={{ border: "1px solid #bfdbfe" }}>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>School Name</Label>
            <Input
              value={settings.schoolName || ""}
              onChange={(e) =>
                setSettings((p) => ({ ...p, schoolName: e.target.value }))
              }
              placeholder="School Name"
              data-ocid="admin.input"
            />
          </div>
          <div>
            <Label>Academic Year</Label>
            <Input
              value={settings.academicYear || ""}
              onChange={(e) =>
                setSettings((p) => ({ ...p, academicYear: e.target.value }))
              }
              placeholder="e.g. 2025–26"
              data-ocid="admin.input"
            />
          </div>
          <div>
            <Label>About Us Text</Label>
            <Textarea
              rows={4}
              value={settings.aboutText || ""}
              onChange={(e) =>
                setSettings((p) => ({ ...p, aboutText: e.target.value }))
              }
              placeholder="Write about the school..."
              data-ocid="admin.textarea"
            />
          </div>
        </CardContent>
      </Card>
      <Card style={{ border: "1px solid #bfdbfe" }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: BLUE.bg }}>
            School Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(logoPreview || settings.logoUrl) && (
            <img
              src={logoPreview || settings.logoUrl}
              alt="Logo preview"
              className="h-24 w-24 rounded-full object-cover border-2"
              style={{ borderColor: BLUE.mid }}
            />
          )}
          <input
            ref={logoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setLogoFile(f);
                setLogoPreview(URL.createObjectURL(f));
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => logoRef.current?.click()}
            style={{ borderColor: BLUE.mid, color: BLUE.bg }}
            data-ocid="admin.upload_button"
          >
            <Upload className="h-4 w-4 mr-2" />
            {logoFile ? logoFile.name : "Choose Logo Image"}
          </Button>
        </CardContent>
      </Card>
      <Card style={{ border: "1px solid #bfdbfe" }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: BLUE.bg }}>
            Hero Banner Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(bannerPreview || settings.bannerUrl) && (
            <img
              src={bannerPreview || settings.bannerUrl}
              alt="Banner preview"
              className="w-full h-40 object-cover rounded-lg border"
              style={{ borderColor: BLUE.light }}
            />
          )}
          <input
            ref={bannerRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setBannerFile(f);
                setBannerPreview(URL.createObjectURL(f));
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => bannerRef.current?.click()}
            style={{ borderColor: BLUE.mid, color: BLUE.bg }}
            data-ocid="admin.upload_button"
          >
            <Upload className="h-4 w-4 mr-2" />
            {bannerFile ? bannerFile.name : "Choose Banner Image"}
          </Button>
        </CardContent>
      </Card>
      <Button
        onClick={saveSettings}
        className="text-white"
        style={{ background: BLUE.bg }}
        disabled={saving}
        data-ocid="admin.save_button"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save
        Settings
      </Button>
    </div>
  );
}

// ─── AdminTeachers ─────────────────────────────────────────────────────────────
function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>(() =>
    lsGet<Teacher[]>(LS.TEACHERS, []),
  );
  const [name, setName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [adding, setAdding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function addTeacher() {
    if (!name.trim()) {
      toast.error("Please enter teacher name.");
      return;
    }
    setAdding(true);
    try {
      let imageUrl = "";
      if (photoFile) {
        const { localUrl, firebaseUrl } = await uploadImage(
          photoFile,
          `teachers/${Date.now()}_${photoFile.name}`,
        );
        imageUrl = firebaseUrl || localUrl;
      }
      const newTeacher: Teacher = {
        id: Date.now().toString(),
        name: name.trim(),
        imageUrl,
      };
      const updated = [...teachers, newTeacher];
      setTeachers(updated);
      lsSet(LS.TEACHERS, updated);
      addDoc(collection(db, "teachers"), { name: name.trim(), imageUrl }).catch(
        () => {},
      );
      setName("");
      setPhotoFile(null);
      setPhotoPreview("");
      toast.success("Teacher added!");
    } catch {
      toast.error("Failed to add teacher.");
    } finally {
      setAdding(false);
    }
  }

  function deleteTeacher(id: string) {
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    lsSet(LS.TEACHERS, updated);
    deleteDoc(doc(db, "teachers", id)).catch(() => {});
    toast.success("Teacher deleted.");
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold" style={{ color: BLUE.bg }}>
        Manage Teachers
      </h2>
      <Card style={{ border: "1px solid #bfdbfe" }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: BLUE.bg }}>
            Add New Teacher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <Input
              placeholder="Teacher Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-xs"
              data-ocid="admin.input"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setPhotoFile(f);
                  setPhotoPreview(URL.createObjectURL(f));
                }
              }}
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              style={{ borderColor: BLUE.mid, color: BLUE.bg }}
              data-ocid="admin.upload_button"
            >
              <Upload className="h-4 w-4 mr-1" />
              {photoFile ? photoFile.name : "Photo"}
            </Button>
            <Button
              onClick={addTeacher}
              disabled={adding}
              className="text-white"
              style={{ background: BLUE.bg }}
              data-ocid="admin.primary_button"
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Add Teacher
            </Button>
          </div>
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              className="h-20 w-20 rounded-full object-cover border-2"
              style={{ borderColor: BLUE.light }}
            />
          )}
        </CardContent>
      </Card>
      {teachers.length === 0 ? (
        <div
          className="text-center py-10 text-muted-foreground"
          data-ocid="admin.empty_state"
        >
          No teachers added yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((t, i) => (
            <Card
              key={t.id}
              style={{ border: "1px solid #bfdbfe" }}
              data-ocid={`admin.item.${i + 1}`}
            >
              <CardContent className="flex items-center gap-3 pt-4">
                {t.imageUrl ? (
                  <img
                    src={t.imageUrl}
                    alt={t.name}
                    className="h-12 w-12 rounded-full object-cover border"
                    style={{ borderColor: BLUE.light }}
                  />
                ) : (
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: BLUE.bg }}
                  >
                    {t.name[0]}
                  </div>
                )}
                <p className="font-medium flex-1">{t.name}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => deleteTeacher(t.id)}
                  data-ocid={`admin.delete_button.${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AdminGallery ──────────────────────────────────────────────────────────────
function AdminGallery() {
  const [images, setImages] = useState<GalleryItem[]>(() =>
    lsGet<GalleryItem[]>(LS.GALLERY, []),
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { localUrl, firebaseUrl } = await uploadImage(
        file,
        `gallery/${Date.now()}_${file.name}`,
      );
      const imageUrl = firebaseUrl || localUrl;
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        imageUrl,
        createdAt: new Date().toISOString(),
      };
      const updated = [newItem, ...images];
      setImages(updated);
      lsSet(LS.GALLERY, updated);
      addDoc(collection(db, "gallery"), {
        imageUrl,
        createdAt: serverTimestamp(),
      }).catch(() => {});
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function deleteImage(id: string) {
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
    lsSet(LS.GALLERY, updated);
    deleteDoc(doc(db, "gallery", id)).catch(() => {});
    toast.success("Image deleted.");
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold" style={{ color: BLUE.bg }}>
        Manage Gallery
      </h2>
      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-white"
          style={{ background: BLUE.bg }}
          data-ocid="admin.upload_button"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Upload Image
        </Button>
      </div>
      {images.length === 0 ? (
        <div
          className="text-center py-10 text-muted-foreground"
          data-ocid="admin.empty_state"
        >
          No images uploaded yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="relative group rounded-lg overflow-hidden border shadow-md"
              style={{ borderColor: BLUE.light }}
              data-ocid={`admin.item.${i + 1}`}
            >
              <img
                src={img.imageUrl}
                alt={`Gallery ${i + 1}`}
                className="w-full h-40 object-cover"
              />
              <button
                type="button"
                onClick={() => deleteImage(img.id)}
                className="absolute top-2 right-2 h-8 w-8 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                data-ocid={`admin.delete_button.${i + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AdminNotices ──────────────────────────────────────────────────────────────
function AdminNotices() {
  const [notices, setNotices] = useState<Notice[]>(() =>
    lsGet<Notice[]>(LS.NOTICES, DEFAULT_NOTICES),
  );
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  function addNotice() {
    if (!title.trim()) {
      toast.error("Enter notice title.");
      return;
    }
    const n: Notice = { id: Date.now().toString(), title: title.trim(), date };
    const updated = [n, ...notices];
    setNotices(updated);
    lsSet(LS.NOTICES, updated);
    setTitle("");
    setDate("");
    toast.success("Notice added!");
  }
  function deleteNotice(id: string) {
    const updated = notices.filter((n) => n.id !== id);
    setNotices(updated);
    lsSet(LS.NOTICES, updated);
    toast.success("Notice deleted.");
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold" style={{ color: BLUE.bg }}>
        Manage Notice Board
      </h2>
      <Card style={{ border: "1px solid #bfdbfe" }}>
        <CardContent className="pt-6 space-y-3">
          <Input
            placeholder="Notice title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-ocid="admin.input"
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            data-ocid="admin.input"
          />
          <Button
            onClick={addNotice}
            className="text-white"
            style={{ background: BLUE.bg }}
            data-ocid="admin.primary_button"
          >
            Add Notice
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {notices.map((n, i) => (
          <div
            key={n.id}
            className="flex items-center justify-between bg-white rounded-lg p-3 border"
            style={{ borderColor: "#bfdbfe" }}
            data-ocid={`admin.item.${i + 1}`}
          >
            <div>
              <p className="font-medium">{n.title}</p>
              <p className="text-xs" style={{ color: BLUE.mid }}>
                {n.date}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={() => deleteNotice(n.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AdminPrincipal ────────────────────────────────────────────────────────────
function AdminPrincipal() {
  const [data, setData] = useState<Principal>(() =>
    lsGet<Principal>(LS.PRINCIPAL, DEFAULT_PRINCIPAL),
  );
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    lsSet(LS.PRINCIPAL, data);
    setTimeout(() => {
      setSaving(false);
      toast.success("Principal info saved!");
    }, 500);
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="font-display text-xl font-bold" style={{ color: BLUE.bg }}>
        Principal's Message
      </h2>
      <Card style={{ border: "1px solid #bfdbfe" }}>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={data.name}
              onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
              data-ocid="admin.input"
            />
          </div>
          <div>
            <Label>Designation</Label>
            <Input
              value={data.designation}
              onChange={(e) =>
                setData((p) => ({ ...p, designation: e.target.value }))
              }
              data-ocid="admin.input"
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              rows={5}
              value={data.message}
              onChange={(e) =>
                setData((p) => ({ ...p, message: e.target.value }))
              }
              data-ocid="admin.textarea"
            />
          </div>
          <Button
            onClick={save}
            className="text-white"
            style={{ background: BLUE.bg }}
            disabled={saving}
            data-ocid="admin.save_button"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── AdminAchievements ─────────────────────────────────────────────────────────
function AdminAchievements() {
  const [list, setList] = useState<Achievement[]>(() =>
    lsGet<Achievement[]>(LS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS),
  );
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");

  function add() {
    if (!title.trim()) {
      toast.error("Enter title.");
      return;
    }
    const a: Achievement = {
      id: Date.now().toString(),
      title: title.trim(),
      year,
    };
    const updated = [...list, a];
    setList(updated);
    lsSet(LS.ACHIEVEMENTS, updated);
    setTitle("");
    setYear("");
    toast.success("Achievement added!");
  }
  function remove(id: string) {
    const updated = list.filter((a) => a.id !== id);
    setList(updated);
    lsSet(LS.ACHIEVEMENTS, updated);
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold" style={{ color: BLUE.bg }}>
        Manage Achievements
      </h2>
      <Card style={{ border: "1px solid #bfdbfe" }}>
        <CardContent className="pt-6 space-y-3">
          <Input
            placeholder="Achievement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-ocid="admin.input"
          />
          <Input
            placeholder="Year (e.g. 2023)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            data-ocid="admin.input"
          />
          <Button
            onClick={add}
            className="text-white"
            style={{ background: BLUE.bg }}
          >
            Add Achievement
          </Button>
        </CardContent>
      </Card>
      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((a, i) => (
          <div
            key={a.id}
            className="flex items-center justify-between bg-white rounded-lg p-3 border"
            style={{ borderColor: "#bfdbfe" }}
            data-ocid={`admin.item.${i + 1}`}
          >
            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-xs" style={{ color: BLUE.mid }}>
                {a.year}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={() => remove(a.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AdminTestimonials ─────────────────────────────────────────────────────────
function AdminTestimonials() {
  const [list, setList] = useState<Testimonial[]>(() =>
    lsGet<Testimonial[]>(LS.TESTIMONIALS, DEFAULT_TESTIMONIALS),
  );
  const [form, setForm] = useState({
    parentName: "",
    childClass: "",
    review: "",
  });

  function add() {
    if (!form.parentName.trim() || !form.review.trim()) {
      toast.error("Fill all fields.");
      return;
    }
    const t: Testimonial = { id: Date.now().toString(), ...form };
    const updated = [...list, t];
    setList(updated);
    lsSet(LS.TESTIMONIALS, updated);
    setForm({ parentName: "", childClass: "", review: "" });
    toast.success("Testimonial added!");
  }
  function remove(id: string) {
    const updated = list.filter((t) => t.id !== id);
    setList(updated);
    lsSet(LS.TESTIMONIALS, updated);
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold" style={{ color: BLUE.bg }}>
        Manage Testimonials
      </h2>
      <Card style={{ border: "1px solid #bfdbfe" }}>
        <CardContent className="pt-6 space-y-3">
          <Input
            placeholder="Parent Name"
            value={form.parentName}
            onChange={(e) =>
              setForm((p) => ({ ...p, parentName: e.target.value }))
            }
            data-ocid="admin.input"
          />
          <Input
            placeholder="Child's Class (e.g. Class 5)"
            value={form.childClass}
            onChange={(e) =>
              setForm((p) => ({ ...p, childClass: e.target.value }))
            }
            data-ocid="admin.input"
          />
          <Textarea
            placeholder="Review..."
            rows={3}
            value={form.review}
            onChange={(e) => setForm((p) => ({ ...p, review: e.target.value }))}
            data-ocid="admin.textarea"
          />
          <Button
            onClick={add}
            className="text-white"
            style={{ background: BLUE.bg }}
          >
            Add Testimonial
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {list.map((t, i) => (
          <div
            key={t.id}
            className="flex items-start justify-between bg-white rounded-lg p-4 border"
            style={{ borderColor: "#bfdbfe" }}
            data-ocid={`admin.item.${i + 1}`}
          >
            <div className="flex-1 mr-3">
              <p className="text-sm italic text-gray-600">
                &ldquo;{t.review}&rdquo;
              </p>
              <p className="font-medium mt-2">
                {t.parentName} — {t.childClass}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive shrink-0"
              onClick={() => remove(t.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AdminFees ─────────────────────────────────────────────────────────────────
function AdminFees() {
  const [list, setList] = useState<FeeItem[]>(() =>
    lsGet<FeeItem[]>(LS.FEES, DEFAULT_FEES),
  );
  const [form, setForm] = useState({ className: "", annualFee: "" });

  function add() {
    if (!form.className.trim() || !form.annualFee.trim()) {
      toast.error("Fill all fields.");
      return;
    }
    const f: FeeItem = { id: Date.now().toString(), ...form };
    const updated = [...list, f];
    setList(updated);
    lsSet(LS.FEES, updated);
    setForm({ className: "", annualFee: "" });
    toast.success("Fee added!");
  }
  function remove(id: string) {
    const updated = list.filter((f) => f.id !== id);
    setList(updated);
    lsSet(LS.FEES, updated);
  }
  function update(id: string, field: keyof FeeItem, val: string) {
    const updated = list.map((f) => (f.id === id ? { ...f, [field]: val } : f));
    setList(updated);
    lsSet(LS.FEES, updated);
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold" style={{ color: BLUE.bg }}>
        Manage Fee Structure
      </h2>
      <Card style={{ border: "1px solid #bfdbfe" }}>
        <CardContent className="pt-6 space-y-3">
          <Input
            placeholder="Class (e.g. Nursery–UKG)"
            value={form.className}
            onChange={(e) =>
              setForm((p) => ({ ...p, className: e.target.value }))
            }
            data-ocid="admin.input"
          />
          <Input
            placeholder="Annual Fee (e.g. ₹10,000)"
            value={form.annualFee}
            onChange={(e) =>
              setForm((p) => ({ ...p, annualFee: e.target.value }))
            }
            data-ocid="admin.input"
          />
          <Button
            onClick={add}
            className="text-white"
            style={{ background: BLUE.bg }}
          >
            Add
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {list.map((f, i) => (
          <div
            key={f.id}
            className="flex items-center gap-3 bg-white rounded-lg p-3 border"
            style={{ borderColor: "#bfdbfe" }}
            data-ocid={`admin.item.${i + 1}`}
          >
            <Input
              value={f.className}
              onChange={(e) => update(f.id, "className", e.target.value)}
              className="flex-1"
            />
            <Input
              value={f.annualFee}
              onChange={(e) => update(f.id, "annualFee", e.target.value)}
              className="w-32"
            />
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={() => remove(f.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {list.length > 0 && (
        <Button
          onClick={() => lsSet(LS.FEES, list)}
          className="text-white"
          style={{ background: BLUE.bg }}
          data-ocid="admin.save_button"
        >
          Save Changes
        </Button>
      )}
    </div>
  );
}

// ─── AdminCalendar ─────────────────────────────────────────────────────────────
function AdminCalendar() {
  const [list, setList] = useState<CalendarItem[]>(() =>
    lsGet<CalendarItem[]>(LS.CALENDAR, DEFAULT_CALENDAR),
  );
  const [form, setForm] = useState({ event: "", date: "" });

  function add() {
    if (!form.event.trim()) {
      toast.error("Enter event name.");
      return;
    }
    const c: CalendarItem = { id: Date.now().toString(), ...form };
    const updated = [...list, c];
    setList(updated);
    lsSet(LS.CALENDAR, updated);
    setForm({ event: "", date: "" });
    toast.success("Event added!");
  }
  function remove(id: string) {
    const updated = list.filter((c) => c.id !== id);
    setList(updated);
    lsSet(LS.CALENDAR, updated);
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold" style={{ color: BLUE.bg }}>
        Manage Academic Calendar
      </h2>
      <Card style={{ border: "1px solid #bfdbfe" }}>
        <CardContent className="pt-6 space-y-3">
          <Input
            placeholder="Event name"
            value={form.event}
            onChange={(e) => setForm((p) => ({ ...p, event: e.target.value }))}
            data-ocid="admin.input"
          />
          <Input
            placeholder="Date (e.g. April 1, 2025)"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            data-ocid="admin.input"
          />
          <Button
            onClick={add}
            className="text-white"
            style={{ background: BLUE.bg }}
          >
            Add Event
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {list.map((c, i) => (
          <div
            key={c.id}
            className="flex items-center justify-between bg-white rounded-lg p-3 border"
            style={{ borderColor: "#bfdbfe" }}
            data-ocid={`admin.item.${i + 1}`}
          >
            <div>
              <p className="font-medium">{c.event}</p>
              <p className="text-xs" style={{ color: BLUE.mid }}>
                {c.date}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={() => remove(c.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AdminAdmissions ──────────────────────────────────────────────────────────
function AdminAdmissions() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const cached = lsGet<Admission[]>(LS.ADMISSIONS, []);
    if (cached.length > 0) {
      setAdmissions(cached);
      setLoading(false);
    }
    getDocs(query(collection(db, "admissions"), orderBy("createdAt", "desc")))
      .then((snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as Admission,
          );
          setAdmissions(list);
          lsSet(LS.ADMISSIONS, list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold" style={{ color: BLUE.bg }}>
        Admission Enquiries
      </h2>
      <p
        className="text-sm text-muted-foreground rounded-lg p-3"
        style={{ background: BLUE.vlight, border: "1px solid #bfdbfe" }}
      >
        Data is saved locally. After Firebase deployment, all enquiries will
        also appear in your Firebase Console.
      </p>
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: BLUE.bg }}
          />
        </div>
      ) : admissions.length === 0 ? (
        <div
          className="text-center py-10 text-muted-foreground"
          data-ocid="admin.empty_state"
        >
          No admission enquiries yet.
        </div>
      ) : (
        <div
          className="rounded-lg border overflow-auto"
          style={{ borderColor: "#bfdbfe" }}
          data-ocid="admin.table"
        >
          <Table>
            <TableHeader>
              <TableRow style={{ background: BLUE.vlight }}>
                <TableHead>#</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Father's Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissions.map((a, i) => (
                <TableRow key={a.id} data-ocid={`admin.row.${i + 1}`}>
                  <TableCell className="text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.fatherName}</TableCell>
                  <TableCell>
                    <Badge style={{ background: BLUE.light, color: BLUE.bg }}>
                      {a.class}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.phone}</TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {a.address}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {a.createdAt
                      ? new Date(a.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── AdminCredentials ──────────────────────────────────────────────────────────
function AdminCredentials({ currentUsername }: { currentUsername: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    try {
      const newUser = form.newUsername.trim() || currentUsername;
      const newCreds = { username: newUser, password: form.newPassword };
      lsSet(LS.ADMIN_CREDS, newCreds);
      if (newUser !== currentUsername) {
        setDoc(doc(db, "admin", newUser), newCreds).catch(() => {});
        deleteDoc(doc(db, "admin", currentUsername)).catch(() => {});
      } else {
        updateDoc(doc(db, "admin", currentUsername), {
          password: form.newPassword,
        }).catch(() => {});
      }
      toast.success("Credentials updated! Please log in again.");
      localStorage.removeItem(LS.ADMIN_SESSION);
      navigate({ to: "/admin/login" });
    } catch {
      toast.error("Failed to update credentials.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <h2 className="font-display text-xl font-bold" style={{ color: BLUE.bg }}>
        Change Admin Credentials
      </h2>
      <Card style={{ border: "1px solid #bfdbfe" }}>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="new-user">New Username</Label>
              <Input
                id="new-user"
                value={form.newUsername}
                onChange={(e) =>
                  setForm((p) => ({ ...p, newUsername: e.target.value }))
                }
                placeholder={`Current: ${currentUsername}`}
                data-ocid="admin.input"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to keep current username.
              </p>
            </div>
            <div>
              <Label htmlFor="new-pass">New Password</Label>
              <Input
                id="new-pass"
                type="password"
                required
                value={form.newPassword}
                onChange={(e) =>
                  setForm((p) => ({ ...p, newPassword: e.target.value }))
                }
                placeholder="New password"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label htmlFor="confirm-pass">Confirm Password</Label>
              <Input
                id="confirm-pass"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                placeholder="Confirm new password"
                data-ocid="admin.input"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button
              type="submit"
              className="text-white"
              style={{ background: BLUE.bg }}
              disabled={saving}
              data-ocid="admin.save_button"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Update Credentials
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────────
function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster richColors position="top-right" />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

// ─── Router ────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: RootLayout });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});
const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses",
  component: CoursesPage,
});
const admissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admissions",
  component: AdmissionsPage,
});
const teachersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/teachers",
  component: TeachersPage,
});
const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gallery",
  component: GalleryPage,
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLoginPage,
});
const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  coursesRoute,
  admissionsRoute,
  teachersRoute,
  galleryRoute,
  contactRoute,
  adminLoginRoute,
  adminDashboardRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return <RouterProvider router={router} />;
}
