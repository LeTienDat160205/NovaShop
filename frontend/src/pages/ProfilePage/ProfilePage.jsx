import React, { useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Radio,
  Row,
  Col,
  Avatar,
  Upload,
  Typography,
  Divider,
  Space,
  message,
} from "antd";

import {
  UserOutlined,
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
  DeleteOutlined,
  FacebookFilled,
  GoogleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState(null);

  const handleAvatarChange = (info) => {
    const file = info.file.originFileObj || info.file;

    if (file instanceof Blob) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setAvatar(e.target.result);
      };

      reader.readAsDataURL(file);
    }

    return false;
  };

  const handleSave = (values) => {
    console.log("Profile:", values);
    message.info("Chưa kết nối API cập nhật tài khoản");
  };

  const actionItem = (icon, title, description, buttonText, disabled = false) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: "1px solid #f0f0f0",
        gap: 12,
      }}
    >
      <Space align="start">
        <span style={{ fontSize: 19, color: "#999" }}>{icon}</span>

        <div>
          <Text>{title}</Text>

          {description && (
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {description}
              </Text>
            </div>
          )}
        </div>
      </Space>

      <Button
        size="small"
        disabled={disabled}
        onClick={() => message.info(`Chức năng ${title} chưa được tích hợp`)}
      >
        {buttonText}
      </Button>
    </div>
  );

  return (
    <main
      style={{
        background: "#f5f5fa",
        minHeight: "calc(100vh - 72px)",
        padding: "24px clamp(16px, 6vw, 120px)",
      }}
    >
      <Title level={4} style={{ fontWeight: 400, marginBottom: 20 }}>
        Thông tin tài khoản
      </Title>

      <Card style={{ maxWidth: 1200, borderRadius: 8 }}>
        <Row gutter={[32, 24]}>
          {/* CỘT TRÁI */}
          <Col xs={24} lg={13}>
            <Title level={5} style={{ fontWeight: 400, color: "#666" }}>
              Thông tin cá nhân
            </Title>

            <Form
              form={form}
              layout="horizontal"
              labelCol={{ flex: "110px" }}
              wrapperCol={{ flex: 1 }}
              labelAlign="left"
              colon={false}
              initialValues={{
                name: "Khách hàng NovaShop",
                nickname: "",
                gender: "",
                nationality: "",
              }}
              onFinish={handleSave}
              style={{ marginTop: 24 }}
            >
              <Row gutter={20} align="top">
                <Col xs={24} sm={5}>
                  <div style={{ position: "relative", width: 100 }}>
                    <Avatar
                      size={100}
                      src={avatar}
                      icon={<UserOutlined />}
                      style={{
                        background: "#eef6ff",
                        color: "#4096ff",
                        border: "3px solid #c6e1ff",
                      }}
                    />

                    <Upload
                      showUploadList={false}
                      accept="image/*"
                      beforeUpload={(file) => {
                        if (!file.type.startsWith("image/")) {
                          message.error("Vui lòng chọn file ảnh");
                          return Upload.LIST_IGNORE;
                        }
                        if (file.size > 2 * 1024 * 1024) {
                          message.error("Ảnh phải nhỏ hơn 2MB");
                          return Upload.LIST_IGNORE;
                        }
                        handleAvatarChange({ file });
                        return false;
                      }}
                    >
                      <Button
                        shape="circle"
                        size="small"
                        icon={<EditOutlined />}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                        }}
                      />
                    </Upload>
                  </div>
                </Col>

                <Col xs={24} sm={19}>
                  <Form.Item label="Họ & Tên" name="name">
                    <Input placeholder="Nhập họ và tên" />
                  </Form.Item>

                  <Form.Item label="Nickname" name="nickname">
                    <Input placeholder="Thêm nickname" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Ngày sinh">
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item name="day" noStyle>
                    <Select
                      placeholder="Ngày"
                      options={Array.from({ length: 31 }, (_, i) => ({
                        label: i + 1,
                        value: i + 1,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item name="month" noStyle>
                    <Select
                      placeholder="Tháng"
                      options={Array.from({ length: 12 }, (_, i) => ({
                        label: i + 1,
                        value: i + 1,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item name="year" noStyle>
                    <Select
                      placeholder="Năm"
                      options={Array.from({ length: 100 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return { label: year, value: year };
                      })}
                    />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>

              <Form.Item label="Giới tính" name="gender">
                <Radio.Group>
                  <Radio value="Nam">Nam</Radio>
                  <Radio value="Nữ">Nữ</Radio>
                  <Radio value="Khác">Khác</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item label="Quốc tịch" name="nationality">
                <Select
                  placeholder="Chọn quốc tịch"
                  options={[
                    { label: "Việt Nam", value: "VN" },
                    { label: "Nhật Bản", value: "JP" },
                    { label: "Hàn Quốc", value: "KR" },
                    { label: "Hoa Kỳ", value: "US" },
                  ]}
                />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    marginLeft: 110,
                    minWidth: 165,
                    background: "#3178df",
                  }}
                >
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Col>

          {/* CỘT PHẢI */}
          <Col
            xs={24}
            lg={11}
            style={{
              borderLeft: "1px solid #f0f0f0",
              paddingLeft: 24,
            }}
          >
            <Title level={5} style={{ fontWeight: 400, color: "#666" }}>
              Số điện thoại và Email
            </Title>

            {actionItem(
              <PhoneOutlined />,
              "Số điện thoại",
              "Chưa cập nhật",
              "Cập nhật"
            )}

            {actionItem(
              <MailOutlined />,
              "Địa chỉ email",
              "customer@novashop.vn",
              "Cập nhật"
            )}

            <Divider orientation="left" plain>
              Bảo mật
            </Divider>

            {actionItem(
              <LockOutlined />,
              "Thiết lập mật khẩu",
              null,
              "Cập nhật"
            )}

            {actionItem(
              <SafetyOutlined />,
              "Thiết lập mã PIN",
              null,
              "Thiết lập"
            )}

            {actionItem(
              <DeleteOutlined />,
              "Yêu cầu xóa tài khoản",
              null,
              "Yêu cầu"
            )}

            <Divider orientation="left" plain>
              Liên kết mạng xã hội
            </Divider>

            {actionItem(
              <FacebookFilled style={{ color: "#1877f2" }} />,
              "Facebook",
              null,
              "Liên kết"
            )}

            {actionItem(
              <GoogleOutlined style={{ color: "#4285f4" }} />,
              "Google",
              null,
              "Đã liên kết",
              true
            )}
          </Col>
        </Row>
      </Card>
    </main>
  );
};

export default ProfilePage;