# Novashop

Ứng dụng web thương mại điện tử full-stack NovaShop sử dụng Recommendation Algorithm

## Công nghệ

- **Frontend:** React, Vite, React Router, Context API
- **Backend:** Node.js, Express
- **Database:** MongoDB 
- **Auth:** 
- **Payments:** 

## Tính năng 

### TRải nghiệm của người dùng
- **Đăng nhập:** cho phép đăng nhập bằng các phương thức khác nhau (Vd: Google)
- **Lọc sản phẩm:** Áp dụng bộ lọc gần tương tự Shopee
- **Kiểm tra thanh toán:** Người dùng chưa đăng nhập bấm vào thanh toán -> chuyển hướng đến trang đăng nhập
- **Quản lý hồ sơ:** Người dùng có thể cập nhật thông tin cá nhân, tải ảnh đại diện tùy chỉnh
- **Gợi ý sản phẩm:** Người dùng được gợi ý về các sản phẩm phù hợp theo sở thích, nhu cầu cá nhân
### Trang Admin
- **Quản lý Cửa hàng:** Hỗ trợ đầy đủ các thao tác CRUD (tạo, đọc, cập nhật, xóa) đối với sản phẩm, bao gồm tải ảnh lên, phân loại sản phẩm và theo dõi chi tiết.
- **Theo dõi Đơn hàng:** Theo dõi doanh thu, tìm kiếm theo mã giao dịch, lọc đơn hàng theo ngày/trạng thái và cập nhật trực tiếp trạng thái xử lý đơn hàng.
- **Quản lý Người dùng:** Xem hồ sơ chi tiết, sắp xếp danh sách người dùng, xóa tài khoản, cũng như cấp/thu hồi quyền quản trị.
- **Nhật ký Hoạt động & Kiểm tra:** Hệ thống ghi nhật ký toàn diện giúp theo dõi mọi thao tác quản trị (ai thực hiện, hành động gì, thời gian nào, địa chỉ IP) nhằm đảm bảo tính bảo mật và trách nhiệm giải trình.

## Quy trình xác thực

1. `POST /api/register`: Tạo tài khoản và gửi mã OTP.
2. `POST /api/login`: Xác thực thông tin đăng nhập và gửi mã OTP (hoặc xử lý trực tiếp qua Google OAuth).
3. `POST /api/verify-otp`: Hoàn tất quá trình đăng nhập và trả về mã JWT.
4. Frontend điều hướng người dùng dựa trên ngữ cảnh thông qua logic `redirect` (ví dụ: quay lại giỏ hàng sau khi xác thực).
5. Các tuyến đường được bảo vệ (protected routes) và bảng điều khiển quản trị (admin panels) sẽ xác thực mã JWT cùng các quyền tương ứng như `role` hoặc `canAccessAdmin`.

## Cấu trúc dự án
```text
NovaShop/
├── frontend/                   # ReactJS (Vite)
│   ├── src/
│   │   ├── components/         # ProductCard, RecommendationSlider, Header...
│   │   ├── pages/              # Home, ProductDetail, Cart, Checkout...
│   │   ├── services/           # API integration (Axios)
│   │   └── store/              # State management (Redux Toolkit / Zustand)
│   └── package.json
|   └── ... (File mặc định được tạo ra)
│
├── backend-node/               # NodeJS (ExpressJS)
│   ├── src/
│   │   ├── controllers/        # Auth, Product, Interaction, Recommendation
│   │   ├── models/             # MongoDB Schemas (User, Product, Order, Interaction)
│   │   ├── services/           # Business logic, Redis client
│   │   ├── routes/             # API Endpoints
│   │   └── utils/
│   └── package.json
│
├── rec-engine-python/          # Python Recommendation Service
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint
│   │   ├── algorithms/         # Collaborative filtering, Content-based algorithms
│   │   ├── data/               # Connectors to Mongo & Redis
│   │   └── models/             # Saved ML model artifacts (.pkl, .h5)
│   ├── requirements.txt        # pandas, scikit-learn, fastapi, pymongo, redis
│   └── train_cron.py           # Script chạy định kỳ huấn luyện mô hình
│
├── docker-compose.yml          # Chạy MongoDB, Redis, Node, Python đồng thời
└── README.md
```