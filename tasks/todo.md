# Done Deal Landing Page Upgrade Plan

## Summary
Upgrade the Done Deal transaction coordination landing page with enhanced visual presentation, scroll-triggered animations, animated counters, interactive pricing toggles, and parallax effects — while preserving the existing copy text and section structure.

## What We Know
- **Tech stack**: Next.js 16, React 19, Tailwind 4, Framer Motion (already installed)
- **Current sections** (14): Navbar, Hero, Testimonials, Partners, Problem, Benefits, HowItWorks, Stats, Pricing, Comparison, FeatureCards, VoiceDemo, FAQ, FinalCTA, Footer
- **Images**: External URLs (1 Unsplash hero image, 10 randomuser.me avatars, 1 iframes.ai embed) — keeping as-is
- **App features** (from localhost:3000): AI TC chat feed, transaction pipeline, dashboard analytics, document management, team management, calendar, kanban board, compliance scoring, automated task tracking
- **Issues to fix**: FAQ content mismatch (talks about lead gen, not TC), appointwise links to remove

## Principles
- Keep all existing copy text (minor tweaks only for FAQ alignment)
- Every change should be simple and impact as little code as possible
- Use Framer Motion (already a dependency) for all animations
- No new dependencies unless absolutely necessary
- Preserve the dark theme with cyan/purple brand colors

---

## Tasks

### Phase 1: Foundation & Shared Utilities
- [ ] **1.1** Create a reusable `useInView` scroll-trigger hook (or use framer-motion's `useInView`) for consistent scroll animations across all sections
- [ ] **1.2** Create a reusable `AnimatedSection` wrapper component that fades/slides in children when scrolled into view
- [ ] **1.3** Add `next.config.ts` image domain allowlist for unsplash and randomuser.me (to use Next/Image)
- [ ] **1.4** Update `globals.css` with any new utility classes needed (parallax helpers, gradient refinements)

### Phase 2: Hero Section Upgrade
- [x] **2.1** Add parallax background effect to the Hero section (subtle vertical offset on scroll)
- [x] **2.2** Convert hero image from `<img>` to Next.js `<Image>` for optimization
- [x] **2.3** Add staggered entrance animations for headline, subtext, value props, and CTA button
- [x] **2.4** Improve the cycling word animation (smoother transitions, better timing)

### Phase 3: Testimonials & Partners Upgrade
- [ ] **3.1** Convert testimonials from static 3-column grid to a horizontal auto-scrolling carousel
- [ ] **3.2** Add scroll-triggered fade-in for the testimonials section heading
- [ ] **3.3** Add subtle hover effects on testimonial cards (lift + glow)
- [ ] **3.4** Upgrade Partners section with scroll-triggered entrance animations

### Phase 4: Problem & Benefits Upgrade
- [ ] **4.1** Add scroll-triggered staggered entrance for Problem cards (slide up one by one)
- [ ] **4.2** Add icon animations on Problem cards (pulse or shake on hover)
- [ ] **4.3** Add scroll-triggered staggered entrance for Benefits cards
- [ ] **4.4** Add subtle parallax offset to Benefits section background

### Phase 5: HowItWorks & Stats Upgrade
- [x] **5.1** Add step-by-step reveal animation to HowItWorks (each step animates in sequence as user scrolls)
- [x] **5.2** Add animated connecting line between steps
- [x] **5.3** Upgrade Stats section animated counters (ensure they trigger on scroll, smooth easing)
- [x] **5.4** Add parallax background to Stats section

### Phase 6: Pricing Section Upgrade
- [x] **6.1** Add interactive pricing toggle (monthly vs annual with discount display)
- [x] **6.2** Add scroll-triggered entrance animation for the pricing card
- [x] **6.3** Add hover glow effect on the pricing card
- [x] **6.4** Add animated checkmark reveals for feature list items

### Phase 7: Comparison & FeatureCards Upgrade
- [ ] **7.1** Add scroll-triggered row-by-row reveal animation for the comparison table
- [ ] **7.2** Add subtle color transitions on comparison rows (green/red highlights on hover)
- [ ] **7.3** Add scroll-triggered staggered entrance for FeatureCards (cards fly in from alternating sides)
- [ ] **7.4** Improve FeatureCard hover effects (3D tilt or enhanced glow)

### Phase 8: VoiceDemo, FAQ, FinalCTA Upgrade
- [ ] **8.1** Add parallax background and scroll-triggered entrance to VoiceDemo section
- [ ] **8.2** Improve FAQ accordion animation (smooth height transitions, better open/close UX)
- [ ] **8.3** Fix FAQ content — rewrite questions to align with transaction coordination (not lead gen/GHL)
- [ ] **8.4** Add scroll-triggered entrance animation to FinalCTA section
- [ ] **8.5** Add subtle pulse animation on the FinalCTA button

### Phase 9: Navbar & Footer Polish
- [x] **9.1** Add scroll-based navbar background transition (transparent at top, solid on scroll)
- [x] **9.2** Remove appointwise login/affiliate links from Navbar
- [ ] **9.3** Add smooth scroll behavior for internal nav links
- [ ] **9.4** Add scroll-triggered entrance for Footer content

### Phase 10: Final Review & Testing
- [ ] **10.1** Test all scroll animations for performance (no jank)
- [ ] **10.2** Test responsive behavior on mobile/tablet breakpoints
- [ ] **10.3** Verify all existing copy text is preserved
- [ ] **10.4** Run `npm run build` to verify no build errors

---

## Current Sprint: Comparison, FeatureCards, VoiceDemo, FAQ, FinalCTA, Footer Upgrade

### Task 1: Comparison.tsx
- [x] Wrap section heading with AnimatedSection
- [x] Convert rows to motion.div with staggered whileInView (0.05s apart per row)
- [x] Add subtle bg-white/5 hover transition on rows (already existed, verified preserved)

### Task 2: FeatureCards.tsx
- [x] Wrap each card with AnimatedSection (delays: 0, 0.1, 0.2, 0.3, 0.4, 0.5)
- [x] Upgrade hover to 3D tilt: whileHover={{ scale: 1.05, rotateY: 3 }}
- [x] Add card-glow class to each card

### Task 3: VoiceDemo.tsx
- [x] Add parallax-bg class to the section
- [x] Wrap with AnimatedSection for scroll entrance
- [x] Add aria-label to the iframe for accessibility

### Task 4: FAQ.tsx
- [x] Rewrite all FAQ content to 8 transaction-coordination-focused questions
- [x] Improve accordion with AnimatePresence smooth height animation
- [x] Wrap with AnimatedSection for scroll entrance

### Task 5: FinalCTA.tsx
- [x] Wrap with AnimatedSection for scroll entrance
- [x] Add repeating pulse animation on CTA button (scale: [1, 1.03, 1], repeat: Infinity, duration: 2)

### Task 6: Footer.tsx
- [x] Wrap with AnimatedSection for scroll entrance

## Review -- Comparison, FeatureCards, VoiceDemo, FAQ, FinalCTA, Footer Sprint (2026-03-26)

### Comparison (`src/components/sections/Comparison.tsx`)
- Replaced outer motion.div with a plain div; wrapped the table header row in AnimatedSection
- Each data row is now a motion.div with whileInView fade+slide, staggered at 0.05s per row
- Hover bg-white/5 transition was already present, preserved as-is
- All copy text preserved exactly

### FeatureCards (`src/components/sections/FeatureCards.tsx`)
- Wrapped each card in AnimatedSection with delay={index * 0.1} for staggered scroll entrance
- Replaced Tailwind hover classes with framer-motion whileHover={{ scale: 1.05, rotateY: 3 }} and spring transition
- Added card-glow class and transformStyle: preserve-3d for 3D tilt effect
- All copy text preserved exactly

### VoiceDemo (`src/components/sections/VoiceDemo.tsx`)
- Added parallax-bg class to the section element
- Replaced motion.div wrapper with AnimatedSection for scroll entrance
- Added aria-label to the iframe for screen reader accessibility
- Removed unused framer-motion import
- All copy text preserved exactly

### FAQ (`src/components/sections/FAQ.tsx`)
- Rewrote all FAQ content: 11 old lead-gen/GHL questions replaced with 8 transaction-coordination FAQs
- Wrapped header in AnimatedSection for scroll entrance
- Improved accordion: added motion.span for the +/x icon rotation, added initial={false} to AnimatePresence, added easeInOut timing
- Added flex-shrink-0 on the toggle icon to prevent layout shift

### FinalCTA (`src/components/sections/FinalCTA.tsx`)
- Replaced motion.div entrance wrapper with AnimatedSection
- Wrapped the CTA link in a motion.div with repeating pulse: scale [1, 1.03, 1] over 2s infinite loop
- All copy text preserved exactly

### Footer (`src/components/layout/Footer.tsx`)
- Added 'use client' directive (required for AnimatedSection)
- Wrapped entire footer content in AnimatedSection for scroll entrance
- All copy text and links preserved exactly

## Review -- Hero & Navbar Sprint (2026-03-26)

### Navbar (`src/components/layout/Navbar.tsx`)
- Added `scrolled` state driven by a passive scroll listener (threshold: 20px)
- Background transitions from fully transparent to `bg-black/90 backdrop-blur-md` with `transition-all duration-300`
- Removed Affiliate link and AppointWise "Log in" button from both desktop and mobile menus
- Simplified nav link rendering (no more external link branching since all remaining links are internal)
- Kept: Home, Pricing, Contact links and "See a Demo" CTA

### Hero (`src/components/sections/Hero.tsx`)
- Added staggered `motion.div` entrance animations at 0s, 0.15s, 0.3s, 0.45s delays for headline, subtext, CTA, and value props
- Improved cycling word animation: added `filter: blur(4px)` crossfade and `easeInOut` timing for smoother transitions
- Converted `<img>` to Next.js `<Image>` (width 800, height 600, `priority` flag for LCP)
- Added parallax on hero image via `useScroll` + `useTransform` (0 to 80px vertical offset as user scrolls)
- All existing copy text preserved exactly as-is
