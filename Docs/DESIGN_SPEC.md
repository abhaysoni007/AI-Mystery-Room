**# AI Mystery Room — Design System & UI/UX Specification**

****Document:**** `docs/DESIGN_SPEC.md`  

****Version:**** 1.1.0  

****Status:**** Authoritative design specification  

****Product:**** AI Mystery Room  

****Audience:**** Codex, frontend engineers, QA, and design reviewers  

****Stack:**** React + Vite + JavaScript/JSX + Tailwind CSS  

****Visual direction:**** Colorful neo-brutalism with cinematic investigative storytelling  

****Design authority:**** This document is the single source of truth for the visual system, page layouts, component behavior, responsive behavior, motion, accessibility, and visual acceptance criteria.

---

**## 0. How to use this specification**

This document defines how AI Mystery Room must look, behave, and adapt across devices. Implement it as written unless the product specification (`docs/SPEC.md`) establishes a conflicting functional or security requirement. Security and data authorization requirements always take precedence over visual convenience.

**### Mandatory implementation rules**

1. Inspect the existing repository before creating or replacing files. Preserve working conventions unless a documented reason requires change.

2. Read `docs/SPEC.md` and this document before implementing the frontend.

3. Implement shared design tokens and components before building page-specific styling.

4. Use React, JavaScript/JSX, Vite, and the styling system already agreed for the repository. If Tailwind CSS is installed, use it; do not silently introduce a second styling framework.

5. Build real responsive interfaces, not desktop-only mockups.

6. Every interactive control must have a working behavior, visible state, keyboard support, and accessible name.

7. Use real application data and API contracts when available. Use clearly identified fixtures during UI development; do not present fabricated network success as real success.

8. Never send or render the canonical culprit, hidden solution, private clue classifications, or unrevealed solution rationale before the authorized result state.

9. Do not use animation to conceal latency, block interaction, or delay essential actions.

10. Verify each page at the required viewport sizes and run build, lint, and applicable tests before marking it complete.

11. Do not add unrelated product features or silently change functional requirements.

12. If a design decision is not explicitly specified, follow the tokens, principles, and component rules here; document any material deviation.

**### Document ownership**

- `docs/SPEC.md`: product behavior, architecture, data model, API contracts, and security rules.

- `docs/DESIGN_SPEC.md`: all visual and interaction design rules.

- `docs/USER_FLOWS.md`, if created: detailed journey diagrams and navigation flows.

- `docs/ACCEPTANCE_TESTS.md`, if created: test cases mapped to these requirements.
- `docs/DATA_MODEL.md` and `docs/API.md`: persistence and API contracts for board state and selected theme. This design document does not override those contracts.

When there is a visual disagreement, this document wins. When there is a security or product behavior disagreement, `SPEC.md` wins and this document must be updated to match.

---

**# 1. Design vision**

**## 1.1 Product feeling**

AI Mystery Room should feel like an interactive detective dossier crossed with a colorful indie game interface. It must be expressive, tactile, playful, suspenseful, and easy to navigate.

The visual language combines a stable shared product design system with a case-specific visual theme. Navigation, interaction patterns, accessibility, component behavior, and semantic meaning remain consistent across cases; only approved decorative and surface treatments vary.

The visual language combines:

- ****Neo-brutalism:**** thick dark outlines, offset hard shadows, bold shapes, strong contrast, geometric cards, and visible structure.

- ****Colorful editorial design:**** saturated accent colors used deliberately to distinguish interface actions and content categories.

- ****Investigative atmosphere:**** case-file labels, evidence numbers, timestamps, timeline markers, stamped statuses, and paper-like panels.

- ****Polished motion:**** snappy transitions, restrained reveal animations, and tactile button responses.

- ****Readable utility:**** the investigative tools must remain clearer and more usable than decorative elements.

The interface must not look like a generic admin dashboard, a conventional banking SaaS, or an all-black hacker terminal. Avoid excessive neon glows, glassmorphism, tiny low-contrast text, and animation on every element.

**## 1.2 Design principles**

1. ****Clarity before spectacle.**** Users must always know what they can inspect and what to do next.

2. ****Tactile controls.**** Buttons and cards should feel physical through borders, hard shadows, and small press movements.

3. ****Color with meaning.**** Use a consistent palette, not arbitrary colors on every screen.

4. ****Suspense without confusion.**** Use visual hierarchy and staged reveals, never obscure important information.

5. ****Evidence-first storytelling.**** Evidence artifacts must feel distinct and plausible within the fictional world.

6. ****Responsive by design.**** Mobile is a first-class investigation experience.

7. ****Motion is functional.**** Animation confirms actions, guides attention, or communicates state.

8. ****Truthful states.**** Do not display a fake loading completion, generated asset, save confirmation, or video playback.

9. ****Accessible by default.**** Keyboard, screen reader, contrast, and reduced-motion behavior are required.

10. ****Consistent components.**** Reuse the same primitives and tokens across the entire application.

**## 1.3 Brand personality**

- Curious, sharp, investigative, creative.

- Confident, not grim or disturbing.

- Slightly playful, not childish.

- High energy, but never visually chaotic.

- Fictional and transparent: generated case materials are part of a game.

**## 1.4 Visual reference language**

Use the following as design-language inspiration rather than copying a specific website:

- Contemporary neo-brutalist editorial websites.

- Indie puzzle games and interactive narrative interfaces.

- Physical evidence boards and annotated case folders.

- Modern magazine layouts with oversized typography.

- Printed labels, stamps, paper slips, and structured data panels.

Do not copy protected branding, logos, or proprietary page layouts from other products.

---

**# 2. Global design tokens**

All global values must be implemented centrally as CSS variables and mapped into Tailwind theme tokens where supported. Do not scatter hardcoded colors and spacing values across components.

**## 2.1 Color palette**

The palette is intentionally colorful. Warm paper surfaces contrast with a deep ink outline and saturated accents.

**### Core colors**

| Token | Hex | Usage |

|---|---:|---|

| `--color-ink` | `#191919` | Main text, outlines, high-contrast borders |

| `--color-paper` | `#FFF9EE` | Main light canvas |

| `--color-white` | `#FFFFFF` | Cards, modals, input surfaces |

| `--color-muted` | `#68645F` | Secondary text on light surfaces |

| `--color-line` | `#191919` | Neo-brutalist outlines |

| `--color-canvas-dark` | `#20212B` | Optional dark investigation shell and media viewer |

| `--color-panel-dark` | `#2C2E3A` | Dark shell panels |

| `--color-text-dark` | `#F8F4EA` | Text on dark surfaces |

| `--color-muted-dark` | `#C3C0B9` | Secondary text on dark surfaces |

**### Accent colors**

| Token | Hex | Primary use |

|---|---:|---|

| `--color-yellow` | `#FFE45E` | Primary action, highlights, active selection |

| `--color-pink` | `#FF78B7` | Creative accents, suspect-related decorative labels |

| `--color-coral` | `#FF6B57` | Important actions, high-attention callouts |

| `--color-blue` | `#75C9FF` | Information, digital evidence, links |

| `--color-green` | `#8DE0A1` | Confirmed, saved, successful states |

| `--color-purple` | `#B5A0FF` | Mystery creation, AI-related accents |

| `--color-orange` | `#FFB454` | Caution and timeline emphasis |

**### Semantic colors**

| Token | Hex | Usage |

|---|---:|---|

| `--color-success` | `#247A45` | Success text/icon on light surface |

| `--color-success-bg` | `#D9F7DF` | Success panel background |

| `--color-warning` | `#8A4B00` | Warning text/icon on light surface |

| `--color-warning-bg` | `#FFF0C7` | Warning panel background |

| `--color-danger` | `#B42318` | Error text/icon on light surface |

| `--color-danger-bg` | `#FFE1DE` | Error panel background |

| `--color-info` | `#075985` | Informational text/icon on light surface |

| `--color-info-bg` | `#DDF3FF` | Informational panel background |

Semantic states must also use an icon and text label; color alone is not sufficient. For dark surfaces, define accessible semantic foreground variants rather than reusing dark text colors.

**### Color rules**

- Use ink-colored borders for all neo-brutalist surfaces in the default product theme. Approved case themes may adjust border treatment only through defined theme tokens, while preserving visible boundaries and accessible contrast.

- Use yellow for the main primary action and selected/highlighted controls.

- Use purple for AI creation or generation features.

- Use blue for digital evidence, links, and informational context.

- Use pink for expressive, non-critical accents.

- Use coral for important attention states, but not as the only error signal.

- Use green only for confirmed success, saved state, or completion.

- Never encode hidden clue classifications using these colors.

- Do not put muted text on saturated backgrounds unless contrast has been checked.

- Default page canvas is warm paper. A dark shell is allowed for the investigation room and media viewers.
- Case-specific themes may override only approved theme tokens (surface, accent, border, texture, and decorative treatment). They must not change semantic success/warning/error colors, accessibility requirements, navigation, or component meaning.
- The shared product shell and account/dashboard pages use the product-wide default theme; a selected case theme applies inside that case's investigation experience and its case-specific evidence presentation.

- Avoid gradients as a default. Use a flat accent surface; a subtle gradient may be used only for a specific hero illustration or media treatment and must not replace semantic colors.

**## 2.2 Typography**

Use a restrained typography system with a strong display face and a highly readable interface face.

**### Font families**

- Display/headings: `Space Grotesk`, fallback `Arial, sans-serif`.

- Body/UI: `Inter`, fallback `Arial, sans-serif`.

- Evidence IDs, timestamps, case codes, and metadata: `IBM Plex Mono`, fallback `monospace`.

Load fonts locally or through an approved font provider. If remote font loading fails, use the declared fallback. Do not block the page from rendering while fonts load.

**### Type scale**

| Token | Size | Line height | Weight | Usage |

|---|---:|---:|---:|---|

| `--text-xs` | 12px | 16px | 500–600 | Dense metadata; use sparingly |

| `--text-sm` | 14px | 20px | 400–600 | Secondary UI and helper text |

| `--text-base` | 16px | 24px | 400–500 | Body and form input |

| `--text-lg` | 18px | 28px | 500–600 | Card headings, lead text |

| `--text-xl` | 20px | 28px | 600–700 | Section heading |

| `--text-2xl` | 24px | 32px | 650–700 | Page subheading |

| `--text-3xl` | 30px | 36px | 700–750 | Page title on compact screens |

| `--text-4xl` | 40px | 44px | 700–800 | Desktop page title |

| `--text-5xl` | 52px | 56px | 700–800 | Hero heading on desktop |

| `--text-6xl` | 64px | 66px | 700–800 | Optional large hero headline only |

Use responsive `clamp()` for display headings. Avoid giant headings on mobile. Keep body copy at least 16px in primary workflows and avoid long paragraphs with excessive line length.

**### Typography rules**

- Display headings use Space Grotesk, tight but readable tracking.

- Body copy uses Inter and normal letter spacing.

- Metadata uses IBM Plex Mono with tabular numerals where possible.

- Buttons use 14–16px semibold or bold type.

- Uppercase labels are allowed for case IDs and short section markers, not for paragraphs.

- Do not use more than three font families.

- Avoid extra-light font weights on colorful or dark backgrounds.

**## 2.3 Spacing scale**

Use a 4px base grid.

| Token | Value |

|---|---:|

| `--space-1` | 4px |

| `--space-2` | 8px |

| `--space-3` | 12px |

| `--space-4` | 16px |

| `--space-5` | 20px |

| `--space-6` | 24px |

| `--space-8` | 32px |

| `--space-10` | 40px |

| `--space-12` | 48px |

| `--space-16` | 64px |

| `--space-20` | 80px |

| `--space-24` | 96px |

Use 8–12px inside compact controls, 16–24px inside cards, 24–32px between content groups, and 48–96px between major marketing sections. Dense investigation screens may use tighter spacing than the landing page, but must remain readable.

**## 2.4 Borders, radii, and hard shadows**

Neo-brutalist components use visible, consistent outlines and offset shadows.

| Token | Value | Usage |

|---|---|---|

| `--border-width` | 2px | Default cards, buttons, inputs |

| `--border-width-strong` | 3px | Hero panels, major selected panels |

| `--radius-sm` | 8px | Inputs, chips, compact controls |

| `--radius-md` | 12px | Cards, dropdowns |

| `--radius-lg` | 18px | Hero panels and large feature blocks |

| `--radius-pill` | 999px | Tags and compact status pills |

| `--shadow-hard-sm` | `3px 3px 0 var(--color-ink)` | Small buttons/chips |

| `--shadow-hard-md` | `5px 5px 0 var(--color-ink)` | Cards and standard controls |

| `--shadow-hard-lg` | `8px 8px 0 var(--color-ink)` | Hero panels and feature cards |

| `--shadow-hard-hover` | `2px 2px 0 var(--color-ink)` | Pressed/hovered surface |

| `--shadow-none` | `0 0 0 transparent` | Flat surfaces where needed |

Use shadows as solid offsets, not blurry glows. Keep the shadow direction consistent: down and right. Avoid large hard shadows on small mobile screens when they cause clipping; reduce the offset while preserving the tactile effect.

**## 2.5 Layout and width tokens**

- Maximum marketing content width: 1200px.

- Maximum reading width: 720px.

- Standard dashboard content width: 1440px.

- Investigation desktop shell: full available width, with inner content constrained to the viewport.

- Main page horizontal padding: 24px desktop, 16px tablet, 16px mobile.

- Major section vertical padding: 80px desktop, 56px tablet, 40px mobile.

- Investigation desktop gutters: 16–24px.

- Card grid gap: 20–24px desktop, 16px tablet, 12–16px mobile.

Use a centered container for marketing pages. The investigation room should use the available viewport and avoid excessive empty margins.

**## 2.6 Breakpoints**

Use these shared breakpoints consistently:

- `sm`: 640px

- `md`: 768px

- `lg`: 1024px

- `xl`: 1280px

- `2xl`: 1536px

Design and test at minimum: 360×800, 390×844, 768×1024, 1024×768, 1280×800, and 1440×900. Avoid relying on breakpoint names alone; verify actual content behavior at intermediate widths.

**## 2.7 Motion tokens**

| Token | Value | Usage |

|---|---|---|

| `--duration-fast` | 120ms | Press, hover, focus color |

| `--duration-normal` | 200ms | Dropdowns, small panels |

| `--duration-emphasis` | 320ms | Cards, dialogs, section reveals |

| `--duration-slow` | 500ms | Page-level transitions and hero details |

| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Standard motion |

| `--ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entering surfaces |

| `--ease-press` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Tactile control motion |

No essential action may be delayed by animation. Avoid looping animations except for a subtle, clearly meaningful loading indicator. Respect `prefers-reduced-motion`.

**## 2.8 CSS variable baseline**

Implement a centralized stylesheet, such as `src/styles/tokens.css`, containing the tokens above. Add semantic aliases and dark-surface variants as needed. Map the same values to Tailwind theme tokens so component styles do not diverge. The values in this document are the source of truth.

---

**# 3. Application shell and information architecture**

**## 3.1 Public navigation**

Desktop navigation:

- Left: logo and “AI Mystery Room” wordmark.

- Center/right: “How it works”, “Sample case”, and optional “My cases” when authenticated.

- Far right: primary CTA “Start investigating” or account menu.

Mobile navigation:

- Logo/wordmark on the left.

- Compact menu button on the right.

- Menu opens an accessible drawer or popover.

- Primary CTA remains visible in the menu and on the relevant page.

- Do not squeeze the full desktop navigation into a narrow viewport.

**## 3.2 Authenticated shell**

Dashboard and profile pages share:

- Header with wordmark, navigation, and account menu.

- Consistent page container.

- Optional compact side navigation on wide screens.

- Main content area with clear page title and primary action.

**## 3.3 Investigation shell**

The investigation shell is a specialized layout:

- Top bar: return-to-dashboard link, case ID/title, save/progress status, overflow menu.

- Desktop left navigation: investigation sections, suspects, evidence categories.

- Center workspace: selected view.

- Optional right inspector: metadata, related clues, notes, or selected suspect facts.

- Mobile: a compact top bar and a bottom navigation bar or accessible section switcher.

- The canonical solution is never part of ordinary client-side case state before completion.

**## 3.4 Routes**

The design must support these routes from the product specification:

- `/`

- `/create`

- `/login`

- `/register`

- `/dashboard`

- `/case/:caseId`

- `/case/:caseId/evidence/:evidenceId`

- `/case/:caseId/accuse`

- `/case/:caseId/result`

- `/profile`

A route is not proof of authorization. The backend must authorize every case-specific request. For unauthorized or unavailable cases, show the appropriate not-found or access-denied state without disclosing private information.

---

**# 4. Shared component system**

All shared components must have consistent visual tokens, keyboard behavior, responsive behavior, and explicit states. Use semantic HTML and React composition.

**## 4.1 Buttons**

Variants:

- `primary`: yellow fill, ink text, 2px ink border, hard shadow.

- `secondary`: white or paper fill, ink text, hard shadow.

- `accent`: purple or blue fill for specific contextual actions.

- `danger`: coral/red treatment, explicit label, confirmation for destructive actions.

- `ghost`: transparent background with clear hover and focus styles.

- `icon`: square or circular hit area with accessible label.

Sizes:

- `sm`: minimum height 36px.

- `md`: minimum height 44px.

- `lg`: minimum height 52px.

Behavior:

- Hover: translate up/left by at most 1px and retain a slightly reduced hard shadow.

- Active: translate 2–3px down/right and reduce shadow to simulate pressing.

- Focus-visible: a distinct 3px outline with offset; do not rely on shadow alone.

- Disabled: clear disabled state, no press motion, and correct `disabled` attribute.

- Loading: preserve button width, show an inline spinner, and use truthful status text where necessary.

- All actions must be keyboard operable.

Do not use a primary CTA for multiple unrelated actions in the same local context.

**## 4.2 Inputs and text areas**

- Minimum height: 44px.

- Border: 2px ink.

- Background: white or paper.

- Radius: 8px.

- Focus: visible outer outline, not merely a subtle border-color change.

- Labels must be visible and programmatically associated.

- Helper text and errors must be connected to the input.

- Validation errors appear adjacent to the field and are announced to assistive technology.

- Placeholder text is an example, not a substitute for a label.

- Text areas resize vertically within sensible bounds.

- Scenario prompt text area must have a visible character counter.

**## 4.3 Cards**

Default card:

- White or paper surface.

- 2px ink border.

- 5px hard shadow.

- 12–18px radius.

- 16–24px padding.

- Strong title hierarchy and restrained decorative accents.

Interactive cards must expose hover, focus, and pressed states. Non-interactive cards must not appear clickable.

**## 4.4 Tags and status chips**

- Pill or compact rounded rectangle.

- 1–2px border.

- Short label.

- Optional icon.

- Never communicate state using color alone.

- Do not expose hidden clue types such as “critical clue” or “red herring” before the reveal.

**## 4.5 Dialogs and drawers**

- Use an accessible dialog implementation with focus trapping, Escape handling where appropriate, focus restoration, and a labelled title.

- Destructive and final actions require clear consequence text.

- Mobile dialogs may become bottom sheets if the content remains accessible.

- Clicking outside may dismiss informational dialogs, but must not accidentally discard unsaved input or bypass confirmation.

- Prevent background scroll while a modal is active.

**## 4.6 Toasts and inline feedback**

- Use inline messages for form errors and persistent state.

- Use toasts for brief non-blocking confirmations.

- Do not use a toast as the only indication of a critical error.

- Provide a visible and accessible saved state.

- Keep toasts readable and dismissible; do not cover primary controls.

**## 4.7 Tooltips and menus**

- Tooltips are supplemental and must not contain essential information unavailable elsewhere.

- Menus support keyboard navigation and correct focus management.

- On touch devices, use click/tap behavior, not hover-only behavior.

**## 4.8 Icons**

Use one consistent icon set, preferably Lucide React if already compatible with the repository. Icons must be paired with text when their meaning is not universally obvious. Decorative icons should be hidden from assistive technology. Avoid mixing unrelated icon styles.

---

**# 5. Page specification: Landing page**

**## 5.1 Goal**

Explain the product immediately and lead the user into creating or exploring a mystery.

**## 5.2 Desktop layout**

1. ****Navigation:**** centered max-width container; wordmark left; navigation and account/CTA right.

2. ****Hero:**** two-column composition.

   - Left: small eyebrow label such as “YOUR NEXT CASE STARTS HERE”, large headline, concise description, primary CTA, secondary sample-case link.

   - Right: a playful evidence-board illustration made of layered fictional evidence cards, timestamp slips, suspect silhouettes or abstract portraits, and connecting lines.

   - The illustration is decorative and must not be mistaken for a playable real case unless it links to the sample case.

3. ****Trust/feature strip:**** short, truthful statements about generated mysteries, evidence types, and deduction.

4. ****How it works:**** three numbered steps: create a premise, inspect evidence, make an accusation.

5. ****Sample case preview:**** one prominent case card with fictional case ID, category, difficulty, short hook, and CTA.

6. ****Feature section:**** evidence formats, suspect reasoning, and post-game reveal.

7. ****Closing CTA:**** high-contrast yellow or purple panel.

8. ****Footer:**** product name, navigation, privacy/terms placeholders only when real routes or content exist.

**## 5.3 Mobile layout**

- Navigation collapses into a menu.

- Hero becomes a single column: text and CTA first, evidence-board illustration second.

- Hero title scales down without awkward wrapping.

- Primary CTA should be full width where helpful.

- Feature grids become a vertical list or a two-column grid only when each card remains readable.

- Avoid decorative connecting lines that cross text or become visual clutter.

- Sample case card uses a compact layout with a clear action.

**## 5.4 Hero design details**

- Warm paper canvas.

- Oversized Space Grotesk headline.

- Yellow primary CTA with thick outline and hard shadow.

- A purple or blue evidence-board backing panel.

- Layered evidence cards use small rotations only as decorative desktop treatment; on mobile, remove rotations that impair reading.

- Use a clear text hierarchy and avoid putting text inside complex imagery.

- No autoplay video or audio.

**## 5.5 Landing interactions**

- Primary CTA navigates to `/create`.

- Sample case CTA opens a genuine sample investigation route/data source.

- Navigation links scroll or navigate to valid destinations.

- Hero illustration may use a slow, subtle entrance sequence; once shown, it should remain stable.

- Hover motion on feature cards is small and optional.

- Reduced-motion users receive a static composition.

**## 5.6 Acceptance criteria**

- The product purpose is understandable within the first viewport.

- There is one visually dominant primary CTA.

- No decorative art overlaps important copy.

- All links navigate to implemented routes or are omitted.

- Mobile hero fits without horizontal overflow.

- Landing page remains useful when animations are disabled.

---

**# 6. Page specification: Authentication**

**## 6.1 Login**

Layout:

- Centered auth panel with brand mark.

- Clear title and one-sentence context.

- Email and password fields.

- Show/hide password control.

- Submit button.

- Link to registration.

- Inline validation and API error state.

- Optional return-to-case message if the user was redirected from a protected route.

**## 6.2 Registration**

- Name, email, password, and confirmation only if required by the actual auth contract.

- Explain password requirements before submission.

- Show validation adjacent to fields.

- Avoid collecting unnecessary personal information.

**## 6.3 Responsive and motion behavior**

- Auth panel is single-column at all sizes.

- On desktop, an optional decorative evidence card can sit beside the form; remove it on small screens.

- Submit button displays a loading state and prevents duplicate requests.

- Successful authentication navigates to the intended authorized destination.

- Error messages must not reveal whether sensitive account information exists beyond what the auth policy permits.

**## 6.4 Acceptance criteria**

- Labels and validation are accessible.

- Keyboard navigation is complete.

- Password controls have descriptive accessible names.

- Loading and error states are visible.

- The panel does not overflow on a 360px-wide viewport.

---

**# 7. Page specification: Mystery creation**

**## 7.1 Goal**

Let users describe a premise and configure the investigation without making the form feel like an administrative setup screen.

**## 7.2 Layout**

- Page header: “Build your mystery” or equivalent, plus concise explanatory copy.

- Scenario input card is the main focal point.

- Settings below or beside it depending on viewport.

- Primary CTA at the end of the form and sticky only if it does not obscure content.

- Optional prompt examples presented as selectable chips.

- A small preview panel explains that AI will create fictional suspects, evidence, and a fixed solution.

**## 7.3 Scenario input**

- Large text area with a visible label.

- Example prompt shown as placeholder or helper text.

- Character count and maximum length.

- Clear validation for empty, too-short, or too-long prompts.

- Optional “Use an example” controls that insert text into the field rather than silently submitting it.

- Keep user input when a network or generation request fails.

**## 7.4 Configuration controls**

Use accessible segmented controls, radio cards, or selects for:

- Difficulty: Easy, Medium, Hard.

- Category: supported mystery categories.

- Length: Short, Standard, Extended.

- Optional tone and setting fields if implemented.
- Case visual theme: choose from the approved presets when theme selection is implemented. The interface may recommend a preset from the scenario, but the user must be able to see the selected theme and change it before generation when that control is available.
- Theme selection affects presentation only; it must not alter difficulty, evidence logic, culprit identity, canonical timeline, or solution validity.

Each option must have a short explanation where the choice is not self-explanatory. Defaults must match the product specification. Do not add unsupported options to the UI.

**## 7.5 Generation progress state**

After valid submission:

- Lock the submit control against duplicate submission.

- Show a branded progress panel with truthful copy.

- Use a progress stage only if the backend provides real stage information. Otherwise use an indeterminate loading indicator.

- Example non-guaranteed status copy: “Building the case…”, “Connecting the evidence…”, “Preparing the investigation…”.

- Never imply that image/video generation has completed unless the corresponding task has actually completed.

- Provide cancellation only if the backend can cancel the job; otherwise provide a safe “Return” or “Leave this page” action with appropriate warning.

- On failure, preserve the prompt and settings and offer a retry.

- On success, navigate to the new case.

**## 7.6 Acceptance criteria**

- The scenario field is the primary visual focus.

- Validation occurs before API submission.

- Repeated clicks do not create duplicate cases.

- Loading copy is not a fabricated percentage or stage.

- Failure does not erase the user's prompt.

- Layout remains usable on mobile without horizontal scrolling.

---

**# 8. Page specification: Dashboard**

**## 8.1 Goal**

Help the user resume active investigations or review completed cases.

**## 8.2 Desktop layout**

- Header with wordmark and account menu.

- Page title and prominent “New investigation” CTA.

- Optional summary strip: active cases and completed cases; do not show invented metrics.

- Active investigations section.

- Completed cases section.

- Each case card shows title, case ID, category, difficulty, last activity, and progress only when that progress is available.

- Filters or tabs for All, Active, and Completed if supported.

- Empty state with an obvious create action.

**## 8.3 Case card behavior**

- Active case: primary action “Resume investigation”.

- Completed case: action “Review solution”.

- Show a neutral status chip with both text and icon.

- No hidden solution or culprit preview in cards.

- Avoid overloading cards with too many statistics.

- A case deletion action belongs in an overflow menu and requires confirmation.

**## 8.4 Mobile layout**

- Single-column card list.

- Full-width CTA near the top.

- Filters can become a horizontally scrollable segmented control with keyboard and screen-reader support.

- Do not use a dense desktop sidebar.

- Ensure card actions have at least 44px touch targets.

**## 8.5 States**

- Loading: card skeletons with stable dimensions.

- Empty: explain there are no cases yet and offer “Create your first mystery”.

- Error: show retry and preserve navigation.

- Partial data: render available cards and indicate unavailable metadata rather than inventing values.

- Deleted case: remove it after confirmed API success; on failure, restore the card and show an error.

**## 8.6 Acceptance criteria**

- Users can distinguish active from completed cases.

- Each card's action matches the case status.

- No metrics are fabricated.

- Long titles wrap without breaking the grid.

- Empty and error states are fully designed.

---

**# 9. Page specification: Investigation room**

**## 9.1 Goal**

Make evidence inspection and deduction the center of the product. This is the highest-priority application screen.

**## 9.2 Desktop shell**

Use a three-region layout with bounded overflow:

**### A. Left rail — 240–280px**

- Back to dashboard.

- Case title and ID.

- Overview.

- Suspects.

- Evidence library.

- Timeline.

- Notes.

- Optional progress indicator.

- Clear active navigation state.

The rail may be collapsible on medium desktop widths. It must not become so narrow that labels are unreadable.

**### B. Main workspace — flexible**

- Header for the current section.

- Case overview, evidence grid, selected evidence, timeline, or notes.

- Content should have a clear maximum reading width when text-heavy.

- Evidence gallery may use two or three columns depending on available space.

- Keep primary navigation stable while content changes.

**### C. Inspector panel — 280–340px, optional**

- Contextual metadata.

- Related evidence.

- Selected suspect facts.

- User notes or actions where relevant.

- The inspector can be collapsed to provide more space for evidence.

The main content must remain usable when the inspector is closed. At widths below approximately 1100px, collapse the inspector or make it a drawer rather than compressing all three columns.

**## 9.3 Top bar**

Must include:

- Return navigation.

- Case title or compact title.

- Case ID in monospaced type.

- Save/progress state when backed by actual persistence.

- More menu for allowed actions.

- No culprit name, hidden solution, or secret clue classification.

The top bar should remain compact and not consume a large fraction of the viewport height.

**## 9.4 Case overview**

Show:

- Public case summary.

- Incident location and timestamp when available.

- Investigation status.

- Suspect count and evidence count only when derived from real case data.

- Timeline preview.

- A “Continue investigating” action.

- A clear list of available investigative sections.

Do not display the canonical solution in overview metadata or hidden DOM content.

**## 9.5 Suspect directory**

- Grid or list of suspect cards.

- Portrait or initials fallback.

- Name, occupation, relationship to incident, and short public summary.

- Optional public alibi statement.

- No “guilty-looking” visual treatment or secret classification.

- Consistent image ratios and fallback states.

- Clicking a card opens a detailed profile and preserves the route/context.

**## 9.6 Suspect profile**

- Header with portrait, name, occupation, and case relationship.

- Public background and statement.

- Alibi details and known facts.

- Evidence references the user is authorized to inspect.

- Related timeline events.

- Notes action.

- “Return to suspects” navigation.

- Avoid presenting a suspicion score unless such a score is explicitly defined by the game rules and explained to users.

**## 9.7 Evidence library**

- Filter by supported evidence type.

- Search if the number of evidence items justifies it.

- Cards show title, type, timestamp, short description, and read status.

- Read status must be visible but must not imply clue importance.

- Use icon plus label for type.

- Filter results must announce result counts where accessible.

- Empty filter results need a reset action.

- Never label an evidence card “critical”, “red herring”, or equivalent before the reveal.

**## 9.8 Interactive Evidence Board**

The Evidence Board is a first-class investigation workspace, not merely a decorative illustration. It lets players organize public evidence, suspects, and their own theories visually. The board supports reasoning; it does not determine the canonical solution and must never reveal hidden answer data.

**### Desktop layout**

- Provide a dedicated “Evidence Board” section in the investigation navigation.
- Use a bounded board canvas within the main workspace. Keep the case title, board actions, and save state outside the pannable/zoomable canvas where possible.
- Provide a visible toolbar for adding evidence, adding a suspect, creating a theory/note, fitting the board to the viewport, and resetting the view. Only show actions that are implemented.
- A contextual inspector may display the selected card's public details, user annotations, and available actions.
- Provide a minimap only if the board is large enough to benefit from one; it is not required for the first release.
- Keep the interface focused on detective reasoning rather than making it resemble an unbounded design tool.

**### Board cards**

- Support placing case evidence cards and suspect cards on the board.
- Support user-created theory/note cards if this capability is enabled by the product/API contract.
- Cards show a clear title, item type, and concise public summary. Evidence IDs and timestamps use the metadata typography tokens.
- Clicking or keyboard-activating a case evidence card opens the evidence viewer or a clear preview without losing board context.
- Suspect cards link to their public profile.
- Selected, focused, and dragged cards must have distinct visible states.
- User-positioned cards retain their positions after a confirmed save.
- Provide an “Arrange” or “Auto arrange” action only if a deterministic layout implementation exists. Never silently rearrange a user's saved board.

**### Connections**

- Users can create a labelled relationship between two board cards using a keyboard-accessible flow as well as pointer interaction.
- Supported relationship labels may include “supports”, “contradicts”, “places at a time”, “links to”, and “my theory”. Use only relationship types supported by the product/API contract.
- Distinguish user-created theory connections from factual relationships supplied by case data.
- A connection is an interpretation, not proof that the relationship is true. Do not visually imply that a user-created connection is verified by the game.
- Provide an accessible way to select, inspect, edit, and remove a connection.
- Avoid overlapping labels and ambiguous connector endpoints. If the layout becomes dense, provide a list/table view of connections.
- Do not automatically draw a connection simply because two items are semantically related unless the backend explicitly supplies that relationship.
- Never style connections to imply hidden labels such as “critical clue”, “red herring”, or “culprit link” before the authorized reveal.

**### Board persistence and feedback**

- Show “Saving…”, “Saved”, or a failure state only when the corresponding persistence state is known.
- Prevent duplicate save requests and protect against stale updates overwriting newer board edits.
- On save failure, preserve the current board state in memory and provide a retry path.
- Warn before discarding unsaved changes when navigating away, where applicable.
- Do not show a successful save toast for optimistic state that the server has rejected.
- Keep board state scoped to the authorized user and case. Do not place private solution fields in board payloads or client state.

**### Mobile and touch behavior**

- Do not require drag-and-drop to use the board.
- On narrow screens, provide a usable board overview with tap-to-select cards, a card detail panel/drawer, and a linear list of cards and connections.
- Offer explicit actions such as “Move card”, “Connect items”, and “Remove connection” through accessible controls. If touch dragging is supported, it is an enhancement rather than the only method.
- Keep the canvas within the viewport and avoid page-level horizontal overflow.
- Preserve access to the rest of the investigation through the normal mobile navigation.

**### Empty, loading, and error states**

- Empty board: explain how to add evidence or suspects and provide one clear next action.
- Loading: use a stable placeholder only while board data is actually being fetched.
- Error: explain whether the board could not load or a change could not be saved; preserve local edits when safe.
- No available connections: show a neutral empty state rather than inventing relationships.

**### Acceptance criteria**

- Users can add and position supported cards, create and remove supported connections, and revisit the board with saved state restored.
- Board actions are keyboard-accessible and have visible focus states.
- Mobile users can inspect and connect items without relying on dragging.
- User-created theories are visually distinguishable from source-backed case relationships.
- The board never exposes the culprit, canonical solution, private clue classifications, or unrevealed rationale.
- Board layout and interactions remain usable at all required viewport sizes.

**## 9.9 Timeline**

- Vertical timeline on narrow layouts.

- Vertical timeline or compact two-column event layout on wide screens.

- Show timestamp, event description, and linked evidence where available.

- Sort by canonical event time.

- Clearly distinguish an event timestamp from an evidence upload/recovery timestamp.

- Invalid or unknown timestamps must be marked as unknown, not fabricated.

- Clicking a linked evidence item opens its viewer.

**## 9.10 Notes**

- Clearly labelled private notes area.

- Text area with save state.

- Explicit saved, saving, and failed states.

- Preserve unsaved content when a save request fails.

- Debounced autosave is allowed only when implemented correctly; show “Saving…” and “Saved” based on actual API outcomes.

- Do not send notes to Gemini unless a separately specified feature explicitly requires it and informs the user.

**## 9.11 Mobile investigation layout**

- Compact sticky top bar with back control, short case title, and menu.

- Main content occupies full width.

- Use bottom navigation for major sections or a clearly accessible section selector.

- Evidence viewer may occupy the full viewport.

- Related evidence and metadata appear in expandable drawers.

- Do not force a three-column layout onto mobile.

- Use sticky bottom actions only if they do not cover content, form fields, or system keyboard input.

- Support browser back navigation without silently discarding edits.

- Keep touch targets at least 44×44px.

**## 9.12 Acceptance criteria**

- The user can navigate between overview, suspects, evidence, timeline, and notes.

- The active section is always identifiable.

- The evidence viewer has a clear return path.

- The layout works when the inspector is hidden.

- No content causes horizontal overflow at supported viewports.
- The Evidence Board remains usable on mobile without mandatory drag-and-drop.
- All approved case themes pass contrast, responsive, keyboard, and reduced-motion checks.

- Private solution fields never reach the client before authorized completion.


**## 9.13 Case-specific visual themes**

Each case may use an approved visual preset to reinforce its setting and evidence style. The theme is an art-direction layer, not a separate application design system.

**### Approved theme presets**

- `noir`: muted charcoal, warm paper, restrained amber/coral accents, and sparingly used film-grain-like texture.
- `archive`: archival paper, faded ink, file labels, stamp-like accents, and restrained olive/ochre tones.
- `digital_forensics`: dark slate surfaces, readable technical metadata, blue/cyan accents, and subtle grid or log-inspired details.
- `luxury`: deep navy or burgundy surfaces, restrained gold accents, polished editorial spacing, and minimal ornament.
- `field_investigation`: practical field-note surfaces, muted green/khaki accents, map-like separators, and utilitarian labels.

These names define visual direction, not permission to hardcode one-off CSS in case components. Map them to documented tokens. Add presets only after updating this document and the relevant acceptance tests.

**### Theme rules**

- Every preset uses the same navigation, layout, component contracts, keyboard behavior, and interaction affordances.
- Themes may adjust approved surface, accent, border, texture, and decorative tokens. They may not change semantic state meaning, text content rules, access control, evidence truth, or game mechanics.
- AI may recommend a preset based on a case premise, but must return a preset identifier from an allowlist. Never accept arbitrary CSS, HTML, class names, font URLs, or executable styling from model output.
- Store the selected preset as a validated case theme identifier. If missing or invalid, fall back to the product default without breaking the case.
- Maintain readable text and visible focus indicators in every preset. Do not rely on a textured background or color alone to distinguish evidence types or relationship status.
- Evidence cards must remain legible and recognizable across themes. Avoid making evidence types depend on theme-specific iconography alone.
- Theme changes must not disclose clue importance, reliability, culprit status, or the canonical solution.
- Keep motion, contrast, spacing, and component geometry consistent unless a documented exception is required for accessibility.
- The dashboard may use a small theme preview or accent swatch, but must not reveal private case information.

**### Theme acceptance criteria**

- Each approved preset can be selected and rendered through the same shared components.
- Unknown or malformed theme identifiers fall back safely.
- No arbitrary styles from AI output are applied to the DOM.
- All presets pass contrast, keyboard, responsive, and reduced-motion checks.
- Theme differences are atmospheric and recognizable without reducing usability or consistency.


---

**# 10. Evidence viewer specifications**

Evidence types need distinct visual treatments but must share a common viewer shell.

**## 10.1 Shared viewer shell**

- Evidence title and type label.

- Case ID and evidence ID.

- Fictional timestamp and source context where available.

- Main artifact content.

- Description and relevant metadata.

- Related evidence links only when supported by case data.

- Previous/next evidence navigation if the current order is defined.

- Mark-as-reviewed behavior only if supported by the API.

- Close/back control that returns to the previous investigation context.

On desktop, the viewer may occupy the center workspace with metadata in the inspector. On mobile, it becomes a full-screen page with a compact header.

**## 10.2 Chat evidence**

Visual style:

- Neutral messaging-app-like layout that is clearly fictional and not branded as an authentic export from a real account.

- Distinct participants with consistent names and initials/avatar colors.

- Timestamp separators.

- Message bubbles aligned by speaker.

- Edited/deleted message indicators only when present in the evidence data.

- Preserve message ordering and timestamps.

- Long messages wrap and remain selectable.

- A transcript or accessible linear reading order must be available.

- Do not use real WhatsApp logos or imply access to real private accounts.

**## 10.3 Image evidence**

- Large image with contain/zoom behavior appropriate to the artifact.

- Stable aspect-ratio container while loading.

- Caption and source metadata below or beside the image.

- Zoom control accessible by keyboard.

- Optional image description and text-based observations.

- If the image fails to load, show a clear fallback and retain all available metadata.

- Never invent visual details in the UI when the image is missing.

- On mobile, image should fit within viewport width and allow zoom without trapping the user.

**## 10.4 Surveillance evidence**

When an actual generated video asset exists:

- Use a genuine video element or compatible player.

- Show truthful duration and playback controls.

- Provide captions/transcript or a textual description when available.

- Do not autoplay sound.

- Do not simulate a timeline or frame progression that does not correspond to the asset.

When only simulated footage data exists:

- Label it “Simulated surveillance reconstruction” or equivalent.

- Display the available still frame or frames.

- Display actual provided timestamps and observations.

- Do not expose a fake play button that pretends to play a real video.

- If an interactive frame sequence is implemented, clearly indicate it is a simulation.

**## 10.5 Document and forensic evidence**

- Paper-like surface with ink border.

- Document title, fictional source, issue time, and case reference.

- Clear section headings and readable text.

- Monospaced identifiers and timestamps.

- Highlighted excerpts may be used only when supported by the actual evidence content.

- Do not visually mark a sentence as decisive before the reveal.

- Long documents need sensible scrolling and a readable line length.

- Provide accessible text even if a document preview image is used.

**## 10.6 Witness statements**

- Quote or transcript in a readable panel.

- Witness identity and interview time.

- Source/context labels.

- Distinguish direct statements from system metadata.

- Use quotation styling sparingly; the content should remain easy to scan.

- Link to related evidence when the backend provides the relationship.

**## 10.7 Emails, access logs, and call records**

- Use structured tables on desktop.

- On mobile, convert each record into a stacked row/card rather than forcing an unreadable wide table.

- Use monospaced type for identifiers, times, and technical values.

- Keep all fields labelled.

- Provide horizontal scrolling only as a last resort and make it keyboard accessible.

**## 10.8 Missing and loading media**

- Reserve the expected aspect ratio to avoid layout shifts.

- Use skeletons only while a request is actually pending.

- Show retry if retry is supported.

- Show a clear unavailable state if the asset does not exist or generation failed.

- Preserve the evidence description and metadata when the media is unavailable.

---

**# 11. Page specification: Accusation flow**

**## 11.1 Accusation page**

- Page title: “Who do you believe is responsible?”

- Short instruction explaining that the final submission ends the investigation or locks the answer, according to the product rules.

- Selectable suspect cards with accessible radio semantics.

- Optional reasoning text area.

- Clear final action: “Submit final accusation”.

- Secondary action to return to evidence.

- No preselected suspect by default.

**## 11.2 Confirmation dialog**

Show:

- Selected suspect name.

- Clear warning that the accusation is final if the product allows only one attempt.

- Confirm and go back actions.

- Keyboard focus starts inside the dialog and returns to the triggering control when closed.

- Do not use vague confirmation copy such as “Are you sure?” without explaining the consequence.

**## 11.3 Submission states**

- Idle: button enabled only when a valid suspect is selected.

- Submitting: prevent duplicate requests and show progress.

- Success: navigate to authorized result state.

- Failure: preserve selection and reasoning, display retry guidance, and do not mark the case completed.

- Already submitted: fetch and display the existing result rather than creating a second final accusation.

**## 11.4 Mobile behavior**

- Suspect choices stack vertically.

- The submit button may be sticky at the bottom, but must respect safe areas and not cover content.

- Confirmation dialog may become a bottom sheet.

- Ensure the text area remains usable when the mobile keyboard is open.

---

**# 12. Page specification: Results and solution reveal**

**## 12.1 Goal**

Deliver a satisfying reveal that explains the mystery rather than simply displaying “correct” or “incorrect”.

**## 12.2 Layout order**

1. Result banner: correct/incorrect, with text and icon.

2. User's selected suspect.

3. Actual culprit reveal.

4. Motive and method.

5. Reconstructed timeline.

6. Decisive evidence list with explanations.

7. Red-herring explanation.

8. Why other suspects were less likely.

9. Final score and available statistics.

10. Actions: return to dashboard and start another mystery.

Only display statistics that were actually tracked.

**## 12.3 Reveal interaction**

- The culprit reveal may use a short card-reveal animation.

- The answer must be available immediately to reduced-motion users.

- Do not require the user to click through a long cinematic animation to access the solution.

- Ensure the screen reader announces the result.

- The solution must come from authorized server data, not a frontend guess.

- If result retrieval fails, show a retry state without leaking partial private data.

**## 12.4 Visual treatment**

- Correct result: green semantic panel with a restrained celebratory accent.

- Incorrect result: coral/red semantic panel with clear explanatory language and no shaming tone.

- The culprit card may use a strong yellow or purple panel with ink outline and hard shadow.

- Timeline and decisive evidence use the same reusable components as the investigation workspace.

- No fake fireworks or heavy animation. A brief, optional visual accent is sufficient.

**## 12.5 Acceptance criteria**

- The actual culprit and explanation are only rendered after authorized completion.

- Each decisive evidence reference links to valid evidence.

- Correct and incorrect outcomes are visually distinct and textually clear.

- The user can return to the dashboard.

- The full solution remains readable without animation.

---

**# 13. Page specification: Profile and account settings**

- Display the account name and email where appropriate.

- Provide only settings that are actually supported.

- Account actions use clear labels and confirmation where destructive.

- Logout should return to a public route and clear the relevant session state.

- Account deletion, if implemented, requires a separate explicit confirmation and backend support.

- Do not add fake preference controls that do not persist.

---

**# 14. Animation and interaction system**

**## 14.1 Motion principles**

Use motion to communicate hierarchy, cause and effect, and system state. The visual experience should feel lively but not distract from deduction.

**## 14.2 Approved animations**

**### Button press**

- Hover: subtle 1px movement and reduced shadow.

- Active: translate down/right 2–3px, with shadow reduced.

- Duration: 120ms.

- Disable movement when the control is disabled.

**### Card hover**

- Optional translateY(-2px) or translate(-1px, -1px).

- Shadow offset may increase slightly on hover.

- Duration: 160–200ms.

- Only interactive cards receive hover treatment.

**### Dialog and drawer**

- Enter: opacity 0 to 1 and translateY(8px) to 0.

- Exit: opacity 1 to 0 and translateY(4px).

- Duration: 200–280ms.

- Respect reduced motion.

**### Page/section transition**

- Use a brief opacity transition and small vertical movement only when navigation architecture supports it.

- Do not animate every route if it causes focus or scroll bugs.

- Duration: 160–240ms.

**### Evidence reveal**

- A selected evidence panel may fade/slide in.

- Do not animate each line of long evidence text.

- Duration: 180–260ms.

- Do not conceal content from assistive technology during animation.

**### Generation state**

- Use a small spinner or restrained pulsing indicator.

- If a progress bar is used, its percentage must reflect real measured progress. Otherwise use an indeterminate indicator.

- Avoid endless typewriter effects for status text.

- Provide status updates through an accessible live region without announcing every decorative animation frame.

**### Timeline**

- Markers may animate in briefly when the timeline first appears.

- Do not animate the timeline on every scroll or rerender.

**### Hero illustration**

- Use one-time staggered entrance for decorative evidence cards.

- Keep motion subtle and short.

- No constant floating or rotation that makes text difficult to read.

**## 14.3 Prohibited motion patterns**

- Infinite decorative movement on all cards.

- Large parallax that affects readability.

- Flashing, strobing, or rapid color cycling.

- Auto-playing audio.

- Forced scroll animations.

- Long blocking intros before the user can interact.

- Animation-only status changes.

- Fake progress bars.

- Motion that breaks focus, pointer interaction, or layout stability.

**## 14.4 Reduced motion**

When `prefers-reduced-motion: reduce` is enabled:

- Remove nonessential transforms and stagger effects.

- Replace animated transitions with instant or very short opacity changes.

- Keep loading indicators understandable without motion, using text or a static icon as appropriate.

- Never remove necessary status information.

- Do not use JavaScript to override the user's preference without a clear reason.

---

**# 15. Responsive behavior**

**## 15.1 General rules**

- No horizontal page overflow at supported viewport widths.

- Text must wrap naturally.

- Buttons and inputs must be usable with touch.

- Desktop hover states must have equivalent focus and touch behavior.

- Sticky elements must not cover content or keyboard focus.

- Images use responsive dimensions and stable aspect ratios.

- Tables transform into cards or intentionally scroll at small widths.

- Drawers and dialogs fit within the viewport and respect safe areas.

- Use content-driven breakpoints when a specific component needs them.

**## 15.2 Layout by viewport**

**### Mobile: 360–639px**

- Single-column marketing sections.

- Full-width or near-full-width cards.

- Mobile menu.

- Investigation room uses one content pane plus bottom navigation or section selector.

- Evidence metadata collapses into accordions/drawers.

- Primary actions are easy to reach and at least 44px tall.

- No tiny three-column grids.

**### Tablet: 640–1023px**

- Two-column marketing feature grids where appropriate.

- Dashboard may use two columns.

- Investigation rail may collapse to an icon-plus-label drawer or section menu.

- Inspector becomes a drawer or collapsible panel.

- Preserve generous touch targets.

**### Small desktop: 1024–1279px**

- Standard centered content containers.

- Investigation uses left rail plus main panel; inspector collapses when necessary.

- Avoid compressing evidence cards into unreadable columns.

**### Desktop: 1280–1535px**

- Full investigation layout with left rail, main workspace, and optional inspector.

- Marketing page uses the full max-width container.

- Two- or three-column evidence grids based on content width.

**### Large desktop: 1536px and above**

- Keep content aligned to max-width tokens.

- Do not scale typography indefinitely.

- Use extra space for layout breathing room, not oversized cards.

**## 15.3 Responsive QA matrix**

At minimum, verify:

- 360×800: narrow mobile.

- 390×844: typical modern mobile.

- 768×1024: tablet portrait.

- 1024×768: small laptop/tablet landscape.

- 1280×800: desktop.

- 1440×900: larger desktop.

Test both long and short content. Test the open drawer/dialog state, evidence viewer, and mobile keyboard interaction—not only the default page.

---

**# 16. Accessibility requirements**

Target WCAG 2.2 AA as the design and implementation goal.

- Semantic landmarks and headings.

- Correct accessible names and roles.

- Keyboard access for every action.

- Visible focus indicators.

- Logical focus order.

- Focus trapping and restoration for dialogs.

- Contrast checked for text, icons, borders, and interactive states.

- Minimum 44×44px target size where practical; never make primary touch targets unreasonably small.

- Form labels, helper text, and error associations.

- Status changes exposed to assistive technology.

- No essential information conveyed by color alone.

- Reduced-motion support.

- Alt text for meaningful images and empty alt text for decorative imagery.

- Text transcript or description for evidence media where available.

- Do not place essential text inside a generated image.

- Ensure text remains selectable and zoomable.

- Do not automatically move focus when background content updates unexpectedly.

Automated accessibility scans are useful but do not replace keyboard and screen-reader checks.

---

**# 17. Loading, empty, error, and offline states**

Every page that fetches or mutates data must define its non-happy paths.

**## 17.1 Loading**

- Use skeletons for stable card layouts.

- Use a spinner for short localized operations.

- Use an indeterminate generation panel for long AI requests unless real progress is available.

- Keep navigation and unrelated actions responsive.

- Do not show a skeleton indefinitely after a failed request.

**## 17.2 Empty**

Each empty state needs:

- Clear explanation.

- One relevant next action.

- Optional small illustration.

- No unnecessary decorative clutter.

Examples:

- No investigations: create the first mystery.

- No evidence matching filter: clear filters.

- No notes: begin recording observations.

- No related evidence: state that no linked items are available.

**## 17.3 Error**

- Explain what failed in plain language.

- Offer retry where retry is safe.

- Preserve user input where possible.

- Never expose internal stack traces or private solution data.

- Distinguish invalid input from network/provider failures.

**## 17.4 Offline or disconnected**

- Show a connection warning when a network-dependent action fails.

- Preserve local unsent edits in component state where safe.

- Do not imply that notes or accusations were saved offline unless offline persistence is implemented and tested.

- Reconcile server state on reconnection only through an explicit, well-defined strategy.

**## 17.5 Session expiration**

- Explain that the session expired.

- Preserve non-sensitive unsent form content where possible.

- Redirect to login only when necessary.

- Do not render protected case content after authorization is lost.

---

**# 18. Content and microcopy**

**## 18.1 Voice**

Use concise, immersive, plain English. Copy can be atmospheric, but instructions and errors must remain direct.

Good examples:

- “Open the case”

- “Review evidence”

- “Save note”

- “Submit final accusation”

- “The case could not be generated. Your prompt is still here.”

Avoid:

- Overly dramatic paragraphs in every control.

- Unexplained police jargon.

- Ambiguous buttons such as “Proceed” when the action is destructive.

- Claims that fictional content is genuine evidence.

- Fake statistics, fake saved states, or fake AI progress.

**## 18.2 Evidence content**

The interface must clearly contextualize generated evidence as fictional game content. Use subtle product-level framing, not a large disclaimer repeated on every card.

**## 18.3 Button labels**

Prefer action + object:

- “Create mystery”

- “Open evidence”

- “View suspect”

- “Save note”

- “Submit accusation”

- “Review solution”

---

**# 19. Asset rules**

- Use original product logo/wordmark assets.

- Use one consistent icon library.

- Use CSS shapes and structured UI elements for the evidence-board illustration where possible.

- Use generated fictional portraits and evidence images only when the corresponding asset exists.

- Store media references in data, not hardcoded into page components.

- Provide fallback initials or placeholders for missing images.

- Use `object-fit: cover` for portraits and `contain` for documents/evidence where cropping would remove information.

- Avoid embedding text into raster images when that text must be responsive or accessible.

- Use optimized, responsive image formats where supported.

- Provide descriptive filenames and alt text.

- Do not use copyrighted brand marks to make fictional chats look authentic.

---

**# 20. Frontend architecture and implementation conventions**

**## 20.1 Suggested structure**

Adapt to the existing repository before adopting this layout.

```text

client/src/

├── assets/

├── components/

│   ├── ui/

│   ├── layout/

│   ├── feedback/

│   └── evidence/

├── features/

│   ├── auth/

│   ├── dashboard/

│   ├── mystery-create/

│   ├── investigation/

│   ├── suspects/

│   ├── evidence/

│   ├── accusation/

│   └── results/

├── layouts/

├── pages/

├── services/

├── hooks/

├── context/

├── styles/

│   ├── tokens.css

│   ├── globals.css

│   └── motion.css

├── utils/

├── App.jsx

└── main.jsx

```

**## 20.2 Component rules**

- Keep shared UI components generic and feature components domain-specific.

- Avoid giant page components with all layout and business logic inline.

- Keep API calls in service modules/hooks rather than directly in presentational components.

- Use explicit loading, error, empty, and success states.

- Keep form state and validation predictable.

- Avoid unnecessary global state.

- Do not duplicate the same design token as multiple different hardcoded values.

- Do not use `div` elements for controls when native buttons, links, inputs, or semantic elements fit.

- Ensure React keys are stable.

- Avoid direct DOM manipulation unless there is a justified, isolated need.

**## 20.3 Design-token implementation**

- Create a single token source.

- Map colors, typography, spacing, radii, shadows, and breakpoints into the styling system.

- Use CSS variables for runtime theme surfaces and semantic aliases.

- Do not maintain independent conflicting color values in Tailwind config, CSS, and component files.

- If a dark investigation surface is implemented, use explicit semantic surface tokens and test contrast for every foreground/background pairing.

**### Case theme implementation**

- Implement themes through a central allowlist/map of theme IDs to approved CSS custom-property values.
- Prefer a case-scoped root attribute such as `data-case-theme="noir"` over scattered conditional styles.
- Theme variables must be applied at the case investigation boundary and must not leak into unrelated routes.
- Keep semantic tokens separate from decorative theme tokens. A case theme must not redefine success, warning, danger, focus, or disabled-state semantics.
- Validate theme IDs at the API boundary and again before applying them in the frontend.
- Do not generate runtime stylesheets from Gemini output.

**### Evidence Board component boundaries**

- Keep board canvas/layout, board cards, connection rendering, toolbar, inspector, and persistence status as separate components or cohesive modules where the existing repository structure supports it.
- Keep board interaction state separate from server-authoritative case data. Persist only the supported board layout, user annotations, and user-created relationships.
- Use stable IDs for cards and connections. Avoid using array indexes as persistent identifiers.
- Prefer a tested board/canvas library only if it is already in the repository or the team explicitly approves adding a dependency. Do not silently add a large dependency.
- Provide keyboard alternatives for pointer-based actions and test drag behavior independently from save behavior.

**## 20.4 Data-driven UI**

- Render suspect and evidence cards from API data.

- Use fixture data only in development or explicit sample-case content.

- Do not hardcode the actual culprit in a client-side fixture used by a production route.

- Use server-returned status to choose active/completed UI.

- Treat user-provided text and generated evidence as untrusted content; render it as text, not executable HTML.

---

**# 21. Performance requirements**

- Avoid layout shifts when images or evidence load.

- Use image dimensions or aspect-ratio containers.

- Lazy-load below-the-fold images where appropriate.

- Avoid loading heavy animation libraries for simple CSS transitions.

- Keep the investigation workspace responsive while evidence is fetched.

- Paginate or bound large evidence lists.

- Avoid unnecessary rerenders of the whole investigation shell.

- Respect browser memory constraints for image-heavy cases.

- Do not autoplay large video assets.

- Avoid excessive shadows, filters, or animated transforms on many elements simultaneously.

The visual system must remain attractive on mid-range mobile hardware.

---

**# 22. Visual and interaction QA**

**## 22.1 Required page coverage**

Visual QA must cover:

- Landing page.

- Login and registration.

- Mystery creation, validation, loading, and failure.

- Dashboard: loading, populated, empty, and error.

- Investigation overview.

- Suspect list and profile.

- Evidence library and every implemented evidence viewer type.

- Timeline.

- Notes.

- Accusation selection and confirmation.

- Correct and incorrect result.

- Session expired and unauthorized/not-found states.

- Mobile navigation, drawer, and dialogs.

**## 22.2 Visual review checklist**

- Colors match design tokens.

- Typography follows the scale and hierarchy.

- Borders and hard shadows are consistent.

- Spacing follows the 4px grid.

- No overflow or clipped focus outlines.

- Buttons show hover, focus, active, disabled, and loading states.

- Inputs show default, focus, invalid, and disabled states.

- Loading states do not jump in size.

- No fake or missing navigation links.

- Evidence media has a truthful fallback.

- No solution data appears before the result.

- Mobile layout is designed rather than simply squeezed.

- Reduced-motion mode works.

- Contrast and keyboard navigation are checked.

**## 22.3 Test approach**

- Use Playwright for viewport and interaction coverage.

- Add visual regression screenshots if the repository supports stable screenshot baselines.

- Test at the exact viewport matrix in this document.

- Test with both short and unusually long content.

- Run automated accessibility checks and manually test keyboard navigation.

- Do not accept screenshot similarity alone as proof that interactions work.

---

**# 23. Design acceptance criteria**

The design implementation is complete only when all relevant criteria pass.

**## Foundation**

- [ ] Tokens exist in a central source and are used consistently.

- [ ] Typography and color palette match this specification.

- [ ] Shared components support documented states.

- [ ] No competing hardcoded theme values remain in common components.

**## Pages**

- [ ] Landing page is complete and responsive.

- [ ] Authentication pages are complete if authentication is enabled.

- [ ] Mystery creation has validation, loading, failure, and retry states.

- [ ] Dashboard has populated, empty, loading, and error states.

- [ ] Investigation shell works at desktop, tablet, and mobile sizes.

- [ ] Suspect and evidence views use reusable components.

- [ ] All implemented evidence types have a specific viewer.

- [ ] Accusation flow includes an explicit confirmation for final submission.

- [ ] Results page explains the solution with authorized data.

- [ ] Profile controls reflect real supported functionality.

**## Interaction and motion**

- [ ] All interactive controls work with mouse, keyboard, and touch as applicable.

- [ ] Hover, focus, active, disabled, and loading states are visible.

- [ ] Motion follows the duration/easing tokens.

- [ ] Reduced-motion behavior is implemented.

- [ ] No fake progress or fake media playback exists.

**## Accessibility and security**

- [ ] Focus is visible and logical.

- [ ] Forms have labels and accessible errors.

- [ ] Dialog focus is managed correctly.

- [ ] Semantic states do not rely only on color.

- [ ] Private solution data is not sent to the frontend before authorized completion.

- [ ] Generated content is rendered safely.

- [ ] No secrets are embedded in frontend code.

**## Quality**

- [ ] Required viewport matrix passes.

- [ ] No horizontal overflow at target widths.

- [ ] Build and applicable lint checks pass.

- [ ] Core Playwright flows pass.

- [ ] Visual regressions and known limitations are documented.

---

**# 24. Required Codex workflow**

Codex must implement the design in this order:

1. ****Repository audit:**** inspect existing files, dependencies, routing, styling, and current functionality.

2. ****Token foundation:**** implement CSS variables and Tailwind mapping; verify token usage.

3. ****Shared primitives:**** buttons, inputs, cards, chips, dialogs, drawers, loading, empty, and error states.

4. ****Application shells:**** public shell, authenticated shell, investigation shell, responsive navigation.

5. ****Static page layouts:**** build all page structures with fixture data and correct responsive behavior.

6. ****Evidence viewers:**** implement each supported type and missing-media behavior.

7. ****Interaction states:**** validation, save states, modal behavior, navigation, and keyboard support.

8. ****API integration:**** connect existing documented endpoints without exposing private solution fields.

9. ****Motion and accessibility:**** add approved motion, reduced-motion behavior, and accessibility improvements.

10. ****QA:**** run builds, tests, viewport screenshots, and interaction checks; fix regressions.

11. ****Documentation update:**** report what was implemented, what remains, and any approved deviation.

At the end of each phase, Codex must report:

- Files created or changed.

- Components/pages completed.

- Interactions verified.

- Commands/tests executed and their results.

- Remaining defects or blockers.

- Any specification ambiguity that needs a product decision.

Do not attempt to build every page in one unreviewed code-generation pass.

---

**# 25. Final design rule**

****AI Mystery Room must be colorful, tactile, expressive, and suspenseful—but always readable, truthful, accessible, and usable.****

Neo-brutalism is a system, not decoration: bold outlines, hard shadows, saturated accents, and tactile feedback must be consistent. Animation must reinforce interaction rather than distract from investigation. The evidence and the user's reasoning must remain the center of the experience. Case-specific themes may change atmosphere, but must never fragment the shared interface or imply hidden solution facts.

This document is the single source of truth for design. Any intentional design-system change must be made here first or alongside the implementation, and the affected components and acceptance criteria must be updated together.

****End of `docs/DESIGN_SPEC.md` — Version 1.1.0****
