import React, { useState } from 'react';
import { StarFilled, CheckCircleFilled } from '@ant-design/icons';
import {
  SectionCard,
  CardTitle,
  ReviewOverviewWrapper,
  ReviewScoreBlock,
  BigScore,
  RatingBarContainer,
  RatingBarRow,
  RatingBar,
  ReviewImageThumb,
  ReviewImageMore,
  FilterChip,
  ReviewCard,
  ReviewAvatar,
} from '../style';
import { token } from '../tokens';
import {
  mockReviews,
  mockRatingDistribution,
} from '../../../data/mockProductDetail';

const FILTERS = ['Mới nhất', 'Có hình ảnh', 'Đã mua hàng', '5 sao', '4 sao', '3 sao', '2 sao', '1 sao'];

const renderStars = (count, size = 12) =>
  Array.from({ length: 5 }, (_, i) => (
    <StarFilled
      key={i}
      style={{ fontSize: size, color: i < count ? token.colorStar : '#E0E0E0' }}
    />
  ));

const ReviewSection = ({ rating = 4.7, reviewCount = 100 }) => {
  const [activeFilter, setActiveFilter] = useState('Mới nhất');

  const totalReviews = mockRatingDistribution.reduce((s, r) => s + r.count, 0);

  const allImages = mockReviews.flatMap((r) => r.images);
  const SHOW_IMAGES = 10;
  const extraCount = Math.max(0, allImages.length - SHOW_IMAGES);
  const visibleImages = allImages.slice(0, SHOW_IMAGES);

  return (
    <SectionCard>
      <CardTitle style={{ fontSize: 18, borderBottom: '1px solid #EBEBF0', paddingBottom: 12 }}>
        Khách hàng đánh giá
      </CardTitle>

      {/* Tiêu đề phụ Tổng quan */}
      <div style={{ fontSize: 14, fontWeight: 600, color: token.colorTextPrimary, marginBottom: 12 }}>
        Tổng quan
      </div>

      {/* Tổng quan đánh giá */}
      <ReviewOverviewWrapper>
        {/* Điểm trung bình */}
        <ReviewScoreBlock>
          <BigScore>{Number(rating).toFixed(1)}</BigScore>
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, margin: '4px 0 2px' }}>
              {renderStars(Math.round(rating), 14)}
            </div>
            <div style={{ fontSize: 13, color: token.colorTextSecondary }}>
              ({reviewCount} đánh giá)
            </div>
          </div>
        </ReviewScoreBlock>

        {/* Thanh phân bố sao bọc trong RatingBarContainer */}
        <RatingBarContainer>
          {mockRatingDistribution.map(({ star, count }) => {
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <RatingBarRow key={star}>
                <div style={{ display: 'inline-flex', gap: 1, width: 68, flexShrink: 0 }}>
                  {renderStars(star, 11)}
                </div>
                <RatingBar $pct={pct}>
                  <div />
                </RatingBar>
                <span style={{ fontSize: 12, color: token.colorTextSecondary, width: 26, textAlign: 'right', flexShrink: 0 }}>
                  {count}
                </span>
              </RatingBarRow>
            );
          })}
        </RatingBarContainer>
      </ReviewOverviewWrapper>

      {/* Tất cả hình ảnh */}
      {allImages.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: token.colorTextPrimary }}>
            Tất cả hình ảnh ({allImages.length + 18})
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {visibleImages.map((src, i) => (
              <ReviewImageThumb key={i} src={src} alt={`Review ảnh ${i + 1}`} />
            ))}
            <ReviewImageMore>+10</ReviewImageMore>
          </div>
        </div>
      )}

      {/* Lọc theo */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: token.colorTextPrimary, marginBottom: 10 }}>
          Lọc theo
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FILTERS.map((f) => (
            <FilterChip
              key={f}
              $active={activeFilter === f}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Danh sách đánh giá */}
      <div style={{ marginTop: 16 }}>
        {mockReviews.map((review) => (
          <ReviewCard key={review.id}>
            <div style={{ display: 'flex', gap: 12 }}>
              <ReviewAvatar>
                {review.name.charAt(0)}
              </ReviewAvatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: token.colorTextPrimary }}>
                    {review.name}
                  </span>
                  {review.tag && (
                    <span style={{
                      fontSize: 12,
                      color: '#00AB56',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <CheckCircleFilled style={{ fontSize: 11 }} />
                      {review.tag}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span>{renderStars(review.rating, 11)}</span>
                  <span style={{ fontSize: 12, color: token.colorTextSecondary }}>{review.date}</span>
                </div>
                <p style={{ fontSize: 14, color: token.colorTextPrimary, lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>
                  {review.content}
                </p>
                {review.images?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {review.images.map((src, i) => (
                      <ReviewImageThumb key={i} src={src} alt={`Ảnh đánh giá ${i + 1}`} style={{ width: 56, height: 56 }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ReviewCard>
        ))}
      </div>
    </SectionCard>
  );
};

export default ReviewSection;
