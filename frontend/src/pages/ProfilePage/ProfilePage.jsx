import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Button,
  Card,
  Form,
  Input,
  Radio,
  Row,
  Col,
  Avatar,
  Upload,
  Typography,
  Divider,
  Space,
  DatePicker,
  message,
} from "antd";
import { updateProfileUser } from "../../services/AuthService";
import { clearAuthSession, getAuthSession } from "../../utils/authSession";

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
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const currentUser = getAuthSession().user;
  const [profileUserId] = useState(() => String(currentUser?.id || currentUser?._id || ""));

  const isProfileSessionValid = () => {
    const session = getAuthSession();
    if (session.token && session.userId && session.userId === profileUserId) return true;
    message.warning("Tài khoản đã thay đổi. Vui lòng mở lại trang thông tin.");
    navigate(!session.token ? "/sign-in" : session.role === "Admin" ? "/system/admin" : "/", { replace: true });
    return false;
  };

  useEffect(() => {
    const verifyProfileSession = () => {
      const session = getAuthSession();
      if (!session.token || session.userId !== profileUserId) {
        navigate(!session.token ? "/sign-in" : session.role === "Admin" ? "/system/admin" : "/", { replace: true });
      }
    };
    verifyProfileSession();
    window.addEventListener("novashop-auth-changed", verifyProfileSession);
    window.addEventListener("storage", verifyProfileSession);
    return () => {
      window.removeEventListener("novashop-auth-changed", verifyProfileSession);
      window.removeEventListener("storage", verifyProfileSession);
    };
  }, [navigate, profileUserId]);

  const profileInitialValues = {
    name: currentUser?.name || "Khách hàng NovaShop",
    nickname: "",
    gender: currentUser?.gender || "",
    address: currentUser?.address || "",
    phone: currentUser?.phone || "",
    dob: currentUser?.dob ? dayjs(currentUser.dob) : null,
  };

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

  const handleSave = async (values) => {
    if (!isProfileSessionValid()) return;
    const token = localStorage.getItem("novashop_token");

    if (!token) {
      message.error("Bạn chưa đăng nhập.");
      return;
    }

    try {
      const response = await updateProfileUser(
        {
          name: values.name || currentUser?.name || "Khách hàng NovaShop",
          address: values.address || "",
          gender: values.gender || "",
          dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
        },
        token,
      );

      const updatedUser = response.user;
      localStorage.setItem("novashop_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("novashop-auth-changed"));
      message.success("Cập nhật thông tin thành công");
    } catch (error) {
      if (error.response?.status === 401) clearAuthSession();
      message.error(error.response?.data?.message || "Không thể cập nhật thông tin.");
    }
  };

  const handlePhoneUpdate = async () => {
    if (!isProfileSessionValid()) return;
    const token = localStorage.getItem("novashop_token");
    if (!token) {
      message.error("Bạn chưa đăng nhập.");
      return;
    }

    if (!/^(0\d{9}|\+84\d{9})$/.test(phoneValue.trim())) {
      message.error("Số điện thoại phải có dạng 0xxxxxxxxx hoặc +84xxxxxxxxx.");
      return;
    }

    setIsSavingPhone(true);
    try {
      const response = await updateProfileUser({ phone: phoneValue.trim() }, token);
      localStorage.setItem("novashop_user", JSON.stringify(response.user));
      window.dispatchEvent(new Event("novashop-auth-changed"));
      setPhoneValue(response.user.phone || "");
      setIsEditingPhone(false);
      message.success("Cập nhật số điện thoại thành công");
    } catch (error) {
      if (error.response?.status === 401) clearAuthSession();
      message.error(error.response?.data?.message || "Không thể cập nhật số điện thoại.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const startPhoneEdit = () => {
    setPhoneValue(currentUser?.phone || "");
    setIsEditingPhone(true);
  };

  const actionItem = (icon, title, description, buttonText, disabled = false, onClick = () => message.info(`Chức năng ${title} chưa được tích hợp`)) => (
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
        onClick={onClick}
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
      padding: "32px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontSize: 16,
    }}
    >
      <Title level={4} style={{ fontWeight: 400, marginBottom: 20 }}>
        Thông tin tài khoản
      </Title>

      <Card style={{width: "100%", maxWidth: 1300, borderRadius: 8,fontSize: 16,}}>
        <Row gutter={[32, 24]}>

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
              initialValues={profileInitialValues}
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

              <Form.Item label="Giới tính" name="gender">
                <Radio.Group>
                  <Radio value="Nam">Nam</Radio>
                  <Radio value="Nữ">Nữ</Radio>
                  <Radio value="Khác">Khác</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="dob"
                rules={[
                  {
                    validator: (_, value) =>
                      !value || !value.isAfter(dayjs(), "day")
                        ? Promise.resolve()
                        : Promise.reject(new Error("Ngày sinh không được ở tương lai.")),
                  },
                ]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  disabledDate={(date) => date.isAfter(dayjs(), "day")}
                />
              </Form.Item>

              <Form.Item label="Địa chỉ" name="address">
                <Input placeholder="Nhập địa chỉ" />
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
              <Space align="start" style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 19, color: "#999" }}><PhoneOutlined /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text>Số điện thoại</Text>
                  {isEditingPhone ? (
                    <div style={{ marginTop: 6 }}>
                      <Input
                        value={phoneValue}
                        onChange={(event) => setPhoneValue(event.target.value)}
                        placeholder="0xxxxxxxxx hoặc +84xxxxxxxxx"
                        maxLength={13}
                        inputMode="tel"
                        status={phoneValue && !/^0\d{9}$/.test(phoneValue) && !/^\+84\d{9}$/.test(phoneValue) ? "error" : ""}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Nhập số 10 chữ số bắt đầu bằng 0 hoặc mã +84.
                      </Text>
                    </div>
                  ) : (
                    <div>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {currentUser?.phone || "Chưa cập nhật"}
                      </Text>
                    </div>
                  )}
                </div>
              </Space>
              {isEditingPhone ? (
                <Space>
                  <Button size="small" onClick={() => setIsEditingPhone(false)} disabled={isSavingPhone}>
                    Hủy
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    onClick={handlePhoneUpdate}
                    loading={isSavingPhone}
                    disabled={!/^0\d{9}$/.test(phoneValue) && !/^\+84\d{9}$/.test(phoneValue)}
                  >
                    Lưu
                  </Button>
                </Space>
              ) : (
                <Button size="small" onClick={startPhoneEdit}>Cập nhật</Button>
              )}
            </div>

            {actionItem(
              <MailOutlined />,
              "Địa chỉ email",
              currentUser?.email || "customer@novashop.vn",
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