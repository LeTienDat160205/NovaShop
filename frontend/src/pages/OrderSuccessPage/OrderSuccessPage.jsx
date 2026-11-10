import { useEffect, useState } from "react";
import { Button, Result, Spin } from "antd";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getMyOrder } from "../../services/AdminService";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectStatus = searchParams.get("status");
  const redirectAppTransId = searchParams.get("apptransid") || searchParams.get("app_trans_id") || "";
  const redirectOrderId = redirectAppTransId.includes("_") ? redirectAppTransId.slice(redirectAppTransId.indexOf("_") + 1) : "";
  const orderId = searchParams.get("orderId") || redirectOrderId || location.state?.orderId;
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(Boolean(orderId));

  useEffect(() => {
    if (!orderId) return undefined;

    let active = true;
    let attempts = 0;
    let timer;
    const loadOrder = async () => {
      try {
        const result = await getMyOrder(orderId);
        if (!active) return;
        setOrder(result.data);
        setError("");
        if (redirectStatus && redirectStatus !== "1") {
          setChecking(false);
        } else if (result.data.paymentStatus === "Pending" && attempts < 20) {
          attempts += 1;
          timer = window.setTimeout(loadOrder, 3000);
        } else {
          setChecking(false);
        }
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message || "Không thể kiểm tra trạng thái đơn hàng.");
        setChecking(false);
      }
    };

    loadOrder();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [orderId]);

  if (checking) {
    return <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}><Spin size="large" tip="Đang xác nhận thanh toán..." /></div>;
  }

  if (error) {
    return <Result status="error" title="Không thể kiểm tra đơn hàng" subTitle={error} extra={<Button onClick={() => navigate("/my-order")}>Xem đơn hàng</Button>} />;
  }

  const paymentFailed = order?.paymentStatus === "Failed" || (redirectStatus && redirectStatus !== "1");
  const paymentPending = order?.paymentStatus === "Pending";
  const title = paymentFailed
    ? "Thanh toán chưa thành công"
    : paymentPending
      ? "Đang chờ xác nhận thanh toán"
      : "Đặt hàng thành công";
  const subTitle = paymentFailed
    ? redirectStatus && redirectStatus !== "1"
      ? "Bạn đã hủy hoặc giao dịch ZaloPay không thành công. Đơn hàng chưa được xác nhận thanh toán."
      : "Giao dịch ZaloPay chưa hoàn tất. Đơn hàng chưa được xác nhận thanh toán."
    : paymentPending
    ? "ZaloPay chưa gửi callback về hệ thống. Trang sẽ tự kiểm tra lại trong ít phút; bạn cũng có thể xem trong mục đơn hàng."
      : "NovaShop đã ghi nhận đơn hàng của bạn.";

  return (
    <Result
      status={paymentFailed ? "error" : paymentPending ? "info" : "success"}
      title={title}
      subTitle={subTitle}
      extra={[
        ...(orderId ? [<Button key="detail" onClick={() => navigate(`/details-order/${orderId}`)}>Chi tiết đơn hàng</Button>] : []),
        <Button key="orders" onClick={() => navigate("/my-order")}>Xem đơn hàng</Button>,
        <Button type="primary" key="home" onClick={() => navigate("/")}>Tiếp tục mua sắm</Button>
      ]}
    />
  );
};

export default OrderSuccessPage;
