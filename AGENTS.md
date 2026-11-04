# StarWatch — hướng dẫn cho agent

## Bắt buộc: đọc tài liệu cấu trúc trước

Trước khi đọc code, sửa file hoặc chạy lệnh, hãy đọc **toàn bộ `STRUCTURE.md`** ở thư mục gốc.

`STRUCTURE.md` mô tả:

- cây thư mục và vai trò từng module,
- luồng khởi động của ứng dụng,
- hướng phụ thuộc và event bus,
- thứ tự nạp CSS,
- cách chạy local và deploy GitHub Pages.

Chỉ sau khi đọc xong mới bắt đầu mở các file trong `js/`, `assets/css/` và `index.html`.

## Bối cảnh dự án

StarWatch là static site xem bầu trời / săn ảnh thiên văn, giao diện tiếng Việt, deploy trực tiếp lên GitHub Pages tại:

```
https://kingescaped.github.io/starwatch/
```

## Quy tắc không được phá vỡ

1. **Không có build step.** Không thêm bundler, không đổi sang framework. Code chạy trực tiếp trên GitHub Pages.
2. **Dùng native ES modules.** `index.html` chỉ nạp `js/main.js`; mọi import dùng đường dẫn tương đối có đuôi `.js`.
3. **Giữ nguyên tiếng Việt** trong toàn bộ UI, thông báo và tooltip.
4. **Không đổi hoặc xoay vòng Carto API key** trong `js/config/carto.js` — key được dùng nội bộ.
5. **Giữ thứ tự nạp CSS:**
   `tokens.css` → `layout.css` → `theme-light.css` → `components.css`.
6. **Giữ hướng phụ thuộc một chiều.** `js/ui/*` không được import `js/app/actions.js`. Renderer phát sự kiện qua `js/core/events.js`; `js/app/events.js` là nơi duy nhất đăng ký handler.
7. **Không tạo vòng import.** Nếu cần chia sẻ instance hoặc dữ liệu dùng chung, tạo module nhỏ riêng (ví dụ `js/map/context.js`).
8. **Không đổi định dạng localStorage** đang dùng: `skyradar_custom_spots_v1`, `starwatch_favorite_spots_v1`, `skyradar_carto_api_key`, …

## Bản đồ nhanh

| Cần sửa gì | Vào đâu |
| --- | --- |
| Giao diện, modal, nút | `index.html` + `assets/css/components.css` |
| Màu, theme | `assets/css/tokens.css` |
| Bố cục, active spot bar | `assets/css/layout.css` |
| State toàn cục | `js/core/state.js` |
| Sự kiện DOM | `js/app/events.js` |
| Chọn địa điểm / refresh view | `js/app/actions.js` |
| Dữ liệu địa điểm, thiên thể, lịch | `js/data/` |
| Công thức thiên văn | `js/astro/` |
| Thời tiết, geocoding, favorites | `js/services/` |
| Bản đồ, overlay, Bortle | `js/map/` |
| Renderer từng vùng UI | `js/ui/` |

## Chạy và kiểm tra

ES modules không chạy qua `file://`, phải dùng HTTP:

```bash
python -m http.server 8123
# hoặc: npx serve .
```

Mở `http://127.0.0.1:8123/` và kiểm tra tối thiểu:

- không có lỗi module trong console,
- 15 địa điểm / 15 thẻ hiển thị,
- bản đồ có tile,
- weather matrix có dữ liệu,
- chọn thẻ địa điểm, đổi giờ, mở modal lịch hoạt động.

## Khi sửa xong

- Cập nhật `STRUCTURE.md` nếu thay đổi cấu trúc thư mục, thêm module hoặc thêm sự kiện mới.
- Chạy kiểm tra ở trên trước khi commit.
- Commit message mô tả thay đổi bằng tiếng Anh hoặc tiếng Việt, ngắn gọn.
