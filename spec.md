# Shri Kripa School Website

## Current State
- All data (admissions, teachers, gallery, events, settings, admin credentials) stored in localStorage via `src/utils/storage.ts`
- Images stored as base64 strings in localStorage
- Firebase config exists in `src/firebase.js` exporting `db` (Firestore) and `storage` (Firebase Storage)
- Firebase package added to package.json (`firebase ^10.12.0`) but not yet installed
- All storage functions in `storage.ts` are synchronous
- All pages (AdminPage, Admissions, Home, etc.) call `storage.*` functions synchronously

## Requested Changes (Diff)

### Add
- `src/utils/firebaseService.ts`: async Firebase service layer wrapping all Firestore + Storage operations
- npm install firebase (run during build)

### Modify
- `src/utils/storage.ts`: Keep TypeScript types and defaults, but replace localStorage read/write with Firebase calls (async)
- `src/pages/AdminPage.tsx`: Update all `storage.*` calls to async (await), add loading states
- `src/pages/Admissions.tsx`: Save admissions to Firestore instead of localStorage
- `src/pages/Home.tsx`, `src/pages/GalleryPage.tsx`, `src/pages/TeachersPage.tsx`, `src/pages/About.tsx`, `src/pages/EventDetail.tsx`: Load data from Firestore on mount (useEffect + async)
- `src/App.tsx`: Load settings from Firestore on startup
- `src/firebase.js`: Already updated with new config

### Remove
- All `localStorage.getItem` / `localStorage.setItem` calls for school data

## Implementation Plan

1. Run `npm install` in `src/frontend` to install firebase package
2. Create `firebaseService.ts` with these async functions:
   - `getSettings() / setSettings()` → Firestore `settings/main` doc
   - `getCredentials() / setCredentials()` → Firestore `admin/credentials` doc
   - `getTeachers() / setTeachers()` → Firestore `teachers` collection
   - `getGallery() / setGallery()` → Firestore `gallery` collection
   - `getEvents() / setEvents()` → Firestore `events` collection
   - `getAdmissions() / setAdmissions()` → Firestore `admissions` collection
   - `updateAdmissionStatus(id, status)` → update single doc
   - `uploadImage(file, path)` → Firebase Storage upload, return download URL
3. Update `storage.ts` to re-export types + async functions from firebaseService
4. Update all pages to use async data loading with useEffect + useState for loading states
5. In AdminPage: image uploads go to Firebase Storage, not base64 localStorage
6. Admin credentials stored in Firestore `admin/credentials` doc
7. Validate and build

### Firestore Collections Structure
- `settings/main`: { name, tagline, logo, banner, about, classes, noticeBoard, admissionsYear, contact: {address, phone, email} }
- `admin/credentials`: { username, password }
- `teachers/{id}`: { name, photo (Storage URL), speciality }
- `gallery/{id}`: { imageUrl (Storage URL), createdAt }
- `events/{id}`: { title, images: string[] (Storage URLs) }
- `admissions/{id}`: { name, fatherName, class, phone, createdAt, status }
