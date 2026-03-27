// ─── Types ────────────────────────────────────────────────────────────────────
export interface AdminCredentials {
  username: string;
  password: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
}

export interface SchoolSettings {
  name: string;
  tagline: string;
  logo: string;
  banner: string;
  about: string;
  classes: string[];
  noticeBoard: string;
  admissionsYear: string;
  contact: ContactInfo;
}

export interface Teacher {
  id: string;
  name: string;
  photo: string;
  speciality: string;
}

export interface LeadershipMember {
  id: string;
  name: string;
  photo: string;
  post: string;
  contact: string;
  order: number;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  images: string[];
}

export type AdmissionStatus = "pending" | "contacted" | "not_attended";

export interface Admission {
  id: string;
  name: string;
  fatherName: string;
  class: string;
  phone: string;
  createdAt: string;
  status: AdmissionStatus;
}

// ─── Defaults (exported for firebaseService) ──────────────────────────────────
export const DEFAULT_SETTINGS: SchoolSettings = {
  name: "Shri Kripa Public School",
  tagline: "Nurturing Minds, Building Futures — Excellence Since 2008",
  logo: "",
  banner: "",
  about:
    "Shri Kripa Public School is a premier educational institution located in Haldwani, Nainital, Uttarakhand. We provide quality education from Nursery to 8th class in a nurturing environment. Our dedicated faculty, modern teaching methods, and holistic approach ensure every child reaches their full potential.",
  classes: [
    "Nursery",
    "KG",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
  ],
  noticeBoard:
    "Admissions are open for 2025-26. Contact us at 8449561111 for details. Annual Sports Day on 15th March 2026. Parent-Teacher Meeting scheduled for 5th April 2026.",
  admissionsYear: "2025-26",
  contact: {
    address:
      "Ward 55, Near TP Nagar, Manpur West, Haldwani, Nainital, Uttarakhand",
    phone: "+91 84495 61111",
    email: "info@shrikripa.edu.in",
  },
};

export const DEFAULT_CREDENTIALS: AdminCredentials = {
  username: "shristi",
  password: "shristi@123",
};

export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
