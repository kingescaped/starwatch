# Changelog

Mọi thay đổi đáng chú ý của StarWatch được ghi tại đây. Định dạng dựa trên
[Keep a Changelog](https://keepachangelog.com/vi/1.1.0/); dự án không dùng
version tự động vì là static site deploy trực tiếp lên GitHub Pages.

## [Unreleased] — 2026-11-06

- **Tối ưu trải nghiệm Tabview Mobile, Cân đối thẻ Lịch Thiên Văn & Khôi phục địa điểm mặc định**:
  - **Xoá toàn bộ chú thích dưới tiêu đề trong modal tabview**: Gỡ bỏ các dòng phụ đề `<p>` dưới `<h3>` trên toàn bộ modal (`#modalSpotsDirectory`, `#modalContributeSpot`, `#modalAstroCalendar`, `#modalUserGuide`, `#modalSettings`, `#modalAppInfo`). Thiết lập `.tool-screen-header` và `.tool-screen-heading` căn giữa theo chiều dọc (`align-items: center`), gọn gàng trên cả desktop lẫn mobile.
  - **Cân đối chiều cao thẻ Lịch Thiên Văn trên Desktop (`.astro-event-card`)**: Chuyển sang `align-self: stretch; height: 100%`, cố định chiều cao tiêu đề (`min-height: 2.625rem`) và phần mô tả (`min-height: 3.25rem`) trên `≥ 768px`, ghim danh sách địa điểm gợi ý xuống đáy (`margin-top: auto; min-height: 4.25rem;`), đảm bảo 2 thẻ con trong cùng một hàng luôn cân đối và bằng nhau tuyệt đối.
  - **Tự động reset chế độ xoá khi đóng danh bạ địa điểm**: Thêm `resetDeleteSpotMode()`, tự động hoàn trả nút về trạng thái thường và xoá cờ `isDeleteSpotMode` khi đóng modal hoặc chuyển tab, tránh lưu trạng thái xoá ở phiên mở tiếp theo.
  - **Clear dữ liệu form đóng góp sau khi bấm Lưu**: Gọi `formContributeSpot.reset()` sau khi lưu địa điểm mới; giữ nguyên nội dung nháp khi người dùng chỉ chuyển đổi qua lại giữa các tabview mà chưa bấm lưu.
  - **Sliding indicator mượt mà cho thanh điều hướng mobile (`#mobileToolNav`)**: Thêm `.mobile-nav-indicator` trượt êm ái giữa các tab với `cubic-bezier(0.4, 0, 0.2, 1)` thay vì đổi màu giật cục tại chỗ.
  - **Tự động tải địa điểm đầu tiên khi địa điểm mặc định bị xoá**: Khi `khe-sanh` hoặc địa điểm mặc định đang kích hoạt bị người dùng xoá (cả trong runtime lẫn khi tải lại trang), hệ thống lập tức nạp địa chỉ đầu tiên trong danh sách (`state.spots[0]`), tự động cập nhật lại toàn bộ telemetry và bay bản đồ tới tọa độ mới.

- **Nút "Đã hiểu" trong Cẩm Nang dùng gesture nhấn giữ màu xanh + rút gọn 4 tiêu đề tabview**:
  - `#btnAcknowledgeGuide` chuyển sang `.hold-confirm` với `--hold-confirm-color: #22c55e`, `--hold-confirm-duration: 1200ms`, quầng sáng xanh khi hoàn tất. Nhãn đổi từ "Đã hiểu · Bắt đầu khám phá" thành **"Đã hiểu · Nhấn giữ"**; nhấn nhanh không còn đóng cẩm nang, phải giữ đủ lâu.
  - **Xoá trạng thái nhấn giữ lưu trong tabview**: `openToolModal()` / `closeToolModal()` gọi `resetHoldConfirmWithin()` để gỡ `.is-complete` / `.is-holding`. Trước đây modal giữ nguyên DOM khi ẩn nên mở lại sẽ thấy nút xanh đặc và không giữ tiếp được (bị coi là "cache").
  - **Sửa lớp hiển thị của `.hold-confirm`**: lớp phủ chuyển từ `z-index: -1` sang `z-index: 0` kèm `.hold-confirm > * { position: relative; z-index: 1 }`. Trước đó lớp phủ nằm sau nền gradient đục của nút nên hiệu ứng xanh gần như không thấy; nay màu chạy phủ lên cả nền gradient.
  - **Đổi tiêu đề các tabview**: "Danh Bạ Địa Điểm Săn Ảnh" → **"Điểm Săn Ảnh"**, "Lịch Thiên Văn & Dự Đoán Điểm Săn Ảnh Lý Tưởng" → **"Lịch Thiên Văn"**, "Cẩm Nang Hướng Dẫn Sử Dụng StarWatch" → **"Cẩm Nang"**, "Cài Đặt Hệ Thống StarWatch" → **"Cài Đặt"**.
  - Cập nhật `DESIGN.md`, `STRUCTURE.md`, `CHANGELOG.md`.

- **Nút xoá địa điểm: hết xê dịch layout + nhấn giữ để xoá (bỏ hộp thoại xác nhận)**:
  - **Cố định chiều cao hàng hành động**: thêm `.spot-card-actions` (`min-height: 2rem`, mobile `2.25rem`), `.spot-card-forecast` và `.btn-delete-spot-action` cùng cao `2rem` / `2.25rem`. Trước đây nút "Xoá" (đệm `py-1` + `text-xs`) cao `24px` trong khi link "Xem dự báo" chỉ `16px`, khiến thẻ tăng `168px → 176px` và cả lưới nhảy xuống mỗi lần bật chế độ xoá.
  - **Giao diện nút xoá theo ảnh tham chiếu**: nền `rgba(244, 63, 94, 0.12)`, viền `rgba(244, 63, 94, 0.45)`, chữ `#fda4af`, icon `trash-2` ăn theo `currentColor`; có bản light theme (`#be123c` trên nền hồng nhạt).
  - **Gesture nhấn giữ thay cho `window.confirm()`**: bỏ hộp thoại xác nhận trong `js/app/events.js`. Giữ nút `1100ms` thì màu đỏ đặc chạy từ trái sang phải "nuốt" nền đỏ mờ, chữ và icon chuyển trắng; đủ thời gian thì nút thành đỏ đặc kèm quầng sáng và địa điểm bị xoá ngay. Nhả tay sớm (hoặc kéo ra ngoài) thì màu thu về, không xoá. Nhấn nhanh một lần cũng không xoá.
  - **Component dùng lại được**: `.hold-confirm` + keyframes `hold-confirm-sweep` trong `assets/css/components.css`, đi kèm module `js/ui/hold-confirm.js` (`attachHoldToConfirm(element, { onComplete })`). Chỉ cần override `--hold-confirm-color`, `--hold-confirm-duration`, `--hold-confirm-glow` là đổi màu/đổi thời gian mà giữ nguyên hiệu ứng. Hỗ trợ cả bàn phím (giữ `Space`/`Enter`), chặn context menu và nuốt cú click phát sinh sau khi giữ để không kích hoạt nhầm thẻ địa điểm.
  - **Bấm vào thẻ khi đang bật chế độ xoá không còn xoá ngay**: trước đây chạm bất kỳ đâu trên thẻ cũng phát `spot:delete`; nay chỉ nút nhấn giữ mới xoá, chạm thẻ chỉ dừng sự kiện.
  - Cập nhật `DESIGN.md`, `STRUCTURE.md` (module + sự kiện `spot:delete`) theo thay đổi trên.

- **Trả lại giao diện Footer cũ, giữ nguyên Auto-Layout** (thay thế hướng thẻ card `#footerCard` ghi bên dưới):
  - Gỡ bỏ thẻ liquid-glass `#footerCard` (icon gradient, nhãn `v1.0`, cụm chip nguồn dữ liệu) và khôi phục footer văn bản thuần như bản trước: `StarWatch — Chạm vào Vũ Trụ · Bắt trọn Khoảnh Khắc Bầu Trời` bên trái, 3 mục nguồn dữ liệu (`Khí tượng`, `Thiên văn`, `Ô nhiễm sáng`) bên phải, kèm đường kẻ `border-t` mảnh phía trên.
  - Giữ nguyên khung Auto-Layout: `footer.footer-section` + `.page-shell`, xếp dọc căn giữa trên mobile và ngang `justify-between` từ `640px`; dải meta dùng `flex-wrap` + `gap-x-4` để không tràn ngang; đệm đáy `calc(6rem + env(safe-area-inset-bottom))` giữ footer luôn dừng phía trên `#mobileToolNav`.
  - Cập nhật `assets/css/components.css` (bỏ `#footerCard` / `.footer-meta-pill`, thêm `.footer-meta-item`) và `assets/css/theme-light.css` (màu chữ, viền trên của footer cho light theme).

- **Chuẩn hoá Auto-Layout đối xứng 12px cho Footer Modal Hướng Dẫn (#modalUserGuide)**:
  - **Tính toán lại khoảng trống Auto-Layout đối xứng 1:1**: Trước đó, khoảng cách từ nút *"Đã hiểu · Bắt đầu khám phá"* (`#btnAcknowledgeGuide`) tới thanh điều hướng `#mobileToolNav` chỉ đạt 8px (trong khi bóng đổ tím của nút tràn xuống 4px-6px khiến nút trông như dính sát vào tabview). Đã tính toán lại toạ độ hình học chính xác:
    - Đỉnh `#mobileToolNav` nằm ở `5.0rem` (`80px` = `0.75rem` bottom + `4.25rem` height) + `env(safe-area-inset-bottom)`.
    - Thiết lập `.tool-modal__footer` với đệm đáy `calc(5.75rem + env(safe-area-inset-bottom))` (`92px` + safe-area).
    - Khoảng cách từ đáy nút `#btnAcknowledgeGuide` tới đỉnh `#mobileToolNav` đạt đúng **`12px`** (`0.75rem`).
    - Cấu hình `gap: 0.75rem !important;` (`12px`) và `padding-top: 0.75rem !important;` (`12px`) trong `.tool-modal__footer`.
    - Kết quả: Khoảng trống từ khung mẹo (`.guide-footer-tip`) tới nút *"Đã hiểu"* (`12px`) và khoảng trống từ nút *"Đã hiểu"* tới tabview `#mobileToolNav` (`12px`) đạt tỷ lệ đối xứng 1:1 hoàn hảo theo nhịp 4px (`--space-3`) trong `DESIGN.md`.
  - **Tối ưu vùng cuộn nội dung cẩm nang**: Điều chỉnh `#modalUserGuide .tool-modal__body` với `padding-bottom: 1.25rem !important;`, loại bỏ khoảng trống thừa 88px ở cuối bài viết hướng dẫn khi cuộn xuống đáy.
  - **Hỗ trợ giao diện sáng (Light Theme)**: Đồng bộ màu nền `rgba(248, 250, 252, 0.96)` và viền trên `#e2e8f0` cho `html.light-theme .tool-modal__footer`.

- **Khắc phục triệt để lỗi giao diện Mobile (Treo màn hình Cài đặt, Đè header & Khoảng trống đen đáy Modal)**:
  - **Chuẩn hoá Auto-Layout cho Thẻ Footer & Cân bằng khoảng trống với Tabview**:
    - **Nâng cấp thành Thẻ Auto-Layout hoàn chỉnh (`#footerCard`)**: Thay thế văn bản thuần và các đường kẻ thô trước đó bằng thẻ card liquid-glass cao cấp (`.glass-card rounded-2xl border border-slate-800/80`), tích hợp biểu tượng StarWatch gradient, nhãn phiên bản `v1.0` và hệ thống chip thông số Auto-Layout (`.footer-meta-pill`) hiển thị nguồn dữ liệu khí tượng (Open-Meteo), thiên văn (VSOP87) và ô nhiễm sáng (VIIRS Bortle) với biểu tượng trực quan.
    - **Triệt tiêu lỗi cộng dồn khoảng trống (Double-Padding)**: Trước đó cả `body` (`5.5rem`) và `footer` (`6rem`) đều bị gán đệm đáy trên mobile, dẫn đến khoảng cách bị nhân đôi lên tới 184px (tạo ra khối padding 96px khổng lồ trong DevTools). Đã chuyển đệm đáy `body` về 0 và căn chỉnh đệm `footer` thành `calc(6rem + env(safe-area-inset-bottom))`, giúp khoảng cách từ mép dưới thẻ footer đến đỉnh thanh `#mobileToolNav` đạt đúng 16px (`1rem`), cân xứng 1:1 với khoảng cách 16px từ thẻ bên trên.
  - **Sửa lỗi treo ở màn hình Cài đặt khi tải trang trên Mobile**: Do khai báo `.tool-modal { display: flex !important; }` trước đó có độ ưu tiên cao hơn lớp utility `.hidden { display: none; }` của Tailwind, khiến toàn bộ các modal trên mobile bị ép hiển thị ngay từ khi load trang (trong đó `#modalSettings` nằm ở cuối DOM nên che lên trên cùng) và nút đóng `X` không thể ẩn được modal. Đã khắc phục bằng cách thiết lập `.tool-modal.hidden { display: none !important; }`, `.tool-modal:not(.hidden)` và bổ sung `.hidden { display: none !important; }` toàn cục. Khi tải trang trên mobile, người dùng vào thẳng màn hình chính bình thường và có thể đóng/mở modal bất kỳ lúc nào.
  - **Khôi phục nhãn chữ trên thanh Tabview (#mobileToolNav)**: Thiết lập `#mobileToolNav > button > span { display: block !important; font-size: 0.625rem; font-weight: 600; }`, đồng thời loại bỏ khai báo `.hidden` toàn cục gây xung đột với các lớp responsive của Tailwind, giúp 5 nhãn chữ (*"Sự kiện"*, *"Đóng góp"*, *"Địa điểm"*, *"Hướng dẫn"*, *"Cài đặt"*) luôn hiển thị sắc nét, rõ ràng dưới từng icon theo đúng chuẩn `DESIGN.md`.
  - **Giải quyết tận gốc Stacking Context cho #mobileToolNav**: Tách `#mobileToolNav` ra khỏi `.app-chrome` trên màn hình di động (<640px) qua `syncNavPlacement()`, đưa trực tiếp vào `document.body` ở lớp `z-index: 2500 !important;`. Trên desktop (>=640px) tự động trả lại đúng vị trí trong `.header-frame`.
  - **Khôi phục phân lớp z-index tự nhiên**: Trả `.app-chrome` về lại `z-index: 1000`. Khi mở bất kỳ modal nào (`z-index: 2000`), backdrop và panel của modal tự động che phủ hoàn toàn header và active spot bar mà không cần các bộ lọc CSS ẩn DOM mong manh. Tiêu đề modal và nút đóng `X` ở trên cùng hiển thị 100% sắc nét, dễ chạm bấm.
  - **Xoá bỏ khoảng trống đen dưới đáy modal & Đẩy nội dung thẻ chuẩn Auto-Layout**:
    - Thiết lập `.tool-modal__panel` full màn hình (`100dvh`), loại bỏ viền cắt đứt đoạn; nền `#0f172a` trải dài liền mạch xuống sát mép đáy màn hình phía sau thanh tabview.
    - Đưa `padding-bottom: calc(5.5rem + env(safe-area-inset-bottom)) !important;` vào các vùng cuộn nội dung bên trong (`.tool-modal__body`, `#settingsModalBody`, `#formContributeSpot`, `.tool-modal__footer`). Khi cuộn xuống hết cỡ, toàn bộ các thẻ con, form nhập và nút bấm ("Đã hiểu", "Xem Mã Nguồn Backend", thẻ địa điểm...) đều dừng lại đẹp mắt ngay phía trên `#mobileToolNav` đúng theo quy chuẩn Auto-Layout tham chiếu, không bị che khuất và không bị cụt giao diện.
  - **Đồng bộ phân tầng Modal con (`z-[2200]`)**: Cập nhật `z-index: 2200` cho `#modalBackendArchitecture` và `#modalCartoConfig`, đảm bảo khi mở các cửa sổ chi tiết từ modal Cài Đặt thì giao diện hiển thị ngay ngắn trên cùng.

## [Unreleased] — 2026-11-05

- **Khắc phục lỗi ứng dụng bị đơ (Uncaught RangeError: trash-2) & Sửa lỗi hiển thị Stacking Context trên Mobile**:
  - **Sửa lỗi crash JavaScript làm đơ toàn bộ ứng dụng**: Bổ sung `'trash-2'` vào danh mục `iconNames` trong `js/ui/icons.js`. Trước đó, khi `renderIcons()` quét qua biểu tượng `data-icon="trash-2"`, `getIconHref` ném ngoại lệ `RangeError: Unknown StarWatch icon: trash-2` làm dừng toàn bộ luồng khởi động của `main.js`, khiến bản đồ không khởi tạo (đen kịt), các bộ lắng nghe sự kiện không được đăng ký (không bấm được nút nào trên web) và các icon phía sau không hiển thị được.
  - **Khắc phục Stacking Context giúp #mobileToolNav luôn nổi trên Mobile**: Thiết lập `.app-chrome` lên `z-index: 2500 !important;` trên mobile, đồng thời khi mở modal (`html.modal-scroll-locked`), ẩn thanh header trên cùng và thanh active spot bar để chỉ giữ lại `#mobileToolNav` nổi sắc nét trên khoảng trống 5.5rem dưới đáy modal.
  - **Hiển thị nhãn nút Theme trong Cài đặt**: Cho phép nhãn giao diện (`span:first-of-type`) hiển thị trên mobile cùng icon, tránh việc nút chỉ là một khối tím/xám rỗng.

- **Thanh điều hướng Tabview nổi cố định trên Mobile (#mobileToolNav) & Đẩy lùi che khuất thẻ**:
  - **Luôn nổi trên cùng khi mở bất kỳ modal nào**: Nâng `#mobileToolNav` lên `z-index: 2500 !important;` cao hơn mọi cửa sổ và lớp phủ backdrop, giúp thanh điều hướng 5 tab (Sự kiện, Đóng góp, Địa điểm, Hướng dẫn, Cài đặt) luôn hiển thị trọn vẹn, người dùng có thể chạm đổi tab tức thì bất kỳ lúc nào.
  - **Đẩy toàn bộ thẻ bên trong modal lên trên thanh điều hướng**: Thiết lập `.tool-modal` trên mobile với `padding: 0 0 calc(5.5rem + env(safe-area-inset-bottom)) 0 !important;` và `.tool-modal__panel` có `border-radius: 0 0 1.5rem 1.5rem !important; border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;`. Toàn bộ thẻ sự kiện, thẻ địa điểm, form đóng góp và cẩm nang hướng dẫn khi cuộn xuống đáy đều dừng lại đẹp mắt ở phía trên thanh tabview, hoàn toàn không bị chìm hoặc che khuất sau thanh điều hướng.
  - **Bảo toàn chân trang web chính**: Bổ sung `padding-bottom: calc(6rem + env(safe-area-inset-bottom)) !important;` cho `footer` trên mobile, đảm bảo khi người dùng cuộn đến đáy trang chủ thì toàn bộ thông tin bản quyền và API metadata dừng hoàn toàn phía trên `#mobileToolNav`.
  - **Chỉ báo Tabview đang kích hoạt (`.is-nav-active`)**: Tự động đồng bộ hoá trạng thái nút tab trên thanh điều hướng khi mở/đóng modal tương ứng, làm sáng rực icon và nền với ánh sáng tím dạ quang tinh tế.

- **Di chuyển "Địa điểm săn ảnh" thành Tabview Modal độc lập (#modalSpotsDirectory)**:
  - **Tách khỏi luồng trang chính**: Chuyển danh bạ địa điểm từ section inline trên body vào cửa sổ tabview modal `#modalSpotsDirectory`, mở bằng nút "Địa điểm" (`#btnOpenSpotsDirectory`) trên thanh điều hướng.
  - **Chuẩn hoá Auto-Layout hiện đại**: Cấu trúc gồm Header (`.tool-screen-header`) với icon la bàn, tiêu đề phân cấp và các nút hành động; Subbar dải ribbon trượt ngang (`#spotsRegionFilters`) hỗ trợ lọc theo 3 miền và địa điểm yêu thích; Body cuộn mượt ôm trọn lưới thẻ responsive 1/2/3 cột (`#spotsGridContainer`).
  - **Đồng bộ Animation mở/đóng & chuyển tab**: Tích hợp hoàn toàn vào hệ thống animation `openToolModal` / `closeToolModal`. Chạm chuyển qua lại giữa các tab diễn ra trơn tru, không giật lag hay chồng lấn cửa sổ.
  - **Chế độ Xoá địa điểm tích hợp (`#btnToggleDeleteSpotMode`)**:
    - Khi bấm nút "Xoá địa điểm" trên header, nút "Xem dự báo" ở góc dưới mỗi thẻ lập tức chuyển đổi thành nút "Xoá" đỏ nổi bật (`.btn-delete-spot-action`) với animation pop-in nhẹ nhàng.
    - Nhấp nút "Xoá" sẽ hiển thị hộp thoại xác nhận an toàn, sau đó loại bỏ địa điểm khỏi bộ nhớ `localStorage` (`skyradar_deleted_spots_v1` và `skyradar_custom_spots_v1`), gỡ bỏ marker khỏi bản đồ và cập nhật lại lưới thẻ ngay lập tức. Nếu địa điểm bị xoá đang là điểm active, hệ thống tự động chuyển sang địa điểm kế tiếp.
    - Nhấp lại nút "Hoàn tất xoá" để thoát chế độ và đưa các thẻ trở lại giao diện xem dự báo bình thường.
  - **Chọn địa điểm xem dự báo trực quan**: Khi không ở chế độ xoá, nhấp vào thẻ địa điểm bất kỳ sẽ lập tức đóng modal, bay camera bản đồ và trượt mượt xuống bảng Ma trận thời tiết của địa điểm đó.

- **Chuẩn hoá Auto-Layout cho Footer Modal Hướng Dẫn Sử Dụng (#modalUserGuide)**:
  - **Triệt tiêu hoàn toàn lỗi nút bấm đè lên dòng chữ**: Tách phần chân modal thành cấu trúc Auto-Layout linh hoạt: trên mobile (<640px) xếp dọc 2 tầng (`flex-col gap-2.5`), trên desktop (>=640px) xếp ngang cân xứng (`sm:flex-row sm:items-center sm:justify-between sm:gap-4`).
  - **Hộp Mẹo Night Vision trực quan (`.guide-footer-tip`)**: Bọc icon bóng đèn (`lightbulb` vàng hổ phách) và nội dung nhắc nhở bật chế độ Đèn Đỏ trong hộp pill bo góc `rounded-xl`, nền mờ `bg-slate-900/70` với viền slate tinh tế, chữ trải rộng 100% thoải mái không bị co thắt hay tràn đè.
  - **Nút xác nhận chuẩn Tap-Target Mobile (`#btnAcknowledgeGuide`)**: Rộng 100% trên mobile với chiều cao chuẩn 40px (`min-h-[40px]`), hiển thị trọn vẹn nhãn `"Đã hiểu · Bắt đầu khám phá"` kèm icon lấp lánh `sparkles`, nền gradient violet-cyan đổ bóng phát quang sang trọng; trên desktop tự co giãn vừa vặn nội dung (`sm:w-auto min-h-[36px]`).

- **Quy chuẩn Auto-Layout cho Tabview Sự Kiện Lịch Thiên Văn (#modalAstroCalendar) trên Mobile**:
  - **Triệt tiêu lỗi khoảng trống khổng lồ khi chỉ có 1 thẻ sự kiện**: Thiết lập `align-content: start;` trên `#astroCalendarEventsGrid` và gỡ bỏ `justify-between` trên `.astro-event-card`, giúp thẻ sự kiện (ở mục "Mưa Sao Băng", "Sự Kiện Mặt Trăng",...) tự động co giãn ôm sát nội dung (Hug Contents / `height: auto`), loại bỏ hoàn toàn khoảng trống đen mênh mông bị kéo dãn giữa phần mô tả và cụm địa điểm.
  - **Dải Ribbon phân loại sự kiện không rớt dòng (`.cal-filter-ribbon`)**: Chuyển đổi bộ nút lọc danh mục từ dạng `flex-wrap` (vốn bị gãy vụn thành 2–3 hàng lộn xộn trên màn hình hẹp) sang dải ribbon trượt ngang Auto-Layout mượt mà (`overflow-x: auto; flex-wrap: nowrap; scrollbar-width: none`), giữ nguyên vẹn chiều cao và cấu trúc nút 34px/36px với bo góc `rounded-xl`.
  - **Dòng hướng dẫn trực quan (`.cal-subbar-hint`)**: Bố cục thẳng hàng bên dưới ribbon với icon lấp lánh (`sparkles`), truyền đạt rõ ràng hành động chạm để nạp setup mà không chiếm dụng nhiều diện tích màn hình.
  - **Tái cấu trúc Auto-Layout thẻ sự kiện (`.astro-event-card`)**:
    - **Header thẻ**: Tách thành 2 nhóm Auto-Layout cân xứng: Huy hiệu phân loại sự kiện bên trái (`.badge`) và Khung ngày giờ thiên văn bên phải (`📅 DD/MM/YYYY · 🕒 HH:MM GMT+7`) với nền pill border cyan sắc nét.
    - **Tiêu đề & Nội dung**: Áp dụng type scale chuẩn (14px mobile bold, 12px description, line-height 1.45).
    - **Tiêu đề gợi ý địa điểm**: Thay thế chuỗi chữ in hoa dài bị gãy dòng thô kệch (`📍 ĐỊA ĐIỂM DỰ BÁO LÝ TƯỞNG NHẤT (NHẤP ĐỂ XEM & NẠP...`) bằng bố cục 1 dòng tinh gọn: Bên trái là `📍 ĐIỂM SĂN ẢNH LÝ TƯỞNG`, bên phải là gợi ý `Chạm để nạp setup`.
    - **Các nút nhảy địa điểm (`.cal-jump-spot-btn`)**: Thiết lập chuẩn Auto-Layout tap-target 36px (`min-h-[36px]`, `px-2.5 py-1.5 rounded-xl`), nền slate hiện đại với viền tinh tế, tên địa điểm chống tràn và chỉ số Bortle `(Bortle X.X)` đồng bộ theo dải 5 màu động.
    - **Điều hướng thông minh tới thẻ Hướng Dẫn Setup Chụp Thiên Văn**: Khi người dùng chạm vào một địa điểm gợi ý lý tưởng, ứng dụng tự động đóng modal lịch, cập nhật ngày giờ & sự kiện chụp tương ứng, bay tới toạ độ điểm chụp trên bản đồ và cuộn mượt (`scrollToCameraSetup`) dừng chuẩn xác ngay dưới thanh sticky chrome tại thẻ `#cameraSetupSection`.
    - **Khắc phục triệt để lỗi khoá cuộn nền (`modal-scroll-locked`) & sửa lỗi Scope biến**: Đưa các biến kiểm soát khóa cuộn nền (`backgroundScrollLocked`, `pendingScrollAfterModalUnlock`, `syncBackgroundScrollLock`) lên phạm vi module scope để `initAppEvents` và `initEventListeners` dùng chung (triệt tiêu lỗi `ReferenceError` làm chết luồng cuộn), đồng thời áp dụng double `requestAnimationFrame` đảm bảo layout DOM hoàn tất giải phóng `position: fixed` trước khi trượt mượt 100% tới `#cameraSetupSection`, kết hợp hiệu ứng viền phát quang (`.camera-setup-highlight`) báo hiệu đã đến khu vực setup.

- **Khắc phục lỗi hiển thị & Chuẩn hoá Auto-Layout thanh tìm kiếm (#quickSearchDropdown)**:
  - **Sửa triệt để lỗi phân lớp z-index bị đè**: Thiết lập `.app-header` (`z-index: 40`) cao hơn `.spot-bar` (`z-index: 20`) trong khung sticky chrome (`.app-chrome`), khắc phục hoàn toàn hiện tượng dropdown tìm kiếm bị thanh Active Spot Bar (`#activeSpotBar`) đè lên phần trên và cắt đôi giao diện.
  - **Bỏ lớp kính trong suốt gây bóng mờ chồng lấn**: Thay thế `liquid-glass` (vốn có độ mờ 58%) bằng class chuyên dụng `.search-dropdown` với nền opaque sang trọng (`rgba(15, 23, 42, 0.98)` trên Dark Theme, `#ffffff` trên Light Theme), viền slate nét căng và hiệu ứng đổ bóng phát quang 3 tầng, triệt tiêu hoàn toàn hiện tượng chữ và nút ở trang nền (`Hoàng hôn`, `Chập tối TV`,...) xuyên thấu qua danh sách kết quả.
  - **Cấu trúc Auto-Layout chuẩn cho từng hàng kết quả**:
    - Tiêu đề nhóm phân loại (`.search-dropdown__section`): Sticky ở đỉnh danh sách khi cuộn, icon sắc nét, hiển thị số lượng kết quả local hoặc trạng thái animation "Đang tìm...".
    - Hàng địa điểm (`.search-dropdown__item`): Phân bố Auto-Layout 2 cột rõ ràng với gap `0.75rem`: Cột trái (`.search-dropdown__item-main`) dạng flex column co giãn linh hoạt (`flex: 1 1 auto; min-w: 0`) chứa tên địa điểm (icon + chữ in đậm, chống tràn `truncate`) và địa chỉ chi tiết; Cột phải (`.search-dropdown__item-meta`) cố định (`shrink: 0`) canh lề phải gồm huy hiệu động `Bortle ~X` và cao độ `~Xm`.
    - Hàng nhảy toạ độ (`.search-dropdown__coord-item`): Auto-layout với icon ghim bản đồ và nút "Tải dự báo" chuẩn chỉ.
    - Hỗ trợ sự kiện `focus` mở lại kết quả tra cứu ngay khi người dùng click vào ô tìm kiếm có sẵn từ khoá.

- **Hệ thống màu sắc động thang đo ô nhiễm sáng Bortle (Bortle Scale Dynamic Palette - 5 Cấp độ)**:
  - Triển khai chuẩn màu chuyển tiếp trực quan từ Xanh lá cây (Bortle thấp, bầu trời lý tưởng) sang Đỏ (Bortle cao, ô nhiễm sáng nặng) theo Phương án A đã phê duyệt:
    - **Cấp 1 (Bortle 1.0 – 3.0, Rất tối)**: Xanh ngọc lục bảo (Emerald `#34d399`, dot `#34d399`, nền/viền emerald).
    - **Cấp 2 (Bortle 3.1 – 4.2, Tối)**: Xanh mạ chanh (Lime `#a3e635`, dot `#a3e635`, nền/viền lime).
    - **Cấp 3 (Bortle 4.3 – 5.5, Trung bình)**: Vàng tươi (Yellow `#facc15`, dot `#facc15`, nền/viền yellow).
    - **Cấp 4 (Bortle 5.6 – 7.0, Sáng)**: Cam hổ phách (Orange `#fb923c`, dot `#fb923c`, nền/viền orange).
    - **Cấp 5 (Bortle 7.1 – 9.0, Sáng rực)**: Đỏ san hô (Red `#f87171`, dot `#f87171`, nền/viền red).
  - Áp dụng đồng bộ cho cả 3 hình thái hiển thị:
    - Huy hiệu dạng ô ([`Bortle 3.5`]) trên từng thẻ danh bạ địa điểm (`#spotsDirectoryList`).
    - Pill trạng thái môi trường chụp ([`Bầu trời: Bortle 3.3`]) trong thẻ Hướng dẫn Setup máy ảnh (`#cameraSetupContentContainer`).
    - Dạng chữ & chấm tròn báo hiệu (`🟢 Bortle 3.3 (Tối)`) trên thanh Active Spot Bar (`#activeSpotBortleDot`, `#activeSpotBortle`), pop-up bản đồ vệ tinh (`map.js`), và danh sách gợi ý tìm kiếm nhanh (`#placeSearchResults`).
  - Bổ sung hàm tiện ích tập trung `getBortleColorInfo(bortleValue)` tại `js/core/utils.js` trả về đầy đủ level, tên cấp độ, mã màu hex và các CSS class tương thích cao trên cả Dark Theme và Light Theme.

- **Đồng bộ hoá toàn diện 3 bộ điều khiển dạng Pill (#datePickerControl, #celestialTargetControl, #setupEventControl)**:
  - Đồng bộ 100% thuộc tính cấu trúc khung (Container Attributes) trên cả Desktop và Mobile: chiều cao chuẩn 36px (`2.25rem` / `h-9`), bo góc `0.75rem` (`rounded-xl`), padding `0.25rem 0.625rem`, nền dark slate (`bg-slate-900` / `rgba(15, 23, 42, 0.9)` trên theme tối, `#ffffff` trên theme sáng), viền `1px solid rgba(51, 65, 85, 0.7)` (desktop) / `rgba(148, 163, 184, 0.22)` (mobile) / `#cbd5e1` (light).
  - Cấu trúc Auto-Layout bên trong:
    - Bên trái: Icon 14px (`w-3.5 h-3.5 shrink-0`) + Nhãn nhạt màu (`text-[11px] sm:text-xs text-slate-400 font-medium whitespace-nowrap`).
    - Bên phải: Input ngày/Select thiên thể/Select sự kiện với nền trong suốt (`bg-transparent`), không viền (`border-none`), chữ đậm sắc nét (`text-xs font-semibold text-violet-200` / `font-mono text-white`).
  - Trên mobile:
    - Ô chọn ngày tháng ([`#datePickerControl`](file:///e:/StarWatch/index.html#L304)): Khôi phục chiều dài gọn gàng như cũ (`width: auto`, `max-width: fit-content`), căn lề trái hàng, triệt tiêu hoàn toàn khoảng trống đen kéo giãn thừa.
    - Ô chọn thiên thể ([`#celestialTargetControl`](file:///e:/StarWatch/index.html#L373)) và chọn sự kiện ([`#setupEventControl`](file:///e:/StarWatch/index.html#L751)): Thiết lập chiều ngang khung chuẩn (`width: 100%`), icon và nhãn cố định gọn gàng bên trái (`shrink-0`), giá trị lựa chọn dropdown căn lề trái (`text-align: left`, `text-align-last: left`) liền kề với nhãn, tam giác sổ xuống (`▾`) nằm ngay sau chữ, khắc phục triệt để lỗi tràn viền đẩy cụm nhãn ra ngoài pill.
- **Task 1: Chuẩn hoá Typography toàn hệ thống theo DESIGN.md**:
  - Bổ sung bảng quy chuẩn kích thước chữ và phân cấp Typography (Type Scale Specification) chi tiết vào `DESIGN.md`.
  - Thiết lập các class chuẩn `.card-heading` (Desktop 15px, Mobile 14px, Bold 700), `.section-description` (Desktop 12px, Mobile 11px, vạch viền dọc tinh tế bên trái), `.subcard-heading` (11px uppercase tracking-wider), `.metric-value` (Desktop 15px, Mobile 14px mono bold) trong `assets/css/components.css` và `assets/css/theme-light.css`.
  - Đồng bộ hoá tiêu đề và mô tả trên toàn bộ các thẻ workspace trong `index.html` (Bản đồ Radar, Vòm Thiên Đỉnh, Ephemeris, Ma Trận Mây, Camera Setup Advisor, Danh Bạ Địa Điểm), xoá bỏ tình trạng mỗi thẻ dùng một cỡ chữ tự do.
- **Task 2: Rút gọn nút toggle layer bản đồ và hiệu ứng BẬT/TẮT trên mobile**:
  - Bọc 3 nút toggle layer bản đồ (Ô nhiễm sáng, Mây mô phỏng, Tia phương vị) vào container `#mapOverlayToggles` `.map-overlay-toggles`.
  - Trên mobile: hiển thị nhãn ngắn gọn (`sm:hidden`: "Ô nhiễm", "Mây", "Phương vị"), layout dạng CSS grid 3 cột bằng nhau (`repeat(3, minmax(0, 1fr))`) vừa khít 100% chiều rộng thanh công cụ, tuyệt đối không bị cuộn/roll ngang.
  - Bổ sung hiệu ứng thị giác nhận diện BẬT/TẮT: khi BẬT có màu chủ đề sáng rõ và đổ bóng phát quang (glow); khi TẮT chuyển về trạng thái dim (`is-off` / `aria-pressed="false"`) với nền tối mờ, viền slate chìm và icon mờ 50%.
- **Task 3: Sửa lỗi thụt lùi bên trái thanh mô phỏng trên mobile**:
  - Gỡ bỏ `padding-left: 3.5rem` (desktop) và `padding-left: 3rem` (mobile) khỏi `.map-overlays`.
  - Chuyển `margin-left: 2.75rem` (desktop) / `2.5rem` (mobile) về riêng widget `#mapAzimuthLegend` ở góc trên bên trái để tránh vướng nút zoom Leaflet.
  - Thanh điều khiển mô phỏng `#himawariControlPanel` ở đáy bản đồ trải rộng 100% cân đối hai bên với padding 0.5rem tiêu chuẩn, không còn bị thụt lùi lệch sang trái.
- **Tái cấu trúc bộ chọn nền bản đồ (#mapTileControls)**:
  - Chuyển đổi `#mapTileControls` thành Segmented Control hiện đại: bỏ `divide-x` và gán khoảng cách `gap-1` đồng bộ.
  - Trên mobile (`< 640px`): thiết lập dạng CSS Grid 4 cột bằng nhau (`repeat(4, minmax(0, 1fr))`) lấp đầy 100% chiều rộng thanh công cụ, triệt tiêu hoàn toàn khoảng đen trống thừa bên phải sau nút "Topo Độ Cao".
  - Nút active có bo góc và đổ bóng nhẹ (`is-active` / `bg-violet-600`), nút inactive có hover sáng rõ.
- **Auto-Layout huy hiệu bóng tối vòm trời (#domeDarknessBadge)**:
  - Tách thành 2 dòng trên/dưới theo chuẩn Auto-Layout: dòng trên là tên pha thiên văn ngoài ngoặc (ví dụ `Giờ Vàng`), dòng dưới là chú thích trong ngoặc (ví dụ `(Golden Hour)`).
  - Loại bỏ các giới hạn chiều rộng cứng (`width: 5.5rem` / `10rem`) và thuộc tính ngắt chữ lửng lơ (`overflow-wrap: anywhere`), cho phép huy hiệu tự co giãn linh hoạt (`width: auto`, `shrink-0`) mà không bị rớt chữ.
- **Đồng bộ tiêu đề thẻ Lịch Thiên Văn Trong Ngày**:
  - Đổi tên thẻ từ "Lịch Thiên Văn Chi Tiết Trong Ngày (Ephemeris)" thành "Lịch Thiên Văn Trong Ngày".
  - Chuyển đổi tiêu đề sang class chuẩn `.card-heading` (`<h3>`, `15px` desktop / `14px` mobile, bold 700, icon đồng hồ cyan) đồng bộ hoàn toàn với các thẻ workspace khác trên website.
- **Áp dụng chuẩn Auto-Layout cho thẻ Hướng Dẫn Setup Chụp Thiên Văn (#cameraSetupSection)**:
  - Header & Điều khiển:
    - Desktop: Thanh chọn Sự kiện (`#setupEventControl`, cao 36px) và bộ chuyển đổi thiết bị 3 chế độ (`#gearModeControls`, cao 36px) xếp thẳng hàng ngang Auto-Layout với tiêu đề bên trái.
    - Mobile: Xếp dọc 2 hàng full-width chuẩn 36px (`w-full h-9`), nhãn thiết bị hiển thị rút gọn linh hoạt (`Full-Frame`, `iPhone`, `Android` trên mobile; `Máy ảnh Full-Frame`, `iPhone 18 Pro`, `Android Flagship` trên desktop).
    - Xoá bỏ hoàn toàn lỗi nút thiết bị bị rớt thành 3 dòng chữ lộn xộn và kích thước icon quá khổ trên mobile.
  - Nội dung thẻ gợi ý (`js/ui/camera-guide.js`):
    - 4 thẻ thông số kỹ thuật (Ống kính & Tiêu cự, Khẩu độ & Định dạng, Tốc độ phơi sáng, ISO) được bố cục dạng Grid 2 cột trên mobile và 4 cột trên desktop (`grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3`), chia đều chiều cao và flex alignment chuẩn Auto-Layout.
    - 2 thẻ lưu ý thực địa (Lấy nét/WB và Chân máy/sưởi lens) bọc icon trong khung pill box vuông chuẩn (`w-8 h-8 rounded-lg bg-slate-900 border border-slate-800`), phân tách cột icon và nội dung văn bản rõ ràng.
- **Đưa nút mốc "Hiện tại" lên vị trí đầu tiên trong Master Time Controller**:
  - Sắp xếp nút "Hiện tại" (`data-jump="now"`) đứng đầu tiên trong dãy nút mốc thời gian trên cả 2 phiên bản mobile và desktop.
  - Xoá bỏ triệt để hiện tượng viền tím/xanh chồng lấn khi đổi mốc thời gian, đảm bảo thanh preset trải phẳng trên 1 hàng ngang (desktop) hoặc cuộn mượt (mobile).

Tái cấu trúc bố cục desktop/mobile theo hướng Auto Layout: một khung nội dung
duy nhất, một sticky chrome duy nhất và breakpoint rõ ràng cho workspace.

### Thêm mới

- Bộ token bố cục trong `assets/css/tokens.css`: `--space-1…6`, `--radius-sm…xl`,
  `--shell-max`, `--shell-pad`, `--header-h`, `--chrome-h` và `--z-chrome`.
- Khung nội dung `.page-shell` dùng chung cho header, active spot bar, section
  thời gian, `main` và footer.
- Wrapper sticky duy nhất `#appChrome` (`.app-chrome`) bọc header và active spot
  bar.
- Class cấu trúc có tên: `.app-header`, `.header-frame`, `.header-brand`,
  `.header-search`, `.header-tools`, `.spot-bar__inner`, `.spot-bar__identity`,
  `.spot-bar__info`, `.spot-bar__title-row`, `.workspace`, `.workspace__map`,
  `.workspace__side`.
- `aria-label` tiếng Việt cho các nút header chỉ còn icon ở màn hình hẹp.

### Thay đổi

- Header và active spot bar không còn `sticky` riêng lẻ; chỉ `#appChrome` sticky
  ở `top: 0`, nhờ đó không còn chồng lấn hay mốc offset cứng.
- `js/app/events.js` đo chiều cao thật của `#appChrome` bằng `ResizeObserver`
  (throttle bằng `requestAnimationFrame`) và cập nhật biến `--chrome-h`.
- `#weatherMatrixSection` dùng `scroll-margin-top: calc(var(--chrome-h) + 16px)`
  thay cho các mốc `8rem` / `11rem`, nên cuộn tới bảng thời tiết luôn dừng đúng
  dưới chrome kể cả khi thanh địa điểm thu gọn hoặc header xuống dòng.
- Nhãn công cụ desktop và nhãn điểm hiển thị từ `1280px`; khoảng `640–1279px`
  chuyển sang mật độ icon + số để header và spot bar giữ một hàng.
- Workspace map/dome: một cột dưới `1024px`, chia `7/5` từ `1024px`, đổi thành
  `8/4` từ `1440px`.
- Time panel: một cột dưới `1024px`, hai cột từ `1024px`, ba cột từ `1440px`;
  `#celestialTargetControl` chiếm toàn hàng khi panel có hai cột.
- Xoá các selector xuyên cấp kiểu `header > div > div:nth-child(2)` và
  `section.sticky > div > …`, thay bằng class ngữ nghĩa.
- Xoá các mốc `top: 6rem`, `top: 6.5rem` và `top: 11rem` trong
  `assets/css/components.css` / `layout.css`.

### Sửa lỗi

- Hết tràn ngang ở các viewport `320`, `390`, `640`, `768`, `1024`, `1280`,
  `1440` px (trước đây 768px tràn 101px do header/spot bar quá rộng).
- Chiều cao chrome giảm còn `144px` ở `1024–1280px` và `117px` ở `1440px+`
  (trước đây `170px` / `280px` ở một số mốc).
- Bản đồ Leaflet co giãn đúng khi workspace đổi breakpoint nhờ
  `ResizeObserver` + `syncLeafletMapSize()` sẵn có trong `js/map/map.js`.

### Tài liệu

- `DESIGN.md`: bổ sung token bố cục, `.page-shell`, sticky chrome, mật độ
  desktop, breakpoint `1024px` và cấu trúc workspace/time panel.
- `STRUCTURE.md`: thêm mục “Khung trang và sticky chrome”, mục “Bố cục workspace
  và time panel”, cập nhật vai trò `js/app/events.js`.
- Thêm `CHANGELOG.md`.

#### Kết quả kiểm tra Phase 1–3

- Không có lỗi module/console khi tải trang qua HTTP.
- `overflowX = 0` tại `320`, `390`, `640`, `768`, `1023`, `1024`, `1280`,
  `1440`, `1600` px.
- Cuộn tới weather matrix dừng cách đáy chrome `16px`.
- Thu gọn active spot bar cập nhật ngay `--chrome-h` và `scroll-margin-top`.
- 15 địa điểm, bản đồ tile, weather matrix và modal lịch hoạt động bình thường.

### Phase 4 — Mobile chrome và overlay

- Header mobile rút còn một hàng: brand + nút tìm kiếm. Ô tìm kiếm mở thành panel cố định dưới header, có input, GPS và nút đóng; đóng bằng nút, phím Escape, click ra ngoài hoặc sau khi chọn kết quả.
- Active spot bar trên mobile cao `48px`. Chi tiết (tọa độ, độ cao, Bortle, điểm Ngân Hà/Ráng/Săn Mây, các nút thao tác) mở trong panel overlay dưới bar, không làm tăng chiều cao chrome.
- Bar tự thu gọn khi vào viewport mobile và mở rộng trên desktop; trạng thái được đồng bộ lại khi đổi breakpoint, `load` và `resize`.
- Nhãn bottom nav chuyển hẳn vào HTML với text ngắn, bỏ pseudo-element `::after`; nhãn hiển thị đầy đủ ở `320px` và `390px`.
- Gom các widget nổi trên bản đồ vào layer `.map-overlays` dạng grid, bỏ các mốc `absolute top/left/bottom` rời rạc; giữ `pointer-events: none` cho layer và bật lại cho từng widget.
- Ẩn badge vùng và badge API trên mobile để tên địa điểm luôn nằm trên một hàng.

#### Kết quả kiểm tra Phase 4

- Mobile `320/390px`: header `56px`, spot bar `48px`, chrome `104px`, `overflowX = 0`.
- Mở rộng spot bar trên mobile: bar và chrome giữ nguyên `48px` / `104px`; overlay che đúng vùng nội dung bên dưới.
- Tablet `640/768px`: chrome `224px` / `197px` (bar desktop nhiều dòng), không tràn ngang.
- Desktop `1024/1280/1440px`: chrome `144px` / `144px` / `117px`, không tràn ngang.
- Search overlay mở đúng dưới header, input được focus, đóng đúng khi click ra ngoài.

### Phase 5 — Modal shell dùng chung, Sticky cột nhãn thời tiết & Lưới thẻ địa điểm Auto-fill

- **Modal shell dùng chung:** Gom 5 tool modal (`modalContributeSpot`, `modalAstroCalendar`, `modalUserGuide`, `modalAppInfo`, `modalSettings`) về bộ khung semantic `.tool-modal`, `.tool-modal__panel`, `.tool-modal__header`, `.tool-modal__body`, `.tool-modal__footer`. Trên mobile (dưới `640px`) modal chiếm full viewport `100dvh` (`100vh` fallback), vùng cuộn nội dung `overscroll-behavior: contain`, hỗ trợ safe-area insets cho thiết bị có tai thỏ/thanh điều hướng.
- **Weather matrix sticky label:** Chuyển `#weatherMatrixTable` sang `border-collapse: separate; border-spacing: 0;` và cấu hình `.matrix-row-label` cố định `position: sticky; left: 0; z-index: 20` kèm background solid và đổ bóng phân cách cạnh phải. Khi cuộn ngang trên mobile, cột tên chỉ số luôn ghim chắc chắn, không bị che mất hoặc nhìn xuyên thấu, đồng bộ cả theme tối và sáng.
- **Lưới thẻ địa điểm auto-fill:** `#spotsGridContainer` áp dụng class `.spots-grid` với `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` trên desktop, tự động lấp đầy khoảng trống ở mọi độ phân giải thay vì số cột cố định cứng `lg:grid-cols-5`. Trên mobile chuyển sang 2 cột co giãn theo nội dung, loại bỏ chiều cao cố định `calc((100vw - 4.5625rem)/2)` để thẻ không bị cắt chữ.
- **Sửa lỗi tràn chữ slider thời gian:** Cấu hình `#lblSkyPhaseDescription` với `white-space: nowrap; text-overflow: ellipsis;` kèm tooltip `title`, chống tràn đè lên thanh trượt slider khi mô tả thiên thể dài.

#### Kết quả kiểm tra Phase 5

- 5 modal mở/đóng mượt mà qua `openToolModal()` / `closeToolModal()`, hiển thị chuẩn desktop centered glass và mobile 100dvh full-screen.
- Cuộn ngang ma trận thời tiết giữ cột nhãn cố định `left: 0`, tương thích theme sáng và tối.
- Lưới thẻ địa điểm hiển thị cân đối, tự động phân bố số cột theo độ rộng màn hình.


### Chuẩn hóa Auto Layout cho Toàn bộ các Thẻ còn lại (All Remaining Workspace Cards)

- **Thẻ 1 — Bản đồ Radar & Phương vị (`.workspace__map`):** Tái cấu trúc toolbar bản đồ thành khung Auto-Layout 2 hàng chuẩn: Hàng 1 gồm Tiêu đề bản đồ (trái) và Cụm chuyển đổi bản đồ nền (phải); Hàng 2 là dải nút bật/tắt lớp phủ (Ô nhiễm sáng, Mây mô phỏng, Tia phương vị) xếp ngang liên tục, trên mobile tự động chuyển thành thanh chip cuộn ngang mượt mà, triệt tiêu hiện tượng nút bản đồ nền bị rớt dòng lẻ loi.
- **Thẻ 2 — Vòm Thiên Đỉnh & Lịch Ephemeris (`.workspace__side`):** Tái cấu trúc header vòm thiên đỉnh với Hàng 1 gồm Tiêu đề (trái) và Huy hiệu trạng thái ngày/đêm (phải) căn chỉnh ngang hàng hoàn hảo; phần mô tả đặt ngay bên dưới tiêu đề. Đồng thời bổ sung `min-w-0` và `truncate` cho 3 thẻ thông số Mặt Trời / Mặt Trăng / Thiên thể ở chân vòm thiên đỉnh để không bị tràn vỡ khi thu hẹp cột.
- **Thẻ 3 — Ma trận thời tiết (`#weatherMatrixSection`):** Gom header thành khung Auto-Layout dọc 3 tầng rành mạch: Tầng 1 (Tiêu đề & icon), Tầng 2 (Mô tả công thức điểm sương), Tầng 3 (Dải tab chọn 7 ngày cuộn ngang). Loại bỏ hiện tượng các tab ngày nhảy dòng bất định tùy độ rộng màn hình.
- **Thẻ 4 — Hướng dẫn Setup Thiết bị & Săn ảnh (`#cameraSetupSection`):** Gom cụm điều khiển bên phải thành Auto-Layout 2 hàng căn lề phải trên desktop: Hàng trên là ô chọn sự kiện (`#setupEventControl`), hàng dưới là cụm nút chọn thiết bị (`#gearModeControls`). Chuẩn hóa 4 thẻ thông số ống kính/khẩu độ/tốc độ/ISO với `flex-col justify-between min-w-0` đảm bảo chiều cao đồng đều 100%.
- **Thẻ 5 — Danh bạ địa điểm săn ảnh (`#spotsDirectorySection`):** Tách header thành Tiêu đề/mô tả bên trái và Dải nút lọc vùng miền bên phải. Trên màn hình hẹp, các nút lọc miền tự động chuyển thành thanh ribbon cuộn ngang không che khuất hay vỡ hàng.

### Cải tiến Bố cục Thanh Thời gian Mobile (Auto-Layout Master Time Card)

- **Tái cấu trúc 3 nhóm dọc chuẩn Auto-Layout trên mobile (< 640px):** Khắc phục triệt để tình trạng thẻ thời gian phình to ~380px (10 dòng lộn xộn, preset vỡ thành 3 hàng, slider và thiên thể bị đóng khung hộp lẻ loi) thành một thẻ thời gian tinh gọn (~200px, giảm ~48% chiều cao).
- **Nhóm 1 (Ngày & Dải mốc thiên văn):** Ô chọn ngày chiếm trọn hàng ngang; cụm 5 nút mốc thiên văn chuyển thành thanh chip cuộn ngang mượt mà (`overflow-x: auto; flex-wrap: nowrap`), triệt tiêu hoàn toàn hiện tượng vỡ hàng; nút "Hiện tại" được ưu tiên xếp đầu tiên.
- **Nhóm 2 (Điều khiển tua giờ & Slider):** Dùng CSS Grid kết hợp `display: contents` để gom nút Play (Fixed), thông tin giờ/tuần trăng (Fill) và ô chọn tốc độ (Hug) trên hàng trên; thanh trượt thời gian slider kéo dài 100% bề ngang ở hàng dưới, tối ưu hóa thao tác vuốt chạm bằng ngón tay cái.
- **Nhóm 3 (Mục tiêu thiên thể):** Loại bỏ khung viền hộp tối cồng kềnh, chuyển nhãn "Thiên thể:" (Hug) và dropdown chọn thiên thể (Fill) lên cùng một hàng ngang duy nhất. Đồng bộ phân cách viền 1px tinh tế cho cả theme tối và sáng.

### Cải tiến Bố cục Thanh Thời gian Desktop (Auto-Layout Master Time Card)

- **Tái cấu trúc 2 hàng chuẩn Auto-Layout:** Thay thế bố cục 3 cột bị rớt dòng lởm chởm (nút nhảy mốc thiên văn bị bẻ thành 3 hàng và ô timeline bị đóng khung hộp lẻ loi) bằng cấu trúc 2 hàng chuẩn Auto-Layout trên desktop (>=640px).
- **Hàng 1 (Ngày & Mốc thiên văn):** Chọn ngày và 5 nút mốc thiên văn (ưu tiên Hiện tại ở đầu tiên, tiếp theo là Bình minh, Hoàng hôn, Chập tối TV, Đỉnh Thiên Thể) trải ngang trên một hàng duy nhất với phân cách nhẹ và whitespace-nowrap, không còn bị rớt dòng.
- **Hàng 2 (Trình phát, Slider toàn dải & Mục tiêu thiên thể):** Cụm phát/tốc độ, thanh slider tua giờ chiếm trọn không gian còn lại (lex: 1 1 0) với hiển thị giờ và tuần trăng cân xứng, cùng ô chọn thiên thể ở góc phải. Chiều cao toàn thẻ giảm ~35%, giao diện gọn gàng và đồng bộ.