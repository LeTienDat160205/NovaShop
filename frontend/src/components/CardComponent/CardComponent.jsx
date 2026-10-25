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
  const currentPrice = Number(product?.price) || 0;
  const listPrice = Number(product?.listPrice ?? product?.list_price) || 0;
  const discountPercent = listPrice > currentPrice && currentPrice > 0
    ? Math.round(((listPrice - currentPrice) / listPrice) * 100)
    : 0;

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
          src={productImage}
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
        {Number(product?.rating) > 0 && (
          <span style={{ marginRight: "4px" }}>
            <span>{Number(product.rating).toFixed(1)}</span>
            <StarFilled style={{ fontSize: "12px", color: "orange" }} />
          </span>
        )}
        {product?.reviewCount > 0 && (
          <span style={{ marginRight: "4px" }}>
            ({Number(product.reviewCount).toLocaleString("vi-VN")} đánh giá)
          </span>
        )}
        <WrapperStyleTextSell>
          | Đã bán {product?.selled || product?.sold || 0}
        </WrapperStyleTextSell>
      </WrapperReportText>

      <WrapperPriceText>
        <span style={{ marginRight: "8px" }}>
          {currentPrice.toLocaleString("vi-VN")} đ
        </span>
        {discountPercent > 0 && (
          <WrapperDiscountText>-{discountPercent}%</WrapperDiscountText>
        )}
      </WrapperPriceText>
      {discountPercent > 0 && (
        <div style={{ marginTop: 2, color: '#85858f', fontSize: 11 }}>
          <span style={{ textDecoration: 'line-through' }}>
            {listPrice.toLocaleString('vi-VN')} đ
          </span>
        </div>
      )}
    </WrapperCardStyle>
  );
};

export default CardComponent;
