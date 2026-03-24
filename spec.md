# Shri Kripa School Website

## Current State
React + Tailwind CSS SPA in a single large App.tsx. Light green/white theme. Has admin panel, gallery, events, teachers, admissions. Multiple bugs: image upload not working, crop feature missing, default credentials shown on login page, application status not properly organized.

## Requested Changes (Diff)

### Add
- Deep Navy Blue + Gold + White professional theme throughout
- Image upload working in all sections (gallery, teachers, events, logo, banner) using FileReader/base64 stored in localStorage
- Crop/adjust feature before upload (react-image-crop or canvas-based): circle crop for logo, rectangle for others
- Application status organized: Pending section on top, Contacted (green) section below, Not Attended (yellow) section below that -- each in separate labeled boxes
- Floating WhatsApp button on all pages

### Modify
- Theme: Deep navy (#1a2744) navbar/footer, gold (#d4a017) accents/buttons, white backgrounds
- Admin login page: Remove default credentials hint text
- Image handling: Use FileReader to convert images to base64 and store in localStorage (no Firebase dependency in dev)
- Mobile layout: 3 photos per row for gallery/teachers/events on mobile
- Performance: Synchronous localStorage saves, debounced state updates
- Contact info in settings: editable address, phone, email
- Notice board: admin editable
- Admissions year: admin editable
- Events: clickable cards on home page showing event images in modal/page

### Remove
- Default credentials text from admin login page

## Implementation Plan
1. Rewrite App.tsx completely with new Navy+Gold theme
2. Implement proper image upload using FileReader API (base64 to localStorage)
3. Add canvas-based crop modal (circle for logo, rectangle for others)
4. Organize admission applications into 3 separate status sections
5. Remove default credentials from login page
6. Ensure mobile-first responsive layout (3 cols mobile, 2 tablet, 4 desktop for grids)
7. All dynamic content managed from admin settings
