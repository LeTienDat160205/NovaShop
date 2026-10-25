import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ExploreGrid } from '../ProductDetailsComponent/style';
import CardComponent from '../CardComponent/CardComponent';
import * as ProductService from '../../services/ProductService';
import { getAuthSession } from '../../utils/authSession';

const RecommendationSection = styled.section`
  margin: 24px 0 30px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e6e6eb;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(30, 40, 60, 0.05);

  @media (max-width: 768px) {
    margin: 16px 0 22px;
    padding: 14px 12px;
  }
`;

const RecommendationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebebf0;
`;

const RecommendationTitle = styled.h2`
  margin: 0;
  color: #0b74e5;
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 0.01em;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const RecommendationActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RecommendationMode = styled.span`
  color: #526b86;
  font-size: 13px;
  text-align: right;

  @media (max-width: 560px) {
    font-size: 11px;
  }
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

const RecommendedProducts = ({
  limit = 12,
  excludeProductId,
  excludeProductIds = [],
  onProductsChange,
  showViewAll = false,
}) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState('default');
  const [authRevision, setAuthRevision] = useState(0);
  const token = getAuthSession().token;
  const excludedIdsKey = excludeProductIds.join(',');

  useEffect(() => {
    const refreshAuth = () => setAuthRevision(revision => revision + 1);
    window.addEventListener('novashop-auth-changed', refreshAuth);
    return () => window.removeEventListener('novashop-auth-changed', refreshAuth);
  }, []);

  useEffect(() => {
    let active = true;
    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        const response = await ProductService.getRecommendations(
          limit,
          excludeProductId,
          excludedIdsKey ? excludedIdsKey.split(',') : [],
        );
        if (!active) return;
        if (response?.status !== 'OK') {
          throw new Error(response?.message || 'Không thể tải gợi ý sản phẩm.');
        }
        setProducts(response.data || []);
        onProductsChange?.((response.data || []).map(product => product._id));
        setMode(response.mode === 'personalized' ? 'personalized' : 'default');
      } catch (error) {
        if (active) {
          console.error('Lỗi tải gợi ý sản phẩm:', error);
          setProducts([]);
          onProductsChange?.([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadRecommendations();
    return () => { active = false; };
  }, [limit, excludeProductId, excludedIdsKey, token, authRevision, onProductsChange]);

  return (
    <RecommendationSection aria-labelledby="recommendation-title">
      <RecommendationHeader>
        <RecommendationTitle id="recommendation-title">ĐỀ XUẤT</RecommendationTitle>
        <RecommendationActions>
          {!isLoading && (
            <RecommendationMode>
              {mode === 'personalized'
                ? 'Dựa trên tương tác của bạn'
                : 'Phổ biến dựa trên đánh giá'}
            </RecommendationMode>
          )}
          {showViewAll && (
            <ViewAllButton
              type="button"
              onClick={() => {
                const params = new URLSearchParams();
                if (excludedIdsKey) params.set('excludeProductIds', excludedIdsKey);
                if (excludeProductId) params.set('excludeProductId', excludeProductId);
                navigate(`/recommendations/recommended?${params.toString()}`);
              }}
            >
              Xem tất cả
            </ViewAllButton>
          )}
        </RecommendationActions>
      </RecommendationHeader>
      {isLoading ? (
        <div style={{ padding: '20px 0' }}>Đang tải gợi ý sản phẩm...</div>
      ) : products.length ? (
        <ExploreGrid>
          {products.map(product => (
            <CardComponent key={product._id} product={product} />
          ))}
        </ExploreGrid>
      ) : (
        <div style={{ padding: '20px 0', color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Chưa có sản phẩm phù hợp để gợi ý.          </span>
        </div>
      )}
    </RecommendationSection>
  );
};

export default RecommendedProducts;
