import React from "react";
import { Button, Card, Form, Input } from "antd";

const ProfilePage = () => <main style={{ background: "#f5f5fa", minHeight: "calc(100vh - 72px)", padding: "24px 120px" }}><Card title="Thông tin tài khoản" style={{ maxWidth: 680 }}><Form layout="vertical" initialValues={{ name: "Khách hàng NovaShop", email: "customer@novashop.vn", phone: "", address: "" }}><Form.Item label="Họ và tên" name="name"><Input /></Form.Item><Form.Item label="Email" name="email"><Input /></Form.Item><Form.Item label="Số điện thoại" name="phone"><Input /></Form.Item><Form.Item label="Địa chỉ" name="address"><Input /></Form.Item><Button type="primary">Lưu thay đổi</Button></Form></Card></main>;

export default ProfilePage;
