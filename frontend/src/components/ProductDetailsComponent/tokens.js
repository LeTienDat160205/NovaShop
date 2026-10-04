// Design tokens cho trang chi tiết sản phẩm NovaShop
// Chuẩn hóa theo thiết kế Tiki (desktop 1440px)

export const token = {
  // Màu sắc chủ đạo
  colorPrimary: '#0B74E5',      // Xanh NovaShop
  colorDanger: '#FF424E',       // Đỏ "Mua ngay" / giá khuyến mãi
  colorSuccess: '#00AB56',      // Xanh lá miễn phí ship
  colorWarning: '#FFA800',      // Cam/vàng sao đánh giá

  // Màu nền
  colorBg: '#F5F5FA',           // Nền xám nhạt trang chuẩn Tiki (#F5F5FA)
  colorCard: '#FFFFFF',         // Nền card trắng
  colorBgHover: '#F0F8FF',      // Hover nhẹ
  colorRowStripe: '#FAFAFA',    // Nền hàng xen kẽ bảng chi tiết

  // Màu chữ
  colorTextPrimary: '#27272A',  // Chữ chính (xám đen đậm chuẩn Tiki #27272A)
  colorTextSecondary: '#808089',// Chữ phụ / nhãn / breadcrumb (#808089)
  colorTextMuted: '#A6A6B0',    // Chữ mờ placeholder

  // Viền
  colorBorder: '#EBEBF0',       // Viền mỏng chuẩn Tiki (#EBEBF0)
  colorBorderActive: '#0B74E5', // Viền thumbnail đang chọn

  // Badge
  colorBadgeTopDeal: '#FF424E', // TOP DEAL đỏ
  colorBadge30Day: '#0B74E5',   // 30 NGÀY ĐỔI TRẢ xanh
  colorBadgeAuth: '#00AB56',    // CHÍNH HÃNG xanh lá

  // Sao
  colorStar: '#FFC400',

  // Bo góc
  borderRadius: '8px',          // Bo góc card
  borderRadiusSm: '4px',        // Bo góc nút / thumbnail / input
  borderRadiusPill: '100px',    // Bo góc badge / chip lọc

  // Đổ bóng card nhẹ nhàng
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
  boxShadowHover: '0 4px 12px rgba(0, 0, 0, 0.08)',

  // Khoảng cách
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },

  // Cỡ chữ
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    md: '15px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '28px',
  },

  // Breakpoints
  breakpoint: {
    tablet: '768px',
    desktop: '1200px',
  },

  maxWidth: '1200px',

  // Chiều cao HeaderComponent thật (64px)
  headerHeight: 64,

  // Vị trí top cho phần tử StickyBox
  stickyTop: '16px',
};
