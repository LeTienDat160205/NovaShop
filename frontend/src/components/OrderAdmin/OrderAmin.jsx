import React from "react";
import { Tag } from "antd";
import TableComponent from "../TableComponent/TableComponent";

const orders = [{ id: "#NS1001", userName: "Nguyễn Minh Anh", phone: "0901234567", address: "Hà Nội", isPaid: "FALSE", isDelivered: "TRUE", paymentMethod: "Thanh toán khi nhận hàng", totalPrice: "1.290.000 ₫" }, { id: "#NS1002", userName: "Trần Gia Hân", phone: "0907654321", address: "TP. Hồ Chí Minh", isPaid: "TRUE", isDelivered: "TRUE", paymentMethod: "Thẻ ngân hàng", totalPrice: "850.000 ₫" }];
const columns = [{ title: "User name", dataIndex: "userName" }, { title: "Phone", dataIndex: "phone" }, { title: "Address", dataIndex: "address" }, { title: "Paided", dataIndex: "isPaid", render: (value) => <Tag color={value === "TRUE" ? "green" : "orange"}>{value}</Tag> }, { title: "Shipped", dataIndex: "isDelivered", render: (value) => <Tag color={value === "TRUE" ? "blue" : "default"}>{value}</Tag> }, { title: "Payment method", dataIndex: "paymentMethod" }, { title: "Total price", dataIndex: "totalPrice" }];
const OrderAdmin = () => <div><h1 style={{ color: "#000", fontSize: 14 }}>Quản lý đơn hàng</h1><TableComponent columns={columns} data={orders.map((item) => ({ ...item, key: item.id }))} /></div>;
export default OrderAdmin;
