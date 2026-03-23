# Shri Kripa School Website

## Current State
React + Tailwind CSS SPA with Firebase backend. Has: Home, About, Courses, Admissions, Gallery, Contact, Admin Panel. Theme is orange/white. Data saved to localStorage in dev, Firebase on deploy. Admin login: shristi/shristi@123.

## Requested Changes (Diff)

### Add
- **Blue + White professional theme** throughout (government school style, deep blue navbar/footer, white body, blue accents)
- **Principal's Message section** on About page (photo + message card)
- **Notice Board / Announcements section** on Home page (admin can add/edit notices, shown as scrollable list)
- **Achievements / Awards section** on Home or About page (trophies, ranks)
- **Student Stats counter section** on Home page (500+ Students, 20+ Teachers, 15+ Years, 8 Classes)
- **Testimonials / Parent Reviews** section on Home page (3-4 static/admin-managed quotes)
- **Fee Structure section** on Admissions page (class-wise fee table, admin can update)
- **Academic Calendar section** on About or separate page (important dates: exams, vacations)
- **Social Media Links** in footer (Facebook, WhatsApp, YouTube placeholders)
- **Admin Panel additions**: manage notices, testimonials, fee structure, achievements, academic calendar

### Modify
- Full color theme change: orange → blue/white. Deep blue (#1a3a6b or similar) for navbar, footer, buttons, headings. White/light blue for backgrounds.
- Hero section: blue gradient overlay on banner image
- All CTA buttons: blue
- Cards and section accents: blue shades

### Remove
- All orange color classes and variables

## Implementation Plan
1. Update tailwind.config.js to add blue school color palette
2. Rewrite index.css with blue/white CSS variables
3. Redesign App.tsx with all new sections + blue/white theme:
   - Navbar: deep blue background, white text
   - Hero: blue gradient
   - Stats counter strip (white on blue)
   - Notice Board (home page card)
   - Principal's Message (about page)
   - Achievements section
   - Testimonials section
   - Fee Structure table (admissions page)
   - Academic Calendar (accordion/table)
   - Social media icons in footer
   - Admin panel: new management tabs for notices, testimonials, fee structure, achievements, calendar
4. All localStorage keys preserved; admin credentials unchanged
