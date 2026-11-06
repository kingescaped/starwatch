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
│   ├── css/
│   │   ├── tokens.css          # Biến màu, theme dark/light/red-vision
│   │   ├── layout.css          # Bố cục, active spot bar, map widget
│   │   ├── theme-light.css     # Ghi đè cho light theme
│   │   └── components.css      # Modal, scrollbar, slider, animation, responsive
│   └── icons/
│       ├── sprite.svg          # Bộ biểu tượng SVG nội bộ
│       └── starwatch.svg       # Favicon ứng dụng
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
    │   ├── icons.js            # Render biểu tượng từ SVG sprite nội bộ
    │   ├── hold-confirm.js     # Gesture nhấn giữ để xác nhận thao tác phá huỷ
    │   ├── camera-guide.js     # Gợi ý setup máy ảnh
    │   ├── astro-calendar.js   # Modal lịch sự kiện thiên văn
    │   ├── tool-modal.js       # Hàm mở/đóng modal và đồng bộ animation tabview
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
| `assets/icons/` | Bộ SVG sprite dùng chung cho giao diện và favicon; icon UI không tải từ CDN. |
| `config/` | Hằng số cấu hình. `carto.js` chứa API key và URL tile của từng kiểu bản đồ. |
| `core/` | Nền tảng dùng chung: state, helper DOM, event bus. Không phụ thuộc vào UI. |
| `data/` | Dữ liệu tĩnh: địa điểm, thiên thể, lịch sự kiện, profile máy ảnh. |
| `astro/` | Toán thiên văn thuần: thời gian, tọa độ, Mặt Trời/Mặt Trăng, ephemeris, chấm điểm. |
| `services/` | Giao tiếp bên ngoài và lưu trữ: thời tiết, geocoding, favorites, custom spots. |
| `map/` | Leaflet, basemap, marker, overlay canvas và ước lượng Bortle. |
| `ui/` | Renderer cho từng vùng giao diện. Chỉ đọc state và phát sự kiện, không gọi trực tiếp action. |
| `app/` | Điều phối: `actions.js` cập nhật toàn bộ view, `events.js` gắn listener, nối event bus và đồng bộ chiều cao sticky chrome. |
| `main.js` | Bootstrap: nạp dữ liệu, khởi tạo map, đăng ký sự kiện, gọi API lần đầu. |

`ui/tool-modal.js` cung cấp `openToolModal()` và `closeToolModal()` để mọi tabview dùng chung một luồng mở/đóng. Animation theo breakpoint và cấu hình giảm chuyển động được định nghĩa tập trung trong `assets/css/components.css`.

`ui/hold-confirm.js` cung cấp `attachHoldToConfirm()` cho mọi thao tác phá huỷ: gắn `.is-holding` khi bắt đầu giữ và `.is-complete` khi giữ đủ `--hold-confirm-duration`. Phần hiển thị do component `.hold-confirm` trong `components.css` đảm nhiệm (`hold-confirm-sweep`), nên chỉ cần đổi `--hold-confirm-color`, `--hold-confirm-duration`, `--hold-confirm-glow` là dùng lại được ở nơi khác. `openToolModal()` và `closeToolModal()` gọi `resetHoldConfirmWithin()` để xoá trạng thái nhấn giữ còn lưu trong DOM của tabview (nếu không, nút sẽ mở lại ở trạng thái đã hoàn tất và không giữ tiếp được).

---

## 3. Luồng khởi động

`index.html` chỉ nạp một module duy nhất:

```html
<script type="module" src="js/main.js"></script>
```

`js/main.js` thực hiện theo thứ tự:

1. `renderIcons()` — chuyển các khai báo `data-icon` sang SVG sprite nội bộ.
2. `loadSpotsFromStorage()` — nạp địa điểm curated + địa điểm cộng đồng.
3. `loadFavoriteSpotsFromStorage()` — nạp địa điểm yêu thích.
4. Gán địa điểm mặc định (`khe-sanh`, hoặc địa điểm đầu tiên trong danh sách nếu đã xoá).
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
| `spot:delete` | `ui/spots-directory` | Yêu cầu xoá một địa điểm khỏi danh bạ và bộ nhớ; chỉ phát sau khi người dùng nhấn giữ nút "Xoá" đủ lâu. |
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

### Khung trang và sticky chrome

- `.page-shell` trong `layout.css` là frame nội dung duy nhất: rộng `min(100% - 2 * --shell-pad, --shell-max)`, căn giữa. Header, active spot bar, section thời gian, `main` và footer đều dùng frame này thay vì lặp `max-w-[1600px] px-3 sm:px-6`.
- `#appChrome` bọc header và active spot bar thành **một** frame `position: sticky; top: 0`. Hai phần con không còn `sticky` hay offset riêng, nên không cần các mốc `top: 6rem` / `6.5rem`.
- `js/app/events.js` đo chiều cao thật của `#appChrome` bằng `ResizeObserver` và ghi vào biến `--chrome-h`. `#weatherMatrixSection` dùng `scroll-margin-top: calc(var(--chrome-h) + 16px)`, nhờ vậy cuộn tới bảng thời tiết luôn dừng dưới chrome dù thanh địa điểm thu gọn hay header xuống dòng.
- Class cấu trúc dùng chung: `.app-header`, `.header-frame`, `.header-brand`, `.header-search`, `.header-tools`, `.spot-bar__inner`, `.spot-bar__identity`, `.spot-bar__info`, `.spot-bar__title-row`. Không thêm selector kiểu `nth-child` xuyên cấp cho các khối này.

### Bố cục workspace và time panel

- `main` chứa `.workspace` (CSS Grid) thay cho cụm utility `grid xl:grid-cols-12`. Dưới `1024px` workspace là một cột; từ `1024px` chia `7/5` qua `.workspace__map` / `.workspace__side`; từ `1440px` đổi thành `8/4`.
- `#masterTimeLayout` trên desktop (>=640px) là khung Auto-Layout 2 hàng: hàng 1 gộp chọn ngày và 5 nút mốc thiên văn trải ngang liên tục; hàng 2 gộp cụm điều khiển phát, thanh trượt giờ toàn dải (`flex: 1 1 0`) và ô chọn thiên thể ở góc phải. Trên mobile (<640px) là khung Auto-Layout 3 nhóm dọc tinh gọn (~200px): ngày full-width + ribbon chip mốc thiên văn cuộn ngang, cụm điều khiển phát/giờ/tốc độ + slider 100% bề ngang, và hàng chọn thiên thể tinh gọn không khung viền.
- Leaflet tự co giãn nhờ `ResizeObserver` + `syncLeafletMapSize()` trong `js/map/map.js`; khi đổi breakpoint không cần gọi `invalidateSize()` thủ công.
- Media query của workspace nằm trong `layout.css`; media query của time panel nằm trong `components.css`.
- Toàn bộ các thẻ chính (Bản đồ GIS, Vòm thiên đỉnh & Ephemeris, Ma trận thời tiết, Setup thiết bị, Danh bạ địa điểm) đều áp dụng chuẩn Auto-Layout: phân tách rõ hàng tiêu đề (trái) và bộ điều khiển/chuyển đổi (phải), các dải tab/nút lọc/lớp phủ cuộn ngang không rớt dòng, các thẻ con trong grid có độ cao và flex phân phối đồng đều.

### Mobile chrome và overlay

- Header mobile một hàng: brand + nút `#btnToggleMobileSearch`; ô tìm kiếm `#headerSearchPanel` chuyển thành panel `position: fixed` dưới header khi `<html>` có class `mobile-search-open`. Nút `#btnCloseMobileSearch`, phím Escape và click ra ngoài đều đóng panel.
- `#activeSpotBar` trên mobile cao `48px`. Khi mở rộng, `#activeSpotTelemetry` và `#activeSpotActions` được định vị tuyệt đối trong panel dưới bar; `::after` của bar tạo nền panel. Vì vậy chiều cao chrome không đổi khi mở/đóng chi tiết.
- `js/app/events.js` tự thu gọn bar khi viewport mobile, đồng bộ lại khi đổi breakpoint và khi `load`/`resize`; trên desktop bar mặc định mở rộng.
- Nhãn bottom nav là text thật trong `index.html` (`Địa điểm`, `Sự kiện`, `Đóng góp`, `Hướng dẫn`, `Cài đặt`), không dùng pseudo-element `::after`.
- Các widget nổi trên bản đồ (`#mapAzimuthLegend`, `#cartoSandboxNotice`, `#himawariControlPanel`) nằm trong một layer `.map-overlays` dạng grid; layer có `pointer-events: none` và từng widget bật lại `pointer-events: auto`.

### Modal shell, ma trận thời tiết và lưới thẻ địa điểm (Phase 5)

- 6 tool modal (`#modalContributeSpot`, `#modalAstroCalendar`, `#modalSpotsDirectory`, `#modalUserGuide`, `#modalAppInfo`, `#modalSettings`) dùng chung cấu trúc shell `.tool-modal`, `.tool-modal__panel`, `.tool-modal__header`, `.tool-modal__body`, `.tool-modal__footer`. Trên mobile (dưới `640px`) thanh `#mobileToolNav` luôn nổi cố định ở lớp trên cùng (`z-index: 2500`) được chuyển trực tiếp vào `document.body` qua `syncNavPlacement()` (trên desktop tự trả về `.header-frame`). Panel modal chiếm trọn `100dvh` liền mạch, các vùng cuộn bên trong (`.tool-modal__body`) được đệm đáy `calc(5.5rem + env(safe-area-inset-bottom))`. Đối với modal có footer cố định đáy như `#modalUserGuide`, `.tool-modal__footer` áp dụng Auto-Layout đối xứng chuẩn `12px`: khoảng cách từ khung mẹo tới nút "Đã hiểu" và từ nút "Đã hiểu" tới `#mobileToolNav` đều bằng đúng `12px` (`0.75rem`), đệm đáy `calc(5.75rem + env(safe-area-inset-bottom))` giúp giao diện cân đối hoàn hảo không bị xô lệch hay che khuất.
- `#weatherMatrixTable` dùng `border-collapse: separate; border-spacing: 0` và `.matrix-row-label` (`position: sticky; left: 0; z-index: 20`) giúp cột nhãn cố định khi cuộn ngang trên mobile ở cả theme tối và sáng.
- `#spotsGridContainer` nằm trọn trong tabview `#modalSpotsDirectory` với cấu trúc Auto-Layout hiện đại, phân loại theo 3 miền / yêu thích, hỗ trợ chế độ bật/tắt xoá địa điểm linh hoạt (`#btnToggleDeleteSpotMode`). Nút xoá trên thẻ dùng gesture nhấn giữ (`.hold-confirm` + `ui/hold-confirm.js`) thay cho hộp thoại `confirm()`, và nằm trong hàng hành động cao cố định (`.spot-card-actions`) để bật/tắt chế độ xoá không làm xê dịch lưới.
- Toàn bộ các thẻ chính (Bản Đồ, Vòm Thiên Đỉnh 360°, Lịch Thiên Văn Trong Ngày, Ma Trận Phân Tầng Mây, Hướng Dẫn Setup Chụp Thiên Văn, Địa Điểm Săn Ảnh) tuân theo Typography thống nhất trong `DESIGN.md`: `.card-heading` (Desktop 15px, Mobile 14px bold), `.section-description` (Desktop 12px, Mobile 11px).
- Nút toggle layer bản đồ (`#mapOverlayToggles`) trên mobile sử dụng layout CSS Grid 3 cột đều (`repeat(3, minmax(0, 1fr))`) vừa khít chiều ngang, không roll ngang, nhãn ngắn gọn ("Ô nhiễm", "Mây", "Phương vị") và hiệu ứng sáng/mờ khi bật/tắt.
- Lớp overlay bản đồ `.map-overlays` dùng padding đều 0.5rem (mobile) / 12px (desktop); khoảng bù tránh nút zoom Leaflet được gán riêng cho `#mapAzimuthLegend` (`margin-left: 2.5rem`), giữ cho thanh mô phỏng `#himawariControlPanel` ở đáy bản đồ không bị thụt lùi bên trái.

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
- Tailwind và Leaflet vẫn dùng CDN; biểu tượng giao diện lấy từ SVG sprite nội bộ trong `assets/icons/`.
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
