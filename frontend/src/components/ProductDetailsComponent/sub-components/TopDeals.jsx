import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ProductCarousel from '../../ProductCarousel/ProductCarousel';
import * as ProductService from '../../../services/ProductService';

const PRODUCT_LIMIT = 24;

const DealSection = styled.section`
  margin: 24px 0;
  padding: 20px;
  background: #fff;
  border: 1px solid #e6e6eb;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(30, 40, 60, 0.05);

  @media (max-width: 768px) {
    margin: 16px 0;
    padding: 14px 12px;
  }
`;

const DealHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebebf0;
`;

const DealTitle = styled.h2`
  margin: 0;
  color: #e65b36;
  font-size: 21px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const DealSubtitle = styled.span`
  color: #808089;
  font-size: 13px;
`;

const DealHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ViewAllButton = styled.button`
  border: 0;
  padding: 4px 0;
  background: transparent;
  color: #0b74e5;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: #075cb8;
    text-decoration: underline;
  }
`;

const TopDeals = ({
  currentProductId,
  onProductIdsChange,
  showEmpty = false,
  showViewAll = false,
}) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadTopDeals = async () => {
      try {
        setIsLoading(true);
        const response = await ProductService.getTopDeals(
          PRODUCT_LIMIT,
          currentProductId,
        );

        if (response?.status !== 'OK') {
          if (active) {
            setProducts([]);
            onProductIdsChange?.([]);
          }
          return;
        }

        const deals = response.data || [];

        if (active) {
          setProducts(deals);
          onProductIdsChange?.(deals.map(product => product._id));
        }
      } catch (error) {
        console.error('Lỗi tải Top Deals:', error);
        if (active) {
          setProducts([]);
          onProductIdsChange?.([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadTopDeals();
    return () => { active = false; };
  }, [currentProductId, onProductIdsChange]);

  if (isLoading) {
    return (
      <DealSection>
        <DealHeader>
          <DealTitle>🔥 TOP DEAL • SIÊU RẺ</DealTitle>
          {showViewAll && (
            <ViewAllButton type="button" onClick={() => navigate('/recommendations/deals')}>
              Xem tất cả
            </ViewAllButton>
          )}
        </DealHeader>
        <div style={{ padding: 20, textAlign: 'center', color: '#808089' }}>Đang tải sản phẩm...</div>
      </DealSection>
    );
  }

  if (!products.length && !showEmpty) return null;

  return (
    <DealSection aria-labelledby="top-deals-title">
      <DealHeader>
        <DealTitle id="top-deals-title">🔥 TOP DEAL • SIÊU RẺ</DealTitle>
        <DealHeaderActions>
          {showViewAll && (
            <ViewAllButton
              type="button"
              onClick={() => navigate('/recommendations/deals')}
            >
              Xem tất cả
            </ViewAllButton>
          )}
          {!showViewAll && <DealSubtitle>Ưu đãi nổi bật</DealSubtitle>}
        </DealHeaderActions>
      </DealHeader>
      {products.length ? (
        <ProductCarousel products={products} label="Sản phẩm ưu đãi" />
      ) : (
        <div style={{ padding: 20, textAlign: 'center', color: '#808089' }}>
          Hiện chưa có sản phẩm giảm giá.
        </div>
      )}
    </DealSection>
  );
};

export default TopDeals;
