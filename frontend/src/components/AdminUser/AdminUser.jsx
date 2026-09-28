import { Button, Form, Input, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import DrawerComponent from "../DrawerComponent/DrawerComponent";
import * as message from "../Message/Message";
import ModalComponent from "../ModalComponent/ModalComponent";
import TableComponent from "../TableComponent/TableComponent";

const initialUsers = [{ id: "u1", name: "Nguyễn Minh Anh", email: "minhanh@novashop.vn", address: "Hà Nội", phone: "0901234567", isAdmin: "FALSE" }, { id: "u2", name: "Quản trị viên", email: "admin@novashop.vn", address: "Hà Nội", phone: "0900000000", isAdmin: "TRUE" }];

const AdminUser = () => {
  const [users, setUsers] = useState(initialUsers); const [selected, setSelected] = useState(null); const [drawerOpen, setDrawerOpen] = useState(false); const [deleteOpen, setDeleteOpen] = useState(false); const [form] = Form.useForm();
  const openEdit = (user) => { setSelected(user); form.setFieldsValue(user); setDrawerOpen(true); };
  const columns = ["name", "email", "address", "phone", "isAdmin"].map((dataIndex) => ({ title: dataIndex === "isAdmin" ? "Admin" : dataIndex[0].toUpperCase() + dataIndex.slice(1), dataIndex })).concat({ title: "Action", render: (_, user) => <Space><Button icon={<EditOutlined />} onClick={() => openEdit(user)}>Sửa</Button><Button danger icon={<DeleteOutlined />} onClick={() => { setSelected(user); setDeleteOpen(true); }}>Xóa</Button></Space> });
  return <div><h1 style={{ color: "#000", fontSize: 14 }}>Quản lý người dùng</h1><TableComponent columns={columns} data={users.map((item) => ({ ...item, key: item.id }))} /><DrawerComponent title="Chi tiết người dùng" open={drawerOpen} onClose={() => setDrawerOpen(false)} width="90%"><Form form={form} layout="vertical" onFinish={(values) => { setUsers((items) => items.map((item) => item.id === selected.id ? { ...item, ...values } : item)); setDrawerOpen(false); message.success("Cập nhật người dùng thành công"); }}><Form.Item label="Name" name="name"><Input /></Form.Item><Form.Item label="Email" name="email"><Input /></Form.Item><Form.Item label="Phone" name="phone"><Input /></Form.Item><Form.Item label="Address" name="address"><Input /></Form.Item><Button type="primary" htmlType="submit">Apply</Button></Form></DrawerComponent><ModalComponent title="Xóa người dùng" open={deleteOpen} onCancel={() => setDeleteOpen(false)} onOk={() => { setUsers((items) => items.filter((item) => item.id !== selected?.id)); setDeleteOpen(false); message.success("Xóa người dùng thành công"); }}><div>Bạn có chắc xóa tài khoản này không?</div></ModalComponent></div>;
};

export default AdminUser;
