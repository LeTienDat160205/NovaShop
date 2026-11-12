# NovaShop

NovaShop là website thương mại điện tử gồm giao diện React, REST API Node.js/Express, cơ sở dữ liệu MongoDB và một dịch vụ Python riêng để xếp hạng sản phẩm gợi ý.

## Công nghệ

- Frontend: React 19, Vite, React Router, Ant Design, Redux Toolkit và Styled Components.
- Backend: Node.js, Express, Mongoose, JWT, bcrypt và Nodemailer.
- Dữ liệu: MongoDB.
- Recommendation Engine: Python, PyMongo, TF-IDF/cosine và các thuật toán xếp hạng được triển khai trong mã nguồn.

## Chức năng hiện tại

- Duyệt và tìm sản phẩm theo tên, thương hiệu, danh mục; lọc theo thương hiệu, đánh giá và khoảng giá.
- Xem thông tin chi tiết, đánh giá và sản phẩm tương tự.
- Đăng ký, đăng nhập, cập nhật hồ sơ, ảnh đại diện và đặt lại mật khẩu qua email.
- Quản lý giỏ hàng, sản phẩm yêu thích, đặt hàng và theo dõi/hủy đơn hàng theo trạng thái.
- Thanh toán COD hoặc ZaloPay. ZaloPay cần cấu hình thông tin môi trường; nếu chưa cấu hình, lựa chọn này không thể khởi tạo giao dịch.
- Khu vực quản trị để quản lý sản phẩm, đơn hàng, đánh giá, người dùng và xem tổng quan số lượng sản phẩm/khách hàng/đơn hàng, trạng thái đơn cùng một số đơn gần đây.
- Gợi ý mặc định dựa trên xếp hạng Bayesian từ điểm đánh giá; gợi ý cá nhân hóa dựa trên lịch sử tương tác khi có dữ liệu phù hợp; tìm sản phẩm tương tự bằng TF-IDF và cosine similarity.

Hệ thống ghi nhận các tương tác của khách hàng đã đăng nhập gồm xem sản phẩm, yêu thích, thêm vào giỏ hàng và mua hàng. Gợi ý cá nhân hóa khai thác các tương tác này. Khách chưa có đủ lịch sử nhận danh sách gợi ý mặc định.

Các chức năng chưa có trong phiên bản hiện tại gồm thanh toán MoMo/VNPay/thẻ/QR, mã giảm giá, lọc theo thông số kỹ thuật, khóa tài khoản, thống kê doanh thu/sản phẩm bán chạy, cấu hình trọng số gợi ý từ Admin, nhật ký hệ thống, widget gợi ý tại giỏ hàng/hồ sơ và “thường được mua cùng nhau”.

## Yêu cầu

- Node.js và npm.
- Python 3.
- MongoDB Atlas hoặc MongoDB tương thích.
- Kết nối đến MongoDB từ cả backend và Recommendation Engine.

## Chạy dự án trên Windows

Chạy mỗi dịch vụ trong một cửa sổ PowerShell riêng tại thư mục gốc repository.

### 1. Cấu hình backend

Tạo `backend-node/.env` dựa trên [`backend-node/.env.example`](./backend-node/.env.example). Điền tối thiểu:

```dotenv
PORT=3001
MONGO_DB=<mat-khau-mongodb>
JWT_SECRET=<chuoi-bi-mat-ngau-nhien>
FRONTEND_URL=http://localhost:5173
```

Backend hiện tạo MongoDB URI Atlas từ `MONGO_DB`. Không commit file `.env` hoặc thông tin bí mật.

Cài đặt và khởi động:

```powershell
cd backend-node
npm install
npm start
```

Backend mặc định chạy tại `http://localhost:3001`.

### 2. Chạy Recommendation Engine

Mở PowerShell mới tại thư mục gốc:

```powershell
cd rec-engine-python
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python server.py
```

Dịch vụ mặc định lắng nghe tại `http://127.0.0.1:8001`. Nó đọc `MONGO_DB` từ `backend-node/.env`; có thể đặt `MONGODB_URI` thay thế hoặc cấu hình `REC_ENGINE_HOST` và `REC_ENGINE_PORT` để đổi địa chỉ. Backend chuyển tiếp yêu cầu đến `REC_ENGINE_URL`, mặc định là `http://localhost:8001`.

### 3. Chạy frontend

Mở PowerShell mới tại thư mục gốc:

```powershell
cd frontend
npm install
npm run dev
```

Vite mặc định hiển thị địa chỉ phát triển trong terminal (thường là `http://localhost:5173`). Frontend hiện gọi API backend tại `http://localhost:3001`.

## Cấu hình tích hợp tùy chọn

- **ZaloPay:** điền `ZALOPAY_APP_ID`, `ZALOPAY_KEY1`, `ZALOPAY_KEY2`. Có thể cấu hình thêm `ZALOPAY_ENDPOINT`, `ZALOPAY_REDIRECT_URL` và `ZALOPAY_CALLBACK_URL`. Callback cần trỏ đến backend có thể truy cập từ ZaloPay; endpoint mẫu trong `.env.example` là sandbox.
- **Đặt lại mật khẩu:** cấu hình `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`; tùy máy chủ email, cấu hình thêm `SMTP_USER`, `SMTP_PASS` và `SMTP_SECURE`. Liên kết đặt lại mật khẩu hết hạn sau 15 phút.
- **Ảnh đại diện:** cấu hình `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` và `CLOUDINARY_API_SECRET`.

Các tích hợp này cần được cấu hình riêng; chỉ tạo file `.env` không có nghĩa là dịch vụ bên ngoài đã sẵn sàng.

## Kiểm tra

Build và lint frontend:

```powershell
cd frontend
npm run build
npm run lint
```

Chạy các kiểm thử Recommendation Engine:

```powershell
cd rec-engine-python
python -m unittest
```

Backend hiện chưa có bộ kiểm thử tự động được cấu hình trong `package.json`.

## Các route giao diện chính

| Route | Chức năng |
|---|---|
| `/` | Trang chủ, deals và sản phẩm gợi ý |
| `/products` | Danh sách sản phẩm |
| `/products/:type` | Danh sách sản phẩm theo danh mục |
| `/product-details/:id` | Chi tiết sản phẩm và sản phẩm tương tự |
| `/recommendations` | Danh sách gợi ý |
| `/order` | Giỏ hàng |
| `/payment` | Xác nhận giao hàng và thanh toán |
| `/my-order` | Đơn hàng của khách hàng |
| `/details-order/:id` | Chi tiết đơn hàng |
| `/favorites` | Sản phẩm yêu thích |
| `/profile-user` | Hồ sơ người dùng |
| `/sign-in`, `/sign-up` | Đăng nhập và đăng ký |
| `/forgot-password`, `/reset-password` | Đặt lại mật khẩu |
| `/system/admin` | Khu vực quản trị |

## Cấu trúc repository

```text
NovaShop/
├── backend-node/       # REST API, MongoDB models, authentication và thanh toán
├── frontend/           # Giao diện React/Vite
├── rec-engine-python/  # Recommendation Engine và kiểm thử
├── docker-compose.yml
└── README.md            # Tài liệu dự án duy nhất
```

## Nạp dữ liệu đánh giá tham khảo (tùy chọn)

`rec-engine-python/import_review_ratings.py` đọc dữ liệu đánh giá Excel, đối chiếu `product_id` với `item_id` trong catalog và sản phẩm MongoDB, rồi báo cáo kết quả ánh xạ. Mặc định script chỉ chạy kiểm tra, không ghi dữ liệu. Chỉ thêm `--apply` khi chủ động muốn ghi các đánh giá ghép được vào collection `datasetratings`.

Ví dụ trong PowerShell từ thư mục gốc:

```powershell
python -m pip install -r .\rec-engine-python\requirements.txt
python .\rec-engine-python\import_review_ratings.py `
  --reviews "D:\duong-dan\ReviewClean.xlsx" `
  --products-json .\frontend\src\data\products.json
```

Script dùng `MONGODB_URI` nếu được khai báo; nếu không, nó đọc `MONGO_DB` từ `backend-node/.env`. Hãy kiểm tra báo cáo ánh xạ trước khi chạy lại lệnh với `--apply`.

Điểm và số lượt đánh giá hiển thị có thể tổng hợp từ `datasetratings` và đánh giá do khách hàng gửi trên NovaShop. Do không có ánh xạ giữa `customer_id` của dữ liệu tham khảo và tài khoản NovaShop, hệ thống không thể khử trùng lặp cùng một người giữa hai nguồn.
