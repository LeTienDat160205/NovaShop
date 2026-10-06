import React, { useEffect, useState } from 'react';
import {
  SectionCard,
  CardTitle,
  HorizontalScrollRow,
} from '../style';
import CardComponent from '../../CardComponent/CardComponent';
import * as ProductService from '../../../services/ProductService';

const VIEWED_PRODUCTS_KEY = 'novashop_viewed_products';
const MAX_VIEWED_PRODUCTS = 12;

const RecentlyViewed = ({ currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        const viewedIds = JSON.parse(
          localStorage.getItem(VIEWED_PRODUCTS_KEY) || '[]'
        );

        if (!viewedIds.length) {
          setProducts([]);
          return;
        }

        // Lấy sản phẩm thật từ MongoDB
        const response = await ProductService.getAllProduct();

        if (response?.status !== 'OK') {
          setProducts([]);
          return;
        }

        const allProducts = response.data || [];

        // Lấy đúng những sản phẩm đã xem
        const viewedProducts = viewedIds
          .filter((id) => id !== currentProductId)
          .map((id) =>
            allProducts.find(
              (product) => product._id === id
            )
          )
          .filter(Boolean);

        setProducts(
          viewedProducts.slice(0, MAX_VIEWED_PRODUCTS)
        );
      } catch (error) {
        console.error(
          'Lỗi tải sản phẩm đã xem:',
          error
        );
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentlyViewed();
  }, [currentProductId]);

  if (isLoading || products.length === 0) {
    return null;
  }

  return (
    <SectionCard>
      <CardTitle>Sản phẩm bạn đã xem</CardTitle>

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

export default RecentlyViewed;