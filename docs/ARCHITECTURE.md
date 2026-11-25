# Kiến trúc Dự án & Sơ đồ Nối Màn Hình

## 1. Cấu trúc thư mục

```text
e:\starwatch-new
├── app/
│   ├── +html.tsx                # Khai báo font Google Tiếng Việt & title Web
│   ├── _layout.tsx              # Nạp font, CSS NativeWind, ThemeProvider, AppStateProvider
│   └── index.tsx                # Điểm vào chính: rẽ nhánh DesktopShell / MobileShell
├── server/
│   ├── .env                     # Biến môi trường Backend (Firebase Admin, Web API key, Open-Meteo)
│   └── src/
│       ├── domain/              # time.ts, coordinates.ts, sunMoon.ts, planets.ts, bortle.ts, ephemeris.ts, scoring.ts, calendar.ts
│       ├── integrations/        # openMeteo.ts, firebaseAuth.ts, googleAuth.ts, firestore.ts, localStore.ts
│       ├── routes/              # observationRoutes.ts, accountRoutes.ts
│       └── index.ts             # Máy chủ Node HTTP API (http://127.0.0.1:8787)
├── src/
│   ├── design-system/
│   │   ├── tokens/              # colors.ts, spacing.ts, typography.ts, animations.ts
│   │   ├── theme/               # ThemeContext.tsx (3 theme Đêm / Ngày / Đỏ)
│   │   ├── icons/               # StarWatchLogo.tsx (tràn viền 64×64), AppIcon.tsx
│   │   └── primitives/          # SurfaceCard, StatusPill, ActionButton, ScoreRing, HoldToConfirmButton
│   ├── data/                    # spots.ts, targets.ts, forecast.ts, calendar.ts, advisor.ts, cameraCatalog.ts
│   ├── services/                # apiClient.ts (giao tiếp backend :8787 & lưu phiên cục bộ)
│   ├── hooks/
│   │   └── useResponsive.ts     # Breakpoints Web Desktop / Tablet / Mobile
│   ├── state/
│   │   ├── types.ts             # Kiểu dữ liệu toàn hệ thống
│   │   ├── useAuthStateController.ts # Quản lý đăng nhập, đăng ký, hồ sơ & đổi gói
│   │   └── AppStateContext.tsx  # State trung tâm đồng bộ Web & Mobile với backend
│   └── features/
│       ├── navigation/          # DesktopHeader.tsx, MobileBottomTabBar.tsx
│       ├── observation/         # LocationScoreCard, TimeControlBar, GisMapCanvas.web.tsx (Leaflet), SkyThreeCanvas.web.tsx (Three.js), CloudDewMatrixCard, AstroSetupCard, TonightSummaryCard
│       ├── overlays/            # ModalShell + 12 màn hình/overlay (bao gồm AccountOverlay & CameraProfileOverlay)
│       └── shells/              # DesktopShell.tsx, MobileShell.tsx
├── tests/
│   └── starwatch.test.mjs       # Unit test backend math, NPF, Leaflet/Three.js, Account & Camera overlays
└── docs/                        # Bộ tài liệu tiếng Việt cho các phiên tiếp theo
```

## 2. Sơ đồ Nối Màn Hình Chức Năng

### A. Trên Web Desktop (`DesktopShell`)
- Thanh `DesktopHeader` điều hướng:
  - `Bản đồ & Vòm trời` → Đóng overlay, quay về dashboard chính.
  - `Tìm điểm săn ảnh... ⌘K` hoặc `Điểm săn ảnh` → Mở `SpotsOverlay`.
  - `Đóng góp` → Mở `ContributeOverlay`.
  - `Lịch thiên văn` → Mở `CalendarOverlay`.
  - `Hướng dẫn` → Mở `GuideOverlay`.
  - `Tài khoản` → Mở `SettingsOverlay`.
  - Nút chuyển theme (`Ngày / Đêm / Đỏ`) → Đổi toàn bộ giao diện tức thì, giữ nguyên vị trí cuộn.
- Tương tác trên Dashboard:
  - Click pill Tọa độ trên `LocationScoreCard` hoặc click lên `GisMapCanvas` → Mở `InspectCoordsOverlay`.
  - Click pill `Bortle 3.5` / `An toàn sương` / `Xem hướng dẫn chống sương →` → Mở `GuideOverlay` đúng tab tương ứng.
  - Click pill `Khung giờ vàng: 22:30 - 02:15` → Mở `GoldenWindowOverlay` (từ đây bấm `Lên lịch & Thông số máy` nhảy timeline tới `00:00`, hoặc bấm `Xem dự báo chi tiết →` mở `CalendarOverlay`).
  - Click box `MỤC TIÊU THIÊN THỂ` → Mở `TargetPickerOverlay`.
  - Click `Toàn màn hình` trên `SkyDomeCard` → Mở `FullscreenSkyOverlay`.
  - Trong `SettingsOverlay`, click thẻ tài khoản → Mở `AccountOverlay` (Đăng nhập / Đăng ký khi chưa đăng nhập; Chỉnh sửa hồ sơ & Upgrade/Downgrade gói khi đã đăng nhập); click thẻ **Hồ sơ Máy ảnh & Ống kính** → Mở `CameraProfileOverlay`; click nút cuối danh sách → Mở `AboutOverlay`.

### B. Trên Mobile (`MobileShell` · 393px)
- Thanh `MobileBottomTabBar` (5 tab):
  1. `Quan sát` → Màn hình chính (Location pill bar + Score Card + Bản đồ GIS + Timeline + Vòm 3D + Ma trận Mây + Setup + Đêm nay có gì).
  2. `Địa điểm` → `SpotsOverlay (isMobileView)` → bấm `+ Đóng góp địa điểm mới` mở sub-screen `ContributeOverlay` (có nút `< Địa điểm` quay lại).
  3. `Lịch trời` → `CalendarOverlay (isMobileView)` → bấm `Áp dụng ngày này vào Dự báo` đồng bộ ngày và chuyển về `Quan sát`.
  4. `Hướng dẫn` → `GuideOverlay (isMobileView)` → giữ nút 2 giây đóng về `Quan sát`.
  5. `Tài khoản` → `SettingsOverlay (isMobileView)` → bấm hồ sơ `Vinh Quang Vo` mở sub-screen `AboutOverlay` (có nút `< Tài khoản` quay lại).
- Các sub-screen mở từ tab `Quan sát`: `TargetPickerOverlay`, `InspectCoordsOverlay`, `GoldenWindowOverlay`, `FullscreenSkyOverlay` — đều có header `< Quan sát` để quay về tab chính.
