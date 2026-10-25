import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Empty, Spin } from 'antd';
import CardComponent from '../../components/CardComponent/CardComponent';
import * as ProductService from '../../services/ProductService';

const Page = styled.main`
  min-height: 100vh;
  padding: 24px max(24px, calc((100% - 1200px) / 2));
  background: #f5f5fa;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PagePanel = styled.section`
  padding: 20px;
  background: #fff;
  border: 1px solid #ebebf0;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

  @media (max-width: 768px) {
    padding: 14px 12px;
  }
`;

const PageHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #ebebf0;
`;

const PageTitle = styled.h1`
  margin: 0;
  color: ${({ $isDeals }) => ($isDeals ? '#e65b36' : '#0b74e5')};
  font-size: 24px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 19px;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 800px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const PAGE_SIZE = 24;

const RecommendationListPage = () => {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDeals = type === 'deals';
  const isValidType = isDeals || type === 'recommended';
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');
  const excludeProductId = searchParams.get('excludeProductId') || undefined;
  const excludeProductIdsKey = searchParams.get('excludeProductIds') || '';

  useEffect(() => {
    let active = true;
    const loadFirstPage = async () => {
      setLoading(true);
      setLoadError('');
      setProducts([]);
      setPage(1);
      try {
        const response = isDeals
          ? await ProductService.getTopDeals(PAGE_SIZE, excludeProductId, 1)
          : await ProductService.getRecommendations(
            PAGE_SIZE,
            excludeProductId,
            excludeProductIdsKey ? excludeProductIdsKey.split(',') : [],
            1,
          );
        if (!active) return;
        if (response?.status !== 'OK') {
          throw new Error(response?.message || 'Không thể tải danh sách sản phẩm.');
        }
        const nextProducts = response.data || [];
        setProducts(nextProducts);
        setHasMore(response.hasMore ?? nextProducts.length === PAGE_SIZE);
      } catch (error) {
        if (active) {
          console.error('Lỗi tải danh sách đề xuất:', error);
          setLoadError(error.message || 'Không thể tải danh sách sản phẩm.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (isValidType) loadFirstPage();
    return () => { active = false; };
  }, [isDeals, isValidType, excludeProductId, excludeProductIdsKey]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    setLoadError('');
    try {
      const response = isDeals
        ? await ProductService.getTopDeals(PAGE_SIZE, excludeProductId, nextPage)
        : await ProductService.getRecommendations(
          PAGE_SIZE,
          excludeProductId,
          excludeProductIdsKey ? excludeProductIdsKey.split(',') : [],
          nextPage,
        );
      if (response?.status !== 'OK') {
        throw new Error(response?.message || 'Không thể tải thêm sản phẩm.');
      }
      const nextProducts = response.data || [];
      setProducts(current => {
        const knownIds = new Set(current.map(product => product._id));
        return [...current, ...nextProducts.filter(product => !knownIds.has(product._id))];
      });
      setPage(nextPage);
      setHasMore(response.hasMore ?? nextProducts.length === PAGE_SIZE);
    } catch (error) {
      console.error('Lỗi tải thêm sản phẩm đề xuất:', error);
      setLoadError(error.message || 'Không thể tải thêm sản phẩm.');
    } finally {
      setLoadingMore(false);
    }
  };

  if (!isValidType) {
    return (
      <Page>
        <PagePanel>
          <Empty description="Không tìm thấy danh sách sản phẩm." />
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={() => navigate('/')}>Về trang chủ</Button>
          </div>
        </PagePanel>
      </Page>
    );
  }

  return (
    <Page>
      <PagePanel>
        <PageHeader>
          <PageTitle $isDeals={isDeals}>
            {isDeals ? '🔥 TOP DEAL • SIÊU RẺ' : 'ĐỀ XUẤT'}
          </PageTitle>
          <Button onClick={() => navigate('/')}>Về trang chủ</Button>
        </PageHeader>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>
        ) : loadError && !products.length ? (
          <Empty description={loadError} />
        ) : products.length ? (
          <>
            <ProductGrid>
              {products.map(product => (
                <CardComponent key={product._id} product={product} />
              ))}
            </ProductGrid>
            {loadError && (
              <div role="alert" style={{ marginTop: 16, textAlign: 'center', color: '#ff424e' }}>
                {loadError}
              </div>
            )}
            {hasMore && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Button type="primary" loading={loadingMore} onClick={loadMore}>
                  Xem thêm sản phẩm
                </Button>
              </div>
            )}
          </>
        ) : (
          <Empty
            description={isDeals ? 'Hiện chưa có sản phẩm giảm giá.' : 'Chưa có sản phẩm phù hợp để đề xuất.'}
          />
        )}
      </PagePanel>
    </Page>
  );
};

export default RecommendationListPage;
