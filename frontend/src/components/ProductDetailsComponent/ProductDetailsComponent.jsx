import React, { useEffect } from 'react';
import { Skeleton } from 'antd';
import { Link } from 'react-router-dom';

import {
  PageWrapper,
  ContentWrapper,
  ThreeColumnGrid,
  PurchaseBoxGridItem,
  MobileBuyBar,
  MobilePriceText,
  NotFoundWrapper,
} from './style';
import { token } from './tokens';

import Breadcrumb from './sub-components/Breadcrumb';
import ImageGallery from './sub-components/ImageGallery';
import ProductInfo from './sub-components/ProductInfo';
import ShippingInfo from './sub-components/ShippingInfo';
import SimilarProducts from './sub-components/SimilarProducts';
import WarrantyInfo from './sub-components/WarrantyInfo';
import SpecificationsTable from './sub-components/SpecificationsTable';
import DescriptionSection from './sub-components/DescriptionSection';
import PurchaseBox from './sub-components/PurchaseBox';
import ReviewSection from './sub-components/ReviewSection';
import TopDeals from './sub-components/TopDeals';
import RecentlyViewed from './sub-components/RecentlyViewed';
import ExploreMore from './sub-components/ExploreMore';
import ButtonComponent from '../ButtonComponent/ButtonComponent';

// ─── Trạng thái loading (Skeleton) ───────────────────────────────────────────
const SkeletonLayout = () => (
  <PageWrapper>
    <ContentWrapper>
      <Skeleton.Input active style={{ width: 300, height: 20, marginBottom: 16 }} />
      <ThreeColumnGrid>
        <Skeleton.Image active style={{ width: '100%', height: 320 }} />
        <div>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
        <Skeleton active paragraph={{ rows: 4 }} />
      </ThreeColumnGrid>
    </ContentWrapper>
  </PageWrapper>
);

// ─── Trạng thái không tìm thấy ───────────────────────────────────────────────
const NotFoundLayout = () => (
  <PageWrapper>
    <ContentWrapper>
      <NotFoundWrapper>
        <h2>😕 Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm này không tồn tại hoặc đã bị gỡ khỏi hệ thống.</p>
        <Link to="/">
          <ButtonComponent
            textButton="Quay về trang chủ"
            styleButton={{
              backgroundColor: token.colorPrimary,
              border: 'none',
              borderRadius: token.borderRadiusSm,
              marginTop: 16,
              height: 40,
              padding: '0 24px',
            }}
            styleTextButton={{ color: '#fff', fontWeight: 600 }}
          />
        </Link>
      </NotFoundWrapper>
    </ContentWrapper>
  </PageWrapper>
);

const VIEWED_PRODUCTS_KEY = 'novashop_viewed_products';
const MAX_VIEWED_PRODUCTS = 12;

// ─── Component chính ──────────────────────────────────────────────────────────
const ProductDetailsComponent = ({
  product,
  isLoading = false,
  onAddToCart = () => {},
  onBuyNow = () => {},
}) => {
    // Lưu sản phẩm hiện tại vào lịch sử đã xem
    useEffect(() => {
    if (!product?._id) return;

    try {
      const viewedIds = JSON.parse(
        localStorage.getItem(VIEWED_PRODUCTS_KEY) || '[]'
      );

      const newViewedIds = [
        product._id,
        ...viewedIds.filter(
          (id) => id !== product._id
        ),
      ].slice(0, MAX_VIEWED_PRODUCTS);

      localStorage.setItem(
        VIEWED_PRODUCTS_KEY,
        JSON.stringify(newViewedIds)
      );
    } catch (error) {
      console.error(
        'Lỗi lưu lịch sử sản phẩm:',
        error
      );
    }
  }, [product?._id]);

  // Loading
  if (isLoading) return <SkeletonLayout />;

  // Không tìm thấy
  if (!product) return <NotFoundLayout />;

  const formatVND = (amount) =>
    amount ? `${Number(amount).toLocaleString('vi-VN')} ₫` : '';

  return (
    <PageWrapper>
      <ContentWrapper>
        {/* A. Breadcrumb */}
        <Breadcrumb
          categoryPath={product.categoryPath || []}
          productName={product.name || ''}
        />

        {/* B. Vùng 3 cột */}
        <ThreeColumnGrid>
          {/* Cột trái: Gallery */}
          <div>
            <ImageGallery images={product.images || []} />
          </div>

          {/* Cột giữa: Thông tin sản phẩm */}
          <div>
            <ProductInfo product={product} />

            <div style={{ height: 12 }} />

            <ShippingInfo />

            <SimilarProducts productId={product?._id}/>

            <WarrantyInfo />

            <SpecificationsTable specifications={product.specifications} />

            <DescriptionSection description={product.description} />
          </div>

          {/* Cột phải: Khung mua hàng (ở tablet span 2 cột dưới, ở mobile ẩn) */}
          <PurchaseBoxGridItem>
            <PurchaseBox
              productId={product?._id}
              price={product?.price}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          </PurchaseBoxGridItem>
        </ThreeColumnGrid>

        {/* C. Đánh giá — full width */}
        <div style={{ marginTop: 12 }}>
          <ReviewSection
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </div>

        {/* D. Các khối full-width */}
        <TopDeals currentProductId={product?._id} />
        <RecentlyViewed currentProductId={product?._id}/>
        <ExploreMore currentProductId={product?._id}/>
      </ContentWrapper>

      {/* Mobile: Thanh mua hàng sticky ở đáy */}
      <MobileBuyBar>
        <MobilePriceText>{formatVND(product.price)}</MobilePriceText>
        <ButtonComponent
          onClick={() =>
            onAddToCart({
              productId: product?._id,
              quantity: 1,
              price: product?.price,
            })
          }
          textButton="Thêm vào giỏ"
          styleButton={{
            backgroundColor: '#fff',
            border: `1.5px solid ${token.colorPrimary}`,
            borderRadius: token.borderRadiusSm,
            height: 40,
            flex: 1,
          }}
          styleTextButton={{ color: token.colorPrimary, fontWeight: 600, fontSize: 13 }}
        />
        <ButtonComponent
          onClick={() =>
            onBuyNow({
              productId: product?._id,
              quantity: 1,
              price: product?.price,
            })
          }
          textButton="Mua ngay"
          styleButton={{
            backgroundColor: token.colorDanger,
            border: 'none',
            borderRadius: token.borderRadiusSm,
            height: 40,
            flex: 1,
          }}
          styleTextButton={{ color: '#fff', fontWeight: 700, fontSize: 13 }}
        />
      </MobileBuyBar>
    </PageWrapper>
  );
};

export default ProductDetailsComponent;
