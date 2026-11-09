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

### Bortle Scale Dynamic Palette (5 Tiers: Green → Red)

Mọi vị trí hiển thị cấp độ ô nhiễm sáng Bortle (1–9) trên giao diện tuân theo dải màu động chuyển tiếp từ Xanh lá cây (chỉ số thấp, trời tối lý tưởng) sang Đỏ (chỉ số cao, nội đô ô nhiễm nặng):

| Cấp Bortle | Tên cấp độ | Nhóm màu | Màu Text (`.bortle-text--tier-*`) | Màu Nền Badge (`.bortle-badge--tier-*`) | Màu Viền Badge | Dấu chấm (`.bortle-dot--tier-*`) |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **1.0 – 3.0** | **Rất tối** *(Lý tưởng)* | **Xanh lá cây (Emerald)** | `#34d399` / Light `#047857` | `rgba(16, 185, 129, 0.15)` | `rgba(52, 211, 153, 0.35)` | `#34d399` / Light `#059669` |
| **3.1 – 4.2** | **Tối** *(Khá tốt)* | **Xanh mạ chanh (Lime)** | `#a3e635` / Light `#4d7c0f` | `rgba(132, 204, 22, 0.15)` | `rgba(163, 230, 53, 0.35)` | `#a3e635` / Light `#65a30d` |
| **4.3 – 5.5** | **Trung bình** *(Ngoại ô)* | **Vàng tươi (Yellow)** | `#facc15` / Light `#a16207` | `rgba(234, 179, 8, 0.15)` | `rgba(250, 204, 21, 0.35)` | `#facc15` / Light `#ca8a04` |
| **5.6 – 7.0** | **Sáng** *(Ven đô thị)* | **Cam (Orange)** | `#fb923c` / Light `#c2410c` | `rgba(249, 115, 22, 0.15)` | `rgba(251, 146, 60, 0.35)` | `#fb923c` / Light `#ea580c` |
| **7.1 – 9.0** | **Sáng rực** *(Nội đô)* | **Đỏ (Red)** | `#f87171` / Light `#b91c1c` | `rgba(239, 68, 68, 0.18)` | `rgba(248, 113, 113, 0.4)` | `#f87171` / Light `#dc2626` |

- **Dạng ô Badge/Pill**: Nền mờ + Viền + Chữ đổi màu đồng bộ theo dải Bortle của địa điểm (Hình 1: Thẻ địa điểm Danh bạ / Tìm kiếm; Hình 2: `[ Bầu trời: Bortle X.X ]` trong Setup Advisor).
- **Dạng chữ + Dot**: Chấm tròn và chuỗi văn bản `Bortle X.X (Cấp độ)` đổi màu đồng bộ (Hình 3: Active Spot Bar telemetry, popup bản đồ, lịch thiên văn).

## 3. Typography & Type Scale Specification

- Primary UI font: **Inter**. Use **JetBrains Mono** for coordinates, astronomical angles, timestamps, API keys, and other technical/tabular values.
- Mọi thẻ workspace trên website (Bản Đồ, Vòm Thiên Đỉnh 360°, Lịch Thiên Văn Trong Ngày, Ma Trận Phân Tầng Mây, Hướng Dẫn Setup Chụp Thiên Văn, Địa Điểm Săn Ảnh) phải tuân theo bảng quy chuẩn cỡ chữ đồng bộ dưới đây, không dùng cỡ chữ tự do hoặc chênh lệch giữa các thẻ:

| Thành phần UI | Desktop (`≥ 640px`) | Mobile (`< 640px`) | Font weight & Kiểu | Class quy chuẩn / Màu sắc |
| --- | --- | --- | --- | --- |
| **Tiêu đề Modal / View** | `16px` (`1rem`) | `15px` (`0.9375rem`) | Bold (`700`), line-height `1.3` | `.tool-modal__title` / `#f8fafc` |
| **Tiêu đề Thẻ chính (`H3`)** | `15px` (`0.9375rem`) | `14px` (`0.875rem`) | Bold (`700`), line-height `1.35` | `.card-heading` / `#ffffff` |
| **Mô tả phụ dưới thẻ (`P`)** | `12px` (`0.75rem`) | `11px` (`0.6875rem`) | Regular (`400`), line-height `1.45` | `.section-description` / `#94a3b8` |
| **Tiêu đề Thẻ con / Khối nhỏ (`H4`)** | `11px` (`0.6875rem`) | `11px` (`0.6875rem`) | Bold (`700`), uppercase tracking-wider | `.subcard-heading` / `#cbd5e1` |
| **Chỉ số dữ liệu chính (Metric)** | `15px` (`0.9375rem`) | `14px` (`0.875rem`) | Bold (`700`), font-mono | `.metric-value` / Accent/Theme color |
| **Nút bấm & Tab hành động** | `12px` (`0.75rem`) | `11px` (`0.6875rem`) | Medium (`500`), line-height `1.2` | `.btn`, `.tab-btn` / Dynamic state |
| **Preset Chips & Filter Pills** | `11px` (`0.6875rem`) | `11px` (`0.6875rem`) | Medium (`500`), line-height `1.2` | `.chip-btn`, `.region-filter-btn` |
| **Tag phân loại / Badge AI** | `10px` (`0.625rem`) | `10px` (`0.625rem`) | Semibold, uppercase font-mono tracking-wider | `.badge-tag` / Viền bán trong suốt |
| **Micro Caption / Gợi ý dưới metric** | `10px` (`0.625rem`) | `10px` (`0.625rem`) | Regular (`400`), line-height `1.2` | `.micro-caption` / `#94a3b8` |

- Quy tắc hiển thị tiếng Việt & Tương thích Mobile:
  - Giữ nguyên tiếng Việt với đầy đủ dấu thanh trong toàn bộ UI; không cắt ngắn hoặc làm mất dấu.
  - Không thu nhỏ nhãn chữ dưới `10px`.
  - Trên mobile, với các thanh công cụ chật hẹp (như 3 nút toggle layer bản đồ: Ô nhiễm sáng, Mây mô phỏng, Tia phương vị), dùng nhãn ngắn gọn (`sm:hidden` vs `hidden sm:inline`) và chia layout dạng grid 3 cột đều (`repeat(3, minmax(0, 1fr))`) vừa khít 1 hàng, tuyệt đối không để cuộn ngang (roll ngang).
  - Nút bật/tắt layer bản đồ phải có hiệu ứng nhận diện thị giác rõ rệt: Khi BẬT (active) có nền màu phủ chủ đề, viền sáng rõ và đổ bóng phát quang (glow); khi TẮT (inactive) chuyển về nền tối mờ (`bg-slate-900/60`), viền chìm (`border-slate-800`), chữ màu xám (`text-slate-500`) và icon mờ 50%.
  - Mô tả phụ `.section-description` có vạch viền dọc tinh tế bên trái (`border-left: 2px solid rgba(148, 163, 184, 0.35)`), thụt vào `8px`.

## 4. Shared spacing, shape, and controls

- Use a consistent spacing rhythm based on `4px`: `4, 8, 12, 16, 20, 24px`.
- Layout scale lives in `assets/css/tokens.css` as `--space-1…6`, `--radius-sm…xl`, `--shell-max`, `--shell-pad`, `--header-h` and `--z-chrome`; prefer these over new one-off values.
- Page content uses one centred frame, `.page-shell`, instead of repeating `max-width` and horizontal padding utilities on header, sections, main and footer.
- Cards: `12–16px` radius, subtle one-pixel slate border, low-contrast surface. Avoid stacking multiple heavy shadows.
- Buttons: `8–12px` radius, clear hover/focus/active states, concise labels, and consistent sizing within a component.
- Standard desktop controls are generally `36–40px` high. Mobile tap targets should be at least `40px`; use `44px` where space permits.
- Avoid `flex-grow` on a single action when it makes that button disproportionately wide. Use intrinsic sizing or balanced equal-width actions.
- Inputs should have clear labels, dark/light theme-aware surfaces, and visible focus borders. Technical values use monospace.
- Use the internal SVG sprite in `assets/icons/sprite.svg` through `js/ui/icons.js`; keep icons centered, accessible, and undistorted.
- Desktop tool navigation icons use a consistent 14px box; their SVG artwork should use the full viewBox so icons look equally sized.
- The mobile bottom tool navigation (`#mobileToolNav`) uses centered 22px icons with compact labels, floating fixed at `z-index: 2500` above all viewports and modal dialogs. Active tabs are indicated by a smooth sliding indicator pill (`.mobile-nav-indicator`) that glides seamlessly between buttons with a cubic-bezier transition, maintaining a calm, fluid navigation experience.
- All `.tool-modal` dialogs on mobile stop above the tab bar via bottom padding (`calc(5.5rem + env(safe-area-inset-bottom))` for general scroll bodies). Modals with a pinned bottom footer (such as `#modalUserGuide .tool-modal__footer`) use `padding-bottom: calc(5.75rem + env(safe-area-inset-bottom))` and `gap: 0.75rem` (`12px`), guaranteeing an exact 1:1 symmetrical `12px` Auto-Layout balance between the tip card (`.guide-footer-tip`), the primary action button (`#btnAcknowledgeGuide`), and the top of `#mobileToolNav`. Tool view headers are kept minimal and concise without secondary subtitle text under the titles, ensuring vertical centering and compact clarity across mobile and desktop.
- Keep the StarWatch logo consistent across the header, app-information view, and favicon by using the `starwatch-mark` glyph and its violet-indigo-cyan gradient treatment.
- Dynamic status badges should keep fixed dimensions and wrap their text within the allocated space so changing status copy does not reflow adjacent content.
- Universal Search Dropdown (`.search-dropdown`): uses an opaque background (`rgba(15, 23, 42, 0.98)` dark / `#ffffff` light) with backdrop blur, subtle violet border glow, and `z-index: 100` within `.app-header` (`z-index: 40`, positioned above `.spot-bar` `z-index: 20`). Auto-Layout results structure: `.search-dropdown__section` (sticky category header), `.search-dropdown__item` (flex row with left `.search-dropdown__item-main` flex-1 column for icon, title and address with ellipsis, and right `.search-dropdown__item-meta` shrink-0 for dynamic Bortle badge and elevation).
- Destructive actions use the shared press-and-hold component instead of a browser `confirm()` dialog: `.hold-confirm` (CSS, `assets/css/components.css`) + `attachHoldToConfirm()` (`js/ui/hold-confirm.js`). Resting state is the tinted action surface, `.is-holding` sweeps `--hold-confirm-color` left to right with the `hold-confirm-sweep` animation over `--hold-confirm-duration` (default `1100ms`), and `.is-complete` shows the solid colour with `--hold-confirm-glow`. Reuse the gesture by overriding only those three custom properties — never fork the keyframes. The control must sit in a fixed-height row so switching modes never reflows the grid: `.spot-card-actions` + `.spot-card-forecast` and `.btn-delete-spot-action` are `32px` (`2rem`) tall, `36px` (`2.25rem`) on mobile.
- The terminal action of a tool view may also use the gesture: `#btnAcknowledgeGuide` ("Đã hiểu · Nhấn giữ") fills green (`#22c55e`, `1200ms`) before closing the Cẩm Nang, so a stray tap cannot dismiss the guide. Tool views cache their DOM, therefore `openToolModal()` / `closeToolModal()` call `resetHoldConfirmWithin()` so a completed (green) button never persists into the next open.

## 5. Desktop layout (`min-width: 640px`)

- Preserve the current desktop page layout and existing modal dimensions unless a task explicitly asks to change them.
- The header and the active spot bar share one sticky frame (`#appChrome`, `.app-chrome`); do not add a second sticky offset to either child.
- Desktop tool labels are shown from `1280px`; between `640px` and `1279px` the header tools and spot-bar scores collapse to icon/number density so the bar stays on one row.
- The map + sky dome workspace is a single column below `1024px`. From `1024px` it becomes a `7/5` split (map / dome + ephemeris) and from `1440px` a `8/4` split, so the dome keeps a usable width on large screens.
- The master time panel uses a structured 2-row Auto-Layout frame on desktop (min-width: 640px): Row 1 spans the date picker and 5 astronomical jump preset pills on a single horizontal row with a subtle bottom divider; Row 2 houses playback controls, a full-width scrubbing slider (Fill container), and the celestial target selector on the right edge.
- Tool modals are centered, bounded in width, and use the existing liquid-glass treatment, rounded corners, and dark translucent backdrop.
- Keep desktop tool headers content-sized with a horizontal title, icon, supporting text, and close action.
- Desktop navigation is inline; do not apply mobile full-screen modal or fixed bottom navigation rules.
- Desktop forms may use two-column field groups when the fields are related and there is sufficient width.
- All workspace cards (Map, Sky Dome, Weather Matrix, Gear Advisor, Spots Directory) follow unified Auto-Layout hierarchy: headers split into Left (Title & description) and Right (Actions/Selectors); multi-element toolbars and filter groups use non-wrapping horizontal ribbons on mobile; child parameter and metric cards use uniform heights and flex column distribution with `min-w-0`. In the Astronomical Events Calendar (`#modalAstroCalendar`), event cards (`.astro-event-card`) stretch to 100% height per row on desktop with balanced title (`min-height: 2.625rem`) and description baselines, ensuring paired cards remain completely symmetrical.

## 6. Mobile layout (`max-width: 639px`)

- Mobile tool views use a full-viewport surface (`100dvh` with `100vh` fallback), no outer modal padding, and no horizontal overflow.
- The mobile header and active spot bar sit inside the same `.app-chrome` sticky frame as desktop; anchor jumps use `--chrome-h`, kept in sync with the real bar height, instead of fixed rem offsets.
- The mobile header is one row: brand on the left and a search icon on the right. Search lives in a fixed overlay panel below the header (input, GPS and close action); it must not change header height or push page content.
- The mobile active spot bar is a compact `48px` row. Telemetry, score pills and spot actions open as an overlay panel below the bar, so expanding the bar never increases chrome height or shifts the page.
- Bottom-navigation labels are real text in `index.html`; do not generate them with `::after` content. Use short labels (`Địa điểm`, `Sự kiện`, `Đóng góp`, `Hướng dẫn`, `Cài đặt`).
- Keep the bottom tool navigation fixed to the viewport, centered using viewport coordinates, and do not hide it when opening a tool view.
- Tool headers share one mobile size: `128px` high, `16px` padding, `40px` icon, and a close button of at least `32px`. Keep title and description aligned and readable within this fixed header.
- Scroll the view's content region, not the page/body or outer modal. Use `min-height: 0` and `overscroll-behavior: contain` for flex scroll regions.
- All mobile tool views use the same open/close animation through `openToolModal()` and `closeToolModal()` in `js/ui/tool-modal.js`: fade with a subtle vertical slide (no scale or horizontal translation) so transitions remain visible without shifting the layout sideways.
- Forms use a single column for full-width fields and two columns only for short, paired values. Keep labels above fields.
- Mobile action buttons are compact and consistent: about `40px` high, `12px` text, `8px 12px` padding. Keep actions grouped, allow wrapping only on very narrow screens, and do not stretch the primary action across the entire remaining row.
- The master time controller (`#masterTimeLayout`) on mobile (`< 640px`) uses a compact 3-group Auto-Layout stack (~200px height): Group 1 (date picker full-width + horizontal scroll ribbon for preset chips with `overflow-x: auto; flex-wrap: nowrap`), Group 2 (CSS Grid with fixed play button, centered time & phase readout, hug-content speed selector, and full-width scrubbing slider underneath), Group 3 (single-line horizontal row for celestial object selector with label Hug and select Fill). Dividers use subtle 1px border lines.
- Astronomical Events Calendar modal (`#modalAstroCalendar`) on mobile: uses a single-row non-wrapping horizontal ribbon (`.cal-filter-ribbon` with `overflow-x: auto; scrollbar-width: none`) for category filter tabs, avoiding multi-row chip wrapping; event cards (`.astro-event-card`) use Auto-Layout header (category badge + compact date/time pill), unified type scale, single-line clean section header `📍 Điểm săn ảnh lý tưởng` (replaces long breaking all-caps text), and 36px touch-target location jump buttons (`.cal-jump-spot-btn`) with dynamic 5-tier Bortle scale indicators.
- The light-theme sky dome uses a dark-center-to-light-horizon gradient, with dark chart lines for contrast. Keep the collapsed active-location pin white on its colored gradient background; preserve the semantic accent color of the Events icon.
- On touch-only devices, mobile tool navigation buttons do not retain hover/pressed background fills after activation.
- Respect safe-area insets on devices with display cutouts/home indicators.

## 7. Responsive and accessibility rules

- The project mobile breakpoint is `640px`; use the existing breakpoint unless there is a measured reason to add another.
- Layout breakpoints in use: `640px` (mobile → tablet), `1024px` (single column → map/side workspace, time panel 2 columns), `1280px` (full tool labels), `1440px` (workspace `8/4`, time panel 3 columns).
- Support reduced motion (`prefers-reduced-motion`) and retain visible keyboard focus.
- Icon-only controls require an accessible Vietnamese `aria-label`; a `title` may supplement but does not replace it.
- Test at least `320px`, `390px`, and a desktop viewport when changing shared tool/modal UI.
- Floating map widgets live in one `.map-overlays` layer so their stacking and spacing stay consistent; keep the layer `pointer-events: none` and opt individual widgets back in.
- Tool modals share one semantic shell structure: `.tool-modal` (overlay), `.tool-modal__panel` (dialog), `.tool-modal__header` (tool-screen-header), `.tool-modal__body` (flex scroll region with `overscroll-behavior: contain`), and optional `.tool-modal__footer`.
- Curated spots directory uses `.spots-grid` with `repeat(auto-fill, minmax(260px, 1fr))` on desktop to fluidly fill available space, and a 2-column flex-height layout on mobile.
- Weather matrix uses `border-separate border-spacing-0` and `.matrix-row-label` (`position: sticky; left: 0; z-index: 20`) with a solid background and right divider shadow to ensure pinned row labels during horizontal scrolling across all themes.
- Verify no horizontal overflow, clipped controls, text overlap, or layout shifts during open/close animations.

## 8. Source of truth

- Theme colors: `assets/css/tokens.css`.
- Layout primitives: `assets/css/layout.css`.
- Components and responsive behavior: `assets/css/components.css`.
- Markup and accessibility labels: `index.html`.
- If this document and implementation differ, follow the tokens/current shared component pattern and update this document when the intended design system changes.
