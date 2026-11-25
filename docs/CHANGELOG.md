# Lịch sử Thay đổi (Changelog)

## [1.3.0-fullstack] - 2026-11-25

### Thêm mới & Nâng cấp lớn
- **Bản đồ GIS thực tế (`GisMapCanvas.web.tsx`, `gisMapTileConfig.ts`)**: tích hợp **Leaflet** hiển thị nền bản đồ thực (`Esri World Imagery`, `Carto Dark Matter`, `Esri Dark Canvas`, `OpenTopoMap`), vòm ô nhiễm sáng, lớp mây, tia phương vị và bấm vào điểm bất kỳ trên bản đồ để soi tọa độ Bortle/SQM từ backend.
- **Vòm trời 3D WebGL (`SkyThreeCanvas.web.tsx`, `skyThreeBuilder.ts`, `astronomy3d.ts`)**: dựng cảnh **Three.js** cho cả `Mặt Đất 3D` (vòng chân trời cyan, Dải Ngân Hà, Sao Thổ, Trăng, chòm sao lấp lánh shader, tia mục tiêu) và `Quả Cầu 3D` (thiên cầu 360°, `+90° Thiên đỉnh / -90° Thiên đế`, Mặt Trời & Trăng ngoài quỹ đạo, nút `Di chuyển`), khớp giao diện Web và Mobile.
- **Backend hoàn chỉnh (`server/src/`)**: chuyển toàn bộ tính toán thiên văn (Mặt Trời, Mặt Trăng, Hành tinh, Dải Ngân Hà, Bortle/SQM, dự báo Open-Meteo Live, NPF/Rule 500, lịch thiên văn) và xác thực Firebase Auth + Firestore (lấy cấu hình từ `E:\StarWatch_Rebuild`) lên Node HTTP API tại `:8787`, mở đầy đủ tính năng chưa phân cấp khóa PRO.
- **Luồng Tài khoản & Máy ảnh (`AccountOverlay.tsx`, `CameraProfileOverlay.tsx`)**: bấm thẻ tài khoản trong Cài đặt mở Đăng nhập / Đăng ký (nếu là khách) hoặc Chỉnh sửa hồ sơ & Upgrade/Downgrade gói (`FREE`, `PRO`, `EXPEDITION`); bấm thẻ Máy ảnh mở giao diện chọn preset hoặc tự nhập thân máy/ống kính và tính thử NPF trước khi lưu.
- **Logo StarWatch tràn viền (`StarWatchLogo.tsx`, `assets/starwatch-logo.svg`, `public/favicon.svg`)**: chỉnh lại từ logo dự án cũ thành dạng full-bleed `64×64` không còn viền thụt lọt thỏm.

## [1.2.2-ui] - 2026-11-25

### Sửa lỗi & Cải tiến UX
- Chuẩn hóa lại thẻ địa điểm Mobile trên `LocationScoreCard` & `ScoreRing`: header 2 cột (`LIVE` + tỉnh/thành bên phải), lưới chip 2×2 bo góc `borderRadius: 10` hiển thị trọn vẹn tọa độ (`21.2981, 104.4652` không bị cắt `...`), và vòng điểm track rõ nét hơn (`accentViolet` cho Săn Mây).
- Sửa lỗi tràn chiều cao ô **Mặt Trăng** trong `SkyDomeCard` khi giá trị có số thập phân (`+14.6° · 18%`), giữ 3 ô thông số cố định 1 dòng đồng đều cả Mobile lẫn Desktop.
- Rà soát và sửa toàn bộ lỗi autolayout `393px`: bỏ `flex: 1` gây khoảng trống/cắt dọc trong `GisMapCard`, `TimeControlBar`, `SkyDomeCard`, `AstroSetupCard`, `CalendarOverlay`, `ContributeOverlay`, `GuideOverlay` và `FullscreenSkyOverlay`.
- Ghim cố định cột chú thích trái (`Giờ địa phương`, tầng mây, điểm sương) trong `CloudDewMatrixCard` khi vuốt ngang phần cột giờ trên Mobile.
- Thiết kế lại thẻ `Đêm nay có gì?` bản Mobile thành viên thuốc Liquid Glass thu gọn và thiết kế `MobileBottomTabBar` phong cách **iOS Liquid Glass** kèm hiệu ứng chuyển tab mượt (`Animated.spring`).
- Bổ sung bộ hiệu ứng âm thanh UI (`src/utils/soundEngine.ts`), nút tắt/bật nhanh trên Header Desktop và công tắc trong Cài đặt.

## [1.2.1-ui] - 2026-11-25

### Sửa lỗi & Cải tiến UX
- Sửa nút quay lại **Cài đặt** trong `AboutOverlay` Desktop (loại bỏ mũi tên kép và gỡ `<Pressable>` lồng nhau gây chặn click).
- Mở rộng `GisMapCanvas` lấp đầy 100% khoảng trống dọc bên dưới thẻ **Bản Đồ GIS · Việt Nam** trên Desktop và chiếu tọa độ ghim/tia phương vị theo vị trí thực của từng địa điểm tại Việt Nam.
- Thiết kế lại **Biểu đồ Độ cao 24H (0°–90°)** với đường cong Bezier mượt, vùng gradient, chú thích động và thao tác **kéo/vuốt ngang (`PanResponder`)** đồng bộ trực tiếp với timeline; sửa lỗi pill `18:00` đè chữ `90°` và lỗi chính tả `thanh dọc`.
- Ghim cố định thanh **Đêm nay có gì?** ở đáy màn hình Web Desktop và bổ sung chế độ **thu gọn / mở rộng** ngay trên thanh tab đáy của Mobile.

## [1.2.0-ui.1] - 2026-11-25

### Thêm mới
- Khởi tạo khung dự án **Expo + Expo Router + NativeWind v4 + TypeScript** chạy Web, Android, iOS.
- Xây dựng trọn vẹn **Design System StarWatch** theo Figma (`#25:31251`): 3 Theme (`Đêm`, `Ngày`, `Đỏ`), 8 cấp Typography tiếng Việt UTF-8 (`Plus Jakarta Sans` + `JetBrains Mono`), bảng Spacing/Radius/Animation, và bộ UI primitives.
- Clone hoàn chỉnh màn hình chính **Web Desktop (`1440px`)** theo node `4-28` cùng **10 Modal Overlays**.
- Clone hoàn chỉnh **Mobile App (`393px`)** gồm **5 Bottom Tabs** và **6 Sub-screens** nối đầy đủ luồng điều hướng hai chiều.
- Tạo bộ tài liệu dự án tiếng Việt (`README.md`, `AGENTS.md`, `docs/DESIGN_SYSTEM.md`, `docs/ARCHITECTURE.md`, `docs/PROGRESS.md`).
