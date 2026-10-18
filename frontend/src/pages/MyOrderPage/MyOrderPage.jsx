import { useEffect, useState } from "react";
import { Button, Card, Tag, Empty, Image, Modal, Spin, message, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../../services/AdminService";
import { clearAuthSession, getAuthSession } from "../../utils/authSession";

const formatPrice = (price) =>
  `${Number(price).toLocaleString("vi-VN")} ₫`;

const MyOrderPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    let active = true;
    let loadedUserId = "";
    const fetchOrders = () => {
      const session = getAuthSession();
      if (!session.token || session.role !== "Customer") {
        setOrders([]);
        loadedUserId = "";
        setLoading(false);
        navigate(!session.token ? "/sign-in" : session.role === "Admin" ? "/system/admin" : "/", { replace: true });
        return;
      }
      const requestedUserId = session.userId;
      if (requestedUserId !== loadedUserId) {
        setOrders([]);
        setLoading(true);
        loadedUserId = requestedUserId;
      }
      getMyOrders()
        .then(result => {
          if (active && getAuthSession().userId === requestedUserId) {
            setOrders(result.data || []);
          }
        })
        .catch(error => {
          if (active) {
            if (error.status === 401) clearAuthSession();
            message.error(error.message || "Không thể tải đơn hàng.");
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    };

    fetchOrders();
    const refreshTimer = window.setInterval(fetchOrders, 30000);
    window.addEventListener("novashop-auth-changed", fetchOrders);
    window.addEventListener("storage", fetchOrders);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("novashop-auth-changed", fetchOrders);
      window.removeEventListener("storage", fetchOrders);
    };
  }, [navigate]);

  const statusLabel = {
    Pending: "Chờ xác nhận",
    Processing: "Đang xử lý",
    Delivered: "Hoàn tất",
    Cancelled: "Đã hủy",
  };

  return (
    <main
      style={{
        background: "#f5f5fa",
        minHeight: "calc(100vh - 72px)",
        padding: "24px 120px",
      }}
    >
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Đơn hàng của tôi</h2>
        <Button icon={<ReloadOutlined />} onClick={() => {
          const requestedUserId = getAuthSession().userId;
          setLoading(true);
          getMyOrders()
            .then(result => {
              const session = getAuthSession();
              if (session.role === "Customer" && session.userId === requestedUserId) {
                setOrders(result.data || []);
              }
            })
            .catch(error => message.error(error.message || "Không thể tải đơn hàng."))
            .finally(() => setLoading(false));
        }}>
          Cập nhật trạng thái
        </Button>
      </Space>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : orders.length === 0 ? (
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
            title={`Đơn #${String(order.id).slice(-8).toUpperCase()}`}
            extra={
              <Tag color={order.status === "Delivered" ? "green" : order.status === "Cancelled" ? "red" : "blue"}>
                {statusLabel[order.status] || order.status || "Chờ xác nhận"}
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
            ? `Chi tiết đơn hàng #${String(selectedOrder.id).slice(-8).toUpperCase()}`
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
              <strong>Trạng thái:</strong> {statusLabel[selectedOrder.status] || selectedOrder.status}
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