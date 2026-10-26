# Hệ thống gợi ý sản phẩm NovaShop

> Tài liệu mô tả cách hệ thống đang hoạt động. Hãy cập nhật tài liệu này cùng
> với thay đổi liên quan đến việc thu thập tương tác, trọng số xếp hạng, công
> thức tính điểm, hành vi API hoặc vị trí hiển thị gợi ý.

Cập nhật lần cuối: 2026-10-26

## Vị trí hiển thị gợi ý

- Sau banner, trang chủ hiển thị ba khu vực riêng: **Top deal** (tối đa sáu
  sản phẩm có mức giảm giá thực tế cao nhất, được sắp xếp ở phía máy chủ),
  **Đề xuất** (tối đa mười hai sản phẩm) và **Các sản phẩm khác**. Khu vực
  ưu đãi có tông màu cam/đỏ, khu vực đề xuất có tông màu xanh; sản phẩm thuộc
  hai khu vực đầu sẽ không xuất hiện trong danh sách sản phẩm chung.
- Các khu vực trên trang chủ dùng khung nền trắng theo phong cách Tiki và có
  liên kết **Xem tất cả** đến danh sách phân trang tại
  `/recommendations/deals` và `/recommendations/recommended`. Mỗi trang tải
  24 sản phẩm một lần và có nút **Xem thêm sản phẩm** khi còn kết quả.
- Trang chi tiết sản phẩm cũng dùng thành phần gợi ý tương tự và loại trừ sản
  phẩm đang được xem.
- Thành phần gợi ý cho biết kết quả được cá nhân hóa hay dựa trên đánh giá.
- Thẻ sản phẩm hiển thị giá gốc và tính phần trăm giảm giá từ `listPrice` /
  `list_price` và `price` khi giá gốc cao hơn giá bán.
- Sản phẩm Top deal lấy từ `GET /api/product/top-deals`. API sắp xếp sản phẩm
  trong danh mục theo mức giảm giá thay vì chọn ưu đãi từ một tập sản phẩm
  ngẫu nhiên. API hỗ trợ `page` và `limit` cho trang danh sách toàn bộ ưu đãi.

Các tệp chính ở frontend:

- `frontend/src/components/RecommendedProducts/RecommendedProducts.jsx`
- `frontend/src/pages/HomePage/HomePage.jsx`
- `frontend/src/components/ProductDetailsComponent/ProductDetailsComponent.jsx`

## Thu thập tương tác

Tương tác của khách hàng đã đăng nhập được lưu thành tài liệu trong collection
MongoDB `interactions` thông qua `InteractionModel`:

| Loại | Thời điểm ghi nhận | Trọng số tương đối |
| --- | --- | ---: |
| `view` | Khách hàng đã đăng nhập mở trang chi tiết sản phẩm. Các lượt xem lặp lại cùng một sản phẩm trong vòng 30 phút được gộp lại. | 1 |
| `favorite` | Khách hàng thêm sản phẩm vào danh sách yêu thích. | 3 |
| `cart` | Khách hàng thêm sản phẩm vào giỏ hàng. | 4 |
| `purchase` | Đơn COD được tạo hoặc thanh toán MoMo được xác nhận qua callback IPN. | 6 |

Mỗi tương tác có các trường `userId`, `productId`, `type`, `createdAt` và
`updatedAt`. Lượt xem của khách chưa đăng nhập không được lưu vào hồ sơ người
dùng. Hiện tại, việc bỏ yêu thích hoặc xóa sản phẩm khỏi giỏ hàng không tạo
tương tác mang ý nghĩa không thích.

Các tệp xử lý tương tác:

- `backend-node/src/models/InteractionModel.js`
- `backend-node/src/controllers/InteractionController.js`
- `backend-node/src/utils/recordInteraction.js`
- `backend-node/src/controllers/FavoriteController.js`
- `backend-node/src/controllers/CartController.js`
- `backend-node/src/controllers/OrderController.js`
- `frontend/src/pages/ProductDetailsPage/ProductDetailsPage.jsx`

## Cách lựa chọn sản phẩm gợi ý

Khách chưa đăng nhập gọi `GET /api/product/recommendations/default` để nhận
danh sách được xếp hạng theo điểm đánh giá và số lượt đánh giá. Khách đã đăng
nhập gọi `GET /api/product/recommendations`; API Node xác thực bearer token và
chỉ chuyển ID khách hàng đã được xác minh đến recommendation engine, trình
duyệt không thể tùy ý chọn ID của người dùng khác.

1. **Khách chưa đăng nhập:** nhận danh sách mặc định được xếp hạng theo đánh
   giá.
2. **Khách đã đăng nhập nhưng chưa có tương tác phù hợp:** nhận cùng danh sách
   mặc định.
3. **Khách đã đăng nhập có tương tác:** ưu tiên content-based filtering bằng
   cách tạo hồ sơ TF‑IDF từ tên, danh mục cấp cuối, thương hiệu, nhóm, thông
   số kỹ thuật và mô tả của các sản phẩm đã tương tác; sau đó xếp hạng ứng
   viên bằng cosine similarity. Cách này không cần dữ liệu tương tác từ người
   dùng khác.
4. **Content-based filtering không tạo được sản phẩm phù hợp:** sử dụng
   collaborative filtering theo nhóm người dùng nếu có người dùng tương tự và
   dữ liệu tương tác phù hợp.
5. **Không có sản phẩm cá nhân hóa phù hợp:** quay về danh sách mặc định.

Yêu cầu có thể bao gồm `limit` (từ 1 đến 24), `page` (bắt đầu từ 1),
`excludeProductId` và `excludeProductIds`. Phản hồi chứa `mode` (`default`
hoặc `personalized`), danh sách đã xếp hạng trong `data` và `hasMore` để phân
trang. Với danh sách mặc định, hệ thống trả về tổng số chính xác. Với danh
sách cá nhân hóa, các trang giữ nguyên chế độ xếp hạng và cho biết còn kết
quả khi trang hiện tại có đủ số sản phẩm yêu cầu.

Trang chi tiết sản phẩm gọi `GET /api/product/get-similar/:id`. Engine tạo
vector TF‑IDF đã chuẩn hóa từ tên sản phẩm, danh mục cấp cuối, thương hiệu,
nhóm, thông số kỹ thuật và mô tả, rồi xếp hạng các sản phẩm khác bằng cosine
similarity. Các vector danh mục được lưu trong bộ nhớ đệm cùng dữ liệu danh
mục sản phẩm.

## Cách tính điểm

### Xếp hạng mặc định theo đánh giá

Điểm đánh giá từ dữ liệu nhập vào trong `datasetratings` (với `source:
ReviewClean`) được kết hợp với đánh giá của khách hàng NovaShop. Nếu chưa có
đánh giá nhập vào, điểm đánh giá hiện có trên sản phẩm được tính như một lượt
đánh giá cùng với các đánh giá của khách hàng NovaShop.

Điểm Bayesian được tính như sau:

```text
score = n / (n + m) * R + m / (n + m) * C
```

- `R`: điểm đánh giá trung bình của sản phẩm
- `n`: số lượt đánh giá được dùng cho sản phẩm
- `C`: điểm đánh giá trung bình có trọng số của toàn bộ danh mục
- `m`: số lượt đánh giá tối thiểu dùng làm giá trị ưu tiên, hiện là `5`

Sản phẩm được sắp xếp theo điểm này, sau đó theo số lượt đánh giá rồi đến
ngày tạo mới nhất. Nếu không có dữ liệu đánh giá, sản phẩm mới hơn được xếp
trước.

### Trọng số và độ mới của tương tác

Trọng số của từng hành động được khai báo trong
`rec-engine-python/recommendation_engine.py`. Trọng số mỗi sự kiện giảm theo
chu kỳ bán rã 60 ngày:

```text
event_weight = action_weight * 0.5 ** (age_in_days / 60)
```

### Collaborative filtering

Engine tạo vector tương tác sản phẩm có trọng số cho khách hàng và những
khách hàng khác. Engine tính cosine similarity trên các sản phẩm mà hai hồ sơ
cùng tương tác, đồng thời dùng toàn bộ hồ sơ tương tác gần đây của từng người
dùng lân cận để chuẩn hóa. Tối đa 200 người dùng tương tự nhất đóng góp các
tương tác có trọng số vào điểm của sản phẩm ứng viên. Sản phẩm khách hàng đã
tương tác sẽ bị loại khỏi kết quả.

Điểm kết hợp được tính như sau:

```text
final_score = 0.8 * normalized_neighbor_score + 0.2 * normalized_default_score
```

### Dự phòng bằng hồ sơ nội dung cho khách đã đăng nhập

Khi collaborative filtering không tạo được sản phẩm ứng viên, engine kết hợp
vector TF‑IDF của các sản phẩm khách hàng đã tương tác, có xét trọng số và độ
mới của tương tác. Sau đó, engine so sánh vector hồ sơ thu được với vector
của từng sản phẩm ứng viên bằng cosine similarity. Điểm tương đồng nội dung
được kết hợp với điểm mặc định theo cùng tỷ lệ 80% cá nhân hóa và 20% mặc
định. Sản phẩm đã tương tác sẽ bị loại khỏi kết quả.

## Vận hành và hiệu năng của engine

- Dịch vụ Python: `rec-engine-python/server.py`
- Các hàm xếp hạng: `rec-engine-python/recommendation_engine.py`
- API Node trung gian: `backend-node/src/controllers/ProductController.js`
- API gợi ý: `GET /api/product/recommendations`
- API sản phẩm tương tự: `GET /api/product/get-similar/:id`
- API Top deal: `GET /api/product/top-deals`
- Địa chỉ mặc định của engine: `http://localhost:8001`
- Có thể thay địa chỉ bằng biến môi trường backend `REC_ENGINE_URL`.
- Danh mục sản phẩm và dữ liệu tổng hợp đánh giá được lưu trong bộ nhớ tiến
  trình trong năm phút. Lịch sử tương tác được truy vấn cho mỗi yêu cầu gợi ý
  cá nhân hóa.
- Hiện tại, truy vấn cá nhân hóa giới hạn lịch sử của khách hàng ở 500 sự
  kiện, các sự kiện khớp sản phẩm đã tương tác ở 20.000 sự kiện và sự kiện
  ứng viên của người dùng lân cận ở 25.000 sự kiện. Khoảng thời gian tìm
  tương tác của người dùng lân cận là một năm.

Chạy engine từ thư mục `rec-engine-python`:

```powershell
python -m pip install -r requirements.txt
python server.py
```
