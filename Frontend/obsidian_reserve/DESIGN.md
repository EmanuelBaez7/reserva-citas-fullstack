# Design System Specification: High-End Appointment Booking

## 1. Overview & Creative North Star: "The Obsidian Architect"
This design system is built to transform the mundane task of scheduling into an immersive, premium experience. Our Creative North Star is **The Obsidian Architect**. Like a high-end physical workspace, the UI should feel carved from solid materials—charcoal, graphite, and deep navy—illuminated by soft, directional light.

We move beyond the "SaaS template" by rejecting rigid borders and flat containers. Instead, we use **Intentional Asymmetry** and **Bento Grid Layouts** to create a sophisticated, editorial rhythm. Elements don’t just sit on a page; they float within a three-dimensional space, utilizing Glassmorphism 2.0 to create a sense of depth and luxury.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Dark Mode First" mentality, utilizing deep, near-black navies to provide a more expensive feel than pure hex-black.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through background color shifts.
*   **Surface on Surface:** A `surface-container-low` section sitting on a `surface` background creates a natural, soft boundary that feels integrated, not "boxed in."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following tiers to define importance:
*   **Base Layer:** `surface` (#0c1324) – The infinite canvas.
*   **Sectional Layer:** `surface-container-low` (#151b2d) – Large layout blocks.
*   **Actionable Layer:** `surface-container` (#191f31) – The primary workspace.
*   **Floating/Elevated Layer:** `surface-container-high` (#23293c) – Modals and popovers.

### The "Glass & Gradient" Rule
To achieve a signature look, floating elements (like navigation bars or hovering booking cards) must use **Glassmorphism**. 
*   **Formula:** `surface-variant` at 60% opacity + `backdrop-blur: 24px`.
*   **Gradients:** Use a subtle linear gradient (Top-Left to Bottom-Right) from `primary` (#c4c7c9) to `primary-container` (#15181a) for primary CTAs to provide a tactile, metallic soul.

---

## 3. Typography: Confident Editorial
We pair **Manrope** (Display/Headlines) for its geometric authority with **Inter** (Body/Labels) for its surgical legibility.

*   **High-Contrast Hierarchy:** Use `display-lg` (3.5rem) sparingly to create focal points. The contrast between a massive `display` heading and a tiny `label-sm` metadata tag creates an expensive, "high-fashion" layout feel.
*   **Scale Usage:**
    *   **Headlines:** Use `headline-md` (1.75rem) for dashboard sections.
    *   **Body:** Stick to `body-md` (0.875rem) for the majority of interface text to maintain a compact, "pro" feel.
    *   **Labels:** `label-md` should always be in `on-surface-variant` (#c6c6cd) to de-emphasize secondary information.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too "dirty" for this aesthetic. We use **Ambient Light** and **Stacking**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. The shift in tone creates a "soft lift" that is felt rather than seen.
*   **Ambient Shadows:** For floating elements, use a `20px` to `40px` blur with only 6% opacity. The shadow color should be tinted with `on-secondary` (#233144) to mimic light passing through deep glass.
*   **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use the `outline-variant` token at **15% opacity**. Never use a 100% opaque stroke.

---

## 5. Components & Interaction

### Buttons
*   **Primary:** Gradient of `primary` to `secondary`. `DEFAULT` (1rem) roundedness. On hover, apply a `0 0 15px` glow using the `surface-tint` color.
*   **Secondary:** `surface-container-highest` background with a "Ghost Border."
*   **Interaction:** Smooth 200ms transitions. Use a "Tactile Scale" effect—on click, the button should shrink to `0.98` scale.

### The Booking Bento (Cards)
*   **Rule:** Forbid divider lines. Use `vertical spacing (scale-6 / 2rem)` and background tonal shifts to separate content.
*   **Visuals:** Large `lg` (2rem) rounded corners. Use a `surface-container-low` base with `surface-container-highest` nested chips for status.

### Input Fields
*   **Styling:** `surface-container-lowest` background. No border. 
*   **Focus State:** A subtle inner glow and a transition to `surface-bright`. The label moves from `body-md` to `label-sm` with a high-contrast `primary` color shift.

### Glass Tooltips
*   **Execution:** Semi-transparent `surface-container-highest` with a `backdrop-blur`. These should feel like "HUD" elements overlaid on the interface.

### Dynamic Booking Chips
*   **States:** Selection chips use `secondary-container` when active. When inactive, they blend into the background using `surface-container-low`.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical bento grids (e.g., a 2/3 width calendar next to a 1/3 width "Upcoming" list).
*   **Do** use the `xl` (3rem) corner radius for top-level layout containers to mimic Apple’s hardware aesthetics.
*   **Do** allow the background gradients to "bleed" through glass surfaces using `backdrop-filter`.

### Don’t
*   **Don’t** use pure white (#FFFFFF) for text. Always use `on-surface` (#dce1fb) to avoid eye strain in dark mode.
*   **Don’t** use "Drop Shadows" from a standard UI kit. If it looks like a shadow, it's too heavy. It should look like "Ambient Occlusion."
*   **Don’t** use 1px dividers to separate list items. Use `spacing-3` (1rem) of empty space and let the typography alignment do the work.