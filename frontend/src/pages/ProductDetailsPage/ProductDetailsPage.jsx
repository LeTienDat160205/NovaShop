import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as ProductService from "../../services/ProductService";
import ProductDetailsComponent from '../../components/ProductDetailsComponent/ProductDetailsComponent';
import { getMockProductDetail } from '../../data/mockProductDetail';
import { message } from "antd";

// Bật fallback dữ liệu mock khi chưa kết nối backend
// Xóa hoặc chuyển thành false khi backend sẵn sàng
const USE_MOCK_FALLBACK = true;

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await ProductService.getDetailsProduct(id);

        if (response?.status === "OK") {
          setProduct(response.data);
        } else if (USE_MOCK_FALLBACK) {
          setProduct(getMockProductDetail(id));
        } else {
          setProduct(null);
        }
      } catch {
        if (USE_MOCK_FALLBACK) {
          setProduct(getMockProductDetail(id));
        } else {
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = ({ productId, quantity }) => {
    if (!product || !productId) {
      message.error("Không tìm thấy sản phẩm!");
      return;
    }

    const cart = JSON.parse(
      localStorage.getItem("novashop_cart") || "[]"
    );

    const existingProduct = cart.find(
      (item) => item.productId === productId
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.push({
        productId,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "",
        quantity,
      });
    }

    localStorage.setItem("novashop_cart", JSON.stringify(cart));

    message.success("Đã thêm sản phẩm vào giỏ hàng!");
  };

  const navigate = useNavigate();

  const handleBuyNow = ({ productId, quantity }) => {
    if (!product || !productId) {
      return;
    }

    const selectedItems = [
      {
        productId,
        name: product.name,
        price: Number(product.price),
        image: product.images?.[0] || "",
        quantity: Number(quantity) || 1,
      },
    ];

    navigate("/payment", {
      state: {
        selectedItems,
        totalPrice: Number(product.price) * (Number(quantity) || 1),
      },
    });
  };

  return (
    <ProductDetailsComponent
      product={product}
      isLoading={loading}
      onAddToCart={handleAddToCart}
      onBuyNow={handleBuyNow}
    />
  );
};

export default ProductDetailsPage;