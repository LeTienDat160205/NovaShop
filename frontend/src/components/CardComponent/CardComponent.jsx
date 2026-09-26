import { Meta } from "antd/es/list/Item";
import React from "react";
import {
  StyleNameProduct,
  WrapperCardStyle,
  WrapperDiscountText,
  WrapperPriceText,
  WrapperReportText,
  WrapperStyleTextSell,
} from "./style";
import { StarFilled } from "@ant-design/icons";
import logo from "../../assets/images/logo.png";

const CardComponent = ({ product }) => {
  return (
    <WrapperCardStyle
      hoverable
      variant="borderless"
      style={{ width: "100%" }}
      bodyStyle={{ padding: "10px" }}
      cover={
        <img
          draggable={false}
          alt={product.name}
          src={product.image}
        />
      }
    >
      <img
        src={logo}
        style={{
          width: "68px",
          height: "14px",
          position: "absolute",
          top: -1,
          left: -1,
          borderTopLeftRadius: "3px",
        }}
      />

      <StyleNameProduct>{product.name}</StyleNameProduct>

      <WrapperReportText>
        <span style={{ marginRight: "4px" }}>
          <span>{product.rating}</span>
          <StarFilled style={{ fontSize: "12px", color: "orange" }} />
        </span>
        <WrapperStyleTextSell>| Đã bán {product.sold}</WrapperStyleTextSell>
      </WrapperReportText>

      <WrapperPriceText>
        <span style={{ marginRight: "8px" }}>{product.price}</span>
        <WrapperDiscountText>{product.discount}</WrapperDiscountText>
      </WrapperPriceText>
    </WrapperCardStyle>
  );
};

export default CardComponent;
