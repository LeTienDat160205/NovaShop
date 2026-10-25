import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Empty, Input, Rate, Spin, message } from 'antd';
import { StarFilled } from '@ant-design/icons';
import {
  SectionCard,
  CardTitle,
  ReviewOverviewWrapper,
  ReviewScoreBlock,
  BigScore,
  RatingBarContainer,
  RatingBarRow,
  RatingBar,
  FilterChip,
  ReviewCard,
  ReviewAvatar,
} from '../style';
import { token } from '../tokens';
import { getAuthSession } from '../../../utils/authSession';
import { getProductReviews, saveProductReview } from '../../../services/ReviewService';

const FILTERS = [
  { label: 'Mới nhất', rating: null },
  { label: '5 sao', rating: 5 },
  { label: '4 sao', rating: 4 },
  { label: '3 sao', rating: 3 },
  { label: '2 sao', rating: 2 },
  { label: '1 sao', rating: 1 },
];
const renderStars = (count, size = 12) =>
  Array.from({ length: 5 }, (_, index) => (
    <StarFilled
      key={index}
      style={{ fontSize: size, color: index < count ? token.colorStar : '#E0E0E0' }}
    />
  ));

const ReviewSection = ({ productId }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Mới nhất');
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    count: 0,
    average: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const session = getAuthSession();

  useEffect(() => {
    let active = true;
    getProductReviews(productId)
      .then(result => {
        if (!active) return;
        setReviews(result.data?.reviews || []);
        setSummary(result.data?.summary || {
          count: 0,
          average: 0,
          ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      })
      .catch(error => {
        if (active) message.error(error.message || 'Không thể tải đánh giá sản phẩm.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [productId]);

  const submitReview = async () => {
    const currentSession = getAuthSession();
    if (!currentSession.token || currentSession.role !== 'Customer') {
      message.warning('Đăng nhập bằng tài khoản khách hàng để gửi đánh giá.');
      navigate('/sign-in', { state: { from: window.location.pathname } });
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      message.warning('Vui lòng chọn số sao từ 1 đến 5.');
      return;
    }
    if (comment.trim().length > 2000) {
      message.warning('Nội dung đánh giá không được vượt quá 2000 ký tự.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await saveProductReview(
        productId,
        { rating, comment: comment.trim() },
        currentSession.token,
      );
      message.success(result.message || 'Đã lưu đánh giá.');
      setComment('');
      try {
        const refreshed = await getProductReviews(productId);
        setReviews(refreshed.data?.reviews || []);
        setSummary(refreshed.data?.summary || {
          count: 0,
          average: 0,
          ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      } catch (error) {
        message.warning(`Đánh giá đã lưu nhưng không thể làm mới danh sách: ${error.message}`);
      }
    } catch (error) {
      if (error.status === 401) {
        message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        return;
      }
      message.error(error.message || 'Không thể gửi đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalReviews = summary.count;
  const selectedRating = FILTERS.find(filter => filter.label === activeFilter)?.rating;
  const visibleReviews = selectedRating
    ? reviews.filter(review => review.rating === selectedRating)
    : reviews;

  return (
    <SectionCard>
      <CardTitle style={{ fontSize: 18, borderBottom: '1px solid #EBEBF0', paddingBottom: 12 }}>
        Khách hàng đánh giá
      </CardTitle>

      <div style={{ fontSize: 14, fontWeight: 600, color: token.colorTextPrimary, marginBottom: 12 }}>
        Tổng quan
      </div>
      <ReviewOverviewWrapper>
        <ReviewScoreBlock>
          <BigScore>{Number(summary.average) > 0 ? Number(summary.average).toFixed(1) : '—'}</BigScore>
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, margin: '4px 0 2px' }}>
              {renderStars(Math.round(summary.average), 14)}
            </div>
            <div style={{ fontSize: 13, color: token.colorTextSecondary }}>
              ({Number(totalReviews).toLocaleString('vi-VN')} đánh giá)
            </div>
          </div>
        </ReviewScoreBlock>
        <RatingBarContainer>
          {[5, 4, 3, 2, 1].map(star => {
            const count = summary.ratingCounts?.[star] || 0;
            const percentage = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <RatingBarRow key={star}>
                <div style={{ display: 'inline-flex', gap: 1, width: 68, flexShrink: 0 }}>
                  {renderStars(star, 11)}
                </div>
                <RatingBar $pct={percentage}><div /></RatingBar>
                <span style={{ fontSize: 12, color: token.colorTextSecondary, width: 26, textAlign: 'right', flexShrink: 0 }}>
                  {count}
                </span>
              </RatingBarRow>
            );
          })}
        </RatingBarContainer>
      </ReviewOverviewWrapper>
      <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: '#f7f8fa' }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Chia sẻ đánh giá của bạn</div>
        {session.role === 'Customer' && session.token ? (
          <>
            <div style={{ marginBottom: 10 }}>
              <Rate value={rating} onChange={setRating} />
              {rating > 0 && <span style={{ marginLeft: 10, color: token.colorTextSecondary }}>{rating}/5 sao</span>}
            </div>
            <Input.TextArea
              value={comment}
              onChange={event => setComment(event.target.value)}
              placeholder="Sản phẩm này khiến bạn cảm thấy thế nào? (không bắt buộc)"
              maxLength={2000}
              showCount
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
            <Button type="primary" onClick={submitReview} loading={submitting} style={{ marginTop: 10 }}>
              Gửi đánh giá
            </Button>
          </>
        ) : (
          <Alert
            type="info"
            showIcon
            message="Đăng nhập tài khoản khách hàng để đánh giá sản phẩm."
            action={<Button size="small" onClick={() => navigate('/sign-in')}>Đăng nhập</Button>}
          />
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: token.colorTextPrimary, marginBottom: 10 }}>
          Lọc theo
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FILTERS.map(filter => (
            <FilterChip
              key={filter.label}
              $active={activeFilter === filter.label}
              onClick={() => setActiveFilter(filter.label)}
            >
              {filter.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center' }}><Spin /></div>
        ) : visibleReviews.length ? visibleReviews.map(review => (
          <ReviewCard key={review.id}>
            <div style={{ display: 'flex', gap: 12 }}>
              <ReviewAvatar>{(review.name || 'K').charAt(0).toUpperCase()}</ReviewAvatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: token.colorTextPrimary, marginBottom: 4 }}>
                  {review.name || 'Khách hàng'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span>{renderStars(review.rating, 11)}</span>
                  <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
                    {review.date ? new Date(review.date).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: token.colorTextPrimary, lineHeight: 1.6, margin: 0, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {review.content}
                </p>
              </div>
            </div>
          </ReviewCard>
        )) : (
          <Empty description={totalReviews ? 'Không có đánh giá phù hợp.' : 'Sản phẩm chưa có đánh giá.'} />
        )}
      </div>
    </SectionCard>
  );
};

export default ReviewSection;
