import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Col } from "antd";
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
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (value) => {
    const keyword = value.trim();

    if (keyword) {
      navigate(`/products?search=${encodeURIComponent(keyword)}`);
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    if (query.trim())
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
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
        />
      </Col>

      <Col
        span={6}
        style={{ display: "flex", gap: "20px", alignItems: "center" }}
      >
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

        {/* <div>
          <Badge count={0} size="small" showZero={false}>
            <ShoppingCartOutlined style={{ fontSize: "30px", color: "#fff" }} />
          </Badge>
          <WrapperTextHeaderSmall>Giỏ hàng</WrapperTextHeaderSmall>
        </div> */}
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
