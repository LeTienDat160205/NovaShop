import { useEffect, useState } from "react";
import { Button, Card, Tag, Empty, Image, Popconfirm, Spin, message, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { cancelMyOrder, getMyOrders } from "../../services/AdminService";
import { clearAuthSession, getAuthSession } from "../../utils/authSession";

const formatPrice = (price) =>
  `${Number(price).toLocaleString("vi-VN")} ₫`;

const MyOrderPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState("");

  const handleCancelOrder = async (orderId) => {
    setCancellingId(orderId);
    try {
      const result = await cancelMyOrder(orderId);
      setOrders(current => current.map(order => order.id === orderId ? result.data : order));
      message.success(result.message || "Đã hủy đơn hàng.");
    } catch (error) {
      message.error(error.message || "Không thể hủy đơn hàng.");
    } finally {
      setCancellingId("");
    }
  };

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
              <Space wrap>
                <Button onClick={() => navigate(`/details-order/${order.id}`)}>
                  Xem chi tiết
                </Button>
                {order.status === "Pending"
                  && order.paymentStatus !== "Pending"
                  && order.paymentStatus !== "Paid" && (
                  <Popconfirm
                    title="Hủy đơn hàng này?"
                    description="Thao tác này không thể hoàn tác."
                    onConfirm={() => handleCancelOrder(order.id)}
                    okText="Hủy đơn"
                    cancelText="Quay lại"
                  >
                    <Button danger loading={cancellingId === order.id}>Hủy đơn hàng</Button>
                  </Popconfirm>
                )}
              </Space>
            </div>
          </Card>
        ))
      )}
    </main>
  );
};

export default MyOrderPage;