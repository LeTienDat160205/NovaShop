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
import { useNavigate } from "react-router-dom";

const CardComponent = ({ product, onClick }) => {
  const navigate = useNavigate();

  const handleOpenProduct = () => {
    if (onClick) {
      onClick();
      return;
    }

    navigate(`/product-details/${product?._id}`);
  }
  // Lấy ảnh: Ưu tiên product.image hoặc tấm ảnh đầu tiên trong mảng product.images
  const productImage =
    product?.image ||
    (Array.isArray(product?.images) && product?.images[0]) ||
    "https://via.placeholder.com/200";

  return (
    <WrapperCardStyle
      hoverable
      onClick={handleOpenProduct}
      variant="borderless"
      style={{ width: "100%", cursor: "pointer" }}
      bodyStyle={{ padding: "10px" }}
      cover={
        <img
          draggable={false}
          alt={product?.name || "Product Image"}
          src={
            product?.image ||
            product?.images?.[0] ||
            "https://via.placeholder.com/200"
          }
          style={{ height: "200px", objectFit: "cover" }}
        />
      }
    >
      <img
        src={logo}
        alt="Logo"
        style={{
          width: "68px",
          height: "14px",
          position: "absolute",
          top: -1,
          left: -1,
          borderTopLeftRadius: "3px",
        }}
      />

      <StyleNameProduct>{product?.name || "Tên sản phẩm"}</StyleNameProduct>

      <WrapperReportText>
        <span style={{ marginRight: "4px" }}>
          <span>{product?.rating || 5}</span>
          <StarFilled style={{ fontSize: "12px", color: "orange" }} />
        </span>
        <WrapperStyleTextSell>
          | Đã bán {product?.selled || product?.sold || 0}
        </WrapperStyleTextSell>
      </WrapperReportText>

      <WrapperPriceText>
        <span style={{ marginRight: "8px" }}>
          {product?.price
            ? `${product.price.toLocaleString("vi-VN")} đ`
            : "0 đ"}
        </span>
        {product?.discount ? (
          <WrapperDiscountText>-{product.discount}%</WrapperDiscountText>
        ) : null}
      </WrapperPriceText>
    </WrapperCardStyle>
  );
};

export default CardComponent;
