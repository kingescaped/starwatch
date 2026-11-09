<div align="center">

  <img src="assets/icons/starwatch.svg" alt="StarWatch Logo" width="88" height="88" />

  # StarWatch
  ### Nền Tảng Quan Sát Bầu Trời & Lên Kế Hoạch Săn Ảnh Thiên Văn

  *Chạm vào Vũ Trụ · Bắt trọn Khoảnh Khắc Bầu Trời*

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-8b5cf6?style=for-the-badge&logo=githubpages&logoColor=white)](https://kingescaped.github.io/starwatch/)
  [![Version](https://img.shields.io/badge/Version-v1.0-38bdf8?style=for-the-badge)](CHANGELOG.md)
  [![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
  [![Architecture](https://img.shields.io/badge/Build%20Step-Zero%20Build-f59e0b?style=for-the-badge)](STRUCTURE.md)

  [**Trải Nghiệm Trực Tiếp**](https://kingescaped.github.io/starwatch/) • [**Cấu Trúc Mã Nguồn**](STRUCTURE.md) • [**Hệ Thống Thiết Kế**](DESIGN.md) • [**Báo Lỗi & Góp Ý**](https://github.com/kingescaped/starwatch/issues)

</div>

---

## 🌌 Giới Thiệu

**StarWatch** là ứng dụng web mã nguồn mở dành riêng cho cộng đồng yêu thiên văn, nhiếp ảnh gia phong cảnh và săn ảnh bầu trời đêm (*Astrophotography*) tại Việt Nam.

Ứng dụng cung cấp bộ công cụ toàn diện giúp người dùng:
- Tra cứu cấp độ ô nhiễm sáng theo thang đo chuẩn **Bortle Scale** (1–9).
- Theo dõi độ cao, phương vị của **Dải Ngân Hà (Milky Way)**, Mặt Trời, Mặt Trăng và các chòm sao theo thời gian thực.
- Phân tích khí tượng chuyên sâu với **Ma trận mây đa tầng** (mây thấp, mây trung, mây cao, tầm nhìn, độ ẩm, điểm sương).
- Tính toán thông số chụp ảnh máy cơ tối ưu (tiêu cự, khẩu độ, ISO, thời gian phơi sáng an toàn theo quy tắc NPF/500 rule).
- Lên lịch trình săn ảnh với kho dữ liệu các sự kiện mưa sao băng, nhật thực/nguyệt thực lớn trong năm.

---

## ✨ Tính Năng Nổi Bật

### 🗺️ 1. Bản Đồ GIS & Ô Nhiễm Ánh Sáng (Bortle Scale)
- Tích hợp nền bản đồ vệ tinh/dark GIS độ nét cao thông qua **Leaflet** & **Carto Basemaps**.
- Dải màu động 5 cấp độ (Xanh lá → Xanh chanh → Vàng → Cam → Đỏ) mô tả trực quan mức độ ô nhiễm sáng từ Bortle 1.0 đến 9.0.
- Canvas Overlay biểu diễn hướng **Tia phương vị thiên thể (Azimuth)** và mô phỏng lớp phủ mây vệ tinh thời gian thực.

### 🔭 2. Vòm Thiên Đỉnh 360° & Đồ Thị Ephemeris
- Vòm trời tương tác 360° trực quan hóa tọa độ thiên văn chân trời (Alt/Azimuth) của Dải Ngân Hà và các thiên thể chính.
- Biểu đồ quỹ đạo 24 giờ tính toán chính xác thời điểm Ngân Hà mọc, đỉnh triều thiên đỉnh (Zenith) và thời gian lặn.
- Thuật toán chấm điểm điều kiện săn ảnh tự động: Điểm Milky Way, Khả năng săn Biển mây (*Cloud Sea*) và Điểm ráng hoàng hôn (*Afterglow*).

### ☁️ 3. Ma Trận Thời Tiết Phân Tầng Theo Giờ
- Đồng bộ dữ liệu khí tượng chuẩn xác từ API **Open-Meteo**.
- Phân tích chi tiết độ che phủ mây theo 3 tầng (Low / Mid / High Cloud Cover), hướng gió, tốc độ gió, độ ẩm và chỉ số điểm sương.
- Hỗ trợ xem dự báo 7 ngày liên tiếp và tua nhanh/chậm dòng thời gian để chọn khung giờ "vàng" lý tưởng nhất.

### 📷 4. Gợi Ý Setup Máy Ảnh (Astro Setup Advisor)
- Bộ tính toán chuyên sâu cho máy ảnh Full-Frame, APS-C và M4/3.
- Đề xuất tiêu cự, khẩu độ tối ưu, ISO khuyến nghị theo mức Bortle thực tế và thời gian phơi sáng tối đa chống vệt sao (*Star Trails*).
- Hướng dẫn kỹ thuật chụp Stack ảnh Milky Way, Panorama toàn cảnh và Timelapses.

### 📅 5. Lịch Thiên Văn & Điểm Săn Ảnh Tối Ưu
- Lịch trình đầy đủ các đợt mưa sao băng lớn (Perseids, Geminids, Quadrantids...), pha Mặt Trăng (*New Moon, Full Moon*).
- Điều hướng thông minh: Chạm vào sự kiện để tự động nạp vị trí lý tưởng nhất trên bản đồ và cấu hình máy ảnh tương ứng.

### 📍 6. Danh Bạ Địa Điểm Curated & Cộng Đồng
- Danh mục sẵn có các địa điểm săn ảnh thiên văn nổi tiếng tại Việt Nam (Khau Phạ, Tà Xùa, Mẫu Sơn, Khe Sanh, Kê Gà, Đắk Lắk...).
- Hỗ trợ lưu địa điểm yêu thích và thêm mới toạ độ cá nhân linh hoạt, lưu trữ an toàn trong `localStorage`.
- Thao tác bảo vệ dữ liệu với gesture **Nhấn giữ để xác nhận (Hold-to-Confirm)** hiện đại thay cho hộp thoại trình duyệt thô ráp.

### 🔴 7. Chế Độ Bảo Vệ Thị Lực Thực Địa (Red-Vision Mode)
- Cung cấp 3 giao diện hiển thị: **Dark Theme (Mặc định)**, **Light Theme** và **Field Red-Vision (Đèn Đỏ)**.
- Chế độ Đèn Đỏ giữ cho đồng tử mắt thích ứng hoàn hảo với bóng tối khi tác nghiệp quan sát thực tế ngoài hiện trường.

---

## 🛠️ Công Nghệ & Kiến Trúc

Dự án được xây dựng với triết lý **tinh gọn, tải nhanh và không phụ thuộc vào chuỗi build phức tạp**:

- **Core & Runtime**: HTML5, Vanilla JavaScript (**Native ES Modules** chuẩn ESM).
- **Styling**: Tailwind CSS (CDN), Custom CSS Tokens, Hệ thống Auto-Layout đối xứng chuẩn 12px.
- **GIS & Mapping**: Leaflet.js v1.9.4, Carto Dark Matter / Positron Tiles, Canvas 2D Overlay.
- **Dữ liệu & Thuật toán**:
  - Dữ liệu khí tượng: Open-Meteo API.
  - Tọa độ địa lý: OpenStreetMap Nominatim Geocoding.
  - Toán thiên văn: VSOP87, công thức chuyển đổi hệ tọa độ xích đạo sang tọa độ chân trời, khúc xạ quang học khí quyển, Julian Date & Sidereal Time (GMT+7).
- **Bộ nhớ cục bộ**: `localStorage` (quản lý danh bạ yêu thích, điểm tùy biến).
- **Triển khai (Deployment)**: Static site deploy trực tiếp 100% trên **GitHub Pages**, **Zero Build Step** (không cần Node.js, Webpack hay Vite).

---

## 📂 Cấu Trúc Thư Mục

```
StarWatch/
├── index.html                  # Vỏ HTML duy nhất + Entry module
├── assets/
│   ├── css/
│   │   ├── tokens.css          # Design tokens: màu sắc, typography, spacing
│   │   ├── layout.css          # Hệ khung workspace, sticky chrome, grid
│   │   ├── theme-light.css     # Giao diện sáng
│   │   └── components.css      # Auto-layout modal, slider, hold-confirm, animations
│   └── icons/
│       ├── sprite.svg          # Bộ biểu tượng SVG sprite nội bộ (zero CDN icon)
│       └── starwatch.svg       # Brand icon & Favicon
└── js/
    ├── main.js                 # Bootstrap ứng dụng
    ├── config/carto.js         # Cấu hình bản đồ Carto
    ├── core/                   # State toàn cục, Event bus nội bộ, DOM utilities
    ├── data/                   # Catalog thiên thể J2000, địa điểm curated, lịch thiên văn
    ├── astro/                  # Toán thiên văn thuần (thời gian, tọa độ, ephemeris, scoring)
    ├── services/               # Kết nối API thời tiết Open-Meteo, Geocoding, lưu trữ
    ├── map/                    # Leaflet GIS, canvas overlays (Bortle, Mây, Phương vị)
    ├── ui/                     # UI renderers (Sky Dome, Weather Matrix, Spots Grid, Modal...)
    └── app/                    # Actions & Event listeners điều phối hệ thống
```

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Local Development)

Do StarWatch sử dụng **Native ES Modules**, trình duyệt chặn lệnh `import` nếu mở file trực tiếp qua giao thức `file:///`. Bạn chỉ cần khởi chạy một HTTP server tĩnh đơn giản:

### Cách 1: Sử dụng Python (khuyên dùng)
```bash
python -m http.server 8123
```

### Cách 2: Sử dụng Node.js / npx
```bash
npx serve .
```

### Cách 3: Sử dụng Extension VS Code
Cài đặt extension **Live Server** và nhấn **Go Live** tại file `index.html`.

> Sau khi khởi động server, truy cập ứng dụng tại: `http://127.0.0.1:8123/`

---

## 🌐 Triển Khai Lên GitHub Pages

Dự án không có build step nên việc triển khai lên GitHub Pages hoàn toàn tự động:
1. Đẩy mã nguồn lên repository GitHub của bạn (`git push origin main`).
2. Vào **Settings** > **Pages** trên repository.
3. Tại mục **Build and deployment**, chọn **Source** là `Deploy from a branch`.
4. Chọn nhánh `main` và thư mục `/(root)`. Nhấn **Save**.
5. Website sẽ tự động xuất bản tại địa chỉ: `https://<your-username>.github.io/<repo-name>/`.

---

## 👨‍💻 Tác Giả & Liên Hệ

- **Tác giả**: Quang Vo ([@kingescaped](https://github.com/kingescaped))
- **Email**: [kingescaped.dev@gmail.com](mailto:kingescaped.dev@gmail.com)
- **Telegram**: [@kingescaped](https://t.me/kingescaped)
- **Dự án**: [StarWatch trên GitHub](https://github.com/kingescaped/starwatch)

---

## 📄 Giấy Phép (License)

Dự án được phân phối dưới giấy phép mã nguồn mở **MIT License**. Mọi đóng góp, ý kiến đóng góp tính năng hoặc chia sẻ địa điểm săn ảnh mới đều được hoan nghênh nồng nhiệt!
