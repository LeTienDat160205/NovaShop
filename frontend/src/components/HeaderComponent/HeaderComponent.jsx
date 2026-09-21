import React from "react";
import { Badge, Col } from "antd";
import Search from "antd/es/transfer/search";
import { UserOutlined, CaretDownOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { WrapperHeader, WrapperTextHeader, WrapperHeaderAccount, WrapperTextHeaderSmall } from "./style";
import ButtonInputSearch from "../ButtonInputSearch/ButtonInputSearch";

const HeaderCompoment = () => {
  return (
    <div>
      <WrapperHeader>
        <Col span={5}>
          <WrapperTextHeader>NovaShop</WrapperTextHeader>
        </Col>
        <Col span={13}>
          <ButtonInputSearch
            size= "large"
            bordered={false}
            placeholder= "input search text" 
            textButton= "Tìm kiếm"
            // onSearch={onSearch}
          />
        </Col>
        <Col span={6} style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
          <WrapperHeaderAccount>
            <UserOutlined style={{fontSize: '30px'}}/>
            <div>
              <div>
                <span>Tài khoản </span>
                <CaretDownOutlined />
              </div>
              <WrapperTextHeaderSmall>Đăng nhập/Đăng ký</WrapperTextHeaderSmall>
            </div>
          </WrapperHeaderAccount>

          <div>
            <Badge count={4} size="small">
              <ShoppingCartOutlined style={{fontSize: '30px', color: '#fff'}}/>
            </Badge>
            <WrapperTextHeaderSmall>Giỏ hàng</WrapperTextHeaderSmall>
          </div>
        </Col>
      </WrapperHeader>
    </div>
  );
};

export default HeaderCompoment;
