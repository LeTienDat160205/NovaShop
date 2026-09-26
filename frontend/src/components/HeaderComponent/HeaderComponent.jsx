import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const submitSearch = (event) => {
    event.preventDefault();
    if (query.trim())
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };
  return (
    <WrapperHeader>
      <Col span={5}>
        <WrapperTextHeader>NovaShop</WrapperTextHeader>
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
            <div>
              <span>Tài khoản </span>
              <CaretDownOutlined />
            </div>
            <WrapperTextHeaderSmall>Đăng nhập / Đăng ký</WrapperTextHeaderSmall>
          </div>
        </WrapperHeaderAccount>

        <div>
          <Badge count={0} size="small" showZero={false}>
            <ShoppingCartOutlined style={{ fontSize: "30px", color: "#fff" }} />
          </Badge>
          <WrapperTextHeaderSmall>Giỏ hàng</WrapperTextHeaderSmall>
        </div>
      </Col>
    </WrapperHeader>
  );
};

export default HeaderComponent;
