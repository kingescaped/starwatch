# AGENTS.md — Quy ước dự án StarWatch

Đọc nhanh file này ở đầu mỗi phiên làm việc để nắm kiến trúc, lệnh kiểm tra và tránh lặp lại lỗi cũ.

## 1. Ngăn xếp kỹ thuật
- **Framework**: Expo + Expo Router (`app/`) + React Native Web + NativeWind v4 (`tailwind.config.js`, `global.css`) + TypeScript (`strict`).
- **Đồ họa vector**: `react-native-svg` + `lucide-react-native` + `expo-linear-gradient`.
- **Font tiếng Việt**: `Plus Jakarta Sans` (UI chính) & `JetBrains Mono` (tọa độ, Bortle, Az/Alt, GMT+7, NPF).

## 2. Lệnh kiểm tra bắt buộc sau khi sửa code
1. `npm run typecheck` (`npx tsc --noEmit`)
2. `npm test` (`node --test tests/*.test.mjs`)
3. `npm run export:web` (khi đụng tới cấu hình build, routing hoặc NativeWind/SVG)

## 3. Quy ước cấu trúc & code
- **Code & tên file dùng tiếng Anh**; **UI text & file `.md` dùng tiếng Việt**.
- **Giới hạn kích thước file**: ưu tiên < 200 dòng, tối đa 300 dòng; hàm < 40 dòng.
- **Một nguồn dữ liệu dùng chung**: toàn bộ state màn hình, timeline, bản đồ, vòm 3D và cài đặt đi qua `src/state/AppStateContext.tsx`; màu sắc 3 theme (`dark` / `light` / `red`) đi qua `useTheme()` (`src/design-system/theme/ThemeContext.tsx`). Không hardcode màu hex trực tiếp trong component giao diện.
- **Responsive**: `useResponsive()` tách `DesktopShell` (`>= 768px`, chuẩn thiết kế `1440px`) và `MobileShell` (`< 768px`, chuẩn thiết kế `393px`). Mọi tính năng mới phải nối luồng cho **cả Desktop Overlay lẫn Mobile Tab/Sub-screen**.

## 4. Lưu ý kỹ thuật đã gặp
- Trên Windows PowerShell 5.1 không hỗ trợ toán tử `&&`; luôn dùng `;` hoặc kiểm tra `$LASTEXITCODE`.
- Khi dùng `ModalShell`: trên Desktop hiển thị dạng Center Overlay có backdrop đóng; trên Mobile hiển thị toàn màn hình trong `MobileShell` giữ nguyên Bottom Tab Bar (riêng `SubScreen` có nút `< Quay lại`).
- Tránh gọi Figma REST API liên tục trên gói Starter (dễ gặp lỗi 429 rate-limit); bộ token & layout chuẩn đã được trích xuất vào `docs/DESIGN_SYSTEM.md` và `src/design-system/tokens/`.
