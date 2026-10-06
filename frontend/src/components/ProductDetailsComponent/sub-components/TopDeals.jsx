import React, { useEffect, useState } from 'react';
import {
  SectionCard,
  CardTitle,
  HorizontalScrollRow,
} from '../style';
import CardComponent from '../../CardComponent/CardComponent';
import * as ProductService from '../../../services/ProductService';

const PRODUCT_LIMIT = 6;

const TopDeals = ({ currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTopDeals = async () => {
      try {
        setIsLoading(true);

        // Lấy sản phẩm thật từ API
        const response = await ProductService.getAllProduct();

        if (response?.status !== 'OK') {
          setProducts([]);
          return;
        }

        const allProducts = response.data || [];

        // Loại sản phẩm hiện tại
        const availableProducts = allProducts.filter(
          (product) => product._id !== currentProductId
        );

        // Trộn sản phẩm ngẫu nhiên
        const shuffledProducts = [...availableProducts].sort(
          () => Math.random() - 0.5
        );

        // Lấy tối đa 6 sản phẩm
        const randomProducts = shuffledProducts.slice(
          0,
          PRODUCT_LIMIT
        );

        setProducts(randomProducts);
      } catch (error) {
        console.error('Lỗi tải Top Deals:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopDeals();
  }, [currentProductId]);

  // Đang tải
  if (isLoading) {
    return (
      <SectionCard>
        <CardTitle>🔥 Top Deals</CardTitle>

        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#999',
          }}
        >
          Đang tải sản phẩm...
        </div>
      </SectionCard>
    );
  }

  // Không có sản phẩm
  if (products.length === 0) {
    return null;
  }

  return (
    <SectionCard>
      <CardTitle>🔥 Top Deals</CardTitle>

      <HorizontalScrollRow>
        {products.map((product) => (
          <CardComponent
            key={product._id}
            product={product}
          />
        ))}
      </HorizontalScrollRow>
    </SectionCard>
  );
};

export default TopDeals;