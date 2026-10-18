import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Badge, Col, Dropdown } from "antd";
import {
  CaretDownOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  WrapperHeader,
  WrapperHeaderAccount,
  WrapperTextHeader,
  WrapperTextHeaderSmall,
} from "./style";
import ButtonInputSearch from "../ButtonInputSearch/ButtonInputSearch";

const HeaderComponent = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("novashop_user")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncUser = () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("novashop_user")) || null;
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    };

    syncUser();
    window.addEventListener("novashop-auth-changed", syncUser);

    return () => {
      window.removeEventListener("novashop-auth-changed", syncUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("novashop_token");
    localStorage.removeItem("novashop_user");
    window.dispatchEvent(new Event("novashop-auth-changed"));
    navigate("/");
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    const keyword = search.trim();
    if (!keyword) return;

    // Kiểm tra xem hiện tại có đang ở trang category: /products/:type không
    const matchCategory = location.pathname.match(/^\/products\/([^/?]+)/);
    const currentCategory = matchCategory ? matchCategory[1] : null;

    if (currentCategory && currentCategory !== "all") {
      // Đang ở danh mục (vd: tai nghe, loa...) -> Chỉ tìm kiếm trong danh mục đó
      navigate(`/products/${currentCategory}?search=${encodeURIComponent(keyword)}`);
    } else {
      // Ở trang chủ hoặc nơi khác -> Tìm kiếm toàn sàn (vào trang all hoặc trang tìm kiếm chung)
      navigate(`/products/all?search=${encodeURIComponent(keyword)}`);
    }
  };

  const userMenu = {
    items: [
      ...(user?.role === "Customer"
        ? [{
            key: "orders",
            label: "Đơn hàng của tôi",
            onClick: () => navigate("/my-order"),
          }]
        : []),
      {
        key: "profile",
        label: "Thông tin",
        onClick: () => navigate("/profile-user"),
      },
      {
        key: "logout",
        label: "Đăng xuất",
        onClick: handleLogout,
      },
    ],
  };

  return (
    <WrapperHeader>
      <Col span={5}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <WrapperTextHeader>NovaShop</WrapperTextHeader>
        </Link>
      </Col>

      <Col span={13}>
        <ButtonInputSearch
          size="large"
          bordered={false}
          placeholder="Tìm kiếm sản phẩm, danh mục hay thương hiệu"
          textButton="Tìm kiếm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={handleSearch}
        />
      </Col>

      <Col
        span={6}
        style={{ display: "flex", gap: "20px", alignItems: "center" }}
      >
        {user ? (
          <Dropdown menu={userMenu} trigger={["click"]} placement="bottomRight">
            <WrapperHeaderAccount style={{ position: "relative" }}>
              <Avatar
                size={30}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#fff", color: "#1a94ff" }}
              />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>
                    {user.name || "Tài khoản"}
                  </span>
                  <CaretDownOutlined style={{ color: "#fff", fontSize: 12 }} />
                </div>
              </div>
            </WrapperHeaderAccount>
          </Dropdown>
        ) : (
          <WrapperHeaderAccount>
            <UserOutlined style={{ fontSize: "30px" }} />
            <div>
              <Link
                to="/sign-in"
                style={{ color: "#fff", textDecoration: "none" }}
              >
                <div>
                  <span>Tài khoản </span>
                  <CaretDownOutlined />
                </div>
                <WrapperTextHeaderSmall>
                  Đăng nhập / Đăng ký
                </WrapperTextHeaderSmall>
              </Link>
            </div>
          </WrapperHeaderAccount>
        )}

        <Link
          to="/order"
          style={{
            color: "#fff",
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Badge count={0} size="small" showZero={false}>
            <ShoppingCartOutlined style={{ fontSize: "30px", color: "#fff" }} />
          </Badge>
          <WrapperTextHeaderSmall>Giỏ hàng</WrapperTextHeaderSmall>
        </Link>
      </Col>
    </WrapperHeader>
  );
};

export default HeaderComponent;