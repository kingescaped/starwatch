/**
 * Camera profiles for each scene and gear platform.
 * Values that depend on sky brightness / dew risk are passed in.
 */

export function buildCameraProfiles({ isDarkSky, isDewRisk, ffIsoMilkyWay, phoneIsoMilkyWay }) {
  return {
    milkyway: {
      title: '🌌 Săn Tâm Dải Ngân Hà (Milky Way Core)',
      fullframe: {
        gearTitle: 'Máy Ảnh Full-Frame / Mirrorless + Tripod Vững',
        lens: 'Ống kính Góc Siêu Rộng 14mm – 24mm (Khuyên dùng 14mm f/1.8, 16mm f/1.8, 20mm f/1.4 hoặc 24mm f/1.4)',
        aperture: 'f/1.4 – f/2.8 (Mở khẩu lớn nhất để thu tối đa photon ánh sao)',
        shutter: '13 giây – 20 giây (Theo Quy tắc NPF / 500: 15s ở 24mm · 20s ở 14-16mm để sao tròn nét)',
        iso: `ISO ${ffIsoMilkyWay}`,
        wbFocus: 'WB: 3800K – 4100K (Kéo nhẹ Tint +5 về tím) · Lấy nét tay (MF): Bật LiveView Zoom 10x vào ngôi sao sáng nhất (Sao Mộc / Antares) và xoay vòng nét đến khi điểm sao nhỏ nhất.',
        tripodNotes: `Chân máy (Tripod) carbon/nhôm chắc chắn, tắt chống rung IBIS/VR trên lens, chụp RAW 14-bit, hẹn giờ 2s hoặc dùng dây bấm mềm.${isDewRisk ? ' ⚠️ Bắt buộc quấn dây sưởi ống kính (Dew Heater) mức Trung bình.' : ''}`
      },
      iphone18pro: {
        gearTitle: 'iPhone 18 Pro / 18 Pro Max + Tripod Điện Thoại',
        lens: 'Ống kính Chính 1x (24mm f/1.78 cảm biến 48MP Quad-Pixel) — Thu sáng tốt gấp 3 lần ống 0.5x Ultra Wide',
        aperture: 'f/1.78 (Cố định quang học trên ống 1x) · Định dạng: Bật Apple ProRAW 48MP',
        shutter: 'Night Mode Max 30 giây (Tự động kích hoạt mức 30s khi iPhone gắn cố định trên Tripod không rung)',
        iso: 'Tự động tối ưu theo thuật toán Astro Stacking (Tương đương ISO 1250 – 2500 ghép đa khung)',
        wbFocus: 'Chạm giữ 2 giây vào vùng bầu trời tối để khóa AE/AF Lock · Kéo thanh bù trừ sáng (Exposure) xuống -0.3 EV đến -0.7 EV để nền trời đêm sâu và nổi khối Ngân Hà.',
        tripodNotes: 'Gắn iPhone lên ngàm kẹp Tripod chắc chắn, dùng Apple Watch hoặc hẹn giờ 3s để bấm chụp không chạm màn hình.'
      },
      androidflagship: {
        gearTitle: 'Android Flagship (Galaxy S Ultra / Xiaomi Ultra / Vivo X / Pixel Pro)',
        lens: 'Ống kính Chính 1x (23mm – 24mm cảm biến 1-inch hoặc 200MP Pixel-Binning) ở chế độ Pro / Expert RAW',
        aperture: 'f/1.6 – f/1.9 (Hoặc mở khẩu lớn nhất f/1.63 nếu có khẩu độ biến thiên)',
        shutter: '15 giây – 20 giây (Phơi đơn Pro Mode) hoặc bật chế độ Astrophotography 4 phút',
        iso: `ISO ${phoneIsoMilkyWay} · Định dạng: RAW 16-bit (DNG)`,
        wbFocus: 'WB: 3900K – 4200K · Lấy nét tay (MF): Kéo thanh Focus về mức 0.85 – 0.95 (cận vô cực, kiểm tra viền xanh Focus Peaking trên sao sáng).',
        tripodNotes: 'Gắn Tripod cố định, tắt đèn trợ nét AF, dùng bút S-Pen / giọng nói hoặc hẹn giờ 5s để kích hoạt màn trập.'
      }
    },
    deepsky: {
      title: '🌀 Thiên Hà Andromeda (M31), Tinh Vân Orion (M42) & Cụm Sao Tua Rua (M45)',
      fullframe: {
        gearTitle: 'Máy Ảnh Full-Frame + Ống Kính Tele (Có hoặc Không Star Tracker)',
        lens: 'Ống kính Tele 85mm f/1.4, 135mm f/1.8 hoặc 70-200mm f/2.8',
        aperture: 'f/1.8 – f/2.8',
        shutter: 'Không Tracker: 2.5s – 4s (ở 135mm) chụp 50–100 tấm để Stack · Có Star Tracker: 60s – 120s/tấm',
        iso: `ISO ${isDarkSky ? '1600 – 3200' : '800 – 1600'}`,
        wbFocus: 'WB: 4200K · Lấy nét tay (MF) phóng đại 10x chính xác vào tâm cụm sao.',
        tripodNotes: 'Khuyên chụp chuỗi 40–80 ảnh liên tiếp (Intervalometer) rồi ghép chồng ảnh (Stacking) bằng Sequator / Siril để giảm nhiễu.'
      },
      iphone18pro: {
        gearTitle: 'iPhone 18 Pro / 18 Pro Max (Ống Kính Tele 2x / 5x)',
        lens: 'Chọn ống kính 2x (48mm từ cảm biến chính) hoặc 5x Telephoto (120mm f/2.8 Tetraprism)',
        aperture: 'f/1.78 (ở 2x) hoặc f/2.8 (ở 5x) · Bật ProRAW',
        shutter: 'Night Mode Max (10s – 30s trên Tripod)',
        iso: 'Auto Astro Stacking · Giảm thanh sáng -0.5 EV để không cháy tâm tinh vân Orion',
        wbFocus: 'Khóa AE/AF trực tiếp vào vùng tinh vân hoặc ngôi sao dẫn đường cạnh mục tiêu.',
        tripodNotes: 'Ở tiêu cự 2x/5x rất nhạy rung động, cần đặt Tripod nơi khuất gió.'
      },
      androidflagship: {
        gearTitle: 'Android Flagship (Ống Kính Tele Periscope 3x / 3.7x / 5x)',
        lens: 'Chọn ống kính Tele 3x – 3.7x (70mm–85mm) hoặc 5x (115mm–120mm) trong Pro Mode / Expert RAW',
        aperture: 'f/2.5 – f/2.8',
        shutter: '4 giây – 8 giây (Tránh sao bị kéo vệt ở tiêu cự tele) hoặc dùng chế độ Tele Astro chuyên dụng',
        iso: 'ISO 1600 – 3200 · Chụp RAW (DNG)',
        wbFocus: 'WB: 4100K · MF: Căn nét vô cực (0.88 – 0.95) qua Focus Peaking.',
        tripodNotes: 'Chụp từ 15–20 tấm RAW liên tiếp để ghép giảm nhiễu hạt.'
      }
    },
    meteor: {
      title: '☄️ Săn Mưa Sao Băng & Phơi Vệt Sao (Star Trails)',
      fullframe: {
        gearTitle: 'Máy Ảnh Full-Frame + Intervalometer (Chụp Liên Tiếp)',
        lens: 'Ống kính Góc Rộng 14mm – 20mm f/1.4 – f/2.0 (Góc càng rộng xác suất bắt dính sao băng càng cao)',
        aperture: 'f/1.4 – f/2.0 (Khẩu độ cực lớn giúp ghi nhận các vệt sao băng mờ)',
        shutter: '10 giây – 15 giây liên tục (Bật Interval Shooting chụp 200–400 tấm nghỉ 1s giữa các tấm)',
        iso: `ISO ${isDarkSky ? '3200 – 6400' : '1600 – 3200'}`,
        wbFocus: 'WB: 3900K · Lấy nét tay cố định vô cực và dán băng dính giữ vòng nét.',
        tripodNotes: 'Chuẩn bị pin dự phòng Dummy Battery / Powerbank PD và dây sưởi ống kính suốt đêm.'
      },
      iphone18pro: {
        gearTitle: 'iPhone 18 Pro (Ống Kính 1x 24mm hoặc 0.5x 13mm)',
        lens: 'Ống kính 1x (24mm f/1.78) cho chất lượng cao nhất, hoặc 0.5x (13mm 48MP) nếu đêm có nhiều sao băng sáng (Fireball)',
        aperture: 'f/1.78 (1x) / f/2.2 (0.5x)',
        shutter: 'Night Mode 30 giây trên Tripod hoặc dùng ứng dụng chụp liên tiếp phơi 15s/tấm',
        iso: 'Auto ProRAW 48MP',
        wbFocus: 'Khóa lấy nét vô cực, hướng máy chếch 45° so với tâm điểm phát (Radiant) của mưa sao băng.',
        tripodNotes: 'Cắm sạc dự phòng MagSafe / USB-C khi chụp liên tục trong thời tiết lạnh vùng cao.'
      },
      androidflagship: {
        gearTitle: 'Android Flagship (Chế Độ Star Trails / Pro Interval)',
        lens: 'Ống kính Chính 1x (23mm – 24mm)',
        aperture: 'f/1.6 – f/1.9',
        shutter: '15 giây/tấm lặp liên tục hoặc bật chế độ Star Trails (Vệt sao) tích hợp sẵn',
        iso: `ISO ${phoneIsoMilkyWay}`,
        wbFocus: 'WB: 4000K · MF khóa vô cực.',
        tripodNotes: 'Đặt máy hướng về phía chòm sao tâm điểm (hoặc hướng Bắc nếu muốn vệt sao xoay tròn quanh sao Bắc Cực).'
      }
    },
    moon: {
      title: '🌕 Chụp Mặt Trăng & Phong Cảnh Đêm Trăng',
      fullframe: {
        gearTitle: 'Máy Ảnh Full-Frame + Ống Tele / Góc Rộng HDR',
        lens: 'Cận cảnh Trăng: 200mm – 600mm · Trăng kèm phong cảnh: 35mm – 85mm',
        aperture: 'f/5.6 – f/8 (Chụp chi tiết bề mặt Trăng) hoặc f/2.8 (Chụp Trăng lưỡi liềm Earthshine)',
        shutter: '1/125s – 1/250s (Trăng sáng) hoặc 2s – 4s (Trăng lưỡi liềm tối)',
        iso: 'ISO 100 – 400 (Trăng tròn rất sáng, tránh để ISO cao gây cháy trắng)',
        wbFocus: 'WB: 5000K – 5200K (Daylight) · Đo sáng điểm (Spot Metering) thẳng vào Mặt Trăng.',
        tripodNotes: 'Nếu chụp Trăng cùng tiền cảnh núi non, hãy chụp 2 tấm (1 tấm đo sáng Trăng, 1 tấm đo sáng tiền cảnh) để ghép HDR.'
      },
      iphone18pro: {
        gearTitle: 'iPhone 18 Pro (Ống Kính 5x Telephoto 120mm / Zoom Quang Học)',
        lens: 'Ống kính 5x Telephoto (120mm) cho Trăng + tiền cảnh, hoặc zoom 15x–25x trên Tripod để lấy miệng hố Trăng',
        aperture: 'f/2.8',
        shutter: 'Tự động (Kéo thanh Exposure mặt trời xuống thấp nhất -1.5 EV đến -2.0 EV để hiện rõ bề mặt Trăng)',
        iso: 'ISO 32 – 100',
        wbFocus: 'Chạm giữ vào Mặt Trăng để khóa AE/AF rồi vuốt giảm sáng đến khi thấy rõ chi tiết vùng tối.',
        tripodNotes: 'Thời điểm đẹp nhất là lúc Trăng vừa mọc hoặc sắp lặn gần đường chân trời (Giờ Xanh).'
      },
      androidflagship: {
        gearTitle: 'Android Flagship (Ống Periscope 5x – 10x Pro Mode)',
        lens: 'Ống kính Periscope Tele 5x (115mm-120mm) hoặc 10x (230mm) trong chế độ Pro Mode',
        aperture: 'f/2.6 – f/4.9',
        shutter: '1/125 giây – 1/500 giây (Chụp chi tiết Trăng) hoặc 1s – 2s (Trăng lưỡi liềm)',
        iso: 'ISO 50 – 200',
        wbFocus: 'WB: 5200K · MF căn nét vô cực, quan sát trực tiếp chi tiết bề mặt Trăng trên màn hình.',
        tripodNotes: 'Sử dụng Pro Mode giúp giữ chi tiết quang học thật của Mặt Trăng mà không bị thuật toán AI làm bệt.'
      }
    },
    cloudsea: {
      title: '☁️ Săn Biển Mây & Ráng Bình Minh / Hoàng Hôn',
      fullframe: {
        gearTitle: 'Máy Ảnh Full-Frame + Kính Lọc GND / ND',
        lens: '16-35mm f/2.8 (Bao trọn thung lũng mây) hoặc 70-200mm f/2.8 (Đặc tả biển mây luồn qua đỉnh núi & tia nắng Ray)',
        aperture: 'f/8 – f/11 (Độ nét sâu toàn khung và tạo tia sao Sunstar 14-18 cánh khi Mặt Trời nhô lên)',
        shutter: '1/60s (Bắt sóng mây cuộn) hoặc phơi sáng 5s – 30s với kính lọc ND64 để làm mịn biển mây như lụa',
        iso: 'ISO 64 – 100 (Tối đa hóa dải tương phản động Dynamic Range)',
        wbFocus: 'WB: 5400K – 6200K (Tôn sắc vàng cam ấm của ráng bình minh) · Lấy nét AF-S vào dãy núi ở khoảng cách 1/3 khung hình.',
        tripodNotes: 'Nên chụp Bracketing (AEB 3 tấm ±2 EV) hoặc dùng filter GND mềm để cân bằng bầu trời ráng sáng và thung lũng tối.'
      },
      iphone18pro: {
        gearTitle: 'iPhone 18 Pro (Ống 1x 24mm / 3x-5x Telephoto ProRAW)',
        lens: 'Ống kính 1x (24mm 48MP) cho toàn cảnh biển mây, và ống 5x (120mm) để nén không gian các lớp núi ẩn hiện trong mây',
        aperture: 'f/1.78 (1x) / f/2.8 (5x) · Bật ProRAW 48MP + Smart HDR',
        shutter: 'Tự động (Hoặc bật chế độ Live Photo -> chuyển sang Long Exposure để tạo hiệu ứng thác mây mượt)',
        iso: 'ISO 32 – 80',
        wbFocus: 'Chạm lấy nét vào rìa núi và kéo nhẹ Exposure -0.3 EV để giữ trọn màu ráng đỏ vàng trên mây cao.',
        tripodNotes: 'Quay thêm Time-lapse 30 phút trên Tripod từ lúc trước bình minh để ghi lại chuyển động cuồn cuộn của biển mây.'
      },
      androidflagship: {
        gearTitle: 'Android Flagship (Ống 1x / 3x-5x Tele + ND Filter Ảo)',
        lens: 'Ống kính 1x (23-24mm 50MP/200MP RAW) hoặc ống kính Tele 3x–5x bắt khoảnh khắc tia nắng chiếu xuyên mây',
        aperture: 'f/1.8 – f/4.0 (Nếu máy có khẩu độ biến thiên, khép xuống f/4.0 để nét sâu và tạo tia nắng thật)',
        shutter: '1/100s (Chụp nét sóng mây) hoặc dùng chế độ ND Filter / Thác nước phơi 4s – 10s',
        iso: 'ISO 50 – 100 · Chụp Expert RAW / Ultra HDR',
        wbFocus: 'WB: 5500K – 6000K · Bật lưới bố cục 1/3 và đường cân bằng chân trời.',
        tripodNotes: 'Lau khô thấu kính trước khi chụp vì sương mù sáng sớm trên đỉnh núi rất dễ bám vào cụm camera.'
      }
    }
  };
}
