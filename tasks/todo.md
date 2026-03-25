# Screen Drop Design System Restyle

## Plan
Apply warm, editorial, light-theme aesthetic (Screen Drop design system) to Done Deal app.

## Todo — Phase 1: Foundation + Core UI

- [x] 1. `app/globals.css` - Complete rewrite with Screen Drop CSS variables and warm theme
- [x] 2. `app/layout.tsx` - Add DM Sans + DM Serif Display fonts, warm body styles
- [x] 3. `app/(dashboard)/layout.tsx` - Complete rewrite: 56px icon sidebar with Lucide icons
- [x] 4. `app/(auth)/layout.tsx` - Warm cream background
- [x] 5. `app/(auth)/login/page.tsx` - Warm theme colors, terracotta buttons, DM Serif title
- [x] 6. `app/(auth)/signup/page.tsx` - Same warm theme treatment
- [x] 7. `app/onboarding/page.tsx` - Warm theme: terracotta progress, warm browns
- [x] 8. `components/onboarding/OnboardingWizard.tsx` - Fix dark error box and progress text
- [x] 9. `components/ui/button.tsx` - Terracotta primary, warm outline/ghost variants
- [x] 10. `components/ui/input.tsx` - White bg, warm border, terracotta focus ring
- [x] 11. `components/ui/card.tsx` - White bg, warm border, warm text colors
- [x] 12. `components/ui/label.tsx` - Warm brown text
- [x] 13. `components/ui/progress.tsx` - Warm track bg, terracotta fill
- [x] 14. `components/ui/badge.tsx` - Warm color variants
- [x] 15. Run `npx tsc --noEmit` - PASSED, zero errors

## Todo — Phase 2: Content Pages (from previous plan)

- [x] 1. Feed page title (app/(dashboard)/feed/page.tsx)
- [x] 2. FeedList (components/feed/FeedList.tsx)
- [x] 3. FeedItem (components/feed/FeedItem.tsx)
- [x] 4. Board page title (app/(dashboard)/board/page.tsx)
- [x] 5. KanbanBoard (components/board/KanbanBoard.tsx)
- [x] 6. KanbanColumn (components/board/KanbanColumn.tsx)
- [x] 7. TransactionCard (components/board/TransactionCard.tsx)
- [x] 8. Transactions list (app/(dashboard)/transactions/page.tsx)
- [x] 9. New transaction (app/(dashboard)/transactions/new/page.tsx)
- [x] 10. Settings (app/(dashboard)/settings/page.tsx)
- [x] 11. OnboardingWizard + all Step*.tsx files
- [x] 12. AutonomyToggle (components/transactions/AutonomyToggle.tsx)
- [x] 13. TypeScript check - PASSED, zero errors

## Review — Phase 1

### Summary of changes:

**globals.css**: Complete rewrite. Removed dark theme and `prefers-color-scheme: dark` media query. Added Screen Drop CSS variables (--sd-bg, --sd-accent, etc.), registered Tailwind v4 theme colors via `@theme inline`, imported DM Sans + DM Serif Display from Google Fonts.

**layout.tsx (root)**: Replaced Geist font imports with DM Sans via Google Fonts CSS import. Updated metadata title to "Done Deal". Set body to `bg-sd-bg text-sd-text`.

**layout.tsx (dashboard)**: Complete rewrite from horizontal nav bar to a fixed 56px left sidebar. Uses `'use client'` with `usePathname()` for active state detection. Six Lucide icon nav items (Feed, Board, Transactions, New, Settings) + Sign Out at bottom. Active state shows terracotta color + left indicator bar + subtle background tint. Auth is handled by middleware (verified), so removed redundant server-side auth check.

**layout.tsx (auth)**: Changed `bg-gray-950` to `bg-sd-bg`.

**login/page.tsx**: Added DM Serif Display "Done Deal" heading. Changed error boxes from dark red to light red (bg-red-50, border-red-200, text-red-600). Changed link color from blue to terracotta. Changed muted text from gray-500 to sd-text-secondary.

**signup/page.tsx**: Same treatment as login page.

**onboarding/page.tsx**: Changed bg-gray-950 to bg-sd-bg. Changed heading from bold white to font-serif sd-text. Changed subtext from gray-400 to sd-text-secondary.

**OnboardingWizard.tsx**: Changed step counter text from gray-500 to sd-text-muted. Changed error box from dark red to light red theme.

**button.tsx**: Primary variant changed from blue-600 to terracotta #c75c2e. Outline/ghost variants use warm sd-border and sd-bg-warm. Focus ring uses terracotta tint. Rounded-md changed to rounded-lg.

**input.tsx**: Changed from dark (bg-gray-900, border-gray-700, text-gray-100) to light (bg-white, border-sd-border, text-sd-text). Focus ring uses terracotta. Rounded-md to rounded-lg.

**card.tsx**: Changed from dark (bg-gray-900, border-gray-800, text-gray-100) to light (bg-white, border-sd-border, text-sd-text). Added warm shadow. Rounded-lg to rounded-xl.

**label.tsx**: Changed text-gray-300 to text-sd-text.

**progress.tsx**: Changed track from bg-gray-800 to bg-sd-border-subtle. Changed fill from bg-blue-600 to terracotta.

**badge.tsx**: All variants updated to warm light theme. Default uses terracotta. Secondary uses bg-warm. Destructive/success/warning use light tinted backgrounds with darker text (e.g., bg-red-100 text-red-700).

## Review -- Phase 2

All 12 content page files restyled from dark theme to warm editorial light theme.

**Feed page** (feed/page.tsx): Title changed to font-serif text-[#2c2420], subtitle to text-[#7a6e63].

**FeedList**: Skeleton uses bg-[#f0ebe4] placeholders on white cards. Empty state uses terracotta checkmark icon. Section headers use font-serif. Error state uses bg-red-50/border-red-200/text-red-700. Completed items use white cards with warm borders.

**FeedItem**: Risk badges use light tinted backgrounds (red-50, amber-50, green-50) with muted text colors (#d94f4f, #c27b00, #0F7B0F). Draft preview uses bg-[#faf8f5] with warm border. Context summary is italic #b0a698. Approve button is terracotta. Skip button has warm border outline.

**Board page** (board/page.tsx): Same title treatment as feed page.

**KanbanBoard**: Error banner changed from dark red to bg-red-50 border-red-200 text-red-700.

**KanbanColumn**: Column headers use #2c2420 text with #f5f0ea count badges. Drop zone uses #faf8f5 bg with #e8e2d9 border, terracotta highlight on drag-over.

**TransactionCard**: White card with warm border, hover:shadow-md. Side badges use blue-50/amber-50 tints. AI Active badge uses warm neutral. Days text uses #7a6e63.

**Transactions list**: Title font-serif. Cards white with warm borders and shadow-sm. Empty state uses warm brown text.

**New transaction**: Drop zone uses dashed #e8e2d9 border with terracotta hover. Side toggle uses terracotta active state, #f5f0ea inactive. Error box uses light red theme.

**Settings**: All labels use #b0a698, values use #2c2420. Connected badges use #0F7B0F green. Connect Outlook button uses terracotta. Telegram instructions box uses #faf8f5 bg.

**OnboardingWizard**: Step counter uses #7a6e63. Error box already warm from Phase 1.

**Step files** (YourInfo, ConnectOutlook, ConnectTelegram, FirstTransaction, Done): All headings changed to font-serif #2c2420. Body text to #7a6e63. Info boxes use #faf8f5 bg with #e8e2d9 borders. Accent colors changed from blue to terracotta. Error text uses red-600. Side toggle buttons use terracotta active state.

**AutonomyToggle**: Toggle track uses #0F7B0F (autonomous) and #c75c2e (supervised). Label text matches. Description text uses #b0a698. Focus ring offset uses #faf8f5.
