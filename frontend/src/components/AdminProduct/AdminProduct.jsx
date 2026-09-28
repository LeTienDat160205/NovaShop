import { Button, Form, Input, InputNumber, Select, Space, Upload } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { mockProducts } from "../../data/mockProducts";
import DrawerComponent from "../DrawerComponent/DrawerComponent";
import Loading from "../LoadingComponent/Loading";
import * as message from "../Message/Message";
import ModalComponent from "../ModalComponent/ModalComponent";
import TableComponent from "../TableComponent/TableComponent";

const AdminProduct = () => {
  const [products, setProducts] = useState(mockProducts);
  const [selected, setSelected] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form] = Form.useForm();

  const closeEditor = () => { setIsCreateOpen(false); setIsDrawerOpen(false); setSelected(null); form.resetFields(); };
  const saveProduct = (values) => {
    if (selected) setProducts((items) => items.map((item) => item.id === selected.id ? { ...item, ...values } : item));
    else setProducts((items) => [...items, { ...values, id: String(Date.now()), key: String(Date.now()), sold: "0", discount: values.discount || "0%", image: itemImage }]);
    message.success(selected ? "Cập nhật sản phẩm thành công" : "Tạo sản phẩm thành công");
    closeEditor();
  };
  const itemImage = mockProducts[0]?.image;
  const editProduct = (product) => { setSelected(product); form.setFieldsValue(product); setIsDrawerOpen(true); };
  const columns = [
    { title: "Name", dataIndex: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: "Price", dataIndex: "price" },
    { title: "Rating", dataIndex: "rating" },
    { title: "Type", dataIndex: "type" },
    { title: "Action", render: (_, product) => <Space><Button icon={<EditOutlined />} onClick={() => editProduct(product)}>Sửa</Button><Button danger icon={<DeleteOutlined />} onClick={() => { setSelected(product); setIsDeleteOpen(true); }}>Xóa</Button></Space> },
  ];
  const productForm = <Form form={form} layout="vertical" onFinish={saveProduct}><Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="Type" name="type" rules={[{ required: true }]}><Select options={[{ value: "sach", label: "Sách" }, { value: "truyen", label: "Truyện" }]} /></Form.Item><Form.Item label="Price" name="price" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="Rating" name="rating"><InputNumber min={0} max={5} style={{ width: "100%" }} /></Form.Item><Form.Item label="Discount" name="discount"><Input /></Form.Item><Form.Item label="Image"><Upload maxCount={1}><Button>Chọn ảnh</Button></Upload></Form.Item></Form>;
  return <div><h1 style={{ color: "#000", fontSize: 14 }}>Quản lý sản phẩm</h1><Button style={{ height: 100, width: 100, borderRadius: 6, borderStyle: "dashed" }} onClick={() => { form.resetFields(); setSelected(null); setIsCreateOpen(true); }}><PlusOutlined style={{ fontSize: 36 }} /></Button><div style={{ marginTop: 20 }}><TableComponent columns={columns} data={products.map((item) => ({ ...item, key: item.id }))} /></div><ModalComponent title="Tạo sản phẩm" open={isCreateOpen} onCancel={closeEditor} onOk={() => form.submit()}><Loading isLoading={false}>{productForm}</Loading></ModalComponent><DrawerComponent title="Chi tiết sản phẩm" open={isDrawerOpen} onClose={closeEditor} width="90%"><Loading isLoading={false}>{productForm}</Loading></DrawerComponent><ModalComponent title="Xóa sản phẩm" open={isDeleteOpen} onCancel={() => setIsDeleteOpen(false)} onOk={() => { setProducts((items) => items.filter((item) => item.id !== selected?.id)); setIsDeleteOpen(false); message.success("Xóa sản phẩm thành công"); }}><div>Bạn có chắc xóa sản phẩm này không?</div></ModalComponent></div>;
};

export default AdminProduct;
