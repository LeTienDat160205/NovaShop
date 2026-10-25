import { useEffect, useState } from "react";
import { Alert, Button, Card, Descriptions, Empty, Image, List, Spin, Tag } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import StepComponent from "../../components/StepConponent/StepComponent";
import { StepContainer } from "../../components/StepConponent/styled";
import { getMyOrder } from "../../services/AdminService";

const orderSteps = [
  { title: "Đặt hàng" },
  { title: "Đang xử lý" },
  { title: "Hoàn tất" },
];

const statusLabel = {
  Pending: "Chờ xác nhận",
  Processing: "Đang xử lý",
  Delivered: "Hoàn tất",
  Cancelled: "Đã hủy",
};
const paymentLabel = {
  COD: "Thanh toán khi nhận hàng",
  MOMO: "Ví MoMo",
};
const paymentStatusLabel = {
  NotRequired: "Thanh toán khi nhận hàng",
  Pending: "Đang chờ thanh toán",
  Paid: "Đã thanh toán",
  Failed: "Thanh toán thất bại",
};
const formatPrice = (price) => `${Number(price || 0).toLocaleString("vi-VN")} ₫`;

const DetailsOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyOrder(id)
      .then(result => {
        if (active) setOrder(result.data);
      })
      .catch(requestError => {
        if (active) setError(requestError.message || "Không thể tải chi tiết đơn hàng.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  const currentStep = order?.status === "Delivered"
    ? 2
    : order?.status === "Processing"
      ? 1
      : 0;

  return (
    <main
      style={{
        background: "#f5f5fa",
        minHeight: "calc(100vh - 72px)",
        padding: "24px 120px",
      }}
    >
      <Button onClick={() => navigate("/my-order")} style={{ marginBottom: 16 }}>Quay lại đơn hàng</Button>
      <h2>Chi tiết đơn hàng {id}</h2>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><Spin size="large" /></div>
      ) : error ? (
        <Alert type="error" showIcon message={error} />
      ) : !order ? (
        <Empty description="Không tìm thấy đơn hàng." />
      ) : (
        <>
          <Card style={{ marginBottom: 16 }}>
            {order.status === "Cancelled" ? (
              <Tag color="red">Đơn hàng đã hủy</Tag>
            ) : (
              <StepContainer>
                <StepComponent current={currentStep} items={orderSteps} />
              </StepContainer>
            )}
            <Descriptions column={1} style={{ marginTop: 24 }}>
              <Descriptions.Item label="Trạng thái">
                <Tag color={order.status === "Delivered" ? "green" : order.status === "Cancelled" ? "red" : "blue"}>
                  {statusLabel[order.status] || order.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận">{order.shippingInfo?.name || "—"}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{order.shippingInfo?.phone || "—"}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{order.shippingInfo?.address || "—"}</Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {paymentLabel[order.paymentMethod] || "Chưa xác định"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                {paymentStatusLabel[order.paymentStatus] || "Chưa xác định"}
              </Descriptions.Item>
              {order.paymentTransactionId && (
                <Descriptions.Item label="Mã giao dịch">{order.paymentTransactionId}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
          <Card title="Sản phẩm trong đơn hàng">
            <List
              dataSource={order.items || []}
              renderItem={item => (
                <List.Item>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
                    {item.image ? <Image src={item.image} alt={item.name} width={72} height={72} preview={false} style={{ objectFit: "cover", borderRadius: 6 }} /> : null}
                    <div style={{ flex: 1 }}>
                      <div>{item.name}</div>
                      <div style={{ color: "#808089", marginTop: 6 }}>Số lượng: {item.quantity} × {formatPrice(item.price)}</div>
                    </div>
                    <strong>{formatPrice(Number(item.price) * Number(item.quantity))}</strong>
                  </div>
                </List.Item>
              )}
            />
            <div style={{ textAlign: "right", fontSize: 18, marginTop: 16 }}>
              Tổng tiền: <strong style={{ color: "#ff424e" }}>{formatPrice(order.totalPrice)}</strong>
            </div>
          </Card>
        </>
      )}
    </main>
  );
};

export default DetailsOrderPage;
