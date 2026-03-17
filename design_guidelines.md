# Salam Bumi Property - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from premium real estate platforms (Airbnb, Zillow, Realtor.com) combined with modern Indonesian e-commerce aesthetics. The design emphasizes visual hierarchy, trust-building through professional imagery, and seamless property discovery.

**Core Principles**:
- Visual-first presentation showcasing property photography
- Clean, sophisticated aesthetic conveying professionalism and trust
- Intuitive search and filtering without overwhelming users
- Mobile-first responsive design with optimized property card layouts

---

## Typography

**Font Stack**: Google Fonts via CDN
- **Primary**: Inter (headings, UI elements) - weights 400, 500, 600, 700
- **Secondary**: Open Sans (body text, descriptions) - weights 400, 600

**Hierarchy**:
- H1 (Hero/Page Titles): text-4xl md:text-5xl font-bold
- H2 (Section Headers): text-3xl md:text-4xl font-semibold
- H3 (Property Titles): text-xl md:text-2xl font-semibold
- Body Large: text-lg font-normal
- Body Regular: text-base font-normal
- Small/Meta: text-sm font-normal
- Labels/Badges: text-xs md:text-sm font-semibold uppercase tracking-wide

---

## Layout System

**Spacing Scale**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: py-12 md:py-20
- Card gaps: gap-4 to gap-6
- Container max-width: max-w-7xl with px-4 md:px-6 lg:px-8

**Grid Systems**:
- Desktop property grid: grid-cols-4 gap-6
- Tablet property grid: grid-cols-2 gap-4
- Mobile property grid: grid-cols-2 gap-3
- Featured banner: Full-width auto-slider with 16:9 aspect ratio images

---

## Component Library

### Navigation
**Desktop**: Horizontal navigation with logo left, menu items center, CTA button right
- Logo height: h-10 md:h-12
- Menu items: text-base font-medium with hover underline effect
- Sticky on scroll with subtle shadow

**Mobile**: Hamburger menu with slide-in drawer
- Full-height overlay with stacked navigation items
- Close icon top-right
- Menu items: text-lg with generous tap targets (min-height: h-14)

### Hero Section
**Layout**: Full-width banner with overlaid search interface
- Height: h-[500px] md:h-[600px]
- Large hero image (property showcase or city skyline)
- Centered content with slogan and search bar
- Semi-transparent dark overlay (bg-black/40) for text legibility

**Search Bar**: 
- Prominent rounded container (rounded-full or rounded-2xl)
- Input fields side-by-side on desktop, stacked on mobile
- Primary CTA button: "Cari Properti" (rounded-full, blurred background)
- Dropdown filters with icons (bedrooms, bathrooms, price range)

### Property Pilihan Banner
**Auto-Slider**:
- Full-width carousel with navigation dots
- Aspect ratio: 16:9 with rounded-xl corners
- Auto-play interval: 5 seconds
- Smooth fade transitions
- Property title overlay at bottom with gradient backdrop

### Property Cards
**Card Structure**:
- Image container: aspect-[4/3] with rounded-t-xl
- Label badge: Absolute positioned top-left with rounded-tr-xl, rounded-bl-xl
- Content padding: p-4
- Price: text-xl md:text-2xl font-bold
- Location: text-sm with map pin icon
- Specs row: Bedrooms, bathrooms, land/building area with icons (grid-cols-2 md:grid-cols-4)

**Label Treatments**:
- **Premium**: Blue badge (px-3 py-1.5)
- **Featured**: Gold/amber badge (px-3 py-1.5)
- **Hot Listing**: Red badge with price drop indicator below
  - Old price: text-sm line-through opacity-70
  - New price: text-xl font-bold with red down-arrow icon
- **SOLD**: Diagonal banner overlay spanning corner-to-corner, red background, white bold text, image opacity-40

**Hover State**: Subtle scale transform (scale-105) with shadow elevation increase

### Property Detail Page
**Image Gallery**:
- Primary image: aspect-[16/9] with rounded-xl
- Thumbnail strip below: 4-5 thumbnails (aspect-square, rounded-lg, gap-2)
- Auto-sliding carousel with manual controls
- Full-screen lightbox on image click

**Information Layout**:
- Two-column layout (desktop): 2/3 content, 1/3 inquiry form sticky sidebar
- Single column (mobile): Content stacked, form at bottom
- Specs grid: grid-cols-2 md:grid-cols-3 with icon-label-value pattern
- Description: max-w-prose with generous line-height (leading-relaxed)

**Inquiry Form**:
- Card with shadow and rounded-xl border
- Input fields: Full-width with rounded-lg, border, focus ring
- WhatsApp input with flag icon
- Textarea for message: min-h-32
- Submit button: Full-width, prominent, rounded-lg
- Form heading: "Hubungi Kami" with contact icon

**Action Buttons**:
- Favorites: Heart icon, toggle state (outline/filled)
- Share: Share icon with dropdown for social platforms
- Both buttons: rounded-full, border, hover fill

### Admin Dashboard
**Layout**: Sidebar navigation with main content area
- Sidebar: w-64 fixed, full-height with logo at top
- Main content: ml-64 with top bar (breadcrumbs, user menu)
- Cards for stats: grid-cols-1 md:grid-cols-2 lg:grid-cols-4

**Data Tables**:
- Striped rows with hover highlight
- Action buttons: Icon-only with tooltips
- Pagination: Centered with page numbers and prev/next
- Bulk actions toolbar: Sticky at top when items selected

**Forms**:
- Section grouping with headings
- Label above input pattern
- Inline validation messages
- CSV import: Drag-drop zone with file preview
- Property labeling: Radio buttons with visual badge previews

### Footer
**Multi-Column Layout** (desktop: 4 columns, mobile: stacked):
- Company info with logo
- Quick links (navigation pages)
- Contact information with icons
- Social media icons
- Newsletter signup form
- Copyright and legal links at bottom

---

## Images

**Hero Section**: Large cityscape or premium property exterior (modern architecture, natural lighting)
- Dimensions: 1920x1080px minimum
- Professional, high-quality photography
- Shows Jakarta or major Indonesian city

**Property Pilihan Banner**: Featured property images
- Dimensions: 1600x900px
- Professional interior/exterior shots
- Well-lit, staged properties

**Property Cards**: 
- Thumbnail images: 800x600px minimum
- Consistent aspect ratio across all listings
- Property exteriors or best interior shots

**About/Portfolio Pages**: Team photos, office location, previous projects
- Natural, authentic photography
- Professional headshots for team
- Before/after for portfolio showcases

---

## Key Interactions

**Animations**: Minimal and purposeful
- Card hover: scale-105 transition-transform duration-200
- Button hover: brightness-110 transition
- Slider transitions: fade or slide, duration-500
- No scroll-triggered animations to maintain performance

**Search & Filter**:
- Instant visual feedback on filter application
- Clear filter chips with remove buttons
- Results count display
- Skeleton loaders during search

**Mobile Optimizations**:
- Touch-friendly tap targets (min 44x44px)
- Swipeable image galleries
- Collapsible filter panel
- Bottom-fixed CTA buttons on detail pages