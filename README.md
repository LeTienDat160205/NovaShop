# NovaShop

NovaShop là giao diện website thương mại điện tử được xây dựng bằng React, hỗ trợ duyệt sản phẩm, tìm kiếm, xem chi tiết sản phẩm, quản lý giỏ hàng, thanh toán mô phỏng, theo dõi đơn hàng và khu vực quản trị cửa hàng.

## Công nghệ sử dụng

- React 19
- Vite
- React Router DOM
- Ant Design
- Redux Toolkit
- React Redux
- Styled Components
- React Slick và Slick Carousel
- JavaScript ES Modules

## Chạy dự án

### Cài đặt dependencies

```bash
cd frontend
npm install
```

### Chạy môi trường phát triển

```bash
npm run dev
```

### Build production

```bash
npm run build
```

### Kiểm tra mã nguồn

```bash
npm run lint
```

### Xem bản build production

```bash
npm run preview
```

## Các chức năng chính

### Trang chủ

- Hiển thị logo và thương hiệu NovaShop.
- Hiển thị danh mục sản phẩm:
  - Điện thoại
  - Laptop
  - Máy tính bảng
  - Tai nghe
  - Đồng hồ thông minh
  - Thiết bị gia dụng
  - Thời trang
- Hiển thị banner dạng slider.
- Hiển thị danh sách sản phẩm nổi bật.
- Hiển thị hình ảnh, tên sản phẩm, giá bán, phần trăm giảm giá, đánh giá và số lượng đã bán.
- Có nút “Xem thêm” để mở rộng danh sách sản phẩm.

### Tìm kiếm sản phẩm

- Tìm kiếm sản phẩm từ thanh tìm kiếm trên header.
- Hỗ trợ tìm kiếm theo:
  - Tên sản phẩm
  - Danh mục
  - Thương hiệu
- Từ khóa được truyền qua query parameter trên URL:

```text
/products?search=<keyword>
```

### Danh sách sản phẩm

- Hiển thị danh sách sản phẩm dưới dạng các thẻ sản phẩm.
- Hiển thị thông tin:
  - Hình ảnh
  - Tên sản phẩm
  - Đánh giá
  - Số lượng đã bán
  - Giá bán
  - Mức giảm giá
- Có phân trang.
- Có khu vực bộ lọc theo:
  - Danh mục
  - Checkbox
  - Số sao đánh giá
  - Khoảng giá
- Hỗ trợ hiển thị sản phẩm theo loại thông qua URL:

```text
/product/:type
```

Các loại dữ liệu mẫu hiện có:

```text
sach
truyen
```

### Chi tiết sản phẩm

Trang chi tiết sản phẩm bao gồm:

- Hình ảnh sản phẩm chính.
- Danh sách hình ảnh thu nhỏ.
- Tên sản phẩm.
- Đánh giá sản phẩm.
- Số lượng đã bán.
- Giá sản phẩm.
- Thông tin địa chỉ nhận hàng.
- Thay đổi số lượng sản phẩm.
- Nút “Chọn mua”.
- Nút “Mua trả sau”.
- Nút tương tác Facebook.
- Khu vực bình luận Facebook.

### Giỏ hàng

Trang giỏ hàng hỗ trợ:

- Hiển thị danh sách sản phẩm trong giỏ hàng.
- Hiển thị tên sản phẩm và cửa hàng.
- Hiển thị hình ảnh sản phẩm.
- Hiển thị giá sản phẩm.
- Chọn từng sản phẩm.
- Chọn tất cả sản phẩm.
- Tăng hoặc giảm số lượng sản phẩm.
- Xóa sản phẩm khỏi giỏ hàng.
- Tính tạm tính theo số lượng.
- Hiển thị phí vận chuyển miễn phí.
- Hiển thị tổng tiền.
- Hiển thị thông tin đã bao gồm VAT.
- Nút chuyển sang bước mua hàng.

### Thanh toán

Trang thanh toán hỗ trợ:

- Hiển thị phương thức giao hàng tiêu chuẩn.
- Hiển thị thời gian giao hàng dự kiến từ 2 đến 4 ngày.
- Thanh toán khi nhận hàng.
- Thanh toán bằng thẻ ngân hàng hoặc ví điện tử.
- Hiển thị thông tin đơn hàng.
- Hiển thị tạm tính, phí vận chuyển và tổng tiền.
- Thay đổi thông tin giao hàng:
  - Họ và tên
  - Số điện thoại
  - Địa chỉ
- Hiển thị thông báo cập nhật thông tin giao hàng thành công.
- Nút đặt hàng.

### Đặt hàng thành công

Sau khi đặt hàng, người dùng được chuyển đến trang xác nhận thành công với các lựa chọn:

- Xem đơn hàng.
- Tiếp tục mua sắm.

### Quản lý đơn hàng cá nhân

Trang “Đơn hàng của tôi” hỗ trợ:

- Hiển thị danh sách đơn hàng của người dùng.
- Hiển thị mã đơn hàng.
- Hiển thị sản phẩm trong đơn hàng.
- Hiển thị tổng tiền.
- Hiển thị trạng thái đơn hàng.
- Mở trang chi tiết đơn hàng.

### Chi tiết đơn hàng

Trang chi tiết đơn hàng hiển thị:

- Mã đơn hàng.
- Tiến trình xử lý đơn hàng:
  - Đặt hàng
  - Xác nhận
  - Đang giao
  - Hoàn tất
- Trạng thái đơn hàng.
- Người nhận.
- Địa chỉ giao hàng.
- Phương thức thanh toán.
- Tổng tiền đơn hàng.

### Tài khoản người dùng

Trang tài khoản người dùng hỗ trợ chỉnh sửa:

- Họ và tên.
- Email.
- Số điện thoại.
- Địa chỉ.

Có nút lưu thay đổi thông tin cá nhân.

### Đăng nhập

Trang đăng nhập bao gồm:

- Nhập email.
- Nhập mật khẩu.
- Nút đăng nhập.
- Liên kết quên mật khẩu.
- Liên kết chuyển sang trang đăng ký.
- Khu vực giới thiệu thương hiệu NovaShop.

### Đăng ký

Trang đăng ký bao gồm:

- Nhập email.
- Nhập mật khẩu.
- Nhập lại mật khẩu.
- Nút đăng ký.
- Liên kết chuyển sang trang đăng nhập.
- Khu vực giới thiệu thương hiệu NovaShop.

### Trang quản trị

Khu vực quản trị được truy cập tại:

```text
/system/admin
```

Khu vực quản trị gồm các menu:

- Tổng quan
- Sản phẩm
- Đơn hàng
- Khách hàng

### Dashboard quản trị

Trang tổng quan hiển thị:

- Doanh thu tháng.
- Số lượng đơn hàng mới.
- Số lượng sản phẩm đang bán.
- Số lượng khách hàng.
- Biểu đồ doanh thu trong 7 ngày.
- Thống kê trạng thái đơn hàng:
  - Chờ xác nhận
  - Đang giao
  - Hoàn tất
  - Đã hủy
- Danh sách đơn hàng gần đây.

### Quản lý sản phẩm

Quản trị viên có thể:

- Xem danh sách sản phẩm.
- Sắp xếp sản phẩm theo tên.
- Tạo sản phẩm mới.
- Chỉnh sửa sản phẩm.
- Xóa sản phẩm.
- Nhập tên sản phẩm.
- Chọn loại sản phẩm.
- Nhập giá bán.
- Nhập điểm đánh giá.
- Nhập phần trăm giảm giá.
- Chọn hình ảnh sản phẩm.
- Hiển thị thông báo khi tạo, cập nhật hoặc xóa sản phẩm thành công.

Các loại sản phẩm hiện có trong form quản trị:

- Sách
- Truyện

### Quản lý đơn hàng trong Admin

Quản trị viên có thể xem:

- Tên khách hàng.
- Số điện thoại.
- Địa chỉ.
- Trạng thái thanh toán.
- Trạng thái giao hàng.
- Phương thức thanh toán.
- Tổng tiền đơn hàng.

### Quản lý khách hàng

Quản trị viên có thể:

- Xem danh sách khách hàng.
- Xem email.
- Xem địa chỉ.
- Xem số điện thoại.
- Kiểm tra quyền quản trị.
- Chỉnh sửa thông tin khách hàng.
- Xóa tài khoản khách hàng.
- Hiển thị thông báo khi cập nhật hoặc xóa khách hàng thành công.

### Trang không tìm thấy

Khi truy cập đường dẫn không tồn tại, hệ thống hiển thị:

- Mã lỗi 404.
- Thông báo trang không tồn tại hoặc đã được chuyển đi.
- Nút quay về trang chủ.

## Danh sách route

| Route | Chức năng |
|---|---|
| `/` | Trang chủ |
| `/products` | Danh sách sản phẩm |
| `/product/:type` | Danh sách sản phẩm theo loại |
| `/product-details/:id` | Chi tiết sản phẩm |
| `/order` | Giỏ hàng |
| `/payment` | Thanh toán |
| `/order-success` | Đặt hàng thành công |
| `/my-order` | Đơn hàng của tôi |
| `/details-order/:id` | Chi tiết đơn hàng |
| `/profile-user` | Thông tin tài khoản |
| `/sign-in` | Đăng nhập |
| `/sign-up` | Đăng ký |
| `/system/admin` | Khu vực quản trị |
| `*` | Trang 404 |

## Cấu trúc dự án

```text
NovaShop/
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── AdminProduct/
│   │   │   ├── AdminUser/
│   │   │   ├── ButtonComponent/
│   │   │   ├── CardComponent/
│   │   │   ├── CommentComponent/
│   │   │   ├── DefaultComponent/
│   │   │   ├── DrawerComponent/
│   │   │   ├── HeaderComponent/
│   │   │   ├── InputComponent/
│   │   │   ├── InputForm/
│   │   │   ├── LoadingComponent/
│   │   │   ├── Message/
│   │   │   ├── ModalComponent/
│   │   │   ├── NavbarComponent/
│   │   │   ├── OrderAdmin/
│   │   │   ├── ProductDetailsComponent/
│   │   │   ├── SliderComponent/
│   │   │   ├── StepComponent/
│   │   │   ├── TableComponent/
│   │   │   └── TypeProduct/
│   │   ├── data/
│   │   │   └── mockProducts.js
│   │   ├── pages/
│   │   │   ├── AdminPage/
│   │   │   ├── DetailsOrderPage/
│   │   │   ├── HomePage/
│   │   │   ├── MyOrderPage/
│   │   │   ├── NotFoundPage/
│   │   │   ├── OrderPage/
│   │   │   ├── OrderSuccessPage/
│   │   │   ├── PaymentPage/
│   │   │   ├── ProductDetailsPage/
│   │   │   ├── ProductsPage/
│   │   │   ├── ProfilePage/
│   │   │   ├── SignInPage/
│   │   │   ├── SignUpPage/
│   │   │   └── TypeProductPage/
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   └── store.js
│   │   ├── routes/
│   │   │   └── index.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend-node/
│   └── package.json
├── rec-engine-python/
│   ├── app/
│   │   └── main.py
│   ├── requirements.txt
│   └── train_cron.py
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

## Dữ liệu hiện tại

Phiên bản hiện tại sử dụng dữ liệu mẫu ở phía frontend cho:

- Sản phẩm.
- Người dùng.
- Đơn hàng.
- Thống kê dashboard.
- Thông tin thanh toán.
- Thông tin tài khoản.

Các thao tác tạo, sửa và xóa trong khu vực quản trị hiện chỉ cập nhật state trong phiên làm việc trên trình duyệt.

## Trạng thái phát triển

Các giao diện và luồng chính của website đã được xây dựng, bao gồm mua sắm, giỏ hàng, thanh toán, đơn hàng và quản trị.

Các phần backend, cơ sở dữ liệu, xác thực người dùng, thanh toán trực tuyến và hệ thống gợi ý sản phẩm hiện chưa được kết nối với frontend trong phiên bản hiện tại.