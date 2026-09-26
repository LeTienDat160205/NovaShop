import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  return <Result status="success" title="Đặt hàng thành công" subTitle="NovaShop đã ghi nhận đơn hàng của bạn." extra={[<Button key="orders" onClick={() => navigate("/my-order")}>Xem đơn hàng</Button>, <Button type="primary" key="home" onClick={() => navigate("/")}>Tiếp tục mua sắm</Button>]} />;
};

export default OrderSuccessPage;
