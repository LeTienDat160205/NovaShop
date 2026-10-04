import React from 'react';
import { StarFilled } from '@ant-design/icons';
import {
  SectionCard,
  BadgeRow,
  BadgeChip,
  ProductName,
  RatingRow,
  RatingNumber,
  OriginText,
  PriceBlock,
  PriceText,
  ListPriceText,
  DiscountBadge,
  LinkText,
} from '../style';
import { token } from '../tokens';

const formatNumber = (amount) =>
  amount ? Number(amount).toLocaleString('vi-VN') : null;

const calcDiscount = (price, listPrice) => {
  if (!listPrice || listPrice <= price) return null;
  return Math.round(((listPrice - price) / listPrice) * 100);
};

const renderStars = (rating, size = '13px') => {
  const full = Math.floor(rating || 0);
  return Array.from({ length: 5 }, (_, i) => (
    <StarFilled
      key={i}
      style={{
        fontSize: size,
        color: i < full ? token.colorStar : '#E0E0E0',
      }}
    />
  ));
};

const ProductInfo = ({ product }) => {
  if (!product) return null;

  const { name, brand, price, listPrice, rating, reviewCount, sold, origin } = product;
  const discountPct = calcDiscount(price, listPrice);
  const priceFormatted = formatNumber(price);
  const listPriceFormatted = formatNumber(listPrice);

  return (
    <SectionCard style={{ marginBottom: 0 }}>
      {/* Badge row với white-space nowrap cho Thương hiệu */}
      <BadgeRow>
        <BadgeChip className="top-deal">TOP DEAL</BadgeChip>
        <BadgeChip className="exchange">30 NGÀY ĐỔI TRẢ</BadgeChip>
        <BadgeChip className="authentic">CHÍNH HÃNG</BadgeChip>
        {brand && (
          <span className="brand-text">
            Thương hiệu:{' '}
            <LinkText href="#" style={{ color: '#0B74E5', fontWeight: 500 }}>
              {brand}
            </LinkText>
          </span>
        )}
      </BadgeRow>

      {/* Tên sản phẩm */}
      {name && <ProductName>{name}</ProductName>}

      {/* Hàng rating (chuẩn Tiki: 4.7 ★★★★★ (100) | Đã bán 23k) */}
      {(rating || reviewCount || sold) && (
        <RatingRow>
          {rating && (
            <>
              <RatingNumber>{Number(rating).toFixed(1)}</RatingNumber>
              <span style={{ display: 'inline-flex', gap: 2 }}>{renderStars(rating)}</span>
            </>
          )}
          {reviewCount && (
            <span style={{ color: token.colorTextSecondary }}>
              ({reviewCount})
            </span>
          )}
          {sold && (
            <span style={{ color: token.colorTextSecondary, marginLeft: 4 }}>
              | Đã bán {sold}
            </span>
          )}
        </RatingRow>
      )}

      {/* Xuất xứ */}
      {origin && <OriginText>Made in {origin}</OriginText>}

      {/* Khối giá */}
      <PriceBlock>
        {priceFormatted && (
          <PriceText>
            {priceFormatted}
            <span className="currency">₫</span>
          </PriceText>
        )}
        {discountPct && listPriceFormatted && (
          <>
            <ListPriceText>{listPriceFormatted} ₫</ListPriceText>
            <DiscountBadge>-{discountPct}%</DiscountBadge>
          </>
        )}
      </PriceBlock>
    </SectionCard>
  );
};

export default ProductInfo;
