# StarWatch UI Design System

`DESIGN.md` is the required visual reference for all future StarWatch frontend changes. Read it before editing `index.html`, `assets/css/`, or UI-facing code. Keep new work consistent with these rules; if an intentional design change is needed, update this document in the same change.

## 1. Visual direction

- Astronomy-focused, calm, high-contrast interface with dark navy surfaces, restrained violet/cyan accents, and compact information density.
- Keep all user-facing copy in Vietnamese.
- Prefer existing CSS tokens, utility patterns, and component styles over new one-off values.
- Do not add a build step or a frontend framework.

## 2. Color palette

### Dark (default)

| Purpose | Value |
| --- | --- |
| Main background | `#070b14` (`--bg-primary`) |
| Elevated surface | `#0f172a` (`--bg-secondary`) |
| Card surface | `rgba(15, 23, 42, 0.85)` (`--bg-card`) |
| Border | `rgba(51, 65, 85, 0.6)` (`--border-color`) |
| Primary text | `#f8fafc` (`--text-primary`) |
| Secondary text | `#94a3b8` (`--text-secondary`) |
| Primary accent | `#8b5cf6` (`--accent-primary`) |
| Secondary accent | `#38bdf8` (`--accent-secondary`) |
| Positive / save | Emerald family (`#059669`–`#10b981`) |
| Warning / settings | Amber family (`#f59e0b`–`#fbbf24`) |

### Light and field red-vision modes

- Light mode uses `#f1f5f9` background, `#ffffff` surfaces, `#0f172a` primary text, `#475569` secondary text, violet `#6d28d9`, and cyan `#0284c7`.
- Red-vision mode uses near-black backgrounds and red text/accents as defined in `assets/css/tokens.css`. Avoid adding bright non-red decorative colors to this mode.
- Prefer the existing theme tokens so all three modes remain coherent.

## 3. Typography

- Primary UI font: **Inter**. Use **JetBrains Mono** for coordinates, API keys, and other technical values.
- Use a compact hierarchy:
  - Page/modal title: desktop `16–20px`, mobile `14px` (line-height about `1.25–1.35`).
  - Section title: `14px`, semibold/bold.
  - Body and controls: `12–14px`.
  - Supporting text/metadata: `10–12px`, secondary color.
- Keep Vietnamese text legible; do not shrink labels below `10px` or truncate essential instructions.
- Prefer wrapping/clamping only for nonessential descriptions, never for input labels or action text.

## 4. Shared spacing, shape, and controls

- Use a consistent spacing rhythm based on `4px`: `4, 8, 12, 16, 20, 24px`.
- Cards: `12–16px` radius, subtle one-pixel slate border, low-contrast surface. Avoid stacking multiple heavy shadows.
- Buttons: `8–12px` radius, clear hover/focus/active states, concise labels, and consistent sizing within a component.
- Standard desktop controls are generally `36–40px` high. Mobile tap targets should be at least `40px`; use `44px` where space permits.
- Avoid `flex-grow` on a single action when it makes that button disproportionately wide. Use intrinsic sizing or balanced equal-width actions.
- Inputs should have clear labels, dark/light theme-aware surfaces, and visible focus borders. Technical values use monospace.
- Use the internal SVG sprite in `assets/icons/sprite.svg` through `js/ui/icons.js`; keep icons centered, accessible, and undistorted.
- Desktop tool navigation icons use a consistent 14px box; their SVG artwork should use the full viewBox so icons look equally sized.
- The mobile bottom tool navigation uses centered 22px icons with compact labels.
- Keep the StarWatch logo consistent across the header, app-information view, and favicon by using the `starwatch-mark` glyph and its violet-indigo-cyan gradient treatment.
- Dynamic status badges should keep fixed dimensions and wrap their text within the allocated space so changing status copy does not reflow adjacent content.

## 5. Desktop layout (`min-width: 640px`)

- Preserve the current desktop page layout and existing modal dimensions unless a task explicitly asks to change them.
- Tool modals are centered, bounded in width, and use the existing liquid-glass treatment, rounded corners, and dark translucent backdrop.
- Keep desktop tool headers content-sized with a horizontal title, icon, supporting text, and close action.
- Desktop navigation is inline; do not apply mobile full-screen modal or fixed bottom navigation rules.
- Desktop forms may use two-column field groups when the fields are related and there is sufficient width.

## 6. Mobile layout (`max-width: 639px`)

- Mobile tool views use a full-viewport surface (`100dvh` with `100vh` fallback), no outer modal padding, and no horizontal overflow.
- Keep the bottom tool navigation fixed to the viewport, centered using viewport coordinates, and do not hide it when opening a tool view.
- Tool headers share one mobile size: `128px` high, `16px` padding, `40px` icon, and a close button of at least `32px`. Keep title and description aligned and readable within this fixed header.
- Scroll the view's content region, not the page/body or outer modal. Use `min-height: 0` and `overscroll-behavior: contain` for flex scroll regions.
- All mobile tool views use the same open/close animation through `openToolModal()` and `closeToolModal()` in `js/ui/tool-modal.js`: fade with a subtle vertical slide (no scale or horizontal translation) so transitions remain visible without shifting the layout sideways.
- Forms use a single column for full-width fields and two columns only for short, paired values. Keep labels above fields.
- Mobile action buttons are compact and consistent: about `40px` high, `12px` text, `8px 12px` padding. Keep actions grouped, allow wrapping only on very narrow screens, and do not stretch the primary action across the entire remaining row.
- The light-theme sky dome uses a dark-center-to-light-horizon gradient, with dark chart lines for contrast. Keep the collapsed active-location pin white on its colored gradient background; preserve the semantic accent color of the Events icon.
- On touch-only devices, mobile tool navigation buttons do not retain hover/pressed background fills after activation.
- Respect safe-area insets on devices with display cutouts/home indicators.

## 7. Responsive and accessibility rules

- The project mobile breakpoint is `640px`; use the existing breakpoint unless there is a measured reason to add another.
- Support reduced motion (`prefers-reduced-motion`) and retain visible keyboard focus.
- Icon-only controls require an accessible Vietnamese `aria-label`; a `title` may supplement but does not replace it.
- Test at least `320px`, `390px`, and a desktop viewport when changing shared tool/modal UI.
- Verify no horizontal overflow, clipped controls, text overlap, or layout shifts during open/close animations.

## 8. Source of truth

- Theme colors: `assets/css/tokens.css`.
- Layout primitives: `assets/css/layout.css`.
- Components and responsive behavior: `assets/css/components.css`.
- Markup and accessibility labels: `index.html`.
- If this document and implementation differ, follow the tokens/current shared component pattern and update this document when the intended design system changes.
