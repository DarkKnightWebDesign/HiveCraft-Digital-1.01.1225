# HiveCraft Digital - Design Guidelines

## Design Approach
**Reference-Based:** Drawing inspiration from Linear (dashboard clarity), Stripe (professional restraint), and Notion (organized content hierarchy). The brand's existing identity—dark foundations with gold accents and hexagonal motifs—drives all visual decisions.

## Typography System

**Font Families:**
- Headlines: Montserrat (weights: 600, 700)
- Body: Inter (weights: 400, 500, 600)
- Accent/Code: JetBrains Mono (weight: 500, limited use for version numbers, technical labels)

**Type Scale:**
- Hero Headlines: text-5xl lg:text-6xl xl:text-7xl (Montserrat Bold)
- Section Headlines: text-3xl lg:text-4xl (Montserrat SemiBold)
- Subsection Titles: text-xl lg:text-2xl (Montserrat SemiBold)
- Body Large: text-lg (Inter Regular)
- Body Standard: text-base (Inter Regular)
- Body Small: text-sm (Inter Medium)
- Labels/Caps: text-xs uppercase tracking-wider (Inter SemiBold)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 8, 12, 16, 20, 24 (e.g., p-4, gap-8, my-16)

**Container Structure:**
- Full-width sections with inner max-w-7xl mx-auto px-6 lg:px-8
- Content-focused sections: max-w-6xl
- Text content: max-w-3xl for optimal readability
- Dashboard containers: max-w-screen-2xl

**Vertical Rhythm:**
- Section padding: py-16 lg:py-24 xl:py-32
- Card/Component padding: p-6 lg:p-8
- Compact components: p-4

## Marketing Website Structure

### Home Page
**Hero Section (100vh):** Full-viewport immersive hero with large background image showing hexagonal pattern overlays or geometric web/digital infrastructure. Hero includes bold headline (e.g., "Precision-Built Digital Systems"), supporting subheadline, dual CTAs ("Start a Project" + "View Our Work"), trust indicator strip below ("Trusted by 50+ businesses").

**Services Grid (3 columns desktop, 1 mobile):** Four service cards with hexagonal icons, titles, brief descriptions, "Learn More" links. Cards use subtle borders and hover lift effects.

**Process Timeline (horizontal):** Five stages (Discover → Design → Build → Launch → Care) displayed as connected hexagonal nodes with descriptions. Desktop shows horizontal flow, mobile stacks vertically.

**Portfolio Showcase:** Masonry grid (2-3 columns) featuring project thumbnails with overlay labels. Each card reveals project name and category on hover.

**Social Proof:** 2-column layout with client testimonials (left) and key metrics/stats (right) displayed in hexagonal containers.

**CTA Section:** Centered headline with supporting text, primary CTA button, and secondary contact link.

### Services Page
Grid layout (2 columns) per service tier, each expanding on service details with included features as bulleted lists, pricing indicators, and "Get Started" CTAs.

### Process Page
Vertical timeline with alternating left/right content blocks for each stage, including stage descriptions, approval gates highlighted with distinct styling, and client/staff touchpoints.

### Pricing Page
3-column pricing table (Launch/Growth/Scale tiers) with feature comparison matrix, prominent "Popular" badge on Growth tier, clear CTAs per tier.

### Portfolio/Work Page
Filterable masonry grid with category tabs (Managed Sites/Custom Sites/Stores/Apps). Click opens project case study overlay with full-screen images, challenge/solution narrative, and results metrics.

## Client Portal Design

### Dashboard
**Project Cards Grid (2-3 columns):** Each card displays project title, type badge, progress bar, status indicator, next milestone, and "View Project" action. Active projects appear first.

**Sidebar Navigation:** Fixed left sidebar (w-64) with logo, main nav items (Dashboard, Projects, Messages, Files, Billing), and user profile at bottom.

### Project Detail Page
**Tab Navigation:** Horizontal tabs (Overview | Timeline | Previews | Files | Messages | Billing) with active state indicator.

**Overview Tab:** 
- Project header with title, type, tier, and status badge
- Progress visualization (circular progress indicator + percentage)
- Key milestones list with checkmark/pending states
- Assigned team members with avatars
- Quick actions section (Upload File, Request Support)

**Timeline Tab:** 
Vertical timeline visualization with milestone nodes, completion checkmarks, target dates, approval gates highlighted with gold accent.

**Previews Tab:** 
Card grid displaying preview thumbnails/screenshots, version labels (JetBrains Mono), status badges, action buttons (View Preview, Add Feedback, Approve/Reject).

**Messages Tab:** 
Threaded conversation view with message bubbles (staff vs client differentiated), timestamp, sender name/role, attachment indicators, compose box at bottom.

**Files Tab:**
Table view with columns: File Name, Type (icon), Uploaded By, Date, Actions (Download). Upload dropzone prominently placed at top.

## Staff Back Office Design

### Staff Dashboard
**Filter Bar:** Horizontal filter chips (All Projects, Active, Pending Approval, Overdue) with project count badges.

**Projects Table:** 
Sortable columns (Client Name, Project Type, Status, Progress, Due Date, Assigned Team) with inline action menu (View, Edit, Update Status). Row hover reveals quick actions.

**Upcoming Section:** 
Cards for tasks due this week, approvals needed, recent client messages requiring response.

### Project Management View
Similar to client view but with additional staff-only sections:
- Team assignment interface
- Internal notes (not visible to clients)
- Activity log with full detail
- Approval workflow controls (Request Approval, Mark Complete)

## Component Library

### Navigation
- **Top Nav (Marketing):** Transparent-to-solid on scroll, horizontal menu, "Login" CTA button
- **Portal Sidebar:** Fixed, collapsible on mobile, icon+label format

### Cards
- Subtle border treatment
- Padding: p-6
- Rounded corners: rounded-lg
- Hover: slight scale transform and shadow increase

### Buttons
- Primary: Solid treatment with hover brightness shift
- Secondary: Outline style
- Sizes: Small (px-4 py-2), Medium (px-6 py-3), Large (px-8 py-4)
- Hero/Image overlays: Backdrop blur background (backdrop-blur-md)

### Forms
- Input fields: border treatment, focus state with accent glow
- Labels: text-sm font-medium mb-2
- Spacing: gap-6 between form groups
- Validation: Inline error messages below fields

### Status Indicators
- Badges: Small rounded pills with text-xs uppercase
- Progress bars: Rounded bars with smooth fill animation
- Timeline nodes: Hexagonal or circular with connecting lines

### Data Display
- Tables: Striped rows, sticky header, responsive horizontal scroll on mobile
- Stats: Large numbers with descriptive labels below
- Metrics: Hexagonal containers for key figures

## Images

**Hero Image (Home):** 
Large, high-quality abstract digital/hexagonal pattern visualization or modern workspace showing web development environment. Image should convey precision and structure. Position: Full hero background with dark overlay (opacity-60) to ensure text readability.

**Portfolio Images:**
Project screenshots and mockups. Each project card includes representative image. Case study pages include multiple full-width images showing different project aspects.

**Process Illustrations:**
Abstract hexagonal icons or illustrations for each process stage (optional custom illustrations or icon-based approach).

**Team Photos (About page):**
Professional headshots in consistent circular crops arranged in grid layout.

**Service Page Graphics:**
Hexagonal iconography or abstract representations of each service type positioned alongside descriptions.

## Responsive Behavior

**Breakpoints:** Mobile-first approach using sm: (640px), md: (768px), lg: (1024px), xl: (1280px)

**Mobile Adaptations:**
- Sidebar navigation becomes bottom tab bar or hamburger menu
- Multi-column grids collapse to single column
- Tables transform to stacked cards
- Hero text sizes scale down appropriately
- Horizontal timelines become vertical
- Fixed sidebars hide, accessible via menu toggle

## Animations

**Minimal, Purposeful Motion:**
- Page transitions: Smooth fade-in
- Card hovers: Subtle lift (translate-y-1)
- Progress updates: Smooth bar fills (transition-all duration-500)
- Scroll reveals: Fade + slide up on timeline elements (intersection observer)
- NO distracting background animations
- NO complex scroll-jacking effects