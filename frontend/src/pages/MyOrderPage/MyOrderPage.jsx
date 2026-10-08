import React, { useState } from "react";
import { Button, Card, Tag, Empty, Image, Modal } from "antd";
import { useNavigate } from "react-router-dom";

const formatPrice = (price) =>
  `${Number(price).toLocaleString("vi-VN")} ₫`;

const MyOrderPage = () => {
  const navigate = useNavigate();

  const [orders] = useState(() => {
    try {
      const savedOrders = JSON.parse(
        localStorage.getItem("novashop_orders") || "[]"
      );

      return Array.isArray(savedOrders) ? savedOrders : [];
    } catch (error) {
      console.error("Lỗi đọc đơn hàng:", error);
      return [];
    }
  });

  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <main
      style={{
        background: "#f5f5fa",
        minHeight: "calc(100vh - 72px)",
        padding: "24px 120px",
      }}
    >
      <h2 style={{ marginBottom: 24 }}>Đơn hàng của tôi</h2>

      {orders.length === 0 ? (
        <div
          style={{
            background: "#fff",
            padding: 40,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <Empty description="Bạn chưa có đơn hàng nào" />

          <Button
            type="primary"
            onClick={() => navigate("/")}
            style={{ marginTop: 16 }}
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      ) : (
        orders.map((order) => (
          <Card
            key={order.id}
            title={`Đơn #${order.id}`}
            extra={
              <Tag color="blue">
                {order.status || "Chờ xác nhận"}
              </Tag>
            }
            style={{
              marginBottom: 16,
              borderRadius: 8,
            }}
          >
            {/* Danh sách sản phẩm */}
            {(order.items || []).map((item) => (
              <div
                key={item.productId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Image
                  src={item.image}
                  width={80}
                  height={80}
                  preview={false}
                  style={{
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 500 }}>
                    {item.name}
                  </p>

                  <p
                    style={{
                      marginTop: 8,
                      marginBottom: 0,
                      color: "#808089",
                    }}
                  >
                    Số lượng: x{item.quantity}
                  </p>
                </div>

                <strong>
                  {formatPrice(
                    Number(item.price) * Number(item.quantity)
                  )}
                </strong>
              </div>
            ))}

            {/* Tổng tiền */}
            <div
              style={{
                textAlign: "right",
                marginTop: 20,
              }}
            >
              <span>Tổng tiền: </span>

              <strong
                style={{
                  color: "#ff424e",
                  fontSize: 20,
                }}
              >
                {formatPrice(order.totalPrice)}
              </strong>
            </div>

            {/* Nút xem chi tiết */}
            <div style={{ marginTop: 16 }}>
              <Button onClick={() => setSelectedOrder(order)}>
                Xem chi tiết
              </Button>
            </div>
          </Card>
        ))
      )}

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title={
          selectedOrder
            ? `Chi tiết đơn hàng #${selectedOrder.id}`
            : "Chi tiết đơn hàng"
        }
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={
          <Button onClick={() => setSelectedOrder(null)}>
            Đóng
          </Button>
        }
      >
        {selectedOrder && (
          <>
            <p>
              <strong>Mã đơn hàng:</strong> {selectedOrder.id}
            </p>

            <p>
              <strong>Ngày đặt:</strong>{" "}
              {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
            </p>

            <p>
              <strong>Trạng thái:</strong> {selectedOrder.status}
            </p>

            <p>
              <strong>Người nhận:</strong>{" "}
              {selectedOrder.shippingInfo?.name || "Chưa cập nhật"}
            </p>

            <p>
              <strong>Số điện thoại:</strong>{" "}
              {selectedOrder.shippingInfo?.phone || "Chưa cập nhật"}
            </p>

            <p>
              <strong>Địa chỉ:</strong>{" "}
              {selectedOrder.shippingInfo?.address || "Chưa cập nhật"}
            </p>

            <p>
              <strong>Phương thức thanh toán:</strong>{" "}
              {selectedOrder.payment === "cod"
                ? "Thanh toán khi nhận hàng"
                : "Thẻ ngân hàng / ví điện tử"}
            </p>

            <p>
              <strong>Tổng tiền:</strong>{" "}
              <strong style={{ color: "#ff424e" }}>
                {formatPrice(selectedOrder.totalPrice)}
              </strong>
            </p>
          </>
        )}
      </Modal>
    </main>
  );
};

export default MyOrderPage;