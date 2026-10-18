import { useCallback, useEffect, useState } from "react";
import { Avatar, Button, Card, Col, Dropdown, Menu, Row, Statistic, Table, Tag, message } from "antd";
import {
  AppstoreOutlined,
  InboxOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AdminCart from "../../components/AdminCart/AdminCart";
import AdminUser from "../../components/AdminUser/AdminUser";
import AdminReview from "../../components/AdminReview/AdminReview";
import OrderAdmin from "../../components/OrderAdmin/OrderAmin";
import { getAdminDashboard } from "../../services/AdminService";

const statusLabels = {
  Pending: "Chờ xác nhận",
  Processing: "Đang xử lý",
  Delivered: "Hoàn tất",
  Cancelled: "Đã hủy",
};
const statusColors = {
  Pending: "orange",
  Processing: "blue",
  Delivered: "green",
  Cancelled: "red",
};
const formatPrice = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const AdminPage = () => {
  const navigate = useNavigate();
  const [keySelected, setKeySelected] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [adminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("novashop_user") || "null");
    } catch {
      return null;
    }
  });
  const loadDashboard = useCallback(async () => {
    try {
      const result = await getAdminDashboard();
      setDashboard(result.data);
    } catch (error) {
      message.error(error.message || "Không thể tải dữ liệu tổng quan.");
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (keySelected !== "dashboard") return undefined;
    const refreshDashboard = () => {
      getAdminDashboard()
        .then((result) => setDashboard(result.data))
        .catch((error) => message.error(error.message || "Không thể tải dữ liệu tổng quan."))
        .finally(() => setDashboardLoading(false));
    };
    refreshDashboard();
    const timer = window.setInterval(refreshDashboard, 30000);
    return () => window.clearInterval(timer);
  }, [keySelected]);

  const logout = () => {
    localStorage.removeItem("novashop_token");
    localStorage.removeItem("novashop_user");
    window.dispatchEvent(new Event("novashop-auth-changed"));
    navigate("/sign-in", { replace: true });
  };

  const orders = dashboard?.recentOrders || [];
  const statusCounts = dashboard?.ordersByStatus || {};
  const statCards = [
    ["Sản phẩm đang bán", dashboard?.productCount ?? 0, <InboxOutlined />, "#52c41a"],
    ["Khách hàng", dashboard?.customerCount ?? 0, <TeamOutlined />, "#722ed1"],
    ["Tổng đơn hàng", dashboard?.totalOrders ?? 0, <ShoppingCartOutlined />, "#1677ff"],
    ["Chờ xác nhận", statusCounts.Pending ?? 0, <AppstoreOutlined />, "#fa8c16"],
  ];
  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      render: (id) => `#${String(id).slice(-8).toUpperCase()}`,
    },
    { title: "Khách hàng", render: (_, order) => order.userId?.name || "Tài khoản đã xóa" },
    { title: "Tổng tiền", dataIndex: "totalPrice", render: formatPrice },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => <Tag color={statusColors[status] || "default"}>{statusLabels[status] || status}</Tag>,
    },
  ];
  const accountMenu = {
    items: [{ key: "logout", label: "Đăng xuất", onClick: logout }],
  };
  const pageTitles = {
    dashboard: "Tổng quan",
    carts: "Giỏ hàng khách hàng",
    orders: "Đơn hàng",
    users: "Quản lý tài khoản",
    reviews: "Đánh giá",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fb", display: "flex" }}>
      <aside
        style={{
          width: 250,
          background: "#102a43",
          color: "#fff",
          padding: "22px 12px",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, padding: "0 14px 24px" }}>
          NovaShop Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[keySelected]}
          onClick={({ key }) => setKeySelected(key)}
          style={{ background: "transparent" }}
          items={[
            {
              key: "dashboard",
              icon: <AppstoreOutlined />,
              label: "Tổng quan",
            },
            {
              key: "carts",
              icon: <ShoppingCartOutlined />,
              label: "Giỏ hàng",
            },
            { key: "orders", icon: <TeamOutlined />, label: "Đơn hàng" },
            { key: "users", icon: <UserOutlined />, label: "Tài khoản" },
            { key: "reviews", icon: <MessageOutlined />, label: "Đánh giá" },
          ]}
        />
      </aside>
      <main style={{ flex: 1, padding: "26px 32px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 26,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>{pageTitles[keySelected]}</h1>
            <span style={{ color: "#697586" }}>
              Cập nhật hoạt động cửa hàng hôm nay
            </span>
          </div>
          <Dropdown menu={accountMenu} trigger={["click"]} placement="bottomRight">
            <Button type="text" style={{ height: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar icon={<UserOutlined />} />
              <b>{adminUser?.name || "Quản trị viên"}</b>
            </Button>
          </Dropdown>
        </header>
        {keySelected === "carts" ? <AdminCart /> : keySelected === "orders" ? <OrderAdmin /> : keySelected === "users" ? <AdminUser /> : keySelected === "reviews" ? <AdminReview /> : (
          <>
            <Row gutter={[18, 18]}>
              {statCards.map(([title, value, icon, color]) => (
                <Col xs={24} sm={12} xl={6} key={title}>
                  <Card bordered={false}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 16 }}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 12,
                          color,
                          background: `${color}18`,
                          display: "grid",
                          placeItems: "center",
                          fontSize: 23,
                        }}
                      >
                        {icon}
                      </div>
                      <Statistic title={title} value={value} loading={dashboardLoading} />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <Row gutter={[18, 18]} style={{ marginTop: 8 }}>
              <Col xs={24} xl={8}>
                <Card title="Tình trạng đơn hàng" bordered={false}>
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <p key={status}>
                      <Tag color={statusColors[status]}>{statusCounts[status] ?? 0}</Tag> {label}
                    </p>
                  ))}
                </Card>
              </Col>
              <Col xs={24} xl={16}>
                <Card title="Đơn hàng gần đây" bordered={false} extra={<Button onClick={() => { setDashboardLoading(true); loadDashboard(); }} loading={dashboardLoading}>Làm mới</Button>}>
                  <Table
                    rowKey="_id"
                    columns={orderColumns}
                    dataSource={orders}
                    loading={dashboardLoading}
                    pagination={false}
                    locale={{ emptyText: "Chưa có đơn hàng." }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
