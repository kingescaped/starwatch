# Cấu trúc mới của StarWatch

Tài liệu này ghi lại cách mã nguồn StarWatch được tách từ **một file `index.html` duy nhất** thành cấu trúc thư mục nhiều module, trong khi vẫn giữ nguyên toàn bộ giao diện tiếng Việt, hành vi ứng dụng và khả năng deploy trực tiếp lên GitHub Pages.

---

## 1. Trước và sau khi tách

### Trước

Toàn bộ ứng dụng nằm trong một file:

```
StarWatch/
└── index.html        (~6.200 dòng)
    ├── <style>       CSS inline (tokens, layout, theme, components)
    ├── HTML          toàn bộ giao diện
    └── <script>      toàn bộ logic JS (dữ liệu, thiên văn, thời tiết,
                      bản đồ, renderer, sự kiện DOM…)
```

Hạn chế: khó đọc, khó sửa, mọi thay đổi đều nằm chung một file và rất dễ xung đột.

### Sau

```
StarWatch/
├── index.html                  # Vỏ HTML + link CSS + entry module
├── assets/
│   └── css/
│       ├── tokens.css          # Biến màu, theme dark/light/red-vision
│       ├── layout.css          # Bố cục, active spot bar, map widget
│       ├── theme-light.css     # Ghi đè cho light theme
│       └── components.css      # Modal, scrollbar, slider, animation, responsive
└── js/
    ├── main.js                 # Điểm khởi động ứng dụng
    ├── config/
    │   └── carto.js            # Cấu hình Carto + API key (giữ nguyên)
    ├── core/
    │   ├── state.js            # Trạng thái toàn cục
    │   ├── utils.js            # DOM helper, escape HTML, Nominatim queue
    │   └── events.js           # Event bus nội bộ
    ├── data/
    │   ├── spots.js            # Danh sách địa điểm curated
    │   ├── celestial.js        # Catalog thiên thể (J2000)
    │   ├── calendar.js         # Sự kiện thiên văn
    │   └── camera-profiles.js  # Thông số máy ảnh theo cảnh/thiết bị
    ├── astro/
    │   ├── time.js             # Julian date, sidereal time, GMT+7
    │   ├── coordinates.js      # Equatorial → Horizontal, khúc xạ khí quyển
    │   ├── sun-moon.js         # Vị trí Mặt Trời / Mặt Trăng
    │   ├── ephemeris.js        # Tổng hợp lịch thiên văn trong ngày
    │   └── scoring.js          # Điểm Milky Way / Afterglow / Cloud Sea
    ├── services/
    │   ├── weather.js          # Open-Meteo + dữ liệu fallback
    │   ├── geocoding.js        # Reverse geocode, GPS, Nominatim
    │   ├── favorites.js        # Địa điểm yêu thích (localStorage)
    │   └── spots-store.js      # Địa điểm cộng đồng (localStorage)
    ├── map/
    │   ├── map.js              # Khởi tạo Leaflet, basemap, marker, Bortle
    │   ├── overlays.js         # Canvas overlay: Bortle, mây, azimuth
    │   ├── context.js          # Tham chiếu map dùng chung
    │   └── light-domes.js      # Các đô thị ô nhiễm sáng lớn
    ├── ui/
    │   ├── camera-guide.js     # Gợi ý setup máy ảnh
    │   ├── astro-calendar.js   # Modal lịch sự kiện thiên văn
    │   ├── sky-dome.js         # Sky dome + biểu đồ độ cao 24h
    │   ├── weather-matrix.js   # Bảng thời tiết theo giờ + tab ngày
    │   └── spots-directory.js  # Lưới thẻ địa điểm
    └── app/
        ├── actions.js          # Hành động cấp ứng dụng
        └── events.js           # DOM listener + nối event bus
```

`index.html` hiện chỉ còn phần khung HTML (khoảng 1.360 dòng), không còn CSS hay logic JS inline.

---

## 2. Vai trò từng nhóm module

| Thư mục | Trách nhiệm |
| --- | --- |
| `config/` | Hằng số cấu hình. `carto.js` chứa API key và URL tile của từng kiểu bản đồ. |
| `core/` | Nền tảng dùng chung: state, helper DOM, event bus. Không phụ thuộc vào UI. |
| `data/` | Dữ liệu tĩnh: địa điểm, thiên thể, lịch sự kiện, profile máy ảnh. |
| `astro/` | Toán thiên văn thuần: thời gian, tọa độ, Mặt Trời/Mặt Trăng, ephemeris, chấm điểm. |
| `services/` | Giao tiếp bên ngoài và lưu trữ: thời tiết, geocoding, favorites, custom spots. |
| `map/` | Leaflet, basemap, marker, overlay canvas và ước lượng Bortle. |
| `ui/` | Renderer cho từng vùng giao diện. Chỉ đọc state và phát sự kiện, không gọi trực tiếp action. |
| `app/` | Điều phối: `actions.js` cập nhật toàn bộ view, `events.js` gắn listener và nối event bus. |
| `main.js` | Bootstrap: nạp dữ liệu, khởi tạo map, đăng ký sự kiện, gọi API lần đầu. |

---

## 3. Luồng khởi động

`index.html` chỉ nạp một module duy nhất:

```html
<script type="module" src="js/main.js"></script>
```

`js/main.js` thực hiện theo thứ tự:

1. `lucide.createIcons()` — render icon.
2. `loadSpotsFromStorage()` — nạp địa điểm curated + địa điểm cộng đồng.
3. `loadFavoriteSpotsFromStorage()` — nạp địa điểm yêu thích.
4. Gán địa điểm mặc định (`khe-sanh`).
5. `initAppEvents()` — đăng ký các handler của event bus.
6. `initEventListeners()` — gắn toàn bộ listener DOM.
7. `initVietnamMap()` — khởi tạo Leaflet.
8. `fetchWeatherForActiveSpot()` — gọi Open-Meteo.
9. `updateFavoriteButton()` và `initializeLocationConsent()`.

---

## 4. Hướng phụ thuộc và event bus

### Nguyên tắc

Luồng phụ thuộc được thiết kế **một chiều**:

```
data / config / core
        ↓
      astro
        ↓
     services
        ↓
        ui
        ↓
    app (actions / events)
        ↓
      main.js
```

`ui/` không còn import `app/actions.js`. Thay vào đó, renderer phát một sự kiện qua `core/events.js`, và `app/events.js` quyết định gọi action nào. Nhờ vậy không còn vòng import giữa renderer và action.

### Event bus

`js/core/events.js` là một bus tối giản dựa trên `EventTarget`:

```js
emit(name, detail);  // phát sự kiện
on(name, handler);   // đăng ký lắng nghe
```

Các sự kiện đang dùng:

| Sự kiện | Nơi phát | Ý nghĩa |
| --- | --- | --- |
| `spot:select` | `ui/spots-directory`, `ui/astro-calendar`, `map/map`, `services/geocoding` | Chọn một địa điểm; có thể kèm `flyMap`, `scrollToMatrix`. |
| `spot:reverse-geocode` | `map/map` | Yêu cầu tra tên địa danh cho tọa độ vừa click. |
| `app:refresh` | `ui/weather-matrix` | Cập nhật lại toàn bộ view sau khi đổi giờ/ngày. |
| `ui:scroll-to-matrix` | `ui/astro-calendar` | Cuộn tới bảng thời tiết. |
| `weather:updated` | `services/weather` | Dữ liệu thời tiết mới đã sẵn sàng. |

`initAppEvents()` trong `js/app/events.js` là nơi duy nhất đăng ký các handler này.

### Ghi chú về `map/context.js`

`map/overlays.js` cần đọc instance Leaflet, còn `map/map.js` lại cần gọi `drawMapCanvasOverlays()`. Để tránh vòng import, instance map được đặt trong `map/context.js`:

```js
export let leafletMap = null;
export function setLeafletMap(map) { leafletMap = map; }
```

`map/map.js` gọi `setLeafletMap(...)` khi khởi tạo và vẫn re-export `leafletMap` để code cũ dùng được như trước.

---

## 5. Thứ tự nạp CSS

Thứ tự cascade được giữ đúng như file gốc:

```html
<link rel="stylesheet" href="assets/css/tokens.css" />
<link rel="stylesheet" href="assets/css/layout.css" />
<link rel="stylesheet" href="assets/css/theme-light.css" />
<link rel="stylesheet" href="assets/css/components.css" />
```

- `tokens.css` — biến màu và theme.
- `layout.css` — bố cục và các khối lớn.
- `theme-light.css` — ghi đè khi bật light theme.
- `components.css` — chi tiết component, modal, slider, animation, responsive.

Không đổi thứ tự này, nếu không giao diện có thể bị ghi đè sai.

---

## 6. Chạy thử ở máy local

Vì dùng **native ES modules**, trình duyệt không cho phép `import` khi mở file qua `file://`. Cần chạy qua HTTP:

```bash
# Cách 1: Python
python -m http.server 8123

# Cách 2: Node
npx serve .

# Cách 3: VS Code Live Server
```

Sau đó mở:

```
http://127.0.0.1:8123/
```

> Mở trực tiếp `index.html` bằng cách double-click sẽ báo lỗi module. Đây là giới hạn của ES modules, không phải lỗi code.

---

## 7. Ghi chú khi deploy GitHub Pages

- Không cần build step. Đẩy nguyên thư mục lên GitHub Pages là chạy.
- Tất cả đường dẫn đều **tương đối** (`assets/...`, `js/...`) nên hoạt động cả ở root domain lẫn `username.github.io/repo/`.
- Tailwind, Leaflet, Lucide vẫn dùng CDN như trước.
- API key Carto được giữ nguyên trong `js/config/carto.js`, không đổi và không xoay vòng (dùng nội bộ).
- Các module được phục vụ với MIME type `text/javascript`; GitHub Pages xử lý đúng.
- Nếu từng deploy bản cũ, chỉ cần ghi đè `index.html` và thêm thư mục `assets/`, `js/`.

---

## 8. Những gì được giữ nguyên

- Toàn bộ giao diện và text tiếng Việt.
- Hành vi: chọn địa điểm, tìm kiếm, lọc, bản đồ, overlay, weather matrix, sky dome, lịch thiên văn, favorites, đóng góp địa điểm, GPS, theme.
- Cấu hình CDN và API key Carto.
- Định dạng dữ liệu trong `localStorage` (`skyradar_custom_spots_v1`, `starwatch_favorite_spots_v1`, …).

Chỉ có cấu trúc file thay đổi; logic nghiệp vụ và giao diện giữ nguyên.
