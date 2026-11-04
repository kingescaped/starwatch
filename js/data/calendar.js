/**
 * Astronomical events and spot-predictor database.
 */

export const ASTRO_CALENDAR_EVENTS = [
  {
    id: 'evt-mw-core',
    category: 'milkyway',
    title: 'Kỷ nguyên Săn Tâm Ngân Hà (Milky Way Core Không Trăng)',
    dateOffsetDays: 0,
    timeMinutes: 1260, // 21:00
    targetKey: 'galactic_center',
    setupEvent: 'milkyway',
    badge: '🌌 Săn Ngân Hà Đỉnh Cao',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    desc: 'Tâm Ngân Hà (Sagittarius A*) vươn cao trên đường chân trời hướng Đông Nam - Nam trong khung giờ trời tối thiên văn hoàn toàn, rất thuận lợi để phơi sáng dải bụi khí rực rỡ.',
    recommendedSpotIds: ['con-dao', 'ta-xua', 'bach-moc', 'ba-quang', 'vinh-hy']
  },
  {
    id: 'evt-cloud-sea-northwest',
    category: 'cloudsea',
    title: 'Đợt Nghịch Nhiệt & Săn Biển Mây Đại Ngàn',
    dateOffsetDays: 1,
    timeMinutes: 360, // 06:00
    targetKey: 'galactic_center',
    setupEvent: 'cloudsea',
    badge: '☁️ Biển Mây Dày',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    desc: 'Độ ẩm thung lũng đạt 92–98% kết hợp lặng gió sáng sớm tạo biển mây luồn ổn định ở cao độ 900m – 1.400m dưới các đỉnh núi cao.',
    recommendedSpotIds: ['ta-xua', 'fansipan', 'bach-moc', 'doi-da-phu', 'khe-sanh']
  },
  {
    id: 'evt-geminids-perseids',
    category: 'meteor',
    title: 'Đêm Cực Đại Mưa Sao Băng & Phơi Sáng Star Trails',
    dateOffsetDays: 2,
    timeMinutes: 1380, // 23:00
    targetKey: 'm45',
    setupEvent: 'meteor',
    badge: '☄️ Mưa Sao Băng (ZHR 80-120)',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    desc: 'Tần suất sao băng cao xuất phát từ vùng chòm sao gần Cụm sao Tua Rua (M45) & Orion. Bầu trời Bortle 2–3 giúp bắt trọn các vệt sao băng đổi màu.',
    recommendedSpotIds: ['ba-quang', 'mui-dien', 'dao-ly-son', 'ho-tri-an', 'con-dao']
  },
  {
    id: 'evt-andromeda-orion',
    category: 'milkyway',
    title: 'Săn Thiên Hà Tiên Nữ (M31) & Tinh Vân Đại Bàng Orion (M42)',
    dateOffsetDays: 3,
    timeMinutes: 1320, // 22:00
    targetKey: 'm31',
    setupEvent: 'deepsky',
    badge: '🌀 Thiên Thể Sâu (Deep Sky)',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    desc: 'Thiên hà Andromeda (M31) và Tinh vân Orion (M42) đạt độ cao lý tưởng >45° trên bầu trời đêm, có thể chụp rõ bằng ống kính tele hoặc chế độ Astro trên flagship.',
    recommendedSpotIds: ['fansipan', 'mau-son', 'khe-sanh', 'vinh-hy', 'ho-tri-an']
  },
  {
    id: 'evt-crescent-moon-glow',
    category: 'moon',
    title: 'Trăng Lưỡi Liềm (Earthshine) & Ráng Hoàng Hôn Đỏ',
    dateOffsetDays: 4,
    timeMinutes: 1085, // 18:05
    targetKey: 'm42',
    setupEvent: 'moon',
    badge: '🌙 Trăng & Ráng Chiều',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    desc: 'Hiện tượng Ánh sáng Tro (Da Vinci Glow) chiếu sáng phần tối của Mặt Trăng lưỡi liềm ngay sau hoàng hôn trên nền trời Giờ Xanh.',
    recommendedSpotIds: ['deo-hai-van', 'mu-cang-chai', 'ba-vi', 'mui-dien', 'ho-tri-an']
  },
  {
    id: 'evt-sunrise-afterglow',
    category: 'cloudsea',
    title: 'Bình Minh Ráng Lửa & Mây Vẩy Rồng Tầng Cao',
    dateOffsetDays: 5,
    timeMinutes: 345, // 05:45
    targetKey: 'galactic_center',
    setupEvent: 'cloudsea',
    badge: '🌅 Ráng Bình Minh',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    desc: 'Tầng mây cao (Cirrocumulus) che phủ 40–55% kết hợp chân trời phía Đông thông thoáng tạo hiệu ứng tán xạ ráng đỏ rực rỡ trước giờ Mặt Trời mọc.',
    recommendedSpotIds: ['mui-dien', 'vinh-hy', 'dao-ly-son', 'deo-hai-van', 'ta-xua']
  }
];
