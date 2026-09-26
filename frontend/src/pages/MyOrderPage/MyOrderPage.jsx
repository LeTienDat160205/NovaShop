import React from "react";
import { Button, Card, Tag } from "antd";
import { useNavigate } from "react-router-dom";

const MyOrderPage = () => {
  const navigate = useNavigate();
  return <main style={{ background: "#f5f5fa", minHeight: "calc(100vh - 72px)", padding: "24px 120px" }}><h2>Đơn hàng của tôi</h2><Card title="Đơn #NS1001" extra={<Tag color="blue">Đang giao</Tag>}><p>Sách Thám tử lừng danh Conan · x1</p><p><b>Tổng tiền: 200.000 ₫</b></p><Button onClick={() => navigate("/details-order/NS1001")}>Xem chi tiết</Button></Card></main>;
};

export default MyOrderPage;
