import { db, storage as firebaseStorage } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadString,
} from "firebase/storage";
import type {
  AdminCredentials,
  Admission,
  AdmissionStatus,
  GalleryImage,
  SchoolEvent,
  SchoolSettings,
  Teacher,
} from "./storage";
import { DEFAULT_CREDENTIALS, DEFAULT_SETTINGS, genId } from "./storage";

// ─── Image Upload ────────────────────────────────────────────────────────────
// Upload a base64 data URL or a File to Firebase Storage, return download URL
export async function uploadImage(
  imageData: string | File,
  path: string,
): Promise<string> {
  const storageRef = ref(firebaseStorage, path);
  if (typeof imageData === "string" && imageData.startsWith("data:")) {
    // base64 data URL
    const [header, data] = imageData.split(",");
    const mimeMatch = header.match(/data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    await uploadString(storageRef, data, "base64", { contentType: mimeType });
  } else if (imageData instanceof File) {
    await uploadBytes(storageRef, imageData);
  } else {
    // already a URL, return as-is
    return imageData as string;
  }
  return getDownloadURL(storageRef);
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
  // Upload logo if base64
  let logo = settings.logo;
  if (logo?.startsWith("data:")) {
    logo = await uploadImage(logo, `school/logo_${Date.now()}`);
  }
  // Upload banner if base64
  let banner = settings.banner;
  if (banner?.startsWith("data:")) {
    banner = await uploadImage(banner, `school/banner_${Date.now()}`);
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
  let photo = teacher.photo;
  if (photo?.startsWith("data:")) {
    photo = await uploadImage(photo, `teachers/${teacher.id}_${Date.now()}`);
  }
  await setDoc(doc(db, "teachers", teacher.id), {
    ...teacher,
    id: teacher.id,
    photo,
  });
}

export async function deleteTeacher(id: string): Promise<void> {
  await deleteDoc(doc(db, "teachers", id));
}

// ─── Gallery ───────────────────────────────────────────────────────────────────
export async function getGallery(): Promise<GalleryImage[]> {
  try {
    const snap = await getDocs(collection(db, "gallery"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GalleryImage);
  } catch (e) {
    console.error("getGallery error", e);
    return [];
  }
}

export async function addGalleryImage(
  imageData: string,
  id: string,
): Promise<GalleryImage> {
  const imageUrl = await uploadImage(imageData, `gallery/${id}_${Date.now()}`);
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
  // Upload any base64 images
  const uploadedImages = await Promise.all(
    event.images.map(async (img, i) => {
      if (img.startsWith("data:")) {
        return uploadImage(img, `events/${event.id}_img${i}_${Date.now()}`);
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
  await updateDoc(doc(db, "admissions", id), { status });
}

export { genId };
