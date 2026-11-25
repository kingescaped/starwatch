# StarWatch — Chạm vào Vũ Trụ · Bắt trọn Khoảnh Khắc Bầu Trời

Ứng dụng dự báo thiên văn, bản đồ ô nhiễm ánh sáng Bortle, giả lập vòm trời 360°/3D và tư vấn thiết lập chụp ảnh thiên văn (Milky Way, Tinh vân, Sao băng, Săn mây) được xây dựng bằng **React Native (Expo + Expo Router + NativeWind v4 + TypeScript)** chạy đồng bộ trên **Web, Android và iOS**.

## Tính năng hiện có (v1.2.0 UI Clone & Flow Wiring)

- **3 Giao diện quang học chuẩn Figma**: **Đêm** (Dark Cosmic `#05070D`), **Ngày** (Light Dawn `#F1F5F9`), **Đỏ** (Red-Vision `#050000` bảo vệ thị giác ban đêm).
- **Dashboard Quan Sát Desktop (`1440px`) & Mobile (`393px`)**:
  - Hero banner, thẻ điểm số quan sát với vòng tròn animated (`Ngân Hà 88`, `Ráng 76`, `Săn Mây 92`).
  - Thanh điều khiển thời gian thực (Play/Pause `10 phút/giây` & `60 phút/giây`, thanh trượt 18:00–06:00, nút `Khung giờ vàng`, chọn mục tiêu thiên thể).
  - Bản đồ GIS Việt Nam với 4 lớp nền (`Vệ Tinh`, `Astro Dark`, `Esri Dark`, `Topo Độ Cao`), bật/tắt `Ô nhiễm sáng`, `Mây mô phỏng`, `Tia phương vị` và chạm để soi tọa độ Bortle.
  - Vòm Thiên Đỉnh 360° & Giả Lập 3D (`Vòm 2D`, `Mặt Đất 3D`, `Quả Cầu 3D`, xoay 360°, zoom, biểu đồ độ cao 24h, lịch thiên văn trong ngày).
  - Ma trận phân tầng mây & điểm sương (`18:00–06:00`, cảnh báo `ΔT ≤ ngưỡng` tự động theo cài đặt).
  - Tư vấn thiết lập chụp thiên văn (Máy ảnh / Điện thoại, tiêu cự `14mm / 20mm / 24mm / 35mm`, 5 chế độ chụp).
  - Tổng hợp khung giờ `Đêm nay có gì?`.
- **Nối đầy đủ 10 Modal Desktop & 11 Màn hình Mobile**: Điểm săn ảnh (15 điểm Việt Nam, tìm kiếm `⌘K`), Đóng góp điểm mới, Lịch thiên văn tháng 11/2026 (Leonids), Hướng dẫn & Thang Bortle (nút nhấn giữ 2 giây), Tài khoản & Cài đặt, Thông tin ứng dụng, Chọn mục tiêu, Soi tọa độ, Khung giờ vàng, Giả lập 3D Toàn màn hình.

## Yêu cầu & Khởi chạy

- **Node.js** ≥ 18, **npm** ≥ 10
- Cài đặt dependencies: `npm install`

### Các lệnh chính

| Lệnh | Mục đích |
| --- | --- |
| `npm run web` | Chạy máy chủ dev Expo trên trình duyệt Web |
| `npm run android` | Mở ứng dụng trên Android Emulator / thiết bị |
| `npm run ios` | Mở ứng dụng trên iOS Simulator (macOS) |
| `npm run typecheck` | Kiểm tra kiểu TypeScript (`tsc --noEmit`) |
| `npm run test` | Chạy bộ unit test (`node --test tests/*.test.mjs`) |
| `npm run export:web` | Build bản static Web ra thư mục `dist/` |
| `npm run export:pages` | Build bản static Web cho GitHub Pages (`/starwatch`, kèm `.nojekyll` & `404.html`) |

## Triển khai Web (GitHub Pages & Cloudflare Workers)

- **Backend API (Cloudflare Workers)**: `https://starwatch-api.starwatch-lvq.workers.dev` (đồng bộ Firestore & Firebase Auth; đã bật CORS cho `https://*.github.io`).
- **Frontend Web (GitHub Pages)**: Tự động build và deploy qua [deploy-pages.yml](./.github/workflows/deploy-pages.yml) mỗi khi push lên nhánh `main` bằng lệnh `npm run export:pages`.

### Điều kiện tiên quyết để Pages & Google Sign-In hoạt động

1. **Bật GitHub Pages bằng GitHub Actions**: vào **Settings → Pages → Build and deployment → Source** trên GitHub repo và chọn **GitHub Actions** ([cài đặt Pages](https://github.com/kingescaped/starwatch/settings/pages)).
2. **Thêm Secret cho Firebase Web API Key**: tạo file cấu hình theo mẫu [.env.example](./.env.example), rồi vào **Settings → Secrets and variables → Actions → New repository secret** ([cài đặt Secrets](https://github.com/kingescaped/starwatch/settings/secrets/actions)) và thêm secret `EXPO_PUBLIC_FIREBASE_API_KEY` nếu muốn nút đăng nhập Google hoạt động trên bản build Pages (không commit key vào repo).
3. **Bật nhà cung cấp Google & tên miền trên Firebase Console**: mở [Firebase Console (`starwatch-fa50a`)](https://console.firebase.google.com/project/starwatch-fa50a/authentication/providers), bật **Google** trong **Authentication → Sign-in method**, và đảm bảo `kingescaped.github.io` nằm trong danh sách **Authorized domains** (cùng cài đặt trong [Authentication Settings](https://console.firebase.google.com/project/starwatch-fa50a/authentication/settings)).

## Tài liệu chi tiết cho các phiên sau

- [AGENTS.md](./AGENTS.md) — Quy ước nhanh & lưu ý kỹ thuật cho AI/Dev khi vào phiên mới
- [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) — Bảng Design System đầy đủ 9 Zone từ Figma
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Kiến trúc thư mục, state và sơ đồ nối màn hình Web/Mobile
- [docs/PROGRESS.md](./docs/PROGRESS.md) — **Đã làm / Chưa làm / Dự định sẽ làm**
- [docs/CHANGELOG.md](./docs/CHANGELOG.md) — Lịch sử thay đổi
