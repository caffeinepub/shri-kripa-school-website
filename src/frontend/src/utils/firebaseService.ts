import { db } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import type {
  AdminCredentials,
  Admission,
  AdmissionStatus,
  GalleryImage,
  LeadershipMember,
  SchoolEvent,
  SchoolSettings,
  Teacher,
} from "./storage";
import { DEFAULT_CREDENTIALS, DEFAULT_SETTINGS, genId } from "./storage";

// ─── Image Upload (base64 compress, no Storage needed) ────────────────────────
export async function uploadImage(
  imageData: string | File,
  _path: string,
): Promise<string> {
  return new Promise((resolve) => {
    const processBase64 = (base64: string) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 900; // increased from 600 for better quality
        let w = img.width;
        let h = img.height;
        if (w > MAX) {
          h = Math.round((h * MAX) / w);
          w = MAX;
        }
        if (h > MAX) {
          w = Math.round((w * MAX) / h);
          h = MAX;
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75)); // increased from 0.6
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    };

    if (imageData instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => processBase64(e.target?.result as string);
      reader.readAsDataURL(imageData);
    } else {
      processBase64(imageData);
    }
  });
}

// ─── Settings ──────────────────────────────────────────────────────────────────
export async function getSettings(): Promise<SchoolSettings> {
  try {
    const snap = await getDoc(doc(db, "settings", "main"));
    if (snap.exists()) {
      const data = snap.data() as Partial<SchoolSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...data,
        contact: { ...DEFAULT_SETTINGS.contact, ...(data.contact ?? {}) },
      };
    }
  } catch (e) {
    console.error("getSettings error", e);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: SchoolSettings): Promise<void> {
  let logo = settings.logo;
  if (logo?.startsWith("data:")) {
    logo = await uploadImage(logo, "logo");
  }
  let banner = settings.banner;
  if (banner?.startsWith("data:")) {
    banner = await uploadImage(banner, "banner");
  }
  await setDoc(doc(db, "settings", "main"), { ...settings, logo, banner });
}

// ─── Admin Credentials ────────────────────────────────────────────────────────
export async function getCredentials(): Promise<AdminCredentials> {
  try {
    const snap = await getDoc(doc(db, "admin", "credentials"));
    if (snap.exists()) return snap.data() as AdminCredentials;
  } catch (e) {
    console.error("getCredentials error", e);
  }
  return DEFAULT_CREDENTIALS;
}

export async function saveCredentials(creds: AdminCredentials): Promise<void> {
  await setDoc(doc(db, "admin", "credentials"), creds);
}

// ─── Teachers ──────────────────────────────────────────────────────────────────
export async function getTeachers(): Promise<Teacher[]> {
  try {
    const snap = await getDocs(collection(db, "teachers"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Teacher);
  } catch (e) {
    console.error("getTeachers error", e);
    return [];
  }
}

export async function saveTeacher(teacher: Teacher): Promise<void> {
  const id = String(teacher.id || genId()).trim();
  let photo = teacher.photo;
  if (photo?.startsWith("data:")) {
    photo = await uploadImage(photo, `teachers/${id}`);
  }
  await setDoc(doc(db, "teachers", id), { ...teacher, id, photo });
}

export async function deleteTeacher(id: string): Promise<void> {
  await deleteDoc(doc(db, "teachers", id));
}

// ─── Leadership ───────────────────────────────────────────────────────────────
export async function getLeadership(): Promise<LeadershipMember[]> {
  try {
    const snap = await getDocs(collection(db, "leadership"));
    const members = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as LeadershipMember,
    );
    return members.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (e) {
    console.error("getLeadership error", e);
    return [];
  }
}

export async function saveLeadershipMember(
  member: LeadershipMember,
): Promise<void> {
  const id = String(member.id || genId()).trim();
  let photo = member.photo;
  if (photo?.startsWith("data:")) {
    photo = await uploadImage(photo, `leadership/${id}`);
  }
  await setDoc(doc(db, "leadership", id), { ...member, id, photo });
}

export async function deleteLeadershipMember(id: string): Promise<void> {
  await deleteDoc(doc(db, "leadership", id));
}

// ─── Gallery ───────────────────────────────────────────────────────────────────
export async function getGallery(): Promise<GalleryImage[]> {
  try {
    const snap = await getDocs(collection(db, "gallery"));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        // normalize field name -- support both imageUrl and url
        imageUrl: data.imageUrl || data.url || data.image || data.src || "",
      } as GalleryImage;
    });
  } catch (e) {
    console.error("getGallery error", e);
    return [];
  }
}

export async function addGalleryImage(
  imageData: string,
  id: string,
): Promise<GalleryImage> {
  const imageUrl = await uploadImage(imageData, `gallery/${id}`);
  const img: GalleryImage = {
    id,
    imageUrl,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, "gallery", id), img);
  return img;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await deleteDoc(doc(db, "gallery", id));
}

// ─── Events ────────────────────────────────────────────────────────────────────
export async function getEvents(): Promise<SchoolEvent[]> {
  try {
    const snap = await getDocs(collection(db, "events"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SchoolEvent);
  } catch (e) {
    console.error("getEvents error", e);
    return [];
  }
}

export async function saveEvent(event: SchoolEvent): Promise<SchoolEvent> {
  const uploadedImages = await Promise.all(
    event.images.map(async (img, i) => {
      if (img.startsWith("data:")) {
        return uploadImage(img, `events/${event.id}_img${i}`);
      }
      return img;
    }),
  );
  const ev = { ...event, images: uploadedImages };
  await setDoc(doc(db, "events", event.id), ev);
  return ev;
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, "events", id));
}

// ─── Admissions ─────────────────────────────────────────────────────────────────
export async function getAdmissions(): Promise<Admission[]> {
  try {
    const snap = await getDocs(collection(db, "admissions"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Admission);
  } catch (e) {
    console.error("getAdmissions error", e);
    return [];
  }
}

export async function addAdmission(admission: Admission): Promise<void> {
  await setDoc(doc(db, "admissions", admission.id), admission);
}

export async function updateAdmissionStatus(
  id: string,
  status: AdmissionStatus,
): Promise<void> {
  await setDoc(doc(db, "admissions", id), { status }, { merge: true });
}

export { genId };
