import React from "react";
import { Card, Descriptions, Tag } from "antd";
import { useParams } from "react-router-dom";

const DetailsOrderPage = () => {
  const { id } = useParams();
  return <main style={{ background: "#f5f5fa", minHeight: "calc(100vh - 72px)", padding: "24px 120px" }}><h2>Chi tiết đơn hàng {id}</h2><Card><Descriptions column={1}><Descriptions.Item label="Trạng thái"><Tag color="blue">Đang giao</Tag></Descriptions.Item><Descriptions.Item label="Người nhận">Khách hàng NovaShop</Descriptions.Item><Descriptions.Item label="Địa chỉ">Hà Nội, Việt Nam</Descriptions.Item><Descriptions.Item label="Thanh toán">Thanh toán khi nhận hàng</Descriptions.Item><Descriptions.Item label="Tổng tiền">200.000 ₫</Descriptions.Item></Descriptions></Card></main>;
};

export default DetailsOrderPage;
