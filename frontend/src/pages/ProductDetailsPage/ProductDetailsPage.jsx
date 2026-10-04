import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as ProductService from "../../services/ProductService";
import ProductDetailsComponent from '../../components/ProductDetailsComponent/ProductDetailsComponent';
import { getMockProductDetail } from '../../data/mockProductDetail';

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

  return (
    <ProductDetailsComponent product={product} isLoading={loading} />
  );
};

export default ProductDetailsPage;