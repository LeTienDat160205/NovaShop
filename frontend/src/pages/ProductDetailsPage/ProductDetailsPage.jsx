import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as ProductService from "../../services/ProductService";
import ProductDetailsComponent from '../../components/ProductDetailsComponent/ProductDetailsComponent'

// const ProductDetailsPage = () => {
//   return (
//     <div style={{padding: '0 120px', background: '#efefef', height: '1000px'}}>
//         <h5>Trang chủ</h5>
        
//             <ProductDetailsComponent/>
        
//     </div>
//   )
// }

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
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div style={{ padding: "40px" }}>Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return <div style={{ padding: "40px" }}>Không tìm thấy sản phẩm</div>;
  }

  return (
    <div style={{ padding: "0 120px", background: "#efefef" }}>
      <h5>Trang chủ / Chi tiết sản phẩm</h5>
      <ProductDetailsComponent product={product} />
    </div>
  );
};

export default ProductDetailsPage