# Tiến Độ Dự Án & Lộ Trình (Cập nhật cho các phiên sau)

> Tài liệu này ghi rõ những gì **Đã làm**, **Chưa làm**, và **Dự định sẽ làm** để phiên làm việc tiếp theo nắm bắt ngay trạng thái thực tế của `StarWatch`.

## 1. Đã làm (Phiên hiện tại — UI Clone 100% + Nối Luồng Web & Mobile)

- **Khởi tạo khung dự án đa nền tảng**:
  - Thiết lập Expo Router + React Native Web + NativeWind v4 + TypeScript strict (`app.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `tsconfig.json`).
  - Tích hợp font tiếng Việt chuẩn Unicode (`Plus Jakarta Sans` & `JetBrains Mono`) trên cả Web (`app/+html.tsx`) và Native (`app/_layout.tsx`).
- **Xây dựng Design System chuẩn Figma (`#25:31251`)**:
  - Đầy đủ 3 Theme: **Đêm (`dark`)**, **Ngày (`light`)**, **Đỏ (`red`)** trong `src/design-system/tokens/colors.ts` và `ThemeContext.tsx`.
  - Bộ primitive tái sử dụng: `SurfaceCard`, `StatusPill`, `ActionButton`, `SegmentedControl`, `ScoreRing` (animated 0→target), `HoldToConfirmButton` (nhấn giữ 2s), `ToastBanner`, `StarWatchLogo`, `AppIcon`.
- **Clone giao diện Web Desktop (`1440px`) & Mobile (`393px`)**:
  - Hoàn thiện 100% màn hình chính (`DesktopShell` & `MobileShell`) cùng toàn bộ **10 Overlay Desktop** và **11 Màn hình Mobile** với dữ liệu tiếng Việt chuẩn Figma.
  - Nối đầy đủ luồng tương tác: chuyển Theme, Play/Pause & kéo Timeline 18:00–06:00, bật/tắt 3 lớp GIS & đổi 4 nền bản đồ, điều khiển Vòm trời 3D (`Vòm 2D`/`Mặt Đất 3D`/`Quả Cầu 3D`, `Xoay`, `Về tâm`, Zoom, Toàn màn hình), tìm kiếm & thêm điểm săn ảnh mới, áp dụng lịch thiên văn, đổi ngưỡng cảnh báo đọng sương `ΔT`, tính thông số máy ảnh/điện thoại theo tiêu cự.
- **Tài liệu & Kiểm thử cơ bản**:
  - Viết bộ `.md` tiếng Việt (`README.md`, `AGENTS.md`, `docs/DESIGN_SYSTEM.md`, `docs/ARCHITECTURE.md`, `docs/PROGRESS.md`, `docs/CHANGELOG.md`).
  - Viết unit test logic (`tests/starwatch.test.mjs`).

## 2. Chưa làm (Ngoài phạm vi clone UI tĩnh/mô phỏng ban đầu)

- **Kết nối API thời tiết & thiên văn thực (Live Backend / API)**:
  - Chưa nối Open-Meteo / Windy / ClearOutside API để lấy dữ liệu mây 3 tầng, nhiệt độ, điểm sương theo thời gian thực (hiện đang dùng dữ liệu mô phỏng chuẩn từ Figma).
  - Chưa tích hợp công thức thiên văn thiên thể thực tế (Astronomy Engine / Ephemeris) theo vị trí GPS và ngày giờ động.
- **Bản đồ GIS Tile thực tế & Engine 3D WebGL/Canvas**:
  - Bản đồ GIS hiện dùng SVG vector tái hiện chính xác 4 profile màu & overlay của Figma; chưa gắn thư viện tile trực tuyến (`react-native-maps` / `Leaflet` / `MapLibre`) với dữ liệu Light Pollution tiles thực.
  - Vòm trời 3D hiện dùng SVG vector tương tác (xoay/zoom/chuyển 3 chế độ); chưa nâng cấp lên `Three.js` / `expo-gl` render hàng nghìn ngôi sao thực.
- **Lưu trữ bền vững & Cảm biến thiết bị**:
  - Chưa nối `AsyncStorage` để lưu cài đặt Theme, danh sách điểm mới đóng góp, điểm yêu thích qua các lần tải lại trang.
  - Chưa gắn `expo-location` (GPS thực) và `expo-sensors` (la bàn con quay hồi chuyển trên Android/iOS).
- **Build & Test trên thiết bị thật Android/iOS**:
  - Phiên này tập trung kiểm chứng `tsc`, unit test và render trực tiếp trên trình duyệt Web (Desktop 1440px & Mobile 393px); chưa chạy build APK/IPA trên Android Emulator hoặc iOS Simulator.

## 3. Dự định sẽ làm (Lộ trình các phiên tiếp theo)

### Phase 2 — Tích hợp Dữ liệu Thực & Lưu trữ Local
1. Cài `@react-native-async-storage/async-storage` để lưu Theme, Settings, danh sách điểm đóng góp và mục tiêu ưa thích.
2. Tích hợp `astronomy-engine` tính toán chính xác độ cao Alt/Az của Mặt Trời, Mặt Trăng, Tâm Ngân Hà và các mục tiêu Messier theo từng phút & tọa độ GPS.
3. Kết nối API thời tiết (Open-Meteo) lấy dự báo mây Cao/Trung/Thấp, nhiệt độ, điểm sương 48 giờ tới cho 15+ địa điểm Việt Nam.

### Phase 3 — Bản đồ Thực & Cảm biến Mobile
1. Tích hợp bản đồ tile đa nền thực tế (Leaflet trên WebView/Web + `react-native-maps` hoặc `MapLibre` trên Native) kèm lớp overlay ô nhiễm ánh sáng VIIRS.
2. Tích hợp `expo-location` và `expo-sensors` (Magnetometer/Gyroscope) cho chế độ AR/Vòm trời 360° ngoài thực địa trên Android/iOS.

### Phase 4 — Tài khoản Đám mây & Phát hành
1. Kết nối backend đồng bộ điểm săn ảnh cộng đồng (upload ảnh hiện trường, duyệt địa điểm).
2. Thiết lập EAS Build tạo bản thử nghiệm Android (`.apk`) và iOS TestFlight.

## 4. Kết quả kiểm thử & xác minh (Cập nhật sau build cuối v1.3.0-fullstack)

- `npx tsc --noEmit`: thoát mã 0 (**0 lỗi** TypeScript strict trên cả `app/`, `src/` và `server/`).
- `npm test` (`node --test tests/*.test.mjs`): **15/15 passed** (kiểm tra theme, spots, backend astronomy/ephemeris, ước tính Bortle, NPF advisor & gear preview, lịch tháng 11/2026, Full-bleed Logo, Leaflet Map, Three.js 3D, Account & Camera Profile overlays).
- `npx expo export --platform web` (chế độ `"output": "single"`, `EXPO_NO_TELEMETRY=1`): thoát mã 0, đóng gói 3088 modules (bao gồm `three` và `leaflet`) vào `dist/`.
- **Kiểm tra backend & trình duyệt trực tiếp (`http://127.0.0.1:8787` + `http://127.0.0.1:4173`)**:
  - **0 lỗi console / 0 lỗi mạng nội bộ** (`127.0.0.1:8787` trả HTTP 200 cho `/v1/health`, `/v1/spots`, `/v1/observation`, `/v1/map/inspect`, `/v1/advisor/setup`, `/v1/calendar`, `/v1/auth/register`, `/v1/me`, `/v1/me/plan`).
  - **Bản đồ GIS Leaflet (`GisMapCanvas.web.tsx`)**: nạp nền bản đồ thực (`Vệ Tinh`, `Astro Dark`, `Esri Dark`, `Topo Độ Cao`), chuyển đổi layer, hiển thị vòm ô nhiễm sáng + vùng mây + tia phương vị và click bản đồ để soi tọa độ Bortle/SQM từ backend.
  - **Three.js 3D WebGL (`SkyThreeCanvas.web.tsx`)**: render `<canvas>` WebGL cho cả `Mặt Đất 3D` (`TÂY`, `BẮC 0°`, `ĐÔNG`, `Sgr A*`, `Sao Thổ`, `Trăng`, `Antares`) và `Quả Cầu 3D` (`+90° Thiên đỉnh`, `-90° Thiên đế`, `Mặt Trời`, `Sgr A*`, nút `Di chuyển`) trên cả Desktop `1440×900` và Mobile `393×852`.
  - **Tài khoản & Máy ảnh**: luồng đăng ký → sửa thông tin → Upgrade lên `PRO` → Downgrade về `FREE` → Upgrade lại `PRO`, cùng chọn/nhập máy ảnh (`Nikon Z8` + `Sigma 14mm f/1.4 Art`) với tính NPF trực tiếp trước khi bấm `Lưu hồ sơ máy ảnh` hoạt động chuẩn.
  - *Chưa kiểm tra thực tế*: chạy trực tiếp trên Android Emulator / iOS Simulator.
