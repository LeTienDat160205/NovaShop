// Mock data cho trang chi tiết sản phẩm
// File này tách riêng để dễ thay thế bằng API call sau này

import productImage from '../assets/images/test.webp';
import productImageSmall from '../assets/images/imagesmall.webp';

// ─── Danh sách sản phẩm chi tiết theo ID ─────────────────────────────────────
export const mockProductsMap = {
  '1': {
    _id: '1',
    name: 'Laptop ASUS ROG Zephyrus G14 (2024) GA403UV-QS064W AMD Ryzen AI 9 HX 370 / RTX 4060 / 16GB / 1TB SSD / 14" OLED 2.5K 165Hz',
    brand: 'ASUS',
    categoryPath: ['Laptop', 'Laptop Gaming', 'ASUS ROG'],
    price: 35990000,
    listPrice: 42990000,
    rating: 4.7,
    images: [
      productImage,
      productImageSmall,
      productImage,
      productImageSmall,
      productImage,
      productImageSmall,
    ],
    sourceUrl: '',
    sold: '1.2k',
    reviewCount: 128,
    origin: 'Đài Loan',
    specifications: {
      'CPU': 'AMD Ryzen AI 9 HX 370',
      'RAM': '16 GB LPDDR5X',
      'Ổ cứng': '1 TB SSD NVMe PCIe 4.0',
      'Màn hình': '14" OLED 2.5K (2560 x 1600) 165Hz',
      'Card đồ họa': 'NVIDIA GeForce RTX 4060 8GB GDDR6',
      'Hệ điều hành': 'Windows 11 Home',
      'Pin': '73 WHr',
      'Trọng lượng': '1.5 kg',
      'Màu sắc': 'Eclipse Gray',
      'Kích thước': '312 x 220 x 17 mm',
    },
    description: `ASUS ROG Zephyrus G14 (2024) là chiếc laptop gaming mỏng nhẹ hàng đầu với thiết kế AniMe Matrix LED ấn tượng.

**Hiệu năng vượt trội**
Được trang bị bộ vi xử lý AMD Ryzen AI 9 HX 370 với kiến trúc Zen 5 mới nhất, kết hợp cùng GPU NVIDIA GeForce RTX 4060 mang lại hiệu năng gaming và sáng tạo nội dung xuất sắc.

**Màn hình OLED sống động**
Tấm nền OLED 2.5K 165Hz cho màu sắc chính xác tuyệt đối với DCI-P3 100%, độ sáng cao tới 500 nit, làm cho mọi chi tiết trở nên sống động và sắc nét.

**Thiết kế mỏng nhẹ, pin lâu**
Chỉ 1.5 kg nhưng được trang bị pin 73 WHr, hỗ trợ sạc nhanh 100W qua USB-C, đủ để bạn làm việc và giải trí suốt ngày dài.

**Hệ thống tản nhiệt ROG Intelligent Cooling**
Hai quạt ARC Flow với cánh quạt mỏng 0.1mm tối ưu hóa luồng khí, kết hợp với hệ thống ống dẫn nhiệt liquid metal giữ nhiệt độ CPU và GPU luôn ở mức tối ưu.`,
  },

  '2': {
    _id: '2',
    name: 'Điện thoại Apple iPhone 15 Pro Max 256GB - Khung viền Titan chuẩn hàng không vũ trụ, Chip A17 Pro mạnh mẽ',
    brand: 'Apple',
    categoryPath: ['Điện thoại', 'Điện thoại thông minh', 'iPhone', 'iPhone 15 Series'],
    price: 29490000,
    listPrice: 34990000,
    rating: 4.9,
    images: [
      productImageSmall,
      productImage,
      productImageSmall,
      productImage,
    ],
    sourceUrl: '',
    sold: '5.8k',
    reviewCount: 420,
    origin: 'Mỹ',
    specifications: {
      'Màn hình': 'Super Retina XDR OLED 6.7" ProMotion 120Hz',
      'Chip xử lý': 'Apple A17 Pro 6 nhân',
      'RAM': '8 GB',
      'Bộ nhớ trong': '256 GB',
      'Camera sau': 'Chính 48MP, Siêu rộng 12MP, Telephoto 5x 12MP',
      'Camera trước': '12MP TrueDepth',
      'Cổng sạc': 'USB-C hỗ trợ USB 3 (lên đến 10Gb/s)',
      'Pin': 'Khoảng 4.422 mAh, xem video đến 29 giờ',
      'Chất liệu': 'Khung viền Titan, mặt lưng kính nhám',
      'Trọng lượng': '221 g',
    },
    description: `iPhone 15 Pro Max là dòng iPhone cao cấp nhất với chất liệu titan chuẩn hàng không vũ trụ nhẹ và bền bỉ.

**Khung viền Titan sang trọng**
Lần đầu tiên iPhone sử dụng chất liệu Titan giúp giảm đáng kể trọng lượng nhưng vẫn đảm bảo độ bền tối ưu.

**Chip A17 Pro đột phá**
Thế hệ chip hoàn toàn mới mang đến trải nghiệm đồ họa chơi game chân thực với Ray Tracing tăng tốc phần cứng.

**Hệ thống camera chuyên nghiệp 5x**
Camera Telephoto với khả năng zoom quang học lên đến 5x ở tiêu cự 120 mm, bắt trọn từng khoảnh khắc từ xa với độ sắc nét tuyệt hảo.

**Nút Tác vụ (Action Button) mới**
Tùy biến nhanh chóng để mở Camera, bật Đèn pin, Ghi âm hoặc các phím tắt tiện lợi chỉ với một lần nhấn giữ.`,
  },

  '3': {
    _id: '3',
    name: 'Sữa bột Nestlé NAN SUPREMEPRO 1 800g nhập khẩu Đức với 5HMO & đạm Gentle Optipro (Dành cho trẻ từ 0 - 12 tháng tuổi)',
    brand: 'NAN',
    categoryPath: ['Đồ Chơi - Mẹ & Bé', 'Dinh dưỡng cho bé', 'Sữa bột cho bé', 'Sữa cho bé dưới 24 tháng'],
    price: 550000,
    listPrice: 590000,
    rating: 4.7,
    images: [
      productImage,
      productImageSmall,
      productImage,
      productImageSmall,
      productImage,
    ],
    sourceUrl: '',
    sold: '23k',
    reviewCount: 100,
    origin: 'Đức',
    specifications: {
      'Thành phần': 'Tham khảo mô tả',
      'Khối lượng (kg)': '0.8',
      'Thương hiệu': 'NAN',
      'Xuất xứ thương hiệu': 'Thụy Sỹ',
      'Xuất xứ (Made in)': 'Đức',
      'Hạn sử dụng': '24 tháng kể từ ngày sản xuất',
      'Độ tuổi sử dụng': '0 - 12 tháng tuổi',
    },
    description: `Sữa bột Nestlé NAN SUPREMEPRO 1 với công thức cải tiến bổ sung phức hợp 5HMO quý giá và đạm Optipro thủy phân một phần giúp trẻ tiêu hóa dễ dàng và tăng cường sức đề kháng.

**Phức hợp 5HMO tiên tiến**
Cung cấp 5 loại HMO phổ biến nhất trong sữa mẹ (2'-FL, DFL, LNT, 3'-SL, 6'-SL) giúp nuôi dưỡng hệ vi sinh đường ruột và hỗ trợ miễn dịch tự nhiên.

**Đạm chất lượng Gentle Optipro**
Đạm whey thủy phân một phần được chứng minh lâm sàng giúp giảm nguy cơ dị ứng đạm sữa bò và hỗ trợ trẻ tiêu hóa tốt, không gây táo bón.

**DHA & ARA hỗ trợ phát triển trí não**
Tỷ lệ cân đối giữa DHA và ARA giúp hoàn thiện thị giác và cấu trúc não bộ cho trẻ ngay từ những năm tháng đầu đời.`,
  },
};

// Hàm lấy dữ liệu chi tiết theo id, mặc định fallback về id '1'
export const getMockProductDetail = (id) => {
  return mockProductsMap[id] || mockProductsMap['1'];
};

export const mockProductDetail = mockProductsMap['1'];

// ─── Thông tin vận chuyển (mock cố định) ──────────────────────────────────────
export const mockShipping = {
  address: 'Q. 1, P. Bến Nghé, Hồ Chí Minh',
  expressDelivery: {
    label: 'Giao nhanh 2h',
    note: 'Trước 10h ngày mai',
    price: 'Miễn phí',
    originalPrice: '35.000 ₫',
  },
  standardDelivery: {
    label: 'Giao tiêu chuẩn',
    note: 'Từ 2 – 4 ngày',
    price: 'Miễn phí từ 45k',
  },
};

// ─── Đánh giá sản phẩm ────────────────────────────────────────────────────────
export const mockReviews = [
  {
    id: 'r1',
    name: 'Nguyễn Minh Tuấn',
    rating: 5,
    date: '28/09/2026',
    content: 'Sản phẩm cực kỳ chất lượng, đóng gói cẩn thận, giao hàng đúng hẹn. Dùng thử rất ưng ý. Rất hài lòng với dịch vụ từ NovaShop!',
    images: [productImageSmall, productImageSmall],
    tag: 'Đã mua hàng',
  },
  {
    id: 'r2',
    name: 'Trần Thị Lan Anh',
    rating: 5,
    date: '25/09/2026',
    content: 'Đúng như mô tả, date mới tinh, nguyên seal. Shipper thân thiện nhiệt tình. Mọi người nên mua ủng hộ shop nhé.',
    images: [],
    tag: 'Đã mua hàng',
  },
  {
    id: 'r3',
    name: 'Lê Quang Hùng',
    rating: 4,
    date: '20/09/2026',
    content: 'Chất lượng rất ổn định, giá cả hợp lý so với thị trường. Sẽ tiếp tục theo dõi và mua thêm các sản phẩm khác.',
    images: [productImage],
    tag: 'Đã mua hàng',
  },
  {
    id: 'r4',
    name: 'Phạm Thị Hương',
    rating: 5,
    date: '15/09/2026',
    content: 'NovaShop giao hàng siêu nhanh, nhận hàng sau chưa đầy 2h. Đóng hộp chắc chắn, sản phẩm chính hãng 100%.',
    images: [],
    tag: 'Đã mua hàng',
  },
  {
    id: 'r5',
    name: 'Đỗ Văn Khoa',
    rating: 4,
    date: '10/09/2026',
    content: 'Dùng rất thích, thiết kế đẹp và chỉn chu. Có đầy đủ hóa đơn và hướng dẫn chi tiết. Đánh giá 5 sao cho sự tận tâm.',
    images: [productImageSmall],
    tag: 'Đã mua hàng',
  },
];

// Phân bố sao đánh giá (mock)
export const mockRatingDistribution = [
  { star: 5, count: 87 },
  { star: 4, count: 25 },
  { star: 3, count: 10 },
  { star: 2, count: 4 },
  { star: 1, count: 2 },
];

// ─── Sản phẩm đã xem gần đây ──────────────────────────────────────────────────
export const mockRecentlyViewed = Array.from({ length: 6 }, (_, i) => ({
  _id: `rv-${i + 1}`,
  name: [
    'MacBook Air M3 15" 8GB 256GB',
    'Dell XPS 15 9530 Core i7 13700H RTX 4060',
    'Lenovo ThinkPad X1 Carbon Gen 11',
    'HP Spectre x360 14 OLED Touch',
    'MSI Prestige 16 AI Studio',
    'Acer Swift X 14 OLED Ryzen 7',
  ][i],
  image: productImage,
  rating: (4.5 + i * 0.1).toFixed(1),
  sold: `${200 + i * 50}+`,
  price: 25000000 + i * 2000000,
  discount: 10 + i,
}));

// ─── Sản phẩm khám phá thêm ───────────────────────────────────────────────────
export const mockExploreMore = Array.from({ length: 12 }, (_, i) => ({
  _id: `em-${i + 1}`,
  name: [
    'iPhone 15 Pro Max 256GB',
    'Samsung Galaxy S24 Ultra',
    'iPad Pro M4 11" WiFi 256GB',
    'Apple Watch Series 9 45mm',
    'Sony WH-1000XM5 Headphones',
    'Màn hình LG 27" 4K IPS',
    'Bàn phím cơ Keychron K2 Pro',
    'Chuột Logitech MX Master 3S',
    'SSD Samsung 990 Pro 2TB',
    'RAM Corsair Vengeance 32GB DDR5',
    'Webcam Logitech C920 1080p',
    'Tai nghe AirPods Pro (2nd gen)',
  ][i],
  image: productImage,
  rating: (4.3 + (i % 5) * 0.1).toFixed(1),
  sold: `${100 + i * 30}+`,
  price: 500000 + i * 1500000,
  discount: 5 + (i % 8) * 2,
}));
