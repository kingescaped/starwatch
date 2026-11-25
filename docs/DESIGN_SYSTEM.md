# Design System StarWatch (Chuẩn Figma `25:31251` · v1.2.0)

Tài liệu này tổng hợp toàn bộ 9 Zone từ trang `Design System & Icons` trên Figma để mọi phiên sau tham chiếu trực tiếp mà không cần mở lại Figma.

## Zone 01 — Bảng màu 3 Giao diện (`src/design-system/tokens/colors.ts`)

| Token | Theme Đêm (`dark`) | Theme Ngày (`light`) | Theme Đỏ (`red`) |
| --- | --- | --- | --- |
| `bg` | `#05070D` | `#F1F5F9` | `#050000` |
| `card` | `#0C1428` | `#FFFFFF` | `#180304` |
| `glass` | `rgba(14, 24, 50, 0.82)` | `rgba(255, 255, 255, 0.92)` | `rgba(32, 5, 7, 0.88)` |
| `textPrimary` | `#F1F5FC` | `#0F172A` | `#FF6B6B` |
| `textSecondary` | `#9BAAC0` | `#475569` | `#DE4646` |
| `accentCyan` | `#38BDF8` | `#0284C7` | `#F43F5E` |
| `accentViolet` | `#818CF8` | `#6D28D9` | `#F43F5E` |
| `accentAmber` | `#FBBF24` | `#B45309` | `#F87171` |
| `accentEmerald` | `#10B981` | `#047857` | `#F87171` |
| `accentRose` | `#F43F5E` | `#B91C1C` | `#EF4444` |
| `borderSubtle` | `rgba(255, 255, 255, 0.10)` | `rgba(148, 163, 184, 0.40)` | `rgba(239, 68, 68, 0.25)` |

### Thang Spacing (4pt / 8pt) & Bo góc
- **Spacing**: `space/1 = 4px`, `space/2 = 8px`, `space/3 = 12px`, `space/4 = 16px`, `space/5 = 20px`, `space/6 = 24px`, `space/8 = 32px`, `space/12 = 48px`.
- **Corner Radius**: `sm = 4px`, `md = 8px`, `lg = 12px`, `xl = 16px`, `2xl = 20px`, `3xl = 24px`, `full = 999px`.

## Zone 02 — Typography & Hỗ trợ Tiếng Việt UTF-8
- **Font chính**: `Plus Jakarta Sans` (fallback `Inter`) cho tiêu đề, nút, thẻ, nhãn.
- **Font thiên văn**: `JetBrains Mono` cho tọa độ GPS, Bortle, Az/Alt, GMT+7, NPF, mã màu.
- **Thang chữ 8 cấp**: Display `32px` (LH 38), H1 `20px` (LH 26), H2 `16px` (LH 22), H3 `14px` (LH 20), Body `13px` (LH 19), Body Small `12px` (LH 17), Caption `11px` (LH 15), Mono Telemetry `11–16px`.

## Zone 03 — Nhận diện & Icon (`src/design-system/icons/`)
- **Logo**: Squircle gradient Cyan → Violet (`StarWatchLogo.tsx`), phiên bản Red-Vision dùng gradient Đỏ thẫm.
- **Icon**: Chuẩn nét mảnh `1.8px`, kích thước cơ sở `24×24`, map thống nhất qua `AppIcon.tsx` (`lucide-react-native`).

## Zone 04–06 — Component Primitives (`src/design-system/primitives/`)
- `SurfaceCard`, `StatusPill`, `ActionButton` (Primary/Secondary/Ghost/Danger), `SegmentedControl`, `ScoreRing` (animation đếm 0→target trong 900ms), `HoldToConfirmButton` (nhấn giữ 2,000ms), `ToastBanner`.

## Zone 07 — Responsive Grid & Breakpoints
- **Desktop (`>= 1024px`)**: Chuẩn `1440px`, margin `48px`, gutter `24px`, max-content `1344px`. Độ rộng Modal: `440px` (Cài đặt, Thông tin, Mục tiêu, Soi tọa độ), `520px` (Khung giờ vàng), `640px` (Đóng góp), `740px` (Điểm săn ảnh, Hướng dẫn), `780px` (Lịch thiên văn), `1260px` (3D Toàn màn hình).
- **Tablet (`768–1023px`)**: Margin `32px`, gutter `16px`.
- **Mobile (`< 768px`)**: Chuẩn `393 × 852px`, margin `16px`, gutter `12px`, điều hướng Bottom Tab Bar 5 tab + Sub-screen có nút `< Quay lại`.

## Zone 08–09 — Animation & Export Specs
- Theme switch: `0ms / 200ms` giữ nguyên vị trí cuộn trang.
- Modal / Sheet transition: `250ms–400ms`.
- Nút Đã Hiểu (Hướng Dẫn): `TOUCH_DOWN 2,000ms EASE_OUT`.
- Score Rings: `900ms` decelerating curve (`0 → 88 / 76 / 92`).
